import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { getData } from '../API/index';
import COLORS from '../constants/colors';

export default function MyRetailers() {
  const navigation = useNavigation();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retailers, setRetailers] = useState([]);

  const fetchRetailers = async () => {
    try {
      const res = await getData('/api/distributor/my-retailers');
      console.log('Retailers API response:', res);
      // Backend returns { Data: { retailers: [], pagination: {} } }
      if (res?.Data?.retailers && Array.isArray(res.Data.retailers)) {
        setRetailers(res.Data.retailers);
      } else if (res?.Data && Array.isArray(res.Data)) {
        // Fallback in case structure changes
        setRetailers(res.Data);
      } else {
        setRetailers([]);
      }
    } catch (error) {
      console.error('Error fetching retailers:', error);
      setRetailers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRetailers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRetailers();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderRetailer = ({ item }) => (
    <View style={styles.retailerCard}>
      <View style={styles.avatarContainer}>
        <Icon name="account" size={32} color={COLORS.purple} />
      </View>
      <View style={styles.retailerInfo}>
        <Text style={styles.retailerName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.retailerPhone}>{item.phone}</Text>
        <Text style={styles.retailerDate}>Joined: {formatDate(item.createdAt)}</Text>
      </View>
      <View style={styles.retailerRight}>
        <View style={[styles.statusBadge, { backgroundColor: item.status ? '#10b981' : '#ef4444' }]}>
          <Text style={styles.statusText}>{item.status ? 'Active' : 'Inactive'}</Text>
        </View>
        <Text style={styles.walletBalance}>₹{item.wallet?.balance?.toFixed(2) || '0.00'}</Text>
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
        <Text style={styles.headerTitle}>My Retailers</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateRetailer')}>
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Array.isArray(retailers) ? retailers.length : 0}</Text>
          <Text style={styles.statLabel}>Total Retailers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Array.isArray(retailers) ? retailers.filter(r => r.status).length : 0}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Array.isArray(retailers) ? retailers.filter(r => !r.status).length : 0}</Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
      </View>

      {/* Retailers List */}
      {retailers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="account-group-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No retailers yet</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateRetailer')}
          >
            <Text style={styles.addButtonText}>Add Your First Retailer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={retailers}
          keyExtractor={(item) => item._id}
          renderItem={renderRetailer}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B2F9B',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
  },
  retailerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0e6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  retailerInfo: {
    flex: 1,
  },
  retailerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  retailerPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  retailerDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  retailerRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  walletBalance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 12,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
