import React, { useState } from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import { postData } from '../API';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/actions/userActions';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';

const Register = ({ navigation }) => {
  const dispatch = useDispatch();
  const route = useRoute();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [Referal, setReferal] = useState('');
  const [emailValidity, setEmailValidity] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { phone, Otp } = route.params || {};

  const handleCheckEmail = text => {
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    setEmail(text);
    if (emailRegex.test(text.trim())) {
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
        text2: 'Please fill in first name, last name, and email.',
      });
      return;
    }

    if (!emailValidity) {
      setError('Invalid email address');
      return;
    }

    try {
      setLoading(true);
      const fcmToken = await AsyncStorage.getItem('fcmToken');

      const response = await postData(`/api/auth/user-register`, {
        phone: phone,
        otp: Otp,
        ResponseStatus: 1,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        deviceToken: fcmToken,
        referalId: Referal.trim(),
      });

      if (response?.Status === true) {
        dispatch(setUser(response));
        navigation.navigate('CreatePassword', {
          email: email.trim(),
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: response?.Remarks || response?.message || 'Something went wrong. Please try again.',
        });
      }
    } catch (err) {
      console.log('Register API Error:', err?.response?.data ?? err);
      Toast.show({
        type: 'error',
        text1: 'Registration Error',
        text2: err?.response?.data?.message || err?.message || 'Unable to complete registration',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

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
          <Text style={styles.badgeText}>❤️ Sarvana Welfare & Pay</Text>
        </View>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Enter your details to register on Sarvana All In One
        </Text>
      </View>

      {/* Main Form Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Personal Information</Text>
          <Text style={styles.formSubtitle}>
            Please provide your details as per your Aadhaar ID
          </Text>

          {/* First & Last Name row */}
          <View style={styles.nameRow}>
            <View style={styles.nameCol}>
              <Text style={styles.label}>First Name *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="First name"
                  placeholderTextColor="#94A3B8"
                  value={firstName}
                  maxLength={25}
                  onChangeText={setFirstName}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.nameCol}>
              <Text style={styles.label}>Last Name *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Last name"
                  placeholderTextColor="#94A3B8"
                  value={lastName}
                  maxLength={25}
                  onChangeText={setLastName}
                  style={styles.input}
                />
              </View>
            </View>
          </View>

          {/* Email Address */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <View
              style={[
                styles.inputContainer,
                !emailValidity && email.length > 0 && styles.inputContainerError,
              ]}
            >
              <TextInput
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="name@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={handleCheckEmail}
                style={styles.input}
              />
            </View>
            {!emailValidity && email.length > 0 && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>

          {/* Referral Code */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Referral / Sahayog ID</Text>
              <View style={styles.optionalBadge}>
                <Text style={styles.optionalText}>Optional</Text>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Enter referral ID if any"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                value={Referal}
                onChangeText={setReferal}
                style={styles.input}
              />
            </View>
          </View>

          {/* Security Guarantee Row */}
          <View style={styles.secureRow}>
            <Icon name="lock-outline" size={14} color={colors.secondary} />
            <Text style={styles.secureText}>256-Bit SSL Encrypted & OTP Protected</Text>
          </View>

          {/* Terms & Conditions */}
          <Text style={styles.termsText}>
            By continuing, you agree to Sarvana's{' '}
            <Text
              style={styles.termsLink}
              onPress={() => navigation.navigate('Termsandcondition')}
            >
              Terms of Service
            </Text>{' '}
            &{' '}
            <Text
              style={styles.termsLink}
              onPress={() => navigation.navigate('Privacypolicy')}
            >
              Privacy Policy
            </Text>
          </Text>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.button, loading && { opacity: 0.75 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>REGISTER & CONTINUE</Text>
                <Icon name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already registered? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('LogIn')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 20 : 26,
    paddingBottom: 40,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  badgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#FCE7F3',
    marginTop: 6,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  formCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 20,
    padding: 22,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  formSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  nameCol: {
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  optionalBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 6,
  },
  optionalText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  inputContainer: {
    height: 50,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 4,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    gap: 6,
  },
  secureText: {
    fontSize: 11.5,
    color: colors.secondary,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginPrompt: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '800',
  },
});
