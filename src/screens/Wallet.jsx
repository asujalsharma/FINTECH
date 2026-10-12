import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../constants/colors';

import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import NavBar from '../components/NavBar';
import { getData } from '../API';
import useFundAccount from '../hooks/useFundAccount';

const Wallet = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Redux user fallback
  const reduxUser = useSelector(state => state.user || {});
  const userData = route?.params?.userData || reduxUser || {};

  // Main Wallet State
  const [walletInfo, setWalletInfo] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fund Account Hook
  const {
    profile: fundProfile,
    draft: fundDraft,
    fetchProfile: fetchFundProfile,
    fetchDraft: fetchFundDraft,
    accounts: fundAccounts,
    selectedAccount: fundSelectedAccount,
    selectedAccountId: fundSelectedAccountId,
    fetchMyAccounts: fetchFundAccounts,
    selectAccount: selectFundAccount,
    clearActiveAccount,
  } = useFundAccount();

  // ─── Fetch Main Wallet Info ───
  const fetchWallet = useCallback(async () => {
    try {
      setWalletLoading(true);
      const res = await getData('api/wallet/info');
      if (res?.Status || res?.success || res?.Data) {
        setWalletInfo(res?.Data || res?.data);
      }
    } catch (err) {
      console.log('Error fetching wallet info in Wallet.jsx:', err);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  // ─── Master Refresh ───
  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([
      fetchWallet(),
      fetchFundProfile(),
      fetchFundDraft(),
      fetchFundAccounts(),
    ]);
    setRefreshing(false);
  }, [
    fetchWallet,
    fetchFundProfile,
    fetchFundDraft,
    fetchFundAccounts,
  ]);

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [refreshAll])
  );

  // ─── Clipboard Helper ───
  const copyToClipboard = (text, label = 'ID') => {
    if (!text) return;
    Clipboard.setString(String(text));
    Toast.show({
      type: 'success',
      text1: 'कॉपी किया गया (Copied)',
      text2: `${label} क्लिपबोर्ड पर कॉपी हो गया।`,
    });
  };

  // ─── Wallet Data Calculation ───
  const rawBalance = walletInfo?.balance ?? 0;
  const formattedWalletBalance = Number(rawBalance).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const cashbackBal = walletInfo?.cashback ?? walletInfo?.cashbackBalance ?? 0;
  const userPhone =
    reduxUser?.phone ||
    reduxUser?.mobile ||
    userData?.phone ||
    userData?.mobile ||
    '';

  // ─── Fund Account Data Calculation ───
  const activeFundAccount = fundSelectedAccount || fundAccounts?.[0] || fundProfile;
  const totalFundAccounts = fundAccounts?.length || 0;

  const hasFundAccount = Boolean(
    totalFundAccounts > 0 ||
      activeFundAccount?.fundAccountId ||
      activeFundAccount?._id ||
      activeFundAccount?.balikaName ||
      activeFundAccount?.vivahSahayogId ||
      activeFundAccount?.accountNumber ||
      fundProfile?.fundAccountId ||
      fundProfile?._id ||
      fundProfile?.balikaName ||
      fundProfile?.vivahSahayogId ||
      fundProfile?.accountNumber ||
      fundDraft?.hasDraft ||
      fundDraft?.fundAccountId ||
      fundDraft?.formData?.balikaName
  );

  const balikaName =
    activeFundAccount?.balikaName ||
    fundProfile?.balikaName ||
    fundDraft?.formData?.balikaName ||
    fundDraft?.balikaName ||
    '';

  const vivahSahayogId =
    activeFundAccount?.vivahSahayogId ||
    activeFundAccount?.accountNumber ||
    activeFundAccount?.fundAccountId ||
    fundProfile?.vivahSahayogId ||
    fundProfile?.accountNumber ||
    fundProfile?.fundAccountId ||
    fundDraft?.vivahSahayogId ||
    fundDraft?.fundAccountId ||
    '';

  const fundAccountBalance =
    activeFundAccount?.fundWallet?.balance ??
    activeFundAccount?.wallet?.balance ??
    activeFundAccount?.balance ??
    fundProfile?.wallet?.balance ??
    fundProfile?.fundWallet?.balance ??
    fundProfile?.balance ??
    0;

  const fundStatusRaw =
    activeFundAccount?.approvalStatus ||
    activeFundAccount?.status ||
    fundProfile?.approvalStatus ||
    fundProfile?.status ||
    (fundDraft?.isSubmitted ? 'pending' : fundDraft?.hasDraft ? 'draft' : 'pending');

  const isFundApproved =
    fundStatusRaw === 'approved' || fundStatusRaw === 'active';

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* ── Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Wallet & Fund Account</Text>
          <Text style={styles.headerSubTitle}>वॉलेट एवं फंड खाता पासबुक</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.refreshBtn}
          onPress={refreshAll}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <MaterialIcon name="refresh" size={20} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ══════════════════════════════════════════════════════════════
            1. MAIN WALLET SECTION (मुख्य वॉलेट विवरण)
        ══════════════════════════════════════════════════════════════ */}
        <View style={styles.mainWalletCard}>
          <View style={styles.walletHeaderRow}>
            <View style={styles.walletBadgeRow}>
              <View style={styles.walletIconCircle}>
                <MaterialIcon name="wallet" size={20} color="#FFF" />
              </View>
              <View>
                <Text style={styles.walletHeaderLabel}>SARVANA MAIN WALLET</Text>
                <Text style={styles.walletHeaderSub}>प्राथमिक डिजिटल वॉलेट</Text>
              </View>
            </View>
            <View style={styles.activePill}>
              <View style={styles.activeDot} />
              <Text style={styles.activePillText}>सक्रिय (Active)</Text>
            </View>
          </View>

          {/* Balance Row */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceCurrency}>₹</Text>
            <Text style={styles.balanceValueText}>
              {walletLoading && !walletInfo ? '...' : formattedWalletBalance}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.availableLabel}>उपलब्ध शेष राशि (Available Balance)</Text>
            {Boolean(userPhone) && (
              <Text style={styles.phoneLabel}>
                खाता: +91 {String(userPhone).replace(/^\+?91/, '').trim()}
              </Text>
            )}
          </View>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <MaterialIcon name="gift-outline" size={16} color={COLORS.primary} />
              <Text style={styles.metricLabel}>कैशबैक:</Text>
              <Text style={styles.metricValue}>₹{Number(cashbackBal).toFixed(2)}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <MaterialIcon name="shield-check-outline" size={16} color={COLORS.secondary} />
              <Text style={styles.metricLabel}>सुरक्षा:</Text>
              <Text style={[styles.metricValue, { color: COLORS.secondary }]}>100% सुरक्षित</Text>
            </View>
          </View>

          {/* Wallet Actions */}
          <View style={styles.walletActionRow}>
            <TouchableOpacity
              style={styles.addMoneyBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('WalletTopupScreen')}
            >
              <MaterialIcon name="plus-circle" size={18} color="#FFF" />
              <Text style={styles.addMoneyBtnText}>Add Money</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.passbookBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ReportsScreen')}
            >
              <MaterialIcon name="file-document-outline" size={17} color={COLORS.primary} />
              <Text style={styles.passbookBtnText}>Passbook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.historyBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('RechargeHistory')}
            >
              <MaterialIcon name="history" size={17} color="#475569" />
              <Text style={styles.historyBtnText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════════
            2. VIVAH SAHAYOG FUND ACCOUNT SECTION (विवाह सहयोग फंड खाता)
        ══════════════════════════════════════════════════════════════ */}
        <View style={styles.fundSectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcon name="account-group" size={20} color={COLORS.secondary} />
              <Text style={styles.sectionMainTitle}>Vivah Sahayog Fund Account</Text>
              {totalFundAccounts > 1 && (
                <View style={styles.accountsCountBadge}>
                  <Text style={styles.accountsCountText}>{totalFundAccounts} खाते</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate(hasFundAccount ? 'SahayogAccount' : 'VivahSahayogEntry')
              }
            >
              <Text style={styles.viewAllText}>
                {hasFundAccount ? 'पूरा खाता देखें →' : 'विवरण →'}
              </Text>
            </TouchableOpacity>
          </View>

          {hasFundAccount ? (
            /* Registered Fund Account Card */
            <View style={styles.fundCard}>
              <View style={styles.fundCardTopRow}>
                <View style={styles.fundBadge}>
                  <MaterialIcon name="hand-heart" size={16} color="#FFF" />
                  <Text style={styles.fundBadgeText}>विवाह सहयोग योजना</Text>
                </View>

                <View
                  style={[
                    styles.fundStatusTag,
                    {
                      backgroundColor: isFundApproved ? '#ECFDF5' : '#FEF3C7',
                      borderColor: isFundApproved ? '#A7F3D0' : '#FDE68A',
                    },
                  ]}
                >
                  <MaterialIcon
                    name={isFundApproved ? 'check-circle' : 'clock-outline'}
                    size={13}
                    color={isFundApproved ? COLORS.secondary : '#D97706'}
                  />
                  <Text
                    style={[
                      styles.fundStatusText,
                      { color: isFundApproved ? COLORS.secondary : '#D97706' },
                    ]}
                  >
                    {isFundApproved ? 'स्वीकृत (Approved)' : 'समीक्षाधीन (Under Review)'}
                  </Text>
                </View>
              </View>

              {/* Multi-Account Switcher Bar if user has multiple accounts */}
              {totalFundAccounts > 1 && (
                <View style={styles.daughterTabsBox}>
                  <Text style={styles.daughterTabsTitle}>खाता चुनें (Switch Child):</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.daughterTabsScroll}
                  >
                    {fundAccounts.map(acc => {
                      const accId = acc.fundAccountId || acc._id;
                      const isAct =
                        accId === (fundSelectedAccountId || activeFundAccount?.fundAccountId || activeFundAccount?._id);
                      return (
                        <TouchableOpacity
                          key={accId}
                          style={[styles.daughterTabPill, isAct && styles.daughterTabPillActive]}
                          activeOpacity={0.7}
                          onPress={() => selectFundAccount(acc)}
                        >
                          <MaterialIcon
                            name={isAct ? 'check-circle' : 'account-child'}
                            size={14}
                            color={isAct ? '#FFF' : COLORS.secondary}
                          />
                          <Text
                            style={[styles.daughterTabPillText, isAct && styles.daughterTabPillTextActive]}
                            numberOfLines={1}
                          >
                            {acc.balikaName || 'बेटी का खाता'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    <TouchableOpacity
                      style={styles.daughterAddPill}
                      activeOpacity={0.7}
                      onPress={() => {
                        clearActiveAccount();
                        navigation.navigate('FundAccountStep1', { isNewAccount: true });
                      }}
                    >
                      <MaterialIcon name="plus-circle" size={14} color="#D81B60" />
                      <Text style={styles.daughterAddPillText}>+ दूसरी बेटी जोड़ें</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              )}

              {/* Beneficiary & ID Info */}
              <View style={styles.fundDetailsBox}>
                {Boolean(balikaName) && (
                  <View style={styles.fundInfoRow}>
                    <Text style={styles.fundLabel}>बालिका का नाम (Beneficiary):</Text>
                    <Text style={styles.fundValBold}>{balikaName}</Text>
                  </View>
                )}

                {Boolean(vivahSahayogId) && (
                  <View style={styles.fundInfoRow}>
                    <Text style={styles.fundLabel}>Vivah Sahayog ID (खाता संख्या):</Text>
                    <View style={styles.idCopyRow}>
                      <Text style={styles.fundValMono}>{vivahSahayogId}</Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.copySmallBtn}
                        onPress={() => copyToClipboard(vivahSahayogId, 'Vivah Sahayog ID')}
                      >
                        <MaterialIcon name="content-copy" size={14} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.fundInfoRow}>
                  <Text style={styles.fundLabel}>फंड खाता अनुदान शेष (Welfare Grant):</Text>
                  <Text style={styles.fundGrantText}>
                    ₹{Number(fundAccountBalance).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {/* Add another daughter link for single account users */}
              {totalFundAccounts === 1 && (
                <TouchableOpacity
                  style={styles.addSecondDaughterLink}
                  activeOpacity={0.7}
                  onPress={() => {
                    clearActiveAccount();
                    navigation.navigate('FundAccountStep1', { isNewAccount: true });
                  }}
                >
                  <MaterialIcon name="plus-circle-outline" size={15} color={COLORS.secondary} />
                  <Text style={styles.addSecondDaughterLinkText}>+ दूसरी बेटी का खाता जोड़ें (Add Another Daughter)</Text>
                </TouchableOpacity>
              )}

              {/* Fund Action Buttons */}
              <View style={styles.fundBtnRow}>
                <TouchableOpacity
                  style={styles.fundStatementBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('FundWalletStatements', { fundAccountId: activeFundAccount?.fundAccountId })}
                >
                  <MaterialIcon name="book-open-outline" size={16} color="#FFF" />
                  <Text style={styles.fundStatementBtnText}>फंड पासबुक (Statements)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fundManageBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('SahayogAccount')}
                >
                  <MaterialIcon name="card-account-details-outline" size={16} color={COLORS.secondary} />
                  <Text style={styles.fundManageBtnText}>खाता प्रबंधन</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Open Fund Account Promotion Card */
            <View style={styles.fundPromoCard}>
              <View style={styles.fundPromoContent}>
                <View style={styles.fundPromoIconBox}>
                  <MaterialIcon name="heart-plus" size={26} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.fundPromoTitle}>विवाह सहयोग फंड खाता खोलें</Text>
                  <Text style={styles.fundPromoSub}>
                    बेटियों के उज्ज्वल भविष्य और विवाह हेतु ₹51,000 तक की सहायता राशि प्राप्त करें।
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.fundRegisterBtn}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('VivahSahayogEntry')}
              >
                <Text style={styles.fundRegisterBtnText}>खाता खोलें / आवेदन करें (Apply Now)</Text>
                <MaterialIcon name="arrow-right" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
      <NavBar />
    </SafeAreaView>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 60,
    backgroundColor: COLORS.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  headerSubTitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginTop: 1,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 95,
  },

  // ── Main Wallet Card ──
  mainWalletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  walletHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  walletBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  walletHeaderLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  walletHeaderSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
    marginRight: 5,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  balanceCurrency: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 4,
  },
  balanceValueText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  availableLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  phoneLabel: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 6,
    marginRight: 4,
  },
  metricValue: {
    fontSize: 12.5,
    color: COLORS.primary,
    fontWeight: '800',
  },
  metricDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 12,
  },
  walletActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addMoneyBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 14,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    gap: 6,
  },
  addMoneyBtnText: {
    color: '#FFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  passbookBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F8',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: COLORS.primary,
    gap: 5,
  },
  passbookBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  historyBtn: {
    flex: 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 4,
  },
  historyBtnText: {
    color: '#475569',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // ── Fund Section ──
  fundSectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sectionMainTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.2,
  },
  accountsCountBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginLeft: 4,
  },
  accountsCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  viewAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  fundCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  fundCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  fundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  fundBadgeText: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  fundStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  fundStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fundDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  fundInfoRow: {
    marginBottom: 8,
  },
  fundLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  fundValBold: {
    fontSize: 14.5,
    color: '#1E293B',
    fontWeight: '800',
  },
  idCopyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fundValMono: {
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  copySmallBtn: {
    padding: 4,
    backgroundColor: '#FFF5F8',
    borderRadius: 6,
  },
  fundGrantText: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: '900',
  },
  fundBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fundStatementBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    elevation: 2,
  },
  fundStatementBtnText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  fundManageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 5,
  },
  fundManageBtnText: {
    color: COLORS.secondary,
    fontSize: 12.5,
    fontWeight: '800',
  },

  // ── Multi-Account Daughter Switcher Tabs ──
  daughterTabsBox: {
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  daughterTabsTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  daughterTabsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  daughterTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
  },
  daughterTabPillActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  daughterTabPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  daughterTabPillTextActive: {
    color: '#FFFFFF',
  },
  daughterAddPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF0F5',
    borderWidth: 1.2,
    borderColor: '#FCE7F3',
  },
  daughterAddPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D81B60',
  },
  addSecondDaughterLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  addSecondDaughterLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  // ── Fund Promo Card ──
  fundPromoCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  fundPromoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  fundPromoIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  fundPromoTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  fundPromoSub: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  fundRegisterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  fundRegisterBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
