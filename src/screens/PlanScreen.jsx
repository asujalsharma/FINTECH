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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getData } from '../API';

const BLUE = '#122536ff';

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

    if (response.Error) {
      Alert.alert('Error Fetching Plans: Invalid Number !');
    }

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
          <Text style={styles.price}>₹{item.rs}</Text>
          <Text style={styles.validity}>{item.validity}</Text>
        </View>

        <View style={{ marginTop: 6 }}>
          {details.map((line, i) => (
            <Text key={i} style={styles.descLine}>
              • {line}
            </Text>
          ))}
        </View>

        <View style={styles.rechargeBtn}>
          <Text style={styles.rechargeText}>Recharge</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ---------------- Header ---------------- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={{
              uri:
                'https://api.charlie.techember.in' +
                (currentOperator?.icon || OperatorProfile),
            }}
            style={styles.operatorIcon}
          />
          <View>
            <Text style={styles.phoneNumber}>{currentOperator?.Mobile}</Text>
            <Text style={styles.operatorName}>{currentOperator?.Circle}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            setShowModal(true);
            fetchOperators();
          }}
        >
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Wrapper */}
      <View style={styles.contentWrapper}>
        {/* Search Box */}
        <View style={styles.searchBox}>
          <Icon name="search" size={20} color="#555" />
          <TextInput
            style={styles.input}
            placeholder="Search by Price (e.g. 299 or 300-400)"
            value={searchPrice}
            onChangeText={setSearchPrice}
            keyboardType="number-pad"
          />
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
                  <Text>{op.name}</Text>
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
                      <Text>{c.name}</Text>
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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center' },
  operatorIcon: { width: 32, height: 32, borderRadius: 6, marginRight: 8 },
  phoneNumber: { color: '#fff', fontSize: 16, fontWeight: '700' },
  operatorName: { color: '#d9e1ff', fontSize: 12 },
  changeText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  /* SEARCH */
  searchBox: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    marginLeft: 8,
    flex: 1,
    fontSize: 15,
    color: '#111',
  },

  /* CONTENT WRAPPER */
  contentWrapper: {
    flex: 1,
    flexDirection: 'column',
  },

  /* TABS CONTAINER */
  tabsContainer: {
    height: 50,
    marginVertical: 12,
    paddingHorizontal: 0,
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'center',
  },

  /* TABS */
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 20,
    backgroundColor: '#fff',
    minHeight: 36,
    maxHeight: 36,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16,
    includeFontPadding: false,
  },
  activeTab: {
    backgroundColor: BLUE,
    borderColor: BLUE,
    shadowColor: '#10306b',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
  },

  /* LIST */
  listContent: {
    paddingTop: 0,
    paddingBottom: 60,
    paddingHorizontal: 0,
  },

  /* CARD */
  card: {
    marginHorizontal: 16,
    marginTop: 1,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  price: { fontSize: 24, fontWeight: '800', color: '#000' },
  validity: {
    fontSize: 12,
    fontWeight: '600',
    color: BLUE,
    backgroundColor: '#E7F1FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  dataText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    color: '#111',
  },
  descLine: {
    fontSize: 13,
    color: '#444',
    marginVertical: 3,
    lineHeight: 18,
  },
  rechargeBtn: {
    paddingVertical: 12,
    backgroundColor: BLUE,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  rechargeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },

  modalList: {
    maxHeight: 150,
    marginBottom: 10,
  },

  modalItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 6,
  },

  modalSelected: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },

  applyBtn: {
    backgroundColor: BLUE,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  applyText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },

  closeModal: {
    backgroundColor: '#000',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
});
