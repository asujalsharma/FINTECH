// // React Native screen for OTP verification
// import React, { useState  } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   SafeAreaView,
//   StyleSheet,
//   ScrollView,
// } from 'react-native';
// import axios from 'axios';
// import COLORS from '../constants/colors';
// import Button from '../components/Button';
// import {useNavigation} from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import { useRoute } from '@react-navigation/native';
// import { URL } from '../constants/URL';
// const OtpInput = ({length = 6, onOtpSubmit = () => {}}) => {
//   const [otp, setOtp] = React.useState(new Array(length).fill(''));
//   const inputRefs = React.useRef([]);

//   React.useEffect(() => {
//     if (inputRefs.current[0]) {
//       inputRefs.current[0].focus();
//     }
//   }, []);

//   const handleChange = (index, value) => {
//     const newOtp = [...otp];
//     newOtp[index] = value;

//     setOtp(newOtp);

//     const combinedOtp = newOtp.join('');
//     if (combinedOtp.length === length) onOtpSubmit(combinedOtp);

//     if (value && index < length - 1 && inputRefs.current[index + 1]) {
//       inputRefs.current[index + 1].focus();
//     }
//   };

//   const handleKeyDown = (index, e) => {
//     if (e.key === 'Backspace' && index > 0 && !otp[index]) {
//       // Move focus to the previous input field on backspace
//       inputRefs.current[index - 1].focus();
//     } else if (e.key === 'Backspace' && index === 0 && otp[index] === '') {
//       // Move focus to the last input field if backspace is pressed on the first empty field
//       inputRefs.current[length - 1].focus();
//     }
//   };

//   return (
//     <View style={styles.otpContainer}>
//       {otp.map((digit, index) => (
//         <TextInput
//           key={index}
//           ref={ref => (inputRefs.current[index] = ref)}
//           style={styles.otpInput}
//           value={digit}
//           keyboardType="numeric"
//           maxLength={1}
//           onChangeText={value => handleChange(index, value)}
//           onKeyDown={e => handleKeyDown(index, e)}
//         />
//       ))}
//     </View>
//   );
// };

// const OTPVerificationScreen = () => {

//   const navigation = useNavigation();
//   const route = useRoute();
//   const {email} = route.params;
//   const [errMsg,setErrmsg]=useState('')
//   // Function to handle resend OTP
//   const handleResendOTP = () => {
//     console.log('Resend OTP');
//     // Implement logic to resend OTP
//   };

//   // Function to handle verification
//   const handleVerify = async otp => {
//     console.log('Verify Button Pressed with OTP:', otp);
//     // Implement verification logic
//     try {
//       const response = await axios.post(
//         `${URL}/api/otpverify`,
//         {email: email,
//         otp:otp},
//       );
//       console.log(response.data.message)
//       if(response.data.success==true){
//         navigation.navigate('PinScreen',{email})

//       }else{
//         setErrmsg(response.data.message)

//       }

//     } catch (error) {
//       console.error(error);

//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         {/* Arrow icon */}
//         <TouchableOpacity
//           style={styles.arrowContainer}
//           onPress={() => navigation.goBack()}>
//           <Icon name="chevron-left" size={24} color={COLORS.black} />
//         </TouchableOpacity>

//         <View style={styles.contentContainer}>
//           {/* Lock icon and title */}
//           <View style={styles.lockContainer}>
//             <Icon
//               name="lock"
//               size={120}
//               color={'#471d7d'}
//               style={styles.lockIcon}
//             />
//             <Text style={styles.lockTitle}>OTP verification </Text>
//           </View>

//           {/* Email description */}
//           <Text style={styles.emailDescription}>
//             We sent a one-time password to your email
//           </Text>
//           <Text style={styles.userEmail}>user@example.com</Text>

//           {/* OTP input boxes */}
//           {/* Integrated OtpInput component */}
//           <OtpInput length={6} onOtpSubmit={handleVerify} />

//           {/* Resend OTP option */}
//           <TouchableOpacity onPress={handleResendOTP}>
//             <Text style={styles.resendText}>Resend OTP</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//        <Text style={{
//             fontSize: 16,
//             fontWeight: '400',
//             color: COLORS.red,
//             textAlign:'center'
//           }}>{errMsg}</Text>
//       {/* Verify button */}
//       <Button style={styles.verifyButton} title="Verify" filled />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     justifyContent: 'center',
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   contentContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 24,
//     paddingBottom: 20,
//   },
//   arrowContainer: {
//     position: 'absolute',
//     top: 45,
//     left: 38,
//     zIndex: 1,
//   },
//   lockContainer: {
//     flexDirection: 'column',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   lockIcon: {
//     marginTop: 10,
//   },
//   lockTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: COLORS.black,
//     marginTop: 18,
//   },
//   emailDescription: {
//     fontSize: 14,
//     color: COLORS.black,
//     marginTop: 18,
//     textAlign: 'center',
//   },
//   userEmail: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#471d7d',
//     textAlign: 'center',
//   },
//   otpContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 36,
//   },
//   otpInput: {
//     width: '12%',
//     height: 48,
//     borderWidth: 2,
//     borderColor: '#471d7d',
//     borderRadius: 8,
//     textAlign: 'center',
//     fontSize: 16,
//     fontWeight: '400',
//     marginHorizontal: 4,
//   },
//   resendText: {
//     fontSize: 14,
//     color: '#471d7d',
//     marginTop: 6,
//     textAlign: 'center',
//   },
//   verifyButton: {
//     fontSize: 18,
//     marginBottom: 58,
//     marginLeft: 24,
//     marginRight: 24,
//   },
// });

// export default OTPVerificationScreen;

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
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { postData } from '../API';
import { setUser } from '../redux/actions/userActions';
import DeviceInfo from 'react-native-device-info';
import SmsRetriever from 'react-native-sms-retriever';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '../components/Footer';
import COLORS from '../constants/colors';

const OtpInput = ({ route }) => {
  const { Otp, phone, Status } = route.params;
  console.log('otp and phone', Otp, phone, Status);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  // const inputs = useRef<TextInput[]>([]);
  const inputs = useRef([]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const handleSubmit = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      Alert.alert('Incomplete OTP', 'Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      console.log('OTP Submitted:', fullOtp);
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      console.log('Sending FCM Token to backend:', fcmToken);

      const response = await postData('api/auth/user-register', {
        phone,
        otp: fullOtp,
        ResponseStatus: Status,
        deviceToken: fcmToken,
      });

      console.log('response>>>>>', response);

      if (response.ResponseStatus === 1) {
        navigation.navigate('Register', {
          phone,
          Otp: fullOtp,
        });
      } else if (response?.Status === true) {
        dispatch(setUser(response));

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          }),
        );
        return;
      } else {
        Alert.alert('Verification Failed', response?.Remarks || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.log('Error verifying OTP', error.response?.data || error.message);
      Alert.alert('Verification Error', error.response?.data?.Remarks || 'Invalid OTP. Please check and try again.');
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
        inputs.current[index + 1]?.focus();
      }
    }
  };

  useEffect(() => {
    startListeningForOtp();
  }, []);

  const startListeningForOtp = async () => {
    try {
      const registered = await SmsRetriever.startSmsRetriever();

      if (registered) {
        SmsRetriever.addSmsListener(event => {
          const message = event.message;
          console.log('OTP Message:', message);

          const extractedOtp = message.match(/\d{6}/)?.[0];

          if (extractedOtp) {
            autoFillOtp(extractedOtp);
          }

          SmsRetriever.removeSmsListener();
        });
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

      console.log('Resend response:', response);

      setTimer(30);
      Alert.alert('OTP Sent', 'A new verification code has been sent to your number.');
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />
      {/* Header Banner */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>⚡ Fast & Secure Pay</Text>
        </View>

        <Text style={styles.title}>Verify Your Mobile</Text>
        <View style={styles.phoneRow}>
          <Text style={styles.subtitle}>OTP sent to </Text>
          <Text style={styles.phoneHighlight}>+91 {phone}</Text>
        </View>
      </View>

      {/* Main Card */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Enter 6-digit Code</Text>
        <Text style={styles.formSubtitle}>Type the verification code received via SMS</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <View key={`otp-${index}`} style={styles.inputWrapper}>
              <TextInput
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
            </View>
          ))}
        </View>

        {/* Resend timer */}
        <View style={styles.resendRow}>
          <Text style={styles.resendPrompt}>Didn't receive the code? </Text>
          <TouchableOpacity
            disabled={timer > 0}
            onPress={ResendOtp}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.resendText,
                timer > 0 ? styles.resendDisabled : styles.resendActive,
              ]}
            >
              {timer > 0 ? `Resend in (${timer}s)` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security badge */}
        <View style={styles.secureRow}>
          <Icon name="lock-outline" size={14} color={COLORS.textSecondary || '#4A5D78'} />
          <Text style={styles.secureText}>256-Bit SSL Encrypted Verification</Text>
        </View>

        {/* Verify button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.button, (loading || otp.join('').length < 6) && { opacity: 0.75 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>VERIFY & PROCEED</Text>
              <Icon name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>

      <Footer />
    </View>
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  header: {
    backgroundColor: COLORS.headerBg || '#0A2568',
    paddingTop: Platform.OS === 'ios' ? 20 : 26,
    paddingBottom: 40,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 4,
    shadowColor: COLORS.headerBg || '#0A2568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  badgeContainer: {
    backgroundColor: 'rgba(255, 122, 0, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFB703',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: 13,
    color: '#D9E7FF',
    fontWeight: '500',
  },
  phoneHighlight: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },

  /* FORM CARD */
  formCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 22,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary || '#091838',
  },
  formSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary || '#4A5D78',
    marginTop: 4,
    marginBottom: 26,
  },

  /* OTP INPUTS */
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  inputWrapper: {
    width: 44,
    height: 54,
  },
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    borderRadius: 14,
    borderWidth: 1.5,
    color: COLORS.textPrimary || '#091838',
  },
  emptyBox: {
    borderColor: COLORS.borderLight || '#D9E4F5',
    backgroundColor: COLORS.surfaceSubtle || '#F0F5FF',
  },
  filledBox: {
    borderColor: COLORS.primary || '#0D52ED',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: COLORS.primary || '#0D52ED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  /* RESEND */
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendPrompt: {
    fontSize: 13,
    color: COLORS.textSecondary || '#4A5D78',
    fontWeight: '500',
  },
  resendText: {
    fontSize: 13,
    fontWeight: '700',
  },
  resendActive: {
    color: COLORS.accent || '#FF7A00',
  },
  resendDisabled: {
    color: '#94A3B8',
  },

  /* SECURITY */
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  secureText: {
    marginLeft: 6,
    fontSize: 11,
    color: COLORS.textSecondary || '#4A5D78',
    fontWeight: '600',
  },

  /* BUTTON */
  button: {
    backgroundColor: COLORS.primary || '#0D52ED',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.primary || '#0D52ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: 'auto',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
