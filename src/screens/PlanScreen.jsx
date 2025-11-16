import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getData } from '../API';

const BLUE = '#10306b';

const PlanScreen = ({ route }) => {
  const navigation = useNavigation();
  const { operatorDetail } = route.params;

  const [searchPrice, setSearchPrice] = useState('');
  const [groupedplan, setGroupedPlan] = useState({});
  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('');
  const [OperatorProfile, setOperatorProfile] = useState('');

  /* ---------------- Helper ------------------ */
  const groupByType = data =>
    data.reduce((groups, item) => {
      const type = item.Type || 'Others';
      groups[type] = groups[type] || [];
      groups[type].push(item);
      return groups;
    }, {});

  const parseDesc = (desc = '') => {
    const data = {};
    desc.split('|').forEach(p => {
      const [k, v] = p.split(':');
      if (k && v) data[k.trim()] = v.trim();
    });
    return data;
  };

  /* ---------------- Fetch Plans ------------------ */
  const GetOperatorPlans = async () => {
    const response = await getData(
      `api/cyrus/plan_fetch?Operator_Code=${operatorDetail?.OpCode}&Circle_Code=${operatorDetail?.CircleCode}&MobileNumber=${operatorDetail?.Mobile}`,
    );
    setOperatorProfile(response.image);
    if (response?.Status) {
      const grouped = groupByType(response.Data);
      const names = Object.keys(grouped);
      setGroupedPlan(grouped);
      setTabs(names);
      setSelectedTab(names[0]);
    }
  };

  useEffect(() => {
    GetOperatorPlans();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      GetOperatorPlans();
    }, []),
  );

  const getAllPlans = () => {
    return Object.values(groupedplan).flat();
  };

  const filteredPlans = (
    searchPrice ? getAllPlans() : groupedplan?.[selectedTab] || []
  )
    .filter(item => {
      if (!searchPrice) return true;

      const actualPrice = Number(item.rs?.replace(/[^0-9]/g, ''));
      const value = searchPrice.trim().replace(/[^0-9-]/g, '');

      // Range case: 300-400
      if (value.includes('-')) {
        const [min, max] = value.split('-').map(Number);
        return actualPrice >= min && actualPrice <= max;
      }

      // Normal: 299
      return actualPrice.toString().includes(value);
    })
    .sort((a, b) => {
      const priceA = Number(a.rs?.replace(/[^0-9]/g, ''));
      const priceB = Number(b.rs?.replace(/[^0-9]/g, ''));
      return priceA - priceB; // ASCENDING
    });

  /* ---------------- Navigation ------------------ */
  const goToPay = item => {
    navigation.navigate('PaymentConfirmation', {
      rechargeData: item,
      operatorDetail,
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

        {details?.Data && <Text style={styles.dataText}>{details?.Data}</Text>}

        <View style={{ marginTop: 6 }}>
          {Object.keys(details).map((k, i) => {
            if (k === 'Data') return null;
            return (
              <Text key={i} style={styles.descLine}>
                • {details[k]}
              </Text>
            );
          })}
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
              uri: 'https://api.new.techember.in/' + OperatorProfile,
            }}
            style={styles.operatorIcon}
          />
          <View>
            <Text style={styles.phoneNumber}>{operatorDetail?.Mobile}</Text>
            <Text style={styles.operatorName}>{operatorDetail?.Circle}</Text>
          </View>
        </View>

        <TouchableOpacity>
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
            placeholderTextColor={'#3c3838ff'}
            value={searchPrice}
            onChangeText={setSearchPrice}
            keyboardType="number-pad"
          />
        </View>

        {/* Tabs - Fixed Height */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}
            scrollEventThrottle={16}
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
                  numberOfLines={1}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* List - Flexible */}
        <FlatList
          data={filteredPlans}
          renderItem={renderPlan}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      </View>
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
});
