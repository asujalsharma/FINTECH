import React, { useState, useEffect } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import COLORS from '../constants/colors';
import Button from '../components/Button';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { postData, getData } from '../API';
import Footer from '../components/Footer';

const Payment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { provider, ServiceId, name } = route.params;
  const [ConnNo, setConnNo] = useState('');
  const [lastRecharges, setLastRecharges] = useState([]);

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
      console.log(err);
      setLastRecharges([]);
    }
  };

  useEffect(() => {
    fetchLastRecharge();
  }, []);

  const handleSubmit = () => {
    try {
      if (!ConnNo.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Required',
          text2: `Please enter your ${provider.displayname || 'Account Number'}.`,
        });
        return;
      }

      if (provider.regex) {
        const pattern = new RegExp(provider.regex);
        if (!pattern.test(ConnNo)) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Format',
            text2: 'Please enter a valid format for this biller.',
          });
          return;
        }
      }

      navigation.navigate('Bill', {
        UniqueId: ConnNo,
        operator: { ...provider, ServiceId: ServiceId },
      });
    } catch (error) {
      console.log('Error submitting bill query:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg || '#0A2568'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headertitle} numberOfLines={1}>
            {provider.operator_name}
          </Text>
          <Text style={styles.headersubtitle}>Official BBPS Service</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.Content}>
        {/* Main Input Box */}
        <View style={styles.mainCard}>
          <Text style={styles.label}>{provider.displayname || 'Account / Connection Number'}</Text>
          <View style={styles.inputWrapper}>
            <Icon name="tag" size={20} color={COLORS.primary || '#0D52ED'} style={{ marginRight: 10 }} />
            <TextInput
              placeholder="e.g. CX09AB1234"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
              onChangeText={text => setConnNo(text)}
              value={ConnNo}
              autoCapitalize="characters"
            />
          </View>
          <Text style={styles.helpText}>Enter your consumer number exactly as shown on your physical bill.</Text>
        </View>

        {/* Recent Bill Payments */}
        {lastRecharges.length > 0 && (
          <View style={styles.lastRechargeBox}>
            <View style={styles.recentTitleRow}>
              <Icon name="history" size={18} color="#64748B" />
              <Text style={styles.lastRechargeTitle}>Recent Bill Payments</Text>
            </View>

            {lastRecharges.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.75}
                style={styles.lastRechargeItem}
                onPress={() => {
                  setConnNo(item.uniqueId);
                }}
              >
                <View style={styles.recentIconBox}>
                  <Icon name="receipt" size={18} color={COLORS.primary || '#0D52ED'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lastRechargeNumber}>{item.uniqueId}</Text>
                  <Text style={styles.lastRechargeDate}>{item.date || 'Recent'}</Text>
                </View>
                <View style={styles.recentAmountPill}>
                  <Text style={styles.lastRechargeAmount}>₹ {item.amount}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.loginBtn}>
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.proceedButtonText}>FETCH BILL</Text>
            <Icon name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </View>

      <Footer />
    </SafeAreaView>
  );
};

export default Payment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: COLORS.headerBg || '#0A2568',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 5,
    shadowColor: COLORS.headerBg || '#0A2568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headertitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  headersubtitle: {
    color: '#D9E7FF',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  Content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  mainCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  label: {
    color: '#091838',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.8,
    borderColor: COLORS.primary || '#0D52ED',
    paddingHorizontal: 14,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#091838',
  },
  helpText: {
    color: '#64748B',
    fontSize: 11.5,
    marginTop: 8,
    lineHeight: 16,
  },
  lastRechargeBox: {
    marginTop: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    backgroundColor: '#FFF',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  recentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  lastRechargeTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 6,
    color: '#091838',
  },
  lastRechargeItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  lastRechargeNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#091838',
  },
  lastRechargeDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  recentAmountPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  lastRechargeAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  loginBtn: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  proceedButton: {
    backgroundColor: COLORS.primary || '#0D52ED',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 4,
    shadowColor: COLORS.primary || '#0D52ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  proceedButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
