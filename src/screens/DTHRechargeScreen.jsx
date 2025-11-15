import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getData } from '../API';
import { TabView, TabBar } from 'react-native-tab-view';

const BLUE = '#10306b';

export default function DTHRechargeScreen() {
  const navigation = useNavigation();

  const [customerID, setCustomerID] = useState('');
  const [amount, setAmount] = useState('');
  const [operator, setOperator] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [SelectedPlan, setSelectedPlan] = useState({});

  // Tab States
  const layout = Dimensions.get('window');
  const [tabIndex, setTabIndex] = useState(0);
  const [tabRoutes, setTabRoutes] = useState([]);
  const [mode, setMode] = useState('language'); // language | month

  // ------------------------------------------
  // GROUPING FUNCTIONS
  // ------------------------------------------

  const groupByLanguage = plans => {
    const result = {};

    plans.forEach(plan => {
      const lang = plan.language?.trim();
      if (!result[lang]) result[lang] = [];
      result[lang].push(plan);
    });

    return result;
  };

  const groupByMonth = plans => {
    const result = {
      '1 Month': [],
      '3 Months': [],
      '6 Months': [],
      '12 Months': [],
    };

    plans.forEach(plan => {
      const month = plan.month?.toLowerCase();
      if (month.includes('1 month')) result['1 Month'].push(plan);
      else if (month.includes('3')) result['3 Months'].push(plan);
      else if (month.includes('6')) result['6 Months'].push(plan);
      else if (month.includes('12')) result['12 Months'].push(plan);
    });

    return result;
  };

  // ------------------------------------------
  // FETCH PLANS
  // ------------------------------------------

  const fetchPlans = async opCode => {
    try {
      setLoadingPlans(true);

      const res = await getData(
        `http://api.new.techember.in/api/cyrus/fetch_dth_plans`,
      );

      if (res?.Data) {
        setPlans(res.Data.plans);

        // Build tabs based on selected mode
        const langs = Object.keys(groupByLanguage(res.Data.plans));
        const months = Object.keys(groupByMonth(res.Data.plans));

        setTabRoutes(
          (mode === 'language' ? langs : months).map(key => ({
            key,
            title: key,
          })),
        );
      } else {
        Alert.alert('No plans found');
        setPlans([]);
      }
    } catch (err) {
      Alert.alert('Failed to fetch plans', err);
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  // ------------------------------------------
  // VERIFY
  // ------------------------------------------

  const handleVerify = async () => {
    if (!customerID) return Alert.alert('Please enter customer ID');

    try {
      setVerifying(true);

      const res = await getData(
        `/api/cyrus/fetch_dth_operator?dthNumber=${customerID}`,
      );
      console.log(res);

      if (res?.Data?.DthName) {
        setOperator(res.Data);

        // Fetch plans for Sundirect
        if (res.Data.DthName?.toUpperCase() === 'SUN DIRECT') {
          fetchPlans(res.Data.DthOpCode);
        }
      } else {
        Alert.alert('No Operator Found');
        setOperator(null);
      }
    } catch (err) {
      Alert.alert('Failed to verify');
      setOperator(null);
    } finally {
      setVerifying(false);
    }
  };

  // ------------------------------------------
  // PROCEED
  // ------------------------------------------

  const handleProceed = () => {
    if (!operator) return Alert.alert('Verify Customer ID');
    if (!customerID) return Alert.alert('Enter valid Customer ID');
    if (!amount) return Alert.alert('Enter amount');

    navigation.navigate('PaymentConfirmation', {
      rechargeData: { amount, customerID },
      operatorDetail: operator,
      isPrePaid: false,
      from: 'DTH',
    });
  };

  // ------------------------------------------
  // TAB SCENE RENDERER
  // ------------------------------------------

  const renderScene = ({ route }) => {
    let data = [];

    if (mode === 'language') {
      const langData = groupByLanguage(plans);
      data = langData[route.key] || [];
    } else {
      const monthData = groupByMonth(plans);
      data = monthData[route.key] || [];
    }

    return (
      <ScrollView style={{ paddingHorizontal: 20 }}>
        {data.map((p, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              setAmount(String(p.amount));
              setSelectedPlan(p);
            }}
            style={styles.planCard}
          >
            <Text style={styles.planTitle}>{p.planName}</Text>
            <Text>Price: ₹{p.amount}</Text>
            <Text>Validity: {p.month}</Text>
            <Text>Language: {p.language}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // ------------------------------------------
  // UI
  // ------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon
          name="arrow-back"
          size={22}
          color="#fff"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.title}>DTH Recharge</Text>
        <Text></Text>
      </View>

      {/* Customer ID + VERIFY */}
      <View style={styles.inputWrapper}>
        <View style={styles.blueShadowLarge} />
        <View style={styles.blueShadowSmall} />

        <View style={[styles.inputContainer, { paddingRight: 6 }]}>
          <Text style={styles.prefix}>ID</Text>
          <TextInput
            style={[styles.input, { fontWeight: '600' }]}
            placeholder="Customer ID"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={customerID}
            onChangeText={setCustomerID}
          />

          <TouchableOpacity
            style={styles.verifyBtn}
            onPress={handleVerify}
            disabled={verifying}
          >
            {verifying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.verifyText}>VERIFY</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Operator Name */}
      {operator?.DthName && (
        <Text style={styles.operatorLabel}>Operator: {operator.DthName}</Text>
      )}

      {/* Amount */}
      <View style={styles.inputWrapper}>
        <View style={styles.blueShadowLarge} />
        <View style={styles.blueShadowSmall} />
        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>Rs.</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Amount"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>
      </View>

      {/* Loading */}
      {loadingPlans && (
        <ActivityIndicator
          color={BLUE}
          size="small"
          style={{ marginTop: 10 }}
        />
      )}

      {/* Selected Plan */}
      {SelectedPlan.planName && (
        <View style={styles.selectedCard}>
          <Text style={styles.planTitle}>{SelectedPlan.planName}</Text>
          <Text>Price: ₹{SelectedPlan.amount}</Text>
          <Text>Validity: {SelectedPlan.month}</Text>
          <Text>Language: {SelectedPlan.language}</Text>
          <Text>Channels: {SelectedPlan.channels}</Text>
          <Text>PaidChannels: {SelectedPlan.paidChannels}</Text>
          <Text>HDChannels: {SelectedPlan.hdChannels}</Text>
        </View>
      )}

      {/* TABS */}
      {plans?.length > 0 && (
        <>
          {/* Toggle */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              onPress={() => {
                setMode('language');
                const langs = Object.keys(groupByLanguage(plans));
                setTabRoutes(langs.map(key => ({ key, title: key })));
                setTabIndex(0);
              }}
              style={[
                styles.toggleBtn,
                { backgroundColor: mode === 'language' ? BLUE : '#eee' },
              ]}
            >
              <Text
                style={{
                  color: mode === 'language' ? '#fff' : '#000',
                  fontWeight: '700',
                  textAlign: 'center',
                }}
              >
                Language
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMode('month');
                const months = Object.keys(groupByMonth(plans));
                setTabRoutes(months.map(key => ({ key, title: key })));
                setTabIndex(0);
              }}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: mode === 'month' ? BLUE : '#eee',
                },
              ]}
            >
              <Text
                style={{
                  color: mode === 'month' ? '#fff' : '#000',
                  fontWeight: '700',
                  textAlign: 'center',
                }}
              >
                Month
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB VIEW */}
          <View style={{ height: 350, marginTop: 20 }}>
            <TabView
              navigationState={{ index: tabIndex, routes: tabRoutes }}
              renderScene={renderScene}
              onIndexChange={setTabIndex}
              initialLayout={{ width: layout.width }}
              renderTabBar={props => (
                <TabBar
                  {...props}
                  scrollEnabled
                  style={{ backgroundColor: '#fff' }}
                  indicatorStyle={{ backgroundColor: BLUE, height: 3 }}
                  activeColor={BLUE}
                  inactiveColor="#444"
                  labelStyle={{ fontSize: 13, fontWeight: '600' }}
                />
              )}
            />
          </View>
        </>
      )}

      {/* PROCEED */}
      <TouchableOpacity style={styles.button} onPress={handleProceed}>
        <Text style={styles.buttonText}>PROCEED</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ------------------------------------------
// STYLES
// ------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: BLUE,
    paddingVertical: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: { fontSize: 24, fontWeight: '600', color: '#fff', marginTop: 6 },

  inputWrapper: {
    marginTop: 20,
    marginHorizontal: 20,
    position: 'relative',
    height: 60,
  },

  blueShadowLarge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: BLUE,
    opacity: 0.12,
  },

  blueShadowSmall: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: BLUE,
    opacity: 0.08,
  },

  inputContainer: {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.8,
    borderColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  prefix: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    color: '#000',
  },

  input: { flex: 1, fontSize: 16, color: '#000', fontWeight: 'bold' },

  verifyBtn: {
    backgroundColor: BLUE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  verifyText: { color: '#fff', fontWeight: '600', fontSize: 12 },

  operatorLabel: {
    marginLeft: 20,
    marginTop: 5,
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },

  planCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  planTitle: { fontWeight: '700', fontSize: 16, marginBottom: 4 },

  selectedCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 10,
  },

  toggleRow: {
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 20,
  },

  toggleBtn: {
    flex: 1,
    padding: 12,
  },

  button: {
    backgroundColor: BLUE,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },

  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
