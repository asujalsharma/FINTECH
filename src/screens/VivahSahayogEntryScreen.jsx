import React, { useEffect, useCallback, useState } from 'react';
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
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../constants/colors';
import useFundAccount, { calculateWithdrawalEligibility } from '../hooks/useFundAccount';
import { fetchSingleFundScheme, resolveSchemeCode } from '../services/fundSchemeService';

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

// ─── Pending Draft Block Modal ────────────────────────────────────────────────
const PendingDraftModal = ({
  visible,
  beneficiaryName,
  beneficiaryLabel = 'लाभार्थी',
  schemeName = 'सहयोग',
  themeColor = '#D81B60',
  nextStep,
  onResume,
  onEdit,
  onStartNew,
  onClose,
}) => {
  const stepLabel =
    nextStep === 2
      ? 'चरण 2 (दस्तावेज़ अपलोड)'
      : nextStep === 3
      ? 'चरण 3 (समीक्षा व शुल्क)'
      : 'चरण 1 (व्यक्तिगत विवरण)';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={pdm.overlay}>
        <View style={pdm.card}>
          <TouchableOpacity style={pdm.closeIconBtn} onPress={onClose} activeOpacity={0.7}>
            <FeatherIcon name="x" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={[pdm.iconRing, { borderColor: themeColor + '30', backgroundColor: themeColor + '12' }]}>
            <MaterialIcon name="file-alert-outline" size={42} color={themeColor} />
          </View>

          <Text style={pdm.title}>पंजीकरण लंबित है</Text>
          <Text style={pdm.subtitle}>
            कृपया पहले अधूरा पंजीकरण पूरा करें
          </Text>

          <View style={pdm.detailBox}>
            <Text style={pdm.detailText}>
              {beneficiaryName ? (
                <Text>
                  {beneficiaryLabel} <Text style={[pdm.highlight, { color: themeColor }]}>"{beneficiaryName}"</Text> का {schemeName} पंजीकरण अभी अधूरा (Draft) है।
                </Text>
              ) : (
                <Text>
                  आपका एक {schemeName} पंजीकरण अभी अधूरा (Draft) अवस्था में है।
                </Text>
              )}
              {'\n\n'}नया खाता जोड़ने से पहले कृपया इस पंजीकरण को पूरा करें।
            </Text>

            <View style={[pdm.stepBadge, { backgroundColor: themeColor + '15' }]}>
              <MaterialIcon name="clock-outline" size={14} color={themeColor} />
              <Text style={[pdm.stepBadgeText, { color: themeColor }]}>लंबित चरण: {stepLabel}</Text>
            </View>
          </View>

          <TouchableOpacity style={[pdm.resumeBtn, { backgroundColor: themeColor }]} onPress={onResume} activeOpacity={0.85}>
            <Text style={pdm.resumeBtnText}>अधूरा पंजीकरण पूरा करें</Text>
            <FeatherIcon name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={[pdm.editBtn, { borderColor: themeColor + '40' }]} onPress={onEdit} activeOpacity={0.8}>
            <FeatherIcon name="edit-2" size={16} color={themeColor} />
            <Text style={[pdm.editBtnText, { color: themeColor }]}>ड्राफ्ट विवरण संपादित करें</Text>
          </TouchableOpacity>

          {onStartNew && (
            <TouchableOpacity style={[pdm.editBtn, { borderColor: themeColor + '40', marginTop: 8 }]} onPress={onStartNew} activeOpacity={0.8}>
              <FeatherIcon name="user-plus" size={16} color={themeColor} />
              <Text style={[pdm.editBtnText, { color: themeColor }]}>नया लाभार्थी जोड़ें (New Person)</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={pdm.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={pdm.cancelBtnText}>रद्द करें (Cancel)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function VivahSahayogEntryScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const passedScheme = route.params?.scheme || null;
  const passedSchemeCode =
    route.params?.sahayogType ||
    route.params?.schemeCode ||
    route.params?.schemeId ||
    passedScheme?.code ||
    route.params?.draftData?.sahayogType ||
    route.params?.draftData?.schemeCode ||
    null;

  const [scheme, setScheme] = useState(passedScheme);

  const {
    profile,
    draft,
    loading,
    fetchProfile,
    fetchDraft,
    accounts,
    totalAccounts,
    selectedAccount,
    selectedAccountId,
    fetchMyAccounts,
    selectAccount,
    clearActiveAccount,
  } = useFundAccount();

  // Load scheme details if schemeCode is provided but scheme not loaded
  useEffect(() => {
    if (passedSchemeCode && (!scheme || scheme.code !== passedSchemeCode)) {
      fetchSingleFundScheme(passedSchemeCode).then(res => {
        if (res) setScheme(res);
      });
    }
  }, [passedSchemeCode, scheme]);

  const schemeCode =
    scheme?.code ||
    passedSchemeCode ||
    'VIVAH_SAHAYOG';

  const load = useCallback(async () => {
    const sType = scheme?.code || passedSchemeCode || 'VIVAH_SAHAYOG';
    await Promise.allSettled([
      fetchMyAccounts(null, sType),
      fetchDraft({ sahayogType: sType }),
      fetchProfile(null, sType),
    ]);
  }, [fetchMyAccounts, fetchDraft, fetchProfile, scheme?.code, passedSchemeCode]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const [showPendingDraftModal, setShowPendingDraftModal] = useState(false);

  // Helper to accurately extract scheme code from any account object
  const getAccountSchemeCode = useCallback((acc) => {
    if (!acc) return '';
    const raw = (
      acc.sahayogType ||
      acc.schemeCode ||
      acc.scheme ||
      ''
    ).toUpperCase();
    if (raw) return raw;
    const accNum = String(acc.accountNumber || acc.vivahSahayogId || acc.fundAccountId || '').toUpperCase();
    if (accNum.startsWith('MSA-') || accNum.startsWith('MSH-')) return 'MAHILA_SAHAYOG';
    if (accNum.startsWith('BSA-') || accNum.startsWith('BSH-')) return 'BAL_SAHAYOG';
    if (accNum.startsWith('KSA-') || accNum.startsWith('KSH-')) return 'KISAN_SAHAYOG';
    if (accNum.startsWith('VNA-') || accNum.startsWith('VNS-')) return 'VARISHTHA_NAGARIK_SAHAYOG';
    if (accNum.startsWith('VSA-') || accNum.startsWith('VSH-')) return 'VIVAH_SAHAYOG';
    return '';
  }, []);

  // Scheme accounts filter (strictly isolated to current scheme)
  const schemeAccounts = (accounts || []).filter(a => {
    const sCode = getAccountSchemeCode(a);
    return sCode ? sCode === schemeCode.toUpperCase() : (schemeCode.toUpperCase() === 'VIVAH_SAHAYOG');
  });

  const activeAcc = (selectedAccount && getAccountSchemeCode(selectedAccount) === schemeCode.toUpperCase())
    ? selectedAccount
    : (schemeAccounts.length > 0 ? schemeAccounts[0] : null);

  const schemeName =
    scheme?.name ||
    (schemeCode === 'VIVAH_SAHAYOG' ? 'विवाह सहयोग' : schemeCode.replace(/_/g, ' '));
  const schemeTagline =
    scheme?.tagline ||
    scheme?.description ||
    'सामाजिक सहयोग व कल्याणकारी योजना';
  const schemeThemeColor = scheme?.themeColor || '#D81B60';
  const schemeBadgeSymbol = scheme?.badgeSymbol || (schemeCode === 'VIVAH_SAHAYOG' ? '💍' : '🤝');
  const beneficiaryLabel = scheme?.beneficiaryLabel || 'लाभार्थी का नाम';
  const beneficiaryShort = beneficiaryLabel.split('(')[0].trim();

  const draftScheme = (
    draft?.sahayogType ||
    draft?.schemeCode ||
    draft?.scheme ||
    draft?.formData?.sahayogType ||
    draft?.formData?.schemeCode ||
    ''
  ).toUpperCase();

  const isDraftMatch = Boolean(
    draft &&
    (draft.hasDraft || draft.fundAccountId || draft.formData?.beneficiaryName || draft.formData?.balikaName) &&
    (draftScheme ? draftScheme === schemeCode.toUpperCase() : true)
  );

  const isProfileMatch = Boolean(
    profile &&
    (!getAccountSchemeCode(profile) || getAccountSchemeCode(profile) === schemeCode.toUpperCase())
  );

  const beneficiaryName =
    activeAcc?.beneficiaryName ||
    activeAcc?.balikaName ||
    (isDraftMatch ? (draft?.formData?.beneficiaryName || draft?.formData?.balikaName) : '') ||
    (isProfileMatch ? (profile?.beneficiaryName || profile?.balikaName) : '') ||
    '';

  const accountId =
    activeAcc?.accountNumber ||
    activeAcc?.vivahSahayogId ||
    (isDraftMatch ? (draft?.vivahSahayogId || draft?.fundAccountId) : '') ||
    (isProfileMatch ? (profile?.accountNumber || profile?.vivahSahayogId || profile?.fundAccountId) : '');

  const rawStatus = (activeAcc?.approvalStatus || (isProfileMatch && profile?.approvalStatus) || (isDraftMatch && draft?.approvalStatus) || (isProfileMatch && profile?.status) || 'draft').toLowerCase();
  const isSubmitted = Boolean(activeAcc?.isSubmitted ?? (isDraftMatch ? draft?.isSubmitted : (isProfileMatch ? profile?.isSubmitted : false)));
  const hasDraft = Boolean(!isSubmitted && (isDraftMatch && (draft?.hasDraft || rawStatus === 'draft')));
  const approvalStatus = hasDraft ? 'draft' : rawStatus;

  // Detect if there is any pending draft strictly for this scheme
  const pendingDraftAccount =
    schemeAccounts.find(a => (!a.isSubmitted && ((a.approvalStatus || a.status || '').toLowerCase() === 'draft' || a.hasDraft))) ||
    (isDraftMatch ? draft : null);

  const hasPendingDraft = Boolean(
    pendingDraftAccount ||
    hasDraft ||
    (isDraftMatch && draft?.hasDraft) ||
    (isDraftMatch && draft?.formData && Object.keys(draft.formData).length > 0)
  );

  const pendingBeneficiaryName =
    pendingDraftAccount?.beneficiaryName ||
    pendingDraftAccount?.balikaName ||
    pendingDraftAccount?.formData?.beneficiaryName ||
    pendingDraftAccount?.formData?.balikaName ||
    (isDraftMatch ? (draft?.formData?.beneficiaryName || draft?.formData?.balikaName) : '') ||
    (hasDraft ? beneficiaryName : '');

  const pendingNextStep =
    pendingDraftAccount?.progress?.nextStep ||
    pendingDraftAccount?.currentStep ||
    (isDraftMatch ? (draft?.progress?.nextStep || draft?.currentStep) : null) ||
    (hasDraft ? (draft?.progress?.nextStep || 1) : 1);

  const completionPercentage = activeAcc?.progress?.completionPercentage ?? (isDraftMatch ? draft?.progress?.completionPercentage : null) ?? (hasDraft ? 50 : 0);
  const missingDocsCount = (isDraftMatch ? draft?.progress?.missingDocuments?.length : 0) ?? 0;
  const missingStep1Count = (isDraftMatch ? draft?.progress?.missingStep1Fields?.length : 0) ?? 0;
  const walletBalance = Number(activeAcc?.fundWallet?.balance ?? profile?.fundWallet?.balance ?? profile?.wallet?.balance ?? 0);
  const isVivahScheme = resolveSchemeCode(schemeCode) === 'VIVAH_SAHAYOG';
  const withdrawalInfo = calculateWithdrawalEligibility(
    activeAcc?.dob || profile?.dob || (isDraftMatch ? draft?.formData?.dob : null),
    activeAcc?.currentAge || profile?.currentAge || (isDraftMatch ? draft?.formData?.currentAge : null),
    schemeCode
  );

  const handleResumeDraft = (customDraft = null) => {
    const targetDraft = customDraft || pendingDraftAccount || (isDraftMatch ? draft : null) || activeAcc;
    const nextStep = targetDraft?.progress?.nextStep || targetDraft?.currentStep || 1;
    const fId = targetDraft?.fundAccountId || activeAcc?.fundAccountId;
    const navParams = {
      draftData: targetDraft,
      fundAccountId: fId,
      schemeCode,
      sahayogType: schemeCode,
      scheme,
    };
    if (nextStep === 1) {
      navigation.navigate('FundAccountStep1', navParams);
    } else if (nextStep === 2) {
      navigation.navigate('FundAccountStep2', navParams);
    } else if (nextStep === 3) {
      navigation.navigate('FundAccountStep3', navParams);
    } else {
      navigation.navigate('FundAccountStep1', navParams);
    }
  };

  const handleEditDraft = (customDraft = null) => {
    const targetDraft = customDraft || pendingDraftAccount || (isDraftMatch ? draft : null) || activeAcc;
    const fId = targetDraft?.fundAccountId || activeAcc?.fundAccountId;
    navigation.navigate('FundAccountStep1', {
      draftData: targetDraft,
      fundAccountId: fId,
      isEdit: true,
      schemeCode,
      sahayogType: schemeCode,
      scheme,
    });
  };

  const handleStartNew = async (forceCreateNew = false) => {
    if (hasPendingDraft && !forceCreateNew) {
      setShowPendingDraftModal(true);
      return;
    }
    await clearActiveAccount();
    navigation.navigate('FundAccountStep1', {
      isNewAccount: true,
      createNew: true,
      schemeCode,
      sahayogType: schemeCode,
      scheme,
    });
  };

  const handleResumePendingDraft = () => {
    setShowPendingDraftModal(false);
    handleResumeDraft(pendingDraftAccount || draft);
  };

  const handleEditPendingDraft = () => {
    setShowPendingDraftModal(false);
    handleEditDraft(pendingDraftAccount || draft);
  };

  const handleForceStartNew = () => {
    setShowPendingDraftModal(false);
    handleStartNew(true);
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
          <FontAwesome5 name="heart" size={16} color={schemeThemeColor} solid />
          <Text style={s.headerTitle}>{schemeName}</Text>
        </View>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} colors={[schemeThemeColor]} />}
      >
        {/* Hero Banner */}
        <View style={[s.heroBanner, { backgroundColor: schemeThemeColor + '12', borderColor: schemeThemeColor + '25' }]}>
          {schemeCode === 'VIVAH_SAHAYOG' || (!scheme?.badgeSymbol && !scheme?.image) ? (
            <Image source={scheme?.image ? { uri: scheme.image } : VIVAH_LOGO} style={s.heroImg} resizeMode="contain" />
          ) : scheme?.image ? (
            <Image source={{ uri: scheme.image }} style={s.heroImg} resizeMode="contain" />
          ) : (
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: schemeThemeColor + '20', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Text style={{ fontSize: 28 }}>{schemeBadgeSymbol}</Text>
            </View>
          )}
          <View style={s.heroTextCol}>
            <Text style={[s.heroScheme, { color: schemeThemeColor }]}>{schemeTagline}</Text>
            <Text style={s.heroQuote}>{scheme?.about || scheme?.description || "सामाजिक सहयोग व कल्याणकारी योजना"}</Text>
          </View>
        </View>

        {/* ── Multi-Account Selector Header (If scheme accounts exist) ── */}
        {schemeAccounts && schemeAccounts.length > 0 && (
          <View style={s.multiAccountsWrapper}>
            <View style={s.accountsHeaderBar}>
              <View style={s.accountsHeaderTitleRow}>
                <MaterialIcon name="account-multiple-check" size={20} color={schemeThemeColor} />
                <Text style={s.accountsHeaderTitle}>
                  पंजीकृत खाते ({schemeAccounts.length})
                </Text>
              </View>
              <TouchableOpacity
                style={[s.addNewAccountTopBtn, { backgroundColor: schemeThemeColor }]}
                onPress={handleStartNew}
                activeOpacity={0.8}
              >
                <Text style={s.addNewAccountTopBtnText}>+ नया खाता</Text>
              </TouchableOpacity>
            </View>

            {/* Horizontal accounts slider */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.accountsScrollList}
            >
              {schemeAccounts.map(item => {
                const isSelected =
                  (item.fundAccountId || item._id) ===
                  (activeAcc?.fundAccountId || activeAcc?._id);
                const statusKey = (item.approvalStatus || (item.isSubmitted ? 'pending' : 'draft')).toLowerCase();
                const itemBeneficiary = item.beneficiaryName || item.balikaName || item.applicantName || 'लाभार्थी खाता';
                return (
                  <TouchableOpacity
                    key={item.fundAccountId || item._id}
                    style={[s.accountChipCard, isSelected && [s.accountChipCardActive, { borderColor: schemeThemeColor }]]}
                    onPress={async () => {
                      await selectAccount(item);
                      const actId = item.fundAccountId || item._id;
                      if (actId) {
                        fetchProfile(actId);
                      }
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={s.accountChipTop}>
                      <View style={[s.avatarCircle, isSelected && [s.avatarCircleActive, { borderColor: schemeThemeColor }]]}>
                        <FontAwesome5
                          name="user"
                          size={13}
                          color={isSelected ? schemeThemeColor : '#64748B'}
                        />
                      </View>
                      <StatusBadge status={statusKey} />
                    </View>

                    <Text
                      style={[s.accountChipName, isSelected && [s.accountChipNameActive, { color: schemeThemeColor }]]}
                      numberOfLines={1}
                    >
                      {itemBeneficiary}
                    </Text>
                    <Text style={s.accountChipId} numberOfLines={1}>
                      {item.accountNumber || item.vivahSahayogId || 'ID प्रतीक्षारत'}
                    </Text>

                    {isSelected ? (
                      <View style={[s.activeIndicatorPill, { backgroundColor: schemeThemeColor + '15' }]}>
                        <MaterialIcon name="check-circle" size={12} color={schemeThemeColor} />
                        <Text style={[s.activeIndicatorText, { color: schemeThemeColor }]}>सक्रिय</Text>
                      </View>
                    ) : (
                      <Text style={s.selectHintText}>टैप करें</Text>
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* Add New Sibling / Member Card in the Slider */}
              <TouchableOpacity
                style={s.addNewChildCard}
                onPress={handleStartNew}
                activeOpacity={0.8}
              >
                <View style={[s.addIconCircle, { backgroundColor: schemeThemeColor + '15' }]}>
                  <MaterialIcon name="plus" size={20} color={schemeThemeColor} />
                </View>
                <Text style={s.addNewChildCardTitle}>नया लाभार्थी जोड़ें</Text>
                <Text style={s.addNewChildCardSub}>+ नया पंजीकरण</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {loading && !draft && !profile && accounts.length === 0 ? (
          <View style={s.loadingCard}>
            <ActivityIndicator color={schemeThemeColor} size="small" />
            <Text style={s.loadingText}>पंजीकरण स्थिति जाँची जा रही है...</Text>
          </View>
        ) : (
          <>
            {/* ── CASE A: Partial / Incomplete Registration (Draft) ── */}
            {hasDraft && (
              <View style={s.draftCard}>
                <View style={s.draftHeaderRow}>
                  <View style={[s.draftIconCircle, { backgroundColor: schemeThemeColor + '15' }]}>
                    <MaterialIcon name="progress-clock" size={24} color={schemeThemeColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.draftCardTitle}>
                      {beneficiaryName ? `${beneficiaryName} का पंजीकरण अधूरा है` : 'आपका पंजीकरण अधूरा है'}
                    </Text>
                    <Text style={s.draftCardSubtitle}>{schemeName} - प्रगति पर</Text>
                  </View>
                </View>

                {accountId ? (
                  <View style={s.idBadgeRow}>
                    <Text style={s.idBadgeLabel}>{schemeName} ID:</Text>
                    <Text style={s.idBadgeValue}>{accountId}</Text>
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

                {/* Continue / Edit CTA Row */}
                <View style={s.draftCtaRow}>
                  <TouchableOpacity
                    style={s.editDraftBtn}
                    onPress={() => handleEditDraft()}
                    activeOpacity={0.8}
                  >
                    <FeatherIcon name="edit-2" size={15} color="#D81B60" />
                    <Text style={s.editDraftBtnText}>विवरण बदलें</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={s.resumeDraftBtn}
                    onPress={() => handleResumeDraft()}
                    activeOpacity={0.88}
                  >
                    <Text style={s.resumeDraftBtnText}>आवेदन जारी रखें</Text>
                    <FeatherIcon name="arrow-right" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
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
                    <Text style={s.cardSub}>
                      {beneficiaryName ? `${beneficiaryName} • ` : ''}समीक्षाधीन (Under Review)
                    </Text>
                  </View>
                </View>

                <View style={s.reviewAlert}>
                  <MaterialIcon name="shield-search" size={20} color="#B45309" />
                  <Text style={s.reviewAlertText}>
                    आपका आवेदन दर्ज हो चुका है (Applied) - {accountId || 'समीक्षाधीन'}
                  </Text>
                </View>

                <Text style={s.statusDesc}>
                  हमारे अधिकारियों द्वारा आपके दस्तावेज़ों और विवरण का सत्यापन किया जा रहा है। स्वीकृति के तुरंत बाद फंड वॉलेट सक्रिय हो जाएगा।
                </Text>

                <TouchableOpacity
                  style={[s.ctaBtn, { backgroundColor: '#D97706' }]}
                  onPress={() =>
                    navigation.navigate('FundAccountProfile', {
                      fundAccountId: activeAcc?.fundAccountId || activeAcc?._id,
                      schemeCode,
                      scheme,
                      account: activeAcc,
                      profile,
                      beneficiaryName: activeAcc?.beneficiaryName || activeAcc?.balikaName,
                    })
                  }
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
                      <Text style={s.cardTitle}>{beneficiaryName || 'स्वीकृत खाता'}</Text>
                      <View style={s.greenPill}>
                        <Text style={s.greenPillText}>सक्रिय</Text>
                      </View>
                    </View>
                    <Text style={s.cardSub}>ID: {accountId}</Text>
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
                      <Text style={s.withdrawalInfoTitle}>
                        {isVivahScheme ? 'निकासी हेतु शेष वर्ष (आयु > 20):' : 'निकासी स्थिति:'}
                      </Text>
                    </View>
                    <Text style={[s.withdrawalInfoBadge, { color: withdrawalInfo.isEligible ? '#16A34A' : '#D97706' }]}>
                      {isVivahScheme ? withdrawalInfo.yearsLeftDisplay : 'निकासी उपलब्ध'}
                    </Text>
                  </View>
                  <Text style={s.withdrawalInfoSub}>
                    {withdrawalInfo.ruleText}
                  </Text>
                </View>

                <View style={s.actionRow}>
                  <TouchableOpacity
                    style={[s.passbookBtn, { backgroundColor: schemeThemeColor }]}
                    onPress={() =>
                      navigation.navigate('FundWalletStatements', {
                        fundAccountId: activeAcc?.fundAccountId || activeAcc?._id,
                        schemeCode,
                        scheme,
                        account: activeAcc,
                        profile,
                        beneficiaryName: activeAcc?.beneficiaryName || activeAcc?.balikaName,
                      })
                    }
                    activeOpacity={0.85}
                  >
                    <MaterialIcon name="book-open-outline" size={18} color="#FFFFFF" />
                    <Text style={s.passbookBtnText}>पासबुक देखें</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.profileOutlineBtn, { borderColor: schemeThemeColor }]}
                    onPress={() =>
                      navigation.navigate('FundAccountProfile', {
                        fundAccountId: activeAcc?.fundAccountId || activeAcc?._id,
                        schemeCode,
                        scheme,
                        account: activeAcc,
                        profile,
                        beneficiaryName: activeAcc?.beneficiaryName || activeAcc?.balikaName,
                      })
                    }
                    activeOpacity={0.85}
                  >
                    <FeatherIcon name="user" size={16} color={schemeThemeColor} />
                    <Text style={[s.profileOutlineBtnText, { color: schemeThemeColor }]}>प्रोफ़ाइल</Text>
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
                    <Text style={s.cardTitle}>
                      {beneficiaryName ? `${beneficiaryName} का आवेदन अस्वीकृत` : 'आवेदन अस्वीकृत (Rejected)'}
                    </Text>
                    <Text style={s.cardSub}>ID: {accountId || '—'}</Text>
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

            {/* ── CASE D: Not Started (Zero Accounts) ── */}
            {!hasDraft && !isSubmitted && approvalStatus !== 'approved' && approvalStatus !== 'rejected' && (!accounts || accounts.length === 0) && (
              <View style={s.card}>
                <View style={s.cardHeader}>
                  <View style={[s.cardIconCircle, { backgroundColor: schemeThemeColor + '15' }]}>
                    <MaterialIcon name="account-heart-outline" size={28} color={schemeThemeColor} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.cardTitle}>{schemeName}</Text>
                    <Text style={s.cardSub}>नया पंजीकरण शुरू करें</Text>
                  </View>
                </View>

                <View style={s.statusBlock}>
                  <View style={[s.badge, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
                    <MaterialIcon name="file-document-outline" size={14} color="#64748B" />
                    <Text style={[s.badgeText, { color: '#64748B' }]}>नया आवेदन</Text>
                  </View>
                  <Text style={s.statusDesc}>
                    {schemeTagline}. {schemeName} में आवेदन करें। नामांकन पूरा करें।
                  </Text>
                </View>

                <TouchableOpacity style={[s.ctaBtn, { backgroundColor: schemeThemeColor }]} onPress={handleStartNew} activeOpacity={0.85}>
                  <Text style={s.ctaBtnText}>नया आवेदन (Apply Now)</Text>
                  <FeatherIcon name="arrow-right" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* ── Sibling / Additional Beneficiary Application Banner ── */}
            {accounts && accounts.length > 0 && (
              <View style={s.addSiblingBanner}>
                <View style={[s.addSiblingIconCircle, { backgroundColor: schemeThemeColor + '15' }]}>
                  <FontAwesome5 name="user-plus" size={18} color={schemeThemeColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.addSiblingTitle}>नया {schemeName} खाता जोड़ें?</Text>
                  <Text style={s.addSiblingSub}>
                    आप एक से अधिक लाभार्थियों के लिए {schemeName} खाता खोल सकते हैं।
                  </Text>
                </View>
                <TouchableOpacity
                  style={[s.addSiblingBtn, { backgroundColor: schemeThemeColor }]}
                  onPress={handleStartNew}
                  activeOpacity={0.85}
                >
                  <Text style={s.addSiblingBtnText}>+ नया आवेदन</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Info steps */}
        <View style={s.stepsCard}>
          <Text style={s.stepsTitle}>आवेदन प्रक्रिया (3 सरल चरण)</Text>
          {[
            { n: '1', t: 'व्यक्तिगत जानकारी', d: `${beneficiaryShort} एवं परिवार की आवश्यक जानकारी` },
            { n: '2', t: 'दस्तावेज़ अपलोड', d: 'पहचान प्रमाण पत्र, आधार कार्ड, बैंक पासबुक' },
            { n: '3', t: 'समीक्षा और सबमिट', d: 'सत्यापन के बाद SARVANA समीक्षा में जाएगा' },
          ].map(item => (
            <View key={item.n} style={s.stepRow}>
              <View style={[s.stepNumCircle, { backgroundColor: schemeThemeColor + '18' }]}>
                <Text style={[s.stepNumText, { color: schemeThemeColor }]}>{item.n}</Text>
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

      {/* Modal: Block new registration if a draft is pending */}
      <PendingDraftModal
        visible={showPendingDraftModal}
        beneficiaryName={pendingBeneficiaryName}
        beneficiaryLabel={beneficiaryShort}
        schemeName={schemeName}
        themeColor={schemeThemeColor}
        nextStep={pendingNextStep}
        onResume={handleResumePendingDraft}
        onEdit={handleEditPendingDraft}
        onStartNew={handleForceStartNew}
        onClose={() => setShowPendingDraftModal(false)}
      />
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
  draftCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  editDraftBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF0F5',
    borderWidth: 1.5,
    borderColor: '#FCE7F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editDraftBtnText: {
    color: '#D81B60',
    fontSize: 13.5,
    fontWeight: '800',
  },
  resumeDraftBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 3,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  resumeDraftBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
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

  // ── Multi-Account Selector Styles ──
  multiAccountsWrapper: {
    marginBottom: 16,
  },
  accountsHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  accountsHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountsHeaderTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  addNewAccountTopBtn: {
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addNewAccountTopBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  accountsScrollList: {
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  accountChipCard: {
    width: 154,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  accountChipCardActive: {
    borderColor: '#D81B60',
    backgroundColor: '#FFF5F8',
    elevation: 4,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  accountChipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleActive: {
    backgroundColor: '#FCE7F3',
  },
  accountChipName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  accountChipNameActive: {
    color: '#D81B60',
  },
  accountChipId: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 6,
  },
  activeIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  activeIndicatorText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D81B60',
  },
  selectHintText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  addNewChildCard: {
    width: 120,
    backgroundColor: '#FFF0F5',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FCE7F3',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    elevation: 1,
  },
  addNewChildCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D81B60',
    textAlign: 'center',
  },
  addNewChildCardSub: {
    fontSize: 10,
    color: '#9D174D',
    marginTop: 2,
  },

  // Sibling Banner
  addSiblingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF0F5',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FCE7F3',
    marginBottom: 16,
  },
  addSiblingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  addSiblingTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#9D174D',
  },
  addSiblingSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  addSiblingBtn: {
    backgroundColor: '#D81B60',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    elevation: 2,
  },
  addSiblingBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});

const pdm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    position: 'relative',
  },
  closeIconBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  iconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF0F5',
    borderWidth: 2,
    borderColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#D81B60',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailBox: {
    width: '100%',
    backgroundColor: '#FFF5F8',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    marginBottom: 20,
  },
  detailText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    textAlign: 'center',
  },
  highlight: {
    fontWeight: '800',
    color: '#1E293B',
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D81B60',
  },
  resumeBtn: {
    width: '100%',
    backgroundColor: '#D81B60',
    borderRadius: 28,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginBottom: 10,
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  editBtn: {
    width: '100%',
    backgroundColor: '#FFF0F5',
    borderWidth: 1.5,
    borderColor: '#FCE7F3',
    borderRadius: 28,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  editBtnText: {
    color: '#D81B60',
    fontSize: 14.5,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
});
