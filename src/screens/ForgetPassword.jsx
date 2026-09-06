import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  StatusBar,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import COLORS from '../constants/colors';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { postData } from '../API';
import Footer from '../components/Footer';

export default function ForgetPassword() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const reduxUser = useSelector(state => state.user);
  const isLoggedIn = useSelector(state => state.isLoggedIn);
  const token = reduxUser?.AccessToken;

  const [otp, setOtp] = useState('');
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [isMpinVisible, setIsMpinVisible] = useState(false);
  const [isConfirmMpinVisible, setIsConfirmMpinVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // 1️⃣ Guard: If no token or user details, immediately move to Login
  useEffect(() => {
    if (!isLoggedIn || !token || typeof token !== 'string' || token.trim() === '') {
      console.warn('No token or user details found on Forget MPIN. Moving to login...');
      dispatch({ type: 'LOGOUT' });
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'LogIn' }],
        }),
      );
    }
  }, [isLoggedIn, token, dispatch, navigation]);

  // 2️⃣ Request OTP on mount
  useEffect(() => {
    if (token) {
      sendForgotOtp();
    }
  }, [token]);

  // 3️⃣ Countdown timer for Resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const sendForgotOtp = async () => {
    try {
      setResending(true);
      const res = await postData('api/user/mpin-forgot', {});
      console.log('mpin-forgot response:', res);
      if (res?.Status) {
        Alert.alert('OTP Sent', res?.Remarks || 'Verification OTP sent to your registered mobile number.');
        setResendTimer(30);
      } else {
        Alert.alert('Error', res?.Remarks || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Error sending forgot MPIN OTP:', err);
      const remarks = (err?.response?.data?.Remarks || err?.response?.data?.message || '').toLowerCase();
      if (err?.response?.status === 401 || remarks.includes('token') || remarks.includes('unauthorized')) {
        dispatch({ type: 'LOGOUT' });
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'LogIn' }],
          }),
        );
      } else {
        Alert.alert('Error', err?.response?.data?.Remarks || err?.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  // 4️⃣ Verify OTP & Set New MPIN
  const handleUpdateMPIN = async () => {
    if (!otp.trim() || otp.trim().length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the verification code sent to your phone.');
      return;
    }

    if (!mpin || !/^[0-9]{4}$/.test(mpin.trim())) {
      Alert.alert('Invalid MPIN', 'New MPIN must be exactly 4 digits.');
      return;
    }

    if (mpin.trim() !== confirmMpin.trim()) {
      Alert.alert('MPIN Mismatch', 'New MPIN and Confirm MPIN do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await postData('api/user/mpin-verify-otp', {
        otp: otp.trim(),
        newMpin: mpin.trim(),
      });
      console.log('mpin-verify-otp response:', res);

      if (res?.Status) {
        Alert.alert('Success', res?.Remarks || 'Your MPIN has been updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Failed', res?.Remarks || 'Invalid OTP or unable to update MPIN.');
      }
    } catch (err) {
      console.error('Error verifying MPIN OTP:', err);
      const remarks = (err?.response?.data?.Remarks || err?.response?.data?.message || '').toLowerCase();
      if (err?.response?.status === 401 || remarks.includes('token') || remarks.includes('unauthorized')) {
        dispatch({ type: 'LOGOUT' });
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'LogIn' }],
          }),
        );
      } else {
        Alert.alert(
          'Error',
          err?.response?.data?.Remarks || err?.message || 'Failed to update MPIN. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
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

        <Text style={styles.title}>Reset MPIN</Text>
        <Text style={styles.subtitle}>
          Verify OTP and set a new 4-digit transaction MPIN
        </Text>
      </View>

      {/* Main Form Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Verify & Set MPIN</Text>
          <Text style={styles.formSubtitle}>
            Enter the OTP sent to your registered mobile and enter your new MPIN
          </Text>

          {/* OTP Field */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Enter OTP *</Text>
              <TouchableOpacity
                disabled={resendTimer > 0 || resending}
                onPress={sendForgotOtp}
              >
                <Text
                  style={[
                    styles.resendLink,
                    (resendTimer > 0 || resending) && styles.resendDisabled,
                  ]}
                >
                  {resendTimer > 0 ? `Resend in (${resendTimer}s)` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="6-digit OTP"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                style={styles.input}
              />
            </View>
          </View>

          {/* New MPIN Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>New 4-Digit MPIN *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                secureTextEntry={!isMpinVisible}
                placeholder="Enter 4-digit MPIN"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={4}
                value={mpin}
                onChangeText={setMpin}
                style={[styles.input, { letterSpacing: 4, fontWeight: '700' }]}
              />
              <TouchableOpacity
                onPress={() => setIsMpinVisible(!isMpinVisible)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon
                  name={isMpinVisible ? 'visibility' : 'visibility-off'}
                  size={22}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.hintText}>Must be exactly 4 numeric digits</Text>
          </View>

          {/* Confirm MPIN Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm New MPIN *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                secureTextEntry={!isConfirmMpinVisible}
                placeholder="Re-enter 4-digit MPIN"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={4}
                value={confirmMpin}
                onChangeText={setConfirmMpin}
                style={[styles.input, { letterSpacing: 4, fontWeight: '700' }]}
              />
              <TouchableOpacity
                onPress={() => setIsConfirmMpinVisible(!isConfirmMpinVisible)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon
                  name={isConfirmMpinVisible ? 'visibility' : 'visibility-off'}
                  size={22}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Badge */}
          <View style={styles.secureRow}>
            <Icon name="lock-outline" size={14} color="#10B981" />
            <Text style={styles.secureText}>256-Bit Hardware Encrypted MPIN Storage</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.button,
              (loading || otp.length < 4 || mpin.length < 4 || confirmMpin.length < 4) && {
                opacity: 0.75,
              },
            ]}
            onPress={handleUpdateMPIN}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>UPDATE MPIN</Text>
                <Icon name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },
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
  subtitle: {
    fontSize: 13,
    color: '#D9E7FF',
    marginTop: 6,
    opacity: 0.9,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  formCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 24,
    padding: 22,
    elevation: 4,
    shadowColor: '#091838',
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
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary || '#091838',
  },
  resendLink: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary || '#0D52ED',
  },
  resendDisabled: {
    color: '#94A3B8',
  },
  inputContainer: {
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  eyeBtn: {
    padding: 6,
  },
  hintText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    marginLeft: 2,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 22,
    gap: 6,
  },
  secureText: {
    fontSize: 11.5,
    color: '#059669',
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary || '#0D52ED',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary || '#0D52ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
