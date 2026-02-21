import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postData } from '../API';
import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export default function Login() {
  const navigation = useNavigation();
  const [mobile, setMobile] = useState('');

  const handleSendOtp = (OTP, Status) => {
    navigation.navigate('OtpInput', {
      Otp: OTP,
      phone: mobile,
      Status: Status,
    });
  };

  const HandleLogin = async () => {
    if (!mobile || mobile.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    try {
      const deviceToken = await DeviceInfo.getUniqueId();
      const response = await postData('api/auth/user-register', {
        phone: mobile,
        deviceToken,
      });
      if (response.Status) {
        handleSendOtp(response.Otp, response.ResponseStatus);
      } else {
        Alert.alert('Failed', response?.Remarks || 'Something went wrong.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not send OTP. Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#0A237A', '#1756C5', '#4285F4']} // Blue Theme Gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.bg}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A237A" />
      <SafeAreaView style={styles.safe}>

        {/* ── WHITE CARD ── */}
        <View style={styles.card}>

          {/* Title row */}
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>Login to continue</Text>
          </View>

          {/* Phone input */}
          <View style={styles.phoneBox}>
            <Text style={styles.flag}>🇮🇳</Text>
            <Text style={styles.dialCode}>+91</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="9871234567"
              placeholderTextColor="#bbb"
              keyboardType="number-pad"
              value={mobile}
              onChangeText={setMobile}
              maxLength={10}
            />
            {mobile.length === 10 && <Text style={styles.checkIcon}>✓</Text>}
          </View>

          {/* Send OTP hint row */}
          <View style={[styles.hintRow, { justifyContent: 'center' }]}>
            <Text style={styles.hintLeft}>We will send you an OTP</Text>
          </View>

          {/* Verify OTP button */}
          <LinearGradient
            colors={['#1756C5', '#4285F4']} // Blue Gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.verifyBtn}
          >
            <TouchableOpacity onPress={HandleLogin} style={styles.verifyBtnInner}>
              <Text style={styles.verifyBtnText}>Get OTP</Text>
            </TouchableOpacity>
          </LinearGradient>



          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Language buttons */}


        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  /* ── Card ── */
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },

  /* Header */
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },

  /* Phone input */
  phoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
    backgroundColor: '#FAFBFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  flag: { fontSize: 22, marginRight: 8 },
  dialCode: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A2E',
    letterSpacing: 1,
  },
  checkIcon: {
    fontSize: 16,
    color: '#2DB84B',
    fontWeight: 'bold',
  },

  /* Hint row */
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  hintLeft: { fontSize: 13, color: '#888', fontWeight: '500' },
  hintRight: { fontSize: 13, color: '#1756C5', fontWeight: '600' },

  /* Verify OTP button */
  verifyBtn: {
    borderRadius: 14,
    marginBottom: 18,
    overflow: 'hidden',
  },
  verifyBtnInner: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  /* Resend */
  resendText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#aaa',
    lineHeight: 16,
  },

  /* Card separator */
  cardDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
  },

  /* ── Bottom rows (inside card) ── */
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  bottomBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

});
