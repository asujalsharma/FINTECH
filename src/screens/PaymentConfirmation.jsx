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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getData, postData } from '../API';

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
        });
        console.log('Cashback Info:', res);

        if (res?.Status || res?.success) {
          serCashback(res?.Data || res?.data);
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

  const handlePay = () => {
    console.log('handlePay called', { method, rechargeData, operatorDetail });

    if (method === 'wallet') {
      setMpinModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Alert.alert('COMING SOON........');
    }
  };

  const handleProceed = async () => {
    if (!mpin.trim()) {
      Alert.alert('Please enter your MPIN');
      return;
    }

    const res = await postData('api/user/mpin-verify', {
      mPin: mpin,
    });
    console.log(res);
    if (res.Error === true) {
      Alert.alert(res.Remarks);
    } else if (isPrePaid) {
      console.log('prepaid');
      const res = await getData(
        `api/cyrus/recharge_request?number=${operatorDetail?.Mobile}&amount=${rechargeData?.rs}&mPin=${mpin}&operator=${operatorDetail.OpCode}&circle=${operatorDetail.CircleCode}&isPrepaid=${isPrePaid}`,
      );
      console.log(res);
      if (res.Status && res.ResponseStatus === 1)
        navigation.navigate('Success', { res, operatorDetail, rechargeData });
    } else if (from === 'DTH') {
      console.log('DTH');
      const res = await getData(
        `api/cyrus/dth_request?number=${rechargeData?.customerID}&operator=${operatorDetail.DthOpCode}&amount=${rechargeData.amount}&mPin=${mpin}`,
      );
      console.log(res);
      if (res.Status && res.ResponseStatus === 1)
        navigation.navigate('Success', { res, operatorDetail, rechargeData });
    } else {
      console.log('BBPS');
      const res = await postData('api/cyrus/bbps/new-bill-payment', {
        number: rechargeData.number,
        operatorCode: operatorDetail.op_id,
        operatorName: operatorDetail.operator_name,
        operatorId: operatorDetail.op_id,
        amount: rechargeData.amount,
        serviceId: operatorDetail.ServiceId,
        mPin: mpin,
        operatorCategory: operatorDetail.categoryId,
        billDetails: rechargeData,
      });
      console.log(res);
      if (res.Status && res.ResponseStatus === 1)
        navigation.navigate('Success', { res, operatorDetail, rechargeData });
    }
    setMpinModalVisible(false);
    setMpin('');
    // Alert.alert('✅ Payment Proceeding', `MPIN entered: ${mpin}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0078ff" />
        <Text style={{ color: '#0078ff', marginTop: 10 }}>Loading...</Text>
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
          onPress={() => setMethod('upi')}
        >
          <Text style={styles.optionText}>🇮🇳 UPI</Text>
          <View
            style={[styles.radio, method === 'upi' && styles.radioSelected]}
          />
        </TouchableOpacity>
      </View>

      {/* Cashback Strip */}
      <View style={styles.cashbackBox}>
        <Text style={styles.cashbackText}>
          🎉 Hurrady! You've unlocked ₹7.92 cashback!
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
      <TouchableOpacity style={styles.slideBtn} onPress={handlePay}>
        <Text style={styles.slideText}>➤ Slide To Proceed</Text>
      </TouchableOpacity>

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

            <TouchableOpacity style={styles.proceedBtn} onPress={handleProceed}>
              <Text style={styles.proceedText}>Proceed</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PaymentConfirmation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f9',
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f4f9',
  },

  header: {
    backgroundColor: '#0078ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  headerText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  shadowWrapper: {
    marginTop: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#0078ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    padding: 14,
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    marginHorizontal: 10,
  },
  jioTitle: { fontSize: 15, fontWeight: '700', color: '#000' },
  jioNumber: { fontSize: 13, color: '#777', marginTop: 3 },
  jioLogo: { width: 32, height: 32, borderRadius: 16 },

  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  optionText: { fontSize: 15, color: '#000' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 5 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#aaa',
  },
  radioSelected: {
    backgroundColor: '#0078ff',
    borderColor: '#0078ff',
  },

  cashbackBox: {
    marginTop: 15,
    backgroundColor: '#0078ff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  cashbackText: { color: '#fff', fontSize: 14, fontWeight: '500' },

  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payLabel: { fontSize: 15, fontWeight: '500', color: '#000' },
  payAmount: { fontSize: 16, fontWeight: '700', color: '#000' },
  note: {
    marginTop: 6,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },

  slideBtn: {
    marginTop: 'auto',
    backgroundColor: '#0078ff',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 15,
    marginHorizontal: 20,
  },
  slideText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
  },
  mpinInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  forgotText: {
    color: '#0078ff',
    textAlign: 'center',
    marginBottom: 15,
  },
  proceedBtn: {
    backgroundColor: '#0078ff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  proceedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
