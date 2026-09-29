import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getData } from '../API';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { colors } from '../constants/colors';
import NavBar from '../components/NavBar';

const DUMMY_TRANSACTIONS = {
  mobile: [
    {
      operatorName: 'Jio Prepaid',
      status: 'SUCCESS',
      number: '9876543210',
      txnId: 'TXN89123841',
      paidFrom: 'Sarvana Wallet',
      amount: 299,
      createdAt: new Date().toISOString(),
    },
    {
      operatorName: 'Airtel Prepaid',
      status: 'SUCCESS',
      number: '9811223344',
      txnId: 'TXN89121902',
      paidFrom: 'UPI',
      amount: 719,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      operatorName: 'Vi (Vodafone Idea)',
      status: 'FAILED',
      number: '9988776655',
      txnId: 'TXN89110023',
      paidFrom: 'Sarvana Wallet',
      amount: 199,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ],
  dth: [
    {
      operatorName: 'Tata Play',
      status: 'SUCCESS',
      number: '1098234812',
      txnId: 'DTH39102831',
      paidFrom: 'UPI',
      amount: 450,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      operatorName: 'Airtel Digital TV',
      status: 'SUCCESS',
      number: '3001928471',
      txnId: 'DTH38192019',
      paidFrom: 'Sarvana Wallet',
      amount: 350,
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
  ],
  bbps: [
    {
      operatorName: 'Tata Power DDL Electricity',
      status: 'SUCCESS',
      consumerNumber: 'CA-9021948120',
      txnId: 'BBPS4910284',
      paidFrom: 'Net Banking',
      amount: 1420,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      operatorName: 'Indraprastha Gas (IGL)',
      status: 'SUCCESS',
      consumerNumber: 'IGL-8829102',
      txnId: 'BBPS4820194',
      paidFrom: 'Sarvana Wallet',
      amount: 850,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ],
  ledger: [
    {
      txnName: 'Vivah Sahayog Contribution',
      txnType: 'debit',
      txnDesc: 'Voluntary contribution towards girl child marriage scheme',
      txnId: 'LED9201948',
      txnAmount: 10,
      openingBalance: 1250,
      closingBalance: 1240,
      createdAt: new Date().toISOString(),
    },
    {
      txnName: 'Cashback Earned',
      txnType: 'credit',
      txnDesc: '2% instant cashback on Jio Recharge #TXN89123841',
      txnId: 'LED9102841',
      txnAmount: 6,
      openingBalance: 1240,
      closingBalance: 1246,
      createdAt: new Date().toISOString(),
    },
    {
      txnName: 'Wallet Top-up',
      txnType: 'credit',
      txnDesc: 'Loaded wallet via UPI (PhonePe)',
      txnId: 'LED8920192',
      txnAmount: 500,
      openingBalance: 746,
      closingBalance: 1246,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ],
};

const ReportsScreen = () => {
  const route = useRoute();
  const reduxUser = useSelector((state) => state.auth?.user || state.user?.user || state.user || null);
  const userId = route.params?.id || reduxUser?._id || reduxUser?.id || '';

  const [activeTab, setActiveTab] = useState('mobile');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [amount, setAmount] = useState('');

  const [txnType, setTxnType] = useState('');
  const [showTxnDropdown, setShowTxnDropdown] = useState(false);
  const txnOptions = ['credit', 'debit'];

  const [status, setStatus] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusOptions = ['SUCCESS', 'FAILED', 'PENDING'];

  const [data, setData] = useState({});
  const [ledger, setLedger] = useState([]);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [filteredList, setFilteredList] = useState([]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [provider, setProvider] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [providerOptions, setProviderOptions] = useState([]);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
    Animated.timing(animatedHeight, {
      toValue: isFilterOpen ? 0 : 520,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getData('api/user/combined-history');
      if (res?.Data) {
        setData(res);
      } else {
        setData({ Data: DUMMY_TRANSACTIONS });
      }

      if (userId) {
        const ledgerRes = await getData(`api/txn/list/${userId}`);
        if (ledgerRes?.Data && ledgerRes.Data.length > 0) {
          setLedger(ledgerRes.Data);
        } else {
          setLedger(DUMMY_TRANSACTIONS.ledger);
        }
      } else {
        setLedger(DUMMY_TRANSACTIONS.ledger);
      }
    } catch (err) {
      console.log('Error fetching history:', err);
      setData({ Data: DUMMY_TRANSACTIONS });
      setLedger(DUMMY_TRANSACTIONS.ledger);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getCurrentData = () => {
    const dataSource = data?.Data || DUMMY_TRANSACTIONS;
    if (activeTab === 'mobile') return dataSource?.mobile || DUMMY_TRANSACTIONS.mobile;
    if (activeTab === 'dth') return dataSource?.dth || DUMMY_TRANSACTIONS.dth;
    if (activeTab === 'bill') return dataSource?.bbps || DUMMY_TRANSACTIONS.bbps;
    if (activeTab === 'Ledger') return ledger.length > 0 ? ledger : DUMMY_TRANSACTIONS.ledger;
    return [];
  };

  useEffect(() => {
    const current = getCurrentData();
    const uniqueProviders = [
      ...new Set(current.map((item) => item.operatorName?.trim()).filter(Boolean)),
    ];
    setProviderOptions(uniqueProviders);
    setFilteredList([]);
  }, [activeTab, data, ledger]);

  const baseList = getCurrentData();
  const currentList = filteredList.length > 0 ? filteredList : baseList;

  const applyFilter = () => {
    const list = getCurrentData();
    let filtered = list;

    if (provider.trim() !== '' && activeTab !== 'Ledger') {
      filtered = filtered.filter((item) =>
        item.operatorName?.toLowerCase().includes(provider.toLowerCase())
      );
    }

    if (amount.trim() !== '') {
      filtered = filtered.filter((item) =>
        activeTab === 'Ledger'
          ? String(item.txnAmount) === String(amount)
          : String(item.amount) === String(amount)
      );
    }

    if (txnType.trim() !== '' && activeTab === 'Ledger') {
      filtered = filtered.filter((item) => item.txnType === txnType);
    }

    if (status.trim() !== '' && activeTab !== 'Ledger') {
      filtered = filtered.filter((item) =>
        item.status?.toLowerCase().includes(status.toLowerCase())
      );
    }

    if (fromDate) {
      filtered = filtered.filter((item) => new Date(item.createdAt) >= fromDate);
    }
    if (toDate) {
      filtered = filtered.filter((item) => new Date(item.createdAt) <= toDate);
    }

    setFilteredList(filtered);
  };

  const renderLedgerItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: item.txnType === 'credit' ? '#ECFDF5' : '#FEE2E2' },
            ]}
          >
            <Icon
              name={item.txnType === 'credit' ? 'arrow-bottom-left' : 'arrow-top-right'}
              size={18}
              color={item.txnType === 'credit' ? colors.secondary : '#EF4444'}
            />
          </View>
          <Text style={styles.operator} numberOfLines={1}>
            {item.txnName}
          </Text>
        </View>

        <Text
          style={[
            styles.status,
            {
              backgroundColor: item.txnType === 'credit' ? '#ECFDF5' : '#FEE2E2',
              color: item.txnType === 'credit' ? colors.secondary : '#EF4444',
            },
          ]}
        >
          {item?.txnType?.toUpperCase()}
        </Text>
      </View>

      <Text style={styles.number}>{item.txnDesc}</Text>

      <Text style={styles.txnId}>
        Transaction ID: <Text style={{ fontWeight: '600', color: '#1F2937' }}>{item.txnId}</Text>
      </Text>

      <View style={styles.cardFooter}>
        <Text
          style={[
            styles.amount,
            { color: item.txnType === 'credit' ? colors.secondary : '#EF4444' },
          ]}
        >
          {item.txnType === 'credit' ? '+ ' : '- '}₹{item.txnAmount}
        </Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>

      <View style={styles.balanceRow}>
        <Text style={styles.balanceText}>Opening: ₹{item.openingBalance}</Text>
        <Text style={styles.balanceText}>Closing: ₹{item.closingBalance}</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceLight }]}>
            <Icon
              name={
                activeTab === 'mobile'
                  ? 'cellphone'
                  : activeTab === 'dth'
                  ? 'satellite-variant'
                  : 'receipt'
              }
              size={18}
              color={colors.primary}
            />
          </View>
          <Text style={styles.operator} numberOfLines={1}>
            {item.operatorName || item.provider || 'Operator'}
          </Text>
        </View>

        <Text
          style={[
            styles.status,
            {
              backgroundColor:
                item.status === 'SUCCESS'
                  ? '#ECFDF5'
                  : item.status === 'FAILED'
                  ? '#FEE2E2'
                  : '#FEF3C7',
              color:
                item.status === 'SUCCESS'
                  ? colors.secondary
                  : item.status === 'FAILED'
                  ? '#EF4444'
                  : '#D97706',
            },
          ]}
        >
          {item.status}
        </Text>
      </View>

      <Text style={styles.number}>
        {item.number ? `Mobile: ${item.number}` : item.consumerNumber ? `Account: ${item.consumerNumber}` : ''}
      </Text>

      <Text style={styles.txnId}>
        Txn ID: <Text style={{ fontWeight: '600', color: '#1F2937' }}>{item.txnId || item.transactionId || 'N/A'}</Text>
      </Text>
      {item.paidFrom && (
        <Text style={styles.paidFromText}>Paid From: {item.paidFrom}</Text>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.amount}>₹{item.amount}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction Reports</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        {['mobile', 'dth', 'bill', 'Ledger'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'mobile'
                ? 'Mobile'
                : tab === 'dth'
                ? 'DTH'
                : tab === 'bill'
                ? 'Bills'
                : 'Ledger'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FILTER ACCORDION */}
      <TouchableOpacity style={styles.filterHeader} onPress={toggleFilter} activeOpacity={0.8}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="filter-variant" size={20} color={colors.primary} />
          <Text style={styles.filterHeaderText}>Filter Records</Text>
        </View>
        <Icon
          name={isFilterOpen ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={colors.primary}
        />
      </TouchableOpacity>

      <Animated.View style={[styles.filterContainer, { maxHeight: animatedHeight }]}>
        {isFilterOpen && (
          <View>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={[styles.dateBox, { flex: 1 }]}
                onPress={() => setShowFromPicker(true)}
              >
                <Text style={styles.dateText}>
                  {fromDate ? new Date(fromDate).toLocaleDateString() : 'From Date'}
                </Text>
                <Icon name="calendar" size={16} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateBox, { flex: 1 }]}
                onPress={() => setShowToPicker(true)}
              >
                <Text style={styles.dateText}>
                  {toDate ? new Date(toDate).toLocaleDateString() : 'To Date'}
                </Text>
                <Icon name="calendar" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {showFromPicker && (
              <DateTimePicker
                value={fromDate || new Date()}
                mode="date"
                onChange={(e, d) => {
                  setShowFromPicker(false);
                  if (d) setFromDate(d);
                }}
              />
            )}

            {showToPicker && (
              <DateTimePicker
                value={toDate || new Date()}
                mode="date"
                onChange={(e, d) => {
                  setShowToPicker(false);
                  if (d) setToDate(d);
                }}
              />
            )}

            {/* CREDIT / DEBIT DROPDOWN */}
            {activeTab === 'Ledger' && (
              <>
                <TouchableOpacity
                  style={styles.dropdownBox}
                  onPress={() => setShowTxnDropdown(!showTxnDropdown)}
                >
                  <Text style={styles.dropdownText}>
                    {txnType ? txnType.toUpperCase() : 'All (Credit & Debit)'}
                  </Text>
                  <Icon
                    name={showTxnDropdown ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#777"
                  />
                </TouchableOpacity>

                {showTxnDropdown && (
                  <View style={styles.dropdownList}>
                    {txnOptions.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setTxnType(item);
                          setShowTxnDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{item.toUpperCase()}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            <TextInput
              placeholder="Search by Amount (₹)"
              placeholderTextColor="#9CA3AF"
              value={amount}
              keyboardType="numeric"
              onChangeText={setAmount}
              style={styles.input}
            />

            {/* STATUS DROPDOWN */}
            {activeTab !== 'Ledger' && (
              <>
                <TouchableOpacity
                  style={styles.dropdownBox}
                  onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  <Text style={styles.dropdownText}>
                    {status ? status : 'Select Status'}
                  </Text>
                  <Icon
                    name={showStatusDropdown ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#777"
                  />
                </TouchableOpacity>

                {showStatusDropdown && (
                  <View style={styles.dropdownList}>
                    {statusOptions.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setStatus(item);
                          setShowStatusDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Provider Dropdown */}
            {activeTab !== 'Ledger' && providerOptions.length > 0 && (
              <>
                <TouchableOpacity
                  style={styles.dropdownBox}
                  onPress={() => setShowProviderDropdown(!showProviderDropdown)}
                >
                  <Text style={styles.dropdownText}>
                    {provider ? provider : 'Select Operator'}
                  </Text>
                  <Icon
                    name={showProviderDropdown ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#777"
                  />
                </TouchableOpacity>

                {showProviderDropdown && (
                  <View style={styles.dropdownList}>
                    {providerOptions.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setProvider(item);
                          setShowProviderDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                style={[styles.fetchBtn, { flex: 1, backgroundColor: '#E5E7EB' }]}
                onPress={() => {
                  setFilteredList([]);
                  setAmount('');
                  setTxnType('');
                  setStatus('');
                  setProvider('');
                  setFromDate(null);
                  setToDate(null);
                }}
              >
                <Text style={{ color: '#4B5563', fontWeight: '700' }}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.fetchBtn, { flex: 2, backgroundColor: colors.primary }]}
                onPress={applyFilter}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>

      {/* LIST OR EMPTY */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyTitle}>Loading transactions...</Text>
        </View>
      ) : currentList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="database-off-outline" size={56} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Transactions Found</Text>
          <Text style={styles.emptySubtitle}>
            There are no records matching your selected tab and filters.
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={(item, index) => item.txnId || item._id || String(index)}
          renderItem={activeTab === 'Ledger' ? renderLedgerItem : renderItem}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 100, paddingTop: 10 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}

      <NavBar activeTab="History" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 6,
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterHeader: {
    marginTop: 10,
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingBottom: 14,
    marginHorizontal: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  dateBox: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  dateText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: '#F9FAFB',
    fontSize: 13,
    color: '#1F2937',
  },
  fetchBtn: {
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  operator: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  status: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  number: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  txnId: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  paidFromText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    marginTop: 4,
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
  },
  date: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  balanceText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  dropdownBox: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  dropdownText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
  },
});

export default ReportsScreen;
