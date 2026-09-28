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
  StatusBar,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DeviceInfo from 'react-native-device-info';
import { useNavigation } from '@react-navigation/native';
import { postData } from '../API';

const { width } = Dimensions.get('window');
const BLUE = '#0A2E8A';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigation = useNavigation();

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
      setLoading(true);
      const deviceToken = await DeviceInfo.getUniqueId();
      console.log('Login request body:', { phone: mobile, deviceToken });

      const response = await postData('api/auth/user-register', {
        phone: mobile,
        deviceToken: deviceToken,
      });
      console.log('Login response:', response);

      if (response && response.Status) {
        handleSendOtp(response.Otp, response.ResponseStatus);
      } else {
        console.log('Login failed:', response);
        Alert.alert(
          'Error',
          response?.Message || response?.Remarks || 'Login failed. Please try again.',
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Error',
        error?.message || 'Unable to connect to server. Please check your internet connection.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        enabled={Platform.OS === 'ios'}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="always"
        >
          {/* Header Visual Banner */}
          <View style={styles.header}>
            <View style={styles.headerGlowCircle} />

            {/* Logo Badge */}
            <View style={styles.logoBadgeContainer}>
              <View style={styles.logoWrapper}>
                <FastImage
                  source={require('../Assets/playstore-icon.png')}
                  style={styles.logo}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
              <View style={styles.badgePill}>
                <Icon name="bolt" size={14} color="#FBBF24" />
                <Text style={styles.badgeText}>Instant & Secure</Text>
              </View>
            </View>

            {/* Brand Title */}
            <Text style={styles.titleWelcome}>Welcome to</Text>
            <Text style={styles.brandTitle}>Online Adda</Text>
            <Text style={styles.brandSubtitle}>
              Har Ghar Digital • Instant Recharge & Bill Pay
            </Text>
          </View>

          {/* Main Card Container */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrap}>
                <Icon name="phone-iphone" size={22} color={BLUE} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.cardTitle}>Mobile Verification</Text>
                <Text style={styles.cardSubtitle}>
                  Enter 10-digit number to login or sign up
                </Text>
              </View>
            </View>

            {/* Phone Input Box */}
            <View
              style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
                mobile.length === 10 && styles.inputContainerValid,
              ]}
            >
              <View style={styles.countryCodeBadge}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
                <View style={styles.codeDivider} />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                placeholderTextColor="#64748B"
                keyboardType={Platform.OS === 'android' ? 'numeric' : 'number-pad'}
                value={mobile}
                onChangeText={setMobile}
                maxLength={10}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />

              {mobile.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setMobile('')}
                  activeOpacity={0.7}
                >
                  <Icon name="close" size={16} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            {/* Trust highlights */}
            <View style={styles.trustBadgesRow}>
              <View style={styles.trustBadge}>
                <Icon name="verified-user" size={14} color="#059669" />
                <Text style={styles.trustText}>RBI Regulated</Text>
              </View>
              <View style={styles.trustDot} />
              <View style={styles.trustBadge}>
                <Icon name="flash-on" size={14} color="#2563EB" />
                <Text style={styles.trustText}>Fast OTP</Text>
              </View>
              <View style={styles.trustDot} />
              <View style={styles.trustBadge}>
                <Icon name="lock" size={14} color="#7C3AED" />
                <Text style={styles.trustText}>256-Bit SSL</Text>
              </View>
            </View>

            {/* Proceed Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.button,
                mobile.length === 10 ? styles.buttonActive : styles.buttonInactive,
                loading && { opacity: 0.8 },
              ]}
              onPress={HandleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>PROCEED TO VERIFY</Text>
                  <Icon name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Value Features Strip */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresHeading}>Everything you need in one app</Text>

            <View style={styles.featureCardsRow}>
              <View style={styles.featureCard}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#EEF2FF' }]}>
                  <MaterialCommunityIcons name="cellphone-wireless" size={24} color={BLUE} />
                </View>
                <Text style={styles.featureTitle}>Mobile & DTH</Text>
                <Text style={styles.featureDesc}>Instant cashbacks & best offers</Text>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#ECFDF5' }]}>
                  <MaterialCommunityIcons name="lightning-bolt" size={24} color="#059669" />
                </View>
                <Text style={styles.featureTitle}>Bill Payments</Text>
                <Text style={styles.featureDesc}>Electricity, Fastag, Water & Gas</Text>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialCommunityIcons name="wallet-outline" size={24} color="#D97706" />
                </View>
                <Text style={styles.featureTitle}>Safe Wallet</Text>
                <Text style={styles.featureDesc}>Zero fail UPI & 1-click checkout</Text>
              </View>
            </View>
          </View>

          {/* Legal and Assurance Footer */}
          <View style={styles.footerSection}>
            <Text style={styles.termsText}>
              By proceeding, you agree to our{' '}
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

            <View style={styles.secureAssuranceRow}>
              <Icon name="shield" size={16} color="#059669" />
              <Text style={styles.secureAssuranceText}>
                100% Safe & Secure Payments by Online Adda
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },
  scrollContainer: {
    paddingBottom: 30,
  },

  /* HEADER */
  header: {
    backgroundColor: BLUE,
    paddingTop: Platform.OS === 'ios' ? 16 : 28,
    paddingBottom: 48,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  headerGlowCircle: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoWrapper: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  titleWelcome: {
    fontSize: 18,
    fontWeight: '500',
    color: '#BFDBFE',
    letterSpacing: 0.5,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#E0E7FF',
    marginTop: 6,
    fontWeight: '500',
    opacity: 0.95,
  },

  /* MAIN CARD */
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -26,
    borderRadius: 26,
    padding: 22,
    elevation: 8,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#334155',
    marginTop: 2,
    fontWeight: '600',
  },

  /* INPUT */
  inputContainer: {
    height: 58,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  inputContainerFocused: {
    borderColor: BLUE,
    backgroundColor: '#FFFFFF',
  },
  inputContainerValid: {
    borderColor: '#059669',
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  flag: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  codeDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    paddingHorizontal: 8,
    letterSpacing: 1,
  },
  clearButton: {
    padding: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
  },

  /* TRUST BADGES */
  trustBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginLeft: 4,
  },
  trustDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },

  /* BUTTON */
  button: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  buttonActive: {
    backgroundColor: BLUE,
    shadowColor: BLUE,
  },
  buttonInactive: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  /* FEATURES SECTION */
  featuresSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  featuresHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  featureCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 48) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    elevation: 2,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 9.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 13,
    fontWeight: '600',
  },

  /* FOOTER */
  footerSection: {
    marginTop: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  termsLink: {
    color: BLUE,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  secureAssuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  secureAssuranceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
    marginLeft: 6,
  },
});
