import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import { getData } from '../API';

const BLUE = '#092B88';

const MyRetailers = () => {
  const navigation = useNavigation();
  const reduxUser = useSelector(state => state.user);

  // Derive logged in user and role
  const currentUser =
    reduxUser?.Data || reduxUser?.user || reduxUser || {};

  const userRole = (
    currentUser?.role ||
    currentUser?.userType ||
    currentUser?.userRole ||
    currentUser?.type ||
    ''
  ).toLowerCase();

  const isDistributor =
    userRole === 'distributor' || currentUser?.isDistributor === true;

  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  // Permission Guard
  useEffect(() => {
    if (!isDistributor) {
      setLoading(false);
      Alert.alert(
        'Access Restricted',
        'The "My Retailers" portal is exclusively available to verified Distributors.',
        [
          {
            text: 'Go to Home',
            onPress: () => navigation.navigate('Home'),
          },
        ],
      );
    }
  }, [isDistributor, navigation]);

  // Fetch downline retailers
  const fetchRetailers = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      let res;
      try {
        res = await getData('/api/user/my-retailers');
      } catch (err) {
        if (err?.response?.status === 404) {
          // Fallback to alternative endpoint
          res = await getData('/api/user/distributor/retailers');
        } else {
          throw err;
        }
      }

      console.log('Fetch Retailers Response:', res);

      if (res?.Status === true || res?.success === true || res?.ResponseStatus === 1) {
        const list = Array.isArray(res?.Data)
          ? res.Data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setRetailers(list);
      } else {
        setRetailers([]);
      }
    } catch (error) {
      console.log('Error fetching downline retailers:', error?.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2:
          error?.response?.data?.Remarks ||
          error?.response?.data?.message ||
          'Failed to load retailers list.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refetch when screen gains focus (only if distributor)
  useFocusEffect(
    useCallback(() => {
      if (isDistributor) {
        fetchRetailers();
      }
    }, [isDistributor, fetchRetailers]),
  );

  // Filtered and Searched list
  const filteredRetailers = useMemo(() => {
    return retailers.filter(item => {
      // Status filter
      if (selectedFilter === 'active' && item.status !== true) return false;
      if (selectedFilter === 'inactive' && item.status === true) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;

      const q = searchQuery.trim().toLowerCase();
      const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
      const phone = (item.phone || '').toString().toLowerCase();
      const email = (item.email || '').toLowerCase();
      const refId = (item.referalId || '').toLowerCase();

      return (
        fullName.includes(q) ||
        phone.includes(q) ||
        email.includes(q) ||
        refId.includes(q)
      );
    });
  }, [retailers, searchQuery, selectedFilter]);

  // Network Metrics
  const metrics = useMemo(() => {
    const total = retailers.length;
    const active = retailers.filter(r => r.status === true).length;
    const totalBalance = retailers.reduce((sum, r) => {
      const bal = Number(r.wallet?.balance || r.walletBalance || 0);
      return sum + (isNaN(bal) ? 0 : bal);
    }, 0);

    return { total, active, totalBalance };
  }, [retailers]);

  const handleCall = phone => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = phone => {
    if (!phone) return;
    const clean = phone.replace(/[^0-9]/g, '');
    const fullNum = clean.length === 10 ? `91${clean}` : clean;
    Linking.openURL(`whatsapp://send?phone=${fullNum}`);
  };

  const handleEmail = email => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`);
  };

  const renderRetailerCard = ({ item }) => {
    const name = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Retailer';
    const initials = (
      (item.firstName?.[0] || '') + (item.lastName?.[0] || '')
    ).toUpperCase() || 'R';
    const balance = Number(item.wallet?.balance || item.walletBalance || 0);
    const dateFormatted = item.createdAt
      ? moment(item.createdAt).format('DD MMM YYYY')
      : 'N/A';

    return (
      <View style={styles.card}>
        {/* Top Card Info Row */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarInitials}>{initials}</Text>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.status !== false ? '#10B981' : '#94A3B8' },
              ]}
            />
          </View>

          <View style={styles.cardHeaderDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.retailerName} numberOfLines={1}>
                {name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  item.status !== false
                    ? styles.statusBadgeActive
                    : styles.statusBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    item.status !== false
                      ? styles.statusBadgeTextActive
                      : styles.statusBadgeTextInactive,
                  ]}
                >
                  {item.status !== false ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              {Boolean(item.referalId) && (
                <View style={styles.refPill}>
                  <Icon name="tag" size={12} color="#4338CA" />
                  <Text style={styles.refPillText}>Ref: {item.referalId}</Text>
                </View>
              )}
              <Text style={styles.dateText}>Joined {dateFormatted}</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Contact & Wallet Details */}
        <View style={styles.cardDetailsRow}>
          <View style={styles.contactCol}>
            <View style={styles.infoLine}>
              <Icon name="phone" size={14} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.infoLineText}>+91 {item.phone || 'N/A'}</Text>
            </View>
            {Boolean(item.email) && (
              <View style={[styles.infoLine, { marginTop: 4 }]}>
                <Icon name="email" size={14} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.infoLineText} numberOfLines={1}>
                  {item.email}
                </Text>
              </View>
            )}
          </View>

          {/* Wallet Balance Box */}
          <View style={styles.walletBox}>
            <Text style={styles.walletLabel}>Wallet Balance</Text>
            <Text style={styles.walletValue}>₹{balance.toFixed(2)}</Text>
          </View>
        </View>

        {/* Quick Action Footer */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleCall(item.phone)}
            activeOpacity={0.7}
          >
            <Icon name="call" size={16} color="#092B88" />
            <Text style={styles.actionBtnText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnWhatsApp]}
            onPress={() => handleWhatsApp(item.phone)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="whatsapp" size={16} color="#059669" />
            <Text style={[styles.actionBtnText, { color: '#059669' }]}>WhatsApp</Text>
          </TouchableOpacity>

          {Boolean(item.email) && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleEmail(item.email)}
              activeOpacity={0.7}
            >
              <Icon name="mail-outline" size={16} color="#475569" />
              <Text style={[styles.actionBtnText, { color: '#475569' }]}>Email</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeaderContainer}>
      {/* Metrics Banner */}
      <View style={styles.metricsBanner}>
        <View style={styles.metricItem}>
          <View style={[styles.metricIconCircle, { backgroundColor: '#EEF2FF' }]}>
            <Icon name="people" size={20} color="#1E40AF" />
          </View>
          <Text style={styles.metricValue}>{metrics.total}</Text>
          <Text style={styles.metricLabel}>Total Retailers</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <View style={[styles.metricIconCircle, { backgroundColor: '#ECFDF5' }]}>
            <Icon name="check-circle" size={20} color="#059669" />
          </View>
          <Text style={[styles.metricValue, { color: '#059669' }]}>
            {metrics.active}
          </Text>
          <Text style={styles.metricLabel}>Active</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <View style={[styles.metricIconCircle, { backgroundColor: '#FEF3C7' }]}>
            <MaterialCommunityIcons name="wallet" size={20} color="#D97706" />
          </View>
          <Text style={[styles.metricValue, { color: '#092B88' }]}>
            ₹{metrics.totalBalance.toFixed(0)}
          </Text>
          <Text style={styles.metricLabel}>Network Balance</Text>
        </View>
      </View>

      {/* Search Input Box */}
      <View style={styles.searchWrapper}>
        <Icon name="search" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, or Ref ID..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {Boolean(searchQuery) && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="close" size={18} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === 'all' && styles.filterChipActive,
          ]}
          onPress={() => setSelectedFilter('all')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedFilter === 'all' && styles.filterChipTextActive,
            ]}
          >
            All ({retailers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === 'active' && styles.filterChipActive,
          ]}
          onPress={() => setSelectedFilter('active')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedFilter === 'active' && styles.filterChipTextActive,
            ]}
          >
            Active ({metrics.active})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === 'inactive' && styles.filterChipActive,
          ]}
          onPress={() => setSelectedFilter('inactive')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedFilter === 'inactive' && styles.filterChipTextActive,
            ]}
          >
            Inactive ({retailers.length - metrics.active})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Icon name="people-outline" size={48} color="#94A3B8" />
        </View>
        <Text style={styles.emptyTitle}>
          {searchQuery ? 'No Retailers Found' : 'No Downline Retailers Yet'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery
            ? `No retailer matches "${searchQuery}". Check the phone or name.`
            : 'Start building your network by onboarding retailers under your account.'}
        </Text>

        {!searchQuery && (
          <TouchableOpacity
            style={styles.emptyAddBtn}
            onPress={() =>
              navigation.navigate('CreateRetailer', {
                distributorId: currentUser?._id,
                referralCode: currentUser?.referalId,
              })
            }
            activeOpacity={0.85}
          >
            <Icon name="person-add" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.emptyAddBtnText}>Add Your First Retailer</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!isDistributor) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={BLUE} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Access Restricted</Text>
        </View>
        <View style={[styles.emptyContainer, { flex: 1, justifyContent: 'center' }]}>
          <View style={[styles.emptyIconCircle, { backgroundColor: '#FEE2E2' }]}>
            <Icon name="lock" size={48} color="#DC2626" />
          </View>
          <Text style={styles.emptyTitle}>Distributors Only</Text>
          <Text style={styles.emptySubtitle}>
            This portal is exclusively accessible to verified Distributors.
          </Text>
          <TouchableOpacity
            style={[styles.emptyAddBtn, { backgroundColor: BLUE }]}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyAddBtnText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My Retailers</Text>
          <Text style={styles.headerSubtitle}>
            Downline retailer network management
          </Text>
        </View>

        {/* Top Quick Add Button */}
        <TouchableOpacity
          style={styles.headerAddBtn}
          onPress={() =>
            navigation.navigate('CreateRetailer', {
              distributorId: currentUser?._id,
              referralCode: currentUser?.referalId,
            })
          }
          activeOpacity={0.85}
        >
          <Icon name="person-add" size={16} color="#FFF" />
          <Text style={styles.headerAddBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.loadingText}>Loading Downline Retailers...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRetailers}
          keyExtractor={item => item._id || item.phone || String(Math.random())}
          renderItem={renderRetailerCard}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchRetailers(true)}
              colors={[BLUE]}
              tintColor={BLUE}
            />
          }
        />
      )}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate('CreateRetailer', {
            distributorId: currentUser?._id,
            referralCode: currentUser?.referalId,
          })
        }
        activeOpacity={0.85}
      >
        <Icon name="add" size={24} color="#FFF" />
        <Text style={styles.fabText}>Add Retailer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MyRetailers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  header: {
    backgroundColor: BLUE,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 6,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerAddBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  listHeaderContainer: {
    paddingTop: 16,
    marginBottom: 8,
  },
  metricsBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#092B88',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    marginBottom: 14,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: BLUE,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#092B88',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '800',
    color: BLUE,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  cardHeaderDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retailerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeActive: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  statusBadgeTextActive: {
    color: '#059669',
  },
  statusBadgeTextInactive: {
    color: '#64748B',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  refPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginRight: 8,
  },
  refPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4338CA',
    marginLeft: 2,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactCol: {
    flex: 1,
    marginRight: 8,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLineText: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '600',
  },
  walletBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  walletLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  walletValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 8,
  },
  actionBtnWhatsApp: {
    backgroundColor: '#ECFDF5',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#092B88',
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BLUE,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 20,
    elevation: 3,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyAddBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    elevation: 6,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 6,
    letterSpacing: 0.2,
  },
});
