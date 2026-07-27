import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import COLORS from '../constants/colors';
// import Img from '../Assets/fastag.png'; // ✅ Add a relevant image in your Assets folder
import Button from '../components/Button';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { postData, getData } from '../API';
import Footer from '../components/Footer';

const Payment = () => {

  const navigation = useNavigation();
  const route = useRoute();
  const { provider, ServiceId, name } = route.params;
  const [ConnNo, setConnNo] = useState();
  const [amount, setAmount] = useState('');
  const [lastRecharges, setLastRecharges] = useState([]);

  const fetchLastRecharge = async () => {
    try {
      const res = await getData(
        `api/cyrus/last-recharge?type=BBPS&subType=${name}`,
      );
      console.log(res);
      if (res.Status && Array.isArray(res.Data)) {
        setLastRecharges(res.Data);
      } else {
        setLastRecharges([]);
      }
    } catch (err) {
      console.log(err);
      setLastRecharges([]);
    }
  };

  React.useEffect(() => {
    fetchLastRecharge();
  }, []);

  const handleSubmit = () => {
    try {
      const pattern = new RegExp(provider.regex);

      if (!pattern.test(ConnNo)) {
        console.log('Invalid connection number format.');
        Toast.show({
          type: 'error',
          text1: 'Invalid Connection Number',
          text2: 'Please enter a valid number format.',
        });
        throw new Error('Invalid Connection Number');
      }
      navigation.navigate('Bill', {
        UniqueId: ConnNo,
        operator: { ...provider, ServiceId: ServiceId },
      });
    } catch (error) {
      console.log('Error fetching bill:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headertitle} numberOfLines={1}>{provider.operator_name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.Content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{provider.displayname}</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="e.g. CX09AB1234"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
              onChangeText={text => setConnNo(text)}
              value={ConnNo}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* ---------------- LAST BILL PAYMENTS ---------------- */}
        {lastRecharges.length > 0 && (
          <View style={styles.lastRechargeBox}>
            <Text style={styles.lastRechargeTitle}>Recent Bill Payments</Text>

            {lastRecharges.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.lastRechargeItem}
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
          <Button title="FETCH BILL" onPress={handleSubmit} />
        </View>
        <View style={{ marginTop: 'auto', paddingTop: 16 }}>
          <Footer />
        </View>
      </View>
    </SafeAreaView>
  );
};


export default Payment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },
  header: {
    backgroundColor: '#471d7d',
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  backBtn: { padding: 4 },
  headertitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  Content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  inputContainer: {
    marginTop: 10,
  },
  label: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#471d7d',
    paddingHorizontal: 16,
    height: 54,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  textInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  loginBtn: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  lastRechargeBox: {
    marginTop: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  lastRechargeTitle: {
    fontSize: 16,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingBottom: 12,
    color: '#0F172A',
  },
  lastRechargeItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastRechargeNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  lastRechargeDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  lastRechargeAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#471d7d',
  },
});
