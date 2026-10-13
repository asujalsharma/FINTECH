import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { postData } from '../API';

const BLUE = '#092B88';

const CreateRetailer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const reduxUser = useSelector(state => state.user);

  const currentUser = reduxUser?.Data || reduxUser?.user || reduxUser || {};
  const userRole = (
    currentUser?.role ||
    currentUser?.userType ||
    currentUser?.userRole ||
    currentUser?.type ||
    ''
  ).toLowerCase();

  const isDistributor =
    userRole === 'distributor' ||
    currentUser?.isDistributor === true ||
    route.params?.isDistributor === true;

  const distId = route.params?.distributorId || currentUser?._id;
  const distPhone = route.params?.distributorPhone || currentUser?.phone;
  const referralCode = route.params?.referralCode || currentUser?.referalId || '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Permission Guard
  useEffect(() => {
    if (!isDistributor) {
      Alert.alert(
        'Access Restricted',
        'Retailer registration is exclusively available to verified Distributors.',
        [
          {
            text: 'Go to Home',
            onPress: () => navigation.navigate('Home'),
          },
        ],
      );
    }
  }, [isDistributor, navigation]);

  const validateEmail = text => {
    const re = /\S+@\S+\.\S+/;
    return re.test(text);
  };

  const handleCreateRetailer = async () => {
    setErrorMsg('');

    if (!firstName.trim()) {
      setErrorMsg('Please enter first name');
      return;
    }
    if (!lastName.trim()) {
      setErrorMsg('Please enter last name');
      return;
    }
    if (!phone.trim() || phone.trim().length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!email.trim() || !validateEmail(email.trim())) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        role: 'retailer',
        userType: 'retailer',
        distributorId: distId || '',
        distributorPhone: distPhone || '',
        referalId: referralCode || '',
        referBy: referralCode || '',
      };

      console.log('Creating Retailer Payload:', payload);

      let response;
      try {
        response = await postData('/api/user/create-retailer', payload);
      } catch (err) {
        if (err?.response?.status === 404) {
          // Fallback endpoint if API uses /api/distributor/create-retailer
          response = await postData('/api/distributor/create-retailer', payload);
        } else {
          throw err;
        }
      }

      console.log('Create Retailer Response:', response);

      if (
        response?.Status === true ||
        response?.success === true ||
        response?.ResponseStatus === 1
      ) {
        Alert.alert(
          'Retailer Created Successfully 🎉',
          `Retailer ${firstName} ${lastName} (+91 ${phone}) has been registered under your distributor network.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else {
        const message =
          response?.Remarks ||
          response?.message ||
          response?.error ||
          'Failed to create retailer. Please try again.';
        setErrorMsg(message);
        Toast.show({
          type: 'error',
          text1: 'Creation Failed',
          text2: message,
        });
      }
    } catch (error) {
      console.log('Error creating retailer:', error?.response?.data || error);
      const serverMsg =
        error?.response?.data?.Remarks ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to connect to server. Please try again.';
      setErrorMsg(serverMsg);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: serverMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Create Retailer</Text>
          <Text style={styles.headerSubtitle}>
            Add a new retailer under your distributor ID
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Distributor Mapping Info Card */}
          <View style={styles.distributorBanner}>
            <View style={styles.distributorIconCircle}>
              <MaterialCommunityIcons
                name="account-tie"
                size={24}
                color={BLUE}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.distributorBannerTitle}>
                Distributor Network
              </Text>
              <Text style={styles.distributorBannerSubtitle}>
                {referralCode
                  ? `Retailer will be mapped under Ref: ${referralCode}${distPhone ? ` (${distPhone})` : ''}`
                  : 'New retailer will be mapped directly to your account'}
              </Text>
            </View>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>ACTIVE</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.cardHeaderTitle}>Retailer Details</Text>
            <Text style={styles.cardHeaderDesc}>
              Enter the retailer's basic profile details to register them
            </Text>

            {/* Error Message banner */}
            {Boolean(errorMsg) && (
              <View style={styles.errorBox}>
                <Icon name="error-outline" size={18} color="#DC2626" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* First Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                First Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="person"
                  size={20}
                  color="#64748B"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rahul"
                  placeholderTextColor="#94A3B8"
                  value={firstName}
                  onChangeText={text => {
                    setFirstName(text);
                    if (errorMsg) setErrorMsg('');
                  }}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Last Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Last Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="person-outline"
                  size={20}
                  color="#64748B"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Verma"
                  placeholderTextColor="#94A3B8"
                  value={lastName}
                  onChangeText={text => {
                    setLastName(text);
                    if (errorMsg) setErrorMsg('');
                  }}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Mobile Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Mobile Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={text => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    if (cleaned.length <= 10) setPhone(cleaned);
                    if (errorMsg) setErrorMsg('');
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Email Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email Address <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="email"
                  size={20}
                  color="#64748B"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. rahul@gmail.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (errorMsg) setErrorMsg('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Informational Notice */}
            <View style={styles.infoNotice}>
              <Icon
                name="info-outline"
                size={18}
                color="#0284C7"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <Text style={styles.infoNoticeText}>
                The new retailer will receive an OTP and welcome confirmation on
                their registered mobile number to set their MPIN.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleCreateRetailer}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Icon
                    name="person-add"
                    size={20}
                    color="#FFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.submitButtonText}>Create Retailer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateRetailer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  header: {
    backgroundColor: BLUE,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 6,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  distributorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  distributorIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  distributorBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  distributorBannerSubtitle: {
    fontSize: 11,
    color: '#4338CA',
    marginTop: 2,
    fontWeight: '600',
  },
  activePill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#092B88',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  cardHeaderDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12.5,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoNoticeText: {
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 17,
    flex: 1,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: BLUE,
    height: 52,
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
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
