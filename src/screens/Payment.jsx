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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headertitle}>{provider.operator_name}</Text>
      </View>

      <View style={styles.Content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{provider.displayname}</Text>
          <View style={styles.input}>
            <TextInput
              placeholder="e.g. CX09AB1234"
              style={{ width: '100%' }}
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
    marginHorizontal: 22,
    marginTop: 22,
    justifyContent: 'start', // pushes button to bottom
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'between',
  },
  headertitle: {
    color: COLORS.black,
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: '15%',
  },
  cardContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
    backgroundColor: COLORS.primary,
    marginTop: 30,
    borderRadius: 12,
    padding: 30,
    overflow: 'hidden',
  },
  imageStyles: {
    position: 'absolute',
    right: 10,
    bottom: -5,
    height: 130,
    width: 130,
    zIndex: -1,
  },
  text: {
    position: 'absolute',
    color: COLORS.white,
    fontSize: 22,
    left: 30,
    top: 50,
    lineHeight: 30,
    fontWeight: '600',
  },
  inputContainer: {
    marginTop: 25,
  },
  label: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
  input: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginBtn: {
    width: '100%',
    marginTop: 20, // little spacing from bottom
  },
  Operator: {
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.black,
  },
  lastRechargeBox: {
    marginTop: 25,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },

  lastRechargeTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingBottom: 8,
    color: COLORS.black,
  },

  lastRechargeItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  lastRechargeNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },

  lastRechargeDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },

  lastRechargeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
