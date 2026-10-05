import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  FlatList, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../constants/colors';
import useFundAccount from '../hooks/useFundAccount';

const LIMIT = 10;

const TxnRow = ({ item }) => {
  const type = (item.txnType || item.type || 'credit').toLowerCase();
  const isCredit = type === 'credit';
  const rawAmount = item.txnAmount !== undefined ? item.txnAmount : (item.amount || 0);
  const amountNum = typeof rawAmount === 'number' ? rawAmount : parseFloat(rawAmount) || 0;

  const balanceAfter = item.balanceAfter !== undefined && item.balanceAfter !== null
    ? Number(item.balanceAfter)
    : null;

  const txnDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('hi-IN', {
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
          {item.txnName || item.remarks || (isCredit ? 'फंड क्रेडिट' : 'फंड डेबिट')}
        </Text>
        {item.txnDesc ? (
          <Text style={tr.txnDesc} numberOfLines={2}>
            {item.txnDesc}
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
          <Text style={[tr.txnType, { color: isCredit ? '#059669' : '#DC2626' }]}>
            {isCredit ? 'क्रेडिट' : 'डेबिट'}
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
  const {
    profile,
    statements,
    statementsTotal,
    statementsLoading,
    fundWallet,
    fetchStatements,
    fetchProfile,
  } = useFundAccount();

  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const rawBalance =
    fundWallet?.balance ??
    profile?.fundWallet?.balance ??
    profile?.wallet?.balance ??
    0;
  const balance = typeof rawBalance === 'number' ? rawBalance : parseFloat(rawBalance) || 0;

  const rawInitialBalance =
    fundWallet?.initialBalance ??
    profile?.fundWallet?.initialBalance ??
    null;
  const initialBalance = rawInitialBalance !== null ? Number(rawInitialBalance) : null;

  const load = useCallback(async (pg = 1, append = false) => {
    await fetchStatements(pg, LIMIT, append);
  }, [fetchStatements]);

  useEffect(() => {
    fetchProfile();
    load(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await Promise.all([fetchProfile(), load(1, false)]);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (statementsLoading) return;
    if (statements.length >= statementsTotal) return;
    const nextPage = page + 1;
    setPage(nextPage);
    load(nextPage, true);
  };

  const ListHeader = () => (
    <>
      {/* Balance Card */}
      <View style={s.balanceCard}>
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
            <Text style={s.initialBalanceLabel}>प्रारंभिक स्वीकृत अनुदान:</Text>
            <Text style={s.initialBalanceValue}>
              ₹{initialBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        ) : null}
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
