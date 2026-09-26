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
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { getData } from '../API';
import { useRoute, useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Footer from '../components/Footer';

const ReportsScreen = () => {
  const navigation = useNavigation();

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#040E2D" />

      {/* Top Header */}
      <View style={styles.screenHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Reports & History</Text>
        <View style={{ width: 40 }} />
      </View>

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
          color="'#0A2E8A'"
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
    </SafeAreaView>
  );
};


export default ReportsScreen;

// ===================== STYLES ======================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07153A' },
  screenHeader: {
    backgroundColor: '#040E2D',
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 4,
    borderRadius: 16,
    marginHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.50)' },
  activeTab: { backgroundColor: '#4B9EFF', elevation: 2 },
  activeTabText: { color: '#FFFFFF', fontWeight: '800' },

  filterHeader: {
    marginTop: 6,
    marginHorizontal: 14,
    backgroundColor: 'rgba(75,158,255,0.10)',
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.25)',
  },
  filterHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4B9EFF',
  },

  filterContainer: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingBottom: 14,
    marginHorizontal: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },

  dateBox: {
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.35)',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dateText: { color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  input: {
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.35)',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    fontSize: 14,
    color: '#FFFFFF',
  },

  fetchBtn: {
    backgroundColor: '#4B9EFF',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    elevation: 6,
    shadowColor: '#4B9EFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  emptyImage: { width: '85%', height: 220, resizeMode: 'contain', opacity: 0.8 },
  noData: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.60)',
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
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
    color: '#FFFFFF',
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
    color: 'rgba(255,255,255,0.50)',
    marginBottom: 10,
    fontWeight: '500',
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 10,
  },

  amount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4B9EFF',
  },

  date: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.40)',
    textAlign: 'right',
    maxWidth: '60%',
    fontWeight: '500',
  },

  dropdownBox: {
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.35)',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  dropdownText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },

  dropdownList: {
    backgroundColor: '#0D2055',
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.25)',
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
    elevation: 4,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },

  dropdownItemText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(255,255,255,0.40)',
    textAlign: 'center',
  },
});

