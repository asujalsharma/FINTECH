import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { getData, postData } from '../API';
import Balance from './Balance';
import WalletTopupScreen from './WalletTopupScreen';
import Footer from '../components/Footer';

const PaymentConfirmation = ({ route }) => {

  const { rechargeData, operatorDetail, isPrePaid, from, category } =
    route.params;
  const navigation = useNavigation();
  console.log("operator Details",operatorDetail);

  const [Wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('wallet');
  const [mpinModalVisible, setMpinModalVisible] = useState(false);
  const [mpin, setMpin] = useState('');
  const [Cashback, setCashback] = useState();
  const [cashbackModalVisible, setCashbackModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const slideAnim = useState(new Animated.Value(0))[0];

  // ── Zaakpay card fields ──
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [paying, setPaying] = useState(false);

  // ── Zaakpay UPI fields ──
  const [upiPollingVisible, setUpiPollingVisible] = useState(false);
  const pollingIntervalRef = useRef(null);

  // ✅ Fetch wallet info on mount
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await getData('api/wallet/info');
        console.log('Wallet Info:', res);

        if (res?.Status || res?.success) {
          setWallet(res?.Data || res?.data);
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

  useEffect(() => {
    const fetchCashback = async () => {
      try {
        const res = await postData('api/wallet/cashback', {
          opName: isPrePaid
            ? operatorDetail?.Operator
            : from === 'DTH'
            ? operatorDetail?.DthName
            : category,
          amount: rechargeData?.rs || rechargeData?.amount || 0,
          serviceId: operatorDetail?.ServiceId || '',
        });

        console.log('Cashback Info:', res);

        if (res?.Status || res?.success) {
          setCashback(res?.Data || res?.data);

          // 📌 Show popup only if cashback is returned and > 0
          if ((res?.Data?.Cashback || res?.data?.Cashback) > 0) {
            setCashbackModalVisible(true);
          }
        } else {
          console.warn('⚠️ Wallet data not found');
        }
      } catch (error) {
        console.error('❌ Cashback fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCashback();
  }, []);

  const handlePay = async () => {
    console.log('handlePay called');
    // --------------------------
    // 1️⃣ WALLET FLOW (MPIN)
    // --------------------------
    if (method === 'wallet') {
      if (
        Wallet?.balance < rechargeData?.rs ||
        Wallet?.balance < rechargeData?.amount
      ) {
        Alert.alert('Insufficient Balance!');
        navigation.navigate(WalletTopupScreen);
        return;
      }
      setMpinModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      return;
    }

    // --------------------------
    // ZAAKPAY FLOW
    // --------------------------
    if (method === 'zaakpay') {
      const amountToPay = Number(rechargeData?.rs || rechargeData?.amount || 0);
      const purpose = isPrePaid
        ? 'recharge'
        : from === 'DTH'
        ? 'dth'
        : from === 'googleplay'
        ? 'bbps'
        : 'bbps';

      try {
        setLoading(true);
        const body = {
          amount: String(amountToPay),
          purpose,
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
            amount: amountToPay,
            rechargeData,
            operatorDetail,
            from,
            isPrePaid,
            category,
            isZaakpay: true,
          });
        } else {
          Alert.alert('Payment Error', res?.message || 'Unable to initiate payment. Try again.');
        }
      } catch (err) {
        console.error('Zaakpay Payment Error:', err);
        Alert.alert('Error', err?.response?.data?.message || 'Failed to initiate Zaakpay payment.');
      } finally {
        setLoading(false);
      }
      return;
    }
  };



  const handleProceed = async () => {
    if (!mpin.trim()) {
      Alert.alert('Please enter your MPIN');
      return;
    }
    try {
      setLoading(true);
      const res = await postData('api/user/mpin-verify', {
        mPin: mpin,
      });
      console.log(res);
      if (isPrePaid) {
        console.log('prepaid');
        const res = await getData(
          `api/cyrus/recharge_request?number=${operatorDetail?.Mobile}&amount=${rechargeData?.rs}&mPin=${mpin}&operator=${operatorDetail.OpCode}&circle=${operatorDetail.CircleCode}&isPrepaid=${isPrePaid}&operatorName=${operatorDetail.Operator}&type=wallet`,
        );
        console.log(res);
        if (res.Status && res.ResponseStatus === 1)
          navigation.navigate('Success', {
            res,
            operatorDetail,
            rechargeData,
            from,
          });
      } else if (from === 'DTH') {
        console.log('DTH');
        const res = await getData(
          `api/cyrus/dth_request?number=${rechargeData?.customerID}&operator=${operatorDetail.OperatorCode}&amount=${rechargeData.amount}&mPin=${mpin}&operatorName=${operatorDetail.OperatorName}&type=wallet`,
        );
        console.log(res);
        if (res.Status && res.ResponseStatus === 1)
          navigation.navigate('Success', {
            res,
            operatorDetail,
            rechargeData,
            from,
          });
      } else if (from === 'googleplay') {
        console.log('Google Play');
        const res = await postData('api/cyrus/bbps/google-play?type=wallet', {
          number: rechargeData?.number,
          amount: rechargeData.amount,
          mPin: mpin,
        });
        console.log(res);
        if (res.Status && res.ResponseStatus === 1)
          navigation.navigate('Success', {
            res,
            operatorDetail,
            rechargeData,
            from,
          });
      } else {
        console.log('BBPS');
        const res = await postData(
          'api/cyrus/bbps/new-bill-payment?type=wallet',
          {
            number: rechargeData.number,
            operatorCode: operatorDetail.op_id,
            operatorName: operatorDetail.operator_name,
            operatorId: operatorDetail.op_id,
            amount: rechargeData.amount,
            serviceId: operatorDetail.ServiceId,
            mPin: mpin,
            operatorCategory: operatorDetail.categoryId,
            billDetails: rechargeData,
            ad: operatorDetail.ad || '',
          },
        );
        console.log(res);
        if (res.Status && res.ResponseStatus === 1)
          navigation.navigate('Success', {
            res,
            operatorDetail,
            rechargeData,
            from,
          });
      }
    } catch (error) {
      // console.error('❌ MPIN verification error:', error.response);
      const msg = error?.response?.data?.Remarks ||
        error?.response?.data?.Remark ||
        error?.response?.data?.message ||
        'Error occurred';
      setErrorMessage(msg);
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
      setMpinModalVisible(false);
      setMpin('');
    }

    // Alert.alert('✅ Payment Proceeding', `MPIN entered: ${mpin}`);
  };

  {
    /* Cashback Earned Modal */
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0A2E8A" />
        <Text style={{ color: '#0A2E8A', marginTop: 10 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2E8A" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Payment Confirmation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Operator Info Card */}
        <View style={styles.shadowWrapper}>
          <View style={styles.cardRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {from || category || 'Recharge / Bill Pay'}
                </Text>
              </View>
              <Text style={styles.jioTitle}>
                {operatorDetail?.Operator ||
                  operatorDetail?.DthName ||
                  operatorDetail?.operator_name ||
                  operatorDetail?.name ||
                  operatorDetail?.OperatorName ||
                  'Operator'}
              </Text>
              <Text style={styles.jioNumber}>
                Account / Mobile: {operatorDetail?.Mobile ||
                  rechargeData?.customerID ||
                  rechargeData?.number ||
                  'N/A'}
              </Text>
            </View>
            <View style={styles.logoContainer}>
              <Image
                source={{
                  uri:
                    operatorDetail?.Logo ||
                    'https://upload.wikimedia.org/wikipedia/commons/2/2f/Jio_Logo.png',
                }}
                style={styles.jioLogo}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Payment Options */}
        <View style={styles.shadowWrapper}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>

          <TouchableOpacity
            style={[
              styles.optionRow,
              method === 'wallet' && styles.optionRowSelected,
            ]}
            onPress={() => setMethod('wallet')}
            activeOpacity={0.8}
          >
            <View style={styles.optionLeft}>
              <View
                style={[
                  styles.optionIconWrap,
                  method === 'wallet' && styles.optionIconWrapSelected,
                ]}
              >
                <MaterialIcon
                  name="account-balance-wallet"
                  size={22}
                  color={method === 'wallet' ? '#0A2E8A' : '#64748B'}
                />
              </View>
              <View>
                <Text style={styles.optionTitle}>Wallet Balance</Text>
                <Text style={styles.optionSubtitle}>
                  Available: ₹{Wallet?.balance || 0}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radio,
                method === 'wallet' && styles.radioSelected,
              ]}
            >
              {method === 'wallet' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionRow,
              method === 'zaakpay' && styles.optionRowSelected,
            ]}
            onPress={() => setMethod('zaakpay')}
            activeOpacity={0.8}
          >
            <View style={styles.optionLeft}>
              <View
                style={[
                  styles.optionIconWrap,
                  method === 'zaakpay' && styles.optionIconWrapSelected,
                ]}
              >
                <MaterialIcon
                  name="credit-card"
                  size={22}
                  color={method === 'zaakpay' ? '#0A2E8A' : '#64748B'}
                />
              </View>
              <View>
                <Text style={styles.optionTitle}>Pay Online (Zaakpay)</Text>
                <Text style={styles.optionSubtitle}>UPI, Cards, Netbanking</Text>
              </View>
            </View>
            <View
              style={[
                styles.radio,
                method === 'zaakpay' && styles.radioSelected,
              ]}
            >
              {method === 'zaakpay' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Cashback Strip */}
        {Number(Cashback?.Cashback) > 0 && (
          <View style={styles.cashbackBox}>
            <MaterialIcon name="stars" size={20} color="#059669" style={{ marginRight: 8 }} />
            <Text style={styles.cashbackText}>
              Hooray! You'll receive ₹{Cashback?.Cashback} cashback on this transaction!
            </Text>
          </View>
        )}

        {/* Payable Amount Summary */}
        <View style={styles.shadowWrapper}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Recharge Amount</Text>
            <Text style={styles.billVal}>₹{rechargeData?.rs || rechargeData?.amount || 0}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Convenience Fee</Text>
            <Text style={[styles.billVal, { color: '#059669' }]}>FREE</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Total Payable</Text>
            <Text style={styles.payAmount}>
              ₹ {rechargeData?.rs || rechargeData?.amount || 0}
            </Text>
          </View>
        </View>

        <Text style={styles.note}>
          🔒 100% Secure • Transactions cannot be cancelled once processed
        </Text>

        {/* Bottom Button */}
        <TouchableOpacity
          style={[styles.slideBtn, loading && { opacity: 0.7 }]}
          onPress={handlePay}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.slideText}>PROCEED TO PAY</Text>
          <MaterialIcon name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <Footer />
      </ScrollView>

      {/* MPIN Modal */}
      <Modal
        transparent
        visible={mpinModalVisible}
        animationType="none"
        onRequestClose={() => setMpinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [400, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.modalTitle}>Enter your MPIN</Text>
            <Text style={styles.modalSubtitle}>Enter 4-digit security PIN to authorize payment</Text>

            <TextInput
              style={styles.mpinInput}
              placeholder="••••"
              placeholderTextColor="#64748B"
              secureTextEntry
              keyboardType={Platform.OS === 'android' ? 'numeric' : 'number-pad'}
              maxLength={4}
              value={mpin}
              onChangeText={setMpin}
              autoFocus
            />

            <TouchableOpacity
              onPress={() => {
                setMpinModalVisible(false);
                navigation.navigate('ForgetPassword');
              }}
              style={{ alignSelf: 'center', marginBottom: 18 }}
            >
              <Text style={styles.forgotText}>Forgot MPIN?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.proceedBtn}
              onPress={handleProceed}
              activeOpacity={0.85}
            >
              <Text style={styles.proceedText}>Confirm Payment</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={cashbackModalVisible}
        animationType="fade"
        onRequestClose={() => setCashbackModalVisible(false)}
      >
        <View style={styles.cashbackModalOverlay}>
          <View style={styles.cashbackModalBox}>
            <View style={styles.cashbackIconCircle}>
              <MaterialIcon name="card-giftcard" size={36} color="#0A2E8A" />
            </View>
            <Text style={styles.cashbackModalTitle}>🎉 Congratulations!</Text>

            <Text style={styles.cashbackModalAmount}>
              You earned ₹{Cashback?.Cashback} cashback!
            </Text>

            <TouchableOpacity
              style={styles.cashbackOkBtn}
              onPress={() => setCashbackModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.cashbackOkText}>Awesome, Got It!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        transparent
        visible={errorModalVisible}
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.cashbackModalOverlay}>
          <View style={[styles.cashbackModalBox, { paddingVertical: 32 }]}>
            <MaterialIcon name="error-outline" size={50} color="#E11D48" style={{ marginBottom: 16 }} />
            <Text style={[styles.cashbackModalTitle, { color: '#E11D48' }]}>Payment Failed</Text>
            
            <Text style={[styles.cashbackModalAmount, { textAlign: 'center', fontSize: 15, color: '#334155', fontWeight: '500', marginBottom: 24 }]}>
              {errorMessage}
            </Text>

            <TouchableOpacity
              style={[styles.cashbackOkBtn, { backgroundColor: '#E11D48', width: '100%' }]}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.cashbackOkText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* UPI Polling Modal */}
      <Modal
        transparent
        visible={upiPollingVisible}
        animationType="fade"
      >
        <View style={styles.cashbackModalOverlay}>
          <View style={[styles.cashbackModalBox, { paddingVertical: 40 }]}>
            <ActivityIndicator size="large" color="#0A2E8A" style={{ marginBottom: 20 }} />
            <Text style={styles.cashbackModalTitle}>Waiting for Payment</Text>
            <Text style={[styles.cashbackModalAmount, { textAlign: 'center', fontSize: 14, color: '#475569', marginTop: 10 }]}>
              Please complete the payment in your UPI app. Do not press back or close this screen.
            </Text>
            
            <TouchableOpacity
              style={[styles.cashbackOkBtn, { marginTop: 20, backgroundColor: '#F1F5F9' }]}
              onPress={() => {
                setUpiPollingVisible(false);
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
              }}
            >
              <Text style={[styles.cashbackOkText, { color: '#334155' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default PaymentConfirmation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#0A2E8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 5,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  shadowWrapper: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFF',
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  categoryBadgeText: {
    color: '#0A2E8A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  jioTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  jioNumber: { fontSize: 13, color: '#334155', marginTop: 4, fontWeight: '600' },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  jioLogo: { width: '100%', height: '100%' },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  optionRowSelected: {
    borderColor: '#0A2E8A',
    backgroundColor: '#EFF6FF',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionIconWrapSelected: {
    backgroundColor: '#DBEAFE',
  },
  optionTitle: { fontSize: 15, color: '#0F172A', fontWeight: '700' },
  optionSubtitle: { fontSize: 12, color: '#334155', marginTop: 2, fontWeight: '600' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#0A2E8A',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0A2E8A',
  },

  cashbackBox: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  cashbackText: { color: '#065F46', fontSize: 13, fontWeight: '700', flex: 1 },

  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billLabel: { fontSize: 14, color: '#334155', fontWeight: '600' },
  billVal: { fontSize: 14, color: '#0F172A', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payLabel: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  payAmount: { fontSize: 22, fontWeight: '900', color: '#0A2E8A' },
  note: {
    marginTop: 12,
    marginHorizontal: 16,
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '600',
  },

  slideBtn: {
    marginTop: 20,
    backgroundColor: '#0A2E8A',
    borderRadius: 18,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  slideText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  mpinInput: {
    borderWidth: 2,
    borderColor: '#0A2E8A',
    borderRadius: 16,
    padding: 14,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    letterSpacing: 8,
  },
  forgotText: {
    color: '#0A2E8A',
    fontSize: 14,
    fontWeight: '700',
  },
  proceedBtn: {
    backgroundColor: '#0A2E8A',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  proceedText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cashbackModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cashbackModalBox: {
    width: '84%',
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },

  cashbackIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  cashbackModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A2E8A',
    marginBottom: 8,
  },

  cashbackModalAmount: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },

  cashbackOkBtn: {
    backgroundColor: '#0A2E8A',
    height: 48,
    paddingHorizontal: 36,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  cashbackOkText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Zaakpay Card Modal ──
  cardModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  cardModalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    maxHeight: '90%',
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
  cardModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardModalSubtitle: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginTop: 2,
  },
  cardCloseBtn: {
    padding: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  cardFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  cardFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardFieldInput: {
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
    color: '#0A2E8A',
  },
  cardRowFields: {
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
  zaakpayPayBtn: {
    backgroundColor: '#0A2E8A',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 8,
  },
  zaakpayPayBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

