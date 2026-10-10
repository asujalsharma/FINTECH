import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../constants/colors';
import useFundAccount, { calculateWithdrawalEligibility } from '../hooks/useFundAccount';

const VIVAH_LOGO = require('../Assets/vivah_sahayog_logo.png');

const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: '#FFF7ED', border: '#FED7AA', color: '#F57C00', icon: 'clock-outline', label: 'समीक्षा में है' },
    approved: { bg: '#ECFDF5', border: '#A7F3D0', color: '#059669', icon: 'check-circle-outline', label: 'स्वीकृत' },
    rejected: { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', icon: 'close-circle-outline', label: 'अस्वीकृत' },
  }[status] || null;
  if (!config) return null;
  return (
    <View style={[s.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <MaterialIcon name={config.icon} size={14} color={config.color} />
      <Text style={[s.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

export default function VivahSahayogEntryScreen() {
  const navigation = useNavigation();
  const { profile, draft, loading, fetchProfile, fetchDraft } = useFundAccount();

  const load = useCallback(async () => {
    await Promise.all([
      fetchDraft(),
      fetchProfile(),
    ]);
  }, [fetchDraft, fetchProfile]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const hasDraft = Boolean(draft?.hasDraft && !draft?.isSubmitted);
  const isSubmitted = Boolean(draft?.isSubmitted || profile?.isSubmitted);
  const approvalStatus = (draft?.approvalStatus || profile?.approvalStatus || profile?.status || 'draft').toLowerCase();
  const vivahSahayogId = draft?.vivahSahayogId || profile?.vivahSahayogId || profile?.fundAccountId;
  const completionPercentage = draft?.progress?.completionPercentage ?? (hasDraft ? 50 : 0);
  const missingDocsCount = draft?.progress?.missingDocuments?.length ?? 0;
  const missingStep1Count = draft?.progress?.missingStep1Fields?.length ?? 0;
  const walletBalance = profile?.fundWallet?.balance ?? profile?.wallet?.balance ?? 0;
  const withdrawalInfo = calculateWithdrawalEligibility(
    profile?.dob || draft?.formData?.dob,
    profile?.currentAge || draft?.formData?.currentAge
  );

  const handleResumeDraft = () => {
    const nextStep = draft?.progress?.nextStep || draft?.currentStep || 1;
    if (nextStep === 1) {
      navigation.navigate('FundAccountStep1', { draftData: draft });
    } else if (nextStep === 2) {
      navigation.navigate('FundAccountStep2', {
        fundAccountId: draft?.fundAccountId,
        draftData: draft,
      });
    } else if (nextStep === 3) {
      navigation.navigate('FundAccountStep3', {
        fundAccountId: draft?.fundAccountId,
        draftData: draft,
      });
    } else {
      navigation.navigate('FundAccountStep1', { draftData: draft });
    }
  };

  const handleStartNew = () => {
    navigation.navigate('FundAccountStep1');
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <View style={s.headerTitleRow}>
          <FontAwesome5 name="heart" size={16} color="#D81B60" solid />
          <Text style={s.headerTitle}>Vivah Sahayog</Text>
        </View>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} colors={[COLORS.primary]} />}
      >
        {/* Hero Banner */}
        <View style={s.heroBanner}>
          <Image source={VIVAH_LOGO} style={s.heroImg} resizeMode="contain" />
          <View style={s.heroTextCol}>
            <Text style={s.heroScheme}>बालिका विवाह सहयोग योजना</Text>
            <Text style={s.heroQuote}>"बेटी मुस्कुराएगी{'\n'}तो समाज आगे बढ़ेगा"</Text>
          </View>
        </View>

        {loading && !draft && !profile ? (
          <View style={s.loadingCard}>
            <ActivityIndicator color="#D81B60" size="small" />
            <Text style={s.loadingText}>पंजीकरण स्थिति जाँची जा रही है...</Text>
          </View>
        ) : (
          <>
            {/* ── CASE A: Partial / Incomplete Registration (Draft) ── */}
            {hasDraft && (
              <View style={s.draftCard}>
                <View style={s.draftHeaderRow}>
                  <View style={s.draftIconCircle}>
                    <MaterialIcon name="progress-clock" size={24} color="#D81B60" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.draftCardTitle}>आपका पंजीकरण अधूरा है</Text>
                    <Text style={s.draftCardSubtitle}>Application in Progress</Text>
                  </View>
                </View>

                {vivahSahayogId ? (
                  <View style={s.idBadgeRow}>
                    <Text style={s.idBadgeLabel}>Vivah Sahayog ID:</Text>
                    <Text style={s.idBadgeValue}>{vivahSahayogId}</Text>
                  </View>
                ) : null}

                {/* Dynamic Progress Bar */}
                <View style={s.progressSection}>
                  <View style={s.progressHeader}>
                    <Text style={s.progressLabel}>प्रगति स्थिति</Text>
                    <Text style={s.progressPercentText}>{completionPercentage}% पूर्ण</Text>
                  </View>
                  <View style={s.progressBarTrack}>
                    <View style={[s.progressBarFill, { width: `${Math.min(Math.max(completionPercentage, 5), 100)}%` }]} />
                  </View>
                </View>

                {/* Missing Info Badge / Text */}
                <View style={s.missingInfoContainer}>
                  <MaterialIcon name="alert-circle-outline" size={16} color="#B45309" />
                  <Text style={s.missingInfoText}>
                    {missingDocsCount > 0
                      ? `${missingDocsCount} दस्तावेज़ अपलोड करना बाकी हैं`
                      : missingStep1Count > 0
                      ? `${missingStep1Count} व्यक्तिगत जानकारी भरना बाकी है`
                      : 'अंतिम सबमिशन बाकी है'}
                  </Text>
                </View>

                {/* Continue CTA */}
                <TouchableOpacity
                  style={s.resumeBtn}
                  onPress={handleResumeDraft}
                  activeOpacity={0.88}
                >
                  <Text style={s.resumeBtnText}>आवेदन पूरा करें (Continue Application)</Text>
                  <FeatherIcon name="arrow-right" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* ── CASE B: Submitted & Under Review ── */}
            {!hasDraft && isSubmitted && approvalStatus === 'pending' && (
              <View style={s.pendingCard}>
                <View style={s.cardHeader}>
                  <View style={[s.cardIconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <MaterialIcon name="clock-outline" size={26} color="#D97706" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.cardTitle}>आवेदन दर्ज (Applied)</Text>
                    <Text style={s.cardSub}>समीक्षाधीन (Under Review) • SARVANA Team</Text>
                  </View>
                </View>

                <View style={s.reviewAlert}>
                  <MaterialIcon name="shield-search" size={20} color="#B45309" />
                  <Text style={s.reviewAlertText}>
                    आपका आवेदन दर्ज हो चुका है (Applied) - {vivahSahayogId || 'समीक्षाधीन'}
                  </Text>
                </View>

                <Text style={s.statusDesc}>
                  हमारे अधिकारियों द्वारा आपके दस्तावेज़ों और विवरण का सत्यापन किया जा रहा है। स्वीकृति के तुरंत बाद फंड वॉलेट सक्रिय हो जाएगा।
                </Text>

                <TouchableOpacity
                  style={[s.ctaBtn, { backgroundColor: '#D97706' }]}
                  onPress={() => navigation.navigate('FundAccountProfile')}
                  activeOpacity={0.85}
                >
                  <Text style={s.ctaBtnText}>आवेदन विवरण देखें</Text>
                  <FeatherIcon name="chevron-right" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* ── CASE C: Approved ── */}
            {!hasDraft && approvalStatus === 'approved' && (
              <View style={s.approvedCard}>
                <View style={s.cardHeader}>
                  <View style={[s.cardIconCircle, { backgroundColor: '#DCFCE7' }]}>
                    <MaterialIcon name="check-decagram" size={28} color="#16A34A" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={s.approvedBadgeRow}>
                      {/* <Text style={s.cardTitle}>स्वीकृत - बधाई हो! (Approved Congratulations)</Text> */}
                      <View style={s.greenPill}>
                        <Text style={s.greenPillText}>सक्रिय</Text>
                      </View>
                    </View>
                    <Text style={s.cardSub}>ID: {vivahSahayogId}</Text>
                  </View>
                </View>

                <View style={s.walletBox}>
                  <Text style={s.walletBoxLabel}>फंड वॉलेट बैलेंस (Fund Wallet Balance)</Text>
                  <Text style={s.walletBoxAmount}>₹{walletBalance.toLocaleString('en-IN')}</Text>
                </View>

                {/* Withdrawal Eligibility Box */}
                <View style={s.withdrawalInfoBox}>
                  <View style={s.withdrawalInfoRow}>
                    <View style={s.withdrawalInfoLeft}>
                      <MaterialIcon
                        name={withdrawalInfo.isEligible ? 'check-decagram' : 'lock-clock'}
                        size={16}
                        color={withdrawalInfo.isEligible ? '#16A34A' : '#D97706'}
                      />
                      <Text style={s.withdrawalInfoTitle}>निकासी हेतु शेष वर्ष (आयु > 20):</Text>
                    </View>
                    <Text style={[s.withdrawalInfoBadge, { color: withdrawalInfo.isEligible ? '#16A34A' : '#D97706' }]}>
                      {withdrawalInfo.yearsLeftDisplay}
                    </Text>
                  </View>
                  <Text style={s.withdrawalInfoSub}>
                    {withdrawalInfo.ruleText}
                  </Text>
                </View>

                <View style={s.actionRow}>
                  <TouchableOpacity
                    style={s.passbookBtn}
                    onPress={() => navigation.navigate('FundWalletStatements')}
                    activeOpacity={0.85}
                  >
                    <MaterialIcon name="book-open-outline" size={18} color="#FFFFFF" />
                    <Text style={s.passbookBtnText}>पासबुक देखें</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={s.profileOutlineBtn}
                    onPress={() => navigation.navigate('FundAccountProfile')}
                    activeOpacity={0.85}
                  >
                    <FeatherIcon name="user" size={16} color="#D81B60" />
                    <Text style={s.profileOutlineBtnText}>प्रोफ़ाइल</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── CASE E: Rejected ── */}
            {!hasDraft && approvalStatus === 'rejected' && (
              <View style={s.rejectedCard}>
                <View style={s.cardHeader}>
                  <View style={[s.cardIconCircle, { backgroundColor: '#FEE2E2' }]}>
                    <MaterialIcon name="close-circle-outline" size={28} color="#DC2626" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.cardTitle}>आवेदन अस्वीकृत (Rejected)</Text>
                    <Text style={s.cardSub}>ID: {vivahSahayogId || '—'}</Text>
                  </View>
                </View>

                {profile?.rejectionNote ? (
                  <View style={s.rejectionNoteCard}>
                    <MaterialIcon name="alert-circle" size={16} color="#DC2626" />
                    <Text style={s.rejectionNoteText}>{profile.rejectionNote}</Text>
                  </View>
                ) : (
                  <Text style={s.statusDesc}>
                    दस्तावेज़ या जानकारी के सत्यापन में विसंगति के कारण आवेदन अस्वीकृत किया गया है। कृपया सही जानकारी के साथ पुनः आवेदन करें।
                  </Text>
                )}

                <TouchableOpacity
                  style={[s.ctaBtn, { backgroundColor: '#DC2626' }]}
                  onPress={handleStartNew}
                  activeOpacity={0.85}
                >
                  <Text style={s.ctaBtnText}>पुनः आवेदन करें (Reapply)</Text>
                  <FeatherIcon name="arrow-right" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* ── CASE D: Not Started ── */}
            {!hasDraft && !isSubmitted && approvalStatus !== 'approved' && approvalStatus !== 'rejected' && (
              <View style={s.card}>
                <View style={s.cardHeader}>
                  <View style={s.cardIconCircle}>
                    <MaterialIcon name="account-heart-outline" size={28} color="#D81B60" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.cardTitle}>बालिका विवाह सहयोग योजना</Text>
                    <Text style={s.cardSub}>नया पंजीकरण शुरू करें</Text>
                  </View>
                </View>

                <View style={s.statusBlock}>
                  <View style={[s.badge, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
                    <MaterialIcon name="file-document-outline" size={14} color="#64748B" />
                    <Text style={[s.badgeText, { color: '#64748B' }]}>नया आवेदन</Text>
                  </View>
                  <Text style={s.statusDesc}>
                    बालिका विवाह सहयोग योजना में आवेदन करें। अपनी बिटिया के सुरक्षित भविष्य के लिए आज ही नामांकन पूरा करें।
                  </Text>
                </View>

                <TouchableOpacity style={s.ctaBtn} onPress={handleStartNew} activeOpacity={0.85}>
                  <Text style={s.ctaBtnText}>नया आवेदन (Apply Now)</Text>
                  <FeatherIcon name="arrow-right" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Info steps */}
        <View style={s.stepsCard}>
          <Text style={s.stepsTitle}>आवेदन प्रक्रिया (3 सरल चरण)</Text>
          {[
            { n: '1', t: 'व्यक्तिगत जानकारी', d: 'बालिका एवं परिवार की आवश्यक जानकारी' },
            { n: '2', t: 'दस्तावेज़ अपलोड', d: 'जन्म प्रमाण पत्र, आधार कार्ड, बैंक पासबुक' },
            { n: '3', t: 'समीक्षा और सबमिट', d: 'सत्यापन के बाद SARVANA समीक्षा में जाएगा' },
          ].map(item => (
            <View key={item.n} style={s.stepRow}>
              <View style={s.stepNumCircle}>
                <Text style={s.stepNumText}>{item.n}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.stepRowTitle}>{item.t}</Text>
                <Text style={s.stepRowDesc}>{item.d}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <MaterialIcon name="shield-check-outline" size={16} color="#0F8A5F" />
          <Text style={s.disclaimerText}>
            यह योजना SARVANA Care Foundation द्वारा संचालित है। दस्तावेज़ों का सत्यापन टीम द्वारा मैन्युअल रूप से किया जाएगा।
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#D81B60', letterSpacing: 0.3 },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },

  heroBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF0F5', borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: '#FCE7F3', marginBottom: 16,
  },
  heroImg: { width: 70, height: 70, borderRadius: 35, marginRight: 12 },
  heroTextCol: { flex: 1 },
  heroScheme: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 4 },
  heroQuote: { fontSize: 15, fontWeight: '800', color: '#D81B60', lineHeight: 22 },

  // Base card
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#FCE7F3',
    elevation: 4, shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardIconCircle: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#FFF0F5', alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },

  // Draft Prominent Card
  draftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#F472B6',
    elevation: 6,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    marginBottom: 18,
  },
  draftHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  draftIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#831843',
  },
  draftCardSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 1,
  },
  idBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  idBadgeLabel: {
    fontSize: 11.5,
    color: '#831843',
    fontWeight: '700',
    marginRight: 6,
  },
  idBadgeValue: {
    fontSize: 12,
    color: '#D81B60',
    fontWeight: '800',
    fontFamily: 'monospace',
  },

  // Progress Bar
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  progressPercentText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D81B60',
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D81B60',
    borderRadius: 5,
  },

  // Missing Info Badge
  missingInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  missingInfoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    flex: 1,
  },

  // Resume button
  resumeBtn: {
    backgroundColor: '#D81B60',
    borderRadius: 28,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },

  // Under review card
  pendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  reviewAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 12,
  },
  reviewAlertText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#B45309',
    flex: 1,
  },

  // Approved card
  approvedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  approvedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  greenPillText: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '700',
  },
  walletBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginVertical: 12,
    alignItems: 'center',
  },
  walletBoxLabel: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
    marginBottom: 4,
  },
  walletBoxAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#166534',
  },
  withdrawalInfoBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 12,
  },
  withdrawalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  withdrawalInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  withdrawalInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  withdrawalInfoBadge: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
  },
  withdrawalInfoSub: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 15,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  passbookBtn: {
    flex: 1,
    backgroundColor: '#16A34A',
    borderRadius: 24,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  passbookBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  profileOutlineBtn: {
    paddingHorizontal: 18,
    borderRadius: 24,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  profileOutlineBtnText: {
    color: '#D81B60',
    fontSize: 13.5,
    fontWeight: '700',
  },

  // Rejected card
  rejectedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    marginBottom: 16,
  },

  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  loadingText: { fontSize: 13, color: '#64748B' },

  statusBlock: { marginBottom: 14 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5, marginBottom: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  statusDesc: { fontSize: 13, color: '#475569', lineHeight: 19 },

  rejectionNoteCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FEF2F2', borderRadius: 10,
    padding: 10, borderWidth: 1, borderColor: '#FECACA', marginVertical: 12,
  },
  rejectionNoteText: { flex: 1, fontSize: 12.5, color: '#DC2626', lineHeight: 18 },

  ctaBtn: {
    backgroundColor: '#D81B60', borderRadius: 30, height: 48,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    elevation: 3, shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6,
    marginTop: 8,
  },
  ctaBtnText: { color: '#FFFFFF', fontSize: 14.5, fontWeight: '800' },

  stepsCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 14,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  stepsTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  stepNumCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FFF0F5', borderWidth: 1.5, borderColor: '#D81B60',
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { fontSize: 12, fontWeight: '800', color: '#D81B60' },
  stepRowTitle: { fontSize: 13.5, fontWeight: '700', color: '#1E293B' },
  stepRowDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },

  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#F0FDF4', borderRadius: 10,
    padding: 12, borderWidth: 1, borderColor: '#BBF7D0',
  },
  disclaimerText: { flex: 1, fontSize: 12, color: '#166534', lineHeight: 17 },
});
