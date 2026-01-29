import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { getData } from '../API/index';
import COLORS from '../constants/colors';

export default function MyCommissions() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const fetchEarnings = async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      
      const res = await getData(`/api/distributor/my-earnings?page=${pageNum}&limit=20`);
      console.log(`Earnings page ${pageNum}:`, res);

      if (res?.Data) {
        let newEarnings = [];
        if (Array.isArray(res.Data.earnings)) {
          newEarnings = res.Data.earnings;
          if(pageNum === 1) setTotalEarnings(res.Data.totalEarnings || 0);
        } else if (Array.isArray(res.Data)) {
          newEarnings = res.Data;
        }

        if (shouldRefresh || pageNum === 1) {
          setEarnings(newEarnings);
        } else {
          setEarnings(prev => [...prev, ...newEarnings]);
        }

        if (newEarnings.length < 20) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchEarnings(1);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchEarnings(1, true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchEarnings(nextPage);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.serviceIcon}>
          <Icon name="cash-multiple" size={20} color="#1B2F9B" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.serviceName}>
            {item.serviceType?.toUpperCase()} - {item.serviceName}
          </Text>
          <Text style={styles.retailerName}>
            Retailer: {item.retailerId?.firstName || 'Unknown'} {item.retailerId?.lastName || ''}
          </Text>
        </View>
        <Text style={styles.amount}>+₹{item.commissionAmount?.toFixed(2)}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.cardFooter}>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        <Text style={styles.txnAmount}>Txn Amount: ₹{item.transactionAmount}</Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#1B2F9B" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Commissions</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryLabel}>Total Earnings</Text>
        <Text style={styles.summaryValue}>₹{totalEarnings?.toFixed(2)}</Text>
      </View>

      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#1B2F9B" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={earnings}
          renderItem={renderItem}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B2F9B']} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="cash-remove" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No commissions found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1B2F9B',
    padding: 16,
    elevation: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B2F9B',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  retailerName: {
    fontSize: 12,
    color: '#666',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  txnAmount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
});
