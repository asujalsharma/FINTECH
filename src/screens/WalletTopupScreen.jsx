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
          <Icon name="credit-card" size={16} color="#471d7d" />
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
    backgroundColor: '#F2F4F7',
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#471d7d',
    paddingTop: 24,
    paddingBottom: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: '#D9E7FF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 22,
    padding: 22,
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  lowbalanceAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#DC2626',
    marginVertical: 4,
  },
  balanceAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 4,
  },
  lowBalanceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  lowBalanceText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12,
  },
  topupLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#471d7d',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '800',
    color: '#471d7d',
    marginRight: 8,
  },
  input: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
  },
  quickAmountScroll: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  quickButton: {
    borderWidth: 1.2,
    height: 40,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  quickButtonActive: {
    borderColor: '#471d7d',
    backgroundColor: '#EDE7F6',
  },
  quickButtonText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  quickButtonTextActive: {
    color: '#471d7d',
    fontWeight: '800',
  },
  zaakpayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE7F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
  },
  zaakpayBadgeText: {
    fontSize: 12,
    color: '#471d7d',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#58007b',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#58007b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    flexDirection: 'row',
  },
  continueText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 12,
    elevation: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
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
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 14,
  },
  cardTypeBadge: {
    marginLeft: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#471d7d',
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
    backgroundColor: '#471d7d',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upiModalBox: {
    width: '84%',
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  upiModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#58007b',
    marginBottom: 8,
  },
  upiModalSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#64748B',
    marginTop: 10,
  },
  upiCancelBtn: {
    marginTop: 20,
    backgroundColor: '#F1F5F9',
    height: 46,
    paddingHorizontal: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upiCancelText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '700',
  },
});
