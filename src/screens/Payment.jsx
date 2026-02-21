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
import { THEME_COLORS, GRADIENTS } from '../constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import { Platform } from 'react-native';

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
      {/* Header */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{provider.operator_name}</Text>
      </LinearGradient>

      <View style={styles.Content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{provider.displayname}</Text>
          <View style={styles.input}>
            <TextInput
              placeholder="Enter details..."
              style={styles.textInput}
              placeholderTextColor="#94A3B8"
              onChangeText={text => setConnNo(text)}
              value={ConnNo}
              autoCapitalize="characters"
            />
          </View>
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
                setConnNo(item.number); // auto-fill connection number
              }}
            >
              <View>
                <Text style={styles.lastRechargeNumber}>{item.number}</Text>
                {item.createdAt && (
                  <Text style={styles.lastRechargeDate}>
                    {item.createdAt.slice(0, 10)}
                  </Text>
                )}
              </View>

              <Text style={styles.lastRechargeAmount}>₹ {item.amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Pay Button */}
      <Button
        style={styles.loginBtn}
        title="Fetch Bill"
        filled
        onpress={() =>
          // navigation.navigate('Bill', {
          //   UniqueId: ConnNo,
          //   op_id: provider.op_id,
          // })
          handleSubmit()
        }
      />
    </SafeAreaView>
  );
};

export default Payment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    marginLeft: 15,
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    flex: 1,
  },
  Content: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#1756C5',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    marginBottom: 25,
  },
  label: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    letterSpacing: 1,
  },
  loginBtn: {
    width: '100%',
    marginTop: 10,
  },
  lastRechargeBox: {
    marginTop: 5,
    paddingHorizontal: 20,
  },
  lastRechargeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 14,
    marginLeft: 4,
  },
  lastRechargeItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  lastRechargeNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  lastRechargeDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600',
  },
  lastRechargeAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME_COLORS.primary,
  },
});
