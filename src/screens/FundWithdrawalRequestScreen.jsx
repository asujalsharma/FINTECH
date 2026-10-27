import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import COLORS from '../constants/colors';
import useFundWithdrawal from '../hooks/useFundWithdrawal';
import useFundAccount from '../hooks/useFundAccount';
import { getSchemeMeta, resolveSchemeCode } from '../services/fundSchemeService';
import { lookupIfscDetails } from '../services/fundWithdrawalService';

const PURPOSE_OPTIONS = [
  { id: 'marriage', label: 'विवाह खर्च (Marriage)' },
  { id: 'education', label: 'शिक्षा / पढ़ाई (Education)' },
  { id: 'medical', label: 'चिकित्सा / उपचार (Medical)' },
  { id: 'home', label: 'गृह सुधार (Home Need)' },
  { id: 'other', label: 'अन्य आवश्यक खर्च (Other)' },
];

export default function FundWithdrawalRequestScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    eligibility,
    loadEligibility,
    submitting,
    submitRequest,
    validateWithdrawalAmount,
  } = useFundWithdrawal();

  const { profile, fetchProfile } = useFundAccount();

  const activeProfile = route.params?.profile || profile;
  const activeAccount = route.params?.account;
  const activeEligibility = route.params?.eligibility || eligibility;

  const targetFundAccountId =
    route.params?.fundAccountId ||
    route.params?.eligibility?.fundAccountId ||
    activeAccount?.fundAccountId ||
    activeAccount?._id ||
    activeProfile?.fundAccountId ||
    activeProfile?._id ||
    profile?.fundAccountId ||
    profile?._id;

  const activeSchemeCode = resolveSchemeCode(
    route.params?.schemeCode ||
    route.params?.profile?.sahayogType ||
    route.params?.profile?.schemeCode ||
    route.params?.account?.sahayogType ||
    route.params?.account?.schemeCode ||
    activeEligibility?.sahayogType ||
    activeEligibility?.schemeCode ||
    activeProfile?.sahayogType ||
    activeProfile?.schemeCode ||
    activeProfile?.scheme ||
    profile?.sahayogType ||
    profile?.schemeCode ||
    profile?.scheme ||
    'VIVAH_SAHAYOG'
  );
  const schemeMeta = getSchemeMeta(activeSchemeCode);
  const themeColor = schemeMeta.color || COLORS.primary;

  const beneficiaryName =
    route.params?.beneficiaryName ||
    activeEligibility?.beneficiaryName ||
    activeProfile?.beneficiaryName ||
    activeProfile?.balikaName ||
    activeProfile?.applicantName ||
    activeAccount?.beneficiaryName ||
    activeAccount?.balikaName ||
    activeAccount?.applicantName ||
    'लाभार्थी';

  const displayAccountId =
    activeEligibility?.sahayogId ||
    activeProfile?.accountId ||
    activeProfile?.accountNumber ||
    activeProfile?.vivahSahayogId ||
    activeAccount?.accountId ||
    activeAccount?.accountNumber ||
    activeAccount?.vivahSahayogId ||
    targetFundAccountId ||
    '—';

  // Form State
  const [amountStr, setAmountStr] = useState('');

  // Bank Fields
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [holderName, setHolderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [ifscLoading, setIfscLoading] = useState(false);
  const [ifscValid, setIfscValid] = useState(null); // null | true | false

  // Reason
  const [selectedPurpose, setSelectedPurpose] = useState('marriage');
  const [customReason, setCustomReason] = useState('');

  // Confirmation Modal
  // Confirmation Modal & Error Modal
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [submissionErrorModal, setSubmissionErrorModal] = useState({
    visible: false,
    title: '',
    message: '',
    messageEn: '',
    isAgeRestriction: false,
  });

  useEffect(() => {
    if (targetFundAccountId) {
      loadEligibility(targetFundAccountId);
      fetchProfile(targetFundAccountId);
    }
  }, [targetFundAccountId, loadEligibility, fetchProfile]);

  // Determine if this is Vivah Sahayog:
  // 1. If backend explicitly returned `isVivahSahayog` boolean, strictly respect it!
  //    (isVivahSahayog === false means 100% NOT Vivah Sahayog, NO age restrictions!)
  // 2. Otherwise verify if activeSchemeCode is specifically 'VIVAH_SAHAYOG'.
  const isVivahScheme =
    activeEligibility?.isVivahSahayog !== undefined
      ? Boolean(activeEligibility.isVivahSahayog)
      : activeSchemeCode === 'VIVAH_SAHAYOG';

  const applicantAge = activeEligibility?.applicantAge !== undefined
    ? Number(activeEligibility.applicantAge)
    : activeProfile?.currentAge !== undefined
    ? Number(String(activeProfile.currentAge).match(/\d+/)?.[0])
    : undefined;

  const applicantDob =
    activeEligibility?.applicantDob ||
    activeProfile?.dob ||
    activeProfile?.formData?.dob;

  // Age restriction logic:
  // Vivah Sahayog: applicant age must be strictly > 20 yrs.
  // If age <= 20 or age unverified: user cannot withdraw funds.
  // All other schemes: no age restriction.
  const isAgeEligible = isVivahScheme
    ? activeEligibility?.isAgeEligible !== undefined
      ? Boolean(activeEligibility.isAgeEligible)
      : applicantAge !== undefined
      ? applicantAge > 20
      : false
    : true;

  const hasAgeRestriction = isVivahScheme && !isAgeEligible;

  const walletBal = Number(
    activeEligibility?.walletBalance !== undefined
      ? activeEligibility.walletBalance
      : activeProfile?.fundWallet?.balance !== undefined
      ? activeProfile.fundWallet.balance
      : activeAccount?.fundWallet?.balance !== undefined
      ? activeAccount.fundWallet.balance
      : 0
  );
  const minBalReq = Number(activeEligibility?.minAccountBalanceRequired ?? 500);
  const pendingAmt = Number(activeEligibility?.pendingWithdrawalAmount ?? 0);

  // If age restricted, maxWithdrawable must show ₹0
  const maxWithdrawable = hasAgeRestriction
    ? 0
    : Number(
        activeEligibility?.maxWithdrawableAmount !== undefined
          ? activeEligibility.maxWithdrawableAmount
          : Math.max(0, walletBal - minBalReq - pendingAmt)
      );

  const minWithdrawal = Number(activeEligibility?.minWithdrawalAmount ?? 100);

  // Pre-fill holder name and IFSC/bank details if available (Bank Account must remain empty for manual user entry)
  useEffect(() => {
    const prof = activeProfile || profile;
    const profIfsc =
      prof?.ifsc ||
      prof?.bankDetails?.ifsc ||
      activeEligibility?.savedBanks?.[0]?.ifsc;
    const profBankName =
      prof?.bankName ||
      prof?.bankDetails?.bankName ||
      activeEligibility?.savedBanks?.[0]?.bankName;
    const profBranch =
      prof?.branchName ||
      prof?.bankDetails?.branchName ||
      activeEligibility?.savedBanks?.[0]?.branchName;
    const profHolder =
      prof?.beneficiaryName ||
      prof?.balikaName ||
      prof?.applicantName ||
      activeEligibility?.beneficiaryName ||
      activeEligibility?.savedBanks?.[0]?.holderName ||
      route.params?.beneficiaryName;

    if (profHolder && !holderName) setHolderName(profHolder);
    // Note: Bank account number is distinct from the system-generated Sahayog ID / account number.
    // Therefore accountNumber and confirmAccountNumber remain empty for the user to fill in manually.
    if (profIfsc && !ifsc) {
      setIfsc(profIfsc.toUpperCase());
      setIfscValid(true);
    }
    if (profBankName && !bankName) setBankName(profBankName);
    if (profBranch && !branchName) setBranchName(profBranch);
  }, [activeProfile, profile, activeEligibility, route.params?.beneficiaryName, holderName, ifsc, bankName, branchName]);

  // Handle IFSC lookup
  const handleIfscChange = async (val) => {
    const uppercase = val.toUpperCase().trim();
    setIfsc(uppercase);

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (uppercase.length === 11) {
      if (ifscRegex.test(uppercase)) {
        setIfscValid(true);
        setIfscLoading(true);
        try {
          const details = await lookupIfscDetails(uppercase);
          if (details) {
            setBankName(details.bankName || '');
            setBranchName(details.branchName || '');
          }
        } catch (e) {
          // ignore
        } finally {
          setIfscLoading(false);
        }
      } else {
        setIfscValid(false);
      }
    } else {
      setIfscValid(null);
    }
  };

  // Amount validation & projected balance
  const parsedAmount = Number(amountStr) || 0;
  const amountValidation = validateWithdrawalAmount(parsedAmount, {
    ...activeEligibility,
    walletBalance: walletBal,
    minAccountBalanceRequired: minBalReq,
    maxWithdrawableAmount: maxWithdrawable,
    isAgeEligible,
    isVivahSahayog: isVivahScheme,
    applicantAge,
  });
  const projectedBalance = walletBal - parsedAmount;

  // Chips amounts: calculate intelligently based on maxWithdrawable
  const quickChips = useMemo(() => {
    if (hasAgeRestriction || maxWithdrawable <= 0) return [];
    const list = [];
    if (maxWithdrawable >= 500) list.push(500);
    if (maxWithdrawable >= 1000) list.push(1000);
    if (maxWithdrawable >= 2000) list.push(2000);
    if (maxWithdrawable > 0 && !list.includes(maxWithdrawable)) {
      list.push({ label: `Max (₹${maxWithdrawable.toLocaleString('en-IN')})`, value: maxWithdrawable });
    }
    return list;
  }, [hasAgeRestriction, maxWithdrawable]);

  // Bank Validation
  const isBankValid = useMemo(() => {
    const accMatch = accountNumber && accountNumber === confirmAccountNumber;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const ifscOk = ifsc && ifscRegex.test(ifsc);
    const holderOk = Boolean(holderName && holderName.trim().length > 2);
    const bankNameOk = Boolean(bankName && bankName.trim().length > 1);
    return Boolean(accMatch && ifscOk && holderOk && bankNameOk);
  }, [
    accountNumber,
    confirmAccountNumber,
    ifsc,
    holderName,
    bankName,
  ]);

  const isFormValid =
    !hasAgeRestriction &&
    maxWithdrawable > 0 &&
    amountValidation.valid &&
    isBankValid &&
    !submitting;

  const handleSubmitPress = () => {
    if (hasAgeRestriction) {
      Toast.show({
        type: 'error',
        text1: '⚠️ विवाह सहयोग निकासी नियम',
        text2: activeEligibility?.schemeEligibilityMessage || 'बालिका/आवेदक की आयु 20 वर्ष से अधिक होना अनिवार्य है।',
      });
      return;
    }
    if (!amountValidation.valid) {
      Toast.show({
        type: 'error',
        text1: 'अमान्य राशि',
        text2: amountValidation.error,
      });
      return;
    }
    if (!isBankValid) {
      Toast.show({
        type: 'error',
        text1: 'बैंक विवरण अपूर्ण',
        text2: 'कृपया खाता संख्या व IFSC विवरण सही दर्ज करें।',
      });
      return;
    }
    setConfirmModalVisible(true);
  };

  const handleFinalSubmit = async () => {
    setConfirmModalVisible(false);

    const chosenBankDetails = {
      accountNumber,
      ifsc,
      bankName,
      holderName,
      branchName,
      upiId: upiId || undefined,
    };

    const purposeObj = PURPOSE_OPTIONS.find((p) => p.id === selectedPurpose);
    const reasonText = customReason.trim()
      ? `${purposeObj?.label || selectedPurpose}: ${customReason.trim()}`
      : purposeObj?.label || 'Fund Withdrawal';

    const payload = {
      fundAccountId: targetFundAccountId,
      amount: parsedAmount,
      bankDetails: chosenBankDetails,
      reason: reasonText,
    };

    try {
      await submitRequest(payload);
      Toast.show({
        type: 'success',
        text1: 'अनुरोध सफलतापूर्वक दर्ज हुआ',
        text2: `₹${parsedAmount.toLocaleString('en-IN')} का निकासी अनुरोध सबमिट कर दिया गया है।`,
      });
      // Navigate to withdrawal history
      navigation.replace('FundWithdrawalHistory', {
        fundAccountId: targetFundAccountId,
        schemeCode: activeSchemeCode,
      });
    } catch (err) {
      const serverData = err?.serverData || {};
      const errorMsg =
        serverData?.schemeEligibilityMessage ||
        serverData?.Remarks ||
        serverData?.message ||
        err?.message ||
        'सर्वर पर अनुरोध दर्ज नहीं हो सका। कृपया पुनः प्रयास करें।';

      const errorMsgEn =
        serverData?.schemeEligibilityMessageEn ||
        serverData?.error ||
        '';

      const isAgeErr = Boolean(
        err?.isAgeRestriction ||
        serverData?.isAgeEligible === false ||
        errorMsg.includes('आयु') ||
        errorMsg.includes('20 वर्ष') ||
        errorMsg.includes('20 years')
      );

      setSubmissionErrorModal({
        visible: true,
        title: isAgeErr ? '⚠️ विवाह सहयोग निकासी नियम (Age Restriction)' : 'निकासी अनुरोध अस्वीकृत',
        message: errorMsg,
        messageEn: errorMsgEn,
        isAgeRestriction: isAgeErr,
      });

      Toast.show({
        type: 'error',
        text1: isAgeErr ? '⚠️ आयु सीमा नियम' : 'अनुरोध विफल',
        text2: errorMsg,
        visibilityTime: 6000,
      });
    }
  };

  const selectedBankDisplay = useMemo(() => {
    return `${bankName || 'बैंक'} (••• ${String(accountNumber).slice(-4)})`;
  }, [bankName, accountNumber]);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.headerTitle}>निकासी अनुरोध (Withdrawal)</Text>
          <Text style={[s.headerSub, { color: themeColor }]} numberOfLines={1}>
            {beneficiaryName ? `${beneficiaryName} • ` : ''}{schemeMeta.name} ({displayAccountId})
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Selected Account Profile Banner */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          padding: 14,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: `${themeColor}35`,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: `${themeColor}15`,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MaterialIcon name="account-check" size={24} color={themeColor} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }} numberOfLines={1}>
                {beneficiaryName}
              </Text>
              <View style={{ backgroundColor: `${themeColor}18`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontSize: 10.5, fontWeight: '700', color: themeColor }}>
                  {schemeMeta.name}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 11.5, color: '#64748B', fontWeight: '500' }}>
              खाता संख्या (ID): <Text style={{ fontWeight: '700', color: '#1E293B' }}>{displayAccountId}</Text>
            </Text>
          </View>
        </View>

        {/* Age Requirement Warning Card (Only for VIVAH_SAHAYOG when applicant age <= 20) */}
        {hasAgeRestriction && (
          <View style={s.ageWarningCard}>
            <View style={s.ageWarningHeader}>
              <MaterialIcon name="alert-octagon" size={24} color="#DC2626" />
              <Text style={s.ageWarningTitle}>⚠️ विवाह सहयोग निकासी नियम (Age Restriction)</Text>
            </View>

            <Text style={s.ageWarningMsg}>
              {activeEligibility?.schemeEligibilityMessage ||
                `विवाह सहयोग योजना के अंतर्गत फंड निकासी हेतु बालिका/आवेदक की आयु 20 वर्ष से अधिक होना अनिवार्य है। आपकी वर्तमान आयु: ${applicantAge !== undefined ? `${applicantAge} वर्ष` : 'N/A'} है।`}
            </Text>

            {Boolean(activeEligibility?.schemeEligibilityMessageEn) && (
              <Text style={s.ageWarningMsgEn}>
                {activeEligibility.schemeEligibilityMessageEn}
              </Text>
            )}

            <View style={s.ageBadgesRow}>
              <View style={s.ageBadgeItem}>
                <Text style={s.ageBadgeLabel}>वर्तमान आयु (Current Age):</Text>
                <Text style={s.ageBadgeVal}>
                  {applicantAge !== undefined ? `${applicantAge} वर्ष (${applicantAge} yrs)` : 'N/A'}
                </Text>
              </View>

              {Boolean(applicantDob) && (
                <View style={s.ageBadgeItem}>
                  <Text style={s.ageBadgeLabel}>जन्म तिथि (DOB):</Text>
                  <Text style={s.ageBadgeVal}>{applicantDob}</Text>
                </View>
              )}

              <View style={[s.ageBadgeItem, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
                <Text style={[s.ageBadgeLabel, { color: '#991B1B' }]}>नियम (Rule):</Text>
                <Text style={[s.ageBadgeVal, { color: '#DC2626' }]}>आयु &gt; 20 वर्ष अनिवार्य</Text>
              </View>
            </View>

            <View style={s.ageLockFooter}>
              <MaterialIcon name="lock" size={16} color="#B91C1C" />
              <Text style={s.ageLockFooterText}>
                आवेदक की आयु 20 वर्ष पूर्ण होने के उपरांत ही इस खाते से निकासी की अनुमति दी जाएगी।
              </Text>
            </View>
          </View>
        )}

        {/* Available Limit Banner */}
        <View style={[s.limitCard, { borderColor: hasAgeRestriction ? '#FCA5A5' : `${themeColor}35` }]}>
          <View style={s.limitRow}>
            <View>
              <Text style={s.limitLabel}>निकासी उपलब्ध सीमा (Max Withdrawable)</Text>
              <Text style={[s.limitAmount, { color: hasAgeRestriction ? '#DC2626' : themeColor }]}>
                ₹ {maxWithdrawable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={s.limitRight}>
              <Text style={s.limitSub}>कुल वॉलेट: ₹{walletBal.toLocaleString('en-IN')}</Text>
              <Text style={s.limitSub}>लॉक-इन राशि: ₹{minBalReq.toLocaleString('en-IN')}</Text>
              <Text style={s.limitSub}>न्यूनतम निकासी: ₹{minWithdrawal.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Formula Helper Text */}
          <View style={s.formulaBox}>
            <MaterialIcon name="calculator-variant-outline" size={16} color="#059669" />
            <Text style={s.formulaText}>
              कुल बैलेंस: ₹{walletBal.toLocaleString('en-IN')} - लॉक-इन राशि: ₹{minBalReq.toLocaleString('en-IN')} = निकासी योग्य राशि: ₹{maxWithdrawable.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* 1. Amount Input Card */}
        <View style={[s.card, hasAgeRestriction && s.cardDisabled]}>
          <View style={s.sectionHeader}>
            <MaterialIcon name="cash-multiple" size={20} color={hasAgeRestriction ? '#94A3B8' : themeColor} />
            <Text style={[s.sectionTitle, hasAgeRestriction && { color: '#64748B' }]}>
              1. निकासी राशि (Amount)
            </Text>
            {hasAgeRestriction && (
              <View style={s.lockedPill}>
                <MaterialIcon name="lock" size={12} color="#DC2626" />
                <Text style={s.lockedPillText}>Locked (₹0)</Text>
              </View>
            )}
          </View>

          <View style={[
            s.inputWrap,
            hasAgeRestriction && s.inputWrapLocked,
            Boolean(amountValidation.error && parsedAmount > 0) && s.inputWrapError,
          ]}>
            <Text style={[s.currencySymbol, hasAgeRestriction && { color: '#94A3B8' }]}>₹</Text>
            <TextInput
              style={[s.amountInput, hasAgeRestriction && s.amountInputLocked]}
              keyboardType="numeric"
              editable={!hasAgeRestriction}
              placeholder={hasAgeRestriction ? 'निकासी लॉक (आयु ≤ 20 वर्ष)' : '0.00'}
              placeholderTextColor={hasAgeRestriction ? '#94A3B8' : '#CBD5E1'}
              value={hasAgeRestriction ? '0' : amountStr}
              onChangeText={(text) => {
                if (hasAgeRestriction) return;
                const cleaned = text.replace(/[^0-9]/g, '');
                setAmountStr(cleaned);
              }}
            />
            {amountStr.length > 0 && !hasAgeRestriction && (
              <TouchableOpacity onPress={() => setAmountStr('')} style={s.clearBtn}>
                <FeatherIcon name="x" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
            {hasAgeRestriction && (
              <MaterialIcon name="lock" size={18} color="#DC2626" style={{ marginRight: 6 }} />
            )}
          </View>

          {/* Quick Amount Chips (Enabled only when eligible) */}
          {!hasAgeRestriction && quickChips.length > 0 && (
            <View style={s.chipRow}>
              {quickChips.map((chip, idx) => {
                const val = typeof chip === 'object' ? chip.value : chip;
                const label = typeof chip === 'object' ? chip.label : `₹${chip.toLocaleString('en-IN')}`;
                const isSelected = parsedAmount === val;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      s.chip,
                      { borderColor: `${themeColor}40` },
                      isSelected && { backgroundColor: themeColor, borderColor: themeColor },
                    ]}
                    onPress={() => setAmountStr(String(val))}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        s.chipText,
                        { color: themeColor },
                        isSelected && { color: '#FFFFFF' },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Live Balance Preview Box */}
          <View style={s.previewBox}>
            <View style={s.previewRow}>
              <Text style={s.previewLabel}>वर्तमान वॉलेट शेष (Current):</Text>
              <Text style={s.previewVal}>₹ {walletBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={s.previewRow}>
              <Text style={s.previewLabel}>- अनुरोधित राशि (Requested):</Text>
              <Text style={[s.previewVal, { color: '#DC2626' }]}>
                - ₹ {parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={s.previewDivider} />
            <View style={s.previewRow}>
              <Text style={s.previewLabelBold}>= अनुमानित शेष (Projected):</Text>
              <Text
                style={[
                  s.previewValBold,
                  { color: projectedBalance < minBalReq ? '#DC2626' : '#059669' },
                ]}
              >
                ₹ {projectedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={s.minBalNotice}>
              <MaterialIcon
                name={projectedBalance < minBalReq ? 'alert-circle' : 'check-circle'}
                size={14}
                color={projectedBalance < minBalReq ? '#DC2626' : '#059669'}
              />
              <Text
                style={[
                  s.minBalNoticeText,
                  { color: projectedBalance < minBalReq ? '#DC2626' : '#059669' },
                ]}
              >
                {projectedBalance < minBalReq
                  ? `लॉक-इन राशि नियम का उल्लंघन: शेष राशि ₹${minBalReq.toLocaleString('en-IN')} से कम नहीं हो सकती!`
                  : `₹${minBalReq.toLocaleString('en-IN')} लॉक-इन राशि नियम का पालन करता है।`}
              </Text>
            </View>
          </View>

          {/* Error Message */}
          {Boolean(amountValidation.error && (parsedAmount > 0 || hasAgeRestriction)) && (
            <View style={s.amountErrorBox}>
              <MaterialIcon name="alert-circle-outline" size={16} color="#DC2626" />
              <Text style={s.amountErrorText}>{amountValidation.error}</Text>
            </View>
          )}
        </View>

        {/* 2. Payout Bank Selection Card */}
        <View style={s.card}>
          <View style={s.sectionHeader}>
            <MaterialIcon name="bank-outline" size={20} color={themeColor} />
            <Text style={s.sectionTitle}>2. भुगतान बैंक खाता (Payout Bank)</Text>
          </View>

          {/* Payout Bank Form */}
          <View style={s.newBankForm}>
            <Text style={s.fieldLabel}>खाता धारक का नाम (Account Holder Name) *</Text>
            <TextInput
              style={s.textInput}
              placeholder="नाम दर्ज करें (e.g. सुनीता देवी)"
              placeholderTextColor="#94A3B8"
              value={holderName}
              onChangeText={setHolderName}
            />

            <Text style={s.fieldLabel}>बैंक खाता संख्या (Account Number) *</Text>
            <TextInput
              style={s.textInput}
              placeholder="खाता संख्या दर्ज करें"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <Text style={s.fieldLabel}>खाता संख्या पुनः दर्ज करें (Confirm Account No) *</Text>
            <TextInput
              style={[
                s.textInput,
                Boolean(confirmAccountNumber && confirmAccountNumber !== accountNumber) && s.inputErrorBorder,
              ]}
              placeholder="पुनः खाता संख्या दर्ज करें"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={confirmAccountNumber}
              onChangeText={setConfirmAccountNumber}
            />
            {Boolean(confirmAccountNumber && confirmAccountNumber !== accountNumber) && (
              <Text style={s.fieldErrorText}>खाता संख्या मेल नहीं खाती!</Text>
            )}

            <Text style={s.fieldLabel}>IFSC कोड (11 अक्षर) *</Text>
            <View style={s.ifscInputWrap}>
              <TextInput
                style={[s.textInput, { flex: 1, textTransform: 'uppercase' }]}
                placeholder="e.g. SBIN0001234"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                maxLength={11}
                value={ifsc}
                onChangeText={handleIfscChange}
              />
              {ifscLoading && (
                <ActivityIndicator size="small" color={themeColor} style={s.ifscIndicator} />
              )}
              {ifscValid === true && !ifscLoading && (
                <MaterialIcon name="check-circle" size={20} color="#059669" style={s.ifscIndicator} />
              )}
              {ifscValid === false && !ifscLoading && (
                <MaterialIcon name="close-circle" size={20} color="#DC2626" style={s.ifscIndicator} />
              )}
            </View>

            {ifscValid === false && (
              <Text style={s.fieldErrorText}>मान्य 11 अक्षरों का IFSC कोड दर्ज करें (5वाँ अक्षर 0 होना चाहिए)।</Text>
            )}

            <Text style={s.fieldLabel}>बैंक का नाम (Bank Name) *</Text>
            <TextInput
              style={s.textInput}
              placeholder="e.g. State Bank of India"
              placeholderTextColor="#94A3B8"
              value={bankName}
              onChangeText={setBankName}
            />

            <Text style={s.fieldLabel}>शाखा का नाम (Branch Name)</Text>
            <TextInput
              style={s.textInput}
              placeholder="e.g. Connaught Place Branch"
              placeholderTextColor="#94A3B8"
              value={branchName}
              onChangeText={setBranchName}
            />

            <Text style={s.fieldLabel}>UPI ID (वैकल्पिक / Optional)</Text>
            <TextInput
              style={s.textInput}
              placeholder="e.g. name@okhdfcbank"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              value={upiId}
              onChangeText={setUpiId}
            />
          </View>

        </View>

        {/* 3. Purpose / Reason Card */}
        <View style={s.card}>
          <View style={s.sectionHeader}>
            <MaterialIcon name="text-box-check-outline" size={20} color={themeColor} />
            <Text style={s.sectionTitle}>3. निकासी का कारण (Purpose / Reason)</Text>
          </View>

          <View style={s.purposeChips}>
            {PURPOSE_OPTIONS.map((opt) => {
              const isSelected = selectedPurpose === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    s.purposeChip,
                    isSelected && { backgroundColor: themeColor, borderColor: themeColor },
                  ]}
                  onPress={() => setSelectedPurpose(opt.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      s.purposeChipText,
                      isSelected && { color: '#FFFFFF' },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[s.fieldLabel, { marginTop: 10 }]}>अतिरिक्त विवरण / टिप्पणी (वैकल्पिक)</Text>
          <TextInput
            style={[s.textInput, s.textArea]}
            placeholder="विस्तृत कारण या संदर्भ दर्ज करें..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={customReason}
            onChangeText={setCustomReason}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            s.submitBtn,
            { backgroundColor: hasAgeRestriction ? '#94A3B8' : themeColor },
            (!isFormValid || hasAgeRestriction) && s.submitBtnDisabled,
          ]}
          disabled={!isFormValid || hasAgeRestriction}
          onPress={handleSubmitPress}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <MaterialIcon
                name={hasAgeRestriction ? 'lock' : 'send-check'}
                size={20}
                color="#FFFFFF"
              />
              <Text style={s.submitBtnText}>
                {hasAgeRestriction
                  ? '⚠️ निकासी अपात्र (आयु 20 वर्ष से अधिक आवश्यक)'
                  : parsedAmount > 0
                  ? `₹${parsedAmount.toLocaleString('en-IN')} निकासी अनुरोध सबमिट करें`
                  : 'निकासी अनुरोध सबमिट करें'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={confirmModalVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={[s.modalIconWrap, { backgroundColor: `${themeColor}15` }]}>
              <MaterialIcon name="bank-transfer-out" size={32} color={themeColor} />
            </View>
            <Text style={s.modalTitle}>निकासी अनुरोध की पुष्टि करें</Text>
            <Text style={s.modalSubtitle}>
              कृपया सुनिश्चित करें कि आपका बैंक विवरण सही है।
            </Text>

            <View style={s.confirmBox}>
              <View style={s.confirmRow}>
                <Text style={s.confirmLabel}>अनुरोधित राशि:</Text>
                <Text style={[s.confirmVal, { color: themeColor, fontSize: 16, fontWeight: '800' }]}>
                  ₹ {parsedAmount.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={s.confirmRow}>
                <Text style={s.confirmLabel}>भुगतान बैंक:</Text>
                <Text style={s.confirmVal}>{selectedBankDisplay}</Text>
              </View>
              <View style={s.confirmRow}>
                <Text style={s.confirmLabel}>शेष राशि (Projected):</Text>
                <Text style={s.confirmVal}>₹ {projectedBalance.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            <View style={s.modalBtnRow}>
              <TouchableOpacity
                style={s.modalCancelBtn}
                onPress={() => setConfirmModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={s.modalCancelText}>सुधारें</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalConfirmBtn, { backgroundColor: themeColor }]}
                onPress={handleFinalSubmit}
                activeOpacity={0.85}
              >
                <Text style={s.modalConfirmText}>हाँ, पुष्टि करें</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error & Age Restriction Feedback Modal */}
      <Modal visible={submissionErrorModal.visible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { borderTopWidth: 4, borderTopColor: submissionErrorModal.isAgeRestriction ? '#DC2626' : '#EF4444' }]}>
            <View style={[s.modalIconWrap, { backgroundColor: submissionErrorModal.isAgeRestriction ? '#FEE2E2' : '#FEF2F2' }]}>
              <MaterialIcon
                name={submissionErrorModal.isAgeRestriction ? 'alert-octagon' : 'alert-circle-outline'}
                size={34}
                color={submissionErrorModal.isAgeRestriction ? '#DC2626' : '#EF4444'}
              />
            </View>

            <Text style={[s.modalTitle, { color: submissionErrorModal.isAgeRestriction ? '#991B1B' : '#0F172A' }]}>
              {submissionErrorModal.title}
            </Text>

            <Text style={[s.modalSubtitle, { color: '#334155', fontSize: 13, lineHeight: 19, marginTop: 4 }]}>
              {submissionErrorModal.message}
            </Text>

            {Boolean(submissionErrorModal.messageEn) && (
              <Text style={{ fontSize: 11.5, color: '#64748B', fontStyle: 'italic', textAlign: 'center', marginTop: 4, marginBottom: 12 }}>
                {submissionErrorModal.messageEn}
              </Text>
            )}

            <TouchableOpacity
              style={[s.modalConfirmBtn, { backgroundColor: submissionErrorModal.isAgeRestriction ? '#DC2626' : themeColor, width: '100%', marginTop: 8 }]}
              onPress={() => setSubmissionErrorModal({ visible: false, title: '', message: '', messageEn: '', isAgeRestriction: false })}
              activeOpacity={0.85}
            >
              <Text style={s.modalConfirmText}>समझ गया (OK)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  scroll: {
    padding: 16,
  },
  limitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  limitAmount: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  limitRight: {
    alignItems: 'flex-end',
  },
  limitSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: '#F8FAFC',
  },
  inputWrapError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    paddingVertical: 8,
  },
  clearBtn: {
    padding: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  previewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  previewLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  previewVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  previewLabelBold: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  previewValBold: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  minBalNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  minBalNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  amountErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
  },
  amountErrorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  newBankForm: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0F172A',
  },
  inputErrorBorder: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  fieldErrorText: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 2,
    fontWeight: '600',
  },
  ifscInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  ifscIndicator: {
    position: 'absolute',
    right: 12,
  },
  purposeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  purposeChip: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  purposeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  confirmLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  confirmVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    maxWidth: '65%',
    textAlign: 'right',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  // Age Restriction Warning Card Styles
  ageWarningCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  ageWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ageWarningTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#991B1B',
    flex: 1,
  },
  ageWarningMsg: {
    fontSize: 13,
    lineHeight: 19,
    color: '#7F1D1D',
    fontWeight: '600',
    marginBottom: 4,
  },
  ageWarningMsgEn: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#991B1B',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  ageBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  ageBadgeItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ageBadgeLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  ageBadgeVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  ageLockFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
  },
  ageLockFooterText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#B91C1C',
    flex: 1,
  },
  // Formula Box Styles
  formulaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  formulaText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '700',
    flex: 1,
    lineHeight: 15,
  },
  // Locked Input & Pill Styles
  cardDisabled: {
    backgroundColor: '#FAF5FF00',
  },
  lockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 'auto',
  },
  lockedPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  inputWrapLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  amountInputLocked: {
    color: '#94A3B8',
  },
});
