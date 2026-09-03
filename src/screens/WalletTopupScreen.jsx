import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { postData, getData } from '../API';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';
import COLORS from '../constants/colors';

const WalletTopupScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('100');
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const quickAmounts = ['50', '100', '200', '500', '1000', '2000'];

  const handleQuickAmount = value => {
    setAmount(value);
  };

  useEffect(() => {
    const fetchWallet = async () => {
      setLoading(true);
      try {
        const res = await getData('api/wallet/info');
        if (res?.Status || res?.success) {
          setWallet(res?.Data || res?.data);
        }
      } catch (error) {
        console.error('Wallet fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const generateOrderId = () => {
    return (
      'ORDUPI_' + Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  };

  const handleContinue = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid recharge amount.');
      return;
    }

    setSubmitting(true);
    try {
      const orderId = generateOrderId();

      const body = {
        amount: numericAmount,
        orderId,
        redirectUrl: 'https://rechargehoga.techember.in/payment-receipt',
        note: 'Add money to wallet via UPI',
      };

      const res = await postData('api/payment/upi/create-order', body);
      if (res?.Data?.payment_url) {
        navigation.navigate('PaymentWebview', {
          paymentUrl: res.Data.payment_url,
          orderId,
          amount,
          from: 'wallet-topup',
        });
      } else {
        Alert.alert('Payment Error', 'Payment gateway could not be reached. Please try again.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Payment Error', 'Unable to initiate top up. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const rawBalance = wallet?.balance ?? 0;
  const isLowBalance = rawBalance < 500;
  const formattedBalance = Number(rawBalance).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg || '#0A2568'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerText}>Wallet Top Up</Text>
          <Text style={styles.headerSubtitle}>Fast & 100% Secure UPI Refill</Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* Main Topup Card */}
      <View style={styles.card}>
        <View style={styles.balanceHeaderRow}>
          <Text style={styles.balanceLabel}>Available Wallet Balance</Text>
          <View style={styles.secureBadge}>
            <Icon name="verified-user" size={12} color="#10B981" />
            <Text style={styles.secureBadgeText}>RBI Approved</Text>
          </View>
        </View>

        <Text style={[styles.balanceAmount, isLowBalance && styles.lowBalanceAmount]}>
          ₹ {formattedBalance}
        </Text>

        {isLowBalance && (
          <View style={styles.lowBalanceBadge}>
            <Icon name="info-outline" size={14} color="#D97706" style={{ marginRight: 4 }} />
            <Text style={styles.lowBalanceText}>
              Keep balance above ₹500 for uninterrupted recharges
            </Text>
          </View>
        )}

        <View style={styles.divider} />

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
          {amount ? (
            <TouchableOpacity onPress={() => setAmount('')}>
              <Icon name="cancel" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Quick Amount Chips */}
        <Text style={styles.quickLabel}>Popular Amounts</Text>
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
                <Text style={[styles.quickButtonText, isSelected && styles.quickButtonTextActive]}>
                  + ₹{amt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Security guarantee */}
        <View style={styles.guaranteeRow}>
          <Icon name="lock" size={14} color="#64748B" />
          <Text style={styles.guaranteeText}>
            256-Bit Encrypted • Direct Wallet Credit
          </Text>
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.continueButton, submitting && { opacity: 0.75 }]}
        onPress={handleContinue}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <View style={styles.btnContent}>
            <Text style={styles.continueText}>
              PROCEED TO PAY ₹{amount || '0'}
            </Text>
            <Icon name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
          </View>
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
    backgroundColor: '#F8FAFC',
    paddingBottom: 0,
  },
  header: {
    backgroundColor: COLORS.headerBg || '#0A2568',
    paddingTop: 18,
    paddingBottom: 38,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 5,
    shadowColor: COLORS.headerBg || '#0A2568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: '#D9E7FF',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 24,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  balanceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  secureBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 3,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#091838',
    marginVertical: 4,
    letterSpacing: 0.5,
  },
  lowBalanceAmount: {
    color: '#D97706',
  },
  lowBalanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 8,
  },
  lowBalanceText: {
    color: '#B45309',
    fontWeight: '600',
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  topupLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#091838',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.primary || '#0D52ED',
    borderWidth: 1.8,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary || '#0D52ED',
    marginRight: 8,
  },
  input: {
    fontSize: 22,
    fontWeight: '800',
    color: '#091838',
    flex: 1,
  },
  quickLabel: {
    fontSize: 12,
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
    borderColor: COLORS.primary || '#0D52ED',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
  },
  quickButtonText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  quickButtonTextActive: {
    color: COLORS.primary || '#0D52ED',
    fontWeight: '800',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  guaranteeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 6,
  },
  continueButton: {
    backgroundColor: COLORS.primary || '#0D52ED',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 18,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary || '#0D52ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
