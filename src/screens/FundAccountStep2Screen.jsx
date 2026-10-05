import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import COLORS from '../constants/colors';
import useFundAccount from '../hooks/useFundAccount';

// Step Progress (reusable)
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

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const DOC_CONFIGS = [
  {
    key: 'birthCertificate',
    title: 'बालिका का जन्म प्रमाण पत्र',
    subtitle: 'PDF / JPG (अधिकतम 5MB)',
    icon: 'file-document-outline',
    accept: ['image/jpeg', 'image/png'],
  },
  {
    key: 'parentAadhaar',
    title: 'माता-पिता का आधार कार्ड',
    subtitle: 'PDF / JPG (अधिकतम 5MB)',
    icon: 'card-account-details-outline',
    accept: ['image/jpeg', 'image/png'],
  },
  {
    key: 'balikaPhoto',
    title: 'बालिका की फोटो',
    subtitle: 'JPG / PNG',
    icon: 'camera-outline',
    accept: ['image/jpeg', 'image/png'],
  },
];

const UploadCard = ({ config, file, existingPath, onPick }) => {
  const hasFile = !!file;
  const hasExisting = !hasFile && !!existingPath;
  return (
    <TouchableOpacity style={[uc.card, (hasFile || hasExisting) && uc.cardUploaded]} onPress={onPick} activeOpacity={0.8}>
      <View style={uc.iconCircle}>
        <MaterialIcon
          name={(hasFile || hasExisting) ? 'check-circle' : config.icon}
          size={28}
          color={(hasFile || hasExisting) ? '#059669' : '#D81B60'}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={uc.cardTitle}>{config.title}</Text>
        {hasFile ? (
          <>
            <Text style={uc.fileName} numberOfLines={1}>{file.name || file.fileName || 'फ़ाइल चुनी गई'}</Text>
            <Text style={uc.reSelect}>✎ पुनः चुनें</Text>
          </>
        ) : hasExisting ? (
          <>
            <Text style={uc.fileName} numberOfLines={1}>✓ पूर्व में अपलोड किया गया दस्तावेज़</Text>
            <Text style={uc.reSelect}>✎ नया दस्तावेज़ बदलें</Text>
          </>
        ) : (
          <Text style={uc.cardSubtitle}>{config.subtitle}</Text>
        )}
      </View>
      {(!hasFile && !hasExisting) && <MaterialIcon name="upload" size={22} color="#D81B60" />}
    </TouchableOpacity>
  );
};

const uc = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#FBCFE8',
    borderRadius: 14, padding: 14, marginBottom: 14,
    backgroundColor: '#FFF5F8',
  },
  cardUploaded: { borderColor: '#A7F3D0', backgroundColor: '#F0FDF4', borderStyle: 'solid' },
  iconCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFF0F5', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 13.5, fontWeight: '700', color: '#1E293B' },
  cardSubtitle: { fontSize: 11.5, color: '#94A3B8', marginTop: 2 },
  fileName: { fontSize: 12, color: '#059669', marginTop: 2, fontWeight: '600' },
  reSelect: { fontSize: 11, color: '#D81B60', marginTop: 3, fontWeight: '600' },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function FundAccountStep2Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const fundAccountId = route.params?.fundAccountId;

  const { step2, loading, profile, fetchProfile } = useFundAccount();
  const [files, setFiles] = useState({ birthCertificate: null, parentAadhaar: null, balikaPhoto: null });
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const pickFile = async (docKey) => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        quality: 0.85,
        selectionLimit: 1,
      });
      if (result.didCancel || !result.assets?.length) return;
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_SIZE_BYTES) {
        Alert.alert('फ़ाइल बड़ी है', 'फ़ाइल का आकार 5MB से अधिक नहीं होना चाहिए।');
        return;
      }
      setFiles(prev => ({ ...prev, [docKey]: { uri: asset.uri, name: asset.fileName, type: asset.type, fileSize: asset.fileSize } }));
      if (errors[docKey]) setErrors(prev => ({ ...prev, [docKey]: null }));
    } catch (e) {
      Toast.show({ type: 'error', text1: 'त्रुटि', text2: 'फ़ाइल चुनने में समस्या आई।' });
    }
  };

  const validate = () => {
    const e = {};
    const existing = profile?.documents || {};
    if (!files.birthCertificate && !existing.birthCertificate && !profile?.birthCertificate) {
      e.birthCertificate = 'जन्म प्रमाण पत्र अपलोड करें।';
    }
    if (!files.parentAadhaar && !existing.parentAadhaar && !profile?.parentAadhaar) {
      e.parentAadhaar = 'माता-पिता का आधार कार्ड अपलोड करें।';
    }
    if (!files.balikaPhoto && !existing.balikaPhoto && !profile?.balikaPhoto) {
      e.balikaPhoto = 'बालिका की फोटो अपलोड करें।';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) {
      Toast.show({ type: 'error', text1: 'त्रुटि', text2: 'कृपया सभी दस्तावेज़ अपलोड करें।' });
      return;
    }
    const fId = fundAccountId || profile?.fundAccountId || profile?._id;
    if (!fId) {
      Toast.show({ type: 'error', text1: 'त्रुटि', text2: 'Fund Account ID नहीं मिली। Step 1 से शुरू करें।' });
      return;
    }
    const hasAnyNewFile = files.birthCertificate || files.parentAadhaar || files.balikaPhoto;
    if (!hasAnyNewFile) {
      navigation.navigate('FundAccountStep3', {
        fundAccountId: fId,
        step1Data: route.params?.step1Data,
        files: {
          birthCertificate: profile?.documents?.birthCertificate || profile?.birthCertificate,
          parentAadhaar: profile?.documents?.parentAadhaar || profile?.parentAadhaar,
          balikaPhoto: profile?.documents?.balikaPhoto || profile?.balikaPhoto,
        },
      });
      return;
    }
    try {
      const res = await step2(fId, files);
      if (res?.Status) {
        navigation.navigate('FundAccountStep3', { fundAccountId: fId, step1Data: route.params?.step1Data, files });
      } else {
        Toast.show({ type: 'error', text1: 'त्रुटि', text2: res?.Remarks || 'दस्तावेज़ अपलोड विफल।' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'त्रुटि', text2: 'अपलोड विफल। पुनः प्रयास करें।' });
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Vivah Sahayog - आवेदन</Text>
        <View style={{ width: 26 }} />
      </View>

      <StepProgress current={2} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>आवश्यक दस्तावेज़ अपलोड करें</Text>

        {/* Info Banner */}
        <View style={s.infoBanner}>
          <Text style={s.infoBannerText}>🛡️ दस्तावेज़ों का सत्यापन SARVANA टीम द्वारा मैन्युअल रूप से किया जाएगा।</Text>
        </View>

        {DOC_CONFIGS.map(config => (
          <View key={config.key}>
            <UploadCard
              config={config}
              file={files[config.key]}
              existingPath={profile?.documents?.[config.key] || profile?.[config.key]}
              onPick={() => pickFile(config.key)}
            />
            {errors[config.key] && <Text style={s.errorText}>{errors[config.key]}</Text>}
          </View>
        ))}

        {/* Tips */}
        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>📋 दिशानिर्देश</Text>
          {[
            'दस्तावेज़ स्पष्ट और पठनीय होने चाहिए',
            'प्रत्येक फ़ाइल का अधिकतम आकार 5MB',
            'JPG / PNG / PDF स्वीकार्य हैं',
            'बालिका की फोटो हाल की (recent) होनी चाहिए',
          ].map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <MaterialIcon name="check-circle-outline" size={15} color="#059669" />
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={s.ctaBtn} onPress={handleNext} activeOpacity={0.85} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#FFFFFF" />
            : <><Text style={s.ctaBtnText}>आगे बढ़ें</Text><FeatherIcon name="arrow-right" size={20} color="#FFF" /></>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 14 },
  infoBanner: {
    backgroundColor: '#F0FDF4', borderRadius: 10,
    padding: 12, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 16,
  },
  infoBannerText: { fontSize: 13, color: '#166534', fontWeight: '600', lineHeight: 18 },
  errorText: { fontSize: 11.5, color: '#EF4444', fontWeight: '600', marginTop: -8, marginBottom: 8, marginLeft: 4 },
  tipsCard: {
    backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8,
  },
  tipsTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 10 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  tipText: { fontSize: 12.5, color: '#475569', flex: 1 },
  ctaBtn: {
    backgroundColor: '#D81B60', borderRadius: 30, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 16,
    elevation: 4, shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  ctaBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
