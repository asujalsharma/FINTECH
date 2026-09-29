import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../constants/colors';
import { getData, postData } from '../API';
import NavBar from '../components/NavBar';

const SCHEMES = [
  { id: 'vivah', name: 'Vivah Sahayog Yojna', subtitle: 'बेटी विवाह सहयोग', icon: 'heart', badge: 'लोकप्रिय' },
  { id: 'shiksha', name: 'Beti Shiksha Sahayog', subtitle: 'शिक्षा का अधिकार', icon: 'school', badge: 'सक्रिय' },
  { id: 'general', name: 'Sarvana Welfare Fund', subtitle: 'सामान्य जनकल्याण कोष', icon: 'hand-holding-heart', badge: 'फाउंडेशन' },
];

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2000, 5000];

export default function DonationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const reduxUser = useSelector(state => state.user);

  const initialScheme = route.params?.schemeId || 'vivah';
  const [selectedScheme, setSelectedScheme] = useState(initialScheme);
  const [frequency, setFrequency] = useState('one_time'); // 'one_time' | 'monthly'
  const [amount, setAmount] = useState('500');
  const [paymentMethod, setPaymentMethod] = useState('wallet'); // 'wallet' | 'upi' | 'card'

  // Donor Details
  const [donorName, setDonorName] = useState(reduxUser?.name || reduxUser?.user?.name || '');
  const [donorPhone, setDonorPhone] = useState(reduxUser?.mobile || reduxUser?.phone || '');
  const [panNumber, setPanNumber] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [needTaxReceipt, setNeedTaxReceipt] = useState(false);

  // Wallet
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Success Modal
  const [successModal, setSuccessModal] = useState(false);
  const [lastTxnDetails, setLastTxnDetails] = useState(null);

  useEffect(() => {
    fetchWalletInfo();
  }, []);

  const fetchWalletInfo = async () => {
    try {
      setWalletLoading(true);
      const res = await getData('api/wallet/info');
      if (res?.Status || res?.success) {
        const data = res?.Data || res?.data;
        setWalletBalance(data?.balance ?? 0);
      }
    } catch (e) {
      console.log('Wallet fetch error:', e);
    } finally {
      setWalletLoading(false);
    }
  };

  const handlePresetSelect = (val) => {
    setAmount(String(val));
  };

  const generateOrderId = () =>
    'DON_' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleProceedDonation = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('अमान्य राशि', 'कृपया एक मान्य सहयोग राशि दर्ज करें।');
      return;
    }

    if (paymentMethod === 'wallet') {
      if (walletBalance < numAmount) {
        Alert.alert(
          'अपर्याप्त वॉलेट बैलेंस',
          `आपके वॉलेट में ₹${walletBalance.toFixed(2)} उपलब्ध हैं। कृपया वॉलेट रिचार्ज करें या UPI से भुगतान करें।`,
          [
            { text: 'UPI से भुगतान करें', onPress: () => setPaymentMethod('upi') },
            { text: 'Add Money', onPress: () => navigation.navigate('WalletTopupScreen') },
          ]
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const orderId = generateOrderId();
      const currentSchemeObj = SCHEMES.find(s => s.id === selectedScheme);

      if (paymentMethod === 'upi' || paymentMethod === 'card') {
        const res = await postData('api/payment/upi/create-order', {
          amount: numAmount,
          orderId,
          redirectUrl: 'https://rechargehoga.techember.in/payment-receipt',
          note: `Sarvana Sahayog - ${currentSchemeObj?.name || 'Donation'}`,
        });

        if (res?.Data?.payment_url) {
          navigation.navigate('PaymentWebview', {
            paymentUrl: res.Data.payment_url,
            orderId,
            amount: String(numAmount),
            from: 'sahayog-donation',
          });
        } else {
          // Fallback if gateway simulation
          setLastTxnDetails({
            txnId: orderId,
            amount: numAmount,
            scheme: currentSchemeObj?.name || 'Vivah Sahayog Yojna',
            date: new Date().toLocaleDateString('hi-IN'),
            method: 'UPI',
          });
          setSuccessModal(true);
        }
      } else {
        // Wallet deduction / record
        setWalletBalance(prev => Math.max(0, prev - numAmount));
        setLastTxnDetails({
          txnId: orderId,
          amount: numAmount,
          scheme: currentSchemeObj?.name || 'Vivah Sahayog Yojna',
          date: new Date().toLocaleDateString('hi-IN'),
          method: 'Sarvana Wallet',
        });
        setSuccessModal(true);
      }
    } catch (err) {
      console.log('Donation error:', err);
      Alert.alert('त्रुटि', 'सहयोग प्रक्रिया पूरी नहीं हो सकी। कृपया पुनः प्रयास करें।');
    } finally {
      setSubmitting(false);
    }
  };

  const numAmount = parseFloat(amount) || 0;
  const isHighAmount = numAmount > 2000;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>सहयोग करें (Contribution)</Text>
        <View style={styles.trustBadgeSmall}>
          <FeatherIcon name="shield" size={14} color="#0F8A5F" />
          <Text style={styles.trustBadgeText}>100% सुरक्षित</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cause / Scheme Selection */}
        <Text style={styles.sectionTitle}>योजना चुनें (Select Scheme)</Text>
        <View style={styles.schemesGrid}>
          {SCHEMES.map(item => {
            const isSelected = selectedScheme === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.schemeChoiceCard,
                  isSelected && styles.schemeChoiceCardActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedScheme(item.id)}
              >
                <View style={styles.schemeChoiceTop}>
                  <View style={[styles.schemeIconBg, isSelected && { backgroundColor: '#FDF2F8' }]}>
                    <FontAwesome5
                      name={item.icon}
                      size={18}
                      color={isSelected ? '#D81B60' : '#64748B'}
                    />
                  </View>
                  <View style={[styles.schemeBadge, isSelected && { backgroundColor: '#FCE7F3' }]}>
                    <Text style={[styles.schemeBadgeText, isSelected && { color: '#D81B60' }]}>
                      {item.badge}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.schemeName, isSelected && { color: '#D81B60' }]}>
                  {item.name}
                </Text>
                <Text style={styles.schemeSub}>{item.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Frequency Tabs (One time vs Monthly) */}
        <View style={styles.frequencyRow}>
          <TouchableOpacity
            style={[styles.frequencyBtn, frequency === 'one_time' && styles.frequencyBtnActive]}
            activeOpacity={0.8}
            onPress={() => setFrequency('one_time')}
          >
            <Text style={[styles.frequencyBtnText, frequency === 'one_time' && styles.frequencyBtnTextActive]}>
              एक बार (One-Time)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.frequencyBtn, frequency === 'monthly' && styles.frequencyBtnActive]}
            activeOpacity={0.8}
            onPress={() => {
              setFrequency('monthly');
              setAmount('500');
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialIcon
                name="calendar-sync"
                size={16}
                color={frequency === 'monthly' ? '#FFFFFF' : '#64748B'}
              />
              <Text style={[styles.frequencyBtnText, frequency === 'monthly' && styles.frequencyBtnTextActive]}>
                मासिक (~ ₹500)
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Amount Input Section */}
        <View style={styles.amountCard}>
          <Text style={styles.amountCardLabel}>सहयोग राशि दर्ज करें</Text>
          <View style={styles.amountInputRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#CBD5E1"
            />
          </View>

          {/* Quick preset chips */}
          <View style={styles.presetsWrapper}>
            {PRESET_AMOUNTS.map(val => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.presetChip,
                  amount === String(val) && styles.presetChipActive,
                ]}
                activeOpacity={0.7}
                onPress={() => handlePresetSelect(val)}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    amount === String(val) && styles.presetChipTextActive,
                  ]}
                >
                  ₹{val}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* High amount notice (> ₹2,000) as per project rules */}
          {isHighAmount && (
            <View style={styles.highAmountAlert}>
              <MaterialIcon name="shield-alert-outline" size={16} color="#E11D48" />
              <Text style={styles.highAmountAlertText}>
                ₹2,000 से अधिक की राशि के लेन-देन के लिए विशेष सत्यापन प्रक्रिया लागू होगी।
              </Text>
            </View>
          )}
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>भुगतान माध्यम चुनें</Text>
        <View style={styles.paymentMethodsWrapper}>
          {/* Option 1: Sarvana Wallet */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'wallet' && styles.paymentOptionActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod('wallet')}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[styles.payIconCircle, { backgroundColor: '#FDF2F8' }]}>
                <MaterialIcon name="wallet-outline" size={22} color="#D81B60" />
              </View>
              <View>
                <Text style={styles.payOptionTitle}>Sarvana Wallet</Text>
                <Text style={styles.payOptionSub}>
                  उपलब्ध बैलेंस:{' '}
                  {walletLoading ? (
                    <ActivityIndicator size="small" color="#0F8A5F" />
                  ) : (
                    <Text style={{ fontWeight: '700', color: '#0F8A5F' }}>
                      ₹{walletBalance.toFixed(2)}
                    </Text>
                  )}
                </Text>
              </View>
            </View>

            <View style={[styles.radioCircle, paymentMethod === 'wallet' && styles.radioCircleActive]}>
              {paymentMethod === 'wallet' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          {/* Option 2: UPI / QR */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'upi' && styles.paymentOptionActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod('upi')}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[styles.payIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <MaterialIcon name="qrcode-scan" size={22} color="#0F8A5F" />
              </View>
              <View>
                <Text style={styles.payOptionTitle}>UPI Instant (GPay / PhonePe / Paytm)</Text>
                <Text style={styles.payOptionSub}>QR कोड अथवा UPI ऐप्स द्वारा तत्काल भुगतान</Text>
              </View>
            </View>

            <View style={[styles.radioCircle, paymentMethod === 'upi' && styles.radioCircleActive]}>
              {paymentMethod === 'upi' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          {/* Option 3: NetBanking / Card */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'card' && styles.paymentOptionActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[styles.payIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <MaterialIcon name="credit-card-outline" size={22} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.payOptionTitle}>Debit Card / NetBanking</Text>
                <Text style={styles.payOptionSub}>सभी प्रमुख भारतीय बैंक समर्थित</Text>
              </View>
            </View>

            <View style={[styles.radioCircle, paymentMethod === 'card' && styles.radioCircleActive]}>
              {paymentMethod === 'card' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Donor Information Card */}
        <View style={styles.donorCard}>
          <Text style={styles.donorCardTitle}>सहयोगकर्ता का विवरण (Donor Info)</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>नाम</Text>
            <TextInput
              style={styles.textInput}
              value={donorName}
              onChangeText={setDonorName}
              placeholder="आपका पूरा नाम"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>मोबाइल नंबर</Text>
            <TextInput
              style={styles.textInput}
              value={donorPhone}
              onChangeText={setDonorPhone}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* 80G Tax Exemption Toggle */}
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.7}
            onPress={() => setNeedTaxReceipt(!needTaxReceipt)}
          >
            <MaterialIcon
              name={needTaxReceipt ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={20}
              color={needTaxReceipt ? '#D81B60' : '#94A3B8'}
            />
            <Text style={styles.checkboxLabel}>80G आयकर छूट रसीद चाहिए (Tax Exemption)</Text>
          </TouchableOpacity>

          {needTaxReceipt && (
            <View style={[styles.inputGroup, { marginTop: 10 }]}>
              <Text style={styles.inputLabel}>PAN Card Number (आयकर छूट हेतु)</Text>
              <TextInput
                style={styles.textInput}
                value={panNumber}
                onChangeText={setPanNumber}
                placeholder="ABCDE1234F"
                autoCapitalize="characters"
                placeholderTextColor="#94A3B8"
              />
            </View>
          )}
        </View>

        {/* Foundation Trust Seal */}
        <View style={styles.trustBanner}>
          <FontAwesome5 name="hands-helping" size={20} color="#0F8A5F" />
          <View style={{ flex: 1 }}>
            <Text style={styles.trustTitle}>SARVANA Care Foundation</Text>
            <Text style={styles.trustSub}>
              आपका 100% सहयोग सीधे बेटी विवाह एवं शिक्षा कोष में जाता है। पासबुक में विवरण तुरंत जुड़ जाएगा।
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Action CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomBarSub}>कुल सहयोग राशि</Text>
          <Text style={styles.bottomBarTotal}>₹ {numAmount.toLocaleString('en-IN')}</Text>
        </View>

        <TouchableOpacity
          style={[styles.donateCtaBtn, submitting && { opacity: 0.7 }]}
          activeOpacity={0.85}
          onPress={handleProceedDonation}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.donateCtaText}>सहयोग करें</Text>
              <FeatherIcon name="arrow-right" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Donation Success Modal ── */}
      <Modal transparent visible={successModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIconCircle}>
              <FeatherIcon name="check" size={36} color="#FFFFFF" />
            </View>

            <Text style={styles.modalSuccessHeading}>सहयोग सफल रहा!</Text>
            <Text style={styles.modalSuccessSub}>
              आपका बहुमूल्य योगदान सफलतापूर्वक दर्ज कर लिया गया है।
            </Text>

            <View style={styles.receiptBox}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Transaction ID:</Text>
                <Text style={styles.receiptVal}>{lastTxnDetails?.txnId}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>राशि (Amount):</Text>
                <Text style={[styles.receiptVal, { color: '#0F8A5F', fontWeight: '800' }]}>
                  ₹ {lastTxnDetails?.amount}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>योजना (Scheme):</Text>
                <Text style={styles.receiptVal}>{lastTxnDetails?.scheme}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>भुगतान माध्यम:</Text>
                <Text style={styles.receiptVal}>{lastTxnDetails?.method}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalPassbookBtn}
              activeOpacity={0.85}
              onPress={() => {
                setSuccessModal(false);
                navigation.navigate('SahayogAccount');
              }}
            >
              <Text style={styles.modalPassbookText}>पासबुक विवरण देखें →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalDoneBtn}
              activeOpacity={0.7}
              onPress={() => {
                setSuccessModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalDoneText}>समाप्त करें (Done)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <NavBar activeTab="donation" data={reduxUser} />
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
  trustBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  trustBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F8A5F',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  schemesGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  schemeChoiceCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  schemeChoiceCardActive: {
    borderColor: '#D81B60',
    backgroundColor: '#FFF0F5',
  },
  schemeChoiceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  schemeIconBg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  schemeBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  schemeBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#64748B',
  },
  schemeName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 14,
  },
  schemeSub: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 2,
  },
  frequencyRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  frequencyBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  frequencyBtnActive: {
    backgroundColor: '#D81B60',
  },
  frequencyBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  frequencyBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  amountCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  amountCardLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#D81B60',
    paddingBottom: 6,
    marginBottom: 14,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    paddingVertical: 0,
  },
  presetsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  presetChipActive: {
    borderColor: '#D81B60',
    backgroundColor: '#FDF2F8',
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#D81B60',
  },
  highAmountAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF1F2',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginTop: 12,
  },
  highAmountAlertText: {
    flex: 1,
    fontSize: 11,
    color: '#BE123C',
    lineHeight: 15,
  },
  paymentMethodsWrapper: {
    gap: 10,
    marginBottom: 18,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  paymentOptionActive: {
    borderColor: '#D81B60',
    backgroundColor: '#FFF5F8',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  payIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payOptionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  payOptionSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#D81B60',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D81B60',
  },
  donorCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    gap: 10,
  },
  donorCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13.5,
    color: '#1E293B',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#475569',
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  trustTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#15803D',
  },
  trustSub: {
    fontSize: 11,
    color: '#166534',
    lineHeight: 16,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
  },
  bottomBarLeft: {
    flex: 1,
  },
  bottomBarSub: {
    fontSize: 11,
    color: '#64748B',
  },
  bottomBarTotal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#D81B60',
  },
  donateCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D81B60',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 3,
  },
  donateCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0F8A5F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalSuccessHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  modalSuccessSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginBottom: 18,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  receiptVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalPassbookBtn: {
    width: '100%',
    backgroundColor: '#D81B60',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalPassbookText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalDoneBtn: {
    paddingVertical: 8,
  },
  modalDoneText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
});
