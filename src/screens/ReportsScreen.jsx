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

// Theme helper function
const getTheme = (isDark) => ({
  isDark,
  bg: isDark ? '#092B88' : '#F4F7FF',
  headerBg: isDark ? '#092B88' : '#092B88',
  headerBtnBg: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.16)',
  headerBtnBorder: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.28)',

  tabContainerBg: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EEF2FF',
  tabContainerBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
  tabActiveBg: isDark ? '#2454D1' : '#092B88',
  tabActiveText: '#FFFFFF',
  tabInactiveText: isDark ? 'rgba(255, 255, 255, 0.75)' : '#475569',

  filterHeaderBg: isDark ? 'rgba(75, 158, 255, 0.10)' : '#FFFFFF',
  filterHeaderBorder: isDark ? 'rgba(75, 158, 255, 0.25)' : '#E2E8F0',
  filterHeaderColor: isDark ? '#2454D1' : '#092B88',
  filterHeaderShadow: isDark
    ? {}
    : {
        elevation: 2,
        shadowColor: '#092B88',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      },

  filterContainerBg: isDark ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
  filterContainerBorder: isDark ? 'rgba(255, 255, 255, 0.10)' : '#E2E8F0',
  filterContainerShadow: isDark
    ? {}
    : {
        elevation: 3,
        shadowColor: '#092B88',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
      },

  inputBg: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F4F7FF',
  inputBorder: isDark ? 'rgba(75, 158, 255, 0.35)' : '#CBD5E1',
  inputText: isDark ? '#FFFFFF' : '#0F172A',
  inputPlaceholder: isDark ? '#93C5FD' : '#64748B',
  inputIcon: isDark ? '#93C5FD' : '#092B88',

  dropdownListBg: isDark ? '#123DB8' : '#FFFFFF',
  dropdownListBorder: isDark ? 'rgba(75, 158, 255, 0.35)' : '#CBD5E1',
  dropdownItemBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
  dropdownItemText: isDark ? '#FFFFFF' : '#0F172A',

  btnApplyBg: isDark ? '#2454D1' : '#092B88',
  btnApplyText: '#FFFFFF',
  btnResetBg: isDark ? 'rgba(255, 255, 255, 0.10)' : '#F1F5F9',
  btnResetBorder: isDark ? 'rgba(255, 255, 255, 0.20)' : '#CBD5E1',
  btnResetText: isDark ? '#FFFFFF' : '#334155',

  cardBg: isDark ? 'rgba(255, 255, 255, 0.07)' : '#FFFFFF',
  cardBorder: isDark ? 'rgba(75, 158, 255, 0.20)' : '#E2E8F0',
  cardShadow: isDark
    ? {}
    : {
        elevation: 3,
        shadowColor: '#092B88',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },

  textTitle: isDark ? '#FFFFFF' : '#0F172A',
  textSub: isDark ? '#93C5FD' : '#092B88',
  metaLabel: isDark ? 'rgba(255, 255, 255, 0.70)' : '#64748B',
  metaValue: isDark ? '#FFFFFF' : '#0F172A',

  balanceBoxBg: isDark ? 'rgba(75, 158, 255, 0.10)' : '#F1F5F9',
  balanceBoxBorder: isDark ? 'rgba(75, 158, 255, 0.22)' : '#E2E8F0',
  balanceDivider: isDark ? 'rgba(75, 158, 255, 0.25)' : '#CBD5E1',
  balanceSubLabel: isDark ? 'rgba(255, 255, 255, 0.70)' : '#64748B',
  balanceSubVal: isDark ? '#FFFFFF' : '#0F172A',
  balanceHighlight: isDark ? '#2454D1' : '#092B88',

  cardFooterBorder: isDark ? 'rgba(255, 255, 255, 0.10)' : '#F1F5F9',
  amountNormal: isDark ? '#2454D1' : '#092B88',
  amountCredit: isDark ? '#22C55E' : '#16A34A',
  dateColor: isDark ? 'rgba(255, 255, 255, 0.80)' : '#64748B',

  emptyIcon: isDark ? '#2454D1' : '#092B88',
  emptyTitle: isDark ? '#FFFFFF' : '#0F172A',
  emptySubtitle: isDark ? 'rgba(255, 255, 255, 0.75)' : '#64748B',
});

const ReportsScreen = () => {
  const navigation = useNavigation();

  const route = useRoute();
  const { id } = route.params || {};
  const [activeTab, setActiveTab] = useState('mobile');

  // Theme State: defaults to light mode ('false'), toggleable via header button
  const [isDark, setIsDark] = useState(false);
  const theme = getTheme(isDark);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [amount, setAmount] = useState('');

  // ⭐ FILTER FOR CREDIT / DEBIT
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

  // APPLY FILTERS
  const applyFilter = () => {
    const list = getCurrentData();
    let filtered = list;

    // PROVIDER FILTER (ONLY for mobile/dth/bill)
    if (provider.trim() !== '' && activeTab !== 'Ledger') {
      filtered = filtered.filter(item =>
        item.operatorName?.toLowerCase().includes(provider.toLowerCase()),
      );
    }

    // Amount filter (common)
    if (amount.trim() !== '') {
      filtered = filtered.filter(item =>
        activeTab === 'Ledger'
          ? String(item.txnAmount) === String(amount)
          : String(item.amount) === String(amount),
      );
    }

    // CREDIT/DEBIT FILTER ONLY FOR LEDGER
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

  // Status Badge Helper (theme-aware)
  const renderStatusBadge = (statusStr, type) => {
    const s = String(statusStr || type || '').toUpperCase();
    const isSuccess = s === 'SUCCESS' || s === 'CREDIT';
    const isFailed = s === 'FAILED' || s === 'DEBIT';

    let textColor, bgColor, borderColor;
    if (isDark) {
      textColor = isSuccess ? '#22C55E' : isFailed ? '#EF4444' : '#F59E0B';
      bgColor = isSuccess
        ? 'rgba(34, 197, 94, 0.16)'
        : isFailed
        ? 'rgba(239, 68, 68, 0.16)'
        : 'rgba(245, 158, 11, 0.16)';
      borderColor = isSuccess
        ? 'rgba(34, 197, 94, 0.35)'
        : isFailed
        ? 'rgba(239, 68, 68, 0.35)'
        : 'rgba(245, 158, 11, 0.35)';
    } else {
      textColor = isSuccess ? '#15803D' : isFailed ? '#DC2626' : '#B45309';
      bgColor = isSuccess ? '#DCFCE7' : isFailed ? '#FEE2E2' : '#FEF3C7';
      borderColor = isSuccess ? '#86EFAC' : isFailed ? '#FCA5A5' : '#FCD34D';
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor, borderColor }]}>
        <Text style={[styles.statusText, { color: textColor }]}>{s || 'PENDING'}</Text>
      </View>
    );
  };

  // Ledger Renderer
  const renderLedgerItem = ({ item }) => {
    const isCredit = item.txnType === 'credit';

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            ...theme.cardShadow,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.operator, { color: theme.textTitle }]} numberOfLines={1}>
            {item.txnName || 'Wallet Transaction'}
          </Text>
          {renderStatusBadge(null, item?.txnType)}
        </View>

        {item.txnDesc ? (
          <Text style={[styles.number, { color: theme.textSub }]}>{item.txnDesc}</Text>
        ) : null}

        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: theme.metaLabel }]}>Txn ID: </Text>
          <Text style={[styles.metaValue, { color: theme.metaValue }]} numberOfLines={1}>
            {item.txnId || 'N/A'}
          </Text>
        </View>

        {(item.openingBalance !== undefined || item.closingBalance !== undefined) && (
          <View
            style={[
              styles.balanceInfoBox,
              {
                backgroundColor: theme.balanceBoxBg,
                borderColor: theme.balanceBoxBorder,
              },
            ]}
          >
            <View style={styles.balanceCol}>
              <Text style={[styles.balanceSubLabel, { color: theme.balanceSubLabel }]}>
                Opening Balance
              </Text>
              <Text style={[styles.balanceSubVal, { color: theme.balanceSubVal }]}>
                ₹{item.openingBalance ?? '0.00'}
              </Text>
            </View>
            <View
              style={[
                styles.balanceDivider,
                { backgroundColor: theme.balanceDivider },
              ]}
            />
            <View style={styles.balanceCol}>
              <Text style={[styles.balanceSubLabel, { color: theme.balanceSubLabel }]}>
                Closing Balance
              </Text>
              <Text
                style={[
                  styles.balanceSubValHighlight,
                  { color: theme.balanceHighlight },
                ]}
              >
                ₹{item.closingBalance ?? '0.00'}
              </Text>
            </View>
          </View>
        )}

        <View style={[styles.cardFooter, { borderTopColor: theme.cardFooterBorder }]}>
          <Text
            style={[
              styles.amount,
              { color: isCredit ? theme.amountCredit : theme.amountNormal },
            ]}
          >
            {isCredit ? '+' : '-'}₹{item.txnAmount}
          </Text>
          <Text style={[styles.date, { color: theme.dateColor }]}>
            {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
          </Text>
        </View>
      </View>
    );
  };

  // Mobile / DTH / Bills Renderer
  const renderItem = ({ item }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          ...theme.cardShadow,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.operator, { color: theme.textTitle }]} numberOfLines={1}>
          {item.operatorName || item.provider || 'Recharge / Bill'}
        </Text>
        {renderStatusBadge(item.status)}
      </View>

      {item.number || item.consumerNumber ? (
        <Text style={[styles.number, { color: theme.textSub }]}>
          {item.number || item.consumerNumber}
        </Text>
      ) : null}

      <View style={styles.metaRow}>
        <Text style={[styles.metaLabel, { color: theme.metaLabel }]}>Txn ID: </Text>
        <Text style={[styles.metaValue, { color: theme.metaValue }]} numberOfLines={1}>
          {item.txnId || item.transactionId || 'N/A'}
        </Text>
      </View>

      {item.paidFrom ? (
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: theme.metaLabel }]}>Paid From: </Text>
          <Text style={[styles.metaValue, { color: theme.metaValue }]}>{item.paidFrom}</Text>
        </View>
      ) : null}

      <View style={[styles.cardFooter, { borderTopColor: theme.cardFooterBorder }]}>
        <Text style={[styles.amount, { color: theme.amountNormal }]}>₹{item.amount}</Text>

        <Text style={[styles.date, { color: theme.dateColor }]}>
          {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.headerBg} />

      {/* Top Header with Theme Toggle */}
      <View style={[styles.screenHeader, { backgroundColor: theme.headerBg }]}>
        <TouchableOpacity
          style={[
            styles.headerBtn,
            { backgroundColor: theme.headerBtnBg, borderColor: theme.headerBtnBorder },
          ]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.screenTitle}>Reports & History</Text>

        <TouchableOpacity
          style={[
            styles.headerBtn,
            { backgroundColor: theme.headerBtnBg, borderColor: theme.headerBtnBorder },
          ]}
          onPress={() => setIsDark(!isDark)}
          activeOpacity={0.7}
          accessibilityLabel="Toggle Light/Dark Theme"
        >
          <MaterialIcon
            name={isDark ? 'wb-sunny' : 'nightlight-round'}
            size={20}
            color={isDark ? '#FDE047' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      {/* ----------------- TABS ----------------- */}
      <View
        style={[
          styles.tabContainer,
          {
            backgroundColor: theme.tabContainerBg,
            borderColor: theme.tabContainerBorder,
          },
        ]}
      >
        {[
          { key: 'mobile', label: 'Mobile' },
          { key: 'dth', label: 'DTH' },
          { key: 'bill', label: 'Bills' },
          { key: 'Ledger', label: 'Ledger' },
        ].map(t => {
          const isActive = activeTab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.tab,
                isActive && { backgroundColor: theme.tabActiveBg, elevation: 2 },
              ]}
              onPress={() => {
                setActiveTab(t.key);
                setFilteredList([]);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? theme.tabActiveText : theme.tabInactiveText },
                  isActive && styles.activeTabText,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* FILTER HEADER */}
      <TouchableOpacity
        style={[
          styles.filterHeader,
          {
            backgroundColor: theme.filterHeaderBg,
            borderColor: theme.filterHeaderBorder,
            ...theme.filterHeaderShadow,
          },
        ]}
        onPress={toggleFilter}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcon
            name="filter-list"
            size={20}
            color={theme.filterHeaderColor}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.filterHeaderText, { color: theme.filterHeaderColor }]}>
            Filters
          </Text>
        </View>
        <Icon
          name={isFilterOpen ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={theme.filterHeaderColor}
        />
      </TouchableOpacity>

      {/* FILTER CONTENT */}
      <Animated.View
        style={[
          styles.filterContainer,
          {
            backgroundColor: theme.filterContainerBg,
            borderColor: theme.filterContainerBorder,
            maxHeight: animatedHeight,
            ...theme.filterContainerShadow,
          },
        ]}
      >
        {isFilterOpen && (
          <View>
            {/* Date Filters */}
            <TouchableOpacity
              style={[
                styles.dateBox,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                },
              ]}
              onPress={() => setShowFromPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateText, { color: theme.inputText }]}>
                {fromDate ? new Date(fromDate).toDateString() : 'From Date'}
              </Text>
              <Icon name="calendar-month-outline" size={20} color={theme.inputIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dateBox,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                },
              ]}
              onPress={() => setShowToPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateText, { color: theme.inputText }]}>
                {toDate ? new Date(toDate).toDateString() : 'To Date'}
              </Text>
              <Icon name="calendar-month-outline" size={20} color={theme.inputIcon} />
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

            {/* CREDIT / DEBIT DROPDOWN (ONLY FOR LEDGER) */}
            {activeTab === 'Ledger' && (
              <>
                <TouchableOpacity
                  style={[
                    styles.dropdownBox,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                    },
                  ]}
                  onPress={() => setShowTxnDropdown(!showTxnDropdown)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dropdownText, { color: theme.inputText }]}>
                    {txnType ? txnType.toUpperCase() : 'Select Credit / Debit'}
                  </Text>

                  <Icon
                    name={showTxnDropdown ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color={theme.inputIcon}
                  />
                </TouchableOpacity>

                {showTxnDropdown && (
                  <View
                    style={[
                      styles.dropdownList,
                      {
                        backgroundColor: theme.dropdownListBg,
                        borderColor: theme.dropdownListBorder,
                      },
                    ]}
                  >
                    {txnOptions.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dropdownItem,
                          { borderBottomColor: theme.dropdownItemBorder },
                        ]}
                        onPress={() => {
                          setTxnType(item);
                          setShowTxnDropdown(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, { color: theme.dropdownItemText }]}>
                          {item.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Amount Input */}
            <TextInput
              placeholder="Amount (e.g. 299)"
              placeholderTextColor={theme.inputPlaceholder}
              value={amount}
              keyboardType="numeric"
              onChangeText={setAmount}
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.inputText,
                },
              ]}
            />

            {/* STATUS DROPDOWN (NOT FOR LEDGER) */}
            {activeTab !== 'Ledger' && (
              <>
                <TouchableOpacity
                  style={[
                    styles.dropdownBox,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                    },
                  ]}
                  onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dropdownText, { color: theme.inputText }]}>
                    {status ? status : 'Select Status'}
                  </Text>
                  <Icon
                    name={showStatusDropdown ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color={theme.inputIcon}
                  />
                </TouchableOpacity>

                {showStatusDropdown && (
                  <View
                    style={[
                      styles.dropdownList,
                      {
                        backgroundColor: theme.dropdownListBg,
                        borderColor: theme.dropdownListBorder,
                      },
                    ]}
                  >
                    {statusOptions.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dropdownItem,
                          { borderBottomColor: theme.dropdownItemBorder },
                        ]}
                        onPress={() => {
                          setStatus(item);
                          setShowStatusDropdown(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, { color: theme.dropdownItemText }]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* PROVIDER DROPDOWN */}
            {activeTab !== 'Ledger' && (
              <>
                <TouchableOpacity
                  style={[
                    styles.dropdownBox,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                    },
                  ]}
                  onPress={() => setShowProviderDropdown(!showProviderDropdown)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dropdownText, { color: theme.inputText }]}>
                    {provider ? provider : 'Select Provider'}
                  </Text>

                  <Icon
                    name={showProviderDropdown ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color={theme.inputIcon}
                  />
                </TouchableOpacity>

                {showProviderDropdown && (
                  <View
                    style={[
                      styles.dropdownList,
                      {
                        backgroundColor: theme.dropdownListBg,
                        borderColor: theme.dropdownListBorder,
                      },
                    ]}
                  >
                    {providerOptions.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dropdownItem,
                          { borderBottomColor: theme.dropdownItemBorder },
                        ]}
                        onPress={() => {
                          setProvider(item);
                          setShowProviderDropdown(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, { color: theme.dropdownItemText }]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Apply / Reset Buttons */}
            <TouchableOpacity
              style={[
                styles.fetchBtn,
                {
                  backgroundColor: theme.btnApplyBg,
                  shadowColor: theme.btnApplyBg,
                },
              ]}
              onPress={applyFilter}
              activeOpacity={0.85}
            >
              <Text style={[styles.fetchBtnText, { color: theme.btnApplyText }]}>
                Apply Filters
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.resetBtn,
                {
                  backgroundColor: theme.btnResetBg,
                  borderColor: theme.btnResetBorder,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => {
                setFilteredList([]);
                setAmount('');
                setTxnType('');
                setStatus('');
                setFromDate(null);
                setToDate(null);
              }}
            >
              <Text style={[styles.resetBtnText, { color: theme.btnResetText }]}>
                Reset Filters
              </Text>
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
            color={theme.emptyIcon}
          />

          <Text style={[styles.emptyTitle, { color: theme.emptyTitle }]}>No Data Found</Text>

          <Text style={[styles.emptySubtitle, { color: theme.emptySubtitle }]}>
            There are no records to display for this category.
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={(item, index) => String(index)}
          renderItem={activeTab === 'Ledger' ? renderLedgerItem : renderItem}
          contentContainerStyle={{ paddingBottom: 30, paddingTop: 6 }}
          showsVerticalScrollIndicator={false}
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

// ===================== BASE STYLES ======================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenHeader: {
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.2,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    marginHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeTabText: {
    fontWeight: '800',
  },

  filterHeader: {
    marginTop: 6,
    marginHorizontal: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  filterHeaderText: {
    fontSize: 15,
    fontWeight: '700',
  },

  filterContainer: {
    overflow: 'hidden',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingBottom: 14,
    marginHorizontal: 14,
    marginTop: 6,
    borderWidth: 1,
  },

  dateBox: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontWeight: '600',
    fontSize: 14,
  },

  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
  },

  fetchBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fetchBtnText: {
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.3,
  },

  resetBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1,
  },
  resetBtnText: {
    fontWeight: '700',
    fontSize: 15,
  },

  dropdownBox: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 14,
    marginTop: 6,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
  },

  /* EMPTY STATE */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '800',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
  },

  /* REPORT CARD */
  card: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    marginHorizontal: 14,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  operator: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
    letterSpacing: 0.2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  number: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 12.5,
    fontWeight: '700',
    flexShrink: 1,
  },

  /* LEDGER BALANCE BOX */
  balanceInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 8,
    borderWidth: 1,
  },
  balanceCol: {
    flex: 1,
  },
  balanceDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 10,
  },
  balanceSubLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  balanceSubVal: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  balanceSubValHighlight: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },

  /* CARD FOOTER */
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 8,
  },
  amount: {
    fontSize: 20,
    fontWeight: '900',
  },
  date: {
    fontSize: 12,
    textAlign: 'right',
    maxWidth: '65%',
    fontWeight: '600',
  },
});
