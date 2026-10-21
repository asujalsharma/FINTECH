import React, { useEffect, useState } from 'react';
import {
  TextInput,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postData } from '../API';

const BLUE = '#85daff';

const CreatePassword = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const email = route?.params?.email || '';

  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [isMpinVisible, setIsMpinVisible] = useState(false);
  const [isConfirmMpinVisible, setIsConfirmMpinVisible] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const addEmailToStorage = async () => {
      if (!email) return;
      try {
        await AsyncStorage.setItem('email', email);
      } catch (error) {
        console.error('Error adding email to AsyncStorage:', error);
      }
    };
    addEmailToStorage();
  }, [email]);

  const validateMPIN = value => {
    const regex = /^[0-9]{4}$/;
    return regex.test(value);
  };

  const handleSubmit = async () => {
    if (!validateMPIN(mpin)) {
      setErrorText('MPIN must be exactly 4 digits');
      Toast.show({
        type: 'error',
        text1: 'Invalid MPIN',
        text2: 'MPIN must be exactly 4 digits.',
      });
      return;
    }

    if (mpin !== confirmMpin) {
      setErrorText('Both MPINs do not match');
      Toast.show({
        type: 'error',
        text1: 'Mismatch',
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
      console.log('MPIN Generate Response:', response);

      if (response?.Status === true) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'MPIN created successfully!',
        });
        navigation.navigate('Home');
      } else {
        const msg = response?.Remarks || response?.Message || response?.data?.message || 'Failed to create MPIN';
        setErrorText(msg);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: msg,
        });
      }
    } catch (error) {
      console.error('MPIN Generate Error:', error);
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
          <Text style={styles.badgeText}>🔒 Security Setup</Text>
        </View>

        <Text style={styles.title}>Create MPIN</Text>
        <Text style={styles.subtitle}>
          Set a 4-digit security PIN to authorize transactions & logins
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
          {/* Main Card */}
          <View style={styles.formCard}>
            {/* Info Tip Banner */}
            <View style={styles.infoBanner}>
              <Icon name="info" size={18} color={BLUE} style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.infoText}>
                Your 4-digit MPIN protects your wallet and account. Keep it confidential.
              </Text>
            </View>

            {/* MPIN Field */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Enter 4-digit MPIN *</Text>
              <View
                style={[
                  styles.inputContainer,
                  mpin.length > 0 && mpin.length !== 4 && styles.inputContainerWarning,
                ]}
              >
                <View style={styles.iconCircle}>
                  <Icon name="lock" size={18} color={BLUE} />
                </View>
                <TextInput
                  secureTextEntry={!isMpinVisible}
                  placeholder="Enter 4-digit MPIN"
                  placeholderTextColor="#94A3B8"
                  value={mpin}
                  maxLength={4}
                  keyboardType={Platform.OS === 'android' ? 'numeric' : 'number-pad'}
                  onChangeText={text => {
                    setMpin(text);
                    if (errorText) setErrorText('');
                  }}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setIsMpinVisible(!isMpinVisible)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={isMpinVisible ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>Must be exactly 4 digits</Text>
            </View>

            {/* Confirm MPIN Field */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirm MPIN *</Text>
              <View
                style={[
                  styles.inputContainer,
                  confirmMpin.length === 4 &&
                    mpin !== confirmMpin &&
                    styles.inputContainerError,
                  confirmMpin.length === 4 &&
                    mpin === confirmMpin &&
                    styles.inputContainerSuccess,
                ]}
              >
                <View style={styles.iconCircle}>
                  <Icon name="lock-outline" size={18} color={BLUE} />
                </View>
                <TextInput
                  secureTextEntry={!isConfirmMpinVisible}
                  placeholder="Re-enter 4-digit MPIN"
                  placeholderTextColor="#94A3B8"
                  value={confirmMpin}
                  maxLength={4}
                  keyboardType={Platform.OS === 'android' ? 'numeric' : 'number-pad'}
                  onChangeText={text => {
                    setConfirmMpin(text);
                    if (errorText) setErrorText('');
                  }}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setIsConfirmMpinVisible(!isConfirmMpinVisible)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={isConfirmMpinVisible ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              {confirmMpin.length > 0 && mpin !== confirmMpin ? (
                <Text style={styles.errorText}>MPINs do not match</Text>
              ) : confirmMpin.length === 4 && mpin === confirmMpin ? (
                <Text style={styles.successText}>✓ MPIN matched</Text>
              ) : (
                <Text style={styles.helperText}>Re-enter the same 4 digits</Text>
              )}
            </View>

            {errorText ? <Text style={styles.generalError}>{errorText}</Text> : null}

            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                styles.button,
                (!validateMPIN(mpin) || mpin !== confirmMpin) && styles.buttonDisabled,
                loading && { opacity: 0.8 },
              ]}
              onPress={handleSubmit}
              disabled={loading || !validateMPIN(mpin) || mpin !== confirmMpin}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>CONFIRM & SAVE</Text>
                  <Icon
                    name="check-circle"
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

export default CreatePassword;

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

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DCE5FF',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },

  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    height: 52,
  },
  inputContainerWarning: {
    borderColor: '#F59E0B',
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputContainerSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '700',
    letterSpacing: 4,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 8,
  },

  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
  successText: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
  generalError: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
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
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
