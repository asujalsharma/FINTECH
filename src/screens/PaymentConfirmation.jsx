import React, { useState, useEffect } from 'react';
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
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getData, postData } from '../API';
import Balance from './Balance';
import WalletTopupScreen from './WalletTopupScreen';
import Footer from '../components/Footer';
import COLORS from '../constants/colors';

const PaymentConfirmation = ({ route }) => {

  const { rechargeData, operatorDetail, isPrePaid, from, category } =
    route.params;
  const navigation = useNavigation();
  console.log(operatorDetail);

  const [Wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('wallet');
  const [mpinModalVisible, setMpinModalVisible] = useState(false);
  const [mpin, setMpin] = useState('');
  const [Cashback, setCashback] = useState();
  const [cashbackModalVisible, setCashbackModalVisible] = useState(false);
  const [upiModalVisible, setUpiModalVisible] = useState(false);

  const slideAnim = useState(new Animated.Value(0))[0];

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
    // 2️⃣ UPI FLOW (GATEWAY)
    // --------------------------
    if (method === 'upi') {
      try {
        setLoading(true);

        // 🔹 Generate unique Order ID
        const orderId = `PP${Date.now()}`;

        // 🔹 Identify user number
        const userNumber =
          operatorDetail?.Mobile ||
          rechargeData?.customerID ||
          rechargeData?.number ||
          rechargeData?.mobile ||
          '';

        // 🔹 Find the amount
        const amountToPay = Number(
          rechargeData?.rs || rechargeData?.amount || 0,
        );

        // 🔹 Determine purpose / notes
        const purpose = isPrePaid
          ? `Prepaid Recharge - ${operatorDetail?.Operator}`
          : from === 'DTH'
          ? `DTH Recharge - ${operatorDetail?.DthName}`
          : from === 'googleplay'
          ? 'Google Play Recharge'
          : from === 'wallet'
          ? 'Wallet Top-up'
          : `Bill Payment - ${operatorDetail?.operator_name || category}`;

        // --------------------------
        // 3️⃣ CREATE PAYMENT ORDER (Backend)
        // --------------------------

        const orderPayload = {
          amount: amountToPay,
          orderId,
          number: userNumber,
          note: purpose,
          redirectUrl: 'https://YaaraPay.com/payment-success', // dummy, WebView handles redirects
        };

        const orderRes = await postData(
          'api/payment/upi/create-order',
          orderPayload,
        );

        console.log('UPI ORDER RESPONSE:', orderRes);

        if (!orderRes?.Data?.payment_url) {
          Alert.alert(
            'Payment Error',
            'Unable to generate UPI payment link. Try again.',
          );
          setLoading(false);
          return;
        }

        // --------------------------
        // 4️⃣ OPEN WEBVIEW FOR PAYMENT
        // --------------------------

        navigation.navigate('PaymentWebview', {
          paymentUrl: orderRes.Data.payment_url,
          orderId,
          amount: amountToPay,
          rechargeData,
          operatorDetail,
          from,
          isPrePaid,
          category,
        });
      } catch (err) {
        console.error('UPI PAYMENT ERROR:', err);
        Alert.alert('Error', 'Failed to initiate UPI payment.');
      } finally {
        setLoading(false);
      }
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
          `api/cyrus/dth_request?number=${rechargeData?.customerID}&operator=${operatorDetail.DthOpCode}&amount=${rechargeData.amount}&mPin=${mpin}&operatorName=${operatorDetail.DthName}&type=wallet`,
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
      Alert.alert(
        error?.response?.data?.Remark ||
          error?.response?.data?.message ||
          'Error occurred',
      );
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg || '#0A2568'} />
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
          activeOpacity={0.8}
          onPress={() => setUpiModalVisible(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.optionText}>🇮🇳 Direct UPI</Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonBadgeText}>COMING SOON</Text>
            </View>
          </View>
          <View
            style={[styles.radio, method === 'upi' && styles.radioSelected]}
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
              style={styles.proceedBtn}
              onPress={handleProceed}
            >
              <Text style={styles.proceedText}>Proceed</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Cashback Modal */}
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

      {/* UPI Coming Soon Modal */}
      <Modal
        transparent
        visible={upiModalVisible}
        animationType="fade"
        onRequestClose={() => setUpiModalVisible(false)}
      >
        <View style={styles.comingSoonOverlay}>
          <View style={styles.comingSoonBox}>
            <View style={styles.comingSoonIconCircle}>
              <Icon name="rocket" size={38} color={COLORS.primary || '#0D52ED'} />
            </View>

            <Text style={styles.comingSoonTitle}>Coming Soon! 🚀</Text>

            <Text style={styles.comingSoonDesc}>
              Direct UPI payment is currently under maintenance and will be available soon. Please use your Wallet Balance for instant recharges!
            </Text>

            <TouchableOpacity
              style={styles.comingSoonTopupBtn}
              activeOpacity={0.85}
              onPress={() => {
                setUpiModalVisible(false);
                navigation.navigate('WalletTopupScreen');
              }}
            >
              <Icon name="wallet" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.comingSoonTopupText}>Add Money to Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.comingSoonCloseBtn}
              activeOpacity={0.75}
              onPress={() => setUpiModalVisible(false)}
            >
              <Text style={styles.comingSoonCloseText}>Okay, Got It</Text>
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
    backgroundColor: COLORS.headerBg || '#0A2568',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: COLORS.headerBg || '#0A2568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  headerText: { color: '#FFF', fontSize: 18, fontWeight: '800' },

  shadowWrapper: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  jioTitle: { fontSize: 16, fontWeight: '800', color: '#091838' },
  jioNumber: { fontSize: 13, color: '#64748B', marginTop: 3, fontWeight: '500' },
  jioLogo: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#EFF6FF', backgroundColor: '#F8FAFC' },

  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: { fontSize: 15, color: '#091838', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  radioSelected: {
    backgroundColor: COLORS.primary || '#0D52ED',
    borderColor: COLORS.primary || '#0D52ED',
  },

  cashbackBox: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  cashbackText: { color: '#059669', fontSize: 14, fontWeight: '800' },

  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payLabel: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  payAmount: { fontSize: 20, fontWeight: '900', color: '#091838' },
  note: {
    marginTop: 8,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },

  slideBtn: {
    marginTop: 'auto',
    backgroundColor: COLORS.primary || '#0D52ED',
    borderRadius: 18,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: COLORS.primary || '#0D52ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  slideText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(10, 37, 104, 0.65)',
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
    color: '#091838',
    textAlign: 'center',
    marginBottom: 16,
  },
  mpinInput: {
    borderWidth: 1.8,
    borderColor: COLORS.primary || '#0D52ED',
    borderRadius: 14,
    padding: 14,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
    color: '#091838',
    backgroundColor: '#F8FAFC',
    letterSpacing: 6,
  },
  forgotText: {
    color: COLORS.primary || '#0D52ED',
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '700',
  },
  proceedBtn: {
    backgroundColor: COLORS.primary || '#0D52ED',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary || '#0D52ED',
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
    backgroundColor: 'rgba(10, 37, 104, 0.65)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  cashbackModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 8,
  },

  cashbackModalAmount: {
    fontSize: 18,
    color: '#091838',
    fontWeight: '800',
    marginBottom: 20,
  },

  cashbackOkBtn: {
    backgroundColor: COLORS.primary || '#0D52ED',
    height: 48,
    paddingHorizontal: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  cashbackOkText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },

  /* COMING SOON BADGE & MODAL */
  comingSoonBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  comingSoonBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.3,
  },
  comingSoonOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 37, 104, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  comingSoonBox: {
    width: '100%',
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  comingSoonIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#091838',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonDesc: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: '500',
  },
  comingSoonTopupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary || '#0D52ED',
    width: '100%',
    height: 50,
    borderRadius: 16,
    elevation: 3,
    shadowColor: COLORS.primary || '#0D52ED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    marginBottom: 10,
  },
  comingSoonTopupText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  comingSoonCloseBtn: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  comingSoonCloseText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
});

