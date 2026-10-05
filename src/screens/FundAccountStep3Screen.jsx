import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator, Modal, Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import COLORS from '../constants/colors';
import useFundAccount from '../hooks/useFundAccount';

// Step Progress
const StepProgress = ({ current }) => (
  <View style={sp.wrapper}>
    {[{ n: 1, label: 'व्यक्तिगत\nजानकारी' }, { n: 2, label: 'दस्तावेज़\nअपलोड' }, { n: 3, label: 'समीक्षा\nसबमिट' }].map((step, idx) => (
      <React.Fragment key={step.n}>
        <View style={sp.stepItem}>
          <View style={[sp.circle, current >= step.n && sp.circleActive]}>
            {current > step.n
              ? <FeatherIcon name="check" size={14} color="#FFFFFF" />
              : <Text style={[sp.circleNum, current >= step.n && sp.circleNumActive]}>{step.n}</Text>
            }
          </View>
          <Text style={[sp.label, current === step.n && sp.labelActive]}>{step.label}</Text>
        </View>
        {idx < 2 && <View style={[sp.line, current > step.n && sp.lineActive]} />}
      </React.Fragment>
    ))}
  </View>
);

const sp = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFF0F5' },
  stepItem: { alignItems: 'center', flex: 0 },
  circle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  circleActive: { backgroundColor: '#D81B60', borderColor: '#D81B60' },
  circleNum: { fontSize: 13, fontWeight: '700', color: '#94A3B8' },
  circleNumActive: { color: '#FFFFFF' },
  label: { fontSize: 10, color: '#94A3B8', textAlign: 'center', marginTop: 5, lineHeight: 14, fontWeight: '600' },
  labelActive: { color: '#D81B60' },
  line: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginTop: 15, marginHorizontal: 4 },
  lineActive: { backgroundColor: '#D81B60' },
});

const InfoRow = ({ label, value }) => (
  <View style={ir.row}>
    <Text style={ir.label}>{label}</Text>
    <Text style={ir.value}>{value || '—'}</Text>
  </View>
);

const ir = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  label: { flex: 1, fontSize: 13, color: '#64748B', fontWeight: '600' },
  value: { flex: 1.2, fontSize: 13, color: '#1E293B', fontWeight: '700', textAlign: 'right' },
});

// ─── Success Modal ──────────────────────────────────────────────────────────────
const SuccessModal = ({ visible, onDone }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={sm.overlay}>
        <View style={sm.card}>
          <View style={sm.iconRing}>
            <MaterialIcon name="check-circle" size={56} color="#059669" />
          </View>
          <Text style={sm.title}>आवेदन सफलतापूर्वक सबमिट!</Text>
          <Text style={sm.subtitle}>
            आपका Vivah Sahayog आवेदन दर्ज हो गया है।{'\n'}
            SARVANA टीम जल्द ही समीक्षा करेगी।
          </Text>
          <View style={sm.divider} />
          <Text style={sm.infoText}>✉ स्थिति की जानकारी आपके मोबाइल पर भेजी जाएगी।</Text>
          <TouchableOpacity style={sm.btn} onPress={onDone} activeOpacity={0.85}>
            <Text style={sm.btnText}>मुख्य पृष्ठ पर जाएं</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const sm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 28, alignItems: 'center', width: '100%', elevation: 20, shadowColor: '#059669', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20 },
  iconRing: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginBottom: 18, borderWidth: 2, borderColor: '#BBF7D0' },
  title: { fontSize: 20, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 13.5, color: '#475569', textAlign: 'center', lineHeight: 21 },
  divider: { width: '40%', height: 1.5, backgroundColor: '#F1F5F9', marginVertical: 16 },
  infoText: { fontSize: 12.5, color: '#059669', fontWeight: '600', textAlign: 'center', marginBottom: 20 },
  btn: { backgroundColor: '#D81B60', borderRadius: 30, height: 50, paddingHorizontal: 36, alignItems: 'center', justifyContent: 'center', width: '100%', elevation: 3, shadowColor: '#D81B60', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 6 },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function FundAccountStep3Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const fundAccountId = route.params?.fundAccountId;
  const step1Data = route.params?.step1Data || {};
  const files = route.params?.files || {};

  const { submit, loading, profile, fetchProfile } = useFundAccount();
  const [declared, setDeclared] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const targetFundAccountId = fundAccountId || profile?.fundAccountId || profile?._id;

  const handleSubmit = async () => {
    if (!declared) {
      Toast.show({ type: 'error', text1: 'त्रुटि', text2: 'कृपया घोषणा पर सहमति दें।' });
      return;
    }
    if (!targetFundAccountId) {
      Toast.show({ type: 'error', text1: 'त्रुटि', text2: 'Fund Account ID नहीं मिली।' });
      return;
    }
    try {
      const res = await submit(targetFundAccountId);
      if (res?.Status) {
        setShowSuccess(true);
      } else if (res?.Remarks?.toLowerCase().includes('already')) {
        Toast.show({ type: 'error', text1: 'सूचना', text2: 'आवेदन पहले से सबमिट किया जा चुका है।' });
        navigation.navigate('FundAccountProfile');
      } else {
        Toast.show({ type: 'error', text1: 'त्रुटि', text2: res?.Remarks || 'सबमिट विफल।' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'त्रुटि', text2: 'सबमिट विफल। पुनः प्रयास करें।' });
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

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Vivah Sahayog - आवेदन</Text>
        <View style={{ width: 26 }} />
      </View>

      <StepProgress current={3} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>समीक्षा और सबमिट</Text>

        {/* Personal Info Summary */}
        <View style={s.summaryCard}>
          <View style={s.cardSectionHeader}>
            <MaterialIcon name="account-outline" size={18} color="#D81B60" />
            <Text style={s.cardSectionTitle}>व्यक्तिगत जानकारी</Text>
          </View>
          <InfoRow label="बालिका का नाम" value={balikaName} />
          <InfoRow label="मोबाइल नंबर" value={mobileNumber} />
          <InfoRow label="जन्म तिथि" value={dob} />
          <InfoRow label="वर्तमान आयु" value={currentAge} />
          <InfoRow label="वार्षिक आय" value={annualIncome} />
          <InfoRow label="राज्य" value={state} />
          <InfoRow label="जिला" value={district} />
        </View>

        {/* Documents Summary */}
        <View style={s.summaryCard}>
          <View style={s.cardSectionHeader}>
            <MaterialIcon name="file-document-multiple-outline" size={18} color="#D81B60" />
            <Text style={s.cardSectionTitle}>अपलोड किए गए दस्तावेज़</Text>
          </View>
          {[
            { key: 'birthCertificate', label: 'जन्म प्रमाण पत्र' },
            { key: 'parentAadhaar', label: 'माता-पिता आधार कार्ड' },
            { key: 'balikaPhoto', label: 'बालिका की फोटो' },
          ].map(doc => {
            const hasDoc = Boolean(files[doc.key] || profile?.documents?.[doc.key] || profile?.[doc.key]);
            return (
              <View key={doc.key} style={s.docRow}>
                <MaterialIcon
                  name={hasDoc ? 'check-circle' : 'close-circle'}
                  size={18}
                  color={hasDoc ? '#059669' : '#EF4444'}
                />
                <Text style={s.docName}>{doc.label}</Text>
                <Text style={[s.docStatus, { color: hasDoc ? '#059669' : '#EF4444' }]}>
                  {hasDoc ? '✓ अपलोड' : 'नहीं'}
                </Text>
              </View>
            );
          })}
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
            मैं प्रमाणित करता/करती हूँ कि उपरोक्त जानकारी सत्य है। किसी भी असत्य जानकारी के लिए मैं स्वयं उत्तरदायी हूँगा/हूँगी।
          </Text>
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity
          style={[s.ctaBtn, !declared && s.ctaBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={loading || !declared}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" />
            : <><Text style={s.ctaBtnText}>सबमिट करें</Text><MaterialIcon name="check-circle-outline" size={20} color="#FFF" /></>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <SuccessModal visible={showSuccess} onDone={handleDone} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 2 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#D81B60' },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  summaryCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 14,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  cardSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardSectionTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  docName: { flex: 1, fontSize: 13, color: '#334155', fontWeight: '600' },
  docStatus: { fontSize: 12, fontWeight: '700' },
  declarationCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#FFF5F8', borderRadius: 12, padding: 14,
    borderWidth: 1.5, borderColor: '#FBCFE8', marginBottom: 20,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 5, borderWidth: 2,
    borderColor: '#D81B60', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF', marginTop: 1,
  },
  checkboxChecked: { backgroundColor: '#D81B60', borderColor: '#D81B60' },
  declarationText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 19 },
  ctaBtn: {
    backgroundColor: '#D81B60', borderRadius: 30, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    elevation: 4, shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  ctaBtnDisabled: { backgroundColor: '#E2A0B4', elevation: 0, shadowOpacity: 0 },
  ctaBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
