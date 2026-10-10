import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ActivityIndicator,
  Modal,
  Linking,
  AppState,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import { getData, postData } from '../API';
import DonationStatsWidget from '../components/DonationStatsWidget';

const PRESET_AMOUNTS = [501, 1100, 2100, 5100, 11000];

export default function DonationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const reduxUser = useSelector(state => state.user);

  // Tabs: 'general' | 'specific'
  const initialTab = route.params?.vivahSahayogId ? 'specific' : 'general';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [vivahSahayogId, setVivahSahayogId] = useState(
    route.params?.vivahSahayogId || ''
  );

  // Amount
  const [amount, setAmount] = useState('2100');

  // Donor Details
  const initialName =
    reduxUser?.name ||
    reduxUser?.user?.name ||
    reduxUser?.Data?.name ||
    '';
  const initialPhone =
    reduxUser?.mobile ||
    reduxUser?.phone ||
    reduxUser?.user?.mobile ||
    reduxUser?.Data?.mobile ||
    '';

  const [donorName, setDonorName] = useState(initialName);
  const [donorPhone, setDonorPhone] = useState(initialPhone);
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPan, setDonorPan] = useState('');
  const [donorMessage, setDonorMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'wallet'
  const [walletBalance, setWalletBalance] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Wallet MPIN Modal
  const [showMpinModal, setShowMpinModal] = useState(false);
  const [mPin, setMPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Gateway tracking
  const [awaitingGatewayReturn, setAwaitingGatewayReturn] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [activePaymentUrl, setActivePaymentUrl] = useState(null);
  const appState = useRef(AppState.currentState);
  const handleVerifyDonationRef = useRef(null);

  // Fetch Wallet Balance
  const fetchWalletInfo = useCallback(async () => {
    try {
      const res = await getData('api/wallet/info');
      if (res?.Status || res?.success) {
        const bal = res?.Data?.balance ?? res?.data?.balance ?? 0;
        setWalletBalance(bal);
      }
    } catch (e) {
      console.log('Wallet fetch error:', e);
    }
  }, []);

  useEffect(() => {
    fetchWalletInfo();
  }, [fetchWalletInfo]);

  // AppState Listener to Auto-Verify after returning from UPI App
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        awaitingGatewayReturn &&
        activeOrderId
      ) {
        console.log('App returned from background! Verifying donation payment...');
        handleVerifyDonationRef.current?.(activeOrderId);
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [awaitingGatewayReturn, activeOrderId]);

  // Validation
  const validateForm = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 1) {
      Toast.show({
        type: 'error',
        text1: 'अमान्य राशि',
        text2: 'कृपया कम से कम ₹1 या अधिक की राशि दर्ज करें।',
      });
      return false;
    }

    if (!donorName.trim() && !isAnonymous) {
      Toast.show({
        type: 'error',
        text1: 'नाम आवश्यक है',
        text2: 'कृपया दानदाता का पूरा नाम दर्ज करें।',
      });
      return false;
    }

    const cleanPhone = donorPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      Toast.show({
        type: 'error',
        text1: 'मोबाइल नंबर अमान्य',
        text2: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।',
      });
      return false;
    }

    if (activeTab === 'specific' && !vivahSahayogId.trim()) {
      Toast.show({
        type: 'error',
        text1: 'ID आवश्यक है',
        text2: 'कृपया बालिका की Vivah Sahayog ID (उदा. VSA-XXXX) दर्ज करें।',
      });
      return false;
    }

    if (donorPan.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(donorPan.toUpperCase().trim())) {
        Toast.show({
          type: 'error',
          text1: 'अमान्य PAN नंबर',
          text2: 'कृपया 10 अक्षरों का मान्य PAN नंबर (उदा. ABCDE1234F) दर्ज करें।',
        });
        return false;
      }
    }

    return true;
  };

  // 1️⃣ GATEWAY PAYMENT FLOW
  const handleGatewayPayment = async () => {
    const numAmount = parseFloat(amount);
    setSubmitting(true);
    try {
      const orderPayload = {
        amount: numAmount,
        donorName: isAnonymous ? 'गुप्त दानी (Anonymous)' : donorName.trim(),
        donorPhone: donorPhone.trim(),
        donorEmail: donorEmail.trim() || undefined,
        donorPan: donorPan.toUpperCase().trim() || undefined,
        vivahSahayogId: activeTab === 'specific' ? vivahSahayogId.trim() : undefined,
        donorMessage: donorMessage.trim() || undefined,
        isAnonymous: Boolean(isAnonymous),
        gateway: 'TezGateway',
        redirectUrl: 'https://sarvana.techember.in/donation/receipt',
      };

      console.log('CREATE DONATION ORDER PAYLOAD:', orderPayload);
      const res = await postData('/api/donation/create-order', orderPayload);
      console.log('DONATION ORDER RES:', res);

      const orderId =
        res?.Data?.orderId ||
        res?.data?.orderId ||
        res?.orderId ||
        `DON_${Date.now()}`;
      setActiveOrderId(orderId);

      const paymentUrl =
        res?.Data?.payment_url ||
        res?.data?.payment_url ||
        res?.result?.payment_url ||
        res?.payment_url;

      const upiIntent =
        res?.Data?.upi_intent ||
        res?.data?.upi_intent ||
        res?.Data?.bhim_link ||
        res?.bhim_link;

      setActivePaymentUrl(paymentUrl || upiIntent || null);

      // On Mobile: Try opening UPI intent directly
      if (upiIntent) {
        setAwaitingGatewayReturn(true);
        const supported = await Linking.canOpenURL(upiIntent).catch(() => false);
        if (supported) {
          await Linking.openURL(upiIntent);
          return;
        }
      }

      // If payment_url exists, navigate to PaymentWebview
      if (paymentUrl) {
        setAwaitingGatewayReturn(true);
        navigation.navigate('PaymentWebview', {
          paymentUrl,
          orderId,
          amount: String(numAmount),
          from: 'sahayog-donation',
        });
      } else {
        // Fallback simulation / verification
        handleVerifyDonation(orderId);
      }
    } catch (err) {
      console.log('Donation order creation error:', err);
      // If endpoint returned error, attempt fallback to direct verify or show alert
      Toast.show({
        type: 'error',
        text1: 'भुगतान त्रुटि',
        text2: err?.response?.data?.Remarks || 'गेटवे शुरू नहीं हो सका। पुनः प्रयास करें।',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 2️⃣ VERIFY GATEWAY DONATION
  const handleVerifyDonation = async orderIdToVerify => {
    try {
      setSubmitting(true);
      const verifyRes = await postData('/api/donation/verify', {
        orderId: orderIdToVerify || activeOrderId,
      });

      console.log('DONATION VERIFY RES:', verifyRes);
      setAwaitingGatewayReturn(false);

      navigation.navigate('DonationReceipt', {
        receipt: verifyRes?.Data || verifyRes?.data || verifyRes,
        orderId: orderIdToVerify || activeOrderId,
        amount: parseFloat(amount),
        donorName: isAnonymous ? 'गुप्त दानी' : donorName,
        donorPhone,
        donorPan: donorPan.toUpperCase().trim(),
        vivahSahayogId: activeTab === 'specific' ? vivahSahayogId.trim() : undefined,
        paymentUrl: activePaymentUrl,
      });
    } catch (err) {
      console.log('Verify donation error:', err);
      // Fallback navigate to receipt screen with parameters
      navigation.navigate('DonationReceipt', {
        orderId: orderIdToVerify || activeOrderId,
        amount: parseFloat(amount),
        donorName: isAnonymous ? 'गुप्त दानी' : donorName,
        donorPhone,
        donorPan: donorPan.toUpperCase().trim(),
        vivahSahayogId: activeTab === 'specific' ? vivahSahayogId.trim() : undefined,
        paymentUrl: activePaymentUrl,
      });
    } finally {
      setSubmitting(false);
    }
  };
  handleVerifyDonationRef.current = handleVerifyDonation;

  // 3️⃣ WALLET DONATION FLOW (MPIN)
  const handleWalletSubmit = async () => {
    if (mPin.length < 4) {
      Toast.show({
        type: 'error',
        text1: 'अमान्य MPIN',
        text2: 'कृपया 4 या 6 अंकों का मान्य MPIN दर्ज करें।',
      });
      return;
    }

    setSubmitting(true);
    setShowMpinModal(false);
    const numAmount = parseFloat(amount);

    try {
      const payload = {
        amount: numAmount,
        mPin,
        vivahSahayogId: activeTab === 'specific' ? vivahSahayogId.trim() : undefined,
        donorPan: donorPan.toUpperCase().trim() || undefined,
      };

      console.log('PAY WALLET DONATION PAYLOAD:', payload);
      const res = await postData('/api/donation/pay-wallet', payload);
      console.log('PAY WALLET RES:', res);

      if (res && (!res.Error || res.Status || res.success)) {
        setWalletBalance(prev => Math.max(0, prev - numAmount));
        Toast.show({
          type: 'success',
          text1: 'सहयोग सफल! 🙏',
          text2: `₹${numAmount} का सहयोग सफलतापूर्वक संपन्न हुआ।`,
        });

        navigation.navigate('DonationReceipt', {
          receipt: res?.Data || res?.data || res,
          orderId: res?.Data?.orderId || res?.Data?.txnId || `WLT_${Date.now()}`,
          amount: numAmount,
          donorName: isAnonymous ? 'गुप्त दानी' : donorName,
          donorPhone,
          donorPan: donorPan.toUpperCase().trim(),
          vivahSahayogId: activeTab === 'specific' ? vivahSahayogId.trim() : undefined,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'वॉलेट भुगतान विफल',
          text2: res?.Remarks || 'MPIN गलत है या अपर्याप्त बैलेंस।',
        });
      }
    } catch (err) {
      console.log('Wallet donation error:', err);
      Toast.show({
        type: 'error',
        text1: 'भुगतान विफल',
        text2: err?.response?.data?.Remarks || 'वॉलेट से भुगतान नहीं हो सका।',
      });
    } finally {
      setSubmitting(false);
      setMPin('');
    }
  };

  // Main Submit Handler
  const handleProceed = () => {
    if (!validateForm()) return;

    const numAmount = parseFloat(amount);

    if (paymentMethod === 'wallet') {
      if (walletBalance < numAmount) {
        Alert.alert(
          'अपर्याप्त वॉलेट बैलेंस',
          `सहयोग राशि ₹${numAmount} है। आपके वॉलेट में ₹${walletBalance.toFixed(2)} उपलब्ध हैं।`,
          [
            { text: 'UPI से भुगतान करें', onPress: () => setPaymentMethod('upi') },
            {
              text: 'Add Money (वॉलेट रिचार्ज)',
              onPress: () => navigation.navigate('WalletTopupScreen'),
            },
          ]
        );
        return;
      }
      setShowMpinModal(true);
    } else {
      handleGatewayPayment();
    }
  };

  const numAmount = parseFloat(amount) || 0;

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <View style={s.headerTitleCol}>
          <Text style={s.headerTitle}>SARVANA VIVAH SAHAYOG</Text>
          <Text style={s.headerSub}>NGO Donation & 80G Tax Exemption</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('SahayogAccount')}
          style={s.historyBtn}
          activeOpacity={0.7}
        >
          <MaterialIcon name="history" size={22} color="#D81B60" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* NGO Trust Banner */}
        <View style={s.bannerCard}>
          <View style={s.bannerIconRing}>
            <FontAwesome5 name="hands-helping" size={22} color="#D81B60" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.bannerTitle}>बेटी विवाह सहयोग महादान</Text>
            <Text style={s.bannerSub}>
              "कन्यादान महादान — बेटियों के सुखद भविष्य का संकल्प"
            </Text>
          </View>
          <View style={s.taxBadge}>
            <Text style={s.taxBadgeText}>80G EXEMPT</Text>
          </View>
        </View>

        {/* ─── TABS / SWITCHER ─── */}
        <View style={s.tabContainer}>
          <TouchableOpacity
            style={[s.tabItem, activeTab === 'general' && s.tabItemActive]}
            onPress={() => setActiveTab('general')}
            activeOpacity={0.85}
          >
            <FontAwesome5
              name="hand-holding-heart"
              size={13}
              color={activeTab === 'general' ? '#D81B60' : '#64748B'}
            />
            <Text style={[s.tabText, activeTab === 'general' && s.tabTextActive]}>
              सामान्य NGO कोष (General Fund)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.tabItem, activeTab === 'specific' && s.tabItemActive]}
            onPress={() => setActiveTab('specific')}
            activeOpacity={0.85}
          >
            <MaterialIcon
              name="account-child-circle"
              size={16}
              color={activeTab === 'specific' ? '#D81B60' : '#64748B'}
            />
            <Text style={[s.tabText, activeTab === 'specific' && s.tabTextActive]}>
              विशेष बालिका को सहयोग (Specific Girl)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Specific Girl Child ID Input */}
        {activeTab === 'specific' && (
          <View style={s.specificBox}>
            <Text style={s.inputLabel}>
              बालिका की Vivah Sahayog ID <Text style={s.reqStar}>*</Text>
            </Text>
            <View style={s.inputWrapper}>
              <MaterialIcon name="identifier" size={20} color="#D81B60" style={s.inputIcon} />
              <TextInput
                style={s.textInput}
                placeholder="उदा. VSA-2026-0891"
                placeholderTextColor="#94A3B8"
                value={vivahSahayogId}
                onChangeText={setVivahSahayogId}
                autoCapitalize="characters"
              />
            </View>
            <Text style={s.specificHelpText}>
              यह राशि सीधे चयनित बालिका के विवाह फंड वॉलेट में जमा होगी।
            </Text>
          </View>
        )}

        {/* ─── AMOUNT PRESETS ─── */}
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>सहयोग राशि चुनें (Donation Amount)</Text>

          {/* Quick Chips */}
          <View style={s.chipsWrap}>
            {PRESET_AMOUNTS.map(val => {
              const isSelected = amount === String(val);
              return (
                <TouchableOpacity
                  key={val}
                  style={[s.chip, isSelected && s.chipSelected]}
                  onPress={() => setAmount(String(val))}
                  activeOpacity={0.85}
                >
                  <Text style={[s.chipText, isSelected && s.chipTextSelected]}>
                    ₹{val.toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Amount Input */}
          <View style={s.customAmountBox}>
            <Text style={s.rupeePrefix}>₹</Text>
            <TextInput
              style={s.amountInput}
              keyboardType="numeric"
              placeholder="अन्य राशि दर्ज करें"
              placeholderTextColor="#94A3B8"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {/* ─── DONOR FORM FIELDS ─── */}
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>दानी बंधु का विवरण (Donor Details)</Text>

          {/* Donor Name */}
          <View style={s.formField}>
            <Text style={s.inputLabel}>
              पूरा नाम (Full Name) {!isAnonymous && <Text style={s.reqStar}>*</Text>}
            </Text>
            <View style={s.inputWrapper}>
              <FeatherIcon name="user" size={18} color="#64748B" style={s.inputIcon} />
              <TextInput
                style={s.textInput}
                placeholder="उदा. आनंद शर्मा"
                placeholderTextColor="#94A3B8"
                value={donorName}
                onChangeText={setDonorName}
                editable={!isAnonymous}
              />
            </View>
          </View>

          {/* Mobile Number */}
          <View style={s.formField}>
            <Text style={s.inputLabel}>
              मोबाइल नंबर (10 अंक) <Text style={s.reqStar}>*</Text>
            </Text>
            <View style={s.inputWrapper}>
              <FeatherIcon name="phone" size={18} color="#64748B" style={s.inputIcon} />
              <TextInput
                style={s.textInput}
                placeholder="उदा. 9876543210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                value={donorPhone}
                onChangeText={setDonorPhone}
              />
            </View>
          </View>

          {/* Email */}
          <View style={s.formField}>
            <Text style={s.inputLabel}>ईमेल (Email ID - रसीद प्राप्त करने हेतु)</Text>
            <View style={s.inputWrapper}>
              <FeatherIcon name="mail" size={18} color="#64748B" style={s.inputIcon} />
              <TextInput
                style={s.textInput}
                placeholder="उदा. donor@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={donorEmail}
                onChangeText={setDonorEmail}
              />
            </View>
          </View>

          {/* PAN Card Number for 80G */}
          <View style={s.formField}>
            <View style={s.panLabelRow}>
              <Text style={s.inputLabel}>पैन कार्ड नंबर (PAN Number)</Text>
              <View style={s.panBadge}>
                <Text style={s.panBadgeText}>80G रसीद हेतु</Text>
              </View>
            </View>
            <View style={s.inputWrapper}>
              <MaterialIcon name="card-account-details-outline" size={18} color="#64748B" style={s.inputIcon} />
              <TextInput
                style={s.textInput}
                placeholder="उदा. ABCDE1234F"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                maxLength={10}
                value={donorPan}
                onChangeText={setDonorPan}
              />
            </View>
            <Text style={s.fieldNote}>
              * आयकर छूट (Section 80G Income Tax Exemption) रसीद हेतु PAN आवश्यक है।
            </Text>
          </View>

          {/* Blessing Message */}
          <View style={s.formField}>
            <Text style={s.inputLabel}>आशीर्वाद / शुभकामना संदेश (Blessing Message)</Text>
            <View style={[s.inputWrapper, { height: 74, alignItems: 'flex-start' }]}>
              <MaterialIcon name="message-heart-outline" size={18} color="#64748B" style={[s.inputIcon, { marginTop: 10 }]} />
              <TextInput
                style={[s.textInput, { height: 68, textAlignVertical: 'top', paddingTop: 8 }]}
                placeholder="बेटी के लिए शुभकामनाएँ लिखें (उदा. सदा सुखी रहो...)"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={donorMessage}
                onChangeText={setDonorMessage}
              />
            </View>
          </View>

          {/* Anonymous Checkbox */}
          <TouchableOpacity
            style={s.checkboxRow}
            onPress={() => setIsAnonymous(!isAnonymous)}
            activeOpacity={0.85}
          >
            <View style={[s.checkbox, isAnonymous && s.checkboxChecked]}>
              {isAnonymous && <FeatherIcon name="check" size={14} color="#FFF" />}
            </View>
            <Text style={s.checkboxLabel}>
              गुप्त दान करें (सार्वजनिक रूप से मेरा नाम न दिखाएँ)
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─── PAYMENT METHOD ─── */}
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>भुगतान का माध्यम (Payment Method)</Text>

          {/* UPI Gateway */}
          <TouchableOpacity
            style={[s.methodCard, paymentMethod === 'upi' && s.methodCardSelected]}
            onPress={() => setPaymentMethod('upi')}
            activeOpacity={0.85}
          >
            <View style={s.radioCircle}>
              {paymentMethod === 'upi' && <View style={s.radioDot} />}
            </View>
            <View style={s.methodIconRing}>
              <MaterialIcon name="qrcode-scan" size={20} color="#D81B60" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.methodTitle}>UPI / Payment Gateway (TezGateway)</Text>
              <Text style={s.methodDesc}>
                Google Pay • PhonePe • Paytm • BHIM • Cards
              </Text>
            </View>
            <View style={s.instantBadge}>
              <Text style={s.instantText}>Zero Fee</Text>
            </View>
          </TouchableOpacity>

          {/* App Wallet */}
          <TouchableOpacity
            style={[s.methodCard, paymentMethod === 'wallet' && s.methodCardSelected]}
            onPress={() => setPaymentMethod('wallet')}
            activeOpacity={0.85}
          >
            <View style={s.radioCircle}>
              {paymentMethod === 'wallet' && <View style={s.radioDot} />}
            </View>
            <View style={[s.methodIconRing, { backgroundColor: '#ECFDF5' }]}>
              <MaterialIcon name="wallet-outline" size={20} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.methodTitle}>SARVANA App Wallet</Text>
              <Text style={s.methodDesc}>
                उपलब्ध बैलेंस: ₹{walletBalance.toFixed(2)}
              </Text>
            </View>
            {walletBalance < numAmount ? (
              <View style={s.lowBalBadge}>
                <Text style={s.lowBalText}>कम बैलेंस</Text>
              </View>
            ) : (
              <View style={s.okBalBadge}>
                <Text style={s.okBalText}>सक्रिय</Text>
              </View>
            )}
          </TouchableOpacity>

          {paymentMethod === 'wallet' && walletBalance < numAmount && (
            <View style={s.topupAlertBox}>
              <MaterialIcon name="alert-circle-outline" size={16} color="#B45309" />
              <Text style={s.topupAlertText}>
                वॉलेट में ₹{(numAmount - walletBalance).toFixed(2)} की कमी है।
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('WalletTopupScreen')}
                style={s.topupBtn}
              >
                <Text style={s.topupBtnText}>+ रिचार्ज करें</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Live Metrics & Blessings Wall Widget */}
        <DonationStatsWidget />

        {/* Submit CTA */}
        <TouchableOpacity
          style={[s.ctaBtn, submitting && s.ctaBtnDisabled]}
          onPress={handleProceed}
          activeOpacity={0.88}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <FontAwesome5 name="heart" size={16} color="#FFF" solid />
              <Text style={s.ctaBtnText}>
                ₹{numAmount.toLocaleString('en-IN')} का सहयोग करें
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── WALLET MPIN MODAL ─── */}
      <Modal
        visible={showMpinModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMpinModal(false)}
      >
        <View style={s.mpinOverlay}>
          <View style={s.mpinCard}>
            <View style={s.mpinHeader}>
              <Text style={s.mpinTitle}>वॉलेट MPIN सत्यापन</Text>
              <TouchableOpacity onPress={() => setShowMpinModal(false)}>
                <FeatherIcon name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={s.mpinDesc}>
              सहयोग राशि ₹{numAmount.toLocaleString('en-IN')} का भुगतान आपके SARVANA वॉलेट से काटा जाएगा।
            </Text>

            <View style={s.mpinInputWrap}>
              <TextInput
                style={s.mpinInput}
                value={mPin}
                onChangeText={setMPin}
                placeholder="••••"
                placeholderTextColor="#CBD5E1"
                keyboardType="number-pad"
                maxLength={6}
                secureTextEntry={!showPin}
                autoFocus
              />
              <TouchableOpacity onPress={() => setShowPin(!showPin)} style={s.eyeBtn}>
                <FeatherIcon name={showPin ? 'eye-off' : 'eye'} size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[s.mpinSubmitBtn, mPin.length < 4 && s.ctaBtnDisabled]}
              disabled={mPin.length < 4 || submitting}
              onPress={handleWalletSubmit}
              activeOpacity={0.88}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={s.mpinSubmitText}>भुगतान की पुष्टि करें</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 4 },
  headerTitleCol: { alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '900', color: '#D81B60', letterSpacing: 0.3 },
  headerSub: { fontSize: 10.5, color: '#64748B', fontWeight: '600' },
  historyBtn: { padding: 6, backgroundColor: '#FFF0F5', borderRadius: 8 },
  scroll: { padding: 16 },

  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    gap: 12,
  },
  bannerIconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  bannerTitle: { fontSize: 14.5, fontWeight: '900', color: '#831843' },
  bannerSub: { fontSize: 11, color: '#9D174D', marginTop: 1, lineHeight: 15 },
  taxBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  taxBadgeText: { fontSize: 9.5, fontWeight: '900', color: '#059669' },

  /* Tab Switcher */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabItemActive: { backgroundColor: '#FFFFFF', elevation: 2 },
  tabText: { fontSize: 11.5, fontWeight: '700', color: '#64748B', textAlign: 'center' },
  tabTextActive: { color: '#D81B60', fontWeight: '900' },

  specificBox: {
    backgroundColor: '#FFF9FB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  specificHelpText: { fontSize: 10.5, color: '#D81B60', marginTop: 6, fontWeight: '600' },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },

  /* Preset Chips */
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  chipSelected: { backgroundColor: '#D81B60', borderColor: '#D81B60' },
  chipText: { fontSize: 13, fontWeight: '800', color: '#475569' },
  chipTextSelected: { color: '#FFFFFF' },

  customAmountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 50,
  },
  rupeePrefix: { fontSize: 20, fontWeight: '900', color: '#D81B60', marginRight: 8 },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },

  /* Form Fields */
  formField: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 5 },
  reqStar: { color: '#EF4444' },
  panLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  panBadgeText: { fontSize: 9.5, fontWeight: '800', color: '#059669' },
  fieldNote: { fontSize: 10.5, color: '#64748B', marginTop: 4, fontStyle: 'italic' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: { marginRight: 8 },
  textInput: { flex: 1, fontSize: 13, color: '#1E293B', fontWeight: '600' },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    paddingVertical: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#D81B60', borderColor: '#D81B60' },
  checkboxLabel: { fontSize: 12, color: '#475569', fontWeight: '600' },

  /* Payment Methods */
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  methodCardSelected: { borderColor: '#D81B60' },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D81B60' },
  methodIconRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  methodDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
  instantBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  instantText: { fontSize: 10, fontWeight: '800', color: '#2563EB' },
  okBalBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  okBalText: { fontSize: 10, fontWeight: '800', color: '#059669' },
  lowBalBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  lowBalText: { fontSize: 10, fontWeight: '800', color: '#DC2626' },

  topupAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
    marginBottom: 4,
  },
  topupAlertText: { flex: 1, fontSize: 11.5, color: '#B45309', fontWeight: '600' },
  topupBtn: { backgroundColor: '#D97706', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  topupBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  ctaBtn: {
    backgroundColor: '#D81B60',
    borderRadius: 30,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  /* MPIN Modal */
  mpinOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  mpinCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  mpinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mpinTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  mpinDesc: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 20 },
  mpinInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 20,
  },
  mpinInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 8,
    color: '#0F172A',
    textAlign: 'center',
  },
  eyeBtn: { padding: 6 },
  mpinSubmitBtn: {
    backgroundColor: '#059669',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  mpinSubmitText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
