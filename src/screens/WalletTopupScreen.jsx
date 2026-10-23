import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getData } from '../API';
import { createTezGatewayOrder } from '../services/tezGatewayService';
import TezGatewayModal from '../components/TezGatewayModal';

const WalletTopupScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const quickAmounts = [
    '199',
    '499',
    '999',
    '1499',
    '1999',
    '2599',
    '2999',
    '3599',
    '3999',
    '4999',
    '9999',
  ];

  // Group into rows of 3 to guarantee consistent 3-column layout on all devices
  const quickAmountRows = [];
  for (let i = 0; i < quickAmounts.length; i += 3) {
    quickAmountRows.push(quickAmounts.slice(i, i + 3));
  }

  const prefill = route.params?.amount || route.params?.prefillAmount;
  const initialAmount = prefill ? String(prefill) : '9999';
  const [amount, setAmount] = useState(initialAmount);
  const [paying, setPaying] = useState(false);
  const [tezModalVisible, setTezModalVisible] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const handleQuickAmount = value => {
    setAmount(value);
  };

  const handleTezGatewayPayment = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 10) {
      Alert.alert('Invalid Amount', 'Please enter a minimum amount of ₹10');
      return;
    }

    try {
      setPaying(true);

      let mobile = '9876543210';
      try {
        const userRes = await getData('/api/user/profile');
        const userData = userRes?.Data || userRes?.user || userRes;
        mobile =
          userData?.phone || userData?.Mobile || userData?.mobile || mobile;
      } catch (profileErr) {
        console.warn('Could not fetch user profile for mobile, using fallback:', profileErr);
      }

      const orderRes = await createTezGatewayOrder({
        amount: numAmount,
        customer_mobile: mobile,
        remark1: 'Wallet Topup',
        remark2: 'onlineadda',
      });

      console.log('TezGateway Order Response:', orderRes);

      if (orderRes?.orderId) {
        setOrderData(orderRes);
        setTezModalVisible(true);
      } else {
        Alert.alert(
          'Payment Error',
          orderRes?.remarks || 'Unable to initiate TezGateway payment. Try again.',
        );
      }
    } catch (err) {
      console.error('TezGateway Error:', err);
      Alert.alert(
        'Payment Error',
        err?.message ||
          err?.remarks ||
          err?.response?.data?.message ||
          'Failed to initiate TezGateway payment. Please try again.',
      );
    } finally {
      setPaying(false);
    }
  };

  const handlePaymentSuccess = verifiedResult => {
    setTezModalVisible(false);
    navigation.replace('Success', {
      res: verifiedResult?.raw || verifiedResult,
      from: 'wallet-topup',
      amount,
      orderId: verifiedResult?.orderId || orderData?.orderId,
      paymentMethod: 'TezGateway UPI',
    });
  };

  const handlePaymentFailed = failedResult => {
    console.warn('TezGateway payment failed:', failedResult);
  };

  return (
    <SafeAreaView style={styles.screenWrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#5f259f" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add to Wallet</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* UPI LOGO CARD */}
        <View style={styles.upiCard}>
          <Image
            source={require('../Assets/upi_logo.png')}
            style={styles.upiLogoImage}
            resizeMode="contain"
          />
        </View>

        {/* AMOUNT INPUT BOX */}
        <View style={styles.inputBox}>
          <Text style={styles.currencyPrefix}>₹</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* SECTION TITLE */}
        <Text style={styles.sectionTitle}>Select any amount below</Text>

        {/* QUICK AMOUNT GRID (3 COLUMNS) */}
        <View style={styles.amountGrid}>
          {quickAmountRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.amountRow}>
              {row.map(amt => {
                const isSelected = String(amount) === String(amt);
                return (
                  <TouchableOpacity
                    key={amt}
                    activeOpacity={0.8}
                    style={[
                      styles.amountChip,
                      isSelected && styles.amountChipSelected,
                    ]}
                    onPress={() => handleQuickAmount(amt)}
                  >
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={[
                        styles.amountChipText,
                        isSelected && styles.amountChipTextSelected,
                      ]}
                    >
                      ₹ {amt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {/* Invisible placeholder for last row so chips do not stretch */}
              {row.length < 3 &&
                Array.from({ length: 3 - row.length }).map((_, idx) => (
                  <View key={`filler-${idx}`} style={styles.amountChipFiller} />
                ))}
            </View>
          ))}
        </View>

        {/* ADD MONEY BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.addMoneyBtn, paying && { opacity: 0.7 }]}
          onPress={handleTezGatewayPayment}
          disabled={paying}
        >
          {paying ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.addMoneyBtnText}>ADD MONEY</Text>
          )}
        </TouchableOpacity>

        {/* POWERED BY BHIM FOOTER */}
        <View style={styles.poweredByRow}>
          <Text style={styles.poweredByText}>Powered by </Text>
          <Image
            source={require('../Assets/bhim_logo.png')}
            style={styles.bhimLogoImage}
            resizeMode="contain"
          />
        </View>
      </ScrollView>

      {/* TEZGATEWAY UPI MODAL */}
      <TezGatewayModal
        visible={tezModalVisible}
        onClose={() => setTezModalVisible(false)}
        orderData={orderData}
        onSuccess={handlePaymentSuccess}
        onFailed={handlePaymentFailed}
      />
    </SafeAreaView>
  );
};

export default WalletTopupScreen;

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: Platform.OS === 'ios' ? 56 : 60,
    backgroundColor: '#5f259f',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#5f259f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  upiCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  upiLogoImage: {
    width: 200,
    height: 70,
  },
  inputBox: {
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#5f259f',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#5f259f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5f259f',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    paddingVertical: 0,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  amountGrid: {
    marginBottom: 20,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  amountChip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  amountChipFiller: {
    flex: 1,
    height: 44,
    marginHorizontal: 0,
  },
  amountChipSelected: {
    borderColor: '#5f259f',
    borderWidth: 2,
    backgroundColor: '#F5EEFD',
  },
  amountChipText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#334155',
  },
  amountChipTextSelected: {
    color: '#000000ff',
    fontWeight: '900',
  },
  addMoneyBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#5f259f',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    elevation: 3,
    shadowColor: '#5f259f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  addMoneyBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  poweredByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
    marginBottom: 20,
  },
  poweredByText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  bhimLogoImage: {
    width: 85,
    height: 28,
    marginLeft: 2,
  },
});
