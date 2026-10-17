import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  FlatList, StatusBar, ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../constants/colors';
import useFundAccount, { calculateWithdrawalEligibility, normalizeFundStatement } from '../hooks/useFundAccount';

const LIMIT = 10;

const TxnRow = ({ item }) => {
  const norm = normalizeFundStatement(item);
  const isCredit = (norm.type || norm.txnType || 'credit').toLowerCase() !== 'debit';
  const rawAmount = norm.txnAmount !== undefined ? norm.txnAmount : (norm.amount || 0);
  const amountNum = typeof rawAmount === 'number' ? rawAmount : parseFloat(rawAmount) || 0;

  const balanceAfter = norm.balanceAfter !== undefined && norm.balanceAfter !== null
    ? Number(norm.balanceAfter)
    : null;

  const txnDate = norm.createdAt
    ? new Date(norm.createdAt).toLocaleDateString('hi-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <View style={tr.row}>
      <View style={[tr.iconCircle, { backgroundColor: isCredit ? '#ECFDF5' : '#FEF2F2' }]}>
        <MaterialIcon
          name={isCredit ? 'arrow-down-left' : 'arrow-up-right'}
          size={24}
          color={isCredit ? '#059669' : '#DC2626'}
        />
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={tr.txnName} numberOfLines={1}>
          {norm.txnName}
        </Text>
        {norm.txnDesc ? (
          <Text style={tr.txnDesc} numberOfLines={2}>
            {norm.txnDesc}
          </Text>
        ) : null}
        <View style={tr.metaRow}>
          <Text style={tr.txnDate}>{txnDate}</Text>
          {balanceAfter !== null ? (
            <Text style={tr.balanceAfterText}>
              • शेष: ₹{balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
        <Text style={[tr.amount, { color: isCredit ? '#059669' : '#DC2626' }]}>
          {isCredit ? '+' : '-'}₹{amountNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>
        <View style={[tr.typePill, { backgroundColor: isCredit ? '#ECFDF5' : '#FEF2F2' }]}>
          <Text style={[tr.txnType, { color: isCredit ? '#059669' : '#DC2626' }]} numberOfLines={1}>
            {norm.pillLabel}
          </Text>
        </View>
      </View>
    </View>
  );
};

const tr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  txnDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  txnDate: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  balanceAfterText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginLeft: 4,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
  },
  typePill: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  txnType: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export default function FundWalletStatementsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    profile,
    statements,
    statementsTotal,
    statementsLoading,
    fundWallet,
    fetchStatements,
    fetchProfile,
    accounts,
    selectedAccount,
    selectedAccountId,
    fetchMyAccounts,
    selectAccount,
    clearStatements,
  } = useFundAccount();

  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Determine active daughter account & approval status
  const currentAcc =
    (accounts && accounts.find(a => (a.fundAccountId || a._id) === selectedAccountId)) ||
    selectedAccount ||
    profile;

  const statusKey = (
    currentAcc?.approvalStatus ||
    currentAcc?.status ||
    profile?.approvalStatus ||
    profile?.status ||
    (currentAcc?.isSubmitted ? 'pending' : 'draft')
  ).toLowerCase();

  const isApproved = statusKey === 'approved';
  const isPending = statusKey === 'pending' || Boolean(currentAcc?.isSubmitted || profile?.isSubmitted);
  const isDraft = !isApproved && !isPending;

  // Active account information
  const activeBalikaName =
    currentAcc?.balikaName ||
    selectedAccount?.balikaName ||
    profile?.balikaName ||
    route.params?.balikaName ||
    'बालिका';

  const activeVivahSahayogId =
    currentAcc?.vivahSahayogId ||
    selectedAccount?.vivahSahayogId ||
    profile?.vivahSahayogId ||
    '';

  const rawBalance = isApproved
    ? (fundWallet?.balance ??
       currentAcc?.fundWallet?.balance ??
       selectedAccount?.fundWallet?.balance ??
       profile?.fundWallet?.balance ??
       profile?.wallet?.balance ??
       0)
    : 0;
  const balance = typeof rawBalance === 'number' ? rawBalance : parseFloat(rawBalance) || 0;

  const rawInitialBalance = isApproved
    ? (fundWallet?.initialBalance ??
       currentAcc?.fundWallet?.initialBalance ??
       profile?.fundWallet?.initialBalance ??
       null)
    : null;
  const initialBalance = rawInitialBalance !== null ? Number(rawInitialBalance) : null;

  const withdrawalInfo = calculateWithdrawalEligibility(
    currentAcc?.dob || profile?.dob || selectedAccount?.dob,
    currentAcc?.currentAge || profile?.currentAge || selectedAccount?.currentAge
  );

  const load = useCallback(async (pg = 1, append = false, targetId) => {
    const accId = targetId || selectedAccountId || route.params?.fundAccountId;
    await fetchStatements(pg, LIMIT, append, accId);
  }, [fetchStatements, selectedAccountId, route.params?.fundAccountId]);

  useEffect(() => {
    const init = async () => {
      const targetParamId = route.params?.fundAccountId;
      const accRes = await fetchMyAccounts(targetParamId);
      const rawAccs = accRes?.Data?.accounts || (Array.isArray(accRes?.Data) ? accRes?.Data : []);
      const matched = rawAccs.find(a => (a.fundAccountId || a._id) === (targetParamId || selectedAccountId)) || rawAccs[0];
      const actId = matched?.fundAccountId || matched?._id || targetParamId || selectedAccountId;
      if (actId) {
        await fetchProfile(actId);
        const st = (matched?.approvalStatus || matched?.status || '').toLowerCase();
        if (st === 'approved') {
          load(1, false, actId);
        } else {
          clearStatements();
        }
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.fundAccountId]);

  const handleSelectDaughter = async (acc) => {
    const accId = acc.fundAccountId || acc._id;
    if (accId === selectedAccountId) return;
    setPage(1);
    clearStatements();
    await selectAccount(acc);
    await fetchProfile(accId);
    const accStatus = (acc.approvalStatus || acc.status || '').toLowerCase();
    if (accStatus === 'approved') {
      load(1, false, accId);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchMyAccounts(selectedAccountId);
    await fetchProfile(selectedAccountId);
    if (isApproved) {
      await load(1, false, selectedAccountId);
    } else {
      clearStatements();
    }
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (!isApproved || statementsLoading) return;
    if (statements.length >= statementsTotal) return;
    const nextPage = page + 1;
    setPage(nextPage);
    load(nextPage, true, selectedAccountId);
  };

  const ListHeader = () => (
    <>
      {/* Multi-Account Daughter Switcher Chips */}
      {accounts && accounts.length > 1 && (
        <View style={s.daughterSelectorContainer}>
          <View style={s.daughterSelectorHeader}>
            <MaterialIcon name="account-multiple" size={16} color="#D81B60" />
            <Text style={s.daughterSelectorTitle}>बेटी का चयन करें ({accounts.length} खाते):</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.daughterChipsScroll}
          >
            {accounts.map(acc => {
              const accId = acc.fundAccountId || acc._id;
              const isCurrent = accId === (selectedAccountId || profile?.fundAccountId || profile?._id);
              const name = acc.balikaName || 'बालिका';
              const accStatus = (acc.approvalStatus || acc.status || (acc.isSubmitted ? 'pending' : 'draft')).toLowerCase();
              const isAccApproved = accStatus === 'approved';
              const isAccPending = accStatus === 'pending' || Boolean(acc.isSubmitted);
              const walletBal = isAccApproved && acc.fundWallet?.balance !== undefined ? Number(acc.fundWallet.balance) : null;
              return (
                <TouchableOpacity
                  key={accId}
                  style={[s.daughterChip, isCurrent && s.daughterChipActive]}
                  activeOpacity={0.7}
                  onPress={() => handleSelectDaughter(acc)}
                >
                  <MaterialIcon
                    name={isCurrent ? 'check-circle' : isAccApproved ? 'account-child-circle' : isAccPending ? 'clock-outline' : 'file-document-edit-outline'}
                    size={16}
                    color={isCurrent ? '#FFFFFF' : isAccApproved ? '#D81B60' : isAccPending ? '#D97706' : '#64748B'}
                  />
                  <Text
                    style={[s.daughterChipText, isCurrent && s.daughterChipTextActive]}
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                  {isAccApproved && walletBal !== null ? (
                    <Text
                      style={[s.daughterChipBal, isCurrent && s.daughterChipBalActive]}
                    >
                      ₹{walletBal.toLocaleString('en-IN')}
                    </Text>
                  ) : !isAccApproved ? (
                    <View style={[s.chipBadgePill, isCurrent ? s.chipBadgePillCurrent : isAccPending ? s.chipBadgePillPending : s.chipBadgePillDraft]}>
                      <Text style={[s.chipBadgeText, isCurrent && { color: '#D81B60' }]}>
                        {isAccPending ? 'लंबित' : 'ड्राफ्ट'}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Balance Card */}
      <View style={[s.balanceCard, !isApproved && s.balanceCardPending]}>
        {/* Active Child Name Bar */}
        <View style={s.activeChildBanner}>
          <MaterialIcon
            name={isApproved ? "account-child-circle" : "account-clock-outline"}
            size={18}
            color={isApproved ? "#FDA4AF" : "#FDE68A"}
          />
          <Text style={s.activeChildName} numberOfLines={1}>
            {activeBalikaName}
          </Text>
          {Boolean(activeVivahSahayogId) && (
            <Text style={s.activeChildId}>• ID: {activeVivahSahayogId}</Text>
          )}
        </View>

        <View style={s.balanceTopRow}>
          <View style={[s.balanceIconCircle, !isApproved && { backgroundColor: isDraft ? '#475569' : '#D97706' }]}>
            <MaterialIcon
              name={isApproved ? "wallet" : isDraft ? "file-document-edit" : "clock-outline"}
              size={26}
              color="#FFFFFF"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={s.balanceLabel}>
              {isApproved ? 'कुल उपलब्ध शेष (Available Balance)' : 'फंड वॉलेट (स्वीकृति के बाद सक्रिय)'}
            </Text>
            <Text style={[s.balanceAmount, !isApproved && { color: '#E2E8F0' }]}>
              ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={[
            s.balanceBadge,
            isApproved
              ? s.balanceBadgeActive
              : isPending
              ? s.balanceBadgePending
              : s.balanceBadgeDraft
          ]}>
            <MaterialIcon
              name={isApproved ? "shield-check" : isPending ? "clock-outline" : "alert-circle-outline"}
              size={13}
              color={isApproved ? "#4ade80" : isPending ? "#FDE68A" : "#CBD5E1"}
            />
            <Text style={[
              s.balanceBadgeText,
              { color: isApproved ? "#4ade80" : isPending ? "#FDE68A" : "#CBD5E1" }
            ]}>
              {isApproved ? 'सक्रिय' : isPending ? 'समीक्षाधीन' : 'ड्राफ्ट'}
            </Text>
          </View>
        </View>

        {isApproved && initialBalance !== null ? (
          <View style={s.initialBalanceRow}>
            <Text style={s.initialBalanceLabel}>Account Opening Fund Credit (प्रारंभिक अनुदान):</Text>
            <Text style={s.initialBalanceValue}>
              ₹{initialBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        ) : !isApproved ? (
          <View style={s.pendingAccountCardNote}>
            <MaterialIcon name="information-outline" size={14} color="#FDE68A" />
            <Text style={s.pendingAccountCardNoteText}>
              {isDraft
                ? 'अधूरा आवेदन पूर्ण होने के बाद प्रारंभिक अनुदान व वॉलेट सक्रिय होगा।'
                : 'खाता स्वीकृति के उपरांत प्रारंभिक ₹500.00 अनुदान एवं फंड वॉलेट सक्रिय होगा।'}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Withdrawal Eligibility Banner */}
      <View style={s.withdrawalCard}>
        <View style={s.withdrawalCardTop}>
          <MaterialIcon
            name={!isApproved ? 'lock-clock' : withdrawalInfo.isEligible ? 'check-decagram' : 'lock-clock'}
            size={22}
            color={!isApproved ? '#94A3B8' : withdrawalInfo.isEligible ? '#059669' : '#D97706'}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.withdrawalTitle}>फंड निकासी पात्रता</Text>
            <Text style={s.withdrawalSub}>
              {!isApproved
                ? 'खाता स्वीकृत होने के बाद फंड निकासी पात्रता लागू होगी।'
                : withdrawalInfo.isEligible
                ? 'राशि निकालने के लिए पात्र (आयु 20 वर्ष से अधिक)'
                : `निकासी हेतु शेष समय: ${withdrawalInfo.detailedText || withdrawalInfo.yearsLeftDisplay}`}
            </Text>
          </View>
          <View style={[
            s.withdrawalBadge,
            { backgroundColor: !isApproved ? '#F1F5F9' : withdrawalInfo.isEligible ? '#DCFCE7' : '#FEF3C7' }
          ]}>
            <Text style={[
              s.withdrawalBadgeText,
              { color: !isApproved ? '#64748B' : withdrawalInfo.isEligible ? '#059669' : '#D97706' }
            ]}>
              {!isApproved ? 'सत्यापन उपरांत' : withdrawalInfo.isEligible ? 'निकासी उपलब्ध' : withdrawalInfo.yearsLeftDisplay}
            </Text>
          </View>
        </View>
        <Text style={s.withdrawalRule}>
          • {withdrawalInfo.ruleText}
        </Text>
      </View>

      {/* Section title */}
      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>लेन-देन विवरण (Passbook Statements)</Text>
        <Text style={s.sectionCount}>
          {isApproved ? (statementsTotal || statements.length) : 0} कुल
        </Text>
      </View>
    </>
  );

  const ListEmpty = () => {
    if (statementsLoading) {
      return (
        <View style={s.loadingBox}>
          <ActivityIndicator color={COLORS.primary || '#D81B60'} size="small" />
          <Text style={s.loadingText}>विवरण लोड हो रहा है...</Text>
        </View>
      );
    }
    if (!isApproved) {
      return (
        <View style={s.pendingNoticeBox}>
          <View style={[s.pendingNoticeIconRing, isDraft && { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
            <MaterialIcon
              name={isDraft ? "file-document-edit-outline" : "clock-alert-outline"}
              size={36}
              color={isDraft ? "#64748B" : "#D97706"}
            />
          </View>
          <Text style={s.pendingNoticeTitle}>
            {isDraft ? "आवेदन अधूरा (Draft) है" : "खाता सत्यापन प्रक्रियाधीन (Under Review)"}
          </Text>
          <Text style={s.pendingNoticeDesc}>
            {isDraft
              ? "इस बेटी का पंजीकरण अभी पूरा नहीं हुआ है। पंजीकरण पूरा करने व सत्यापन के बाद फंड वॉलेट और पासबुक सक्रिय होगी।"
              : "इस खाते के दस्तावेज़ों एवं विवरण का सत्यापन किया जा रहा है। स्वीकृति (Approval) मिलते ही इस खाते का फंड वॉलेट और पासबुक सक्रिय हो जाएगा।"}
          </Text>
          <TouchableOpacity
            style={s.pendingActionBtn}
            onPress={() => {
              if (isDraft) {
                navigation.navigate('VivahSahayogEntry');
              } else {
                navigation.navigate('FundAccountProfile', { fundAccountId: selectedAccountId });
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={s.pendingActionBtnText}>
              {isDraft ? "पंजीकरण पूरा करें" : "आवेदन विवरण देखें"}
            </Text>
            <FeatherIcon name="chevron-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={s.emptyState}>
        <MaterialIcon name="format-list-bulleted" size={48} color="#CBD5E1" />
        <Text style={s.emptyTitle}>कोई लेन-देन नहीं</Text>
        <Text style={s.emptyDesc}>इस फंड खाते में अभी तक कोई लेन-देन नहीं हुआ है।</Text>
      </View>
    );
  };

  const ListFooter = () => {
    if (!statementsLoading || page === 1) return <View style={{ height: 40 }} />;
    return <ActivityIndicator color={COLORS.primary || '#D81B60'} style={{ margin: 16 }} />;
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>फंड वॉलेट विवरण</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={isApproved ? statements : []}
        keyExtractor={(item, idx) => item._id || item.txnId || String(idx)}
        renderItem={({ item }) => <TxnRow item={item} />}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={<ListEmpty />}
        ListFooterComponent={<ListFooter />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary || '#D81B60']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={(!isApproved || statements.length === 0) ? { flexGrow: 1 } : undefined}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#FFFFFF',
  },
  backBtn: { padding: 2 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#D81B60' },

  daughterSelectorContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  daughterSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  daughterSelectorTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  daughterChipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  daughterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFF0F5',
    borderWidth: 1.5,
    borderColor: '#FCE7F3',
  },
  daughterChipActive: {
    backgroundColor: '#D81B60',
    borderColor: '#D81B60',
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  daughterChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#D81B60',
  },
  daughterChipTextActive: {
    color: '#FFFFFF',
  },
  daughterChipBal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#BE185D',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  daughterChipBalActive: {
    color: '#D81B60',
    backgroundColor: '#FFFFFF',
  },
  chipBadgePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  chipBadgePillPending: {
    backgroundColor: '#FEF3C7',
  },
  chipBadgePillDraft: {
    backgroundColor: '#F1F5F9',
  },
  chipBadgePillCurrent: {
    backgroundColor: '#FFFFFF',
  },
  chipBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },

  balanceCard: {
    margin: 16,
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#0F172A',
    elevation: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  balanceCardPending: {
    backgroundColor: '#1E293B',
  },
  activeChildBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
    gap: 6,
  },
  activeChildName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FDA4AF',
  },
  activeChildId: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  balanceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D81B60',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  balanceBadgeText: {
    fontSize: 11,
    color: '#4ade80',
    fontWeight: '700',
  },
  balanceBadgeActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  balanceBadgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  balanceBadgeDraft: {
    backgroundColor: 'rgba(148, 163, 184, 0.18)',
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  pendingAccountCardNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  pendingAccountCardNoteText: {
    fontSize: 11.5,
    color: '#FDE68A',
    flex: 1,
    lineHeight: 16,
  },
  initialBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  initialBalanceLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  initialBalanceValue: {
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '700',
  },

  withdrawalCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  withdrawalCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  withdrawalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  withdrawalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  withdrawalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  withdrawalBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  withdrawalRule: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    lineHeight: 15,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  sectionCount: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },

  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loadingText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 14,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  pendingNoticeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  pendingNoticeIconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  pendingNoticeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  pendingNoticeDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
  },
  pendingActionBtn: {
    backgroundColor: '#D81B60',
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 2,
  },
  pendingActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
