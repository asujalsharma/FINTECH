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
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getData } from '../API';
import { useRoute } from '@react-navigation/native';
import Footer from '../components/Footer';

const BLUE = '#122536ff';


export default function DTHRechargeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { ServiceId } = route.params || {};
  // console.log('DTHRechargeScreen Params:', ServiceId);

  const [customerID, setCustomerID] = useState('');
  const [amount, setAmount] = useState('');
  const [operator, setOperator] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [SelectedPlan, setSelectedPlan] = useState({});
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setselectedOperator] = useState({});

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

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const res = await getData(`/api/cyrus/dth_operator_list`);
        console.log(res);
        if (res?.Data) {
          setOperators(res.Data);
        } else {
          setOperators([]);
        }
      } catch (err) {
        setOperators([]);
      }
    };
    fetchOperators();
  }, []);

  // ----------------------------------------------------------
  // VERIFY
  // ----------------------------------------------------------

  const handleVerify = async () => {
    if (!customerID) return Alert.alert('Please enter customer ID');

    try {
      setVerifying(true);

      const res = await getData(
        `/api/cyrus/fetch_dth_operator?dthNumber=${customerID}&operator=${selectedOperator.OperatorCode}`,
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
    console.log({ operator, customerID, amount, selectedOperator });
    // if (!operator) return Alert.alert('Verify Customer ID');
    if (!customerID) return Alert.alert('Enter valid Customer ID');
    if (!amount) return Alert.alert('Enter amount');

    navigation.navigate('PaymentConfirmation', {
      rechargeData: { amount, customerID },
      operatorDetail: { 
        ...selectedOperator,
        DthName: operator?.DthName || selectedOperator?.OperatorName,
        DthOpCode: operator?.DthOpCode || selectedOperator?.OperatorCode,
        ServiceId 
      },
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

      {/* Operator Dropdown */}
      {
        <View style={styles.inputWrapper}>
          <View style={styles.blueShadowLarge} />
          <View style={styles.blueShadowSmall} />
          <View style={styles.inputContainer}>
            <Text style={styles.prefix}>Operator</Text>
            <View style={{ flex: 1 }}>
              <Picker
                selectedValue={operator?.DthName || ''}
                onValueChange={(itemValue, itemIndex) => {
                  if (itemValue) {
                    const op = operators.find(
                      o => o.OperatorName === itemValue,
                    );
                    setselectedOperator(op);
                  }
                }}
                style={{ color: '#000', fontWeight: 'bold' }}
              >
                <Picker.Item label="Select Operator" value="" />
                {operators.map((op, idx) => (
                  <Picker.Item
                    key={idx}
                    label={op.OperatorName}
                    value={op.OperatorName}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      }

      {/* Customer ID */}
      {console.log('Selected Operator:', selectedOperator)}

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

          {selectedOperator?.OperatorName !== 'Tata Sky' && (
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
          )}
        </View>
      </View>

      {/* Operator */}
      {operator?.DthName && (
        <>
          <Text style={styles.operatorLabel}>Operator: {operator.DthName}</Text>
          <Text style={styles.operatorLabel}>USER: {operator.userName}</Text>
        </>
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
      <Footer />
    </SafeAreaView>
  );
}


// -----------------------------------------------------
// STYLES — SAME AS YOUR FILE
// -----------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },

  header: {
    backgroundColor: '#471d7d',
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  title: { fontSize: 18, fontWeight: '800', color: '#FFF' },

  inputWrapper: {
    marginTop: 20,
    marginHorizontal: 16,
    height: 56,
  },

  inputContainer: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#471d7d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  prefix: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
    color: '#471d7d',
  },

  input: { flex: 1, fontSize: 16, color: '#0F172A', fontWeight: '700' },

  verifyBtn: {
    backgroundColor: '#471d7d',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  verifyText: { color: '#FFF', fontWeight: '700', fontSize: 12 },

  operatorLabel: {
    marginLeft: 16,
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  planCard: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  planTitle: { fontWeight: '800', fontSize: 16, color: '#0F172A', marginBottom: 4 },

  selectedCard: {
    borderWidth: 1.5,
    borderColor: '#471d7d',
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    elevation: 4,
  },

  toggleRow: {
    flexDirection: 'row',
    marginTop: 18,
    marginHorizontal: 16,
  },

  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  button: {
    backgroundColor: '#58007b',
    height: 54,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    elevation: 4,
    shadowColor: '#58007b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});

