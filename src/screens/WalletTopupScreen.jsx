import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { postData, getData } from '../API';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';

const WalletTopupScreen = () => {

  const navigation = useNavigation();
  const [amount, setAmount] = useState('50');
  const [wallet, setwallet] = useState();

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
    try {
      const orderId = generateOrderId();

      const body = {
        amount: Number(amount),
        orderId,
        redirectUrl: 'https://yaarapay.com/payment-receipt', // Dummy, handled inside WebView
        note: 'Add money to wallet using PG',
      };

      const res = await postData('api/payment/upi/create-order', body);
      console.log('Topup Response:', res);
      if (res?.Data.payment_url) {
        navigation.navigate('PaymentWebview', {
          paymentUrl: res.Data.payment_url,
          orderId,
          amount,
          from: 'wallet-topup',
        });
      } else {
        alert('Payment link not found!');
      }
    } catch (err) {
      console.error(err);
      alert('Unable to initiate payment.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Curved Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Wallet Top Up</Text>
        <Text style={styles.headerSubtitle}>Add funds seamlessly via UPI / Cards</Text>
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
                <Text style={[styles.quickButtonText, isSelected && styles.quickButtonTextActive]}>
                  + ₹{amt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Continue Button */}
      <TouchableOpacity activeOpacity={0.85} style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>PROCEED TO PAY</Text>
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
  },
  continueText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

