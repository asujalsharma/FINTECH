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
//               color={COLORS.primary}
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
//     color: COLORS.primary,
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
//     borderColor: COLORS.primary,
//     borderRadius: 8,
//     textAlign: 'center',
//     fontSize: 16,
//     fontWeight: '400',
//     marginHorizontal: 4,
//   },
//   resendText: {
//     fontSize: 14,
//     color: COLORS.primary,
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
  SafeAreaView,
  Alert,
} from 'react-native';
import { postData } from '../API';
import { setUser } from '../redux/actions/userActions';
import DeviceInfo from 'react-native-device-info';
import SmsRetriever from 'react-native-sms-retriever';
import AsyncStorage from '@react-native-async-storage/async-storage';
import localStorage from 'redux-persist/es/storage';
import LinearGradient from 'react-native-linear-gradient';

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
  //  const HandleOTP = () => {
  //    navigation.navigate('PersonalInfoScreen')
  //  }

  const handleSubmit = async () => {
    console.log('hello');
    const fullOtp = otp.join('');
    console.log(fullOtp);
    // if (fullOtp.toString() !== Otp.toString()) {
    //   console.log('sujalll');
    //   Alert.alert('Incorrect OTP', 'Please try again.');
    //   return;
    // }

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

      // ✅ Check success (depends on your API keys)
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
        Alert.alert('Invalid OTP Please Try again with Correct OTP');
      }

      // ✅ If OTP is wrong or failed
      console.log(
        'OTP Verification Failed',
        'The OTP you entered is incorrect.',
      );
    } catch (error) {
      console.log('Error verifying OTP', error.response.data);
      Alert.alert('Invalid OTP Please Try again with Correct OTP');
      Alert.alert('Error', 'Something went wrong. Please try again later.');
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
        phone, // FIXED
        deviceToken: fcmToken,
      });

      console.log('Resend response:', response);

      // restart timer
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
  {/* 🔥 Gradient Header */}
  <LinearGradient
    colors={[COLORS.primary, COLORS.secondary]}
    style={styles.header}
  >
    <Text style={styles.title}>Verify OTP</Text>
    <Text style={styles.subtitle}>
      OTP Sent to +91 {phone}
    </Text>
  </LinearGradient>

  {/* 💳 Floating Card */}
  <View style={styles.card}>
    <Text style={styles.label}>Enter 6-digit code</Text>

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
    <TouchableOpacity disabled={timer > 0} onPress={ResendOtp}>
      <Text style={styles.resend}>
        {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
      </Text>
    </TouchableOpacity>

    {/* Verify button */}
    <TouchableOpacity
      style={[
        styles.button,
        otp.join('').length < 6 && { opacity: 0.5 },
      ]}
      disabled={otp.join('').length < 6}
      onPress={handleSubmit}
    >
      <Text style={styles.buttonText}>VERIFY</Text>
    </TouchableOpacity>
  </View>
</SafeAreaView>
  );
};

export default OtpInput;

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

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },

  subtitle: {
    fontSize: 14,
    color: '#FFE9DF',
    marginTop: 8,
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
    marginBottom: 16,
    color: '#333',
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  otpInput: {
    width: 48,
    height: 58,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    borderWidth: 1.5,
  },

  emptyBox: {
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },

  filledBox: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF4EE',
  },

  resend: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 20,
    textAlign: 'right',
    fontWeight: '600',
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
