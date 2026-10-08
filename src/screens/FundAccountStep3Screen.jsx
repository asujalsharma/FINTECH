import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator, Modal, Animated, Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import COLORS from '../constants/colors';
import useFundAccount, { getDocumentUrl } from '../hooks/useFundAccount';

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
const SuccessModal = ({ visible, vivahSahayogId, onDone }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={sm.overlay}>
        <View style={sm.card}>
          <View style={sm.iconRing}>
            <MaterialIcon name="check-decagram" size={56} color="#059669" />
          </View>
          <Text style={sm.title}>बधाई हो! 🎉</Text>
          <Text style={sm.subheading}>आपका आवेदन सफलतापूर्वक जमा हो चुका है।</Text>

          {vivahSahayogId ? (
            <View style={sm.idBadge}>
              <Text style={sm.idLabel}>Vivah Sahayog ID:</Text>
              <Text style={sm.idValue}>{vivahSahayogId}</Text>
            </View>
          ) : null}

          <View style={sm.divider} />
          <Text style={sm.infoText}>
            🛡️ एडमिन समीक्षा के बाद फंड वॉलेट सक्रिय हो जाएगा।
          </Text>
          <Text style={sm.mobileNotice}>
            समीक्षा स्थिति की सूचना आपके पंजीकृत मोबाइल नंबर पर भी भेजी जाएगी।
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 26, alignItems: 'center', width: '100%', elevation: 20, shadowColor: '#059669', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20 },
  iconRing: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#BBF7D0' },
  title: { fontSize: 22, fontWeight: '900', color: '#1E293B', textAlign: 'center', marginBottom: 4 },
  subheading: { fontSize: 14, color: '#334155', fontWeight: '700', textAlign: 'center', lineHeight: 20, marginBottom: 10 },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    marginVertical: 6,
  },
  idLabel: { fontSize: 12, color: '#831843', fontWeight: '700' },
  idValue: { fontSize: 13, color: '#D81B60', fontWeight: '900', fontFamily: 'monospace' },
  divider: { width: '40%', height: 1.5, backgroundColor: '#F1F5F9', marginVertical: 14 },
  infoText: { fontSize: 13, color: '#059669', fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  mobileNotice: { fontSize: 11.5, color: '#64748B', textAlign: 'center', marginBottom: 20, lineHeight: 16 },
  btn: { backgroundColor: '#D81B60', borderRadius: 30, height: 50, paddingHorizontal: 36, alignItems: 'center', justifyContent: 'center', width: '100%', elevation: 3, shadowColor: '#D81B60', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 6 },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function FundAccountStep3Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const fundAccountId = route.params?.fundAccountId;
  const initialStep1 = route.params?.step1Data || {};
  const files = route.params?.files || {};

  const { submit, loading, profile, fetchProfile, fetchDraft } = useFundAccount();
  const [declared, setDeclared] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [step1Data, setStep1Data] = useState(initialStep1);
  const [successId, setSuccessId] = useState(route.params?.draftData?.vivahSahayogId || '');

  React.useEffect(() => {
    (async () => {
      await fetchProfile();
      if (!step1Data || Object.keys(step1Data).length === 0) {
        const draftRes = await fetchDraft();
        if (draftRes?.Data) {
          if (draftRes.Data.formData) setStep1Data(draftRes.Data.formData);
          if (draftRes.Data.vivahSahayogId) setSuccessId(draftRes.Data.vivahSahayogId);
        }
      }
    })();
  }, [fetchProfile, fetchDraft]);

  const targetFundAccountId = fundAccountId || route.params?.draftData?.fundAccountId || profile?.fundAccountId || profile?._id;

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
      if (res && (!res.Error || res.Status)) {
        const generatedId =
          res.Data?.vivahSahayogId ||
          res.Data?.account?.vivahSahayogId ||
          successId ||
          profile?.vivahSahayogId;
        if (generatedId) setSuccessId(generatedId);
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

  const [previewDoc, setPreviewDoc] = useState(null);

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
        <Text style={s.headerTitle}>समीक्षा और अंतिम सबमिट (चरण 3/3)</Text>
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
            { key: 'balikaAadhaar', label: 'बच्ची का आधार कार्ड' },
            { key: 'birthCertificate', label: 'बच्ची का जन्म प्रमाण पत्र' },
            { key: 'balikaPhoto', label: 'बच्ची का पासपोर्ट साइज फोटो' },
            { key: 'parentAadhaar', label: 'मम्मी-पापा के आधार कार्ड' },
            { key: 'parentBankPassbook', label: 'बैंक पासबुक की कॉपी' },
          ].map(doc => {
            const raw = files[doc.key] || profile?.documents?.[doc.key] || profile?.[doc.key];
            const hasDoc = Boolean(raw);
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
                {hasDoc && (
                  <TouchableOpacity
                    style={s.docEyeBtn}
                    onPress={() => {
                      const url = getDocumentUrl(raw) || raw;
                      if (url) {
                        setPreviewDoc({
                          title: doc.label,
                          url,
                          isPdf: typeof url === 'string' && url.toLowerCase().includes('.pdf'),
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

      <SuccessModal visible={showSuccess} vivahSahayogId={successId} onDone={handleDone} />

      {/* ── In-App Document Preview Modal ── */}
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
                <ActivityIndicator size="small" color="#D81B60" />
              )}
            </View>

            <View style={s.previewFooter}>
              <TouchableOpacity
                style={s.previewDoneBtn}
                onPress={() => setPreviewDoc(null)}
                activeOpacity={0.8}
              >
                <Text style={s.previewDoneText}>बंद करें (Close)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  docEyeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FFF0F5',
  },
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
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewModalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  previewSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  previewCloseBtn: {
    padding: 4,
  },
  previewImageContainer: {
    width: '100%',
    height: 380,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  pdfFallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pdfTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 10,
    textAlign: 'center',
  },
  pdfNote: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  previewFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  previewDoneBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#D81B60',
  },
  previewDoneText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
