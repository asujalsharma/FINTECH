import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';
import { postData } from '../API';

import COLORS from '../constants/colors';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const navigation = useNavigation();

  const handleSendOtp = (OTP, Status) => {
    navigation.navigate('OtpInput', {
      Otp: OTP,
      phone: mobile,
      Status: Status,
    });
  };

  const HandleLogin = async () => {
    if (!mobile || mobile.length < 10) {
      Alert.alert('Please enter a valid mobile number');
      return;
    }

    const deviceToken = await DeviceInfo.getUniqueId();

    const response = await postData('api/auth/user-register', {
      phone: mobile,
      deviceToken: deviceToken,
    });

    if (response.Status) {
      handleSendOtp(response.Otp, response.ResponseStatus);
    } else {
      Alert.alert('Something went wrong');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔥 Gradient Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.logo}>ClubTYL</Text>
        <Text style={styles.welcome}>Welcome Back 👋</Text>
        <Text style={styles.subtitle}>
          Ab Har Recharge par Kamao! #Guaranteed_Cashback
        </Text>
      </LinearGradient>

      {/* 💳 Floating Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Mobile Number</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 10 digit number"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            value={mobile}
            onChangeText={setMobile}
            maxLength={10}
          />
        </View>

        <Text style={styles.helper}>
          We'll send you an OTP to verify your number
        </Text>

        {/* 🚀 Button */}
        <TouchableOpacity
          style={[
            styles.button,
            mobile.length < 10 && { opacity: 0.5 },
          ]}
          onPress={HandleLogin}
          disabled={mobile.length < 10}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  header: {
    paddingTop: 60,
    paddingBottom: 100,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },

  logo: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },

  welcome: {
    fontSize: 20,
    color: '#fff',
    marginTop: 8,
  },

  subtitle: {
    fontSize: 13,
    color: '#FFE9DF',
    marginTop: 6,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -60,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
  },

  prefix: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
    color: '#333',
  },

  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: '#000',
  },

  helper: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});