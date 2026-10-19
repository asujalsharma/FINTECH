import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Modal,
  StatusBar,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Button from '../components/Button';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { postData, getData } from '../API';
import Footer from '../components/Footer';

const BLUE = '#092B88';

const Payment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { provider, ServiceId, name } = route.params || {};

  const [ConnNo, setConnNo] = useState('');
  const [lastRecharges, setLastRecharges] = useState([]);
  const [fetching, setFetching] = useState(false);

  // In-screen Modal for Errors / No Bills Due
  const [modalInfo, setModalInfo] = useState({
    visible: false,
    type: 'error', // 'error' | 'no_bill'
    title: '',
    message: '',
  });

  const fetchLastRecharge = async () => {
    try {
      const res = await getData(
        `api/cyrus/last-recharge?type=BBPS&subType=${name}`,
      );
      if (res?.Status && Array.isArray(res.Data)) {
        setLastRecharges(res.Data);
      } else {
        setLastRecharges([]);
      }
    } catch (err) {
      console.log('Last recharge error:', err);
      setLastRecharges([]);
    }
  };

  useEffect(() => {
    fetchLastRecharge();
  }, []);

  const handleSubmit = async () => {
    if (!ConnNo || !ConnNo.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Required Field',
        text2: `Please enter your ${provider?.displayname || 'Connection Number'}.`,
      });
      return;
    }

    try {
      if (provider?.regex) {
        const pattern = new RegExp(provider.regex);
        if (!pattern.test(ConnNo.trim())) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Format',
            text2: 'Please enter a valid connection number format.',
          });
          return;
        }
      }
    } catch (regexErr) {
      console.log('Regex evaluation warning:', regexErr);
    }

    // Fetch bill right here on this screen
    setFetching(true);
    try {
      const cleanConnNo = ConnNo.trim();
      const res = await postData(`/api/cyrus/bbps/new-bill-fetch`, {
        number: cleanConnNo,
        operator: provider?.op_id,
      });

      console.log('Payment screen BBPS Bill Fetch Response:', res);

      const raw = res?.Data?.data || res?.Data || res?.data || res;

      // Extract message from top-level or Data
      const resMsg = (
        raw?.message ||
        raw?.Remarks ||
        raw?.Message ||
        res?.message ||
        res?.Remarks ||
        res?.Message ||
        ''
      );
      const lowerMsg = resMsg.toLowerCase();

      // 1. Check if NO BILL DUE (204 or specific message)
      if (
        res?.status === 204 ||
        res?.ResponseStatus === 204 ||
        raw?.status === 204 ||
        raw?.ResponseStatus === 204 ||
        lowerMsg.includes('no bill') ||
        lowerMsg.includes('not due') ||
        lowerMsg.includes('no dues')
      ) {
        setModalInfo({
          visible: true,
          type: 'no_bill',
          title: 'No Bills Due',
          message: `There are currently no outstanding bills or dues for Consumer Number ${cleanConnNo}.`,
        });
        return;
      }

      // 2. Check if API indicated failure / unable to get bill details
      const isFailed =
        res?.success === false ||
        raw?.success === false ||
        res?.Status === false ||
        raw?.Status === false ||
        lowerMsg.includes('unable to get bill') ||
        lowerMsg.includes('biller');

      if (isFailed) {
        setModalInfo({
          visible: true,
          type: 'error',
          title: 'Unable to Fetch Bill',
          message:
            resMsg ||
            'Unable to get bill details from biller. Please check your consumer number or try again later.',
        });
        return;
      }

      // 3. Resolve the actual bill object (must have bill container or amount)
      const billObj =
        (res?.bill && typeof res.bill === 'object' ? res.bill : null) ||
        (res?.Data?.bill && typeof res.Data.bill === 'object' ? res.Data.bill : null) ||
        (res?.data?.bill && typeof res.data.bill === 'object' ? res.data.bill : null) ||
        (raw?.bill && typeof raw.bill === 'object' ? raw.bill : null) ||
        (raw?.bill_amount !== undefined || raw?.amount !== undefined ? raw : null);

      if (!billObj) {
        setModalInfo({
          visible: true,
          type: 'error',
          title: 'Unable to Fetch Bill',
          message:
            resMsg ||
            'Unable to get bill details from biller. Please verify consumer number.',
        });
        return;
      }

      // 4. Success -> Navigate to Bill Screen with fetched data
      navigation.navigate('Bill', {
        UniqueId: cleanConnNo,
        operator: { ...provider, ServiceId: ServiceId },
        fetchedBill: res,
      });
    } catch (error) {
      console.error('Payment bill fetch error:', error);
      const errMsg =
        error?.response?.data?.message ||
        error?.response?.data?.Remarks ||
        error?.response?.data?.Message ||
        'Unable to get bill details from Biller. Please verify your consumer number and try again.';

      setModalInfo({
        visible: true,
        type: 'error',
        title: 'Unable to Fetch Bill',
        message: errMsg,
      });
    } finally {
      setFetching(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <MaterialIcon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headertitle} numberOfLines={1}>
          {provider?.operator_name || 'Bill Payment'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.Content}>
        {/* Input Card */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{provider?.displayname || 'Consumer Number'}</Text>
          <View style={styles.inputWrapper}>
            <View style={styles.iconCircle}>
              <MaterialIcon name="receipt" size={20} color={BLUE} />
            </View>
            <TextInput
              placeholder="e.g. CX09AB1234"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
              onChangeText={text => setConnNo(text)}
              value={ConnNo}
              autoCapitalize="characters"
            />
          </View>
          <Text style={styles.helperText}>
            Enter valid account / consumer number as shown on your bill
          </Text>
        </View>

        {/* ---------------- LAST BILL PAYMENTS ---------------- */}
        {lastRecharges.length > 0 && (
          <View style={styles.lastRechargeBox}>
            <View style={styles.recentTitleRow}>
              <MaterialIcon name="history" size={18} color="#64748B" />
              <Text style={styles.lastRechargeTitle}>Recent Bill Payments</Text>
            </View>

            {lastRecharges.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.lastRechargeItem}
                activeOpacity={0.7}
                onPress={() => {
                  setConnNo(item.uniqueId);
                }}
              >
                <View>
                  <Text style={styles.lastRechargeNumber}>{item.uniqueId}</Text>
                  <Text style={styles.lastRechargeDate}>{item.date}</Text>
                </View>
                <Text style={styles.lastRechargeAmount}>₹{item.amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.loginBtn}>
          <Button
            title="FETCH BILL"
            onPress={handleSubmit}
            loading={fetching}
            disabled={fetching}
          />
        </View>

        <View style={{ marginTop: 'auto', paddingTop: 16 }}>
          <Footer />
        </View>
      </View>

      {/* ---------------- IN-SCREEN MODAL FOR ERRORS / NO BILL DUE ---------------- */}
      <Modal
        visible={modalInfo.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalInfo(prev => ({ ...prev, visible: false }))}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View
              style={[
                styles.modalIconWrap,
                modalInfo.type === 'no_bill'
                  ? styles.modalIconSuccess
                  : styles.modalIconError,
              ]}
            >
              <MaterialIcon
                name={modalInfo.type === 'no_bill' ? 'check-circle' : 'error-outline'}
                size={40}
                color={modalInfo.type === 'no_bill' ? '#059669' : '#DC2626'}
              />
            </View>

            <Text style={styles.modalTitle}>{modalInfo.title}</Text>

            {ConnNo ? (
              <View style={styles.consumerTag}>
                <Text style={styles.consumerTagLabel}>Account / Consumer ID:</Text>
                <Text style={styles.consumerTagVal}>{ConnNo}</Text>
              </View>
            ) : null}

            <Text style={styles.modalMessage}>{modalInfo.message}</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.modalActionBtn,
                modalInfo.type === 'no_bill'
                  ? styles.modalBtnSuccess
                  : styles.modalBtnError,
              ]}
              onPress={() => setModalInfo(prev => ({ ...prev, visible: false }))}
            >
              <Text style={styles.modalActionBtnText}>
                {modalInfo.type === 'no_bill' ? 'OK, UNDERSTOOD' : 'CHECK & TRY AGAIN'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Payment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  header: {
    backgroundColor: BLUE,
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 4,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headertitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  Content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  inputContainer: {
    marginTop: 6,
  },
  label: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    paddingVertical: 0,
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  loginBtn: {
    width: '100%',
    marginTop: 24,
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  lastRechargeBox: {
    marginTop: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    elevation: 3,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  recentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  lastRechargeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 6,
  },
  lastRechargeItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastRechargeNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  lastRechargeDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  lastRechargeAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: BLUE,
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalIconSuccess: {
    backgroundColor: '#ECFDF5',
  },
  modalIconError: {
    backgroundColor: '#FEF2F2',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  consumerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  consumerTagLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  consumerTagVal: {
    fontSize: 12,
    color: BLUE,
    fontWeight: '800',
    marginLeft: 6,
  },
  modalMessage: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  modalActionBtn: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  modalBtnSuccess: {
    backgroundColor: '#059669',
  },
  modalBtnError: {
    backgroundColor: BLUE,
  },
  modalActionBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
