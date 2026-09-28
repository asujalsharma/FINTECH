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
//               color={'#0A2E8A'}
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
//     color: '#0A2E8A',
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
//     borderColor: '#0A2E8A',
//     borderRadius: 8,
//     textAlign: 'center',
//     fontSize: 16,
//     fontWeight: '400',
//     marginHorizontal: 4,
//   },
//   resendText: {
//     fontSize: 14,
//     color: '#0A2E8A',
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
import { useDispatch } from 'react-redux';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { postData } from '../API';
import { setUser } from '../redux/actions/userActions';
import SmsRetriever from 'react-native-sms-retriever';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OtpInput = ({ route }) => {
  const { Otp, phone, Status } = route.params;
  console.log('otp and phone', Otp, phone, Status);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits of the OTP code.');
      return;
    }

    setLoading(true);

    try {
      console.log('OTP Submitted:', fullOtp);
      const fcmToken = await AsyncStorage.getItem('fcmToken');

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
      console.log('Error verifying OTP', error?.response?.data || error);
      Alert.alert('Verification Error', 'Invalid OTP or network error. Please try again.');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListeningForOtp = async () => {
    try {
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) {
        SmsRetriever.addSmsListener(event => {
          const message = event.message;
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
    if (timer > 0) return;

    try {
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      const response = await postData('api/auth/user-register', {
        phone,
        deviceToken: fcmToken,
      });

      console.log('Resend response:', response);
      setTimer(30);
      Alert.alert('OTP Sent', 'A new verification code has been sent to your mobile number.');
    } catch (error) {
      console.log('Resend OTP error:', error);
      Alert.alert('Error', 'Unable to resend OTP. Please try again.');
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
      <StatusBar barStyle="light-content" backgroundColor="#0A2E8A" />

      {/* Header Banner */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>🔒 Secure Verification</Text>
        </View>

        <Text style={styles.title}>Verification Code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit OTP code to{' '}
          <Text style={styles.phoneHighlight}>+91 {phone}</Text>
        </Text>
      </View>

      {/* Main OTP Card */}
      <View style={styles.formCard}>
        <Text style={styles.cardInstruction}>Enter 6-digit code</Text>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputs.current[index] = ref)}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : styles.otpBoxEmpty,
              ]}
              keyboardType={Platform.OS === 'android' ? 'numeric' : 'number-pad'}
              maxLength={1}
              value={digit}
              onChangeText={text => handleChange(text, index)}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend Section */}
        <View style={styles.resendWrapper}>
          <Text style={styles.resendPrompt}>Didn't receive code?</Text>
          <TouchableOpacity
            disabled={timer > 0}
            onPress={ResendOtp}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.resendLink,
                timer > 0 && styles.resendLinkDisabled,
              ]}
            >
              {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Floating Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.verifyBtn,
            otp.join('').length === 6 ? styles.verifyBtnActive : styles.verifyBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.verifyBtnText}>VERIFY & CONTINUE</Text>
              <Icon name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },

  /* HEADER */
  header: {
    backgroundColor: '#0A2E8A',
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 6,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#BFDBFE',
    marginTop: 6,
    lineHeight: 19,
  },
  phoneHighlight: {
    fontWeight: '800',
    color: '#FFF',
  },

  /* FORM CARD */
  formCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 24,
    padding: 22,
    elevation: 6,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  cardInstruction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    borderWidth: 1.5,
  },
  otpBoxEmpty: {
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  otpBoxFilled: {
    borderColor: '#0A2E8A',
    backgroundColor: '#EEF2FF',
  },

  resendWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  resendPrompt: {
    fontSize: 13,
    color: '#334155',
    marginRight: 6,
    fontWeight: '500',
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A2E8A',
  },
  resendLinkDisabled: {
    color: '#475569',
    fontWeight: '600',
  },

  /* BOTTOM BAR */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 10,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  verifyBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  verifyBtnActive: {
    backgroundColor: '#0A2E8A',
    shadowColor: '#0A2E8A',
  },
  verifyBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
  },
  verifyBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
