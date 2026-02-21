import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postData } from '../API';
import { setUser } from '../redux/actions/userActions';
import DeviceInfo from 'react-native-device-info';
import SmsRetriever from 'react-native-sms-retriever';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME_COLORS } from '../constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const BLUE = '#1756C5'; // Defined explicitly

const OtpInput = ({ route }) => {
  const { Otp, phone, Status } = route.params || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const navigation = useNavigation();
  const dispatch = useDispatch();


  const handleSubmit = async () => {
    const fullOtp = otp.join('');
    setLoading(true);

    try {
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      const response = await postData('api/auth/user-register', {
        phone,
        otp: fullOtp,
        ResponseStatus: Status,
        deviceToken: fcmToken,
      });

      if (response.ResponseStatus === 1 || response?.Status === true) {
        navigation.navigate('Register', {
          phone,
          Otp: fullOtp,
          userData: response,
        });
        /* 
        dispatch(setUser(response));
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          }),
        );
        return; 
        */
      } else {
        Alert.alert('Invalid OTP', 'Please Try again with Correct OTP');
      }

    } catch (error) {
      console.log('Error verifying OTP', error);
      Alert.alert('Invalid OTP', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // countdown for resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (text, index) => {
    if (text.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (text && index < otp.length - 1) {
        inputs.current[index + 1].focus();
      }
    }
  };

  useEffect(() => {
    startListeningForOtp();
  }, []);

  const startListeningForOtp = async () => {
    try {
      if (Platform.OS === 'android') {
        const registered = await SmsRetriever.startSmsRetriever();
        if (registered) {
          SmsRetriever.addSmsListener(event => {
            const message = event?.message;
            if (message) {
              const extractedOtp = message.match(/\d{6}/)?.[0];
              if (extractedOtp) {
                autoFillOtp(extractedOtp);
              }
            }
            SmsRetriever.removeSmsListener();
          });
        }
      }
    } catch (error) {
      console.log('SMS Retriever Error:', error);
    }
  };

  const ResendOtp = async () => {
    if (timer > 0) return; // still counting down

    try {
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      const response = await postData('api/auth/user-register', {
        phone,
        deviceToken: fcmToken,
      });
      setTimer(30);
      Alert.alert('OTP Sent', 'A new OTP has been sent to your number.');
    } catch (error) {
      console.log('Resend OTP error:', error);
    }
  };

  const autoFillOtp = otpCode => {
    const otpArray = otpCode.split('');
    setOtp(otpArray);
    setTimeout(() => {
      handleSubmit();
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A237A" />

      {/* Header */}
      {/* Header */}
      <LinearGradient
        colors={['#0A237A', '#1246C0', '#1A6FE0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.title}>Verification Code</Text>
        <Text style={styles.subtitle}>We have sent the code verification to</Text>
        <Text style={styles.phoneNumber}>+91 {phone}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* OTP Inputs */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit ? styles.filledBox : styles.emptyBox,
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={text => handleChange(text, index)}
            />
          ))}
        </View>

        {/* Resend timer */}
        <TouchableOpacity disabled={timer > 0} onPress={ResendOtp} style={styles.resendBtn}>
          <Text style={styles.resendText}>
            {timer > 0 ? `Resend code in ${timer}s` : 'Resend Code'}
          </Text>
        </TouchableOpacity>


        {/* Verify button */}
        {/* Verify button */}
        <LinearGradient
          colors={['#1756C5', '#4285F4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.verifyBtn}
        >
          <TouchableOpacity onPress={handleSubmit} style={styles.verifyBtnInner}>
            <Text style={styles.verifyBtnText}>Submit</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A237A' },
  header: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#D9E6FF', textAlign: 'center' },
  phoneNumber: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 4 },

  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 55,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    borderRadius: 12,
    borderWidth: 1.5,
    color: '#1A1A2E',
  },
  emptyBox: {
    borderColor: '#E0E7FF',
    backgroundColor: '#FAFBFF',
  },
  filledBox: {
    borderColor: '#1756C5',
    backgroundColor: '#F0F5FF',
  },

  resendBtn: {
    marginBottom: 30,
  },
  resendText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },

  verifyBtn: {
    width: '100%',
    borderRadius: 14,
    shadowColor: '#1756C5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 10, // Explicit margin to separate from checkbox
  },
  verifyBtnInner: {
    paddingVertical: 18,
    alignItems: 'center',
    width: '100%',
  },
  verifyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
