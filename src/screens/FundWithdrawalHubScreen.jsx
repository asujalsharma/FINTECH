import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../constants/colors';
import useFundWithdrawal from '../hooks/useFundWithdrawal';
import useFundAccount from '../hooks/useFundAccount';
import { getSchemeMeta, resolveSchemeCode } from '../services/fundSchemeService';
import FundWithdrawalDetailsModal from '../components/FundWithdrawalDetailsModal';

export default function FundWithdrawalHubScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    eligibility,
    eligibilityLoading,
    loadEligibility,
    requests,
    requestsLoading,
    loadRequests,
    cancelling,
    cancelRequest,
    currentRequestLoading,
    loadRequestDetails,
  } = useFundWithdrawal();

  const {
    accounts,
    selectedAccount,
    selectedAccountId,
    fetchMyAccounts,
    profile,
    fetchProfile,
  } = useFundAccount();

  const [selectedDetailsRequest, setSelectedDetailsRequest] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const activeProfile = profile || route.params?.profile;
  const activeAccount = selectedAccount || route.params?.account;

  // Determine active fundAccountId
  const targetFundAccountId =
    route.params?.fundAccountId ||
    route.params?.account?.fundAccountId ||
    route.params?.account?._id ||
    route.params?.profile?.fundAccountId ||
    route.params?.profile?._id ||
    selectedAccountId ||
    profile?.fundAccountId ||
    profile?._id ||
    selectedAccount?.fundAccountId ||
    selectedAccount?._id;

  const activeSchemeCode = resolveSchemeCode(
    route.params?.schemeCode ||
    route.params?.profile?.sahayogType ||
    route.params?.profile?.schemeCode ||
    route.params?.account?.sahayogType ||
    route.params?.account?.schemeCode ||
    eligibility?.sahayogType ||
    eligibility?.schemeCode ||
    activeProfile?.sahayogType ||
    activeProfile?.schemeCode ||
    activeProfile?.scheme ||
    activeAccount?.sahayogType ||
    activeAccount?.schemeCode ||
    'VIVAH_SAHAYOG'
  );
  const schemeMeta = getSchemeMeta(activeSchemeCode);
  const themeColor = schemeMeta.color || COLORS.primary;

  const loadAll = useCallback(async () => {
    const accRes = await fetchMyAccounts(targetFundAccountId);
    const rawAccs = accRes?.Data?.accounts || (Array.isArray(accRes?.Data) ? accRes?.Data : []);
    const matched = rawAccs.find(
      (a) =>
        (a.fundAccountId && a.fundAccountId === targetFundAccountId) ||
        (a._id && a._id === targetFundAccountId) ||
        (a.accountId && a.accountId === targetFundAccountId) ||
        (a.accountNumber && a.accountNumber === targetFundAccountId) ||
        (a.vivahSahayogId && a.vivahSahayogId === targetFundAccountId)
    ) || rawAccs.find((a) => (a.fundAccountId || a._id) === targetFundAccountId) || rawAccs[0];
    const actId = matched?.fundAccountId || matched?._id || targetFundAccountId;

    if (actId) {
      await Promise.all([
        loadEligibility(actId),
        fetchProfile(actId),
        loadRequests({ page: 1, limit: 5, fundAccountId: actId }),
      ]);
    }
  }, [fetchMyAccounts, fetchProfile, loadEligibility, loadRequests, targetFundAccountId]);

  useEffect(() => {
    loadAll();
    const unsub = navigation.addListener('focus', loadAll);
    return unsub;
  }, [navigation, loadAll]);


  const handleOpenDetails = async (req) => {
    setSelectedDetailsRequest(req);
    setDetailsModalVisible(true);
    const full = await loadRequestDetails(req._id || req.id || req.requestId);
    if (full) {
      setSelectedDetailsRequest(full);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await cancelRequest(requestId, 'User cancelled request', targetFundAccountId);
      setDetailsModalVisible(false);
      loadAll();
    } catch (err) {
      // Handled in cancelRequest
    }
  };

  // Balances & calculations from API eligibility data with safe fallbacks
  // Determine if this is Vivah Sahayog:
  // 1. If backend explicitly returned `isVivahSahayog` boolean, strictly respect it!
  //    (isVivahSahayog === false means 100% NOT Vivah Sahayog, NO age restrictions!)
  // 2. Otherwise verify if activeSchemeCode is specifically 'VIVAH_SAHAYOG'.
  const isVivahScheme =
    eligibility?.isVivahSahayog !== undefined
      ? Boolean(eligibility.isVivahSahayog)
      : activeSchemeCode === 'VIVAH_SAHAYOG';

  const applicantAge = eligibility?.applicantAge !== undefined
    ? Number(eligibility.applicantAge)
    : activeProfile?.currentAge !== undefined
    ? Number(String(activeProfile.currentAge).match(/\d+/)?.[0])
    : undefined;

  const applicantDob =
    eligibility?.applicantDob ||
    activeProfile?.dob ||
    activeProfile?.formData?.dob;

  // Vivah Sahayog Age Eligibility: must be strictly > 20 yrs.
  // Other schemes: no age restriction.
  const isAgeEligible = isVivahScheme
    ? eligibility?.isAgeEligible !== undefined
      ? Boolean(eligibility.isAgeEligible)
      : applicantAge !== undefined
      ? applicantAge > 20
      : true
    : true;

  const hasAgeRestriction = isVivahScheme && !isAgeEligible;

  const walletBal = Number(
    eligibility?.walletBalance !== undefined
      ? eligibility.walletBalance
      : activeProfile?.fundWallet?.balance !== undefined
      ? activeProfile.fundWallet.balance
      : activeAccount?.fundWallet?.balance !== undefined
      ? activeAccount.fundWallet.balance
      : 0
  );
  const minBalReq = Number(eligibility?.minAccountBalanceRequired ?? 500);
  const pendingAmt = Number(eligibility?.pendingWithdrawalAmount ?? 0);

  // If age restricted, maxWithdrawable must show ₹0
  const maxWithdrawable = hasAgeRestriction
    ? 0
    : Number(
        eligibility?.maxWithdrawableAmount !== undefined
          ? eligibility.maxWithdrawableAmount
          : Math.max(0, walletBal - minBalReq - pendingAmt)
      );

  const isEligible = Boolean(!hasAgeRestriction && (eligibility?.isEligible ?? true) && maxWithdrawable > 0);
  const beneficiaryName =
    route.params?.beneficiaryName ||
    eligibility?.beneficiaryName ||
    activeProfile?.beneficiaryName ||
    activeProfile?.balikaName ||
    activeProfile?.applicantName ||
    activeAccount?.beneficiaryName ||
    activeAccount?.balikaName ||
    activeAccount?.applicantName ||
    'लाभार्थी';

  const sahayogId =
    eligibility?.sahayogId ||
    activeProfile?.accountId ||
    activeProfile?.accountNumber ||
    activeProfile?.vivahSahayogId ||
    activeAccount?.accountId ||
    activeAccount?.accountNumber ||
    activeAccount?.vivahSahayogId ||
    targetFundAccountId;

  const formatLockInNotice = (text) => {
    if (!text) {
      return 'खाते में निर्धारित लॉक-इन राशि (Lock-in Amount) बनाए रखना अनिवार्य है ताकि खाता सक्रिय बना रहे।';
    }
    let s = String(text);
    // Replace patterns like "खाते में न्यूनतम ₹500 शेष राशि अनिवार्य है।" -> "खाते में ₹500 लॉक-इन राशि अनिवार्य है।"
    s = s.replace(/न्यूनतम\s*₹?\s*(\d+)?\s*(शेष\s*राशि|शेष|राशि|बैलेंस)?/gi, (match, num) => {
      return num ? `₹${num} लॉक-इन राशि` : 'लॉक-इन राशि';
    });
    s = s.replace(/\(Minimum Balance\)/gi, '(Lock-in Amount)');
    s = s.replace(/minimum\s*(balance|amount)?/gi, 'lock-in amount');
    s = s.replace(/minimum/gi, 'lock-in');
    s = s.replace(/न्यूनतम/g, 'लॉक-इन');
    return s;
  };

  const notice = formatLockInNotice(eligibility?.notice);

  const recentRequests = requests.slice(0, 5);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
          activeOpacity={0.7}
        >
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <View style={s.headerTitleWrap}>
          <Text style={s.headerTitle}>फंड निकासी हब (Withdrawal Hub)</Text>
          <Text style={[s.headerSubtitle, { color: themeColor }]}>
            {schemeMeta.name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('FundWithdrawalHistory', {
              fundAccountId: targetFundAccountId,
              schemeCode: activeSchemeCode,
              account: activeAccount,
              profile: activeProfile,
              beneficiaryName,
            })
          }
          style={s.headerBtn}
          activeOpacity={0.7}
        >
          <MaterialIcon name="history" size={24} color={themeColor} />
        </TouchableOpacity>
      </View>


      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={eligibilityLoading || requestsLoading}
            onRefresh={loadAll}
            colors={[themeColor]}
          />
        }
      >
        {/* Prominent Amber/Red Warning Banner (Only for VIVAH_SAHAYOG when age <= 20) */}
        {hasAgeRestriction && (
          <View style={{
            backgroundColor: '#FEF2F2',
            borderColor: '#FCA5A5',
            borderWidth: 1.5,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <MaterialIcon name="alert-octagon" size={22} color="#DC2626" />
              <Text style={{ fontSize: 14.5, fontWeight: '900', color: '#991B1B' }}>
                ⚠️ विवाह सहयोग निकासी नियम (Age Restriction)
              </Text>
            </View>

            <Text style={{ fontSize: 12.5, lineHeight: 18, color: '#7F1D1D', fontWeight: '600' }}>
              {eligibility?.schemeEligibilityMessage ||
                `विवाह सहयोग योजना के अंतर्गत फंड निकासी हेतु बालिका/आवेदक की आयु 20 वर्ष से अधिक होना अनिवार्य है। आपकी वर्तमान आयु: ${applicantAge !== undefined ? `${applicantAge} वर्ष` : 'N/A'} है।`}
            </Text>

            {Boolean(eligibility?.schemeEligibilityMessageEn) && (
              <Text style={{ fontSize: 11, color: '#991B1B', fontStyle: 'italic', marginTop: 4 }}>
                {eligibility.schemeEligibilityMessageEn}
              </Text>
            )}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FECACA', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 10.5, color: '#64748B', fontWeight: '600' }}>वर्तमान आयु (Current Age):</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#0F172A' }}>
                  {applicantAge !== undefined ? `${applicantAge} वर्ष (${applicantAge} yrs)` : 'N/A'}
                </Text>
              </View>

              {Boolean(applicantDob) && (
                <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FECACA', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 10.5, color: '#64748B', fontWeight: '600' }}>जन्म तिथि (DOB):</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#0F172A' }}>{applicantDob}</Text>
                </View>
              )}

              <View style={{ backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 10.5, color: '#991B1B', fontWeight: '600' }}>निकासी नियम:</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#DC2626' }}>आयु &gt; 20 वर्ष अनिवार्य</Text>
              </View>
            </View>
          </View>
        )}

        {/* Top Main Passbook & Withdrawal Card */}
        <View style={[s.mainCard, { borderColor: hasAgeRestriction ? '#FCA5A5' : `${themeColor}30` }]}>
          <View style={s.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <View style={[s.tagBadge, { backgroundColor: `${themeColor}15` }]}>
                <Text style={[s.tagBadgeText, { color: themeColor }]}>
                  {schemeMeta.name} • {sahayogId}
                </Text>
              </View>
              <Text style={s.beneficiaryName}>{beneficiaryName}</Text>
            </View>
            <View style={[s.iconRing, { backgroundColor: `${themeColor}12` }]}>
              <MaterialIcon name="wallet-outline" size={28} color={themeColor} />
            </View>
          </View>

          <View style={s.balanceDivider} />

          {/* Wallet Balance & Limits Grid */}
          <View style={s.balanceGrid}>
            <View style={s.balanceGridItem}>
              <Text style={s.gridLabel}>कुल वॉलेट शेष (Wallet)</Text>
              <Text style={s.gridValue}>
                ₹ {walletBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={s.balanceGridItem}>
              <Text style={s.gridLabel}>लंबित अनुरोध (Pending)</Text>
              <Text style={[s.gridValue, { color: pendingAmt > 0 ? '#D97706' : '#64748B' }]}>
                {pendingAmt > 0 ? `₹ ${pendingAmt.toLocaleString('en-IN')}` : '₹ 0'}
              </Text>
            </View>
          </View>

          {/* Lock-in Amount Notice Badge */}
          <View style={s.minBalBadgeRow}>
            <View style={s.minBalBadge}>
              <MaterialIcon name="lock" size={14} color="#059669" />
              <Text style={s.minBalBadgeText}>
                अनिवार्य लॉक-इन राशि (Lock-in Amount): ₹{minBalReq.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Prominent "Available to Withdraw" Highlight Callout */}
          <View style={[
            s.withdrawableCallout,
            { backgroundColor: hasAgeRestriction ? '#FEF2F2' : `${themeColor}0A`, borderColor: hasAgeRestriction ? '#FCA5A5' : `${themeColor}40` }
          ]}>
            <View style={s.withdrawableHeader}>
              <View style={[s.withdrawableIconWrap, { backgroundColor: hasAgeRestriction ? '#DC2626' : themeColor }]}>
                <MaterialIcon name={hasAgeRestriction ? 'lock' : 'cash-fast'} size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.withdrawableSub}>निकासी हेतु उपलब्ध राशि (Available to Withdraw)</Text>
                <Text style={[s.withdrawableAmount, { color: hasAgeRestriction ? '#DC2626' : themeColor }]}>
                  ₹ {maxWithdrawable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              {hasAgeRestriction ? (
                <View style={{ backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#DC2626' }}>अपात्र (Age ≤ 20)</Text>
                </View>
              ) : isEligible ? (
                <View style={s.statusPillEligible}>
                  <Text style={s.statusPillEligibleText}>पात्र (Eligible)</Text>
                </View>
              ) : (
                <View style={s.statusPillLocked}>
                  <Text style={s.statusPillLockedText}>सीमा शून्य</Text>
                </View>
              )}
            </View>

            {/* Formula Helper Text */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginTop: 10,
              paddingVertical: 6,
              paddingHorizontal: 8,
              backgroundColor: hasAgeRestriction ? '#FEE2E2' : '#F0FDF4',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: hasAgeRestriction ? '#FECACA' : '#BBF7D0',
            }}>
              <MaterialIcon name="calculator-variant-outline" size={15} color={hasAgeRestriction ? '#DC2626' : '#059669'} />
              <Text style={{ fontSize: 11, color: hasAgeRestriction ? '#991B1B' : '#166534', fontWeight: '700', flex: 1 }}>
                कुल बैलेंस: ₹{walletBal.toLocaleString('en-IN')} - लॉक-इन राशि: ₹{minBalReq.toLocaleString('en-IN')} = निकासी योग्य राशि: ₹{maxWithdrawable.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Primary Action Button: "Request Withdrawal" */}
          <TouchableOpacity
            style={[
              s.primaryActionBtn,
              { backgroundColor: hasAgeRestriction ? '#94A3B8' : themeColor },
              (!isEligible || hasAgeRestriction) && s.actionBtnDisabled,
            ]}
            disabled={!isEligible || hasAgeRestriction}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('FundWithdrawalRequest', {
                fundAccountId: targetFundAccountId,
                schemeCode: activeSchemeCode,
                account: activeAccount,
                profile: activeProfile,
                beneficiaryName,
                eligibility: {
                  ...eligibility,
                  walletBalance: walletBal,
                  minAccountBalanceRequired: minBalReq,
                  maxWithdrawableAmount: maxWithdrawable,
                  isAgeEligible,
                  isVivahSahayog: isVivahScheme,
                  applicantAge,
                  applicantDob,
                  beneficiaryName,
                  sahayogId,
                },
              })
            }
          >
            <MaterialIcon name={hasAgeRestriction ? 'lock' : 'bank-transfer-out'} size={22} color="#FFFFFF" />
            <Text style={s.primaryActionBtnText}>
              {hasAgeRestriction
                ? 'निकासी लॉक (आयु 20 वर्ष से अधिक अनिवार्य)'
                : 'राशि निकासी का अनुरोध करें'}
            </Text>
            <FeatherIcon name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {!isEligible && (
            <View style={s.ineligibleHint}>
              <MaterialIcon name="information-outline" size={15} color={hasAgeRestriction ? '#DC2626' : '#D97706'} />
              <Text style={[s.ineligibleHintText, hasAgeRestriction && { color: '#B91C1C' }]}>
                {hasAgeRestriction
                  ? (eligibility?.schemeEligibilityMessage || 'विवाह सहयोग योजना के अंतर्गत आवेदक/बालिका की आयु 20 वर्ष से अधिक होने पर ही फंड निकासी उपलब्ध होगी।')
                  : walletBal <= minBalReq
                  ? `खाते में उपलब्ध शेष (₹${walletBal}) अनिवार्य लॉक-इन राशि (₹${minBalReq}) के बराबर या कम है।`
                  : pendingAmt > 0
                  ? `आपकी पूर्व निकासी अनुरोध (₹${pendingAmt}) समीक्षाधीन है।`
                  : 'वर्तमान में निकासी उपलब्ध नहीं है।'}
              </Text>
            </View>
          )}
        </View>

        {/* Foundation Notice Banner */}
        <View style={s.noticeBanner}>
          <MaterialIcon name="shield-alert-outline" size={20} color="#D81B60" style={s.noticeIcon} />
          <View style={{ flex: 1 }}>
            <Text style={s.noticeTitle}>संस्था दिशा-निर्देश व नियम (Policy Notice)</Text>
            <Text style={s.noticeDesc}>{notice}</Text>
          </View>
        </View>

        {/* Quick Links Row: Passbook Statement & History */}
        <View style={s.quickLinksRow}>
          <TouchableOpacity
            style={s.quickLinkCard}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('FundWalletStatements', {
                fundAccountId: targetFundAccountId,
                schemeCode: activeSchemeCode,
              })
            }
          >
            <View style={[s.quickLinkIcon, { backgroundColor: '#EFF6FF' }]}>
              <MaterialIcon name="book-open-outline" size={22} color="#2563EB" />
            </View>
            <Text style={s.quickLinkTitle}>खाता पासबुक</Text>
            <Text style={s.quickLinkSub}>सभी अनुदान व लेन-देन</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.quickLinkCard}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('FundWithdrawalHistory', {
                fundAccountId: targetFundAccountId,
                schemeCode: activeSchemeCode,
                account: activeAccount,
                profile: activeProfile,
                beneficiaryName,
              })
            }
          >
            <View style={[s.quickLinkIcon, { backgroundColor: '#FDF2F8' }]}>
              <MaterialIcon name="history" size={22} color="#D81B60" />
            </View>
            <Text style={s.quickLinkTitle}>निकासी इतिहास</Text>
            <Text style={s.quickLinkSub}>अनुरोध स्थिति व UTR</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Withdrawal Requests Section */}
        <View style={s.recentSection}>
          <View style={s.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcon name="clipboard-text-clock-outline" size={20} color="#0F172A" />
              <Text style={s.sectionTitle}>हालिया निकासी अनुरोध (Recent Requests)</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('FundWithdrawalHistory', {
                  fundAccountId: targetFundAccountId,
                  schemeCode: activeSchemeCode,
                  account: activeAccount,
                  profile: activeProfile,
                  beneficiaryName,
                })
              }
              activeOpacity={0.7}
            >
              <Text style={[s.viewAllLink, { color: themeColor }]}>सभी देखें</Text>
            </TouchableOpacity>
          </View>

          {requestsLoading && recentRequests.length === 0 ? (
            <View style={s.loadingBox}>
              <ActivityIndicator color={themeColor} size="small" />
              <Text style={s.loadingText}>इतिहास लोड हो रहा है...</Text>
            </View>
          ) : recentRequests.length === 0 ? (
            <View style={s.emptyBox}>
              <MaterialIcon name="file-document-outline" size={40} color="#CBD5E1" />
              <Text style={s.emptyTitle}>कोई पूर्व निकासी अनुरोध नहीं है</Text>
              <Text style={s.emptySub}>
                जब आप निकासी अनुरोध करेंगे, तो उसकी समीक्षा एवं भुगतान स्थिति यहाँ दिखाई देगी।
              </Text>
            </View>
          ) : (
            recentRequests.map((item) => {
              const reqId = item.requestId || item._id;
              const reqAmount = Number(item.amount || 0);
              const status = (item.status || 'pending').toLowerCase();
              const isAppr = status === 'approved';
              const isRej = status === 'rejected';

              const pillConfig = isAppr
                ? { label: 'स्वीकृत (Paid)', bg: '#ECFDF5', color: '#059669', icon: 'check-circle' }
                : isRej
                ? { label: 'अस्वीकृत', bg: '#FEF2F2', color: '#DC2626', icon: 'close-circle' }
                : status === 'cancelled'
                ? { label: 'रद्द', bg: '#F1F5F9', color: '#64748B', icon: 'cancel' }
                : { label: 'समीक्षाधीन', bg: '#FFFBEB', color: '#D97706', icon: 'clock-outline' };

              const dateStr = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString('hi-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—';

              return (
                <TouchableOpacity
                  key={reqId}
                  style={s.requestCard}
                  onPress={() => handleOpenDetails(item)}
                  activeOpacity={0.8}
                >
                  <View style={s.requestCardLeft}>
                    <View style={[s.reqIconCircle, { backgroundColor: pillConfig.bg }]}>
                      <MaterialIcon name={pillConfig.icon} size={20} color={pillConfig.color} />
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={s.reqIdText}>{item.requestId || 'निकासी अनुरोध'}</Text>
                      <Text style={s.reqDateText}>{dateStr}</Text>
                    </View>
                  </View>

                  <View style={s.requestCardRight}>
                    <Text style={s.reqAmountText}>₹ {reqAmount.toLocaleString('en-IN')}</Text>
                    <View style={[s.reqStatusPill, { backgroundColor: pillConfig.bg }]}>
                      <Text style={[s.reqStatusPillText, { color: pillConfig.color }]}>
                        {pillConfig.label}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Details Modal */}
      <FundWithdrawalDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        request={selectedDetailsRequest}
        loading={currentRequestLoading}
        onCancelRequest={handleCancelRequest}
        cancelling={cancelling}
        themeColor={themeColor}
      />
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
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  accountSwitcher: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switcherLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  switcherScroll: {
    gap: 8,
  },
  switcherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  switcherChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  tagBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  beneficiaryName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  iconRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  balanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  balanceGridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  minBalBadgeRow: {
    marginBottom: 14,
  },
  minBalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  minBalBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  withdrawableCallout: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 16,
  },
  withdrawableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  withdrawableIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawableSub: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  withdrawableAmount: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  statusPillEligible: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillEligibleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  statusPillLocked: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillLockedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  ineligibleHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    gap: 6,
  },
  ineligibleHintText: {
    fontSize: 11.5,
    color: '#B45309',
    flex: 1,
    fontWeight: '600',
  },
  noticeBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF0F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    padding: 14,
    marginBottom: 16,
  },
  noticeIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9F1239',
    marginBottom: 4,
  },
  noticeDesc: {
    fontSize: 12,
    color: '#881337',
    lineHeight: 17,
  },
  quickLinksRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickLinkCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  quickLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLinkTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  quickLinkSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  recentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewAllLink: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  loadingBox: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
    paddingHorizontal: 20,
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  requestCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reqIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqIdText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  reqDateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  requestCardRight: {
    alignItems: 'flex-end',
  },
  reqAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  reqStatusPill: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  reqStatusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
});
