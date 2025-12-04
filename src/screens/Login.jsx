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
//                 <Icon name="eye-slash" size={24} color={COLORS.primary} />
//               ) : (
//                 <Icon name="eye" size={24} color={COLORS.primary} />
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
//             fillColor={COLORS.primary}
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
//     borderColor: COLORS.primary,
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
//     color: COLORS.primary,
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
//   footerSpan: {color: COLORS.primary, fontSize: 16},
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
//     backgroundColor: "#122536ff",
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
//     borderColor: "#122536ff",
//     borderRadius: 8,
//     marginHorizontal: 20,
//     marginTop: 40,
//     paddingHorizontal: 10,
//     shadowColor:"#122536ff"
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
//     backgroundColor: "#122536ff",
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
} from 'react-native';
import { postData } from '../API';
import DeviceInfo from 'react-native-device-info';
// import Navigation from "../navigation/Navigation";

const BLUE = '#122536ff'; // tweak this to match your exact blue

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
    let body = {
      phone: mobile,
    };
    if (!mobile || mobile.length < 10) {
      Alert.alert('Please enter a valid mobile number');
      // errorToast('Please enter a valid mobile number');
      return;
    }
    console.log('Login request body:', body);
    const deviceToken = await DeviceInfo.getUniqueId();
    const response = await postData('api/auth/user-register', {
      phone: mobile,
      deviceToken: deviceToken,
    });
    console.log('Login request body:', response);

    if (response.Status) {
      // successToast(t('register.registerSuccess'));
      // console.log('Login successful', response.Otp);
      // Alert.alert(
      //   'Login Successful',
      //   `You have successfully logged in. ${response.Otp}`,
      //   [
      //     {
      //       text: 'OK',

      //       // navigation.goBack();
      //     },
      //   ],
      // );
      // successToast('OTP Sent Successfully', `Otp has been sent to your mobile number ${response.data.otp}`);
      // console.log(response.ResponseStatus);
      handleSendOtp(response.Otp, response.ResponseStatus);
    } else {
      // errorToast(t('register.somethingWentWrong'));
      console.log('Login failed', response);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Get Started with</Text>
        <Text style={styles.brand}>Charlie Mobile Recharge App</Text>
        <Text style={styles.subtitle}>
          Ab Har Recharge par Kamao! #Guaranteed_Cashback
        </Text>
      </View>

      {/* Input with blue-glow shadows behind it */}
      <View style={styles.inputWrapper}>
        {/* Larger, softer blue glow (further bottom-right) */}
        <View style={styles.blueShadowLarge} />

        {/* Smaller, sharper blue glow (closer) */}
        <View style={styles.blueShadowSmall} />

        {/* The actual input box */}
        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            value={mobile}
            onChangeText={setMobile}
            maxLength={10}
          />
        </View>
      </View>

      {/* Bottom button */}
      <TouchableOpacity style={styles.button} onPress={HandleLogin}>
        <Text style={styles.buttonText}>PROCEED</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: BLUE,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: { fontSize: 28, fontWeight: '600', color: '#fff', marginTop: 6 },
  brand: { fontSize: 28, fontWeight: '600', color: '#fff', marginTop: 2 },
  subtitle: { fontSize: 13, color: '#d9e7ff', marginTop: 8 },

  /* Wrapper holds absolutely positioned blue-glow views behind the input */
  inputWrapper: {
    marginTop: 40,
    marginHorizontal: 20,
    position: 'relative',
    height: 60, // controls the input's visual height
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: BLUE,
    opacity: 2,
    transform: [{ translateX: 3 }, { translateY: 3 }],
  },

  /* Foreground input on top of those glows */
  inputContainer: {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.8,
    borderColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  prefix: { fontSize: 16, fontWeight: '600', marginRight: 8, color: '#000' },
  input: { flex: 1, fontSize: 16, paddingVertical: 12, color: '#000' },

  /* Bottom full-width button */
  button: {
    backgroundColor: BLUE,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto', // push to bottom
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
