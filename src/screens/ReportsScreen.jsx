import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  FlatList,
  StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getData } from '../API';
import { useRoute } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Footer from '../components/Footer';
import COLORS from '../constants/colors';

const ReportsScreen = () => {

  const route = useRoute();
  const { id } = route.params || {};
  const [activeTab, setActiveTab] = useState('mobile');

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [amount, setAmount] = useState('');

  // ⭐ NEW FILTER FOR CREDIT / DEBIT
  const [txnType, setTxnType] = useState('');
  const [showTxnDropdown, setShowTxnDropdown] = useState(false);
  const txnOptions = ['credit', 'debit'];

  const [status, setStatus] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusOptions = ['SUCCESS', 'FAILED', 'PENDING'];

  const [data, setData] = useState({});
  const [Ledger, setLedger] = useState([]);

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
      toValue: isFilterOpen ? 0 : 500,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  // Fetch Mobile/DTH/Bill data
  useEffect(() => {
    const fetchData = async () => {
      const res = await getData('api/user/combined-history');
      console.log('Combined History Response:', res);
      setData(res);
    };
    fetchData();
  }, []);

  // Fetch Ledger data
  useEffect(() => {
    const fetchData = async () => {
      console.log(id);
      const res = await getData(`api/txn/list/${id}`);
      console.log('Ledger Response:', res);
      setLedger(res?.Data || []);
    };
    fetchData();
  }, []);

  const getCurrentData = () => {
    if (!data) return [];

    if (activeTab === 'mobile') return data?.Data?.mobile || [];
    if (activeTab === 'dth') return data?.Data?.dth || [];
    if (activeTab === 'bill') return data?.Data?.bbps || [];
    if (activeTab === 'Ledger') return Ledger || [];

    return [];
  };

  useEffect(() => {
    if (!data?.Data) return;

    const current = getCurrentData();

    const uniqueProviders = [
      ...new Set(
        current.map(item => item.operatorName?.trim()).filter(Boolean),
      ),
    ];

    setProviderOptions(uniqueProviders);
  }, [activeTab, data]);

  const baseList = getCurrentData();
  const currentList = filteredList.length > 0 ? filteredList : baseList;

  // APPLY FILTERS (updated)
  const applyFilter = () => {
    const list = getCurrentData();
    let filtered = list;

    // ⭐ PROVIDER FILTER (ONLY for mobile/dth/bill)
    if (provider.trim() !== '' && activeTab !== 'Ledger') {
      filtered = filtered.filter(item =>
        item.operatorName?.toLowerCase().includes(provider.toLowerCase()),
      );
    }

    // ⭐ Amount filter (common)
    if (amount.trim() !== '') {
      filtered = filtered.filter(item =>
        activeTab === 'Ledger'
          ? String(item.txnAmount) === String(amount)
          : String(item.amount) === String(amount),
      );
    }

    // ⭐ NEW CREDIT/DEBIT FILTER ONLY FOR LEDGER
    if (txnType.trim() !== '' && activeTab === 'Ledger') {
      filtered = filtered.filter(item => item.txnType === txnType);
    }

    // Status filter (only for mobile/dth/bill)
    if (status.trim() !== '' && activeTab !== 'Ledger') {
      filtered = filtered.filter(item =>
        item.status?.toLowerCase().includes(status.toLowerCase()),
      );
    }

    // Date filters
    if (fromDate) {
      filtered = filtered.filter(item => new Date(item.createdAt) >= fromDate);
    }
    if (toDate) {
      filtered = filtered.filter(item => new Date(item.createdAt) <= toDate);
    }

    setFilteredList(filtered);
  };

  // Ledger Renderer
  const renderLedgerItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.operator}>{item.txnName}</Text>

        <Text
          style={[
            styles.status,
            {
              color:
                item.txnType === 'credit'
                  ? 'green'
                  : item.txnType === 'debit'
                  ? 'red'
                  : '#555',
            },
          ]}
        >
          {item?.txnType?.toUpperCase()}
        </Text>
      </View>

      <Text style={styles.number}>{item.txnDesc}</Text>

      <Text style={styles.txnId}>
        Transaction ID: <Text style={{ fontWeight: '600' }}>{item.txnId}</Text>
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.amount}>₹{item.txnAmount}</Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      <View
        style={{
          padding: 4,
          backgroundColor: '#fff',
          marginBottom: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '500' }}>
          Opening Balance: ₹{item.openingBalance}
        </Text>

        <Text style={{ fontSize: 13, fontWeight: '500', marginTop: 5 }}>
          Closing Balance: ₹{item.closingBalance}
        </Text>
      </View>
    </View>
  );

  // Mobile / DTH / Bills Renderer
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.operator}>
          {item.operatorName || item.provider || 'Unknown'}
        </Text>

        <Text
          style={[
            styles.status,
            {
              color:
                item.status === 'SUCCESS'
                  ? 'green'
                  : item.status === 'FAILED'
                  ? 'red'
                  : '#555',
            },
          ]}
        >
          {item.status}
        </Text>
      </View>

      <Text style={styles.number}>{item.number || item.consumerNumber}</Text>

      <Text style={styles.txnId}>
        Transaction ID:{' '}
        <Text style={{ fontWeight: '600' }}>
          {item.txnId || item.transactionId || 'N/A'}
        </Text>
      </Text>
      <Text style={{ fontSize: 13, fontWeight: '500' }}>
        Paid From: {item.paidFrom}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.amount}>₹{item.amount}</Text>

        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg || '#0A2568'} />
      {/* ----------------- TABS ----------------- */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mobile' && styles.activeTab]}
          onPress={() => setActiveTab('mobile')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'mobile' && styles.activeTabText,
            ]}
          >
            Mobile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'dth' && styles.activeTab]}
          onPress={() => setActiveTab('dth')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'dth' && styles.activeTabText,
            ]}
          >
            DTH
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'bill' && styles.activeTab]}
          onPress={() => setActiveTab('bill')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'bill' && styles.activeTabText,
            ]}
          >
            Bills
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'Ledger' && styles.activeTab]}
          onPress={() => setActiveTab('Ledger')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Ledger' && styles.activeTabText,
            ]}
          >
            Ledger
          </Text>
        </TouchableOpacity>
      </View>

      {/* FILTER HEADER */}
      <TouchableOpacity style={styles.filterHeader} onPress={toggleFilter}>
        <Text style={styles.filterHeaderText}>Filters</Text>
        <Icon
          name={isFilterOpen ? 'chevron-up' : 'chevron-down'}
          size={26}
          color={COLORS.primary || '#0D52ED'}
        />
      </TouchableOpacity>

      {/* FILTER CONTENT */}
      <Animated.View
        style={[styles.filterContainer, { maxHeight: animatedHeight }]}
      >
        {isFilterOpen && (
          <View>
            {/* Date Filters */}
            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => setShowFromPicker(true)}
            >
              <Text style={styles.dateText}>
                {fromDate ? new Date(fromDate).toDateString() : 'From Date'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => setShowToPicker(true)}
            >
              <Text style={styles.dateText}>
                {toDate ? new Date(toDate).toDateString() : 'To Date'}
              </Text>
            </TouchableOpacity>

            {/* DATE PICKERS */}
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

            {/* ⭐ NEW CREDIT / DEBIT DROPDOWN (ONLY FOR LEDGER) */}
            {activeTab === 'Ledger' && (
              <>
                <TouchableOpacity
                  style={styles.dropdownBox}
                  onPress={() => setShowTxnDropdown(!showTxnDropdown)}
                >
                  <Text style={styles.dropdownText}>
                    {txnType ? txnType : 'Select Credit / Debit'}
                  </Text>

                  <Icon
                    name={showTxnDropdown ? 'chevron-up' : 'chevron-down'}
                    size={22}
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
                        <Text style={styles.dropdownItemText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Amount Input */}
            <TextInput
              placeholder="Amount"
              placeholderTextColor="#888"
              value={amount}
              keyboardType="numeric"
              onChangeText={setAmount}
              style={styles.input}
            />

            {/* STATUS DROPDOWN (NOT FOR LEDGER) */}
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
                    size={22}
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
            {activeTab !== 'Ledger' && (
              <>
                <TouchableOpacity
                  style={styles.dropdownBox}
                  onPress={() => setShowProviderDropdown(!showProviderDropdown)}
                >
                  <Text style={styles.dropdownText}>
                    {provider ? provider : 'Select Provider'}
                  </Text>

                  <Icon
                    name={showProviderDropdown ? 'chevron-up' : 'chevron-down'}
                    size={22}
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

            {/* Apply / Reset */}
            <TouchableOpacity style={styles.fetchBtn} onPress={applyFilter}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                Apply Filters
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.fetchBtn,
                { backgroundColor: '#aaa', marginTop: 10 },
              ]}
              onPress={() => {
                setFilteredList([]);
                setAmount('');
                setTxnType('');
                setStatus('');
                setFromDate(null);
                setToDate(null);
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* LIST OR NO DATA */}
      {currentList.length === 0 ? (
        <View style={styles.emptyContainer}>
  <Icon
    name="database-off-outline"
    size={64}
    color="#B0B7C3"
  />

  <Text style={styles.emptyTitle}>No Data Found</Text>

  <Text style={styles.emptySubtitle}>
    There’s nothing to show here right now.
  </Text>
</View>
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={(item, index) => String(index)}
          renderItem={activeTab === 'Ledger' ? renderLedgerItem : renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListFooterComponent={
            <View style={{ marginTop: 20 }}>
              <Footer />
            </View>
          }
        />
      )}
    </View>
  );
};


export default ReportsScreen;

// ===================== STYLES (NO CHANGE) ======================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7', padding: 14 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  activeTab: { backgroundColor: COLORS.primary || '#0D52ED', elevation: 2 },
  activeTabText: { color: '#FFFFFF', fontWeight: '800' },

  filterHeader: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  filterHeaderText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary || '#0D52ED',
  },

  filterContainer: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingBottom: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },

  dateBox: {
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: '#F8FAFC',
  },
  dateText: { color: '#334155', fontWeight: '500' },

  input: {
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    fontSize: 14,
    color: '#091838',
  },

  fetchBtn: {
    backgroundColor: COLORS.primary || '#0D52ED',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    elevation: 3,
    shadowColor: COLORS.primary || '#0D52ED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  emptyImage: { width: '85%', height: 220, resizeMode: 'contain' },
  noData: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  operator: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  status: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },

  number: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 10,
    fontWeight: '500',
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },

  amount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  date: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
    maxWidth: '60%',
    fontWeight: '500',
  },

  dropdownBox: {
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  dropdownText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },

  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
    elevation: 4,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  dropdownItemText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 60,
  paddingHorizontal: 20,
},

emptyTitle: {
  marginTop: 16,
  fontSize: 18,
  fontWeight: '600',
  color: '#1F2937',
},

emptySubtitle: {
  marginTop: 6,
  fontSize: 14,
  color: '#9CA3AF',
  textAlign: 'center',
},
});

