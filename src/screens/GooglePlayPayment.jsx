import React, { useEffect, useState } from 'react';
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
import { getData } from '../API';

const GooglePlayPayment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { ServiceId } = route.params;
  const [ConnNo, setConnNo] = useState();
  const [amount, setAmount] = useState('');
  const [UserData, setUserData] = useState();

  // console.log(provider);
  const handleSubmit = () => {
    navigation.navigate('PaymentConfirmation', {
      rechargeData: {
        amount: amount,
        userDetails: UserData,
        number: UserData?.phone,
      },
      operatorDetail: {
        amount: amount,
        ServiceId: ServiceId,
        name: 'Google Play',
      },
      from: 'googleplay',
      isPrePaid: false,
    });
  };
  console.log(UserData.phone);

  const fetchUser = async () => {
    try {
      const res = await getData(`/api/user/profile`);

      console.log('User Response →', res);

      if (res?.Status === true || res?.success === true) {
        const userData = res?.Data || res?.user;
        setUserData(res?.Data || res?.user);
        console.log('Fetched User →', userData);

        // ✅ Save in Redux
        // dispatch(setUser(userData));
      } else {
        console.log('Failed to fetch user');
      }
    } catch (err) {
      console.log('User Fetch Error →', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headertitle}>Google Play Payment</Text>
      </View>

      <View style={styles.Content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Add the Amount</Text>
          <View style={styles.input}>
            <TextInput
              style={{ width: '100%' }}
              onChangeText={text => setAmount(text)}
              value={amount}
              autoCapitalize="characters"
            />
          </View>
        </View>
      </View>

      {/* Pay Button */}
      <Button
        style={styles.loginBtn}
        title="Generate Redeem Code"
        filled
        onpress={handleSubmit}
      />
    </SafeAreaView>
  );
};

export default GooglePlayPayment;

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
});
