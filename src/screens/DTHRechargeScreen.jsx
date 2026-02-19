// -----------------------------------------------------
// DTH RECHARGE SCREEN — SAME UI, ADDED LANGUAGE→MONTH FILTER
// -----------------------------------------------------

import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getData } from '../API';
import { useRoute } from '@react-navigation/native';

import COLORS from '../constants/colors';

export default function DTHRechargeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { ServiceId } = route.params || {};
  const [customerID, setCustomerID] = useState('');
  const [amount, setAmount] = useState('');
  const [operator, setOperator] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [SelectedPlan, setSelectedPlan] = useState({});
  const [lastRecharges, setLastRecharges] = useState([]);

  // NEW STATES
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  // ----------------------------------------------------------
  // HELPERS
  // ----------------------------------------------------------

  const getLanguages = () => {
    const setLang = new Set();
    plans.forEach(p => p.language && setLang.add(p.language.trim()));
    return [...setLang];
  };

  const getMonthsForLanguage = lang => {
    const setMonths = new Set();
    plans
      .filter(p => p.language === lang)
      .forEach(p => p.month && setMonths.add(p.month.trim()));
    return [...setMonths];
  };

  const getFilteredPlans = () => {
    return plans.filter(
      p =>
        (!selectedLanguage || p.language === selectedLanguage) &&
        (!selectedMonth || p.month === selectedMonth),
    );
  };

  // ----------------------------------------------------------
  // FETCH PLANS
  // ----------------------------------------------------------

  const fetchPlans = async opCode => {
    try {
      setLoadingPlans(true);

      const res = await getData(`api/cyrus/fetch_dth_plans`);

      if (res?.Data?.plans) {
        setPlans(res.Data.plans);
      } else {
        Alert.alert('No plans found');
        setPlans([]);
      }
    } catch (err) {
      Alert.alert('Failed to fetch plans');
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchLastRecharge = async () => {
    try {
      const res = await getData('api/cyrus/last-recharge?type=DTH');
      console.log(res);
      if (res.Status && Array.isArray(res.Data)) {
        setLastRecharges(res.Data);
      } else {
        setLastRecharges([]);
      }
    } catch (err) {
      console.log(err);
      setLastRecharges([]);
    }
  };

  useEffect(() => {
    fetchLastRecharge();
  }, []);

  // ----------------------------------------------------------
  // VERIFY
  // ----------------------------------------------------------

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

        // Fetch plans for SUN DIRECT only
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

  // ----------------------------------------------------------
  // PROCEED
  // ----------------------------------------------------------

  const handleProceed = () => {
    if (!operator) return Alert.alert('Verify Customer ID');
    if (!customerID) return Alert.alert('Enter valid Customer ID');
    if (!amount) return Alert.alert('Enter amount');

    navigation.navigate('PaymentConfirmation', {
      rechargeData: { amount, customerID },
      operatorDetail: { ...operator, ServiceId: ServiceId },
      isPrePaid: false,
      from: 'DTH',
    });
  };

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

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

      {/* Customer ID */}
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

      {/* Operator */}
      {operator?.DthName && (
        <>
          <Text style={styles.operatorLabel}>Operator: {operator.DthName}</Text>
          <Text style={styles.operatorLabel}>USER: {operator.userName}</Text>
        </>
      )}

      {/* ------------------ LAST DTH RECHARGES ------------------ */}
      {lastRecharges.length > 0 && plans.length === 0 && (
        <View style={styles.lastRechargeBox}>
          <Text style={styles.lastRechargeTitle}>Last DTH Recharges</Text>

          {lastRecharges.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.lastRechargeItem}
              onPress={() => {
                setCustomerID(item.number); // Auto-fill Customer ID
                if (item.Amount) setAmount(String(item.amount));
              }}
            >
              <View>
                <Text style={styles.lastRechargeNumber}>{item.number}</Text>
                {item.createdAt && (
                  <Text style={styles.lastRechargeDate}>
                    {item.createdAt.slice(0, 10)}
                  </Text>
                )}
              </View>

              <Text style={styles.lastRechargeAmount}>₹ {item.amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
          color={COLORS.primary}
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
        </View>
      )}

      {/* ------------------ LANGUAGE TOGGLE ------------------ */}
      {/* ------------------ LANGUAGE TOGGLE ------------------ */}
      {plans.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {getLanguages().map((lang, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setSelectedLanguage(lang);
                  setSelectedMonth('');
                }}
                style={[
                  styles.toggleBtn,
                  {
                    backgroundColor: selectedLanguage === lang ? COLORS.primary : '#eee',
                    marginRight: 10,
                    minWidth: 100,
                  },
                ]}
              >
                <Text
                  style={{
                    color: selectedLanguage === lang ? '#fff' : '#000',
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ------------------ MONTH TOGGLE ------------------ */}
      {/* ------------------ MONTH TOGGLE ------------------ */}
      {selectedLanguage !== '' && (
        <View style={{ marginTop: 20 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {getMonthsForLanguage(selectedLanguage).map((m, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedMonth(m)}
                style={[
                  styles.toggleBtn,
                  {
                    backgroundColor: selectedMonth === m ? COLORS.primary : '#eee',
                    marginRight: 10,
                    minWidth: 110,
                  },
                ]}
              >
                <Text
                  style={{
                    color: selectedMonth === m ? '#fff' : '#000',
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ------------------ PLANS LIST ------------------ */}
      <ScrollView style={{ paddingHorizontal: 20, marginTop: 20 }}>
        {getFilteredPlans().map((p, i) => (
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

      {/* PROCEED */}
      <TouchableOpacity style={styles.button} onPress={handleProceed}>
        <Text style={styles.buttonText}>PROCEED</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// -----------------------------------------------------
// STYLES — SAME AS YOUR FILE
// -----------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    opacity: 0.12,
  },

  blueShadowSmall: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    opacity: 0.08,
  },

  inputContainer: {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.8,
    borderColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
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
    borderRadius: 8,
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },

  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  lastRechargeBox: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    paddingVertical: 10,
  },

  lastRechargeTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 15,
    paddingBottom: 10,
    color: '#222',
  },

  lastRechargeItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  lastRechargeNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },

  lastRechargeDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  lastRechargeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
