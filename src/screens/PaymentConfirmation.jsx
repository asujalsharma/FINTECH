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
        <ActivityIndicator size="large" color="#36004f" />
        <Text style={{ color: '#36004f', marginTop: 10 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon
          name="arrow-back"
          size={22}
          color="#fff"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerText}>Payment Confirmation</Text>
        <View style={{ width: 22 }} />
      </View>
      {/* Operator Info Card */}
      <View style={styles.shadowWrapper}>
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.jioTitle}>
              {operatorDetail?.Operator ||
                operatorDetail?.DthName ||
                operatorDetail.operator_name ||
                operatorDetail.name ||
                operatorDetail.OperatorName ||
                'Operator'}
            </Text>
            <Text style={styles.jioNumber}>
              Number -{' '}
              {operatorDetail?.Mobile ||
                rechargeData?.customerID ||
                rechargeData.number ||
                'N/A'}
            </Text>
          </View>
          <Image
            source={{
              uri:
                operatorDetail?.Logo ||
                'https://upload.wikimedia.org/wikipedia/commons/2/2f/Jio_Logo.png',
            }}
            style={styles.jioLogo}
          />
        </View>
      </View>
      {/* Payment Options */}
      <View style={styles.shadowWrapper}>
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setMethod('wallet')}
        >
          <Text style={styles.optionText}>
            💳 Wallet Balance ₹{Wallet?.balance || 0}
          </Text>
          <View
            style={[styles.radio, method === 'wallet' && styles.radioSelected]}
          />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setMethod('zaakpay')}
        >
          <Text style={styles.optionText}>💳 Pay Online (Zaakpay)</Text>
          <View
            style={[styles.radio, method === 'zaakpay' && styles.radioSelected]}
          />
        </TouchableOpacity>
      </View>
      {/* Cashback Strip */}
      <View style={styles.cashbackBox}>
        <Text style={styles.cashbackText}>
          🎉 Hurrady! You've unlocked ₹{Cashback?.Cashback} cashback!
        </Text>
      </View>
      {/* Payable Amount */}
      <View style={styles.shadowWrapper}>
        <View style={styles.payRow}>
          <Text style={styles.payLabel}>Payable Amount</Text>
          <Text style={styles.payAmount}>
            ₹ {rechargeData?.rs || rechargeData?.amount || 0}
          </Text>
        </View>
      </View>
      <Text style={styles.note}>
        Read Carefully! Successful transaction will not be refunded.
      </Text>
      {/* Bottom Button */}
      <TouchableOpacity
        style={styles.slideBtn}
        onPress={handlePay}
        disabled={loading}
      >
        <Text style={styles.slideText}>Proceed</Text>
      </TouchableOpacity>

      <Footer />

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
            <TextInput
              style={styles.mpinInput}
              placeholder="Enter 4-digit MPIN"
              placeholderTextColor="#3c3838ff"
              secureTextEntry
              keyboardType="number-pad"
              maxLength={4}
              value={mpin}
              onChangeText={setMpin}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgetPassword')}
            >
              <Text style={styles.forgotText}>Forgot MPIN?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.proceedBtn, { backgroundColor: '#58007b' }]}
              onPress={handleProceed}
            >
              <Text style={styles.proceedText}>Proceed</Text>
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
            <Text style={styles.cashbackModalTitle}>🎉 Congratulations!</Text>

            <Text style={styles.cashbackModalAmount}>
              You earned ₹{Cashback?.Cashback} cashback!
            </Text>

            <TouchableOpacity
              style={styles.cashbackOkBtn}
              onPress={() => setCashbackModalVisible(false)}
            >
              <Text style={styles.cashbackOkText}>OK</Text>
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
            <ActivityIndicator size="large" color="#471d7d" style={{ marginBottom: 20 }} />
            <Text style={styles.cashbackModalTitle}>Waiting for Payment</Text>
            <Text style={[styles.cashbackModalAmount, { textAlign: 'center', fontSize: 14, color: '#64748B', marginTop: 10 }]}>
              Please complete the payment in your UPI app. Do not press back or close this screen.
            </Text>
            
            <TouchableOpacity
              style={[styles.cashbackOkBtn, { marginTop: 20, backgroundColor: '#F1F5F9' }]}
              onPress={() => {
                setUpiPollingVisible(false);
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
              }}
            >
              <Text style={[styles.cashbackOkText, { color: '#64748B' }]}>Cancel</Text>
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
    backgroundColor: '#F2F4F7',
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f4f9',
  },

  // header: {
  //   backgroundColor: '#471d7d',
  //   flexDirection: 'row',
  //   alignItems: 'center',
  header: {
    backgroundColor: '#471d7d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerText: { color: '#FFF', fontSize: 18, fontWeight: '800' },

  shadowWrapper: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFF',
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  jioTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  jioNumber: { fontSize: 13, color: '#64748B', marginTop: 3, fontWeight: '500' },
  jioLogo: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#EDE7F6' },

  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: { fontSize: 15, color: '#0F172A', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  radioSelected: {
    backgroundColor: '#471d7d',
    borderColor: '#471d7d',
  },

  cashbackBox: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#EDE7F6',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(71, 29, 125, 0.15)',
  },
  cashbackText: { color: '#471d7d', fontSize: 14, fontWeight: '700' },

  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payLabel: { fontSize: 15, fontWeight: '600', color: '#334155' },
  payAmount: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  note: {
    marginTop: 8,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },

  slideBtn: {
    marginTop: 'auto',
    backgroundColor: '#58007b',
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#58007b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  slideText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    padding: 24,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
  },
  mpinInput: {
    borderWidth: 1.5,
    borderColor: '#471d7d',
    borderRadius: 14,
    padding: 14,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    letterSpacing: 4,
  },
  forgotText: {
    color: '#471d7d',
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '700',
  },
  proceedBtn: {
    backgroundColor: '#58007b',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#58007b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  proceedText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
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
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },

  cashbackModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#58007b',
    marginBottom: 8,
  },

  cashbackModalAmount: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: 20,
  },

  cashbackOkBtn: {
    backgroundColor: '#58007b',
    height: 46,
    paddingHorizontal: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
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
    color: '#64748B',
    fontWeight: '500',
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
    color: '#64748B',
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
    color: '#471d7d',
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
    marginBottom: 8,
  },
  zaakpayPayBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

