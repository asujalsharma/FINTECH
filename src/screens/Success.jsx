import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Clipboard,
  Alert,
  ToastAndroid,
  Platform,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { postData } from '../API';
import { checkTezGatewayOrder } from '../services/tezGatewayService';

const Success = ({ navigation, route }) => {
  const {
    res,
    operatorDetail,
    rechargeData,
    from,
    amount,
    orderId,
    netPayableAmount,
    commissionDiscount,
    originalAmount,
    paymentMethod,
  } = route.params || {};

  const isTopup = from === 'wallet-topup' || from === 'zaakpay-wallet-topup';
  const planAmount = originalAmount ?? (rechargeData?.rs || rechargeData?.amount || amount || 0);
  const totalPaid = isTopup
    ? amount
    : netPayableAmount !== undefined
    ? netPayableAmount
    : rechargeData?.rs || rechargeData?.amount || amount || 0;
  const discount = Number(commissionDiscount) || 0;

  const displayPaymentMethod =
    paymentMethod ||
    (from === 'zaakpay-wallet-topup'
      ? 'Zaakpay / Online'
      : from === 'wallet-topup'
      ? 'Online / UPI'
      : 'Wallet');

  const webhookCheckedRef = useRef(false);

  const utrNumber = res?.Data?.utr || res?.utr || res?.Data?.data?.utr || '';
  const currentOrderId = orderId || res?.Data?.orderId || res?.Data?.order_id;
  const transactionId =
    res?.Data?.transactionId ||
    currentOrderId ||
    'Not Available';

  const isGooglePlay =
    from === 'googleplay' ||
    operatorDetail?.name === 'Google Play' ||
    operatorDetail?.Operator === 'Google Play Recharge Code' ||
    operatorDetail?.OperatorName === 'Google Play Recharge Code';

  const redeemCode =
    res?.Data?.pin ||
    res?.Data?.recharge_code ||
    res?.Data?.voucher_code ||
    res?.Data?.operator_ref_id ||
    res?.Data?.code ||
    res?.Data?.token ||
    res?.Data?.data?.pin ||
    res?.Data?.data?.recharge_code ||
    res?.Data?.data?.operator_ref_id ||
    res?.pin ||
    res?.recharge_code ||
    res?.voucher_code ||
    res?.operator_ref_id ||
    res?.code ||
    '';

  const copyToClipboard = (text, label = 'Information') => {
    if (!text) return;
    Clipboard.setString(String(text));
    if (Platform.OS === 'android') {
      ToastAndroid.show(`${label} copied!`, ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied', `${label} copied to clipboard!`);
    }
  };

  let status = res?.Data?.status || 'Success';

  if (typeof status === 'string') {
    status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  if (res?.Remarks?.toLowerCase()?.includes('pending')) {
    status = 'Pending';
  }

  console.log(res, operatorDetail, rechargeData, from, amount);

  // ─────────────────────────────────────────────────────────────────
  // 🛡️ Webhook Fallback: agar webhook miss ho gaya toh Success screen
  // pe land hone ke baad status-check call karke wallet credit ensure
  // karo. Ye call idempotent hai — backend double-credit nahi karega.
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const activeOrderId = orderId || res?.Data?.orderId || res?.Data?.order_id;

    if (
      (from === 'zaakpay-wallet-topup' ||
        from === 'wallet-topup' ||
        from === 'tezgateway-wallet-topup') &&
      activeOrderId &&
      !webhookCheckedRef.current
    ) {
      webhookCheckedRef.current = true;

      const ensureWalletCredit = async () => {
        try {
          if (from === 'zaakpay-wallet-topup') {
            console.log('🔄 [Webhook Fallback] Zaakpay status-check starting for orderId:', activeOrderId);
            const checkRes = await postData('api/payment/zaakpay/status-check', {
              orderId: activeOrderId,
            });
            console.log('✅ [Webhook Fallback] Zaakpay status-check result:', checkRes);
          } else {
            // TezGateway / UPI check-order (queries status & credits wallet if newly confirmed SUCCESS)
            console.log('🔄 [Webhook Fallback] TezGateway check-order starting for orderId:', activeOrderId);
            const checkRes = await checkTezGatewayOrder(activeOrderId);
            console.log('✅ [Webhook Fallback] TezGateway check-order result:', checkRes);
          }
        } catch (err) {
          console.warn('⚠️ [Webhook Fallback] status-check failed (silent):', err?.message);
        }
      };

      ensureWalletCredit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- UI VARIANTS ----------
  const STATUS_UI = {
    Pending: {
      title: 'Payment Pending',
      iconLeft: (
        <MaterialIcon name="clock-time-eight" size={28} color="#f4b400" />
      ),
      iconRight: (
        <ActivityIndicator
          size="small"
          color="#f4b400"
          style={{ marginLeft: 4 }}
        />
      ),
      subText: 'Your payment is being processed…',
      cardColor: '#fff7e6',
      mainColor: '#f4b400',
    },
    Failed: {
      title: 'Payment Failed',
      iconLeft: <MaterialIcon name="alert-circle" size={28} color="#e63946" />,
      iconRight: <MaterialIcon name="close-circle" size={28} color="#e63946" />,
      subText: 'Your payment could not be completed.',
      cardColor: '#ffecec',
      mainColor: '#e63946',
    },
    Success: {
      title: 'Payment Successful',
      iconLeft: (
        <MaterialIcon name="lightning-bolt" size={28} color="#092B88" />
      ),
      iconRight: (
        <MaterialIcon name="check-decagram" size={28} color="#28b463" />
      ),
      subText: res?.Data?.date || new Date().toLocaleString(),
      cardColor: '#e8f9f0',
      mainColor: '#28b463',
    },
  };

  const UI = STATUS_UI[status] || STATUS_UI.Success;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#092B88" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Transaction Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: UI.cardColor }]}>
          <View style={styles.statusRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={[styles.statusIconCircle, { backgroundColor: '#FFF' }]}>
                {UI.iconLeft}
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.statusTitle, { color: UI.mainColor }]}>
                  {UI.title}
                </Text>
                <Text style={styles.subText}>{UI.subText}</Text>
              </View>
            </View>
            {UI.iconRight}
          </View>
        </View>

        {/* GOOGLE PLAY REDEEM CODE HERO CARD */}
        {isGooglePlay && (
          <View style={styles.redeemHeroCard}>
            <View style={styles.redeemHeader}>
              <View style={styles.redeemIconBadge}>
                <MaterialIcon name="google-play" size={26} color="#059669" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.redeemTitle}>Google Play Redeem Code</Text>
                <Text style={styles.redeemSubtitle}>
                  16-digit voucher code ready to redeem
                </Text>
              </View>
            </View>

            <View style={styles.codeBox}>
              <Text style={styles.codeText} selectTextOnFocus>
                {redeemCode || 'Code will appear shortly'}
              </Text>
              {redeemCode ? (
                <TouchableOpacity
                  style={styles.codeCopyBtn}
                  activeOpacity={0.8}
                  onPress={() =>
                    copyToClipboard(redeemCode, 'Google Play Redeem Code')
                  }
                >
                  <Icon name="copy-outline" size={18} color="#FFF" />
                  <Text style={styles.codeCopyText}>COPY</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {redeemCode ? (
              <TouchableOpacity
                style={styles.openPlayStoreBtn}
                activeOpacity={0.85}
                onPress={() =>
                  Linking.openURL(`https://play.google.com/redeem?code=${redeemCode}`)
                }
              >
                <MaterialIcon
                  name="open-in-new"
                  size={18}
                  color="#FFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.openPlayStoreText}>
                  REDEEM IN PLAY STORE
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoCard}>
          {/* Paid For / Target */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>
              {isTopup ? 'Service' : 'Paid For'}
            </Text>
            <View style={styles.valueRow}>
              <Text style={styles.value}>
                {isTopup
                  ? 'Wallet Top-up'
                  : rechargeData?.mobile ||
                    rechargeData?.customerID ||
                    rechargeData?.number ||
                    res?.Data?.phoneNumber ||
                    'N/A'}
              </Text>
            </View>
          </View>

          {/* Service / Plan Amount */}
          {!isTopup && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Service / Plan Amount</Text>
              <View style={styles.valueRow}>
                <Text style={styles.value}>
                  ₹{Number(planAmount).toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          {/* Discount Saved */}
          {discount > 0 && (
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: '#059669', fontWeight: '700' }]}>
                Discount Saved
              </Text>
              <View style={styles.valueRow}>
                <Text style={[styles.value, { color: '#059669', fontWeight: '800' }]}>
                  - ₹{discount.toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          {/* Total Paid */}
          <View style={styles.infoRow}>
            <Text style={[styles.label, { fontWeight: '800', color: '#0F172A' }]}>
              Total Paid
            </Text>
            <View style={styles.valueRow}>
              <Text style={[styles.amountText, { color: '#059669', fontWeight: '900' }]}>
                ₹{Number(totalPaid).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Paid via */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Paid via</Text>
            <View style={styles.valueRow}>
              <Text style={[styles.value, { fontWeight: '700', color: '#092B88' }]}>
                {displayPaymentMethod}
              </Text>
            </View>
          </View>

          {/* Transaction ID */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Transaction ID</Text>
            <View style={styles.valueRow}>
              <Text style={styles.value} numberOfLines={1}>
                {transactionId}
              </Text>
              <TouchableOpacity
                style={styles.copyBtn}
                activeOpacity={0.7}
                onPress={() => copyToClipboard(transactionId, 'Transaction ID')}
              >
                <Icon name="copy-outline" size={18} color="#092B88" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Operator Ref ID / Redeem Code / Order ID */}
          <View style={[styles.infoRow, !utrNumber && { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>
              {(from === 'wallet-topup' ||
                from === 'zaakpay-wallet-topup' ||
                from === 'tezgateway-wallet-topup')
                ? 'Order ID'
                : isGooglePlay
                ? 'Redeem Code'
                : 'Operator Ref ID'}
            </Text>
            <View style={styles.valueRow}>
              <Text
                style={[
                  styles.value,
                  isGooglePlay && { fontWeight: '800', color: '#092B88', letterSpacing: 0.5 },
                ]}
                numberOfLines={1}
              >
                {(from === 'wallet-topup' ||
                  from === 'zaakpay-wallet-topup' ||
                  from === 'tezgateway-wallet-topup')
                  ? currentOrderId
                  : redeemCode || res?.Data?.operator_ref_id || '___________'}
              </Text>
              <TouchableOpacity
                style={styles.copyBtn}
                activeOpacity={0.7}
                onPress={() =>
                  copyToClipboard(
                    isGooglePlay
                      ? redeemCode || res?.Data?.operator_ref_id
                      : currentOrderId || res?.Data?.operator_ref_id,
                    isGooglePlay ? 'Redeem Code' : 'ID',
                  )
                }
              >
                <Icon name="copy-outline" size={18} color="#092B88" />
              </TouchableOpacity>
            </View>
          </View>

          {/* UPI Reference (UTR) */}
          {utrNumber ? (
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.label}>UPI Reference (UTR)</Text>
              <View style={styles.valueRow}>
                <Text
                  style={[styles.value, { color: '#059669', fontWeight: '800' }]}
                  numberOfLines={1}
                >
                  {utrNumber}
                </Text>
                <TouchableOpacity
                  style={styles.copyBtn}
                  activeOpacity={0.7}
                  onPress={() => copyToClipboard(utrNumber, 'UTR Number')}
                >
                  <Icon name="copy-outline" size={18} color="#092B88" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>

        {/* Note for Pending/Failed */}
        {status !== 'Success' && (
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              Note: If amount has been deducted but services not received,
              please wait 5–10 minutes or contact support.
            </Text>
          </View>
        )}

        {/* Buttons */}
        <View style={{ marginTop: 24 }}>
          {status === 'Failed' ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#DC2626' }]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Retry Payment</Text>
            </TouchableOpacity>
          ) : status === 'Pending' ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#D97706' }]}
              onPress={() => navigation.navigate('RechargeHistory')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Check History</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#092B88' }]}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Back To Home</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Success;

// ---------------------  Styles  ---------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FF' },

  header: {
    backgroundColor: '#092B88',
    paddingTop: 14,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { color: '#fff', fontSize: 18, fontWeight: '800' },

  statusCard: {
    padding: 18,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#092B88',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: { fontSize: 18, fontWeight: '800' },
  subText: { fontSize: 12, color: '#334155', marginTop: 2, fontWeight: '600' },

  infoCard: {
    backgroundColor: '#FFF',
    marginTop: 16,
    padding: 20,
    borderRadius: 22,
    elevation: 3,
    shadowColor: '#092B88',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: { fontSize: 12, color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },
  amountText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#092B88',
  },
  copyBtn: {
    padding: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },

  noteBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  noteText: { fontSize: 12, color: '#BE123C', textAlign: 'center', lineHeight: 18, fontWeight: '500' },

  actionBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#092B88',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* GOOGLE PLAY REDEEM CODE HERO CARD */
  redeemHeroCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    elevation: 4,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  redeemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  redeemIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  redeemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  redeemSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  codeText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#092B88',
    letterSpacing: 1.5,
    flex: 1,
    marginRight: 10,
  },
  codeCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#092B88',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  codeCopyText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  openPlayStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    height: 46,
    borderRadius: 12,
    elevation: 2,
  },
  openPlayStoreText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
