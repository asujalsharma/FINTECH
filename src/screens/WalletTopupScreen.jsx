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
import { postData } from '../API';

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

  const handleQuickAmount = value => {
    setAmount(value);
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

  return (
    <SafeAreaView style={styles.screenWrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#85daff" />

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
          onPress={handleZaakpayPayment}
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
    backgroundColor: '#85daff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#85daff',
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
    borderColor: '#85daff',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#85daff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '800',
    color: '#85daff',
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
    borderColor: '#85daff',
    borderWidth: 2,
    backgroundColor: 'rgba(133, 218, 255, 0.14)',
  },
  amountChipText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#334155',
  },
  amountChipTextSelected: {
    color: '#0284C7',
    fontWeight: '900',
  },
  addMoneyBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#85daff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    elevation: 3,
    shadowColor: '#85daff',
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
