import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
  Linking,
  AppState,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import useFundAccount, { getDocumentUrl } from '../hooks/useFundAccount';
import { getData } from '../API';

// ─── Step Progress ─────────────────────────────────────────────────────────────
const StepProgress = ({ current }) => (
  <View style={sp.wrapper}>
    {[
      { n: 1, label: 'व्यक्तिगत\nजानकारी' },
      { n: 2, label: 'दस्तावेज़\nअपलोड' },
      { n: 3, label: 'समीक्षा व\nशुल्क भुगतान' },
    ].map((step, idx) => (
      <React.Fragment key={step.n}>
        <View style={sp.stepItem}>
          <View style={[sp.circle, current >= step.n && sp.circleActive]}>
            {current > step.n ? (
              <FeatherIcon name="check" size={14} color="#FFFFFF" />
            ) : (
              <Text style={[sp.circleNum, current >= step.n && sp.circleNumActive]}>
                {step.n}
              </Text>
            )}
          </View>
          <Text style={[sp.label, current === step.n && sp.labelActive]}>
            {step.label}
          </Text>
        </View>
        {idx < 2 && <View style={[sp.line, current > step.n && sp.lineActive]} />}
      </React.Fragment>
    ))}
  </View>
);

const sp = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF0F5',
  },
  stepItem: { alignItems: 'center', flex: 0 },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: { backgroundColor: '#D81B60', borderColor: '#D81B60' },
  circleNum: { fontSize: 13, fontWeight: '700', color: '#94A3B8' },
  circleNumActive: { color: '#FFFFFF' },
  label: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 14,
    fontWeight: '600',
  },
  labelActive: { color: '#D81B60' },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 15,
    marginHorizontal: 4,
  },
  lineActive: { backgroundColor: '#D81B60' },
});

const InfoRow = ({ label, value }) => (
  <View style={ir.row}>
    <Text style={ir.label}>{label}</Text>
    <Text style={ir.value}>{value || '—'}</Text>
  </View>
);

const ir = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: { flex: 1, fontSize: 13, color: '#64748B', fontWeight: '600' },
  value: {
    flex: 1.2,
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
    textAlign: 'right',
  },
});

// ─── Success Modal ─────────────────────────────────────────────────────────────
const SuccessModal = ({ visible, vivahSahayogId, onDone }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={sm.overlay}>
        <View style={sm.card}>
          <View style={sm.iconRing}>
            <MaterialIcon name="check-decagram" size={56} color="#059669" />
          </View>
          <Text style={sm.title}>बधाई हो! 🎉</Text>
          <Text style={sm.subheading}>
            पंजीकरण शुल्क ₹2,000 प्राप्त हुआ और आपका आवेदन सफलतापूर्वक सबमिट हो चुका है।
          </Text>

          {vivahSahayogId ? (
            <View style={sm.idBadge}>
              <Text style={sm.idLabel}>आवंटित Vivah Sahayog ID:</Text>
              <Text style={sm.idValue}>{vivahSahayogId}</Text>
            </View>
          ) : null}

          <View style={sm.statusPill}>
            <MaterialIcon name="shield-check" size={16} color="#047857" />
            <Text style={sm.statusPillText}>
              Application Submitted for Admin Verification
            </Text>
          </View>

          <View style={sm.divider} />
          <Text style={sm.infoText}>
            🛡️ एडमिन द्वारा दस्तावेज़ सत्यापन के बाद फंड वॉलेट सक्रिय कर दिया जाएगा।
          </Text>
          <Text style={sm.mobileNotice}>
            समीक्षा स्थिति की सूचना आपके पंजीकृत मोबाइल नंबर पर SMS द्वारा भी भेजी जाएगी।
          </Text>
          <TouchableOpacity style={sm.btn} onPress={onDone} activeOpacity={0.85}>
            <Text style={sm.btnText}>मुख्य पृष्ठ पर जाएं</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const sm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    elevation: 20,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  iconRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13.5,
    color: '#334155',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    marginVertical: 4,
  },
  idLabel: { fontSize: 12, color: '#831843', fontWeight: '700' },
  idValue: {
    fontSize: 14,
    color: '#D81B60',
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusPillText: { fontSize: 11.5, fontWeight: '700', color: '#047857' },
  divider: {
    width: '50%',
    height: 1.5,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  infoText: {
    fontSize: 12.5,
    color: '#059669',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  mobileNotice: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 16,
  },
  btn: {
    backgroundColor: '#D81B60',
    borderRadius: 30,
    height: 48,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 3,
  },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});

// ─── Wallet MPIN Modal ─────────────────────────────────────────────────────────
const WalletMpinModal = ({
  visible,
  loading,
  onClose,
  onSubmit,
  amount = 2000,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleConfirm = () => {
    if (pin.length < 4) {
      Toast.show({
        type: 'error',
        text1: 'अमान्य MPIN',
        text2: 'कृपया 4 या 6 अंकों का मान्य MPIN दर्ज करें।',
      });
      return;
    }
    onSubmit(pin);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={mpm.overlay}>
        <View style={mpm.card}>
          <View style={mpm.header}>
            <View style={mpm.titleRow}>
              <MaterialIcon name="wallet" size={24} color="#D81B60" />
              <Text style={mpm.title}>वॉलेट MPIN सत्यापन</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={mpm.closeBtn}>
              <FeatherIcon name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={mpm.sub}>
            पंजीकरण शुल्क ₹{amount.toLocaleString('en-IN')} का भुगतान आपके SARVANA वॉलेट से काटा जाएगा।
          </Text>

          <View style={mpm.inputBox}>
            <TextInput
              style={mpm.pinInput}
              value={pin}
              onChangeText={setPin}
              placeholder="••••"
              placeholderTextColor="#CBD5E1"
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry={!showPin}
              autoFocus
            />
            <TouchableOpacity onPress={() => setShowPin(!showPin)} style={mpm.eyeBtn}>
              <FeatherIcon name={showPin ? 'eye-off' : 'eye'} size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[mpm.payBtn, (pin.length < 4 || loading) && mpm.payBtnDisabled]}
            disabled={pin.length < 4 || loading}
            onPress={handleConfirm}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={mpm.payBtnText}>₹{amount.toLocaleString('en-IN')} भुगतान करें</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const mpm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 24,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  closeBtn: { padding: 4 },
  sub: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 20 },
  inputBox: {
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
  pinInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 8,
    color: '#0F172A',
    textAlign: 'center',
  },
  eyeBtn: { padding: 6 },
  payBtn: {
    backgroundColor: '#059669',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function FundAccountStep3Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const fundAccountId = route.params?.fundAccountId;
  const initialStep1 = route.params?.step1Data || {};
  const files = route.params?.files || {};

  const {
    submit,
    loading: hookLoading,
    profile,
    fetchProfile,
    fetchDraft,
    fetchStatus,
    payRegistrationGateway,
    verifyRegistrationPayment,
    payRegistrationWallet,
  } = useFundAccount();

  const [loading, setLoading] = useState(false);
  const [declared, setDeclared] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [step1Data, setStep1Data] = useState(initialStep1);
  const [successId, setSuccessId] = useState(
    route.params?.vivahSahayogId || route.params?.draftData?.vivahSahayogId || ''
  );
  const [previewDoc, setPreviewDoc] = useState(null);

  // Payment states
  const REGISTRATION_FEE = 2000;
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'wallet'
  const [paymentStatus, setPaymentStatus] = useState(
    route.params?.paymentVerified ? 'paid' : 'unpaid'
  ); // 'unpaid' | 'pending' | 'paid'
  const [activeOrderId, setActiveOrderId] = useState(route.params?.orderId || null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showMpinModal, setShowMpinModal] = useState(false);
  const [awaitingGatewayReturn, setAwaitingGatewayReturn] = useState(false);

  const appState = useRef(AppState.currentState);
  const handleVerifyGatewayRef = useRef(null);

  // Fetch Wallet Balance
  const fetchWallet = useCallback(async () => {
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

  // Initial Data & Status Loading
  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.allSettled([fetchProfile(), fetchWallet()]);

      // Check status from API
      const statusRes = await fetchStatus();
      if (statusRes?.Data) {
        const d = statusRes.Data;
        if (d.formData) setStep1Data(d.formData);
        if (d.vivahSahayogId) setSuccessId(d.vivahSahayogId);

        // Inspect payment status
        const payStat =
          d.payment?.paymentStatus ||
          d.paymentStatus ||
          (d.progress?.isPaymentComplete ? 'paid' : 'unpaid');

        if (payStat === 'paid' || d.progress?.isPaymentComplete) {
          setPaymentStatus('paid');
          if (d.vivahSahayogId) setSuccessId(d.vivahSahayogId);
        } else if (payStat === 'pending') {
          setPaymentStatus('pending');
        }
      } else {
        const draftRes = await fetchDraft();
        if (draftRes?.Data) {
          if (draftRes.Data.formData) setStep1Data(draftRes.Data.formData);
          if (draftRes.Data.vivahSahayogId) setSuccessId(draftRes.Data.vivahSahayogId);
        }
      }
    } catch (err) {
      console.log('Load status error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, fetchWallet, fetchStatus, fetchDraft]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Handle direct return with verified payment from params
  useEffect(() => {
    if (route.params?.paymentVerified) {
      setPaymentStatus('paid');
      const id = route.params?.vivahSahayogId;
      if (id) {
        setSuccessId(id);
      }
      setShowSuccess(true);
    }
  }, [route.params?.paymentVerified, route.params?.vivahSahayogId]);

  // AppState Listener to Auto-Verify after UPI Gateway Return
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        awaitingGatewayReturn &&
        activeOrderId
      ) {
        console.log('App returned from background! Verifying registration payment...');
        handleVerifyGatewayRef.current?.(activeOrderId);
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [awaitingGatewayReturn, activeOrderId]);

  // Target Fund Account ID
  const targetFundAccountId =
    fundAccountId ||
    route.params?.draftData?.fundAccountId ||
    profile?.fundAccountId ||
    profile?._id;

  // 1️⃣ Initiate Gateway Payment (TezGateway UPI intent / QR / checkout)
  const handleGatewayPayment = async () => {
    try {
      setLoading(true);
      const res = await payRegistrationGateway({
        gateway: 'TezGateway',
        redirectUrl: 'https://sarvana.techember.in/payment-callback',
      });

      console.log('REGISTRATION PAY RES:', res);

      const orderId =
        res?.Data?.orderId ||
        res?.data?.orderId ||
        res?.orderId ||
        `VSA_REG_${Date.now()}`;
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

      // On Mobile: Try opening UPI intent directly
      if (upiIntent) {
        setAwaitingGatewayReturn(true);
        const supported = await Linking.canOpenURL(upiIntent).catch(() => false);
        if (supported) {
          await Linking.openURL(upiIntent);
          return;
        }
      }

      // If payment_url exists: Navigate to PaymentWebview
      if (paymentUrl) {
        setAwaitingGatewayReturn(true);
        navigation.navigate('PaymentWebview', {
          paymentUrl,
          orderId,
          amount: String(REGISTRATION_FEE),
          from: 'fund-account-reg',
        });
      } else {
        // Direct simulation / fallback
        handleVerifyGateway(orderId);
      }
    } catch (err) {
      console.log('Gateway payment error:', err);
      Toast.show({
        type: 'error',
        text1: 'भुगतान त्रुटि',
        text2: err?.response?.data?.Remarks || 'गेटवे शुरू नहीं हो सका। पुनः प्रयास करें।',
      });
    } finally {
      setLoading(false);
    }
  };

  // 2️⃣ Verify Gateway Payment
  const handleVerifyGateway = async orderIdToVerify => {
    try {
      setLoading(true);
      const verifyRes = await verifyRegistrationPayment({
        orderId: orderIdToVerify || activeOrderId,
      });

      console.log('VERIFY PAYMENT RES:', verifyRes);

      if (verifyRes && (!verifyRes.Error || verifyRes.Status)) {
        setPaymentStatus('paid');
        setAwaitingGatewayReturn(false);
        const generatedId =
          verifyRes.Data?.vivahSahayogId ||
          verifyRes.Data?.account?.vivahSahayogId ||
          successId ||
          profile?.vivahSahayogId;
        if (generatedId) setSuccessId(generatedId);
        setShowSuccess(true);
      } else {
        Toast.show({
          type: 'info',
          text1: 'सत्यापन प्रक्रियाधीन',
          text2: verifyRes?.Remarks || 'भुगतान की पुष्टि जांची जा रही है...',
        });
      }
    } catch (err) {
      console.log('Verify payment error:', err);
      Toast.show({
        type: 'error',
        text1: 'सत्यापन सूचना',
        text2: 'यदि राशि कट गई है, तो कुछ मिनट प्रतीक्षा करें या सहायता से संपर्क करें।',
      });
    } finally {
      setLoading(false);
    }
  };
  handleVerifyGatewayRef.current = handleVerifyGateway;

  // 3️⃣ Wallet Payment (MPIN)
  const handleWalletPaymentSubmit = async mPin => {
    try {
      setLoading(true);
      setShowMpinModal(false);

      const res = await payRegistrationWallet({ mPin });
      console.log('WALLET PAY RES:', res);

      if (res && (!res.Error || res.Status)) {
        setPaymentStatus('paid');
        const generatedId =
          res.Data?.vivahSahayogId ||
          res.Data?.account?.vivahSahayogId ||
          successId ||
          profile?.vivahSahayogId;
        if (generatedId) setSuccessId(generatedId);
        setShowSuccess(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'वॉलेट भुगतान विफल',
          text2: res?.Remarks || 'MPIN गलत है या अपर्याप्त बैलेंस।',
        });
      }
    } catch (err) {
      console.log('Wallet pay error:', err);
      Toast.show({
        type: 'error',
        text1: 'त्रुटि',
        text2: err?.response?.data?.Remarks || 'वॉलेट द्वारा भुगतान विफल।',
      });
    } finally {
      setLoading(false);
    }
  };

  // 4️⃣ Main Action Clicked
  const handleProceed = () => {
    if (!declared) {
      Toast.show({
        type: 'error',
        text1: 'सहमति आवश्यक',
        text2: 'कृपया नीचे दी गई घोषणा पर टिक करके सहमति दें।',
      });
      return;
    }

    if (paymentStatus === 'paid') {
      // If fee is already paid, trigger final submission if not submitted
      handleFinalSubmit();
      return;
    }

    if (paymentMethod === 'wallet') {
      if (walletBalance < REGISTRATION_FEE) {
        Alert.alert(
          'अपर्याप्त वॉलेट बैलेंस',
          `पंजीकरण शुल्क ₹${REGISTRATION_FEE} है। आपके वॉलेट में केवल ₹${walletBalance.toFixed(2)} उपलब्ध हैं।`,
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

  // Final Submit fallback (if fee already paid)
  const handleFinalSubmit = async () => {
    if (!targetFundAccountId) {
      Toast.show({ type: 'error', text1: 'त्रुटि', text2: 'Fund Account ID नहीं मिली।' });
      return;
    }
    try {
      setLoading(true);
      const res = await submit(targetFundAccountId);
      if (res && (!res.Error || res.Status)) {
        const generatedId =
          res.Data?.vivahSahayogId ||
          res.Data?.account?.vivahSahayogId ||
          successId ||
          profile?.vivahSahayogId;
        if (generatedId) setSuccessId(generatedId);
        setShowSuccess(true);
      } else {
        Toast.show({ type: 'error', text1: 'त्रुटि', text2: res?.Remarks || 'सबमिट विफल।' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'त्रुटि', text2: 'सबमिट विफल। पुनः प्रयास करें।' });
    } finally {
      setLoading(false);
    }
  };

  const handleDone = async () => {
    setShowSuccess(false);
    await fetchProfile();
    navigation.navigate('VivahSahayogEntry');
  };

  const balikaName = step1Data.balikaName || profile?.balikaName;
  const mobileNumber = step1Data.mobileNumber || profile?.mobileNumber;
  const dob = step1Data.dob || profile?.dob;
  const currentAge = step1Data.currentAge || profile?.currentAge;
  const annualIncome = step1Data.annualIncome || profile?.annualIncome;
  const state = step1Data.state || profile?.state;
  const district = step1Data.district || profile?.district;

  const isFeePaid = paymentStatus === 'paid';

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
        <Text style={s.headerTitle}>समीक्षा व पंजीकरण शुल्क (चरण 3/3)</Text>
        <View style={{ width: 26 }} />
      </View>

      <StepProgress current={3} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Personal Info Summary Card */}
        <View style={s.summaryCard}>
          <View style={s.cardSectionHeader}>
            <MaterialIcon name="account-outline" size={18} color="#D81B60" />
            <Text style={s.cardSectionTitle}>व्यक्तिगत जानकारी विवरण</Text>
          </View>
          <InfoRow label="बालिका का नाम" value={balikaName} />
          <InfoRow label="मोबाइल नंबर" value={mobileNumber} />
          <InfoRow label="जन्म तिथि" value={dob} />
          <InfoRow label="वर्तमान आयु" value={currentAge} />
          <InfoRow label="वार्षिक आय" value={annualIncome} />
          <InfoRow label="राज्य" value={state} />
          <InfoRow label="जिला" value={district} />
        </View>

        {/* Uploaded Documents Summary Card */}
        <View style={s.summaryCard}>
          <View style={s.cardSectionHeader}>
            <MaterialIcon
              name="file-document-multiple-outline"
              size={18}
              color="#D81B60"
            />
            <Text style={s.cardSectionTitle}>सत्यापित दस्तावेज़</Text>
          </View>
          {[
            { key: 'balikaAadhaar', label: 'बच्ची का आधार कार्ड' },
            { key: 'birthCertificate', label: 'बच्ची का जन्म प्रमाण पत्र' },
            { key: 'balikaPhoto', label: 'बच्ची का पासपोर्ट साइज फोटो' },
            { key: 'parentAadhaar', label: 'मम्मी-पापा के आधार कार्ड' },
            { key: 'parentBankPassbook', label: 'बैंक पासबुक की कॉपी' },
          ].map(doc => {
            const raw =
              files[doc.key] || profile?.documents?.[doc.key] || profile?.[doc.key];
            const hasDoc = Boolean(raw);
            return (
              <View key={doc.key} style={s.docRow}>
                <MaterialIcon
                  name={hasDoc ? 'check-circle' : 'close-circle'}
                  size={18}
                  color={hasDoc ? '#059669' : '#EF4444'}
                />
                <Text style={s.docName}>{doc.label}</Text>
                <Text
                  style={[s.docStatus, { color: hasDoc ? '#059669' : '#EF4444' }]}
                >
                  {hasDoc ? '✓ अपलोड' : 'बाकी'}
                </Text>
                {hasDoc && (
                  <TouchableOpacity
                    style={s.docEyeBtn}
                    onPress={() => {
                      const url = getDocumentUrl(raw) || raw;
                      if (url) {
                        setPreviewDoc({
                          title: doc.label,
                          url,
                          isPdf:
                            typeof url === 'string' &&
                            url.toLowerCase().includes('.pdf'),
                        });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <FeatherIcon name="eye" size={15} color="#D81B60" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* ─── FEATURE 1: REGISTRATION FEE PAYMENT CARD ─── */}
        <View style={[s.paymentCard, isFeePaid && s.paymentCardPaid]}>
          <View style={s.feeHeaderRow}>
            <View style={s.feeBadge}>
              <FontAwesome5
                name={isFeePaid ? 'check-circle' : 'receipt'}
                size={18}
                color={isFeePaid ? '#059669' : '#D81B60'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.feeTitle}>पंजीकरण शुल्क (Registration Fee)</Text>
              <Text style={s.feeSubtitle}>
                One-time registration fee for Vivah Sahayog Fund Account activation
              </Text>
            </View>
            <View style={s.feeAmountBox}>
              <Text style={s.feeAmountText}>₹{REGISTRATION_FEE.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {isFeePaid ? (
            /* PAID STATUS */
            <View style={s.paidBanner}>
              <MaterialIcon name="check-decagram" size={22} color="#059669" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={s.paidTitle}>शुल्क भुगतान संपन्न (Fee Paid)</Text>
                <Text style={s.paidSub}>
                  पंजीकरण शुल्क ₹{REGISTRATION_FEE} प्राप्त हो चुका है।
                </Text>
              </View>
            </View>
          ) : (
            /* UNPAID: PAYMENT OPTIONS */
            <>
              {/* Trust highlights */}
              <View style={s.trustRow}>
                <View style={s.trustItem}>
                  <MaterialIcon name="shield-lock-outline" size={14} color="#059669" />
                  <Text style={s.trustText}>100% सुरक्षित NGO ट्रस्ट खाता</Text>
                </View>
                <View style={s.trustItem}>
                  <MaterialIcon name="all-inclusive" size={14} color="#059669" />
                  <Text style={s.trustText}>आजीवन विवाह खाता सक्रियता</Text>
                </View>
              </View>

              <Text style={s.selectMethodTitle}>भुगतान का माध्यम चुनें (Payment Method):</Text>

              {/* Method A: UPI Gateway (TezGateway) */}
              <TouchableOpacity
                style={[
                  s.methodOption,
                  paymentMethod === 'upi' && s.methodOptionSelected,
                ]}
                onPress={() => setPaymentMethod('upi')}
                activeOpacity={0.85}
              >
                <View style={s.radioCircle}>
                  {paymentMethod === 'upi' && <View style={s.radioDot} />}
                </View>
                <View style={s.methodIconCircle}>
                  <MaterialIcon name="qrcode-scan" size={20} color="#D81B60" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.methodLabel}>UPI / Payment Gateway (TezGateway)</Text>
                  <Text style={s.methodDesc}>
                    Google Pay • PhonePe • Paytm • BHIM UPI • Cards
                  </Text>
                </View>
                <View style={s.fastBadge}>
                  <Text style={s.fastBadgeText}>Instant</Text>
                </View>
              </TouchableOpacity>

              {/* Method B: App Wallet */}
              <TouchableOpacity
                style={[
                  s.methodOption,
                  paymentMethod === 'wallet' && s.methodOptionSelected,
                ]}
                onPress={() => setPaymentMethod('wallet')}
                activeOpacity={0.85}
              >
                <View style={s.radioCircle}>
                  {paymentMethod === 'wallet' && <View style={s.radioDot} />}
                </View>
                <View style={[s.methodIconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <MaterialIcon name="wallet-outline" size={20} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.methodLabel}>SARVANA App Wallet</Text>
                  <Text style={s.methodDesc}>
                    उपलब्ध बैलेंस: ₹{walletBalance.toFixed(2)}
                  </Text>
                </View>
                {walletBalance < REGISTRATION_FEE ? (
                  <View style={s.lowBalBadge}>
                    <Text style={s.lowBalText}>कम बैलेंस</Text>
                  </View>
                ) : (
                  <View style={s.okBalBadge}>
                    <Text style={s.okBalText}>सक्रिय</Text>
                  </View>
                )}
              </TouchableOpacity>

              {paymentMethod === 'wallet' && walletBalance < REGISTRATION_FEE && (
                <View style={s.walletWarningBox}>
                  <MaterialIcon name="alert-circle-outline" size={16} color="#B45309" />
                  <Text style={s.walletWarningText}>
                    वॉलेट में शेष राशि ₹{REGISTRATION_FEE - walletBalance} कम है।
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('WalletTopupScreen')}
                    style={s.topupBtn}
                  >
                    <Text style={s.topupBtnText}>+ पैसे जोड़ें</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

        {/* Declaration */}
        <TouchableOpacity
          style={s.declarationCard}
          onPress={() => setDeclared(!declared)}
          activeOpacity={0.85}
        >
          <View style={[s.checkbox, declared && s.checkboxChecked]}>
            {declared && <FeatherIcon name="check" size={14} color="#FFFFFF" />}
          </View>
          <Text style={s.declarationText}>
            मैं प्रमाणित करता/करती हूँ कि उपरोक्त विवरण सत्य एवं निष्पक्ष है। पंजीकरण शुल्क ₹2,000 की अदायगी के साथ मैं विवाह सहयोग खाता सक्रियण के लिए सहमति देता/देती हूँ।
          </Text>
        </TouchableOpacity>

        {/* Action Button */}
        <TouchableOpacity
          style={[s.ctaBtn, (!declared || loading || hookLoading) && s.ctaBtnDisabled]}
          onPress={handleProceed}
          activeOpacity={0.88}
          disabled={!declared || loading || hookLoading}
        >
          {loading || hookLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : isFeePaid ? (
            <>
              <Text style={s.ctaBtnText}>आवेदन अंतिम सबमिट करें</Text>
              <MaterialIcon name="check-circle-outline" size={20} color="#FFF" />
            </>
          ) : paymentMethod === 'wallet' ? (
            <>
              <Text style={s.ctaBtnText}>वॉलेट से ₹2,000 भुगतान करें</Text>
              <MaterialIcon name="shield-check" size={20} color="#FFF" />
            </>
          ) : (
            <>
              <Text style={s.ctaBtnText}>UPI से ₹2,000 भुगतान करें</Text>
              <MaterialIcon name="arrow-right-circle" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccess}
        vivahSahayogId={successId}
        onDone={handleDone}
      />

      {/* Wallet MPIN Modal */}
      <WalletMpinModal
        visible={showMpinModal}
        loading={loading}
        onClose={() => setShowMpinModal(false)}
        onSubmit={handleWalletPaymentSubmit}
        amount={REGISTRATION_FEE}
      />

      {/* In-App Document Preview Modal */}
      <Modal
        visible={Boolean(previewDoc)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewDoc(null)}
      >
        <View style={s.previewOverlay}>
          <View style={s.previewModalCard}>
            <View style={s.previewHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.previewTitle} numberOfLines={1}>
                  {previewDoc?.title || 'दस्तावेज़'}
                </Text>
                <Text style={s.previewSub}>इन-ऐप पूर्वावलोकन • In-App Preview</Text>
              </View>
              <TouchableOpacity
                onPress={() => setPreviewDoc(null)}
                style={s.previewCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FeatherIcon name="x" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={s.previewImageContainer}>
              {previewDoc?.url ? (
                previewDoc.isPdf ? (
                  <View style={s.pdfFallbackContainer}>
                    <MaterialIcon name="file-pdf-box" size={64} color="#DC2626" />
                    <Text style={s.pdfTitle}>{previewDoc.title}</Text>
                    <Text style={s.pdfNote}>PDF दस्तावेज़ संलग्न है</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: previewDoc.url }}
                    style={s.previewImage}
                    resizeMode="contain"
                  />
                )
              ) : (
                <View style={s.pdfFallbackContainer}>
                  <FeatherIcon name="alert-circle" size={48} color="#94A3B8" />
                  <Text style={s.pdfNote}>दस्तावेज़ लोड नहीं हो सका</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
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
  headerTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.2,
  },
  scroll: { padding: 16 },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: '#FCE7F3',
  },
  cardSectionTitle: { fontSize: 14.5, fontWeight: '800', color: '#831843' },

  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 8,
  },
  docName: { flex: 1, fontSize: 13, color: '#334155', fontWeight: '600' },
  docStatus: { fontSize: 12, fontWeight: '700' },
  docEyeBtn: {
    padding: 6,
    backgroundColor: '#FFF0F5',
    borderRadius: 8,
    marginLeft: 4,
  },

  /* Fee Payment Card */
  paymentCard: {
    backgroundColor: '#FFF9FB',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FCE7F3',
    elevation: 3,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  paymentCardPaid: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  feeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  feeBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  feeTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  feeSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 15 },
  feeAmountBox: {
    backgroundColor: '#D81B60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  feeAmountText: { color: '#FFF', fontSize: 15, fontWeight: '900' },

  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trustText: { fontSize: 10.5, color: '#059669', fontWeight: '700' },

  selectMethodTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 10,
  },

  methodOption: {
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
  methodOptionSelected: {
    borderColor: '#D81B60',
    backgroundColor: '#FFF',
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
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D81B60',
  },
  methodIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: { fontSize: 13.5, fontWeight: '800', color: '#1E293B' },
  methodDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
  fastBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fastBadgeText: { fontSize: 10.5, fontWeight: '800', color: '#2563EB' },
  okBalBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  okBalText: { fontSize: 10.5, fontWeight: '800', color: '#059669' },
  lowBalBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lowBalText: { fontSize: 10.5, fontWeight: '800', color: '#DC2626' },

  walletWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
    marginBottom: 6,
  },
  walletWarningText: { flex: 1, fontSize: 11.5, color: '#B45309', fontWeight: '600' },
  topupBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  topupBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  paidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  paidTitle: { fontSize: 13.5, fontWeight: '800', color: '#059669' },
  paidSub: { fontSize: 11.5, color: '#047857', marginTop: 1 },

  /* Declaration */
  declarationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: '#D81B60', borderColor: '#D81B60' },
  declarationText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500',
  },

  /* Submit CTA */
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
  ctaBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

  /* Preview Modal */
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewModalCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  previewTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  previewSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  previewCloseBtn: { padding: 4 },
  previewImageContainer: {
    height: 380,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: { width: '100%', height: '100%' },
  pdfFallbackContainer: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  pdfTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
    textAlign: 'center',
  },
  pdfNote: { fontSize: 12, color: '#64748B', marginTop: 4 },
});
