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
        redirectUrl: 'https://pinpay.com/payment-receipt', // Dummy, handled inside WebView
        note: 'Add money to wallet using PG',
      };

      const res = await postData('api/payment/upi/create-order', body);
      console.log('Topup Response:', res);
      if (res?.Data.payment_url) {
        navigation.navigate('PaymentWebview', {
          paymentUrl: res.Data.payment_url,
          orderId,
          amount,
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
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Wallet Topup</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {wallet?.balance < 500 && (
          <Text style={styles.lowBalanceText}>Low Balance</Text>
        )}
        <Text
          style={
            wallet?.balance > 500
              ? styles.balanceAmount
              : styles.lowbalanceAmount
          }
        >
          ₹ {wallet?.balance}
        </Text>

        <Text style={styles.topupLabel}>Topup Wallet</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <Text style={styles.note}>
          Note: Wallet amount can be used only for mobile and DTH recharges.
        </Text>
      </View>

      {/* Quick Amount Buttons (Horizontal Scroll) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickAmountScroll}
      >
        {quickAmounts.map(amt => (
          <TouchableOpacity
            key={amt}
            style={styles.quickButton}
            onPress={() => handleQuickAmount(amt)}
          >
            <Text style={styles.quickButtonText}>+ ₹{amt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default WalletTopupScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f6ff',
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#008CFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#008CFF',
  },
  lowBalanceText: {
    color: 'red',
    fontWeight: '500',
  },
  lowbalanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 20,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  topupLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#008CFF',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 15,
  },
  currencySymbol: {
    fontSize: 18,
    marginRight: 5,
  },
  input: {
    fontSize: 18,
    flex: 1,
  },
  note: {
    backgroundColor: '#f1f3f6',
    borderRadius: 20,
    padding: 10,
    fontSize: 12,
    color: '#333',
    marginTop: 10,
  },
  quickAmountScroll: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginVertical: 15,
  },
  quickButton: {
    borderWidth: 1.5,
    height: 40,
    borderColor: '#008CFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
  },
  quickButtonText: {
    fontSize: 16,
    color: '#008CFF',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#008CFF',
    marginHorizontal: 20,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
