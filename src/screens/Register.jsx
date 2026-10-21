import React, { useState } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { postData } from '../API';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/actions/userActions';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BLUE = '#85daff';

const Register = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const phone = route?.params?.phone || '';
  const Otp = route?.params?.Otp || '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [referral, setReferral] = useState('');
  const [emailValidity, setEmailValidity] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckEmail = text => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setEmail(text);
    if (!text || emailRegex.test(text.trim())) {
      setEmailValidity(true);
      setError('');
    } else {
      setEmailValidity(false);
      setError('Please enter a valid email address');
    }
  };

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Please fill in all required fields');
      Toast.show({
        type: 'error',
        text1: 'Required Fields',
        text2: 'Please enter your first name, last name, and email.',
      });
      return;
    }

    if (!emailValidity) {
      setError('Invalid email address');
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
      });
      return;
    }

    try {
      setLoading(true);
      setError('');
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      console.log('Register screen sending FCM token:', fcmToken);

      const response = await postData('/api/auth/user-register', {
        phone: phone,
        otp: Otp,
        ResponseStatus: 1,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        deviceToken: fcmToken,
        referalId: referral.trim(),
      });

      console.log('Register Response →', response);

      if (response?.Status === true) {
        dispatch(setUser(response));
        navigation.navigate('CreatePassword', {
          email: email.trim(),
        });
      } else {
        const errorMsg =
          response?.Remarks || response?.Message || response?.data?.message || 'Something went wrong';
        setError(errorMsg);
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: errorMsg,
        });
      }
    } catch (err) {
      console.log('Register API Error:', err?.response?.data ?? err);
      const errorMsg = err?.response?.data?.message || 'Unable to connect to server. Please try again.';
      setError(errorMsg);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />

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
          <Text style={styles.badgeText}>📝 Quick Registration</Text>
        </View>

        <Text style={styles.title}>Register</Text>
        <Text style={styles.subtitle}>
          Create your account to start seamless payments
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Form Card */}
          <View style={styles.formCard}>
            {/* Name Fields Row */}
            <View style={styles.row}>
              {/* First Name */}
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>First Name *</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.iconCircle}>
                    <Icon name="person" size={18} color={BLUE} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="First name"
                    placeholderTextColor="#94A3B8"
                    value={firstName}
                    maxLength={20}
                    onChangeText={setFirstName}
                  />
                </View>
              </View>

              {/* Last Name */}
              <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Last Name *</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.iconCircle}>
                    <Icon name="person-outline" size={18} color={BLUE} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Last name"
                    placeholderTextColor="#94A3B8"
                    value={lastName}
                    maxLength={20}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <View
                style={[
                  styles.inputContainer,
                  !emailValidity && styles.inputContainerError,
                ]}
              >
                <View style={styles.iconCircle}>
                  <Icon name="email" size={18} color={BLUE} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={handleCheckEmail}
                />
              </View>
              {!emailValidity && error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}
            </View>

            {/* Referral Code */}
            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Referral Code</Text>
                <Text style={styles.optionalBadge}>Optional</Text>
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.iconCircle}>
                  <Icon name="card-giftcard" size={18} color={BLUE} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter referral code (if any)"
                  placeholderTextColor="#94A3B8"
                  value={referral}
                  autoCapitalize="characters"
                  onChangeText={setReferral}
                />
              </View>
            </View>

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('LogIn')}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>

            {/* Terms and conditions */}
            <View style={styles.termsWrapper}>
              <Icon name="verified-user" size={16} color="#059669" style={{ marginRight: 6 }} />
              <Text style={styles.termsText}>
                By registering, you accept our{' '}
                <Text
                  style={styles.link}
                  onPress={() => navigation.navigate('Termsandcondition')}
                >
                  Terms & Conditions
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.link}
                  onPress={() => navigation.navigate('Privacypolicy')}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.8 }]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>REGISTER</Text>
                  <Icon
                    name="arrow-forward"
                    size={20}
                    color="#FFF"
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },

  /* HEADER */
  header: {
    backgroundColor: BLUE,
    paddingTop: Platform.OS === 'ios' ? 12 : 18,
    paddingBottom: 36,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 6,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
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
    marginTop: 4,
    lineHeight: 18,
    fontWeight: '500',
  },

  /* CONTENT */
  scrollContent: {
    paddingBottom: 30,
  },

  /* FORM CARD */
  formCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -18,
    borderRadius: 24,
    padding: 20,
    elevation: 6,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  inputWrapper: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  optionalBadge: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    height: 50,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },

  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  loginText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 13,
    color: BLUE,
    fontWeight: '700',
  },

  termsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    fontWeight: '500',
  },
  link: {
    color: BLUE,
    fontWeight: '700',
  },

  /* BUTTON */
  button: {
    height: 52,
    backgroundColor: BLUE,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
