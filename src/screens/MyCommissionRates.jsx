import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { getData } from '../API/index';
import COLORS from '../constants/colors';

const { width } = Dimensions.get('window');

export default function MyCommissionRates() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState({});
  const [activeTab, setActiveTab] = useState('mobile');

  const tabs = [
    { key: 'mobile', label: 'Mobile', icon: 'cellphone' },
    { key: 'dth', label: 'DTH', icon: 'satellite-uplink' },
    { key: 'bbps', label: 'BBPS', icon: 'lightbulb-on' },
  ];

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await getData('/api/distributor/commission-rates');
      console.log('Commission rates:', res);
      if (res?.Data) {
        setRates(res.Data);
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRateItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.initial}>
            {item.serviceName?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.operatorName}>{item.serviceName}</Text>
      </View>
      <View style={styles.rateContainer}>
        <Text style={styles.rateValue}>{item.commission}</Text>
        <Text style={styles.rateSymbol}>{item.symbol || '%'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commission Rates</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.key ? '#fff' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#1B2F9B" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={rates[activeTab] || []}
          renderItem={renderRateItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="file-document-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No rates configured for {activeTab}</Text>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#1B2F9B',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  initial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B2F9B',
  },
  operatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rateValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16a34a',
  },
  rateSymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
    marginLeft: 2,
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
