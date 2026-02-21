import { THEME_COLORS, GRADIENTS } from '../constants/theme';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Animated,
  Easing,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { getData, postData } from '../API';
import LinearGradient from 'react-native-linear-gradient';

const PaymentConfirmation = ({ route }) => {
  const { rechargeData, operatorDetail, isPrePaid, from, category } =
    route.params;
  const navigation = useNavigation();

  const [Wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('wallet');
  const [mpinModalVisible, setMpinModalVisible] = useState(false);
  const [mpin, setMpin] = useState('');
  const [Cashback, setCashback] = useState();
  const [cashbackModalVisible, setCashbackModalVisible] = useState(false);

  const slideAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchWallet = async () => {
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

        if (res?.Status || res?.success) {
          setCashback(res?.Data || res?.data);
          if ((res?.Data?.Cashback || res?.data?.Cashback) > 0) {
            setCashbackModalVisible(true);
          }
        }
      } catch (error) {
        console.error('Cashback fetch error:', error);
      }
    };
    fetchCashback();
  }, []);

  const handlePay = async () => {
    if (method === 'wallet') {
      if (
        Wallet?.balance < rechargeData?.rs ||
        Wallet?.balance < rechargeData?.amount
      ) {
        Alert.alert('Insufficient Balance!');
        navigation.navigate('WalletTopupScreen');
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

    if (method === 'upi') {
      try {
        setLoading(true);
        const orderId = `PP${Date.now()}`;
        const userNumber =
          operatorDetail?.Mobile ||
          rechargeData?.customerID ||
          rechargeData?.number ||
          rechargeData?.mobile ||
          '';
        const amountToPay = Number(
          rechargeData?.rs || rechargeData?.amount || 0,
        );
        const purpose = isPrePaid
          ? `Prepaid Recharge - ${operatorDetail?.Operator}`
          : from === 'DTH'
            ? `DTH Recharge - ${operatorDetail?.DthName}`
            : from === 'googleplay'
              ? 'Google Play Recharge'
              : from === 'wallet'
                ? 'Wallet Top-up'
                : `Bill Payment - ${operatorDetail?.operator_name || category}`;

        const orderRes = await postData('api/payment/upi/create-order', {
          amount: amountToPay,
          orderId,
          number: userNumber,
          note: purpose,
          redirectUrl: 'https://recharge99.com/payment-success',
        });

        if (!orderRes?.Data?.payment_url) {
          Alert.alert('Payment Error', 'Unable to generate UPI payment link.');
          setLoading(false);
          return;
        }

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
      const res = await postData('api/user/mpin-verify', { mPin: mpin });
      if (isPrePaid) {
        const res = await getData(
          `api/cyrus/recharge_request?number=${operatorDetail?.Mobile}&amount=${rechargeData?.rs}&mPin=${mpin}&operator=${operatorDetail.OpCode}&circle=${operatorDetail.CircleCode}&isPrepaid=${isPrePaid}&operatorName=${operatorDetail.Operator}&type=wallet`,
        );
        if (res.Status && res.ResponseStatus === 1)
          navigation.navigate('Success', { res, operatorDetail, rechargeData, from });
      } else if (from === 'DTH') {
        const res = await getData(
          `api/cyrus/dth_request?number=${rechargeData?.customerID}&operator=${operatorDetail.DthOpCode}&amount=${rechargeData.amount}&mPin=${mpin}&operatorName=${operatorDetail.DthName}&type=wallet`,
        );
        if (res.Status && res.ResponseStatus === 1)
          navigation.navigate('Success', { res, operatorDetail, rechargeData, from });
      } else if (from === 'googleplay') {
        const res = await postData('api/cyrus/bbps/google-play?type=wallet', {
          number: rechargeData?.number,
          amount: rechargeData.amount,
          mPin: mpin,
        });
        if (res.Status && res.ResponseStatus === 1)
          navigation.navigate('Success', { res, operatorDetail, rechargeData, from });
      } else {
        const res = await postData('api/cyrus/bbps/new-bill-payment?type=wallet', {
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
        });
        if (res.Status && res.ResponseStatus === 1)
          navigation.navigate('Success', { res, operatorDetail, rechargeData, from });
      }
    } catch (error) {
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
  };

  const payableAmount = rechargeData?.rs || rechargeData?.amount || 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={THEME_COLORS.primary} />
        <Text style={styles.loaderText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Payment Confirmation</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Operator Card */}
        <View style={styles.operatorCard}>
          <View style={styles.operatorInfo}>
            <View style={styles.operatorIconWrap}>
              <Image
                source={{
                  uri:
                    operatorDetail?.Logo ||
                    'https://upload.wikimedia.org/wikipedia/commons/2/2f/Jio_Logo.png',
                }}
                style={styles.operatorLogo}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.operatorName}>
                {operatorDetail?.Operator ||
                  operatorDetail?.DthName ||
                  operatorDetail?.operator_name ||
                  operatorDetail?.name ||
                  'Operator'}
              </Text>
              <Text style={styles.operatorNumber}>
                {operatorDetail?.Mobile ||
                  rechargeData?.customerID ||
                  rechargeData?.number ||
                  'N/A'}
              </Text>
            </View>
          </View>
          <View style={styles.amountBadge}>
            <Text style={styles.amountBadgeLabel}>Amount</Text>
            <Text style={styles.amountBadgeValue}>₹ {payableAmount}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>
        <View style={styles.methodCard}>
          <TouchableOpacity
            style={[styles.methodRow, method === 'wallet' && styles.methodRowActive]}
            onPress={() => setMethod('wallet')}
          >
            <View style={styles.methodLeft}>
              <View style={[styles.methodIcon, { backgroundColor: '#F0F7FF' }]}>
                <Icon name="credit-card" size={18} color={THEME_COLORS.primary} />
              </View>
              <View>
                <Text style={styles.methodTitle}>Wallet Balance</Text>
                <Text style={styles.methodSubtitle}>₹{Wallet?.balance || 0} available</Text>
              </View>
            </View>
            <View style={[styles.radio, method === 'wallet' && styles.radioSelected]} />
          </TouchableOpacity>

          <View style={styles.methodDivider} />

          <TouchableOpacity
            style={[styles.methodRow, method === 'upi' && styles.methodRowActive]}
            onPress={() => setMethod('upi')}
          >
            <View style={styles.methodLeft}>
              <View style={[styles.methodIcon, { backgroundColor: '#F0FFF4' }]}>
                <MaterialIcon name="account-balance" size={18} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.methodTitle}>UPI Payment</Text>
                <Text style={styles.methodSubtitle}>Pay via any UPI app</Text>
              </View>
            </View>
            <View style={[styles.radio, method === 'upi' && styles.radioSelected]} />
          </TouchableOpacity>
        </View>

        {/* Cashback Strip */}
        {Cashback?.Cashback > 0 && (
          <LinearGradient
            colors={['#16A34A', '#15803D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cashbackStrip}
          >
            <Icon name="gift" size={18} color="#fff" />
            <Text style={styles.cashbackText}>
              🎉 You've unlocked ₹{Cashback?.Cashback} cashback!
            </Text>
          </LinearGradient>
        )}

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payable Amount</Text>
            <Text style={styles.summaryValue}>₹ {payableAmount}</Text>
          </View>
          {Cashback?.Cashback > 0 && (
            <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 }]}>
              <Text style={[styles.summaryLabel, { color: '#16A34A' }]}>Cashback</Text>
              <Text style={[styles.summaryValue, { color: '#16A34A' }]}>- ₹{Cashback?.Cashback}</Text>
            </View>
          )}
        </View>

        <View style={styles.noteWrap}>
          <Icon name="alert-circle" size={14} color="#94A3B8" />
          <Text style={styles.noteText}>
            Successful transactions will not be refunded. Please verify details before proceeding.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handlePay} disabled={loading}>
          <LinearGradient
            colors={GRADIENTS.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.proceedGradient}
          >
            <Icon name="shield" size={18} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.proceedBtnText}>Proceed Securely</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

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
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Enter MPIN</Text>
            <Text style={styles.modalSubtitle}>Enter your 4-digit MPIN to confirm payment</Text>

            <TextInput
              style={styles.mpinInput}
              placeholder="● ● ● ●"
              placeholderTextColor="#CBD5E1"
              secureTextEntry
              keyboardType="number-pad"
              maxLength={4}
              value={mpin}
              onChangeText={setMpin}
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgetPassword')}>
              <Text style={styles.forgotText}>Forgot MPIN?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleProceed}>
              <LinearGradient
                colors={GRADIENTS.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalProceedBtn}
              >
                <Text style={styles.modalProceedText}>Confirm Payment</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setMpinModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
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
            <View style={styles.cashbackIconWrap}>
              <Icon name="gift" size={32} color={THEME_COLORS.primary} />
            </View>
            <Text style={styles.cashbackModalTitle}>Congratulations! 🎉</Text>
            <Text style={styles.cashbackModalAmount}>
              You earned ₹{Cashback?.Cashback} cashback!
            </Text>
            <TouchableOpacity onPress={() => setCashbackModalVisible(false)}>
              <LinearGradient
                colors={GRADIENTS.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cashbackOkBtn}
              >
                <Text style={styles.cashbackOkText}>Continue</Text>
              </LinearGradient>
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
    backgroundColor: '#F5F7FA',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },

  /* ── HEADER ── */
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  /* ── CONTENT ── */
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  /* ── OPERATOR CARD ── */
  operatorCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    elevation: 6,
    shadowColor: '#1756C5',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  operatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  operatorIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  operatorLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  operatorName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: 0.3,
  },
  operatorNumber: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 3,
  },
  amountBadge: {
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1E8FF',
  },
  amountBadgeLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
  },
  amountBadgeValue: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME_COLORS.primary,
  },

  /* ── SECTION LABEL ── */
  sectionLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
  },

  /* ── PAYMENT METHOD ── */
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  methodRowActive: {
    backgroundColor: '#F8FAFF',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  methodSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  methodDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: '#CBD5E1',
  },
  radioSelected: {
    borderColor: THEME_COLORS.primary,
    backgroundColor: THEME_COLORS.primary,
  },

  /* ── CASHBACK ── */
  cashbackStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  cashbackText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ── SUMMARY ── */
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A2E',
  },

  /* ── NOTE ── */
  noteWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 4,
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    lineHeight: 18,
  },

  /* ── BOTTOM BAR ── */
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    paddingTop: 10,
    backgroundColor: '#F5F7FA',
  },
  proceedGradient: {
    flexDirection: 'row',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* ── MPIN MODAL ── */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 28,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modalHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  mpinInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 12,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 14,
  },
  forgotText: {
    color: THEME_COLORS.primary,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 20,
  },
  modalProceedBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalProceedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ── CASHBACK MODAL ── */
  cashbackModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashbackModalBox: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 28,
    alignItems: 'center',
    elevation: 12,
  },
  cashbackIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  cashbackModalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  cashbackModalAmount: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 24,
  },
  cashbackOkBtn: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 16,
  },
  cashbackOkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
