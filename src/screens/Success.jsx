import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Button,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { postData } from '../API';

const Success = ({ navigation, route }) => {
  const { res, operatorDetail, rechargeData, from, amount, orderId } =
    route.params || {};

  const webhookCheckedRef = useRef(false);

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
    const zaakpayOrderId = orderId || res?.Data?.orderId || res?.Data?.order_id;

    // Sirf zaakpay wallet-topup ke liye run karo, aur sirf ek baar
    if (
      (from === 'zaakpay-wallet-topup' || from === 'wallet-topup') &&
      zaakpayOrderId &&
      !webhookCheckedRef.current
    ) {
      webhookCheckedRef.current = true;

      const ensureWalletCredit = async () => {
        try {
          console.log('🔄 [Webhook Fallback] Zaakpay status-check starting for orderId:', zaakpayOrderId);
          const checkRes = await postData('api/payment/zaakpay/status-check', {
            orderId: zaakpayOrderId,
          });
          console.log('✅ [Webhook Fallback] status-check result:', checkRes);
          // Backend idempotent hai — agar pehle credit ho gaya toh skip karega,
          // agar nahi hua toh ab credit karega.
        } catch (err) {
          // Silent fail — user ka UX block na ho; support team logs dekh sakti hai
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
        <MaterialIcon name="lightning-bolt" size={28} color="#0A2E8A" />
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
      <StatusBar barStyle="light-content" backgroundColor="#0A2E8A" />

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

        {/* Info Box */}
        <View style={styles.infoCard}>
          {/* Paid For */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Paid For</Text>
            <View style={styles.valueRow}>
              <Text style={styles.value}>
                {(from === 'wallet-topup' || from === 'zaakpay-wallet-topup')
                  ? 'Wallet Top-up'
                  : rechargeData?.mobile ||
                  rechargeData?.customerID ||
                  rechargeData?.number ||
                  res?.Data?.phoneNumber ||
                  'N/A'}
              </Text>
              <Text style={styles.amountText}>
                ₹
                {(from === 'wallet-topup' || from === 'zaakpay-wallet-topup')
                  ? amount
                  : rechargeData?.rs || rechargeData?.amount || '0'}
              </Text>
            </View>
          </View>

          {/* Transaction ID */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Transaction ID</Text>
            <View style={styles.valueRow}>
              <Text style={styles.value} numberOfLines={1}>
                {res?.Data?.transactionId ||
                  res?.Data?.orderId ||
                  res?.Data?.order_id ||
                  'Not Available'}
              </Text>
              <TouchableOpacity style={styles.copyBtn} activeOpacity={0.7}>
                <Icon name="copy-outline" size={18} color="#0A2E8A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Operator Ref ID / Redeem Code */}
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>
              {(from === 'wallet-topup' || from === 'zaakpay-wallet-topup')
                ? 'Order ID'
                : operatorDetail?.name === 'Google Play'
                  ? 'Redeem Code'
                  : 'Operator Ref ID'}
            </Text>
            <View style={styles.valueRow}>
              <Text style={styles.value} numberOfLines={1}>
                {(from === 'wallet-topup' || from === 'zaakpay-wallet-topup')
                  ? orderId || res?.Data?.orderId || res?.Data?.order_id
                  : res?.Data?.operator_ref_id || '___________'}
              </Text>
              <TouchableOpacity style={styles.copyBtn} activeOpacity={0.7}>
                <Icon name="copy-outline" size={18} color="#0A2E8A" />
              </TouchableOpacity>
            </View>
          </View>
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
              style={[styles.actionBtn, { backgroundColor: '#0A2E8A' }]}
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
  container: { flex: 1, backgroundColor: '#F6F8FC' },

  header: {
    backgroundColor: '#0A2E8A',
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
    shadowColor: '#0A2E8A',
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
  subText: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },

  infoCard: {
    backgroundColor: '#FFF',
    marginTop: 16,
    padding: 20,
    borderRadius: 22,
    elevation: 3,
    shadowColor: '#0A2E8A',
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
  label: { fontSize: 12, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
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
    color: '#0A2E8A',
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
    shadowColor: '#0A2E8A',
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
});
