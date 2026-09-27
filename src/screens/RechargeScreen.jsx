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
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../constants/colors';

const OPERATORS = [
  { id: 'jio', name: 'Jio', color: '#0A2568', icon: 'alpha-j-circle' },
  { id: 'airtel', name: 'Airtel', color: '#EF4444', icon: 'alpha-a-circle' },
  { id: 'vi', name: 'Vi', color: '#DC2626', icon: 'alpha-v-circle' },
  { id: 'bsnl', name: 'BSNL', color: '#059669', icon: 'alpha-b-circle' },
];

const QUICK_AMOUNTS = [10, 50, 100, 199, 299, 499, 'Other'];
const DONATION_AMOUNTS = [10, 20, 50, 100];

export default function RechargeScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState('prepaid'); // 'prepaid' | 'postpaid'
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('jio');
  const [amount, setAmount] = useState('199');
  const [donate, setDonate] = useState(true);
  const [donationAmount, setDonationAmount] = useState(10);

  const handleProceed = () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }
    const rechargeNum = parseInt(amount, 10) || 0;
    const finalAmount = donate ? rechargeNum + donationAmount : rechargeNum;

    navigation.navigate('PaymentConfirmation', {
      phone: mobileNumber,
      operator: selectedOperator,
      amount: finalAmount,
      rechargeAmount: rechargeNum,
      donationAmount: donate ? donationAmount : 0,
      type: tab,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F8A5F" />

      {/* Emerald Green Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <FeatherIcon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mobile Recharge</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('RechargeHistory')}
          activeOpacity={0.7}
        >
          <MaterialIcon name="history" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Prepaid / Postpaid Segmented Switch */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              tab === 'prepaid' && styles.activeSegmentBtn,
            ]}
            onPress={() => setTab('prepaid')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                tab === 'prepaid' && styles.activeSegmentText,
              ]}
            >
              Prepaid
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              tab === 'postpaid' && styles.activeSegmentBtn,
            ]}
            onPress={() => setTab('postpaid')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                tab === 'postpaid' && styles.activeSegmentText,
              ]}
            >
              Postpaid
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mobile Number Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>मोबाइल नंबर</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Mobile Number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobileNumber}
              onChangeText={setMobileNumber}
            />
            <TouchableOpacity style={styles.contactIconBtn}>
              <MaterialIcon name="contacts" size={22} color="#0F8A5F" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Select Operator */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Operator</Text>
          <View style={styles.operatorRow}>
            {OPERATORS.map(op => (
              <TouchableOpacity
                key={op.id}
                style={[
                  styles.operatorCard,
                  selectedOperator === op.id && styles.selectedOperatorCard,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedOperator(op.id)}
              >
                <View style={[styles.operatorIconCircle, { backgroundColor: op.color }]}>
                  <MaterialIcon name={op.icon} size={26} color="#FFFFFF" />
                </View>
                <Text style={styles.operatorName}>{op.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Amounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Plan Amount</Text>
          <View style={styles.amountGrid}>
            {QUICK_AMOUNTS.map((val, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.amountPill,
                  amount === val.toString() && styles.selectedAmountPill,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  if (val !== 'Other') setAmount(val.toString());
                }}
              >
                <Text
                  style={[
                    styles.amountText,
                    amount === val.toString() && styles.selectedAmountText,
                  ]}
                >
                  {val === 'Other' ? 'Other' : `₹${val}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Social Contribution / Sahayog Card */}
        <View style={styles.donationCard}>
          <View style={styles.donationHeader}>
            <FontAwesome5 name="heart" size={16} color="#D81B60" />
            <Text style={styles.donationTitle}>साथ मिलकर कुछ अच्छा करें</Text>
          </View>

          <Text style={styles.donationSubtext}>
            ₹{donationAmount} का सहयोग SARVANA Care Foundation को देना चाहेंगे?
          </Text>

          <View style={styles.donationAmountsRow}>
            {DONATION_AMOUNTS.map(val => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.donationAmountPill,
                  donate && donationAmount === val && styles.selectedDonationPill,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  setDonate(true);
                  setDonationAmount(val);
                }}
              >
                <Text
                  style={[
                    styles.donationAmountText,
                    donate && donationAmount === val && styles.selectedDonationText,
                  ]}
                >
                  ₹{val}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Proceed to Pay Button */}
        <TouchableOpacity
          style={styles.payBtn}
          activeOpacity={0.85}
          onPress={handleProceed}
        >
          <Text style={styles.payBtnText}>Proceed to Pay</Text>
        </TouchableOpacity>

        {/* Voluntary Note */}
        <View style={styles.noteRow}>
          <MaterialIcon name="check-circle" size={16} color="#0F8A5F" />
          <Text style={styles.noteText}>यह सहयोग पूरी तरह स्वैच्छिक है।</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F8A5F',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    padding: 4,
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeSegmentBtn: {
    backgroundColor: '#D81B60',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeSegmentText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputCard: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    paddingVertical: 0,
  },
  contactIconBtn: {
    padding: 6,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  operatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  operatorCard: {
    alignItems: 'center',
    width: '22%',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  selectedOperatorCard: {
    borderColor: '#0F8A5F',
    backgroundColor: '#ECFDF5',
  },
  operatorIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  operatorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amountPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  selectedAmountPill: {
    borderColor: '#D81B60',
    backgroundColor: '#FFF0F5',
  },
  amountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  selectedAmountText: {
    color: '#D81B60',
    fontWeight: '700',
  },
  donationCard: {
    backgroundColor: '#FFF5F8',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    marginBottom: 24,
  },
  donationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  donationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D81B60',
    marginLeft: 8,
  },
  donationSubtext: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 12,
  },
  donationAmountsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  donationAmountPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    backgroundColor: '#FFFFFF',
  },
  selectedDonationPill: {
    backgroundColor: '#D81B60',
    borderColor: '#D81B60',
  },
  donationAmountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D81B60',
  },
  selectedDonationText: {
    color: '#FFFFFF',
  },
  payBtn: {
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
    marginBottom: 12,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F8A5F',
  },
});
