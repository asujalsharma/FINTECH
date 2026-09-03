import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Footer from '../components/Footer';
import COLORS from '../constants/colors';

export default function RechargeHistory({ route, navigation }) {
  const { history } = route.params || { history: [] };

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Filtered & searched history
  const filteredHistory = useMemo(() => {
    let data = history || [];
    if (filter !== 'All') {
      data = data.filter(h => h.status === filter);
    }
    if (search.trim()) {
      data = data.filter(h =>
        h.mobile?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return data;
  }, [filter, search, history]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.mobile}>{item.mobile}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === 'Success' ? styles.successBadge : styles.failedBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === 'Success' ? styles.successText : styles.failedText,
            ]}
          >
            {item.status === 'Success' ? '✓ Success' : '✕ Failed'}
          </Text>
        </View>
      </View>

      <Text style={styles.details}>
        {item.operator} • {item.circle}
      </Text>

      <View style={styles.row}>
        <Text style={styles.amount}>₹ {item.amount}</Text>
        <Text style={styles.date}>{item.date || 'Recent'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg || '#0A2568'} />

      {/* Header */}
      <View style={styles.header}>
        {navigation?.canGoBack?.() ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
        ) : null}

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Recharge History</Text>
          <Text style={styles.headerSubtitle}>Real-time transaction logs</Text>
        </View>

        <Icon name="history" size={24} color="#D9E7FF" />
      </View>

      <View style={styles.content}>
        {/* Search Box */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search by mobile number..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {['All', 'Success', 'Failed'].map(tab => (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.8}
              style={[styles.filterBtn, filter === tab && styles.filterActive]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === tab && styles.filterTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyBox}>
            <Icon name="file-document-outline" size={54} color="#CBD5E1" />
            <Text style={styles.emptyText}>No recharge records found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredHistory}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 0 }}
            showsVerticalScrollIndicator={false}
            ListFooterComponentStyle={{ marginTop: 'auto', marginHorizontal: -16, paddingTop: 24 }}
            ListFooterComponent={<Footer />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: COLORS.headerBg || '#0A2568',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: COLORS.headerBg || '#0A2568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerSubtitle: { fontSize: 11.5, color: '#D9E7FF', fontWeight: '500', marginTop: 2 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#091838',
    fontWeight: '600',
  },

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 14,
    gap: 8,
  },
  filterBtn: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
  },
  filterActive: {
    backgroundColor: COLORS.primary || '#0D52ED',
    borderColor: COLORS.primary || '#0D52ED',
  },
  filterText: { fontWeight: '700', color: '#64748B', fontSize: 12.5 },
  filterTextActive: { color: '#FFF' },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  mobile: { fontSize: 16, fontWeight: '800', color: '#091838' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  successBadge: {
    backgroundColor: '#ECFDF5',
  },
  failedBadge: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  successText: {
    color: '#059669',
  },
  failedText: {
    color: '#DC2626',
  },
  details: { fontSize: 12.5, color: '#64748B', marginVertical: 6, fontWeight: '500' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
    marginTop: 4,
  },
  amount: { fontSize: 16, fontWeight: '800', color: '#091838' },
  date: { fontSize: 11.5, color: '#94A3B8', fontWeight: '500' },

  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, color: '#64748B', marginTop: 10, fontWeight: '600' },
});
