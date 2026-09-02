// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   TouchableOpacity,
// } from 'react-native';
// import React, {useState} from 'react';
// import axios from 'axios';
// import BouncyCheckbox from 'react-native-bouncy-checkbox';
// import COLORS from '../constants/colors';
// import Button from '../components/Button';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {URL} from '../constants/URL';

// export default function Login({navigation}) {
//   const [ispasswordShown, setIsPasswordShown] = useState(true);
//   const [password, setPassword] = useState('');
//   const [email, setEmail] = useState('');

//   const [emailValidity, setEmailValidity] = useState(true);
//   const [passwordValidity, setPassswordValidity] = useState(true);
//   const [error, setError] = useState('');
//   const handleCheckEmail = text => {
//     const emailRegex =
//       /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//     setEmail(text);
//     if (emailRegex.test(text)) {
//       setEmailValidity(true);
//     } else {
//       setEmailValidity(false);
//       setError('Invalid Email');
//     }
//   };

//   const handleCheckPassword = value => {
//     const isNoWhiteSpace = /^\S+$/;
//     if (!isNoWhiteSpace.test(value)) {
//       setPassswordValidity(false);
//       setError('Password must not contain Whitespaces.');
//     } else {
//       setPassswordValidity(true);
//       setPassword(value);
//     }
//   };

//   const handleSubmit = async () => {
//     try {
//       const response = await axios.post(`${URL}/api/login`, {
//         email: email,
//         password: password,
//       });
//       if (response.data.success === true) {
//         if (response.data.token) {
//           await AsyncStorage.multiSet([
//             ['token', response.data.token],
//             ['email', email],
//           ]);

//           navigation.navigate('Home', {email, id: response.data.id});
//         }
//       } else if (response.data.success === false) {
//         setError('Invalid Email or Password');
//       }
//     } catch (error) {
//       console.log(error);
//       setError('Invalid Email or Password');
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="chevron-left" size={24} color={COLORS.black} />
//         </TouchableOpacity>
//         <Text style={styles.headertitle}>Login</Text>
//       </View>
//       <View style={styles.form}>
//         <View style={styles.inputContainer}>
//           <Text style={styles.label}>Email</Text>
//           <View style={styles.input}>
//             <TextInput
//               onChangeText={text => {
//                 handleCheckEmail(text);
//               }}
//               placeholder=""
//               value={email}
//               style={{width: '100%'}}
//             />
//           </View>
//           {!emailValidity ? <Text style={styles.errorStyle}>{error}</Text> : ''}
//         </View>
//         <View style={styles.inputContainer}>
//           <Text style={styles.label}>Password</Text>
//           <View style={styles.input}>
//             <TextInput
//               secureTextEntry={ispasswordShown}
//               style={{width: '100%'}}
//               onChangeText={text => {
//                 handleCheckPassword(text);
//               }}
//             />
//             <TouchableOpacity
//               onPress={() => setIsPasswordShown(!ispasswordShown)}
//               style={{
//                 position: 'absolute',
//                 right: 12,
//                 top: 10,
//               }}>
//               {ispasswordShown == true ? (
//                 <Icon name="eye-slash" size={24} color={'#471d7d'} />
//               ) : (
//                 <Icon name="eye" size={24} color={'#471d7d'} />
//               )}
//             </TouchableOpacity>
//           </View>
//           {!passwordValidity ? (
//             <Text style={styles.errorStyle}>{error}</Text>
//           ) : (
//             ''
//           )}
//         </View>

//         <View style={styles.formFooter}>
//           {/* <BouncyCheckbox
//             size={25}
//             fillColor={'#471d7d'}
//             iconStyle={{borderRadius: 4}}
//             text="remember me"
//             textStyle={{textDecorationLine: 'none', marginHorizontal: 0}}
//             unfillColor="#FFFFFF"
//             innerIconStyle={{borderWidth: 2, borderRadius: 4}}
//             onPress={()=> setChecked(!checked)}
//           /> */}
//           <TouchableOpacity
//             onPress={() => navigation.navigate('ForgetPassword')}>
//             <Text style={styles.forgetPassword}>Forget Password</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//       <Button
//         style={styles.loginBtn}
//         title="Login"
//         filled
//         onpress={handleSubmit}
//       />

//       <View style={styles.footer}>
//         <Text style={styles.footerText}>Don't have an account? </Text>
//         <TouchableOpacity onPress={() => navigation.navigate('Register')}>
//           <Text style={styles.footerSpan}>Sign up</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     marginHorizontal: 22,
//     marginTop: 22,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     justifyContent: 'center',
//   },
//   headertitle: {
//     color: COLORS.black,
//     fontSize: 24,
//     fontWeight: '600',
//     marginHorizontal: '35%',
//   },
//   form: {
//     marginTop: 100,
//     marginHorizontal: 15,
//   },
//   inputContainer: {
//     marginBottom: 25,
//   },
//   label: {
//     color: COLORS.black,
//     fontSize: 16,
//     fontWeight: '400',
//     marginBottom: 4,
//   },
//   input: {
//     borderColor: '#471d7d',
//     borderWidth: 2,
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   errorStyle: {
//     textAlign: 'right',
//     color: COLORS.warning,
//     fontWeight: '500',
//     marginTop: 2,
//   },
//   prefix: {
//     color: COLORS.black,
//     fontSize: 16,
//     opacity: 0.5,
//   },
//   formFooter: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//   },
//   forgetPassword: {
//     color: '#471d7d',
//     fontSize: 16,
//     opacity: 0.8,
//     fontWeight: '400',
//     justifyContent: 'flex-end',
//   },
//   loginBtn: {
//     marginTop: 240,
//     marginHorizontal: 15,
//     marginBottom: 20,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   footerText: {
//     color: COLORS.black,
//     fontSize: 16,
//   },
//   footerSpan: {color: '#471d7d', fontSize: 16},
// });

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
// } from "react-native";

// const Login = () => {
//   const [mobile, setMobile] = useState("");

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header Section */}
//       <View style={styles.header}>
//         <Text style={styles.title}>Get Started with</Text>
//         <Text style={styles.brand}>BillBuzz</Text>
//         <Text style={styles.subtitle}>
//           Ab Har Recharge par Kamao! #Guaranteed_Cashback
//         </Text>
//       </View>

//       {/* Input Section */}
//       <View style={styles.inputContainer}>
//         <Text style={styles.prefix}>+91</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Mobile Number"
//           placeholderTextColor="#999"
//           keyboardType="number-pad"
//           value={mobile}
//           onChangeText={setMobile}
//           maxLength={10}
//         />
//       </View>

//       {/* Button Section */}
//       <TouchableOpacity style={styles.button}>
//         <Text style={styles.buttonText}>PROCEED</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// };

// export default Login;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   header: {
//     backgroundColor: "#007bff",
//     paddingVertical: 30,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 0,
//     borderBottomRightRadius: 0,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "600",
//     color: "#fff",
//   },
//   brand: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#fff",
//     marginTop: 5,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "#d9e7ff",
//     marginTop: 10,
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1.2,
//     borderColor: "#007bff",
//     borderRadius: 8,
//     marginHorizontal: 20,
//     marginTop: 40,
//     paddingHorizontal: 10,
//     shadowColor:"#007bff"
//   },
//   prefix: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginRight: 5,
//     color: "#000",
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 12,
//     color: "#000",
//   },
//   button: {
//     backgroundColor: "#007bff",
//     paddingVertical: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: "auto",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  StatusBar
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { postData } from '../API/index';
import Footer from '../components/Footer';

const BLUE = '#471d7d'; // tweak this to match your exact blue


export default function Login() {
  const [mobile, setMobile] = useState('');
  const navigation = useNavigation();

  // const HandleLogin = () => {
  //   navigation.navigate('OtpInput')
  // }
  const handleSendOtp = (OTP, Status) => {
    navigation.navigate('OtpInput', {
      Otp: OTP,
      phone: mobile,
      Status: Status,
    });
  };

  const HandleLogin = async () => {
    if (!mobile || mobile.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }
    try {
      const deviceToken = await DeviceInfo.getUniqueId();
      const response = await postData('api/auth/user-register', {
        phone: mobile,
        deviceToken: deviceToken,
      });
      console.log('Login response:', response);

      if (response.Status) {
        handleSendOtp(response.Otp, response.ResponseStatus);
      } else {
        Alert.alert('Error', response?.Message || 'Something went wrong. Please try again.');
        console.log('Login failed', response);
      }
    } catch (error) {
      console.error('HandleLogin error:', error);
      Alert.alert('Error', 'Unable to connect. Please check your internet and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#471d7d" />
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>⚡ Fast & Secure Pay</Text>
        </View>
        <Text style={styles.title}>Get Started with</Text>
        <Text style={styles.brand}>AydsPay</Text>
        <Text style={styles.subtitle}>
          Ab Har Recharge par Kamao! #Guaranteed_Cashback
        </Text>
      </View>

      {/* Main Form Content */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Enter your mobile number</Text>
        <Text style={styles.formSubtitle}>We will send you a 4-digit verification code</Text>

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <View style={styles.prefixBadge}>
              <Text style={styles.prefix}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="10-digit Mobile Number"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={mobile}
              onChangeText={setMobile}
              maxLength={10}
            />
          </View>
        </View>
      </View>

      {/* Bottom Action Area */}
      <View style={styles.bottomArea}>
        <Text style={styles.termsText}>
          By continuing, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> & <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
        <TouchableOpacity activeOpacity={0.85} style={styles.button} onPress={HandleLogin}>
          <Text style={styles.buttonText}>PROCEED TO VERIFY</Text>
        </TouchableOpacity>
      </View>
      <Footer />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },

  header: {
    backgroundColor: '#471d7d',
    paddingTop: Platform.OS === 'ios' ? 20 : 30,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: { fontSize: 24, fontWeight: '500', color: '#E2E8F0' },
  brand: { fontSize: 34, fontWeight: '800', color: '#FFF', marginTop: 2, letterSpacing: 0.5 },
  subtitle: { fontSize: 13, color: '#D9E7FF', marginTop: 8, opacity: 0.9 },

  formCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 22,
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  formSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
  },
  inputWrapper: {
    height: 56,
  },
  inputContainer: {
    height: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#471d7d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  prefixBadge: {
    backgroundColor: '#EDE7F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 10,
  },
  prefix: { fontSize: 16, fontWeight: '700', color: '#471d7d' },
  input: { flex: 1, fontSize: 16, fontWeight: '600', color: '#0F172A' },

  bottomArea: {
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  termsText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: '#471d7d',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#58007b',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#58007b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});

