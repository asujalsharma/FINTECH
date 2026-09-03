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
  Platform,
  StatusBar,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getData } from '../API';
import { useRoute } from '@react-navigation/native';
import Footer from '../components/Footer';
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
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setselectedOperator] = useState({});

  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

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

  const fetchPlans = async opCode => {
    try {
      setLoadingPlans(true);
      const res = await getData(`api/cyrus/fetch_dth_plans`);
      if (res?.Data?.plans) {
        setPlans(res.Data.plans);
      } else {
        setPlans([]);
      }
    } catch (err) {
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const res = await getData(`/api/cyrus/dth_operator_list`);
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

  const handleVerify = async () => {
    if (!customerID) return Alert.alert('Required', 'Please enter your DTH Customer ID / Viewing Card Number');

    try {
      setVerifying(true);
      const res = await getData(
        `/api/cyrus/fetch_dth_operator?dthNumber=${customerID}&operator=${selectedOperator.OperatorCode || ''}`,
      );

      if (res?.Data?.DthName) {
        setOperator(res.Data);
        if (res.Data.DthName?.toUpperCase() === 'SUN DIRECT') {
          fetchPlans(res.Data.DthOpCode);
        }
      } else {
        Alert.alert('Not Found', 'No operator details found for this Customer ID.');
        setOperator(null);
      }
    } catch (err) {
      Alert.alert('Verification Failed', 'Could not verify DTH account. Please try again.');
      setOperator(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleProceed = () => {
    if (!customerID) return Alert.alert('Required', 'Please enter your Customer ID.');
    if (!amount || Number(amount) <= 0) return Alert.alert('Required', 'Please enter recharge amount.');

    navigation.navigate('PaymentConfirmation', {
      rechargeData: {
        rs: amount,
        customerID,
        planName: SelectedPlan.planName || 'DTH Recharge',
      },
      operatorDetail: {
        DthName: selectedOperator.OperatorName || operator?.DthName || 'DTH',
        OperatorCode: selectedOperator.OperatorCode,
        ServiceId,
      },
      from: 'DTH',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg || '#0A2568'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>DTH Recharge</Text>
          <Text style={styles.subtitle}>Instant Dish Refill & Cashback</Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* Main Card */}
        <View style={styles.mainCard}>
          {/* Operator Selection */}
          <Text style={styles.inputLabel}>Select DTH Operator</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedOperator?.OperatorName || ''}
              onValueChange={itemValue => {
                const op = operators.find(o => o.OperatorName === itemValue);
                if (op) setselectedOperator(op);
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select DTH Operator" value="" />
              {operators.map((op, idx) => (
                <Picker.Item
                  key={idx}
                  label={op.OperatorName}
                  value={op.OperatorName}
                />
              ))}
            </Picker>
          </View>

          {/* Customer ID */}
          <Text style={[styles.inputLabel, { marginTop: 14 }]}>
            Customer ID / Viewing Card Number
          </Text>
          <View style={styles.inputContainer}>
            <Icon name="credit-card" size={20} color={COLORS.primary || '#0D52ED'} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 10-12 digit ID"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={customerID}
              onChangeText={setCustomerID}
            />

            {selectedOperator?.OperatorName !== 'Tata Sky' && (
              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={handleVerify}
                disabled={verifying}
                activeOpacity={0.8}
              >
                {verifying ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.verifyText}>VERIFY</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {operator?.DthName && (
            <View style={styles.operatorVerifiedBox}>
              <Icon name="check-circle" size={16} color="#10B981" style={{ marginRight: 6 }} />
              <View>
                <Text style={styles.verifiedOperatorName}>
                  {operator.DthName} • {operator.userName || 'Active Customer'}
                </Text>
              </View>
            </View>
          )}

          {/* Amount */}
          <Text style={[styles.inputLabel, { marginTop: 14 }]}>Recharge Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.prefix}>₹</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {/* Selected Plan Details */}
        {SelectedPlan.planName && (
          <View style={styles.selectedCard}>
            <View style={styles.planHeaderRow}>
              <Text style={styles.planTitle}>{SelectedPlan.planName}</Text>
              <View style={styles.planAmountPill}>
                <Text style={styles.planAmountText}>₹ {SelectedPlan.amount}</Text>
              </View>
            </View>
            <Text style={styles.planMeta}>Validity: {SelectedPlan.month} • {SelectedPlan.language}</Text>
            {SelectedPlan.channels && (
              <Text style={styles.planChannels}>Channels: {SelectedPlan.channels}</Text>
            )}
          </View>
        )}

        {/* Language Toggles for Plans */}
        {plans.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionHeading}>Select Language</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4 }}
            >
              {getLanguages().map((lang, i) => (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.75}
                  onPress={() => {
                    setSelectedLanguage(lang);
                    setSelectedMonth('');
                  }}
                  style={[
                    styles.toggleBtn,
                    selectedLanguage === lang && styles.toggleBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      selectedLanguage === lang && styles.toggleBtnTextActive,
                    ]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Month Toggles */}
        {selectedLanguage !== '' && (
          <View style={{ marginTop: 14 }}>
            <Text style={styles.sectionHeading}>Select Duration</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4 }}
            >
              {getMonthsForLanguage(selectedLanguage).map((m, i) => (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.75}
                  onPress={() => setSelectedMonth(m)}
                  style={[
                    styles.toggleBtn,
                    selectedMonth === m && styles.toggleBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      selectedMonth === m && styles.toggleBtnTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filtered Plans List */}
        {getFilteredPlans().map((p, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.8}
            onPress={() => {
              setSelectedPlan(p);
              setAmount(String(p.amount));
            }}
            style={[
              styles.planCard,
              SelectedPlan.planName === p.planName && styles.planCardActive,
            ]}
          >
            <View style={styles.planHeaderRow}>
              <Text style={styles.planTitle}>{p.planName}</Text>
              <Text style={styles.planPriceText}>₹ {p.amount}</Text>
            </View>
            <Text style={styles.planSub}>{p.month} • {p.language}</Text>
          </TouchableOpacity>
        ))}

        {/* Proceed Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.button, (!customerID || !amount) && { opacity: 0.75 }]}
          onPress={handleProceed}
        >
          <View style={styles.btnContent}>
            <Text style={styles.buttonText}>CONTINUE TO PAY ₹{amount || '0'}</Text>
            <Icon name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
          </View>
        </TouchableOpacity>

        <View style={{ marginTop: 'auto', paddingTop: 24 }}>
          <Footer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: COLORS.headerBg || '#0A2568',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 5,
    shadowColor: COLORS.headerBg || '#0A2568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '800', color: '#FFF', letterSpacing: 0.3 },
  subtitle: { fontSize: 11.5, color: '#D9E7FF', fontWeight: '500', marginTop: 2 },

  scrollBody: {
    flexGrow: 1,
    paddingBottom: 0,
  },

  mainCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
  },
  picker: {
    height: 52,
    color: '#091838',
  },
  inputContainer: {
    height: 54,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary || '#0D52ED',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  prefix: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary || '#0D52ED',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#091838',
  },
  verifyBtn: {
    backgroundColor: COLORS.primary || '#0D52ED',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  verifyText: { color: '#FFF', fontWeight: '800', fontSize: 11 },

  operatorVerifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedOperatorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },

  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    marginRight: 8,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary || '#0D52ED',
    borderColor: COLORS.primary || '#0D52ED',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  toggleBtnTextActive: {
    color: '#FFF',
  },

  selectedCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary || '#0D52ED',
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: { fontSize: 15, fontWeight: '800', color: '#091838' },
  planAmountPill: {
    backgroundColor: COLORS.primary || '#0D52ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  planAmountText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  planMeta: { fontSize: 12, color: '#64748B', marginTop: 4, fontWeight: '500' },
  planChannels: { fontSize: 11, color: '#059669', marginTop: 2, fontWeight: '600' },

  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  planCardActive: {
    borderColor: COLORS.primary || '#0D52ED',
    borderWidth: 1.5,
  },
  planPriceText: { fontSize: 16, fontWeight: '800', color: '#091838' },
  planSub: { fontSize: 12, color: '#64748B', marginTop: 3, fontWeight: '500' },

  button: {
    backgroundColor: COLORS.primary || '#0D52ED',
    height: 54,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary || '#0D52ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
});
