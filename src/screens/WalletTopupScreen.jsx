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
} from 'react-native';
import { postData, getData } from '../API';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';
import Icon from 'react-native-vector-icons/MaterialIcons';

const WalletTopupScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('50');
  const [wallet, setwallet] = useState();

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

  const quickAmounts = ['50', '100', '200', '500', '1000'];

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

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
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
            placeholderTextColor="#94A3B8"
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

        <View style={styles.zaakpayBadge}>
          <Icon name="credit-card" size={16} color="#0A2E8A" />
          <Text style={styles.zaakpayBadgeText}>  Powered by Zaakpay — Secure Card Payment</Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.continueButton}
        onPress={handleZaakpayPayment}
        disabled={paying}
      >
        {paying ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Icon name="payment" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.continueText}>PAY WITH ZAAKPAY</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ marginTop: 'auto', paddingTop: 20 }}>
        <Footer />
      </View>


    </ScrollView>
  );
};

export default WalletTopupScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#07153A',
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#040E2D',
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
    fontWeight: '600',
    color: 'rgba(255,255,255,0.50)',
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
    borderColor: '#4B9EFF',
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
    color: '#4B9EFF',
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
    color: 'rgba(255,255,255,0.50)',
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
    borderColor: '#4B9EFF',
    backgroundColor: 'rgba(75,158,255,0.18)',
  },
  quickButtonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.70)',
    fontWeight: '600',
  },
  quickButtonTextActive: {
    color: '#4B9EFF',
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
    color: '#4B9EFF',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#4B9EFF',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 18,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#4B9EFF',
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

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(4, 14, 45, 0.80)',
  },
  modalSheet: {
    backgroundColor: '#0D2055',
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
    color: '#4B9EFF',
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
    backgroundColor: '#4B9EFF',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 6,
    shadowColor: '#4B9EFF',
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
    backgroundColor: '#0D2055',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.25)',
    shadowColor: '#4B9EFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
  },
  upiModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4B9EFF',
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
});
