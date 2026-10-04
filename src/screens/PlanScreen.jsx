import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getData, API_BASE_URL } from '../API';
import Footer from '../components/Footer';

const BLUE = '#092B88';


const PlanScreen = ({ route }) => {
  const navigation = useNavigation();
  const { operatorDetail, ServiceId } = route.params;

  const [searchPrice, setSearchPrice] = useState('');
  const [groupedplan, setGroupedPlan] = useState({});
  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('');
  const [OperatorProfile, setOperatorProfile] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [operators, setOperators] = useState([]);
  const [circles, setCircles] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [selectedCircle, setSelectedCircle] = useState(null);

  // 🔥 Store operator details here
  const [currentOperator, setCurrentOperator] = useState(operatorDetail);

  /* ---------------- Helper ------------------ */

  const getPrice = item => {
    if (!item?.rs) return 0;
    return Number(String(item.rs).replace(/[^0-9]/g, '')) || 0;
  };

  const groupByType = data =>
    data.reduce((groups, item) => {
      const type = item.Type || 'Others';
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
      return groups;
    }, {});

  const parseDesc = (desc = '') => {
    if (!desc) return [];
    return desc
      .replace(/\n+/g, ' ')
      .replace(/\|/g, '#')
      .replace(/,/g, '#')
      .replace(/;/g, '#')
      .replace(/\+\s?/g, '#')
      .replace(/ and /gi, '#')
      .replace(/\s+/g, ' ')
      .split('#')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  };

  console.log('Current Operator:', currentOperator);

  /* ---------------- Fetch Plans (ONLY ONCE) ------------------ */
  const GetOperatorPlans = async () => {
    const response = await getData(
      `api/cyrus/plan_fetch?Operator_Code=${currentOperator?.OpCode}&Circle_Code=${currentOperator?.CircleCode}&MobileNumber=${currentOperator?.Mobile}`,
    );

    setOperatorProfile('/' + response.image);

    if (response?.Status) {
      const grouped = groupByType(response.Data);
      const names = Object.keys(grouped);
      setGroupedPlan(grouped);
      setTabs(names);
      setSelectedTab(names[0]);
    }
  };

  /* ONLY RUN ON FIRST LOAD */
  useEffect(() => {
    GetOperatorPlans();
  }, []);

  /* ---------------- Fetch Operators For Modal ------------------ */
  const fetchOperators = async () => {
    try {
      const res = await getData('api/cyrus/get_circle_operators');
      if (res?.Data) {
        setOperators(res.Data.operators);
        setCircles(res.Data.circles);
      }
    } catch (e) {
      console.log('Error fetching operators', e);
    }
  };

  /* ---------------- APPLY OPERATOR CHANGE (DO NOT FETCH PLANS) ------------------ */
  const applyOperatorChange = () => {
    if (!selectedOperator || !selectedCircle) return;

    const updated = {
      ...currentOperator,
      OpCode: selectedOperator.operatorCode,
      CircleCode: selectedCircle.circleCode,
      Circle: selectedCircle.name,
      icon: selectedOperator.icon,
    };

    setCurrentOperator(updated);
    setOperatorProfile(selectedOperator.icon);
    setShowModal(false);

    // ❌ NO PLAN FETCH HERE
  };

  /* ---------------- FILTERED PLANS ------------------ */
  const getAllPlans = () => Object.values(groupedplan).flat();

  const filteredPlans = (
    searchPrice ? getAllPlans() : groupedplan?.[selectedTab] || []
  )
    .filter(item => {
      if (!searchPrice) return true;

      const actualPrice = getPrice(item);
      const value = searchPrice.trim().replace(/[^0-9-]/g, '');

      if (value.includes('-')) {
        const [min, max] = value.split('-').map(Number);
        return actualPrice >= min && actualPrice <= max;
      }

      return actualPrice.toString().includes(value);
    })
    .sort((a, b) => getPrice(a) - getPrice(b));

  /* ---------------- Navigation ------------------ */
  const goToPay = item => {
    navigation.navigate('PaymentConfirmation', {
      rechargeData: item,
      operatorDetail: { ...currentOperator, ServiceId: ServiceId },
      isPrePaid: true,
    });
  };

  /* ---------------- Render Plan Cards ------------------ */
  const renderPlan = ({ item }) => {
    const details = parseDesc(item.desc);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => goToPay(item)}
      >
        <View style={styles.rowSpace}>
          <View style={styles.priceWrap}>
            <Text style={styles.currency}>₹</Text>
            <Text style={styles.price}>{item.rs}</Text>
          </View>
          <View style={styles.validityBadge}>
            <Icon name="time-outline" size={14} color="#092B88" style={{ marginRight: 4 }} />
            <Text style={styles.validity}>{item.validity}</Text>
          </View>
        </View>

        <View style={styles.descContainer}>
          {details.map((line, i) => (
            <View key={i} style={styles.descRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.descLine}>{line}</Text>
            </View>
          ))}
        </View>

        <View style={styles.rechargeBtn}>
          <Text style={styles.rechargeText}>SELECT PLAN</Text>
          <Icon name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 6 }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FF" />

      {/* ---------------- Header ---------------- */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color="#1741B5" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={{
              uri:
                API_BASE_URL +
                (currentOperator?.icon || OperatorProfile),
            }}
            style={styles.operatorIcon}
          />
          <View>
            <Text style={styles.phoneNumber}>+91 {currentOperator?.Mobile}</Text>
            <Text style={styles.operatorName}>
              {currentOperator?.Operator || 'Prepaid'} • {currentOperator?.Circle}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            setShowModal(true);
            fetchOperators();
          }}
          style={styles.changePill}
          activeOpacity={0.8}
        >
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Wrapper */}
      <View style={styles.contentWrapper}>
        {/* Search Box */}
        <View style={styles.searchBox}>
          <Icon name="search-outline" size={20} color="#7582A0" />
          <TextInput
            style={styles.input}
            placeholder="Search price (e.g. 299, 599)..."
            placeholderTextColor="#8792AC"
            value={searchPrice}
            onChangeText={setSearchPrice}
            keyboardType="number-pad"
          />
          {searchPrice.length > 0 && (
            <TouchableOpacity onPress={() => setSearchPrice('')}>
              <Icon name="close-circle" size={18} color="#7582A0" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}
          >
            {tabs.map((t, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedTab(t)}
                activeOpacity={0.7}
                style={[styles.tab, selectedTab === t && styles.activeTab]}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === t && styles.activeTabText,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* List */}
        <FlatList
          data={filteredPlans}
          renderItem={renderPlan}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={{ marginTop: 16 }}>
              <Footer />
            </View>
          }
        />
      </View>


      {/* ---------------- Modal ---------------- */}
      {showModal && (
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Change Operator</Text>

            <Text style={styles.modalLabel}>Select Operator</Text>
            <ScrollView style={styles.modalList}>
              {operators.map((op, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedOperator(op)}
                  style={[
                    styles.modalItem,
                    selectedOperator?.operatorCode === op.operatorCode &&
                    styles.modalSelected,
                  ]}
                >
                  <Text style={styles.modalItemText}>{op.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedOperator && (
              <>
                <Text style={[styles.modalLabel, { marginTop: 10 }]}>
                  Select Circle
                </Text>
                <ScrollView style={styles.modalList}>
                  {circles.map((c, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setSelectedCircle(c)}
                      style={[
                        styles.modalItem,
                        selectedCircle?.circleCode === c.circleCode &&
                        styles.modalSelected,
                      ]}
                    >
                      <Text style={styles.modalItemText}>{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <TouchableOpacity
              onPress={applyOperatorChange}
              style={styles.applyBtn}
            >
              <Text style={styles.applyText}>APPLY</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setShowModal(false)}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default PlanScreen;

/* ---------------- Styles ---------------- */
const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#092B88',
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#092B88',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 12,
  },
  operatorIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 10,
  },
  phoneNumber: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  operatorName: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    marginTop: 1,
    fontWeight: '500',
  },
  changePill: {
    backgroundColor: 'rgba(75, 158, 255, 0.20)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.35)',
  },
  changeText: {
    color: '#2454D1',
    fontSize: 12,
    fontWeight: '700',
  },

  /* CONTENT WRAPPER */
  contentWrapper: {
    flex: 1,
  },

  /* SEARCH */
  searchBox: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.35)',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  /* TABS */
  tabsContainer: {
    height: 52,
    marginVertical: 10,
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    minHeight: 38,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  tabText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '700',
  },
  activeTab: {
    backgroundColor: '#2454D1',
    borderColor: '#2454D1',
    elevation: 4,
    shadowColor: '#2454D1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: '800',
  },

  /* LIST */
  listContent: {
    paddingBottom: 40,
  },

  /* PLAN CARD */
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 18,
  },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2454D1',
    marginRight: 2,
  },
  price: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  validityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(75,158,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.30)',
  },
  validity: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2454D1',
  },

  descContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2454D1',
    marginRight: 8,
  },
  descLine: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.90)',
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },

  rechargeBtn: {
    height: 48,
    backgroundColor: '#2454D1',
    borderRadius: 14,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#2454D1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.50,
    shadowRadius: 10,
  },
  rechargeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },

  /* MODAL */
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(4, 14, 45, 0.80)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#123DB8',
    padding: 22,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.80)',
    marginBottom: 8,
  },
  modalList: {
    maxHeight: 160,
    marginBottom: 12,
  },
  modalItem: {
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  modalItemText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSelected: {
    backgroundColor: '#2454D1',
    borderColor: '#2454D1',
  },
  applyBtn: {
    backgroundColor: '#2454D1',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    elevation: 6,
    shadowColor: '#2454D1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.50,
    shadowRadius: 10,
  },
  applyText: {
    fontSize: 15,
    color: '#FFF',
    fontWeight: '800',
  },
  closeModal: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
});

const styles = {
  ...baseStyles,
  ...StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7FF' },
    header: { flexDirection: 'row', paddingTop: Platform.OS === 'ios' ? 12 : 16, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: '#F4F7FF', alignItems: 'center', justifyContent: 'space-between' },
    backButton: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E9F8', alignItems: 'center', justifyContent: 'center' },
    operatorIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#EEF2FF', marginRight: 10 },
    phoneNumber: { color: '#18264D', fontSize: 15, fontWeight: '800' },
    operatorName: { color: '#7582A0', fontSize: 12, marginTop: 2, fontWeight: '500' },
    changePill: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, borderWidth: 1, borderColor: '#DCE5FF' },
    changeText: { color: '#1741B5', fontSize: 12, fontWeight: '700' },
    searchBox: { marginTop: 8, marginHorizontal: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E9F8', borderRadius: 14, paddingHorizontal: 14, height: 48, flexDirection: 'row', alignItems: 'center' },
    input: { marginLeft: 8, flex: 1, fontSize: 14, color: '#24345E', fontWeight: '600' },
    tab: { paddingVertical: 8, paddingHorizontal: 16, marginRight: 8, borderWidth: 1, borderColor: '#E2E9F8', borderRadius: 12, backgroundColor: '#FFFFFF', minHeight: 38, justifyContent: 'center', alignSelf: 'center' },
    tabText: { color: '#637298', fontSize: 13, fontWeight: '700' },
    activeTab: { backgroundColor: '#1741B5', borderColor: '#1741B5', elevation: 2 },
    card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#FFFFFF', borderRadius: 19, borderWidth: 1, borderColor: '#E5EAF7', padding: 17 },
    currency: { fontSize: 18, fontWeight: '800', color: '#1741B5', marginRight: 2 },
    price: { fontSize: 27, fontWeight: '800', color: '#18264D' },
    validityBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 11, borderWidth: 0 },
    validity: { fontSize: 12, fontWeight: '700', color: '#1741B5' },
    descContainer: { marginTop: 11, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EEF1F8' },
    descLine: { fontSize: 13, color: '#5E6D8F', fontWeight: '500', flex: 1, lineHeight: 18 },
    rechargeBtn: { height: 46, backgroundColor: '#1741B5', borderRadius: 13, marginTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#1741B5', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 7 },
    modalContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, backgroundColor: 'rgba(14, 28, 67, 0.35)', justifyContent: 'flex-end' },
    modalBox: { backgroundColor: '#FFFFFF', padding: 22, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', borderWidth: 1, borderColor: '#E5EAF7' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#18264D', marginBottom: 14 },
    modalLabel: { fontSize: 13, fontWeight: '700', color: '#536487', marginBottom: 8 },
    modalItem: { padding: 14, borderWidth: 1, borderColor: '#E5EAF7', borderRadius: 13, marginBottom: 8, backgroundColor: '#F8FAFF' },
    modalItemText: { color: '#24345E', fontSize: 14, fontWeight: '600' },
    modalSelected: { backgroundColor: '#EEF2FF', borderColor: '#1741B5' },
    closeModal: { backgroundColor: '#F4F7FF', height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 13, marginTop: 8, borderWidth: 1, borderColor: '#E5EAF7' },
  }),
};
