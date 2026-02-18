import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { THEME_COLORS, GRADIENTS } from '../constants/theme';

const ORANGE = THEME_COLORS.orange;

const WalletTopupScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('50');
  const [wallet, setwallet] = useState();
  const [loading, setLoading] = useState(true); // Added loading state

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
        redirectUrl: 'https://recharge99.com/payment-receipt', // Dummy, handled inside WebView
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
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Up Wallet</Text>
        <View style={{width: 24}} />
      </LinearGradient>

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
      <LinearGradient
        colors={GRADIENTS.orangeBtn}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.continueButton}
      >
        <TouchableOpacity
          onPress={handleContinue}
          style={{width: '100%', alignItems: 'center'}}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </LinearGradient>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
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
    borderColor: ORANGE,
  },
  lowBalanceText: {
    color: 'red',
    fontWeight: '500',
  },
  lowbalanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ORANGE,
    marginBottom: 20,
  },
  balanceAmount: {
    font: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  topupLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: ORANGE,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: ORANGE,
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
    borderRadius: 30,
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
    borderColor: ORANGE,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
  },
  quickButtonText: {
    fontSize: 16,
    color: ORANGE,
    fontWeight: '600',
  },
  continueButton: {
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
