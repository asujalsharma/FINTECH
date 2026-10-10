import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  AppState,
  RefreshControl,
  Clipboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import COLORS from '../constants/colors';
import { postData, getData } from '../API';

// ─── Status Normalizer Helper ──────────────────────────────────────────────────
function normalizeStatus(raw) {
  if (!raw) return 'Pending';
  const s = String(raw).toUpperCase();
  if (s === 'SUCCESS' || s === 'PAID' || s === 'COMPLETED') return 'Success';
  if (s === 'FAILURE' || s === 'FAILED' || s === 'REJECTED') return 'Failed';
  return 'Pending';
}

const Success = ({ navigation, route }) => {
  const {
    res: initialRes,
    operatorDetail,
    rechargeData,
    from,
    amount,
    orderId: routeOrderId,
    isPrePaid,
    category,
  } = route.params || {};

  // Extract effective Order ID
  const effectiveOrderId =
    routeOrderId ||
    initialRes?.Data?.orderId ||
    initialRes?.Data?.order_id ||
    initialRes?.orderId ||
    initialRes?.Data?.ord ||
    '';

  // Determine initial status
  const rawInitialStatus =
    initialRes?.Data?.status ||
    initialRes?.Data?.txnStatus ||
    initialRes?.status ||
    (initialRes?.Status === true ? 'Success' : 'Pending');

  const [currentRes, setCurrentRes] = useState(initialRes || {});
  const [status, setStatus] = useState(normalizeStatus(rawInitialStatus));
  const [isChecking, setIsChecking] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [pollingActive, setPollingActive] = useState(
    normalizeStatus(rawInitialStatus) === 'Pending'
  );

  const checkingRef = useRef(false);
  const appState = useRef(AppState.currentState);
  const MAX_POLL_ATTEMPTS = 20; // 20 attempts x 4s = 80s

  // -------------------------------------------------------------
  // STATUS CHECK API & FULFILLMENT
  // -------------------------------------------------------------
  const checkPaymentStatus = useCallback(
    async (isManual = false) => {
      if (checkingRef.current || !effectiveOrderId) return;
      checkingRef.current = true;
      setIsChecking(true);

      try {
        console.log(`Checking payment status for order: ${effectiveOrderId} (from=${from})`);

        // Case A: Fund Account Registration Fee
        if (from === 'fund-account-reg') {
          const verifyRes = await postData('/api/fund-account/register/verify-payment', {
            orderId: effectiveOrderId,
          });
          console.log('Fund account verify response:', verifyRes);
          if (verifyRes && (!verifyRes.Error || verifyRes.Status)) {
            setStatus('Success');
            setCurrentRes(verifyRes);
            setPollingActive(false);
            if (isManual) {
              Toast.show({
                type: 'success',
                text1: 'भुगतान सफल! 🎉',
                text2: 'पंजीकरण शुल्क ₹2,000 प्राप्त हुआ।',
              });
            }
          }
          return;
        }

        // Case B: Sahayog Donation
        if (from === 'sahayog-donation') {
          const verifyRes = await postData('/api/donation/verify', {
            orderId: effectiveOrderId,
          });
          console.log('Donation verify response:', verifyRes);
          if (verifyRes && (!verifyRes.Error || verifyRes.Status)) {
            setStatus('Success');
            setCurrentRes(verifyRes);
            setPollingActive(false);
            if (isManual) {
              Toast.show({
                type: 'success',
                text1: 'दान सहयोग सफल! 🙏',
                text2: 'आपकी 80G रसीद तैयार है।',
              });
            }
          }
          return;
        }

        // Case C: Wallet Topup & Recharges (Standard UPI Gateway - tenz-status)
        const verifyRes = await postData('api/payment/upi/tenz-status', {
          orderId: effectiveOrderId,
        });
        console.log('Tenz status response:', verifyRes);

        const rawTxnStatus =
          verifyRes?.Data?.txnStatus ||
          verifyRes?.Data?.status ||
          verifyRes?.status;
        const norm = normalizeStatus(rawTxnStatus);

        if (norm === 'Success') {
          // If Wallet Topup
          if (from === 'wallet-topup') {
            setStatus('Success');
            setCurrentRes(verifyRes);
            setPollingActive(false);
            if (isManual) {
              Toast.show({
                type: 'success',
                text1: 'वॉलेट टॉप-अप सफल! 💳',
                text2: `₹${amount} आपके वॉलेट में जुड़ गए।`,
              });
            }
            return;
          }

          // If Recharge / Utility Bill Payment
          // Check if recharge fulfillment is already completed
          const alreadyFulfilled = Boolean(
            currentRes?.Data?.operator_ref_id ||
            currentRes?.Data?.order_id ||
            verifyRes?.Data?.operator_ref_id
          );

          if (alreadyFulfilled) {
            setStatus('Success');
            setCurrentRes(verifyRes);
            setPollingActive(false);
          } else {
            // Trigger Recharge API fulfillment
            console.log('Payment successful, triggering recharge API fulfillment...');
            let rechargeRes;

            if (isPrePaid) {
              rechargeRes = await getData(
                `api/cyrus/recharge_request?number=${operatorDetail?.Mobile}&amount=${rechargeData?.rs}&operator=${operatorDetail?.OpCode}&circle=${operatorDetail?.CircleCode}&isPrepaid=true&operatorName=${operatorDetail?.Operator}&type=upi&ord=${effectiveOrderId}`,
              );
            } else if (from === 'DTH') {
              rechargeRes = await getData(
                `api/cyrus/dth_request?number=${rechargeData?.customerID}&operator=${operatorDetail?.DthOpCode}&amount=${rechargeData?.amount}&operatorName=${operatorDetail?.DthName}&type=upi&ord=${effectiveOrderId}`,
              );
            } else if (from === 'googleplay') {
              rechargeRes = await postData('api/cyrus/bbps/google-play?type=upi', {
                number: rechargeData?.number,
                amount: rechargeData?.amount,
                ord: effectiveOrderId,
              });
            } else {
              rechargeRes = await postData(
                'api/cyrus/bbps/new-bill-payment?type=upi',
                {
                  number: rechargeData?.number,
                  operatorCode: operatorDetail?.op_id,
                  operatorName: operatorDetail?.operator_name,
                  operatorId: operatorDetail?.op_id,
                  amount: rechargeData?.amount,
                  serviceId: operatorDetail?.ServiceId,
                  billDetails: rechargeData,
                  operatorCategory: operatorDetail?.categoryId || category,
                  ord: effectiveOrderId,
                },
              );
            }

            console.log('Recharge fulfillment result:', rechargeRes);
            setCurrentRes(rechargeRes || verifyRes);
            setStatus('Success');
            setPollingActive(false);

            if (isManual) {
              Toast.show({
                type: 'success',
                text1: 'रिचार्ज सफल! 🎉',
                text2: 'ऑपरेटर द्वारा भुगतान स्वीकार कर लिया गया है।',
              });
            }
          }
        } else if (norm === 'Failed') {
          setStatus('Failed');
          setCurrentRes(verifyRes);
          setPollingActive(false);
          if (isManual) {
            Toast.show({
              type: 'error',
              text1: 'भुगतान विफल (Payment Failed)',
              text2: 'बैंक द्वारा लेन-देन अस्वीकार कर दिया गया।',
            });
          }
        } else {
          // Still Pending
          if (isManual) {
            Toast.show({
              type: 'info',
              text1: 'प्रतीक्षा करें (Processing...)',
              text2: 'बैंक/गेटवे से भुगतान की पुष्टि जांची जा रही है।',
            });
          }
        }
      } catch (err) {
        console.log('Status check error in Success.jsx:', err);
        if (isManual) {
          Toast.show({
            type: 'error',
            text1: 'नेटवर्क त्रुटि',
            text2: 'स्थिति जांची नहीं जा सकी। पुनः प्रयास करें।',
          });
        }
      } finally {
        checkingRef.current = false;
        setIsChecking(false);
      }
    },
    [
      effectiveOrderId,
      from,
      amount,
      isPrePaid,
      category,
      operatorDetail,
      rechargeData,
      currentRes,
    ]
  );

  // -------------------------------------------------------------
  // AUTOMATIC POLLING (EVERY 4 SECONDS FOR PENDING)
  // -------------------------------------------------------------
  useEffect(() => {
    if (status !== 'Pending' || !pollingActive || !effectiveOrderId) return;

    console.log(`Starting auto-polling interval for order: ${effectiveOrderId}`);
    const interval = setInterval(() => {
      setPollCount(prev => {
        const next = prev + 1;
        if (next >= MAX_POLL_ATTEMPTS) {
          console.log('Reached maximum polling attempts. Halting auto-polling.');
          setPollingActive(false);
          clearInterval(interval);
          return next;
        }
        checkPaymentStatus(false);
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [status, pollingActive, effectiveOrderId, checkPaymentStatus]);

  // -------------------------------------------------------------
  // APP STATE RESUME: CHECK STATUS ON FOREGROUND RETURN
  // -------------------------------------------------------------
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        status === 'Pending' &&
        effectiveOrderId
      ) {
        console.log('App resumed! Triggering immediate payment status check...');
        checkPaymentStatus(false);
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [status, effectiveOrderId, checkPaymentStatus]);

  // Clipboard copy helper
  const copyToClipboard = text => {
    if (!text || text === '___________' || text === 'Not Available') return;
    Clipboard.setString(String(text));
    Toast.show({
      type: 'success',
      text1: 'कॉपी किया गया (Copied)',
      text2: `${text} क्लिपबोर्ड पर कॉपी हो गया।`,
    });
  };

  // ---------- UI VARIANTS ----------
  const STATUS_UI = {
    Pending: {
      title: 'Payment Pending',
      hindiTitle: 'भुगतान प्रक्रियाधीन है...',
      iconLeft: (
        <MaterialIcon
          name="clock-time-eight"
          size={34}
          color={COLORS.statusPending}
        />
      ),
      iconRight: <ActivityIndicator size="small" color={COLORS.statusPending} />,
      subText: isChecking
        ? 'बैंक से भुगतान स्थिति जांची जा रही है...'
        : `पुष्टि की प्रतीक्षा (प्रयास ${pollCount}/${MAX_POLL_ATTEMPTS})`,
      cardColor: '#FFFBEB',
      mainColor: COLORS.statusPending,
    },
    Failed: {
      title: 'Payment Failed',
      hindiTitle: 'भुगतान विफल हो गया',
      iconLeft: (
        <MaterialIcon name="alert-circle" size={34} color={COLORS.statusFailed} />
      ),
      iconRight: (
        <MaterialIcon name="close-circle" size={34} color={COLORS.statusFailed} />
      ),
      subText: 'आपके खाते से कोई राशि नहीं काटी गई है।',
      cardColor: '#FEF2F2',
      mainColor: COLORS.statusFailed,
    },
    Success: {
      title: 'Payment Successful',
      hindiTitle: 'भुगतान सफलतापूर्वक संपन्न!',
      iconLeft: (
        <MaterialIcon
          name="check-decagram"
          size={34}
          color={COLORS.statusSuccess}
        />
      ),
      iconRight: (
        <MaterialIcon
          name="check-circle"
          size={34}
          color={COLORS.statusSuccess}
        />
      ),
      subText:
        currentRes?.Data?.date ||
        new Date().toLocaleDateString('hi-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      cardColor: '#ECFDF5',
      mainColor: COLORS.statusSuccess,
    },
  };

  const UI = STATUS_UI[status] || STATUS_UI.Success;

  const displayPaidFor =
    from === 'wallet-topup'
      ? 'Wallet Top-up'
      : from === 'fund-account-reg'
      ? 'Vivah Sahayog Registration Fee'
      : from === 'sahayog-donation'
      ? 'Sarvana Sahayog Donation'
      : rechargeData?.mobile ||
        rechargeData?.customerID ||
        rechargeData?.number ||
        currentRes?.Data?.phoneNumber ||
        'Utility Service';

  const displayAmount =
    from === 'wallet-topup' || from === 'fund-account-reg' || from === 'sahayog-donation'
      ? amount || '2000'
      : rechargeData?.rs || rechargeData?.amount || '0';

  const displayTxnId =
    currentRes?.Data?.transactionId ||
    currentRes?.Data?.txnId ||
    currentRes?.Data?.orderId ||
    effectiveOrderId ||
    'Not Available';

  const displayOperatorRef =
    from === 'wallet-topup' || from === 'fund-account-reg'
      ? effectiveOrderId || 'N/A'
      : operatorDetail?.name === 'Google Play'
      ? currentRes?.Data?.operator_ref_id || currentRes?.Data?.redeemCode || '___________'
      : currentRes?.Data?.operator_ref_id || '___________';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* ── Curved Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Payment Status</Text>
          <Text style={styles.headerSubTitle}>SARVANA Digital Receipt</Text>
        </View>
        <TouchableOpacity
          style={styles.headerRightBtn}
          onPress={() => checkPaymentStatus(true)}
          disabled={isChecking}
        >
          {isChecking ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <MaterialIcon name="refresh" size={20} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isChecking}
            onRefresh={() => checkPaymentStatus(true)}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Status Card */}
        <View
          style={[
            styles.statusCard,
            { backgroundColor: UI.cardColor, borderColor: UI.mainColor + '40' },
          ]}
        >
          <View style={styles.statusRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {UI.iconLeft}
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.statusTitle, { color: UI.mainColor }]}>
                  {UI.title}
                </Text>
                <Text style={styles.hindiTitle}>{UI.hindiTitle}</Text>
                <Text style={styles.subText}>{UI.subText}</Text>
              </View>
            </View>
            {UI.iconRight}
          </View>

          {/* Polling progress pill for Pending */}
          {status === 'Pending' && (
            <View style={styles.pollingPill}>
              <ActivityIndicator size="small" color={COLORS.statusPending} style={{ marginRight: 6 }} />
              <Text style={styles.pollingPillText}>
                {pollingActive
                  ? `ऑटो-वेरिफिकेशन सक्रिय • हर 4 सेकंड में जाँच (प्रयास ${pollCount}/${MAX_POLL_ATTEMPTS})`
                  : 'ऑटो-वेरिफिकेशन पूरा हुआ। नीचे "स्थिति पुनः जांचें" दबाएं।'}
              </Text>
            </View>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoCard}>
          {/* Paid For */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Paid For (सेवा)</Text>
            <Text style={styles.value}>{displayPaidFor}</Text>
            <Text style={styles.amountText}>₹{displayAmount}</Text>
          </View>
          <View style={styles.divider} />

          {/* Transaction ID */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Transaction ID (लेन-देन संख्या)</Text>
            <View style={styles.copyRow}>
              <Text style={[styles.value, styles.monoValue]}>{displayTxnId}</Text>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => copyToClipboard(displayTxnId)}
                activeOpacity={0.7}
              >
                <MaterialIcon name="content-copy" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Order ID */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Gateway Order ID</Text>
            <View style={styles.copyRow}>
              <Text style={[styles.value, styles.monoValue]}>
                {effectiveOrderId || '—'}
              </Text>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => copyToClipboard(effectiveOrderId)}
                activeOpacity={0.7}
              >
                <MaterialIcon name="content-copy" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Operator Ref ID / Redeem Code */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>
              {from === 'wallet-topup' || from === 'fund-account-reg'
                ? 'Reference Status'
                : operatorDetail?.name === 'Google Play'
                ? 'Redeem Code (रिडीम कोड)'
                : 'Operator Ref ID (ऑपरेटर संदर्भ)'}
            </Text>
            <View style={styles.copyRow}>
              <Text style={styles.value}>{displayOperatorRef}</Text>
              {displayOperatorRef !== '___________' && (
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => copyToClipboard(displayOperatorRef)}
                  activeOpacity={0.7}
                >
                  <MaterialIcon name="content-copy" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Note Box */}
        {status !== 'Success' && (
          <View style={styles.noteBox}>
            <MaterialIcon
              name="information-outline"
              size={20}
              color={UI.mainColor}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.noteText, { color: UI.mainColor }]}>
              {status === 'Pending'
                ? 'यदि राशि आपके खाते से कट गई है, तो कृपया 2–5 मिनट प्रतीक्षा करें। स्थिति स्वतः अपडेट हो जाएगी।'
                : 'यदि राशि कटी है और सेवा नहीं मिली, तो 24 घंटे के भीतर स्वतः रिफंड कर दिया जाएगा।'}
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={styles.stickyBar}>
        {status === 'Failed' ? (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.statusFailed, flex: 1 }]}
              activeOpacity={0.88}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.actionBtnText}>Retry Payment</Text>
              <MaterialIcon name="refresh" size={22} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.outlineBtn, { flex: 1 }]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.outlineBtnText}>Home</Text>
            </TouchableOpacity>
          </View>
        ) : status === 'Pending' ? (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: COLORS.statusPending, flex: 1.4 },
              ]}
              activeOpacity={0.88}
              onPress={() => checkPaymentStatus(true)}
              disabled={isChecking}
            >
              {isChecking ? (
                <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 6 }} />
              ) : (
                <MaterialIcon name="update" size={20} color="#FFF" />
              )}
              <Text style={styles.actionBtnText}>
                {isChecking ? 'जाँच जारी है...' : 'स्थिति पुनः जांचें (Refresh)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.outlineBtn, { flex: 0.9 }]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.outlineBtnText}>मुख्य पृष्ठ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.actionBtnText}>Back To Home (मुख्य पृष्ठ)</Text>
            <MaterialIcon name="home" size={22} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Success;

// --------------------- Styles ---------------------
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },

  /* Header */
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 14,
    paddingBottom: 36,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubTitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  headerRightBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  statusCard: {
    padding: 18,
    borderRadius: 16,
    marginTop: -22,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 0.2 },
  hindiTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginTop: 2 },
  subText: { fontSize: 12, color: '#64748B', marginTop: 3, fontWeight: '500' },

  pollingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pollingPillText: { fontSize: 11, color: '#B45309', fontWeight: '700', flex: 1 },

  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoRow: { marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  label: { fontSize: 12.5, color: '#94A3B8', fontWeight: '600', marginBottom: 3 },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  monoValue: { fontFamily: 'monospace', fontSize: 13.5 },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyBtn: {
    padding: 6,
    backgroundColor: '#FFF5F8',
    borderRadius: 8,
  },
  amountText: {
    position: 'absolute',
    right: 0,
    top: 0,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },

  noteBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  noteText: { fontSize: 12, fontWeight: '600', flex: 1, lineHeight: 18 },

  stickyBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  btnRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  outlineBtn: {
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  outlineBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
});
