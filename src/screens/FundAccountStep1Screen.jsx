import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, TextInput, StatusBar, Modal, FlatList,
  ActivityIndicator, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import COLORS from '../constants/colors';
import useFundAccount, { calculateAge } from '../hooks/useFundAccount';
import { fetchSingleFundScheme } from '../services/fundSchemeService';
import { ANNUAL_INCOME_OPTIONS, STATE_OPTIONS, getDistrictOptions } from '../constants/indiaStatesDistricts';

// ─── Step Progress ─────────────────────────────────────────────────────────────
const StepProgress = ({ current, themeColor = '#D81B60' }) => (
  <View style={[sp.wrapper, { backgroundColor: themeColor + '12' }]}>
    {[{ n: 1, label: 'व्यक्तिगत\nजानकारी' }, { n: 2, label: 'दस्तावेज़\nअपलोड' }, { n: 3, label: 'समीक्षा\nसबमिट' }].map((step, idx) => (
      <React.Fragment key={step.n}>
        <View style={sp.stepItem}>
          <View style={[sp.circle, current >= step.n && { backgroundColor: themeColor, borderColor: themeColor }]}>
            {current > step.n
              ? <FeatherIcon name="check" size={14} color="#FFFFFF" />
              : <Text style={[sp.circleNum, current >= step.n && sp.circleNumActive]}>{step.n}</Text>
            }
          </View>
          <Text style={[sp.label, current === step.n && { color: themeColor, fontWeight: '700' }]}>{step.label}</Text>
        </View>
        {idx < 2 && <View style={[sp.line, current > step.n && { backgroundColor: themeColor }]} />}
      </React.Fragment>
    ))}
  </View>
);

const sp = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFF0F5' },
  stepItem: { alignItems: 'center', flex: 0 },
  circle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  circleNum: { fontSize: 13, fontWeight: '700', color: '#94A3B8' },
  circleNumActive: { color: '#FFFFFF' },
  label: { fontSize: 10, color: '#94A3B8', textAlign: 'center', marginTop: 5, lineHeight: 14, fontWeight: '600' },
  line: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginTop: 15, marginHorizontal: 4 },
});

// ─── Dropdown Modal ─────────────────────────────────────────────────────────────
const DropdownModal = ({ visible, title, options, onSelect, onClose, selected, themeColor = '#D81B60' }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={dm.overlay}>
      <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
      <View style={dm.sheet}>
        <View style={dm.sheetHeader}>
          <Text style={dm.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}><FeatherIcon name="x" size={22} color="#64748B" /></TouchableOpacity>
        </View>
        <FlatList
          data={options}
          keyExtractor={item => item.value || item}
          renderItem={({ item }) => {
            const label = item.label || item;
            const value = item.value || item;
            const isSelected = selected === value;
            return (
              <TouchableOpacity style={[dm.option, isSelected && { backgroundColor: themeColor + '12' }]} onPress={() => onSelect(value, label)}>
                <Text style={[dm.optionText, isSelected && { color: themeColor, fontWeight: '700' }]}>{label}</Text>
                {isSelected && <FeatherIcon name="check" size={16} color={themeColor} />}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  </Modal>
);

const dm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '75%', paddingBottom: 28 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sheetTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  optionText: { fontSize: 14, color: '#334155', flex: 1 },
});

// ─── Pending Draft Block Modal ────────────────────────────────────────────────
const PendingDraftModal = ({
  visible,
  beneficiaryName,
  beneficiaryLabel = 'लाभार्थी',
  schemeName = 'सहयोग',
  themeColor = '#D81B60',
  onResume,
  onEdit,
  onStartNew,
  onClose,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={pdm.overlay}>
      <View style={pdm.card}>
        <TouchableOpacity style={pdm.closeIconBtn} onPress={onClose} activeOpacity={0.7}>
          <FeatherIcon name="x" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <View style={[pdm.iconRing, { backgroundColor: themeColor + '12', borderColor: themeColor + '30' }]}>
          <MaterialIcon name="file-alert-outline" size={42} color={themeColor} />
        </View>

        <Text style={pdm.title}>पंजीकरण लंबित है</Text>
        <Text style={pdm.subtitle}>
          कृपया पहले अधूरा पंजीकरण पूरा करें
        </Text>

        <View style={pdm.detailBox}>
          <Text style={pdm.detailText}>
            {beneficiaryName ? (
              <Text>
                {beneficiaryLabel} <Text style={[pdm.highlight, { color: themeColor }]}>"{beneficiaryName}"</Text> का {schemeName} पंजीकरण अभी अधूरा (Draft) है।
              </Text>
            ) : (
              <Text>
                आपका एक {schemeName} पंजीकरण अभी अधूरा (Draft) अवस्था में है।
              </Text>
            )}
            {'\n\n'}आप इस ड्राफ्ट को पूरा कर सकते हैं या नया लाभार्थी खाता पंजीकृत कर सकते हैं।
          </Text>
        </View>

        <TouchableOpacity style={[pdm.resumeBtn, { backgroundColor: themeColor }]} onPress={onResume} activeOpacity={0.85}>
          <Text style={pdm.resumeBtnText}>अधूरा पंजीकरण पूरा करें</Text>
          <FeatherIcon name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={[pdm.editBtn, { borderColor: themeColor + '40' }]} onPress={onEdit} activeOpacity={0.8}>
          <FeatherIcon name="edit-2" size={16} color={themeColor} />
          <Text style={[pdm.editBtnText, { color: themeColor }]}>ड्राफ्ट विवरण संपादित करें</Text>
        </TouchableOpacity>

        {onStartNew && (
          <TouchableOpacity style={[pdm.editBtn, { borderColor: themeColor + '40', marginTop: 8 }]} onPress={onStartNew} activeOpacity={0.8}>
            <FeatherIcon name="user-plus" size={16} color={themeColor} />
            <Text style={[pdm.editBtnText, { color: themeColor }]}>नया लाभार्थी जोड़ें (New Beneficiary)</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={pdm.cancelBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={pdm.cancelBtnText}>वापस जाएं (Go Back)</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ─── Gender Options ──────────────────────────────────────────────────────────
const GENDER_OPTIONS = [
  { label: 'महिला (Female)', value: 'महिला (Female)' },
  { label: 'पुरुष (Male)', value: 'पुरुष (Male)' },
  { label: 'अन्य (Other)', value: 'अन्य (Other)' },
];

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function FundAccountStep1Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { step1, saveDraft, fetchDraft, loading } = useFundAccount();

  const passedScheme = route.params?.scheme || null;
  const passedSchemeCode =
    route.params?.sahayogType ||
    route.params?.schemeCode ||
    route.params?.schemeId ||
    passedScheme?.code ||
    route.params?.draftData?.sahayogType ||
    route.params?.draftData?.schemeCode ||
    'VIVAH_SAHAYOG';

  const [scheme, setScheme] = useState(passedScheme);

  // If scheme code is present but scheme object is not yet loaded, fetch it
  useEffect(() => {
    if (passedSchemeCode && (!scheme || scheme.code !== passedSchemeCode)) {
      fetchSingleFundScheme(passedSchemeCode).then(res => {
        if (res) setScheme(res);
      });
    }
  }, [passedSchemeCode, scheme]);

  const schemeCode = scheme?.code || passedSchemeCode;
  const schemeName = scheme?.name || (schemeCode === 'VIVAH_SAHAYOG' ? 'विवाह सहयोग' : schemeCode.replace(/_/g, ' '));
  const themeColor = scheme?.themeColor || '#D81B60';
  const beneficiaryLabel = scheme?.beneficiaryLabel || 'लाभार्थी का नाम';
  const beneficiaryShort = beneficiaryLabel.split('(')[0].trim();
  const isMinorScheme = schemeCode === 'BAL_SAHAYOG' || schemeCode === 'VIVAH_SAHAYOG';

  const defaultGender = (schemeCode === 'VIVAH_SAHAYOG' || schemeCode === 'MAHILA_SAHAYOG') ? 'महिला (Female)' : '';

  const [balikaName, setBalikaName] = useState('');
  const [gender, setGender] = useState(defaultGender);
  const [mobileNumber, setMobileNumber] = useState('');
  const [dob, setDob] = useState('');
  const [dobDate, setDobDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [memberInFamily, setMemberInFamily] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [annualIncomeLabel, setAnnualIncomeLabel] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [state, setStateVal] = useState('');
  const [stateLabel, setStateLabel] = useState('');
  const [district, setDistrict] = useState('');
  const [districtLabel, setDistrictLabel] = useState('');
  const [balikaAccount, setBalikaAccount] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [savingDraft, setSavingDraft] = useState(false);

  const [showIncome, setShowIncome] = useState(false);
  const [showState, setShowState] = useState(false);
  const [showDistrict, setShowDistrict] = useState(false);
  const [isNewAccountState, setIsNewAccountState] = useState(Boolean(route.params?.createNew || route.params?.isNewAccount));
  const [showPendingDraftModal, setShowPendingDraftModal] = useState(false);
  const [pendingDraftData, setPendingDraftData] = useState(null);

  // Auto pre-select gender for Vivah and Mahila Sahayog when schemeCode updates
  useEffect(() => {
    if ((schemeCode === 'VIVAH_SAHAYOG' || schemeCode === 'MAHILA_SAHAYOG') && !gender) {
      setGender('महिला (Female)');
    }
  }, [schemeCode, gender]);

  const currentAge = calculateAge(dob);

  const targetFundAccountId =
    route.params?.fundAccountId ||
    route.params?.draftData?.fundAccountId ||
    (!isNewAccountState ? route.params?.draftData?.fundAccountId : null);

  const applyFormData = useCallback((formData) => {
    if (!formData) return;
    const bName = formData.beneficiaryName || formData.balikaName || formData.applicantName || '';
    if (bName) setBalikaName(bName);

    if (formData.gender) {
      setGender(formData.gender);
    } else if (schemeCode === 'VIVAH_SAHAYOG' || schemeCode === 'MAHILA_SAHAYOG') {
      setGender('महिला (Female)');
    }

    if (formData.mobileNumber) setMobileNumber(String(formData.mobileNumber));
    if (formData.dob) {
      setDob(formData.dob);
      const parts = formData.dob.split('/');
      if (parts.length === 3) {
        const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        if (!isNaN(d.getTime())) setDobDate(d);
      }
    }

    const fam = formData.memberInFamily || formData.familyMembers || '';
    if (fam) setMemberInFamily(String(fam));

    if (formData.annualIncome) {
      setAnnualIncome(formData.annualIncome);
      setAnnualIncomeLabel(formData.annualIncome);
    }

    const addr = formData.fullAddress || formData.address || '';
    if (addr) setFullAddress(addr);

    if (formData.state) {
      setStateVal(formData.state);
      setStateLabel(formData.state);
    }
    if (formData.district) {
      setDistrict(formData.district);
      setDistrictLabel(formData.district);
    }

    const acc = formData.balikaAccount || formData.accountNumber || formData.bankAccountNumber || formData.bankAccount;
    if (acc) setBalikaAccount(String(acc));

    const pan = formData.panNumber || formData.parentPan || formData.pan || formData.panCard;
    if (pan) setPanNumber(String(pan).toUpperCase());
  }, [schemeCode]);

  // Pre-fill on mount from route params or draft API (strictly isolated by sahayogType)
  useEffect(() => {
    // If editing, always populate from passed draft or fetched draft without showing block modal
    if (route.params?.isEdit) {
      const passedDraft = route.params?.draftData?.formData || route.params?.draftData;
      const passedType = (
        route.params?.draftData?.sahayogType ||
        route.params?.draftData?.schemeCode ||
        passedDraft?.sahayogType ||
        passedDraft?.schemeCode ||
        ''
      ).toUpperCase();
      const isTypeMatch = !passedType || passedType === schemeCode.toUpperCase();

      if (passedDraft && isTypeMatch) {
        applyFormData(passedDraft);
      } else {
        (async () => {
          const res = await fetchDraft({ sahayogType: schemeCode, fundAccountId: targetFundAccountId });
          if (res?.Data?.formData) {
            applyFormData(res.Data.formData);
          }
        })();
      }
      return;
    }

    // If explicit createNew is requested, prepare clean state for 2nd beneficiary
    if (route.params?.createNew) {
      setIsNewAccountState(true);
      setBalikaName('');
      setGender((schemeCode === 'VIVAH_SAHAYOG' || schemeCode === 'MAHILA_SAHAYOG') ? 'महिला (Female)' : '');
      setMobileNumber('');
      setDob('');
      setMemberInFamily('');
      setAnnualIncome('');
      setAnnualIncomeLabel('');
      setFullAddress('');
      setStateVal('');
      setStateLabel('');
      setDistrict('');
      setDistrictLabel('');
      setBalikaAccount('');
      setPanNumber('');
      return;
    }

    if (route.params?.isNewAccount) {
      (async () => {
        const res = await fetchDraft({ sahayogType: schemeCode });
        const d = res?.Data?.formData || res?.Data;
        const hasExisting = Boolean(
          d && (res?.Data?.hasDraft || d?.balikaName || d?.beneficiaryName || res?.Data?.fundAccountId)
        );
        if (hasExisting) {
          setPendingDraftData(res.Data);
          setShowPendingDraftModal(true);
        } else {
          setIsNewAccountState(true);
          setBalikaName('');
          setGender((schemeCode === 'VIVAH_SAHAYOG' || schemeCode === 'MAHILA_SAHAYOG') ? 'महिला (Female)' : '');
          setMobileNumber('');
          setDob('');
          setMemberInFamily('');
          setAnnualIncome('');
          setAnnualIncomeLabel('');
          setFullAddress('');
          setStateVal('');
          setStateLabel('');
          setDistrict('');
          setDistrictLabel('');
          setBalikaAccount('');
          setPanNumber('');
        }
      })();
      return;
    }

    const passedDraft = route.params?.draftData?.formData || route.params?.draftData;
    const passedType = (
      route.params?.draftData?.sahayogType ||
      route.params?.draftData?.schemeCode ||
      passedDraft?.sahayogType ||
      passedDraft?.schemeCode ||
      ''
    ).toUpperCase();
    const isTypeMatch = !passedType || passedType === schemeCode.toUpperCase();

    if (passedDraft && isTypeMatch) {
      applyFormData(passedDraft);
    } else {
      (async () => {
        const res = await fetchDraft({ sahayogType: schemeCode, fundAccountId: targetFundAccountId });
        if (res?.Data?.formData) {
          applyFormData(res.Data.formData);
        }
      })();
    }
  }, [route.params?.isEdit, route.params?.isNewAccount, route.params?.createNew, route.params?.draftData, schemeCode, targetFundAccountId, fetchDraft, applyFormData]);

  const handleResumePendingDraft = () => {
    setShowPendingDraftModal(false);
    if (pendingDraftData?.formData) {
      applyFormData(pendingDraftData.formData);
    } else if (pendingDraftData) {
      applyFormData(pendingDraftData);
    }
  };

  const handleEditPendingDraft = () => {
    setShowPendingDraftModal(false);
    if (pendingDraftData?.formData) {
      applyFormData(pendingDraftData.formData);
    } else if (pendingDraftData) {
      applyFormData(pendingDraftData);
    }
  };

  const handleStartNewBeneficiary = () => {
    setShowPendingDraftModal(false);
    setIsNewAccountState(true);
    setBalikaName('');
    setGender((schemeCode === 'VIVAH_SAHAYOG' || schemeCode === 'MAHILA_SAHAYOG') ? 'महिला (Female)' : '');
    setMobileNumber('');
    setDob('');
    setMemberInFamily('');
    setAnnualIncome('');
    setAnnualIncomeLabel('');
    setFullAddress('');
    setStateVal('');
    setStateLabel('');
    setDistrict('');
    setDistrictLabel('');
    setBalikaAccount('');
    setPanNumber('');
  };

  const handleClosePendingDraftModal = () => {
    setShowPendingDraftModal(false);
    navigation.goBack();
  };

  const formatDate = date => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'dismissed') { setShowDatePicker(false); return; }
    if (selectedDate) {
      setDobDate(selectedDate);
      setDob(formatDate(selectedDate));
      if (errors.dob) setErrors(prev => ({ ...prev, dob: null }));
    }
  };

  const validate = () => {
    const e = {};
    if (!balikaName.trim() || balikaName.trim().length < 2) {
      e.balikaName = `${beneficiaryShort} का नाम कम से कम 2 अक्षरों का होना चाहिए।`;
    }
    if (!gender) {
      e.gender = 'लिंग (Gender) का चयन करें।';
    }
    if (!dob) {
      e.dob = 'जन्म तिथि आवश्यक है।';
    } else {
      const [day, month, year] = dob.split('/').map(Number);
      const birth = new Date(year, month - 1, day);
      const today = new Date();
      let ageYears = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        ageYears--;
      }

      if (scheme?.minAge && ageYears < Number(scheme.minAge)) {
        e.dob = `इस योजना के लिए न्यूनतम आयु ${scheme.minAge} वर्ष होनी चाहिए।`;
      } else if (scheme?.maxAge && ageYears > Number(scheme.maxAge)) {
        e.dob = `इस योजना के लिए अधिकतम आयु ${scheme.maxAge} वर्ष से अधिक नहीं होनी चाहिए।`;
      } else if (schemeCode === 'VARISHTHA_NAGARIK_SAHAYOG' && ageYears < 60) {
        e.dob = 'वरिष्ठ नागरिक योजना हेतु आयु कम से कम 60 वर्ष होनी चाहिए।';
      } else if (schemeCode === 'BAL_SAHAYOG' && ageYears > 18) {
        e.dob = 'बाल सहयोग योजना हेतु आयु 18 वर्ष से अधिक नहीं होनी चाहिए।';
      } else if (schemeCode === 'VIVAH_SAHAYOG' && ageYears > 21) {
        e.dob = 'विवाह सहयोग योजना हेतु आयु 21 वर्ष से अधिक नहीं होनी चाहिए।';
      }
    }
    if (!/^\d{10}$/.test(mobileNumber)) e.mobileNumber = 'मोबाइल नंबर 10 अंकों का होना चाहिए।';

    if (!memberInFamily || isNaN(Number(memberInFamily)) || parseInt(memberInFamily, 10) < 1) {
      e.memberInFamily = 'परिवार के सदस्यों की कुल संख्या (कम से कम 1) दर्ज करें।';
    }

    if (!annualIncome) e.annualIncome = 'वार्षिक आय चुनें।';

    if (!fullAddress || fullAddress.trim().length < 10) {
      e.fullAddress = 'पूरा पता दर्ज करें (कम से कम 10 अक्षर)।';
    }

    if (!state) e.state = 'राज्य चुनें।';
    if (!district) e.district = 'जिला चुनें।';

    if (balikaAccount.trim() && !/^\d{9,18}$/.test(balikaAccount.trim())) {
      e.balikaAccount = 'मान्य 9 से 18 अंकों का बैंक खाता नंबर दर्ज करें।';
    }
    if (panNumber.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(panNumber.toUpperCase().trim())) {
        e.panNumber = '10 अक्षरों का मान्य PAN नंबर दर्ज करें (उदा. ABCDE1234F)।';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Top Right CTA: "बाद में पूरा करें (Save Draft)"
  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const payload = {
        sahayogType: schemeCode,
        schemeCode,
        schemeName,
        beneficiaryName: balikaName.trim(),
        balikaName: balikaName.trim(),
        gender,
        mobileNumber,
        dob,
        currentAge,
        memberInFamily: memberInFamily ? String(memberInFamily).trim() : '',
        familyMembers: memberInFamily ? String(memberInFamily).trim() : '',
        annualIncome,
        fullAddress: fullAddress.trim(),
        address: fullAddress.trim(),
        state,
        district,
        balikaAccount: balikaAccount.trim(),
        accountNumber: balikaAccount.trim(),
        bankAccountNumber: balikaAccount.trim(),
        panNumber: panNumber.toUpperCase().trim(),
        parentPan: panNumber.toUpperCase().trim(),
        pan: panNumber.toUpperCase().trim(),
        ...(targetFundAccountId && !isNewAccountState ? { fundAccountId: targetFundAccountId } : {}),
        ...(isNewAccountState ? { createNew: true } : {}),
      };
      await saveDraft(payload);
      Toast.show({
        type: 'success',
        text1: 'सफलता',
        text2: 'ड्राफ्ट सहेज लिया गया है ✅',
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'त्रुटि',
        text2: 'ड्राफ्ट सहेजने में विफल। पुनः प्रयास करें।',
      });
    } finally {
      setSavingDraft(false);
    }
  };

  // Bottom CTA: "आगे बढ़ें (दस्तावेज़ अपलोड) →"
  const handleNext = async () => {
    if (!validate()) return;
    try {
      const payload = {
        sahayogType: schemeCode,
        schemeCode,
        schemeName,
        beneficiaryName: balikaName.trim(),
        balikaName: balikaName.trim(),
        gender,
        mobileNumber,
        dob,
        currentAge,
        memberInFamily: String(memberInFamily).trim(),
        familyMembers: String(memberInFamily).trim(),
        annualIncome,
        fullAddress: fullAddress.trim(),
        address: fullAddress.trim(),
        state,
        district,
        balikaAccount: balikaAccount.trim(),
        accountNumber: balikaAccount.trim(),
        bankAccountNumber: balikaAccount.trim(),
        panNumber: panNumber.toUpperCase().trim(),
        parentPan: panNumber.toUpperCase().trim(),
        pan: panNumber.toUpperCase().trim(),
        isDraft: false,
        ...(targetFundAccountId && !isNewAccountState ? { fundAccountId: targetFundAccountId } : {}),
        ...(isNewAccountState ? { createNew: true } : {}),
      };
      const res = await step1(payload);
      if (res && (!res.Error || res.Status)) {
        const fId = res.Data?.fundAccountId || res.Data?._id || targetFundAccountId;
        navigation.navigate('FundAccountStep2', {
          fundAccountId: fId,
          step1Data: payload,
          draftData: res.Data || route.params?.draftData,
          isEdit: route.params?.isEdit,
          isNewAccount: isNewAccountState,
          createNew: isNewAccountState,
          schemeCode,
          sahayogType: schemeCode,
          scheme,
        });
      } else {
        Toast.show({ type: 'error', text1: 'त्रुटि', text2: res?.Remarks || 'Step 1 विफल हुआ।' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'त्रुटि', text2: 'कनेक्शन विफल। पुनः प्रयास करें।' });
    }
  };

  const FieldError = ({ field }) => errors[field]
    ? <Text style={s.errorText}>{errors[field]}</Text>
    : null;

  const DropdownTrigger = ({ label, value, placeholder, onPress, error }) => (
    <TouchableOpacity style={[s.input, s.dropdownTrigger, error && s.inputError]} onPress={onPress} activeOpacity={0.8}>
      <Text style={value ? s.dropdownValueText : s.placeholderText}>{value || placeholder}</Text>
      <FeatherIcon name="chevron-down" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColor }]}>
          {route.params?.isEdit ? `${schemeName} - संपादन (1/3)` : `${schemeName} - चरण 1/3`}
        </Text>
        <TouchableOpacity
          style={s.saveDraftBtn}
          onPress={handleSaveDraft}
          activeOpacity={0.75}
          disabled={savingDraft}
        >
          {savingDraft ? (
            <ActivityIndicator size="small" color={themeColor} />
          ) : (
            <Text style={[s.saveDraftBtnText, { color: themeColor }]}>बाद में पूरा करें</Text>
          )}
        </TouchableOpacity>
      </View>

      <StepProgress current={1} themeColor={themeColor} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={s.sectionTitle}>{beneficiaryShort} एवं व्यक्तिगत जानकारी</Text>

        {/* 1. Beneficiary Name */}
        <Text style={s.label}>{beneficiaryLabel} <Text style={s.req}>*</Text></Text>
        <TextInput
          style={[s.input, errors.balikaName && s.inputError]}
          placeholder={
            schemeCode === 'KISAN_SAHAYOG'
              ? 'किसान का नाम'
              : schemeCode === 'MAHILA_SAHAYOG'
              ? 'महिला का नाम'
              : schemeCode === 'VARISHTHA_NAGARIK_SAHAYOG'
              ? 'वरिष्ठ नागरिक का नाम'
              : schemeCode === 'BAL_SAHAYOG'
              ? 'बच्चे/बालक/बालिका का नाम'
              : 'लाभार्थी का नाम'
          }
          placeholderTextColor="#CBD5E1"
          value={balikaName}
          onChangeText={v => { setBalikaName(v); if (errors.balikaName) setErrors(p => ({ ...p, balikaName: null })); }}
        />
        <FieldError field="balikaName" />

        {/* 2. Gender / लिंग */}
        <Text style={s.label}>Gender / लिंग <Text style={s.req}>*</Text></Text>
        <View style={s.genderRow}>
          {GENDER_OPTIONS.map(opt => {
            const isSelected = gender === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  s.genderOption,
                  isSelected && [s.genderOptionActive, { borderColor: themeColor, backgroundColor: `${themeColor}12` }],
                  errors.gender && s.inputError,
                ]}
                onPress={() => {
                  setGender(opt.value);
                  if (errors.gender) setErrors(p => ({ ...p, gender: null }));
                }}
                activeOpacity={0.75}
              >
                <MaterialIcon
                  name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                  size={18}
                  color={isSelected ? themeColor : '#94A3B8'}
                />
                <Text style={[s.genderOptionText, isSelected && { color: themeColor, fontWeight: '800' }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <FieldError field="gender" />

        {/* 3. Date of Birth */}
        <Text style={s.label}>जन्म तिथि <Text style={s.req}>*</Text></Text>
        <TouchableOpacity
          style={[s.input, s.dropdownTrigger, errors.dob && s.inputError]}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <Text style={dob ? s.dropdownValueText : s.placeholderText}>{dob || 'दिनांक चुनें (DD/MM/YYYY)'}</Text>
          <MaterialIcon name="calendar" size={20} color="#94A3B8" />
        </TouchableOpacity>
        <FieldError field="dob" />

        {showDatePicker && (
          <DateTimePicker
            value={dobDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={onDateChange}
          />
        )}

        {/* Current Age (read-only) */}
        <Text style={s.label}>वर्तमान आयु</Text>
        <TextInput
          style={[s.input, { color: '#64748B', backgroundColor: '#F8FAFC' }]}
          value={currentAge || 'जन्म तिथि से स्वतः गणना होगी'}
          editable={false}
          placeholderTextColor="#CBD5E1"
        />

        {/* 4. Mobile Number */}
        <Text style={s.label}>मोबाइल नंबर (खाता लिंक करने हेतु) <Text style={s.req}>*</Text></Text>
        <View style={s.inputRow}>
          <TextInput
            style={[s.input, { flex: 1 }, errors.mobileNumber && s.inputError]}
            placeholder="10 अंक दर्ज करें"
            placeholderTextColor="#CBD5E1"
            keyboardType="phone-pad"
            maxLength={10}
            value={mobileNumber}
            onChangeText={v => { setMobileNumber(v.replace(/\D/g, '')); if (errors.mobileNumber) setErrors(p => ({ ...p, mobileNumber: null })); }}
          />
          {mobileNumber.length === 10 && (
            <MaterialIcon name="check-circle" size={22} color="#059669" style={{ marginLeft: 8 }} />
          )}
        </View>
        <Text style={s.mobileHint}>* संबंधित जानकारी एवं लेन-देन स्थिति इस मोबाइल नंबर से जोड़ी जाएगी।</Text>
        <FieldError field="mobileNumber" />

        {/* 5. Member in Family */}
        <Text style={s.label}>Member in Family / परिवार के सदस्यों की संख्या <Text style={s.req}>*</Text></Text>
        <TextInput
          style={[s.input, errors.memberInFamily && s.inputError]}
          placeholder="परिवार के सदस्यों की कुल संख्या (e.g. 4)"
          placeholderTextColor="#CBD5E1"
          keyboardType="number-pad"
          maxLength={3}
          value={memberInFamily}
          onChangeText={v => {
            setMemberInFamily(v.replace(/\D/g, ''));
            if (errors.memberInFamily) setErrors(p => ({ ...p, memberInFamily: null }));
          }}
        />
        <FieldError field="memberInFamily" />

        {/* 6. Annual Income */}
        <Text style={s.label}>परिवार की वार्षिक आय <Text style={s.req}>*</Text></Text>
        <DropdownTrigger
          placeholder="आय श्रेणी चुनें"
          value={annualIncomeLabel}
          onPress={() => setShowIncome(true)}
          error={errors.annualIncome}
        />
        <FieldError field="annualIncome" />

        {/* 7. Full address */}
        <Text style={s.label}>Full address / पूरा पता <Text style={s.req}>*</Text></Text>
        <TextInput
          style={[s.input, s.textArea, errors.fullAddress && s.inputError]}
          placeholder="मकान / फ्लैट नं., गली / मोहल्ला / गाँव, पोस्ट, पिन कोड सहित पूरा पता दर्ज करें"
          placeholderTextColor="#CBD5E1"
          multiline
          numberOfLines={3}
          value={fullAddress}
          onChangeText={v => {
            setFullAddress(v);
            if (errors.fullAddress) setErrors(p => ({ ...p, fullAddress: null }));
          }}
        />
        <FieldError field="fullAddress" />

        {/* 8. State */}
        <Text style={s.label}>राज्य <Text style={s.req}>*</Text></Text>
        <DropdownTrigger
          placeholder="राज्य चुनें"
          value={stateLabel}
          onPress={() => setShowState(true)}
          error={errors.state}
        />
        <FieldError field="state" />

        {/* 9. District */}
        <Text style={s.label}>जिला <Text style={s.req}>*</Text></Text>
        <DropdownTrigger
          placeholder={state ? 'जिला चुनें' : 'पहले राज्य चुनें'}
          value={districtLabel}
          onPress={() => state && setShowDistrict(true)}
          error={errors.district}
        />
        <FieldError field="district" />

        {/* Beneficiary Bank Account (Optional) */}
        <Text style={s.label}>{beneficiaryShort} का बैंक खाता नंबर (वैकल्पिक)</Text>
        <TextInput
          style={[s.input, errors.balikaAccount && s.inputError]}
          placeholder="9 से 18 अंकों का खाता संख्या"
          placeholderTextColor="#CBD5E1"
          keyboardType="number-pad"
          maxLength={18}
          value={balikaAccount}
          onChangeText={v => {
            setBalikaAccount(v.replace(/\D/g, ''));
            if (errors.balikaAccount) setErrors(p => ({ ...p, balikaAccount: null }));
          }}
        />
        <FieldError field="balikaAccount" />

        {/* PAN Card (Optional) */}
        <Text style={s.label}>
          {isMinorScheme ? 'अभिभावक/माता-पिता का पैन कार्ड नंबर (वैकल्पिक)' : 'पैन कार्ड नंबर (वैकल्पिक)'}
        </Text>
        <TextInput
          style={[s.input, errors.panNumber && s.inputError, { textTransform: 'uppercase' }]}
          placeholder="ABCDE1234F"
          placeholderTextColor="#CBD5E1"
          autoCapitalize="characters"
          maxLength={10}
          value={panNumber}
          onChangeText={v => {
            setPanNumber(v.toUpperCase().trim());
            if (errors.panNumber) setErrors(p => ({ ...p, panNumber: null }));
          }}
        />
        <FieldError field="panNumber" />

        {/* CTA */}
        <TouchableOpacity
          style={[s.ctaBtn, { backgroundColor: themeColor }]}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" />
            : <><Text style={s.ctaBtnText}>{route.params?.isEdit ? 'सहेजें और आगे बढ़ें' : 'आगे बढ़ें (दस्तावेज़ अपलोड)'}</Text><FeatherIcon name="arrow-right" size={20} color="#FFF" /></>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Dropdowns */}
      <DropdownModal
        visible={showIncome} title="वार्षिक आय चुनें"
        options={ANNUAL_INCOME_OPTIONS}
        selected={annualIncome}
        themeColor={themeColor}
        onSelect={(val) => { setAnnualIncome(val); setAnnualIncomeLabel(val); setShowIncome(false); if (errors.annualIncome) setErrors(p => ({ ...p, annualIncome: null })); }}
        onClose={() => setShowIncome(false)}
      />
      <DropdownModal
        visible={showState} title="राज्य चुनें"
        options={STATE_OPTIONS}
        selected={state}
        themeColor={themeColor}
        onSelect={(val, lbl) => { setStateVal(val); setStateLabel(lbl); setDistrict(''); setDistrictLabel(''); setShowState(false); if (errors.state) setErrors(p => ({ ...p, state: null })); }}
        onClose={() => setShowState(false)}
      />
      <DropdownModal
        visible={showDistrict} title="जिला चुनें"
        options={getDistrictOptions(state)}
        selected={district}
        themeColor={themeColor}
        onSelect={(val) => { setDistrict(val); setDistrictLabel(val); setShowDistrict(false); if (errors.district) setErrors(p => ({ ...p, district: null })); }}
        onClose={() => setShowDistrict(false)}
      />

      {/* Block Modal */}
      <PendingDraftModal
        visible={showPendingDraftModal}
        beneficiaryName={pendingDraftData?.formData?.beneficiaryName || pendingDraftData?.formData?.balikaName || pendingDraftData?.balikaName}
        beneficiaryLabel={beneficiaryShort}
        schemeName={schemeName}
        themeColor={themeColor}
        onResume={handleResumePendingDraft}
        onEdit={handleEditPendingDraft}
        onStartNew={handleStartNewBeneficiary}
        onClose={handleClosePendingDraftModal}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 2 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#D81B60' },
  saveDraftBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFF0F5',
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  saveDraftBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#D81B60',
  },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 14 },
  req: { color: '#D81B60' },
  input: {
    height: 48, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0',
    paddingHorizontal: 14, fontSize: 14, color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 86,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  genderRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  genderOptionActive: {
    borderWidth: 1.5,
  },
  genderOptionText: { fontSize: 12.5, fontWeight: '700', color: '#475569' },
  inputError: { borderColor: '#EF4444' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  mobileHint: { fontSize: 11.5, color: '#059669', marginTop: 5, lineHeight: 16, fontWeight: '600' },
  dropdownTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropdownValueText: { fontSize: 14, color: '#1E293B', flex: 1 },
  placeholderText: { fontSize: 14, color: '#CBD5E1', flex: 1 },
  errorText: { fontSize: 11.5, color: '#EF4444', marginTop: 4, fontWeight: '600' },
  ctaBtn: {
    backgroundColor: '#D81B60', borderRadius: 30, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 24,
    elevation: 4, shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  ctaBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});

const pdm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    position: 'relative',
  },
  closeIconBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  iconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF0F5',
    borderWidth: 2,
    borderColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#D81B60',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailBox: {
    width: '100%',
    backgroundColor: '#FFF5F8',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    marginBottom: 20,
  },
  detailText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    textAlign: 'center',
  },
  highlight: {
    fontWeight: '800',
    color: '#1E293B',
  },
  resumeBtn: {
    width: '100%',
    backgroundColor: '#D81B60',
    borderRadius: 28,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginBottom: 10,
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  editBtn: {
    width: '100%',
    backgroundColor: '#FFF0F5',
    borderWidth: 1.5,
    borderColor: '#FCE7F3',
    borderRadius: 28,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  editBtnText: {
    color: '#D81B60',
    fontSize: 14.5,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
});
