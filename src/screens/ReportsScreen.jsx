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

const ReportsScreen = () => {
  const [activeTab, setActiveTab] = useState('mobile');

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [provider, setProvider] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [providerOptions, setProviderOptions] = useState([]);
  const [data, setData] = useState({});
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [filteredList, setFilteredList] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const statusOptions = ['SUCCESS', 'FAILED', 'PENDING'];

  // Animation for collapsible
  const animatedHeight = useRef(new Animated.Value(0)).current;

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);

    Animated.timing(animatedHeight, {
      toValue: isFilterOpen ? 0 : 500, // bigger height
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await getData('/api/user/combined-history');
      setData(res);
      console.log(res);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!data?.Data) return;

    const list = getCurrentData();

    const unique = [
      ...new Set(list.map(item => item.operatorName?.trim()).filter(Boolean)),
    ];

    setProviderOptions(unique);
  }, [activeTab, data]);

  const getCurrentData = () => {
    if (!data) return [];

    if (activeTab === 'mobile') return data?.Data?.mobile || [];
    if (activeTab === 'dth') return data?.Data?.dth || [];
    if (activeTab === 'bill') return data?.Data?.bbps || [];

    return [];
  };
  const baseList = getCurrentData();
  const currentList = filteredList.length > 0 ? filteredList : baseList;

  const applyFilter = () => {
    const list = getCurrentData();

    let filtered = list;

    // Filter by provider name
    if (provider.trim() !== '') {
      console.log(provider);
      filtered = filtered.filter(item =>
        item.operatorName?.toLowerCase().includes(provider.toLowerCase()),
      );
    }

    // Filter by amount
    if (amount.trim() !== '') {
      filtered = filtered.filter(
        item => String(item.amount) === String(amount),
      );
    }

    // Filter by status
    if (status.trim() !== '') {
      filtered = filtered.filter(item =>
        item.status?.toLowerCase().includes(status.toLowerCase()),
      );
      console.log(status.toLowerCase());
    }

    // Date Filter (from)
    if (fromDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= fromDate;
      });
    }

    // Date Filter (to)
    if (toDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate <= toDate;
      });
    }

    setFilteredList(filtered);

    console.log('FILTERED:', filtered);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.operator}>{item.operatorName || 'Unknown'}</Text>

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

      {/* Number */}
      <Text style={styles.number}>{item.number || item.consumerNumber}</Text>

      {/* 🔥 TRANSACTION ID (NEW) */}
      <Text style={styles.txnId}>
        Transaction ID:{' '}
        <Text style={{ fontWeight: '600' }}>
          {item.txnId || item.transactionId || 'N/A'}
        </Text>
      </Text>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.amount}>₹{item.amount}</Text>

        <Text style={styles.date}>
          {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
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
            Mobile Recharge
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
            DTH Recharge
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
            Bill Payments
          </Text>
        </TouchableOpacity>
      </View>

      {/* ----------------- COLLAPSIBLE FILTER HEADER ----------------- */}
      <TouchableOpacity style={styles.filterHeader} onPress={toggleFilter}>
        <Text style={styles.filterHeaderText}>Filters</Text>
        <Icon
          name={isFilterOpen ? 'chevron-up' : 'chevron-down'}
          size={26}
          color="#10306b"
        />
      </TouchableOpacity>

      {/* ----------------- COLLAPSIBLE FILTER CONTENT ----------------- */}
      <Animated.View
        style={[styles.filterContainer, { maxHeight: animatedHeight }]}
      >
        {isFilterOpen && (
          <View>
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

            {/* PROVIDER DROPDOWN */}
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

            <TextInput
              placeholder="Amount"
              placeholderTextColor="#888"
              value={amount}
              keyboardType="numeric"
              onChangeText={setAmount}
              style={styles.input}
            />

            {/* STATUS DROPDOWN */}
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
                setProvider('');
                setAmount('');
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

      {/* ----------------- No Data ----------------- */}
      {currentList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/7486/7486742.png',
            }}
            style={styles.emptyImage}
          />
          <Text style={styles.noData}>No Data Found</Text>
        </View>
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={(item, index) => String(index)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 10 },

  /* TABS */
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
  activeTab: { backgroundColor: '#10306b' },
  activeTabText: { color: '#fff' },

  /* Collapsible Header */
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
    color: '#10306b',
  },

  /* Collapsible Content */
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
    backgroundColor: '#10306b',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },

  /* No Data */
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyImage: { width: 180, height: 180 },
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
