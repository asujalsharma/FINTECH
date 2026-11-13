import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getData } from '../API';
import Footer from '../components/Footer';
import CustomAlertModal from '../components/CustomAlertModal';

const BLUE = '#471d7d';

const OPERATOR_ICONS = {
  airtel: require('../Assets/airtel-logo-icon.png'),
  dish: require('../Assets/dishtv.png'),
  tata: require('../Assets/tatadth.png'),
  sun: require('../Assets/sundth.png'),
  videocon: require('../Assets/d2h.png'),
  d2h: require('../Assets/d2h.png'),
};

const getOperatorIcon = name => {
  const n = (name || '').toLowerCase();
  for (const key of Object.keys(OPERATOR_ICONS)) {
    if (n.includes(key)) return OPERATOR_ICONS[key];
  }
  return null;
};

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
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);

  // Operator selection modal
  const [showOperatorModal, setShowOperatorModal] = useState(false);

  // Custom Alert / Notice modal state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'notice',
  });

  const showAlert = (title, message, type = 'notice') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Language & Month filters for plans
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

  // ----------------------------------------------------------
  // FETCH PLANS
  // ----------------------------------------------------------
  const fetchPlans = async opCode => {
    try {
      setLoadingPlans(true);
      const res = await getData('api/cyrus/fetch_dth_plans');
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

  // ----------------------------------------------------------
  // FETCH OPERATORS
  // ----------------------------------------------------------
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const res = await getData('/api/cyrus/dth_operator_list');
        if (res?.Data && Array.isArray(res.Data)) {
          setOperators(res.Data);
          if (res.Data.length > 0 && !selectedOperator) {
            setSelectedOperator(res.Data[0]);
          }
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
  // DTH OPCODE HELPER (Ekychub: ATV, STV, DTV, TTV, VTV)
  // ----------------------------------------------------------
  const getDthOpcode = opName => {
    const name = (opName || '').toLowerCase();
    if (name.includes('airtel')) return 'ATV';
    if (name.includes('sun')) return 'STV';
    if (name.includes('dish')) return 'DTV';
    if (name.includes('tata')) return 'TTV';
    if (name.includes('videocon') || name.includes('d2h')) return 'VTV';
    return null;
  };

  // ----------------------------------------------------------
  // VERIFY DTH NUMBER & CUSTOMER INFO
  // ----------------------------------------------------------
  const handleVerify = async () => {
    if (!customerID || customerID.trim().length === 0) {
      showAlert('Required', 'Please enter your Customer ID / DTH Number', 'warning');
      return;
    }

    const opName = selectedOperator?.OperatorName || operator?.DthName;
    const opcode = getDthOpcode(opName);

    if (!opcode) {
      showAlert('Select Operator', 'Please select your DTH operator first.', 'warning');
      return;
    }

    try {
      setVerifying(true);
      const res = await getData('/api/cyrus/dth-verify', {
        dth_number: customerID.trim(),
        opcode,
      });

      console.log('DTH Verify Result:', res);

      if (res?.Status && res?.data) {
        setCustomerInfo(res.data);
        if (res.data.Minimum_recharge && !amount) {
          setAmount(String(res.data.Minimum_recharge));
        }
        showAlert(
          'Customer Verified ✅',
          `Name: ${res.data.Name || 'N/A'}\nBalance: ₹${res.data.Balance || '0'}\nMin. Recharge: ₹${res.data.Minimum_recharge || '0'}`,
          'success',
        );
      } else {
        showAlert('Notice', res?.Remarks || 'Customer Id starts with 0 and is 11 digits long', 'notice');
      }
    } catch (err) {
      console.log('DTH Verify Error:', err?.response?.data || err.message);
      showAlert(
        'Notice',
        err?.response?.data?.Remarks || 'Customer details verification failed. Please check the customer number.',
        'notice',
      );
    } finally {
      setVerifying(false);
    }
  };

  // ----------------------------------------------------------
  // PROCEED TO PAYMENT
  // ----------------------------------------------------------
  const handleProceed = () => {
    if (!customerID) {
      showAlert('Required', 'Please enter a valid Customer ID / DTH number', 'warning');
      return;
    }
    if (!amount) {
      showAlert('Enter Amount', 'Please enter or select a recharge amount', 'warning');
      return;
    }

    navigation.navigate('PaymentConfirmation', {
      rechargeData: { amount, customerID },
      operatorDetail: {
        ...selectedOperator,
        DthName: operator?.DthName || selectedOperator?.OperatorName,
        DthOpCode: operator?.DthOpCode || selectedOperator?.OperatorCode,
        ServiceId,
      },
      isPrePaid: false,
      from: 'DTH',
    });
  };

  const selectedOpIcon = selectedOperator ? getOperatorIcon(selectedOperator.OperatorName) : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#471d7d" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>DTH Recharge</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Card */}
        <View style={styles.mainCard}>
          <Text style={styles.cardLabel}>DTH Details</Text>
          <Text style={styles.cardSublabel}>Select operator and enter customer ID</Text>

          {/* Operator Selector Button */}
          <Text style={styles.fieldLabel}>Operator</Text>
          <TouchableOpacity
            style={styles.operatorSelector}
            activeOpacity={0.8}
            onPress={() => setShowOperatorModal(true)}
          >
            <View style={styles.operatorInfoRow}>
              {selectedOpIcon ? (
                <Image source={selectedOpIcon} style={styles.operatorIconSmall} resizeMode="contain" />
              ) : (
                <View style={styles.operatorIconPlaceholder}>
                  <Icon name="tv" size={20} color="#471d7d" />
                </View>
              )}
              <Text style={styles.operatorNameText}>
                {selectedOperator?.OperatorName || 'Select Operator'}
              </Text>
            </View>
            <Icon name="keyboard-arrow-down" size={24} color="#64748B" />
          </TouchableOpacity>

          {/* Customer ID Input Box with Verify Button */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Customer ID / VC Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 03021500325"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={customerID}
              onChangeText={text => {
                setCustomerID(text);
                if (customerInfo) setCustomerInfo(null);
              }}
            />

            <TouchableOpacity
              style={[styles.verifyBtn, verifying && { opacity: 0.7 }]}
              onPress={handleVerify}
              disabled={verifying}
              activeOpacity={0.8}
            >
              {verifying ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.verifyText}>VERIFY</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Recharge Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.rupeePrefix}>₹</Text>
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

        {/* Customer Verified Info Card */}
        {customerInfo && (
          <View style={styles.customerCard}>
            <View style={styles.customerCardHeader}>
              <Icon name="verified" size={20} color="#16a34a" />
              <Text style={styles.customerCardTitle}>Customer Verified</Text>
            </View>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>Customer Name:</Text>
              <Text style={styles.customerVal}>{customerInfo.Name || 'N/A'}</Text>
            </View>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>Current Balance:</Text>
              <Text style={[styles.customerVal, { color: '#16a34a', fontWeight: '800' }]}>
                ₹{customerInfo.Balance || '0'}
              </Text>
            </View>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>Min. Recharge:</Text>
              <Text style={styles.customerVal}>₹{customerInfo.Minimum_recharge || '0'}</Text>
            </View>
            {customerInfo.VC ? (
              <View style={styles.customerRow}>
                <Text style={styles.customerLabel}>VC Number:</Text>
                <Text style={styles.customerVal}>{customerInfo.VC}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Selected Plan Details */}
        {SelectedPlan.planName && (
          <View style={styles.selectedCard}>
            <Text style={styles.planTitle}>{SelectedPlan.planName}</Text>
            <Text style={styles.planDetailText}>Price: ₹{SelectedPlan.amount}</Text>
            <Text style={styles.planDetailText}>Validity: {SelectedPlan.month}</Text>
            {SelectedPlan.language ? <Text style={styles.planDetailText}>Language: {SelectedPlan.language}</Text> : null}
          </View>
        )}

        {/* Plans List */}
        {plans.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.plansSectionTitle}>Available Plans</Text>

            {/* Language toggle */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {getLanguages().map((lang, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    setSelectedLanguage(lang);
                    setSelectedMonth('');
                  }}
                  style={[
                    styles.toggleBtn,
                    selectedLanguage === lang && styles.toggleBtnActive,
                  ]}
                >
                  <Text style={[styles.toggleBtnText, selectedLanguage === lang && styles.toggleBtnTextActive]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Filtered plans */}
            <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
              {getFilteredPlans().map((p, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    setAmount(String(p.amount));
                    setSelectedPlan(p);
                  }}
                  style={styles.planCard}
                  activeOpacity={0.8}
                >
                  <View style={styles.planCardHeader}>
                    <Text style={styles.planTitle}>{p.planName}</Text>
                    <Text style={styles.planPrice}>₹{p.amount}</Text>
                  </View>
                  <Text style={styles.planMeta}>Validity: {p.month} • {p.language}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.proceedBtn} onPress={handleProceed} activeOpacity={0.85}>
          <Text style={styles.proceedBtnText}>PROCEED TO RECHARGE</Text>
          <Icon name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
      <Footer />

      {/* ========================================= */}
      {/* CUSTOM OPERATOR SELECTION MODAL */}
      {/* ========================================= */}
      <Modal
        visible={showOperatorModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOperatorModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOperatorModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select DTH Operator</Text>
              <TouchableOpacity onPress={() => setShowOperatorModal(false)} style={styles.modalCloseBtn}>
                <Icon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.operatorList} showsVerticalScrollIndicator={false}>
              {operators.map((op, idx) => {
                const opIcon = getOperatorIcon(op.OperatorName);
                const isSelected = selectedOperator?.OperatorName === op.OperatorName;

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.operatorItem, isSelected && styles.operatorItemSelected]}
                    onPress={() => {
                      setSelectedOperator(op);
                      setShowOperatorModal(false);
                      if (op.OperatorName?.toUpperCase().includes('SUN')) {
                        fetchPlans(op.OperatorCode);
                      } else {
                        setPlans([]);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.operatorLogoContainer}>
                      {opIcon ? (
                        <Image source={opIcon} style={styles.operatorLogo} resizeMode="contain" />
                      ) : (
                        <Icon name="tv" size={24} color="#471d7d" />
                      )}
                    </View>

                    <Text style={[styles.operatorItemText, isSelected && styles.operatorItemTextSelected]}>
                      {op.OperatorName}
                    </Text>

                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <Icon name="check" size={16} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ========================================= */}
      {/* CUSTOM ALERT / NOTICE POPUP */}
      {/* ========================================= */}
      <CustomAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#471d7d',
    paddingVertical: 16,
    paddingHorizontal: 16,
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
  backBtn: {
    padding: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  mainCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSublabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  operatorSelector: {
    height: 54,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  operatorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  operatorIconSmall: {
    width: 34,
    height: 34,
    marginRight: 10,
  },
  operatorIconPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  operatorNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputContainer: {
    height: 54,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  rupeePrefix: {
    fontSize: 17,
    fontWeight: '700',
    color: '#471d7d',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    paddingVertical: 0,
  },
  verifyBtn: {
    backgroundColor: '#471d7d',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  verifyText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  customerCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
  },
  customerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
    paddingBottom: 6,
  },
  customerCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
    marginLeft: 6,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  customerLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  customerVal: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  selectedCard: {
    borderWidth: 1.5,
    borderColor: '#471d7d',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
  },
  planTitle: {
    fontWeight: '800',
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 4,
  },
  planDetailText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  plansSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    marginRight: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#471d7d',
  },
  toggleBtnText: {
    color: '#471d7d',
    fontWeight: '700',
    fontSize: 13,
  },
  toggleBtnTextActive: {
    color: '#FFF',
  },
  planCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#471d7d',
  },
  planMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    backgroundColor: '#F8FAFC',
  },
  proceedBtn: {
    backgroundColor: '#471d7d',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  proceedBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    padding: 6,
  },
  operatorList: {
    marginTop: 8,
  },
  operatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 4,
  },
  operatorItemSelected: {
    backgroundColor: '#F3E8FF',
  },
  operatorLogoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  operatorLogo: {
    width: 28,
    height: 28,
  },
  operatorItemText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  operatorItemTextSelected: {
    color: '#471d7d',
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#471d7d',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
