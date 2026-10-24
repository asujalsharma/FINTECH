import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import COLORS from '../constants/colors';
import useFundWithdrawal from '../hooks/useFundWithdrawal';
import useFundAccount from '../hooks/useFundAccount';
import { getSchemeMeta, resolveSchemeCode } from '../services/fundSchemeService';
import { lookupIfscDetails } from '../services/fundWithdrawalService';

const PURPOSE_OPTIONS = [
  { id: 'marriage', label: 'विवाह खर्च (Marriage)' },
  { id: 'education', label: 'शिक्षा / पढ़ाई (Education)' },
  { id: 'medical', label: 'चिकित्सा / उपचार (Medical)' },
  { id: 'home', label: 'गृह सुधार (Home Need)' },
  { id: 'other', label: 'अन्य आवश्यक खर्च (Other)' },
];

export default function FundWithdrawalRequestScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    eligibility,
    loadEligibility,
    submitting,
    submitRequest,
    validateWithdrawalAmount,
  } = useFundWithdrawal();

  const { profile, fetchProfile } = useFundAccount();

  const targetFundAccountId =
    route.params?.fundAccountId ||
    route.params?.eligibility?.fundAccountId ||
    profile?.fundAccountId ||
    profile?._id;

  const activeSchemeCode = resolveSchemeCode(
    route.params?.schemeCode ||
    route.params?.eligibility?.sahayogType ||
    profile?.sahayogType ||
    'VIVAH_SAHAYOG'
  );
  const schemeMeta = getSchemeMeta(activeSchemeCode);
  const themeColor = schemeMeta.color || COLORS.primary;

  // Form State
  const [amountStr, setAmountStr] = useState('');

  // Bank Fields
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [holderName, setHolderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [ifscLoading, setIfscLoading] = useState(false);
  const [ifscValid, setIfscValid] = useState(null); // null | true | false

  // Reason
  const [selectedPurpose, setSelectedPurpose] = useState('marriage');
  const [customReason, setCustomReason] = useState('');

  // Confirmation Modal
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  useEffect(() => {
    if (targetFundAccountId) {
      loadEligibility(targetFundAccountId);
      if (!profile) {
        fetchProfile(targetFundAccountId);
      }
    }
  }, [targetFundAccountId, loadEligibility, fetchProfile, profile]);

  const activeEligibility = route.params?.eligibility || eligibility;

  const walletBal = Number(activeEligibility?.walletBalance ?? profile?.fundWallet?.balance ?? 0);
  const minBalReq = Number(activeEligibility?.minAccountBalanceRequired ?? 500);
  const pendingAmt = Number(activeEligibility?.pendingWithdrawalAmount ?? 0);
  const maxWithdrawable = Number(
    activeEligibility?.maxWithdrawableAmount !== undefined
      ? activeEligibility.maxWithdrawableAmount
      : Math.max(0, walletBal - minBalReq - pendingAmt)
  );
  const minWithdrawal = Number(activeEligibility?.minWithdrawalAmount ?? 100);

  // Pre-fill holder name and bank details from profile or eligibility
  useEffect(() => {
    const profBankAcc =
      profile?.beneficiaryAccount ||
      profile?.balikaAccount ||
      profile?.accountNumber ||
      profile?.bankDetails?.accountNumber ||
      activeEligibility?.savedBanks?.[0]?.accountNumber;
    const profIfsc =
      profile?.ifsc ||
      profile?.bankDetails?.ifsc ||
      activeEligibility?.savedBanks?.[0]?.ifsc;
    const profBankName =
      profile?.bankName ||
      profile?.bankDetails?.bankName ||
      activeEligibility?.savedBanks?.[0]?.bankName;
    const profBranch =
      profile?.branchName ||
      activeEligibility?.savedBanks?.[0]?.branchName;
    const profHolder =
      profile?.beneficiaryName ||
      profile?.balikaName ||
      profile?.applicantName ||
      activeEligibility?.savedBanks?.[0]?.holderName;

    if (profHolder && !holderName) setHolderName(profHolder);
    if (profBankAcc && !accountNumber) {
      setAccountNumber(profBankAcc);
      setConfirmAccountNumber(profBankAcc);
    }
    if (profIfsc && !ifsc) {
      setIfsc(profIfsc.toUpperCase());
      setIfscValid(true);
    }
    if (profBankName && !bankName) setBankName(profBankName);
    if (profBranch && !branchName) setBranchName(profBranch);
  }, [profile, activeEligibility, holderName, accountNumber, ifsc, bankName, branchName]);

  // Handle IFSC lookup
  const handleIfscChange = async (val) => {
    const uppercase = val.toUpperCase().trim();
    setIfsc(uppercase);

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (uppercase.length === 11) {
      if (ifscRegex.test(uppercase)) {
        setIfscValid(true);
        setIfscLoading(true);
        try {
          const details = await lookupIfscDetails(uppercase);
          if (details) {
            setBankName(details.bankName || '');
            setBranchName(details.branchName || '');
          }
        } catch (e) {
          // ignore
        } finally {
          setIfscLoading(false);
        }
      } else {
        setIfscValid(false);
      }
    } else {
      setIfscValid(null);
    }
  };

  // Amount validation & projected balance
  const parsedAmount = Number(amountStr) || 0;
  const amountValidation = validateWithdrawalAmount(parsedAmount, activeEligibility);
  const projectedBalance = walletBal - parsedAmount;

  // Chips amounts: calculate intelligently based on maxWithdrawable
  const quickChips = useMemo(() => {
    const list = [];
    if (maxWithdrawable >= 500) list.push(500);
    if (maxWithdrawable >= 1000) list.push(1000);
    if (maxWithdrawable >= 2000) list.push(2000);
    if (maxWithdrawable > 0 && !list.includes(maxWithdrawable)) {
      list.push({ label: `Max (₹${maxWithdrawable.toLocaleString('en-IN')})`, value: maxWithdrawable });
    }
    return list;
  }, [maxWithdrawable]);

  // Bank Validation
  const isBankValid = useMemo(() => {
    const accMatch = accountNumber && accountNumber === confirmAccountNumber;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const ifscOk = ifsc && ifscRegex.test(ifsc);
    const holderOk = Boolean(holderName && holderName.trim().length > 2);
    const bankNameOk = Boolean(bankName && bankName.trim().length > 1);
    return Boolean(accMatch && ifscOk && holderOk && bankNameOk);
  }, [
    accountNumber,
    confirmAccountNumber,
    ifsc,
    holderName,
    bankName,
  ]);

  const isFormValid = amountValidation.valid && isBankValid && !submitting;

  const handleSubmitPress = () => {
    if (!amountValidation.valid) {
      Toast.show({
        type: 'error',
        text1: 'अमान्य राशि',
        text2: amountValidation.error,
      });
      return;
    }
    if (!isBankValid) {
      Toast.show({
        type: 'error',
        text1: 'बैंक विवरण अपूर्ण',
        text2: 'कृपया खाता संख्या व IFSC विवरण सही दर्ज करें।',
      });
      return;
    }
    setConfirmModalVisible(true);
  };

  const handleFinalSubmit = async () => {
    setConfirmModalVisible(false);

    const chosenBankDetails = {
      accountNumber,
      ifsc,
      bankName,
      holderName,
      branchName,
      upiId: upiId || undefined,
    };

    const purposeObj = PURPOSE_OPTIONS.find((p) => p.id === selectedPurpose);
    const reasonText = customReason.trim()
      ? `${purposeObj?.label || selectedPurpose}: ${customReason.trim()}`
      : purposeObj?.label || 'Fund Withdrawal';

    const payload = {
      fundAccountId: targetFundAccountId,
      amount: parsedAmount,
      bankDetails: chosenBankDetails,
      reason: reasonText,
    };

    try {
      await submitRequest(payload);
      Toast.show({
        type: 'success',
        text1: 'अनुरोध सफलतापूर्वक दर्ज हुआ',
        text2: `₹${parsedAmount.toLocaleString('en-IN')} का निकासी अनुरोध सबमिट कर दिया गया है।`,
      });
      // Navigate to withdrawal history
      navigation.replace('FundWithdrawalHistory', {
        fundAccountId: targetFundAccountId,
        schemeCode: activeSchemeCode,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'अनुरोध विफल',
        text2: err?.message || 'सर्वर पर अनुरोध दर्ज नहीं हो सका। कृपया पुनः प्रयास करें।',
      });
    }
  };

  const selectedBankDisplay = useMemo(() => {
    return `${bankName || 'बैंक'} (••• ${String(accountNumber).slice(-4)})`;
  }, [bankName, accountNumber]);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.headerTitle}>निकासी अनुरोध (Withdrawal)</Text>
          <Text style={[s.headerSub, { color: themeColor }]}>
            {schemeMeta.name} • खाता: {targetFundAccountId || '—'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Available Limit Banner */}
        <View style={[s.limitCard, { borderColor: `${themeColor}35` }]}>
          <View style={s.limitRow}>
            <View>
              <Text style={s.limitLabel}>निकासी उपलब्ध सीमा (Max Withdrawable)</Text>
              <Text style={[s.limitAmount, { color: themeColor }]}>
                ₹ {maxWithdrawable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={s.limitRight}>
              <Text style={s.limitSub}>कुल वॉलेट: ₹{walletBal.toLocaleString('en-IN')}</Text>
              <Text style={s.limitSub}>अनिवार्य शेष: ₹{minBalReq.toLocaleString('en-IN')}</Text>
              <Text style={s.limitSub}>न्यूनतम निकासी: ₹{minWithdrawal.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* 1. Amount Input Card */}
        <View style={s.card}>
          <View style={s.sectionHeader}>
            <MaterialIcon name="cash-multiple" size={20} color={themeColor} />
            <Text style={s.sectionTitle}>1. निकासी राशि (Amount)</Text>
          </View>

          <View style={[s.inputWrap, Boolean(amountValidation.error && parsedAmount > 0) && s.inputWrapError]}>
            <Text style={s.currencySymbol}>₹</Text>
            <TextInput
              style={s.amountInput}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#CBD5E1"
              value={amountStr}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '');
                setAmountStr(cleaned);
              }}
            />
            {amountStr.length > 0 && (
              <TouchableOpacity onPress={() => setAmountStr('')} style={s.clearBtn}>
                <FeatherIcon name="x" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Amount Chips */}
          <View style={s.chipRow}>
            {quickChips.map((chip, idx) => {
              const val = typeof chip === 'object' ? chip.value : chip;
              const label = typeof chip === 'object' ? chip.label : `₹${chip.toLocaleString('en-IN')}`;
              const isSelected = parsedAmount === val;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    s.chip,
                    { borderColor: `${themeColor}40` },
                    isSelected && { backgroundColor: themeColor, borderColor: themeColor },
                  ]}
                  onPress={() => setAmountStr(String(val))}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      s.chipText,
                      { color: themeColor },
                      isSelected && { color: '#FFFFFF' },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Live Balance Preview Box */}
          <View style={s.previewBox}>
            <View style={s.previewRow}>
              <Text style={s.previewLabel}>वर्तमान वॉलेट शेष (Current):</Text>
              <Text style={s.previewVal}>₹ {walletBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={s.previewRow}>
              <Text style={s.previewLabel}>- अनुरोधित राशि (Requested):</Text>
              <Text style={[s.previewVal, { color: '#DC2626' }]}>
                - ₹ {parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={s.previewDivider} />
            <View style={s.previewRow}>
              <Text style={s.previewLabelBold}>= अनुमानित शेष (Projected):</Text>
              <Text
                style={[
                  s.previewValBold,
                  { color: projectedBalance < minBalReq ? '#DC2626' : '#059669' },
                ]}
              >
                ₹ {projectedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={s.minBalNotice}>
              <MaterialIcon
                name={projectedBalance < minBalReq ? 'alert-circle' : 'check-circle'}
                size={14}
                color={projectedBalance < minBalReq ? '#DC2626' : '#059669'}
              />
              <Text
                style={[
                  s.minBalNoticeText,
                  { color: projectedBalance < minBalReq ? '#DC2626' : '#059669' },
                ]}
              >
                {projectedBalance < minBalReq
                  ? `न्यूनतम शेष नियम का उल्लंघन: शेष राशि ₹${minBalReq.toLocaleString('en-IN')} से कम नहीं हो सकती!`
                  : `न्यूनतम ₹${minBalReq.toLocaleString('en-IN')} शेष नियम का पालन करता है।`}
              </Text>
            </View>
          </View>

          {/* Error Message */}
          {Boolean(amountValidation.error && parsedAmount > 0) && (
            <View style={s.amountErrorBox}>
              <MaterialIcon name="alert-circle-outline" size={16} color="#DC2626" />
              <Text style={s.amountErrorText}>{amountValidation.error}</Text>
            </View>
          )}
        </View>

        {/* 2. Payout Bank Selection Card */}
        <View style={s.card}>
          <View style={s.sectionHeader}>
            <MaterialIcon name="bank-outline" size={20} color={themeColor} />
            <Text style={s.sectionTitle}>2. भुगतान बैंक खाता (Payout Bank)</Text>
          </View>

          {/* Payout Bank Form */}
          <View style={s.newBankForm}>
            <Text style={s.fieldLabel}>खाता धारक का नाम (Account Holder Name) *</Text>
            <TextInput
              style={s.textInput}
              placeholder="नाम दर्ज करें (e.g. सुनीता देवी)"
              placeholderTextColor="#94A3B8"
              value={holderName}
              onChangeText={setHolderName}
            />

            <Text style={s.fieldLabel}>बैंक खाता संख्या (Account Number) *</Text>
            <TextInput
              style={s.textInput}
              placeholder="खाता संख्या दर्ज करें"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <Text style={s.fieldLabel}>खाता संख्या पुनः दर्ज करें (Confirm Account No) *</Text>
            <TextInput
              style={[
                s.textInput,
                Boolean(confirmAccountNumber && confirmAccountNumber !== accountNumber) && s.inputErrorBorder,
              ]}
              placeholder="पुनः खाता संख्या दर्ज करें"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={confirmAccountNumber}
              onChangeText={setConfirmAccountNumber}
            />
            {Boolean(confirmAccountNumber && confirmAccountNumber !== accountNumber) && (
              <Text style={s.fieldErrorText}>खाता संख्या मेल नहीं खाती!</Text>
            )}

            <Text style={s.fieldLabel}>IFSC कोड (11 अक्षर) *</Text>
            <View style={s.ifscInputWrap}>
              <TextInput
                style={[s.textInput, { flex: 1, textTransform: 'uppercase' }]}
                placeholder="e.g. SBIN0001234"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                maxLength={11}
                value={ifsc}
                onChangeText={handleIfscChange}
              />
              {ifscLoading && (
                <ActivityIndicator size="small" color={themeColor} style={s.ifscIndicator} />
              )}
              {ifscValid === true && !ifscLoading && (
                <MaterialIcon name="check-circle" size={20} color="#059669" style={s.ifscIndicator} />
              )}
              {ifscValid === false && !ifscLoading && (
                <MaterialIcon name="close-circle" size={20} color="#DC2626" style={s.ifscIndicator} />
              )}
            </View>

            {ifscValid === false && (
              <Text style={s.fieldErrorText}>मान्य 11 अक्षरों का IFSC कोड दर्ज करें (5वाँ अक्षर 0 होना चाहिए)।</Text>
            )}

            <Text style={s.fieldLabel}>बैंक का नाम (Bank Name) *</Text>
            <TextInput
              style={s.textInput}
              placeholder="e.g. State Bank of India"
              placeholderTextColor="#94A3B8"
              value={bankName}
              onChangeText={setBankName}
            />

            <Text style={s.fieldLabel}>शाखा का नाम (Branch Name)</Text>
            <TextInput
              style={s.textInput}
              placeholder="e.g. Connaught Place Branch"
              placeholderTextColor="#94A3B8"
              value={branchName}
              onChangeText={setBranchName}
            />

            <Text style={s.fieldLabel}>UPI ID (वैकल्पिक / Optional)</Text>
            <TextInput
              style={s.textInput}
              placeholder="e.g. name@okhdfcbank"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              value={upiId}
              onChangeText={setUpiId}
            />
          </View>

        </View>

        {/* 3. Purpose / Reason Card */}
        <View style={s.card}>
          <View style={s.sectionHeader}>
            <MaterialIcon name="text-box-check-outline" size={20} color={themeColor} />
            <Text style={s.sectionTitle}>3. निकासी का कारण (Purpose / Reason)</Text>
          </View>

          <View style={s.purposeChips}>
            {PURPOSE_OPTIONS.map((opt) => {
              const isSelected = selectedPurpose === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    s.purposeChip,
                    isSelected && { backgroundColor: themeColor, borderColor: themeColor },
                  ]}
                  onPress={() => setSelectedPurpose(opt.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      s.purposeChipText,
                      isSelected && { color: '#FFFFFF' },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[s.fieldLabel, { marginTop: 10 }]}>अतिरिक्त विवरण / टिप्पणी (वैकल्पिक)</Text>
          <TextInput
            style={[s.textInput, s.textArea]}
            placeholder="विस्तृत कारण या संदर्भ दर्ज करें..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={customReason}
            onChangeText={setCustomReason}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            s.submitBtn,
            { backgroundColor: themeColor },
            !isFormValid && s.submitBtnDisabled,
          ]}
          disabled={!isFormValid}
          onPress={handleSubmitPress}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <MaterialIcon name="send-check" size={20} color="#FFFFFF" />
              <Text style={s.submitBtnText}>
                {parsedAmount > 0
                  ? `₹${parsedAmount.toLocaleString('en-IN')} निकासी अनुरोध सबमिट करें`
                  : 'निकासी अनुरोध सबमिट करें'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={confirmModalVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={[s.modalIconWrap, { backgroundColor: `${themeColor}15` }]}>
              <MaterialIcon name="bank-transfer-out" size={32} color={themeColor} />
            </View>
            <Text style={s.modalTitle}>निकासी अनुरोध की पुष्टि करें</Text>
            <Text style={s.modalSubtitle}>
              कृपया सुनिश्चित करें कि आपका बैंक विवरण सही है।
            </Text>

            <View style={s.confirmBox}>
              <View style={s.confirmRow}>
                <Text style={s.confirmLabel}>अनुरोधित राशि:</Text>
                <Text style={[s.confirmVal, { color: themeColor, fontSize: 16, fontWeight: '800' }]}>
                  ₹ {parsedAmount.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={s.confirmRow}>
                <Text style={s.confirmLabel}>भुगतान बैंक:</Text>
                <Text style={s.confirmVal}>{selectedBankDisplay}</Text>
              </View>
              <View style={s.confirmRow}>
                <Text style={s.confirmLabel}>शेष राशि (Projected):</Text>
                <Text style={s.confirmVal}>₹ {projectedBalance.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            <View style={s.modalBtnRow}>
              <TouchableOpacity
                style={s.modalCancelBtn}
                onPress={() => setConfirmModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={s.modalCancelText}>सुधारें</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalConfirmBtn, { backgroundColor: themeColor }]}
                onPress={handleFinalSubmit}
                activeOpacity={0.85}
              >
                <Text style={s.modalConfirmText}>हाँ, पुष्टि करें</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  scroll: {
    padding: 16,
  },
  limitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  limitAmount: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  limitRight: {
    alignItems: 'flex-end',
  },
  limitSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: '#F8FAFC',
  },
  inputWrapError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    paddingVertical: 8,
  },
  clearBtn: {
    padding: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  previewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  previewLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  previewVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  previewLabelBold: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  previewValBold: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  minBalNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  minBalNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  amountErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
  },
  amountErrorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  newBankForm: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0F172A',
  },
  inputErrorBorder: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  fieldErrorText: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 2,
    fontWeight: '600',
  },
  ifscInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  ifscIndicator: {
    position: 'absolute',
    right: 12,
  },
  purposeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  purposeChip: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  purposeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  confirmLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  confirmVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    maxWidth: '65%',
    textAlign: 'right',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
