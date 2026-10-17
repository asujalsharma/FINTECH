import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
  StatusBar,
} from 'react-native';
import { useSelector } from 'react-redux';
import { postData, getData } from '../API';
import { useNavigation, useRoute } from '@react-navigation/native';
import Footer from '../components/Footer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createTezGatewayOrder, ALLOWED_TEZGATEWAY_AMOUNTS } from '../services/tezGatewayService';
import TezGatewayModal from '../components/TezGatewayModal';

const WalletTopupScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const reduxUser = useSelector(state => state.user || {});
  const userPhone =
    reduxUser?.Data?.phoneNumber ||
    reduxUser?.phoneNumber ||
    reduxUser?.user?.phoneNumber ||
    reduxUser?.user?.phone ||
    reduxUser?.mobile ||
    '9876543210';

  const prefill = route.params?.amount || route.params?.prefillAmount;
  const initialAmount =
    prefill && ALLOWED_TEZGATEWAY_AMOUNTS.includes(Number(prefill))
      ? String(prefill)
      : '499';
  const [amount, setAmount] = useState(initialAmount);
  const [wallet, setwallet] = useState();
  const [comingSoonModalVisible, setComingSoonModalVisible] = useState(false);

  // TezGateway UPI state
  const [tezModalVisible, setTezModalVisible] = useState(false);
  const [tezOrderData, setTezOrderData] = useState(null);
  const [loadingTez, setLoadingTez] = useState(false);

  // Card modal state
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [paying, setPaying] = useState(false);

  // UPI state
  const [upiPollingVisible, setUpiPollingVisible] = useState(false);
  const [loadingUpi, setLoadingUpi] = useState(false);
  const pollingIntervalRef = useRef(null);

  const quickAmounts = ['499', '999', '1299', '1499', '1799', '1999'];

  const handleQuickAmount = value => {
    setAmount(value);
  };

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await getData('api/wallet/info');
        console.log('Wallet Info:', res);
        if (res?.Status || res?.success) {
          setwallet(res?.Data || res?.data);
        } else {
          console.warn('⚠️ Wallet data not found');
        }
      } catch (error) {
        console.error('❌ Wallet fetch error:', error);
      }
    };
    fetchWallet();
  }, []);

  const handleContinue = () => {
    if (!amount || Number(amount) < 10) {
      Alert.alert('Invalid Amount', 'Please enter a minimum amount of ₹10');
      return;
    }
    setCardModalVisible(true);
  };

  const formatCardNumber = text => {
    const cleaned = text.replace(/\D/g, '').substring(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const handleZaakpayPayment = async () => {
    if (!amount || Number(amount) < 10) {
      Alert.alert('Invalid Amount', 'Please enter a minimum amount of ₹10');
      return;
    }

    try {
      setPaying(true);

      const body = {
        amount: String(amount),
        purpose: 'wallet',
      };

      const res = await postData('api/payment/zaakpay/initiate', body);
      console.log('Zaakpay Initiate Response:', res);

      const orderId = res?.Data?.orderId || res?.orderId;
      const postUrl = res?.Data?.postUrl || res?.postUrl;
      const requestData = res?.Data?.requestData || res?.requestData;

      if (postUrl && requestData) {
        navigation.navigate('PaymentWebview', {
          paymentUrl: postUrl,
          bankPostData: requestData,
          orderId,
          amount,
          from: 'wallet-topup',
          isZaakpay: true,
        });
      } else {
        Alert.alert('Payment Error', res?.message || 'Unable to initiate payment. Try again.');
      }
    } catch (err) {
      console.error('Zaakpay Error:', err);
      Alert.alert('Error', err?.response?.data?.message || 'Failed to initiate Zaakpay payment.');
    } finally {
      setPaying(false);
    }
  };

  const handleTezGatewayPayment = async () => {
    const numAmount = Number(amount);
    if (!ALLOWED_TEZGATEWAY_AMOUNTS.includes(numAmount)) {
      Alert.alert(
        'Invalid TezGateway Amount',
        `TezGateway UPI only accepts the following specific amounts:\n\n₹499, ₹999, ₹1299, ₹1499, ₹1799, ₹1999\n\nPlease tap one of the quick amounts above.`,
      );
      return;
    }

    try {
      setLoadingTez(true);
      const orderRes = await createTezGatewayOrder({
        amount: numAmount,
        customer_mobile: userPhone,
        remark1: 'Wallet Topup',
        remark2: 'onlineadda',
      });

      console.log('TezGateway Order Initiated:', orderRes);
      setTezOrderData(orderRes);
      setTezModalVisible(true);
    } catch (err) {
      console.error('TezGateway Creation Error:', err);
      Alert.alert(
        'Payment Failed',
        err?.Remarks || err?.remarks || err?.message || 'Unable to initiate TezGateway payment. Please try again.',
      );
    } finally {
      setLoadingTez(false);
    }
  };

  const handleTezPaymentSuccess = async verifiedRes => {
    console.log('TezGateway payment success callback:', verifiedRes);
    setTezModalVisible(false);

    // Refresh wallet balance
    try {
      const res = await getData('api/wallet/info');
      if (res?.Status || res?.success) {
        setwallet(res?.Data || res?.data);
      }
    } catch (e) {
      console.log('Wallet refresh error:', e);
    }

    navigation.replace('Success', {
      res: {
        Data: {
          status: 'Success',
          orderId: verifiedRes.orderId,
          utr: verifiedRes.utr,
          amount: verifiedRes.amount || amount,
          date: new Date().toLocaleString(),
        },
        Remarks: 'Payment Successful',
      },
      from: 'wallet-topup',
      amount: verifiedRes.amount || amount,
      orderId: verifiedRes.orderId,
      paymentMethod: 'TezGateway UPI',
    });
  };

  useEffect(() => {
    const timer = pollingIntervalRef.current;
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const resetCardFields = () => {
    setCardNumber('');
    setCardName('');
    setCvv('');
    setExpiryMonth('');
    setExpiryYear('');
  };

  const detectCardType = num => {
    const cleaned = num.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6/.test(cleaned)) return 'rupay';
    return null;
  };

  const cardType = detectCardType(cardNumber);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FF" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Wallet Top Up</Text>
        <Text style={styles.headerSubtitle}>Add funds seamlessly via Card</Text>
      </View>

      {/* Main Topup Card */}
      <View style={styles.card}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text
          style={
            wallet?.balance >= 500
              ? styles.balanceAmount
              : styles.lowbalanceAmount
          }
        >
          ₹ {wallet?.balance !== undefined ? wallet?.balance : '0.00'}
        </Text>
        {wallet?.balance < 500 && (
          <View style={styles.lowBalanceBadge}>
            <Text style={styles.lowBalanceText}>⚠️ Low Wallet Balance</Text>
          </View>
        )}

        <Text style={styles.topupLabel}>Enter Amount to Add</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#8792AC"
            editable={false}
          />
        </View>

        {/* Quick Amount Chips */}
        <Text style={styles.quickLabel}>Quick Add Amounts</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickAmountScroll}
        >
          {quickAmounts.map(amt => {
            const isSelected = amount === amt;
            return (
              <TouchableOpacity
                key={amt}
                activeOpacity={0.8}
                style={[styles.quickButton, isSelected && styles.quickButtonActive]}
                onPress={() => handleQuickAmount(amt)}
              >
                <Text
                  style={[styles.quickButtonText, isSelected && styles.quickButtonTextActive]}
                >
                  + ₹{amt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.tezNoticeBanner}>
          <Icon name="bolt" size={16} color="#059669" />
          <Text style={styles.tezNoticeBannerText}>
            Allowed TezGateway UPI amounts: ₹499, ₹999, ₹1299, ₹1499, ₹1799, ₹1999
          </Text>
        </View>

        <View style={styles.zaakpayBadge}>
          <Icon name="credit-card" size={16} color="#092B88" />
          <Text style={styles.zaakpayBadgeText}>  Powered by Zaakpay — Secure Card Payment</Text>
        </View>
      </View>

      {/* TezGateway UPI Gateway (Primary Instant UPI) */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.continueButton,
          styles.upiPayBtn,
          loadingTez && { opacity: 0.7 },
        ]}
        onPress={handleTezGatewayPayment}
        disabled={loadingTez}
      >
        {loadingTez ? (
          <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
        ) : (
          <Icon name="bolt" size={22} color="#FFF" style={{ marginRight: 8 }} />
        )}
        <Text style={styles.continueText}>
          {loadingTez ? 'INITIALIZING UPI...' : 'PAY WITH UPI (INSTANT)'}
        </Text>
        <View style={styles.upiInstantBadge}>
          <Text style={styles.upiInstantBadgeText}>GPAY • PHONEPE • PAYTM</Text>
        </View>
      </TouchableOpacity>

      {/* Zaakpay Gateway */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.continueButton, styles.zaakpaySecondaryBtn]}
        onPress={() => setComingSoonModalVisible(true)}
      >
        <Icon name="credit-card" size={20} color="#1741B5" style={{ marginRight: 8 }} />
        <Text style={styles.zaakpaySecondaryText}>PAY WITH CARD / NETBANKING</Text>
        <View style={styles.comingSoonPill}>
          <Text style={styles.comingSoonPillText}>COMING SOON</Text>
        </View>
      </TouchableOpacity>

      {/* TezGateway Checkout Modal */}
      <TezGatewayModal
        visible={tezModalVisible}
        onClose={() => setTezModalVisible(false)}
        orderData={tezOrderData}
        onSuccess={handleTezPaymentSuccess}
        onFailed={failedRes => {
          console.log('TezGateway payment failed:', failedRes);
        }}
      />

      {/* Gateway Coming Soon Modal */}
      <Modal
        transparent
        visible={comingSoonModalVisible}
        animationType="fade"
        onRequestClose={() => setComingSoonModalVisible(false)}
      >
        <View style={styles.comingSoonModalOverlay}>
          <View style={styles.comingSoonModalBox}>
            <View style={styles.comingSoonIconCircle}>
              <Icon name="schedule" size={36} color="#D97706" />
            </View>
            <View style={styles.comingSoonModalBadge}>
              <Text style={styles.comingSoonModalBadgeText}>COMING SOON</Text>
            </View>
            <Text style={styles.comingSoonModalTitle}>Gateway Under Maintenance</Text>
            <Text style={styles.comingSoonModalDesc}>
              Online Card Payment services for wallet top-up are currently under upgrade for a smoother and faster experience.
            </Text>
            <View style={styles.comingSoonInfoCard}>
              <Icon name="info-outline" size={20} color="#092B88" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={styles.comingSoonInfoCardText}>
                Please use TezGateway UPI for instant top-up. Adding money via Card will be live shortly. Thank you!
              </Text>
            </View>
            <TouchableOpacity
              style={styles.comingSoonModalBtn}
              onPress={() => setComingSoonModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.comingSoonModalBtnText}>Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ marginTop: 'auto', paddingTop: 20 }}>
        <Footer />
      </View>


    </ScrollView>
  );
};

export default WalletTopupScreen;

const baseStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#092B88',
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#092B88',
    paddingTop: 24,
    paddingBottom: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.50)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.80)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  lowbalanceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#EF4444',
    marginVertical: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  lowBalanceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.30)',
  },
  lowBalanceText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 12,
  },
  topupLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#2454D1',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 58,
    backgroundColor: 'rgba(75,158,255,0.08)',
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2454D1',
    marginRight: 8,
  },
  input: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.80)',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  quickAmountScroll: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  quickButton: {
    borderWidth: 1,
    height: 42,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 21,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  quickButtonActive: {
    borderColor: '#2454D1',
    backgroundColor: 'rgba(75,158,255,0.18)',
  },
  quickButtonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  quickButtonTextActive: {
    color: '#2454D1',
    fontWeight: '800',
  },
  zaakpayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(75,158,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.25)',
  },
  zaakpayBadgeText: {
    fontSize: 12,
    color: '#2454D1',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#2454D1',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 18,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#2454D1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    flexDirection: 'row',
  },
  continueText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  upiComingSoonBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    elevation: 0,
    shadowOpacity: 0,
  },
  upiComingSoonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  comingSoonPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  comingSoonPillText: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(4, 14, 45, 0.80)',
  },
  modalSheet: {
    backgroundColor: '#123DB8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.50)',
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.50)',
    marginBottom: 6,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: 'rgba(75,158,255,0.35)',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 14,
  },
  cardTypeBadge: {
    marginLeft: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#2454D1',
  },
  rowFields: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 4,
  },
  secureText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
  },
  payBtn: {
    backgroundColor: '#2454D1',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 6,
    shadowColor: '#2454D1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.50,
    shadowRadius: 12,
  },
  payBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── UPI Modal ──
  upiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 14, 45, 0.80)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upiModalBox: {
    width: '84%',
    backgroundColor: '#123DB8',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.25)',
    shadowColor: '#2454D1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
  },
  upiModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2454D1',
    marginBottom: 8,
  },
  upiModalSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 10,
  },
  upiCancelBtn: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.10)',
    height: 46,
    paddingHorizontal: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  upiCancelText: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Gateway Coming Soon Modal ──
  comingSoonModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonModalBox: {
    width: '86%',
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#092B88',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  comingSoonIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  comingSoonModalBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  comingSoonModalBadgeText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  comingSoonModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonModalDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  comingSoonInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  comingSoonInfoCardText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    lineHeight: 18,
  },
  comingSoonModalBtn: {
    backgroundColor: '#1741B5',
    height: 48,
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#1741B5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  comingSoonModalBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

const styles = {
  ...baseStyles,
  ...StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#F4F7FF', paddingBottom: 40 },
    header: { backgroundColor: '#F4F7FF', paddingTop: 24, paddingBottom: 18, paddingHorizontal: 20, alignItems: 'flex-start' },
    headerText: { color: '#18264D', fontSize: 21, fontWeight: '800', letterSpacing: -0.2 },
    headerSubtitle: { color: '#7582A0', fontSize: 12, marginTop: 5, fontWeight: '500' },
    card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 8, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: '#E5EAF7' },
    balanceLabel: { fontSize: 11, fontWeight: '700', color: '#7582A0', letterSpacing: 0.8, textTransform: 'uppercase' },
    balanceAmount: { fontSize: 30, fontWeight: '800', color: '#18264D', marginVertical: 4 },
    topupLabel: { fontSize: 14, fontWeight: '700', color: '#24345E', marginTop: 12, marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderColor: '#DCE5FF', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, height: 56, backgroundColor: '#F8FAFF', marginBottom: 16 },
    currencySymbol: { fontSize: 22, fontWeight: '800', color: '#1741B5', marginRight: 8 },
    input: { fontSize: 22, fontWeight: '700', color: '#18264D', flex: 1 },
    quickLabel: { fontSize: 11, fontWeight: '700', color: '#7582A0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
    quickButton: { borderWidth: 1, height: 40, borderColor: '#E2E9F8', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', marginRight: 9 },
    quickButtonActive: { borderColor: '#1741B5', backgroundColor: '#EEF2FF' },
    quickButtonText: { fontSize: 13, color: '#536487', fontWeight: '600' },
    quickButtonTextActive: { color: '#1741B5', fontWeight: '800' },
    zaakpayBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F7FF', borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9, marginTop: 10, borderWidth: 1, borderColor: '#E5EAF7' },
    zaakpayBadgeText: { fontSize: 11, color: '#536487', fontWeight: '600' },
    tezNoticeBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#ECFDF5',
      borderRadius: 12,
      paddingHorizontal: 11,
      paddingVertical: 9,
      marginTop: 16,
      borderWidth: 1,
      borderColor: '#A7F3D0',
    },
    tezNoticeBannerText: {
      fontSize: 11,
      color: '#059669',
      fontWeight: '700',
      marginLeft: 6,
      flex: 1,
    },
    continueButton: { backgroundColor: '#1741B5', marginHorizontal: 16, marginTop: 20, borderRadius: 15, height: 54, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#1741B5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 9, flexDirection: 'row' },
    upiPayBtn: {
      backgroundColor: '#059669',
      shadowColor: '#059669',
      marginTop: 20,
    },
    upiInstantBadge: {
      backgroundColor: '#ECFDF5',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginLeft: 10,
      borderWidth: 1,
      borderColor: '#A7F3D0',
    },
    upiInstantBadgeText: {
      color: '#059669',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    zaakpaySecondaryBtn: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1.5,
      borderColor: '#DCE5FF',
      marginTop: 12,
      elevation: 1,
      shadowOpacity: 0.05,
    },
    zaakpaySecondaryText: {
      color: '#1741B5',
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
  }),
};
