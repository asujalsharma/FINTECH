import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRoute, useNavigation } from '@react-navigation/native';
import { postData } from '../API';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/actions/userActions';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';


const Register = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [Referal, setReferal] = useState('');
  const [emailValidity, setEmailValidity] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const { phone, Otp, userData } = route.params || {};

  useEffect(() => {
    if (userData) {
      // If we have userData from OTP screen (existing user), pre-fill form
      // Note: This assumes userData structure has firstName, lastName, email
      if (userData.firstName) setFirstName(userData.firstName);
      if (userData.lastName) setLastName(userData.lastName);
      if (userData.email) {
        setEmail(userData.email);
        handleCheckEmail(userData.email);
      }
      // If user is existing, we might want to auto-login? But user wanted Register screen.
      // So we pre-fill and let them click 'Register' (which will fail with 400 and then login).
    }
  }, [userData]);

  const handleCheckEmail = text => {
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setEmail(text);
    setEmailValidity(emailRegex.test(text));
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email) {
      Alert.alert('Missing Fields', 'Please fill all required fields');
      return;
    }
    if (!emailValidity) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    if (!isChecked) {
      Alert.alert('Terms & Conditions', 'Please accept the Terms & Conditions to register.');
      return;
    }

    setLoading(true);
    try {
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      const response = await postData(`api/auth/user-register`, {
        phone: phone,
        otp: Otp,
        ResponseStatus: 1,
        firstName: firstName,
        lastName: lastName,
        email: email,
        deviceToken: fcmToken,
        referalId: Referal,
      });

      if (response?.Status === true) {
        dispatch(setUser(response));
        navigation.navigate('CreatePassword', { email });
      } else {
        Alert.alert('Registration Failed', response?.message || 'Something went wrong');
      }
    } catch (err) {
      console.log('Register API Error:', err);
      // If user aleady exists (400) and we have userData, fallback to login
      if (err.response?.status === 400 && userData && userData.Status) {
        Toast.show({
          type: 'info',
          text1: 'User already exists',
          text2: 'Logging you in...',
        });
        dispatch(
          setUser({
            ...userData,
            firstName: firstName,
            lastName: lastName,
            email: email,
          }),
        );
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        return;
      }

      const msg = err.response?.data?.message || err.response?.data?.Remarks || 'Something went wrong. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0A237A', '#1756C5', '#4285F4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.bg}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A237A" />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* White Card */}
          <View style={styles.card}>

            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.subtitleText}>Sign up to get started</Text>
            </View>

            {/* Name Row */}
            <View style={styles.row}>
              <View style={styles.slCol}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor="#bbb"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={styles.slCol}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor="#bbb"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                placeholderTextColor="#bbb"
                keyboardType="email-address"
                value={email}
                onChangeText={handleCheckEmail}
              />
              {!emailValidity && <Text style={styles.errorText}>Invalid Email</Text>}
            </View>

            {/* Referral */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Referral Code (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Code"
                placeholderTextColor="#bbb"
                value={Referal}
                onChangeText={setReferal}
              />
            </View>

            <View style={styles.loginLink}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text style={styles.link} onPress={() => navigation.navigate('LogIn')}>Login</Text>
              </Text>
            </View>

            {/* Terms Checkbox */}
            <View style={styles.termsContainer}>
              <TouchableOpacity onPress={() => setIsChecked(!isChecked)} style={styles.checkbox}>
                <Icon
                  name={isChecked ? "check-square" : "square-o"}
                  size={22}
                  color="#1756C5"
                />
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.navigate('TermsandCondition')}
                >
                  Terms & Conditions
                </Text>
              </Text>
            </View>

            {/* Submit Button */}
            <LinearGradient
              colors={['#1756C5', '#4285F4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <TouchableOpacity onPress={handleRegister} style={styles.btn} disabled={loading}>
                <Text style={styles.btnText}>{loading ? 'Registering...' : 'REGISTER'}</Text>
              </TouchableOpacity>
            </LinearGradient>

          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  headerContainer: { alignItems: 'center', marginBottom: 24 },
  welcomeText: { fontSize: 24, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  subtitleText: { fontSize: 14, color: '#666' },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  slCol: { width: '48%' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: {
    backgroundColor: '#FAFBFF',
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12, // Fixed height feel
    fontSize: 15,
    color: '#1A1A2E',
  },
  errorText: { color: 'red', fontSize: 11, marginTop: 4, textAlign: 'right' },

  loginLink: { alignItems: 'center', marginBottom: 20 },
  loginText: { fontSize: 14, color: '#333' },
  link: { color: '#1756C5', fontWeight: 'bold' },

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align start for multiline text
    marginBottom: 20,
    marginTop: 10,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2, // Align with text top
  },
  termsText: { flex: 1, fontSize: 13, color: '#333', lineHeight: 18 },
  linkText: { color: '#1756C5', textDecorationLine: 'underline', fontWeight: 'bold' },

  btnGradient: { borderRadius: 14 },
  btn: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
});

export default Register;
