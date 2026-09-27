import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DeviceInfo from 'react-native-device-info';
import COLORS from '../constants/colors';
import { postData } from '../API';
import { SarvanaHeaderLogo } from '../components/SarvanaLogo';

export default function Login() {
  const [activeTab, setActiveTab] = useState('register'); // 'login' | 'register'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [serverOtp, setServerOtp] = useState(null);
  const [responseStatus, setResponseStatus] = useState(null);

  const navigation = useNavigation();

  const handleGetOtp = async () => {
    if (!mobile || mobile.trim().length < 10) {
      Alert.alert('अमान्य नंबर', 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें');
      return;
    }
    setLoading(true);
    try {
      let deviceToken = 'sarvana-device';
      try {
        deviceToken = await DeviceInfo.getUniqueId();
      } catch (err) {
        console.log('Error getting device unique id:', err);
      }

      const response = await postData('api/auth/user-register', {
        phone: mobile.trim(),
        deviceToken: deviceToken,
      });

      if (response && response.Status) {
        setOtpSent(true);
        setServerOtp(response.Otp);
        setResponseStatus(response.ResponseStatus);
        Alert.alert(
          'OTP भेजा गया',
          `आपके मोबाइल नंबर पर सत्यापन कोड भेज दिया गया है। ${
            response.Otp ? `(Demo OTP: ${response.Otp})` : ''
          }`,
        );
      } else {
        Alert.alert(
          'असफल',
          response?.Remarks || 'OTP भेजने में असमर्थ। कृपया पुनः प्रयास करें।',
        );
      }
    } catch (error) {
      Alert.alert(
        'कनेक्शन त्रुटि',
        error.message || 'सर्वर से संपर्क नहीं हो सका।',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!mobile || mobile.trim().length < 10) {
      Alert.alert('अमान्य नंबर', 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें');
      return;
    }
    if (!agreed) {
      Alert.alert('शर्तें स्वीकार करें', 'कृपया आगे बढ़ने से पहले नियम एवं शर्तों से सहमत हों।');
      return;
    }

    if (!otpSent) {
      handleGetOtp();
      return;
    }

    // If OTP is already sent, forward to verification screen or verify
    navigation.navigate('OtpInput', {
      Otp: serverOtp || otp,
      phone: mobile.trim(),
      Status: responseStatus,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Logo */}
        <View style={styles.headerSection}>
          <SarvanaHeaderLogo
            size={48}
            subtitle="ALL IN ONE"
            subTagline="सेवा से समृद्धि तक"
          />
        </View>

        {/* Login / Register Segmented Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'login' && styles.activeTabButton]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('login')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'login' && styles.activeTabText,
              ]}
            >
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'register' && styles.activeTabButton]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('register')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'register' && styles.activeTabText,
              ]}
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Form */}
        <View style={styles.formCard}>
          {/* Mobile Number Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>मोबाइल नंबर</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Mobile Number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                value={mobile}
                onChangeText={setMobile}
              />
            </View>
            <TouchableOpacity
              style={styles.getOtpInlineBtn}
              activeOpacity={0.7}
              onPress={handleGetOtp}
              disabled={loading}
            >
              <Text style={styles.getOtpInlineText}>
                {loading ? 'भेज रहे हैं...' : otpSent ? 'OTP पुनः भेजें' : 'OTP प्राप्त करें'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* OTP Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>OTP दर्ज करें</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter OTP"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />
            </View>
          </View>

          {/* Terms & Privacy Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.7}
            onPress={() => setAgreed(!agreed)}
          >
            <View
              style={[
                styles.checkboxBox,
                agreed && styles.checkboxBoxChecked,
              ]}
            >
              {agreed && <MaterialIcon name="check" size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>
              मैं नियम एवं शर्तों और गोपनीयता नीति से सहमत हूँ
            </Text>
          </TouchableOpacity>

          {/* Primary CTA Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.85}
            onPress={handleAction}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>
                {activeTab === 'register' ? 'अकाउंट बनाएं' : 'लॉगिन करें'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>या</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-in */}
          <TouchableOpacity
            style={styles.googleBtn}
            activeOpacity={0.8}
            onPress={() => {
              Alert.alert('Google Sign-In', 'Connecting to Google Authentication...');
            }}
          >
            <FontAwesome name="google" size={18} color="#EA4335" style={{ marginRight: 10 }} />
            <Text style={styles.googleBtnText}>Google से जारी रखें</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#D81B60',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#D81B60',
    fontWeight: '700',
  },
  formCard: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    height: 48,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    paddingVertical: 0,
  },
  getOtpInlineBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  getOtpInlineText: {
    color: '#0F8A5F',
    fontSize: 13,
    fontWeight: '700',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxChecked: {
    backgroundColor: '#0F8A5F',
    borderColor: '#0F8A5F',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  submitBtn: {
    backgroundColor: '#D81B60',
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#94A3B8',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    height: 48,
    backgroundColor: '#FFFFFF',
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
});
