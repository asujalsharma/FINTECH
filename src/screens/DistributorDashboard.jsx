import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getData } from '../API/index';
import COLORS from '../constants/colors';

export default function DistributorDashboard() {
  const navigation = useNavigation();
  const user = useSelector(state => state.user);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    today: 0,
    thisMonth: 0,
    allTime: 0,
  });
  const [recentEarnings, setRecentEarnings] = useState([]);

  const fetchData = async () => {
    try {
      // Fetch earnings summary
      const summaryRes = await getData('/api/distributor/earnings-summary');
      console.log('Earnings summary response:', summaryRes);
      if (summaryRes?.Data) {
        // Map backend field names to frontend expectations
        setSummary({
          today: summaryRes.Data.todayEarnings || 0,
          thisMonth: summaryRes.Data.monthEarnings || 0,
          allTime: summaryRes.Data.totalEarnings || 0,
        });
      }

      // Fetch recent earnings
      const earningsRes = await getData('/api/distributor/my-earnings?page=1&limit=10');
      console.log('Earnings list response:', earningsRes);
      if (earningsRes?.Data?.earnings && Array.isArray(earningsRes.Data.earnings)) {
        setRecentEarnings(earningsRes.Data.earnings);
      } else if (earningsRes?.Data && Array.isArray(earningsRes.Data)) {
        setRecentEarnings(earningsRes.Data);
      }
    } catch (error) {
      console.error('Error fetching distributor data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEarning = ({ item }) => (
    <View style={styles.earningCard}>
      <View style={styles.earningLeft}>
        <Text style={styles.earningService}>
          {item.serviceType?.toUpperCase()} - {item.serviceName}
        </Text>
        <Text style={styles.earningRetailer}>
          Retailer: {item.retailerId?.firstName || 'N/A'}
        </Text>
        <Text style={styles.earningDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <View style={styles.earningRight}>
        <Text style={styles.earningAmount}>₹{item.commissionAmount?.toFixed(2)}</Text>
        <Text style={styles.earningTxn}>Txn: ₹{item.transactionAmount}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.purple} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Distributor Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: '#10b981' }]}>
            <Icon name="cash" size={28} color="#fff" />
            <Text style={styles.summaryLabel}>Today</Text>
            <Text style={styles.summaryAmount}>₹{summary.today?.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#3b82f6' }]}>
            <Icon name="calendar-month" size={28} color="#fff" />
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summaryAmount}>₹{summary.thisMonth?.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#8b5cf6' }]}>
            <Icon name="chart-line" size={28} color="#fff" />
            <Text style={styles.summaryLabel}>All Time</Text>
            <Text style={styles.summaryAmount}>₹{summary.allTime?.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MyRetailers')}
          >
            <Icon name="account-group" size={28} color={COLORS.purple} />
            <Text style={styles.actionText}>My Retailers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateRetailer')}
          >
            <Icon name="account-plus" size={28} color={COLORS.purple} />
            <Text style={styles.actionText}>Add Retailer</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Earnings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Earnings</Text>
          {recentEarnings.length === 0 ? (
            <Text style={styles.emptyText}>No earnings yet</Text>
          ) : (
            <FlatList
              data={recentEarnings}
              keyExtractor={(item) => item._id}
              renderItem={renderEarning}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
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
    backgroundColor: COLORS.purple,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  summaryAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    padding: 20,
  },
  earningCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 1,
  },
  earningLeft: {
    flex: 1,
  },
  earningService: {
    fontWeight: '600',
    color: '#333',
  },
  earningRetailer: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  earningDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  earningRight: {
    alignItems: 'flex-end',
  },
  earningAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  earningTxn: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
});
