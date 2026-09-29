import React, { useEffect, useState } from 'react';
import {
  TextInput,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import COLORS from '../constants/colors';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postData } from '../API';

const CreatePassword = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { email } = route.params || {};

  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [isMpinVisible, setIsMpinVisible] = useState(false);
  const [isConfirmMpinVisible, setIsConfirmMpinVisible] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (email) {
      AsyncStorage.setItem('email', email).catch(err => {
        console.error('Error saving email to storage:', err);
      });
    }
  }, [email]);

  const validateMPIN = value => {
    return /^[0-9]{4}$/.test(value);
  };

  const handleSubmit = async () => {
    if (!validateMPIN(mpin)) {
      setErrorText('MPIN must be exactly 4 numeric digits');
      Toast.show({
        type: 'error',
        text1: 'Invalid MPIN',
        text2: 'MPIN must be exactly 4 digits.',
      });
      return;
    }

    if (mpin !== confirmMpin) {
      setErrorText('Both MPIN entries must match');
      Toast.show({
        type: 'error',
        text1: 'MPIN Mismatch',
        text2: 'Both MPINs must match.',
      });
      return;
    }

    try {
      setLoading(true);
      setErrorText('');

      const response = await postData(`/api/user/mpin-generate`, {
        mPin: mpin.toString(),
      });
      console.log('MPIN generate response:', response);

      if (response?.Status === true) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Your MPIN has been created successfully!',
        });
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          }),
        );
      } else {
        const msg = response?.data?.message || response?.Remarks || 'Failed to create MPIN';
        setErrorText(msg);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: msg,
        });
      }
    } catch (error) {
      console.error('MPIN create error:', error);
      const msg = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
      setErrorText(msg);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: msg,
      });
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

        <Text style={styles.title}>Create MPIN</Text>
        <Text style={styles.subtitle}>
          Set a secure 4-digit PIN for instant transactions
        </Text>
      </View>

      {/* Main Form Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Set Security MPIN</Text>
          <Text style={styles.formSubtitle}>
            This PIN will be required to approve payments and wallet transfers
          </Text>

          {/* MPIN Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Enter 4-Digit MPIN</Text>
            <View style={styles.inputContainer}>
              <TextInput
                secureTextEntry={!isMpinVisible}
                placeholder="4-digit MPIN"
                placeholderTextColor="#94A3B8"
                value={mpin}
                maxLength={4}
                keyboardType="numeric"
                onChangeText={text => {
                  setMpin(text);
                  if (errorText) setErrorText('');
                }}
                style={styles.input}
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
            <Text style={styles.hintText}>Must be exactly 4 digits</Text>
          </View>

          {/* Confirm MPIN Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm 4-Digit MPIN</Text>
            <View style={styles.inputContainer}>
              <TextInput
                secureTextEntry={!isConfirmMpinVisible}
                placeholder="Re-enter 4-digit MPIN"
                placeholderTextColor="#94A3B8"
                value={confirmMpin}
                maxLength={4}
                keyboardType="numeric"
                onChangeText={text => {
                  setConfirmMpin(text);
                  if (errorText) setErrorText('');
                }}
                style={styles.input}
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

          {errorText ? <Text style={styles.errorBanner}>{errorText}</Text> : null}

          {/* Security Badge */}
          <View style={styles.secureRow}>
            <Icon name="lock-outline" size={14} color="#10B981" />
            <Text style={styles.secureText}>256-Bit Hardware Encrypted PIN Storage</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.button,
              (loading || mpin.length < 4 || confirmMpin.length < 4) && {
                opacity: 0.75,
              },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>SET MPIN & FINISH</Text>
                <Icon name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default CreatePassword;

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
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary || '#091838',
    marginBottom: 6,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 4,
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
  errorBanner: {
    color: '#EF4444',
    fontSize: 12.5,
    fontWeight: '600',
    marginBottom: 14,
    textAlign: 'center',
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 20,
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
