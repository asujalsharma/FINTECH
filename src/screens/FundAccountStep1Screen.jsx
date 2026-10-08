import React, { useState, useCallback } from 'react';
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
import { ANNUAL_INCOME_OPTIONS, STATE_OPTIONS, getDistrictOptions } from '../constants/indiaStatesDistricts';

// ─── Step Progress ─────────────────────────────────────────────────────────────
const StepProgress = ({ current }) => (
  <View style={sp.wrapper}>
    {[{ n: 1, label: 'व्यक्तिगत\nजानकारी' }, { n: 2, label: 'दस्तावेज़\nअपलोड' }, { n: 3, label: 'समीक्षा\nसबमिट' }].map((step, idx) => (
      <React.Fragment key={step.n}>
        <View style={sp.stepItem}>
          <View style={[sp.circle, current >= step.n && sp.circleActive]}>
            {current > step.n
              ? <FeatherIcon name="check" size={14} color="#FFFFFF" />
              : <Text style={[sp.circleNum, current >= step.n && sp.circleNumActive]}>{step.n}</Text>
            }
          </View>
          <Text style={[sp.label, current === step.n && sp.labelActive]}>{step.label}</Text>
        </View>
        {idx < 2 && <View style={[sp.line, current > step.n && sp.lineActive]} />}
      </React.Fragment>
    ))}
  </View>
);

const sp = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFF0F5' },
  stepItem: { alignItems: 'center', flex: 0 },
  circle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  circleActive: { backgroundColor: '#D81B60', borderColor: '#D81B60' },
  circleNum: { fontSize: 13, fontWeight: '700', color: '#94A3B8' },
  circleNumActive: { color: '#FFFFFF' },
  label: { fontSize: 10, color: '#94A3B8', textAlign: 'center', marginTop: 5, lineHeight: 14, fontWeight: '600' },
  labelActive: { color: '#D81B60' },
  line: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginTop: 15, marginHorizontal: 4 },
  lineActive: { backgroundColor: '#D81B60' },
});

// ─── Dropdown Modal ─────────────────────────────────────────────────────────────
const DropdownModal = ({ visible, title, options, onSelect, onClose, selected }) => (
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
              <TouchableOpacity style={[dm.option, isSelected && dm.optionSelected]} onPress={() => onSelect(value, label)}>
                <Text style={[dm.optionText, isSelected && dm.optionTextSelected]}>{label}</Text>
                {isSelected && <FeatherIcon name="check" size={16} color="#D81B60" />}
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
  optionSelected: { backgroundColor: '#FFF0F5' },
  optionText: { fontSize: 14, color: '#334155', flex: 1 },
  optionTextSelected: { color: '#D81B60', fontWeight: '700' },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function FundAccountStep1Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { step1, saveDraft, fetchDraft, loading } = useFundAccount();

  const [balikaName, setBalikaName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dob, setDob] = useState('');
  const [dobDate, setDobDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [annualIncome, setAnnualIncome] = useState('');
  const [annualIncomeLabel, setAnnualIncomeLabel] = useState('');
  const [state, setStateVal] = useState('');
  const [stateLabel, setStateLabel] = useState('');
  const [district, setDistrict] = useState('');
  const [districtLabel, setDistrictLabel] = useState('');
  const [errors, setErrors] = useState({});
  const [savingDraft, setSavingDraft] = useState(false);

  const [showIncome, setShowIncome] = useState(false);
  const [showState, setShowState] = useState(false);
  const [showDistrict, setShowDistrict] = useState(false);

  const currentAge = calculateAge(dob);

  const applyFormData = useCallback((formData) => {
    if (!formData) return;
    if (formData.balikaName) setBalikaName(formData.balikaName);
    if (formData.mobileNumber) setMobileNumber(String(formData.mobileNumber));
    if (formData.dob) {
      setDob(formData.dob);
      const parts = formData.dob.split('/');
      if (parts.length === 3) {
        const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        if (!isNaN(d.getTime())) setDobDate(d);
      }
    }
    if (formData.annualIncome) {
      setAnnualIncome(formData.annualIncome);
      setAnnualIncomeLabel(formData.annualIncome);
    }
    if (formData.state) {
      setStateVal(formData.state);
      setStateLabel(formData.state);
    }
    if (formData.district) {
      setDistrict(formData.district);
      setDistrictLabel(formData.district);
    }
  }, []);

  // Pre-fill on mount from route params or draft API
  React.useEffect(() => {
    const passedDraft = route.params?.draftData?.formData || route.params?.draftData;
    if (passedDraft) {
      applyFormData(passedDraft);
    } else {
      (async () => {
        const res = await fetchDraft();
        if (res?.Data?.formData) {
          applyFormData(res.Data.formData);
        }
      })();
    }
  }, [route.params?.draftData, fetchDraft, applyFormData]);

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
    if (!balikaName.trim() || balikaName.trim().length < 2) e.balikaName = 'बालिका का नाम कम से कम 2 अक्षरों का होना चाहिए।';
    if (!/^\d{10}$/.test(mobileNumber)) e.mobileNumber = 'मोबाइल नंबर 10 अंकों का होना चाहिए।';
    if (!dob) e.dob = 'जन्म तिथि आवश्यक है।';
    else {
      const [day, month, year] = dob.split('/').map(Number);
      const birth = new Date(year, month - 1, day);
      const today = new Date();
      const ageYears = today.getFullYear() - birth.getFullYear();
      if (ageYears > 18) e.dob = 'बालिका की आयु 18 वर्ष से अधिक नहीं होनी चाहिए।';
    }
    if (!annualIncome) e.annualIncome = 'वार्षिक आय चुनें।';
    if (!state) e.state = 'राज्य चुनें।';
    if (!district) e.district = 'जिला चुनें।';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Top Right CTA: "बाद में पूरा करें (Save Draft)"
  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const payload = {
        balikaName: balikaName.trim(),
        mobileNumber,
        dob,
        currentAge,
        annualIncome,
        state,
        district,
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
        balikaName: balikaName.trim(),
        mobileNumber,
        dob,
        currentAge,
        annualIncome,
        state,
        district,
        isDraft: false,
      };
      const res = await step1(payload);
      if (res && (!res.Error || res.Status)) {
        const fId = res.Data?.fundAccountId || route.params?.draftData?.fundAccountId;
        navigation.navigate('FundAccountStep2', {
          fundAccountId: fId,
          step1Data: payload,
          draftData: route.params?.draftData,
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
        <Text style={s.headerTitle}>Vivah Sahayog - चरण 1/3</Text>
        <TouchableOpacity
          style={s.saveDraftBtn}
          onPress={handleSaveDraft}
          activeOpacity={0.75}
          disabled={savingDraft}
        >
          {savingDraft ? (
            <ActivityIndicator size="small" color="#D81B60" />
          ) : (
            <Text style={s.saveDraftBtnText}>बाद में पूरा करें</Text>
          )}
        </TouchableOpacity>
      </View>

      <StepProgress current={1} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={s.sectionTitle}>बालिका एवं अभिभावक की जानकारी</Text>

        {/* Baalika Name */}
        <Text style={s.label}>बालिका का नाम <Text style={s.req}>*</Text></Text>
        <TextInput
          style={[s.input, errors.balikaName && s.inputError]}
          placeholder="कुमारी आराध्या"
          placeholderTextColor="#CBD5E1"
          value={balikaName}
          onChangeText={v => { setBalikaName(v); if (errors.balikaName) setErrors(p => ({ ...p, balikaName: null })); }}
        />
        <FieldError field="balikaName" />

        {/* Mobile Number */}
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

        {/* Date of Birth */}
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

        {/* Annual Income */}
        <Text style={s.label}>परिवार की वार्षिक आय <Text style={s.req}>*</Text></Text>
        <DropdownTrigger
          placeholder="आय श्रेणी चुनें"
          value={annualIncomeLabel}
          onPress={() => setShowIncome(true)}
          error={errors.annualIncome}
        />
        <FieldError field="annualIncome" />

        {/* State */}
        <Text style={s.label}>राज्य <Text style={s.req}>*</Text></Text>
        <DropdownTrigger
          placeholder="राज्य चुनें"
          value={stateLabel}
          onPress={() => setShowState(true)}
          error={errors.state}
        />
        <FieldError field="state" />

        {/* District */}
        <Text style={s.label}>जिला <Text style={s.req}>*</Text></Text>
        <DropdownTrigger
          placeholder={state ? 'जिला चुनें' : 'पहले राज्य चुनें'}
          value={districtLabel}
          onPress={() => state && setShowDistrict(true)}
          error={errors.district}
        />
        <FieldError field="district" />

        {/* CTA */}
        <TouchableOpacity style={s.ctaBtn} onPress={handleNext} activeOpacity={0.85} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#FFFFFF" />
            : <><Text style={s.ctaBtnText}>आगे बढ़ें</Text><FeatherIcon name="arrow-right" size={20} color="#FFF" /></>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Dropdowns */}
      <DropdownModal
        visible={showIncome} title="वार्षिक आय चुनें"
        options={ANNUAL_INCOME_OPTIONS}
        selected={annualIncome}
        onSelect={(val) => { setAnnualIncome(val); setAnnualIncomeLabel(val); setShowIncome(false); if (errors.annualIncome) setErrors(p => ({ ...p, annualIncome: null })); }}
        onClose={() => setShowIncome(false)}
      />
      <DropdownModal
        visible={showState} title="राज्य चुनें"
        options={STATE_OPTIONS}
        selected={state}
        onSelect={(val, lbl) => { setStateVal(val); setStateLabel(lbl); setDistrict(''); setDistrictLabel(''); setShowState(false); if (errors.state) setErrors(p => ({ ...p, state: null })); }}
        onClose={() => setShowState(false)}
      />
      <DropdownModal
        visible={showDistrict} title="जिला चुनें"
        options={getDistrictOptions(state)}
        selected={district}
        onSelect={(val, lbl) => { setDistrict(val); setDistrictLabel(lbl); setShowDistrict(false); if (errors.district) setErrors(p => ({ ...p, district: null })); }}
        onClose={() => setShowDistrict(false)}
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
