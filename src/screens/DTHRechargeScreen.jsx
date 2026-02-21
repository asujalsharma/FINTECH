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

import { THEME_COLORS, GRADIENTS } from '../constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import { Platform } from 'react-native';
const BLUE = THEME_COLORS.primary;

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
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>DTH Recharge</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Customer ID */}
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Customer ID"
            placeholderTextColor="#94A3B8"
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
      {
        operator?.DthName && (
          <>
            <Text style={styles.operatorLabel}>Operator: {operator.DthName}</Text>
            <Text style={styles.operatorLabel}>USER: {operator.userName}</Text>
          </>
        )
      }

      {/* ------------------ LAST DTH RECHARGES ------------------ */}
      {
        lastRecharges.length > 0 && plans.length === 0 && (
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
        )
      }

      {/* Amount Display */}
      <View style={[styles.inputWrapper, { marginTop: 0 }]}>
        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>Rs.</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Amount"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>
      </View>

      {/* Loading */}
      {
        loadingPlans && (
          <ActivityIndicator
            color={BLUE}
            size="small"
            style={{ marginTop: 10 }}
          />
        )
      }

      {/* Selected Plan */}
      {
        SelectedPlan.planName && (
          <View style={styles.selectedCard}>
            <Text style={styles.planTitle}>{SelectedPlan.planName}</Text>
            <Text>Price: ₹{SelectedPlan.amount}</Text>
            <Text>Validity: {SelectedPlan.month}</Text>
            <Text>Language: {SelectedPlan.language}</Text>
            <Text>Channels: {SelectedPlan.channels}</Text>
          </View>
        )
      }

      {/* ------------------ LANGUAGE TOGGLE ------------------ */}
      {/* ------------------ LANGUAGE TOGGLE ------------------ */}
      {
        plans.length > 0 && (
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
                      backgroundColor: selectedLanguage === lang ? BLUE : '#eee',
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
        )
      }

      {/* ------------------ MONTH TOGGLE ------------------ */}
      {/* ------------------ MONTH TOGGLE ------------------ */}
      {
        selectedLanguage !== '' && (
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
                      backgroundColor: selectedMonth === m ? BLUE : '#eee',
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
        )
      }

      {/* ------------------ PLANS LIST ------------------ */}
      <ScrollView
        style={{ marginTop: 10 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      >
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
            <View style={{ gap: 4 }}>
              <Text style={styles.planDetail}>Price: <Text style={{ color: '#1A1A2E' }}>₹{p.amount}</Text></Text>
              <Text style={styles.planDetail}>Validity: <Text style={{ color: '#1A1A2E' }}>{p.month}</Text></Text>
              <Text style={styles.planDetail}>Language: <Text style={{ color: '#1A1A2E' }}>{p.language}</Text></Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* PROCEED */}
      <TouchableOpacity style={styles.button} onPress={handleProceed}>
        <Text style={styles.buttonText}>PROCEED</Text>
      </TouchableOpacity>
    </SafeAreaView >
  );
}

// -----------------------------------------------------
// STYLES — SAME AS YOUR FILE
// -----------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    marginTop: -35,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#1756C5',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  prefix: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    marginRight: 10,
    textTransform: 'uppercase',
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: 1,
  },
  verifyBtn: {
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  verifyText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  operatorLabel: {
    marginLeft: 25,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  lastRechargeBox: {
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  lastRechargeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  lastRechargeItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  lastRechargeNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  lastRechargeDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  lastRechargeAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME_COLORS.primary,
  },
  /* Plans Styles */
  planCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  planDetail: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedCard: {
    backgroundColor: 'rgba(23, 86, 197, 0.05)',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: THEME_COLORS.primary,
    marginBottom: 20,
  },
  toggleBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: THEME_COLORS.orange,
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#FF9500',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
