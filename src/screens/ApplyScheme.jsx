import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../constants/colors';

export default function ApplyScheme() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);

  // Form Fields
  const [girlName, setGirlName] = useState('');
  const [mobile, setMobile] = useState('+91 98765 43210');
  const [dob, setDob] = useState('15/08/2025');
  const [age, setAge] = useState('1 Year');
  const [income, setIncome] = useState('₹ 1,00,000 - ₹ 2,50,000');
  const [state, setState] = useState('उत्तर प्रदेश (Uttar Pradesh)');
  const [district, setDistrict] = useState('लखनऊ (Lucknow)');

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      Alert.alert(
        'आवेदन सफल!',
        'आपका आवेदन सफलतापूर्वक दर्ज कर लिया गया है। सहियोग खाता सक्रिय है।',
        [
          {
            text: 'खाता देखें',
            onPress: () => navigation.navigate('SahayogAccount'),
          },
        ],
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (step > 1) setStep(step - 1);
            else navigation.goBack();
          }}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vivah Sahayog - आवेदन</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 3 Step Wizard Progress */}
        <View style={styles.stepsWrapper}>
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                step >= 1 ? styles.stepCircleActive : styles.stepCircleInactive,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  step >= 1 ? styles.stepNumberActive : styles.stepNumberInactive,
                ]}
              >
                1
              </Text>
            </View>
            <Text style={[styles.stepLabel, step === 1 && styles.stepLabelActive]}>
              व्यक्तिगत{"\n"}जानकारी
            </Text>
          </View>

          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />

          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                step >= 2 ? styles.stepCircleActive : styles.stepCircleInactive,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  step >= 2 ? styles.stepNumberActive : styles.stepNumberInactive,
                ]}
              >
                2
              </Text>
            </View>
            <Text style={[styles.stepLabel, step === 2 && styles.stepLabelActive]}>
              दस्तावेज{"\n"}अपलोड
            </Text>
          </View>

          <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />

          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                step >= 3 ? styles.stepCircleActive : styles.stepCircleInactive,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  step >= 3 ? styles.stepNumberActive : styles.stepNumberInactive,
                ]}
              >
                3
              </Text>
            </View>
            <Text style={[styles.stepLabel, step === 3 && styles.stepLabelActive]}>
              समीक्षा और{"\n"}सबमिट
            </Text>
          </View>
        </View>

        {/* Step 1: बालिका की जानकारी */}
        {step === 1 && (
          <View style={styles.formContainer}>
            <Text style={styles.formSectionHeader}>बालिका एवं अभिभावक की जानकारी</Text>

            {/* बालिका का नाम */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>बालिका का नाम</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="कुमारी आराध्या"
                  placeholderTextColor="#94A3B8"
                  value={girlName}
                  onChangeText={setGirlName}
                />
              </View>
            </View>

            {/* मोबाइल नंबर */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>मोबाइल नंबर (खाता लिंक करने हेतु)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={mobile}
                  onChangeText={setMobile}
                />
                <FeatherIcon name="check-circle" size={18} color="#0F8A5F" />
              </View>
              <Text style={styles.inputHint}>
                * संबंधित जानकारी एवं लेन-देन स्थिति इस मोबाइल नंबर से जोड़ी जाएगी।
              </Text>
            </View>

            {/* जन्म तिथि */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>जन्म तिथि</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#94A3B8"
                  value={dob}
                  onChangeText={setDob}
                />
                <MaterialIcon name="calendar-month-outline" size={20} color="#64748B" />
              </View>
            </View>

            {/* वर्तमान आयु */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>वर्तमान आयु</Text>
              <View style={[styles.inputWrapper, { backgroundColor: '#F8FAFC' }]}>
                <TextInput
                  style={styles.textInput}
                  value={age}
                  editable={false}
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            {/* परिवार की वार्षिक आय */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>परिवार की वार्षिक आय</Text>
              <TouchableOpacity style={styles.selectWrapper} activeOpacity={0.8}>
                <Text style={styles.selectText}>{income || 'चयन करें'}</Text>
                <FeatherIcon name="chevron-down" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* राज्य */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>राज्य</Text>
              <TouchableOpacity style={styles.selectWrapper} activeOpacity={0.8}>
                <Text style={styles.selectText}>{state || 'चुनें'}</Text>
                <FeatherIcon name="chevron-down" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* जिला */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>जिला</Text>
              <TouchableOpacity style={styles.selectWrapper} activeOpacity={0.8}>
                <Text style={styles.selectText}>{district || 'चुनें'}</Text>
                <FeatherIcon name="chevron-down" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 2: दस्तावेज अपलोड */}
        {step === 2 && (
          <View style={styles.formContainer}>
            <Text style={styles.formSectionHeader}>आवश्यक दस्तावेज अपलोड करें</Text>
            <View style={styles.docVerifyNotice}>
              <MaterialIcon name="shield-check-outline" size={18} color="#0F8A5F" />
              <Text style={styles.docVerifyNoticeText}>
                दस्तावेज़ों का सत्यापन SARVANA टीम द्वारा मैन्युअल रूप से किया जाएगा।
              </Text>
            </View>

            <TouchableOpacity style={styles.uploadCard} activeOpacity={0.8}>
              <MaterialIcon name="cloud-upload-outline" size={32} color="#D81B60" />
              <Text style={styles.uploadCardTitle}>बालिका का जन्म प्रमाण पत्र</Text>
              <Text style={styles.uploadCardSub}>PDF / JPG (Max 5MB)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadCard} activeOpacity={0.8}>
              <MaterialIcon name="cloud-upload-outline" size={32} color="#D81B60" />
              <Text style={styles.uploadCardTitle}>माता-पिता का आधार कार्ड</Text>
              <Text style={styles.uploadCardSub}>PDF / JPG (Max 5MB)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadCard} activeOpacity={0.8}>
              <MaterialIcon name="cloud-upload-outline" size={32} color="#D81B60" />
              <Text style={styles.uploadCardTitle}>बालिका की फोटो</Text>
              <Text style={styles.uploadCardSub}>JPG / PNG</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: समीक्षा और सबमिट */}
        {step === 3 && (
          <View style={styles.formContainer}>
            <Text style={styles.formSectionHeader}>पूरी जानकारी का अवलोकन (Overview)</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>योजना: </Text>
                SARVANA Vivah Sahayog
              </Text>
              <Text style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>बालिका का नाम: </Text>
                {girlName || 'कुमारी आराध्या'}
              </Text>
              <Text style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>लिंक्ड मोबाइल: </Text>
                {mobile}
              </Text>
              <Text style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>जन्म तिथि: </Text>
                {dob} ({age})
              </Text>
              <Text style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>राज्य व जिला: </Text>
                {district}, {state}
              </Text>
              <Text style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>वार्षिक आय: </Text>
                {income}
              </Text>
              <Text style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>निर्धारित मासिक सहयोग: </Text>
                ~ ₹500 (NDO फंड अनुसार)
              </Text>
              <Text style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>खाते की स्थिति: </Text>
                <Text style={{ color: '#0F8A5F', fontWeight: '700' }}>सत्यापन हेतु सक्रियण</Text>
              </Text>
            </View>

            {/* Terms confirmation */}
            <View style={styles.termsBox}>
              <MaterialIcon name="information-outline" size={16} color="#64748B" />
              <Text style={styles.termsBoxText}>
                राशि की पूरी प्रक्रिया / भुगतान पूर्ण होने के बाद मैन्युअल सेटिंग व सत्यापन की आवश्यकता होगी। प्रत्येक महीने NDO / फंड की स्थिति अनुसार राशि उपलब्ध होगी।
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.85}
          onPress={handleNext}
        >
          <Text style={styles.actionBtnText}>
            {step === 3 ? 'आवेदन सबमिट करें' : 'आगे बढ़ें →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  stepsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#D81B60',
  },
  stepCircleInactive: {
    backgroundColor: '#E2E8F0',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepNumberInactive: {
    color: '#64748B',
  },
  stepLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
  },
  stepLabelActive: {
    color: '#D81B60',
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 18,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#D81B60',
  },
  formContainer: {
    gap: 14,
  },
  formSectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  inputGroup: {
    marginBottom: 6,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#1E293B',
    paddingVertical: 0,
  },
  selectWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    backgroundColor: '#FFFFFF',
  },
  selectText: {
    fontSize: 14.5,
    color: '#1E293B',
  },
  uploadCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#FBCFE8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFF5F8',
    marginBottom: 10,
  },
  uploadCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 6,
  },
  uploadCardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  summaryRow: {
    fontSize: 14,
    color: '#1E293B',
  },
  summaryLabel: {
    fontWeight: '700',
    color: '#64748B',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  actionBtn: {
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
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  inputHint: {
    fontSize: 11,
    color: '#0F8A5F',
    marginTop: 4,
    fontWeight: '500',
  },
  docVerifyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 14,
    gap: 8,
  },
  docVerifyNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#15803D',
    lineHeight: 17,
  },
  termsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 14,
    gap: 8,
  },
  termsBoxText: {
    flex: 1,
    fontSize: 12,
    color: '#B45309',
    lineHeight: 18,
  },
});
