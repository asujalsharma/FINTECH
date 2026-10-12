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
  } = useFundAccount();

  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Active account information
  const activeBalikaName =
    selectedAccount?.balikaName ||
    profile?.balikaName ||
    route.params?.balikaName ||
    'बालिका';

  const activeVivahSahayogId =
    selectedAccount?.vivahSahayogId ||
    profile?.vivahSahayogId ||
    '';

  const rawBalance =
    fundWallet?.balance ??
    selectedAccount?.fundWallet?.balance ??
    profile?.fundWallet?.balance ??
    profile?.wallet?.balance ??
    0;
  const balance = typeof rawBalance === 'number' ? rawBalance : parseFloat(rawBalance) || 0;

  const rawInitialBalance =
    fundWallet?.initialBalance ??
    profile?.fundWallet?.initialBalance ??
    null;
  const initialBalance = rawInitialBalance !== null ? Number(rawInitialBalance) : null;

  const withdrawalInfo = calculateWithdrawalEligibility(
    profile?.dob || selectedAccount?.dob,
    profile?.currentAge || selectedAccount?.currentAge
  );

  const load = useCallback(async (pg = 1, append = false, targetId) => {
    const accId = targetId || selectedAccountId || route.params?.fundAccountId;
    await fetchStatements(pg, LIMIT, append, accId);
  }, [fetchStatements, selectedAccountId, route.params?.fundAccountId]);

  useEffect(() => {
    const init = async () => {
      const targetParamId = route.params?.fundAccountId;
      await fetchMyAccounts(targetParamId);
      const accId = targetParamId || selectedAccountId;
      await fetchProfile(accId);
      load(1, false, accId);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.fundAccountId]);

  const handleSelectDaughter = async (acc) => {
    const accId = acc.fundAccountId || acc._id;
    if (accId === selectedAccountId) return;
    setPage(1);
    await selectAccount(acc);
    await fetchProfile(accId);
    load(1, false, accId);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchMyAccounts(selectedAccountId);
    await Promise.all([fetchProfile(selectedAccountId), load(1, false, selectedAccountId)]);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (statementsLoading) return;
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
              const walletBal = acc.fundWallet?.balance !== undefined ? Number(acc.fundWallet.balance) : null;
              return (
                <TouchableOpacity
                  key={accId}
                  style={[s.daughterChip, isCurrent && s.daughterChipActive]}
                  activeOpacity={0.7}
                  onPress={() => handleSelectDaughter(acc)}
                >
                  <MaterialIcon
                    name={isCurrent ? 'check-circle' : 'account-child-circle'}
                    size={16}
                    color={isCurrent ? '#FFFFFF' : '#D81B60'}
                  />
                  <Text
                    style={[s.daughterChipText, isCurrent && s.daughterChipTextActive]}
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                  {walletBal !== null && (
                    <Text
                      style={[s.daughterChipBal, isCurrent && s.daughterChipBalActive]}
                    >
                      ₹{walletBal.toLocaleString('en-IN')}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Balance Card */}
      <View style={s.balanceCard}>
        {/* Active Child Name Bar */}
        <View style={s.activeChildBanner}>
          <MaterialIcon name="account-child-circle" size={18} color="#FDA4AF" />
          <Text style={s.activeChildName} numberOfLines={1}>
            {activeBalikaName}
          </Text>
          {Boolean(activeVivahSahayogId) && (
            <Text style={s.activeChildId}>• ID: {activeVivahSahayogId}</Text>
          )}
        </View>

        <View style={s.balanceTopRow}>
          <View style={s.balanceIconCircle}>
            <MaterialIcon name="wallet" size={26} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={s.balanceLabel}>कुल उपलब्ध शेष (Available Balance)</Text>
            <Text style={s.balanceAmount}>
              ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={s.balanceBadge}>
            <MaterialIcon name="shield-check" size={14} color="#4ade80" />
            <Text style={s.balanceBadgeText}>सक्रिय</Text>
          </View>
        </View>

        {initialBalance !== null ? (
          <View style={s.initialBalanceRow}>
            <Text style={s.initialBalanceLabel}>Account Opening Fund Credit (प्रारंभिक अनुदान):</Text>
            <Text style={s.initialBalanceValue}>
              ₹{initialBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Withdrawal Eligibility Banner */}
      <View style={s.withdrawalCard}>
        <View style={s.withdrawalCardTop}>
          <MaterialIcon
            name={withdrawalInfo.isEligible ? 'check-decagram' : 'lock-clock'}
            size={22}
            color={withdrawalInfo.isEligible ? '#059669' : '#D97706'}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.withdrawalTitle}>फंड निकासी पात्रता</Text>
            <Text style={s.withdrawalSub}>
              {withdrawalInfo.isEligible
                ? 'राशि निकालने के लिए पात्र (आयु 20 वर्ष से अधिक)'
                : `निकासी हेतु शेष समय: ${withdrawalInfo.detailedText || withdrawalInfo.yearsLeftDisplay}`}
            </Text>
          </View>
          <View style={[s.withdrawalBadge, { backgroundColor: withdrawalInfo.isEligible ? '#DCFCE7' : '#FEF3C7' }]}>
            <Text style={[s.withdrawalBadgeText, { color: withdrawalInfo.isEligible ? '#059669' : '#D97706' }]}>
              {withdrawalInfo.isEligible ? 'निकासी उपलब्ध' : withdrawalInfo.yearsLeftDisplay}
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
        <Text style={s.sectionCount}>{statementsTotal || statements.length} कुल</Text>
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
        data={statements}
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
        contentContainerStyle={statements.length === 0 ? { flex: 1 } : undefined}
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
});
