import COLORS from '../constants/colors';
import Video from 'react-native-video';
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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getData } from '../API';
import { useRoute } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

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
          color="#007bff"
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
          <Video
            source={{
              uri: 'https://ik.imagekit.io/palame/rechargeapp/not-found-error.mp4',
            }}
            style={styles.emptyImage}
            resizeMode="cover"
            repeat
            muted
            paused={false}
          />
        </View>
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={(item, index) => String(index)}
          renderItem={activeTab === 'Ledger' ? renderLedgerItem : renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

export default ReportsScreen;

// ===================== STYLES (NO CHANGE) ======================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 10 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    padding: 5,
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#555' },
  activeTab: { backgroundColor: COLORS.primary },
  activeTabText: { color: '#fff' },

  filterHeader: {
    marginTop: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },
  filterHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },

  filterContainer: {
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginTop: 5,
  },

  dateBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  dateText: { color: '#555' },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  fetchBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyImage: { width: '100%', height: '50%' },
  noData: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  operator: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  status: {
    fontSize: 14,
    fontWeight: '700',
  },

  number: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },

  date: {
    fontSize: 12,
    color: '#777',
    textAlign: 'right',
    maxWidth: '55%',
  },

  dropdownBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  dropdownText: {
    fontSize: 15,
    color: '#555',
  },

  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 5,
    overflow: 'hidden',
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  dropdownItemText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
});
