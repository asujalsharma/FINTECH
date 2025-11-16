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

const BLUE = '#007bff';

const OtpInput = ({ route }) => {
  const { Otp, phone, Status } = route.params;
  console.log('otp and phone', Otp, phone, Status);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
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

    if (fullOtp.toString() !== Otp.toString()) {
      console.log('sujalll');
      errorToast('Incorrect OTP', 'Please try again.');
      return;
    }

    setLoading(true);

    try {
      console.log('OTP Submitted:', fullOtp);
      const deviceToken = await DeviceInfo.getUniqueId();
      const response = await postData('api/auth/user-register', {
        phone,
        otp: fullOtp,
        ResponseStatus: Status,
        deviceToken: deviceToken,
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

        Alert.alert('Login Successful');

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          }),
        );

        return;
      }

      // ✅ If OTP is wrong or failed
      console.log(
        'OTP Verification Failed',
        'The OTP you entered is incorrect.',
      );
    } catch (error) {
      console.log('Error verifying OTP', error);
      errorToast('Something went wrong', 'Please try again later.');
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

  const handleChange = (text: string, index: number) => {
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

  const autoFillOtp = otpCode => {
    const otpArray = otpCode.split('');
    setOtp(otpArray);

    setTimeout(() => {
      handleSubmit();
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Enter OTP to verify</Text>
        <Text style={styles.title}>Your Number</Text>
        <Text style={styles.subtitle}>OTP Sent to {phone}</Text>
      </View>

      {/* OTP Inputs */}

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <View key={index} style={styles.inputWrapper}>
            <View key={index} style={styles.blueShadowLarge} />
            <View key={index} style={styles.blueShadowSmall} />
            <TextInput
              key={index}
              // ref={(ref) => (inputs.current[index] = ref!)}
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
      <TouchableOpacity disabled={timer > 0}>
        <Text style={styles.resend}>
          {timer > 0 ? `Resend in (${timer}s)` : 'Resend OTP →'}
        </Text>
      </TouchableOpacity>

      {/* OTP Sent Chip */}
      {/* <View style={styles.chip}>
        <Text style={styles.chipText}>⚡ OTP Sent</Text>
      </View> */}

      {/* Verify button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>VERIFY</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f8ff' },
  header: {
    backgroundColor: BLUE,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginTop: 6 },
  subtitle: { fontSize: 13, color: '#d9e7ff', marginTop: 8 },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 40,
  },
  otpInput: {
    width: 45,
    height: 55,
    textAlign: 'center',
    fontSize: 20,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  emptyBox: {
    borderColor: BLUE,
    backgroundColor: '#fff',
  },
  filledBox: {
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  resend: {
    fontSize: 14,
    color: BLUE,
    textAlign: 'right',
    marginTop: 20,
    marginRight: 20,
    fontWeight: '600',
  },
  chip: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  chipText: { fontSize: 14, fontWeight: '600', color: '#333' },

  button: {
    backgroundColor: BLUE,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  /* Wrapper holds absolutely positioned blue-glow views behind the input */
  inputWrapper: {
    marginTop: 40,
    // marginHorizontal: 20,
    position: 'relative',
    height: 55, // controls the input's visual height
    // iOS additional soft shadow (colored)
    ...Platform.select({
      ios: {
        shadowColor: BLUE,
        shadowOffset: { width: 4, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        // keep elevation small — the colored glow is handled by the fake views
        elevation: 0,
      },
    }),
  },

  /* Big faint blue glow (further offset) */
  blueShadowLarge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: BLUE,
    opacity: 0.12,
    transform: [{ translateX: 3 }, { translateY: 3 }],
  },

  /* Smaller faint blue glow (closer offset) */
  blueShadowSmall: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: BLUE,
    opacity: 2,
    transform: [{ translateX: 3 }, { translateY: 3 }],
  },
});
