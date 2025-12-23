import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  SafeAreaView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import COLORS from '../constants/colors';
import Button from '../components/Button';
import Icon from 'react-native-vector-icons/FontAwesome';
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
          text2: res?.data?.message ?? 'Something went wrong',
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
    <SafeAreaView>
      <View
        style={{
          marginHorizontal: 22,
          marginTop: 22,
        }}
      >
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text
            style={{
              marginTop: -28,
              fontSize: 22,
              fontWeight: '500',
              color: COLORS.black,
              alignSelf: 'center',
            }}
          >
            Register
          </Text>
        </View>

        {/* Name section */}
        <View
          style={{
            marginTop: 22,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 32,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: COLORS.black,
                }}
              >
                First Name
              </Text>
              <View
                style={{
                  width: 170,
                  height: 48,
                  borderWidth: 2,
                  borderColor: '#1B2F9B',
                  borderRadius: 8,
                }}
              >
                <TextInput
                  keyboardType="default"
                  placeholder="Enter your first name"
                  placeholderTextColor="#888"
                  value={firstName}
                  maxLength={12}
                  onChangeText={text => setFirstName(text)}
                  style={{
                    fontSize: 16,
                    fontWeight: '400',
                    width: '100%',
                  }}
                />
              </View>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '400',
                  color: COLORS.black,
                }}
              >
                Last Name
              </Text>
              <View
                style={{
                  width: 170,
                  height: 48,
                  borderWidth: 2,
                  borderColor: '#1B2F9B',
                  borderRadius: 8,
                }}
              >
                <TextInput
                  keyboardType="default"
                  placeholder="Enter your last name"
                  placeholderTextColor="#888"
                  value={lastName}
                  maxLength={12}
                  onChangeText={text => setLastName(text)}
                  style={{
                    fontSize: 16,
                    fontWeight: '400',
                    width: '100%',
                  }}
                />
              </View>
            </View>
          </View>

          {/* Email section */}
          <View
            style={{
              marginBottom: 32,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '400',
                color: COLORS.black,
              }}
            >
              Email address
            </Text>
            <View
              style={{
                width: '100%',
                height: 48,
                borderWidth: 2,
                borderColor: '#1B2F9B',
                borderRadius: 8,
              }}
            >
              <TextInput
                keyboardType="email-address"
                placeholder="Enter your email address"
                placeholderTextColor="#888"
                value={email}
                onChangeText={text => handleCheckEmail(text)}
                style={{
                  fontSize: 16,
                  fontWeight: '400',
                  width: '100%',
                  paddingLeft: 10,
                }}
              />
            </View>
            {!emailValidity ? (
              <Text
                style={{
                  textAlign: 'right',
                  color: COLORS.warning,
                  fontWeight: '500',
                  marginTop: 2,
                }}
              >
                {error}
              </Text>
            ) : (
              ''
            )}
          </View>

          {/* NIC section */}
          <View
            style={{
              marginBottom: 32,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '400',
                color: COLORS.black,
              }}
            >
              Referal Code
            </Text>
            <View
              style={{
                width: '100%',
                height: 48,
                borderWidth: 2,
                borderColor: '#1B2F9B',
                borderRadius: 8,
              }}
            >
              <TextInput
                keyboardType="default"
                placeholder="Enter Referal Code (OPTIONAL)"
                placeholderTextColor="#333"
                value={Referal}
                onChangeText={text => setReferal(text)}
                style={{
                  fontSize: 16,
                  fontWeight: '400',
                  width: '100%',
                  paddingLeft: 10,
                }}
              />
            </View>
            <Text
              style={{
                marginTop: 8,
                fontSize: 16,
                color: COLORS.black,
              }}
            >
              If you have an account{' '}
              <Text
                style={{
                  color: '#1B2F9B',
                }}
                onPress={() => navigation.navigate('LogIn')}
              >
                Login
              </Text>
            </Text>
          </View>
        </View>
        <View
          style={{
            marginVertical: 96,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: COLORS.black,
              marginBottom: 8,
            }}
          >
            by register, you accept our Terms and conditions
          </Text>
          {/* <TouchableOpacity style={{width:50,backgroundColor:'red',height:50}} onPress={handleLogout}></TouchableOpacity> */}
          <Button
            onpress={() => {
              handleRegister();
            }}
            title="Register"
            filled
            style={{ backgroundColor: '#E10600', borderColor: '#E10600' }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Register;
