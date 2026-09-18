import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  SafeAreaView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
} from 'react-native';
import COLORS from '../constants/colors';
import Button from '../components/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import { postData } from '../API';
import DeviceInfo from 'react-native-device-info';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/actions/userActions';
import Toast from 'react-native-toast-message';
import configureStore from '../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Register = ({ navigation }) => {
  const dispatch = useDispatch();
  const userState = useSelector(state => state);

  const route = useRoute();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [Referal, setReferal] = useState('');
  const [emailValidity, setEmailValidity] = useState(true);
  const [error, setError] = useState('');
  const { phone, Otp } = route.params;

  const handleCheckEmail = text => {
    const emailRegex =
      /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    setEmail(text);
    if (emailRegex.test(text)) {
      setEmailValidity(true);
    } else {
      setEmailValidity(false);
      setError('Invalid Email');
    }
  };

  const handleRegister = async () => {
    try {
      if (!firstName || !lastName || !email) {
        setError('Please fill all required fields');
        return;
      }

      if (!emailValidity) {
        setError('Invalid Email');
        return;
      }
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      console.log('Register screen sending FCM token:', fcmToken);

      const response = await postData(`/api/auth/user-register`, {
        phone: phone,
        otp: Otp,
        ResponseStatus: 1,
        firstName: firstName,
        lastName: lastName,
        email: email,
        deviceToken: fcmToken,
        referalId: Referal,
      });

      console.log('Register Response →', response);

      if (response?.Status === true) {
        const apiUser = response?.AccessToken;
        console.log('confirmlogs');

        // ✅ Save user to Redux
        dispatch(setUser(response));

        // ✅ Navigate to create MPIN
        console.log('Redux user state after register →', userState);

        navigation.navigate('CreatePassword', {
          email,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.data?.message ?? 'Something went wrong',
        });
      }
    } catch (err) {
      console.log('Register API Error:', err?.response?.data ?? err);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.response?.data?.message ?? 'Something went wrong',
      });
    }
  };

  // handleLogout = async () => {
  //   try {

  //     await AsyncStorage.clear();

  //     BackHandler.exitApp();
  //   } catch (error) {
  //     console.error('Error logging out:', error);
  //   }
  // };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register</Text>
      </View>
      <View style={styles.bodyContainer}>
        {/* Name section */}
        <View style={{ marginTop: 22 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '500', color: COLORS.black }}>
                First Name
              </Text>
              <View style={{ width: 160, height: 48, borderWidth: 2, borderColor: '#471d7d', borderRadius: 8 }}>
                <TextInput
                  keyboardType="default"
                  placeholder="First name"
                  placeholderTextColor="#888"
                  value={firstName}
                  maxLength={12}
                  onChangeText={text => setFirstName(text)}
                  style={{ fontSize: 16, fontWeight: '400', width: '100%', paddingLeft: 10, color: '#000' }}
                />
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '400', color: COLORS.black }}>
                Last Name
              </Text>
              <View style={{ width: 160, height: 48, borderWidth: 2, borderColor: '#471d7d', borderRadius: 8 }}>
                <TextInput
                  keyboardType="default"
                  placeholder="Last name"
                  placeholderTextColor="#888"
                  value={lastName}
                  maxLength={12}
                  onChangeText={text => setLastName(text)}
                  style={{ fontSize: 16, fontWeight: '400', width: '100%', paddingLeft: 10, color: '#000' }}
                />
              </View>
            </View>
          </View>

          {/* Email section */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 16, fontWeight: '400', color: COLORS.black }}>
              Email address
            </Text>
            <View style={{ width: '100%', height: 48, borderWidth: 2, borderColor: '#471d7d', borderRadius: 8 }}>
              <TextInput
                keyboardType="email-address"
                placeholder="Enter your email address"
                placeholderTextColor="#888"
                value={email}
                onChangeText={text => handleCheckEmail(text)}
                style={{ fontSize: 16, fontWeight: '400', width: '100%', paddingLeft: 10 }}
              />
            </View>
            {!emailValidity && (
              <Text style={{ textAlign: 'right', color: COLORS.warning, fontWeight: '500', marginTop: 2 }}>
                {error}
              </Text>
            )}
          </View>

          {/* Referal section */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 16, fontWeight: '400', color: COLORS.black }}>
              Referal Code
            </Text>
            <View style={{ width: '100%', height: 48, borderWidth: 2, borderColor: '#471d7d', borderRadius: 8 }}>
              <TextInput
                keyboardType="default"
                placeholder="Enter Referal Code (OPTIONAL)"
                placeholderTextColor="#333"
                value={Referal}
                onChangeText={text => setReferal(text)}
                style={{ fontSize: 16, fontWeight: '400', width: '100%', paddingLeft: 10 }}
              />
            </View>
            <Text style={{ marginTop: 8, fontSize: 16, color: COLORS.black }}>
              If you have an account{' '}
              <Text style={{ color: '#471d7d' }} onPress={() => navigation.navigate('LogIn')}>
                Login
              </Text>
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 'auto', marginBottom: 20 }}>
          <Text style={{ fontSize: 14, color: COLORS.black, marginBottom: 8, textAlign: 'center' }}>
            by register, you accept our Terms and conditions
          </Text>
          <Button
            onpress={() => {
              handleRegister();
            }}
            title="Register"
            filled
            style={{ backgroundColor: '#58007b', borderColor: '#58007b' }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#471d7d',
  },
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 19,
    fontWeight: '800',
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },
});
