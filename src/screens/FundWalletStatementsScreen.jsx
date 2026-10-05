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
  const isCredit = item.type === 'credit';
  return (
    <View style={tr.row}>
      <View style={[tr.iconCircle, { backgroundColor: isCredit ? '#ECFDF5' : '#FEF2F2' }]}>
        <MaterialIcon
          name={isCredit ? 'arrow-up-circle' : 'arrow-down-circle'}
          size={26}
          color={isCredit ? '#059669' : '#DC2626'}
        />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={tr.txnName} numberOfLines={1}>{item.txnName || item.remarks || 'लेन-देन'}</Text>
        <Text style={tr.txnDesc} numberOfLines={1}>{item.txnDesc || item.description || ''}</Text>
        <Text style={tr.txnDate}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[tr.amount, { color: isCredit ? '#059669' : '#DC2626' }]}>
          {isCredit ? '+' : '-'}₹{(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={tr.txnType}>{isCredit ? 'क्रेडिट' : 'डेबिट'}</Text>
      </View>
    </View>
  );
};

const tr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', backgroundColor: '#FFFFFF' },
  iconCircle: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  txnName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  txnDesc: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  txnDate: { fontSize: 11, color: '#CBD5E1', marginTop: 2, fontWeight: '500' },
  amount: { fontSize: 15, fontWeight: '800' },
  txnType: { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 2 },
});

export default function FundWalletStatementsScreen() {
  const navigation = useNavigation();
  const { profile, statements, statementsTotal, statementsLoading, fetchStatements, fetchProfile } = useFundAccount();
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const balance = profile?.fundWallet?.balance || profile?.wallet?.balance || 0;

  const load = useCallback(async (pg = 1, append = false) => {
    await fetchStatements(pg, LIMIT, append);
  }, [fetchStatements]);

  useEffect(() => {
    fetchProfile();
    load(1, false);
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
        <View style={s.balanceIconCircle}>
          <MaterialIcon name="wallet" size={28} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={s.balanceLabel}>कुल शेष</Text>
          <Text style={s.balanceAmount}>
            ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={s.balanceBadge}>
          <MaterialIcon name="shield-check" size={14} color="#4ade80" />
          <Text style={s.balanceBadgeText}>सुरक्षित</Text>
        </View>
      </View>

      {/* Section title */}
      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>लेन-देन विवरण</Text>
        <Text style={s.sectionCount}>{statementsTotal} कुल</Text>
      </View>
    </>
  );

  const ListEmpty = () => {
    if (statementsLoading) return <ActivityIndicator color={COLORS.primary} style={{ marginTop: 30 }} />;
    return (
      <View style={s.emptyState}>
        <MaterialIcon name="format-list-bulleted" size={48} color="#E2E8F0" />
        <Text style={s.emptyTitle}>कोई लेन-देन नहीं</Text>
        <Text style={s.emptyDesc}>अभी तक कोई लेन-देन नहीं हुआ है।</Text>
      </View>
    );
  };

  const ListFooter = () => {
    if (!statementsLoading || page === 1) return <View style={{ height: 40 }} />;
    return <ActivityIndicator color={COLORS.primary} style={{ margin: 16 }} />;
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
        keyExtractor={(item, idx) => item._id || String(idx)}
        renderItem={({ item }) => <TxnRow item={item} />}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={<ListEmpty />}
        ListFooterComponent={<ListFooter />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
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
    flexDirection: 'row', alignItems: 'center',
    margin: 16, borderRadius: 18, padding: 18,
    backgroundColor: '#1E293B',
    elevation: 6, shadowColor: '#1E293B', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.25, shadowRadius: 12,
  },
  balanceIconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#D81B60', alignItems: 'center', justifyContent: 'center' },
  balanceLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginBottom: 4 },
  balanceAmount: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  balanceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(74,222,128,0.1)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  balanceBadgeText: { fontSize: 11, color: '#4ade80', fontWeight: '700' },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  sectionCount: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#CBD5E1', marginTop: 14 },
  emptyDesc: { fontSize: 13, color: '#E2E8F0', marginTop: 6 },
});
