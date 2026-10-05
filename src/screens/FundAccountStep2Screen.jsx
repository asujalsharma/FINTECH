import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DocumentPicker, { isCancel } from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import useFundAccount from '../hooks/useFundAccount';

// Step Progress
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

const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

// 5 Mandatory Documents
const DOC_CONFIGS = [
  {
    key: 'balikaAadhaar',
    title: 'बच्ची का आधार कार्ड',
    subtitle: 'PDF / JPG / PNG (अधिकतम 5MB)',
    icon: 'cloud-upload-outline',
  },
  {
    key: 'birthCertificate',
    title: 'बच्ची का जन्म प्रमाण पत्र',
    subtitle: 'PDF / JPG / PNG (अधिकतम 5MB)',
    icon: 'cloud-upload-outline',
  },
  {
    key: 'balikaPhoto',
    title: 'बच्ची का पासपोर्ट साइज फोटो',
    subtitle: 'JPG / PNG (अधिकतम 5MB)',
    icon: 'cloud-upload-outline',
  },
  {
    key: 'parentAadhaar',
    title: 'मम्मी-पापा के आधार कार्ड',
    subtitle: 'PDF / JPG / PNG (अधिकतम 5MB)',
    icon: 'cloud-upload-outline',
  },
  {
    key: 'parentBankPassbook',
    title: 'मम्मी या पापा की बैंक पासबुक की कॉपी',
    subtitle: 'PDF / JPG / PNG (अधिकतम 5MB)',
    icon: 'cloud-upload-outline',
  },
];

const UploadCard = ({ config, file, existingPath, onPick }) => {
  const hasFile = !!file;
  const hasExisting = !hasFile && !!existingPath;
  const isSelected = hasFile || hasExisting;

  return (
    <TouchableOpacity
      style={[uc.card, isSelected && uc.cardUploaded]}
      onPress={onPick}
      activeOpacity={0.8}
    >
      <View style={[uc.iconCircle, isSelected && uc.iconCircleUploaded]}>
        {isSelected ? (
          <MaterialIcon name="check-circle" size={26} color="#059669" />
        ) : (
          <MaterialIcon name="cloud-upload-outline" size={26} color="#D81B60" />
        )}
      </View>

      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={uc.cardTitle}>{config.title}</Text>

        {hasFile ? (
          <View style={uc.selectedInfoContainer}>
            <Text style={uc.fileName} numberOfLines={1}>
              {file.name || file.fileName || 'फ़ाइल चुनी गई'}
            </Text>
            {Boolean(file.fileSize || file.size) && (
              <Text style={uc.fileSizeText}>
                ({formatFileSize(file.fileSize || file.size)})
              </Text>
            )}
          </View>
        ) : hasExisting ? (
          <Text style={uc.existingText} numberOfLines={1}>
            ✓ पूर्व में अपलोड किया गया दस्तावेज़
          </Text>
        ) : (
          <Text style={uc.cardSubtitle}>{config.subtitle}</Text>
        )}

        {isSelected && (
          <View style={uc.reSelectContainer}>
            <MaterialIcon name="refresh" size={13} color="#D81B60" />
            <Text style={uc.reSelectText}>पुनः चुनें</Text>
          </View>
        )}
      </View>

      {!isSelected ? (
        <View style={uc.uploadBadge}>
          <MaterialIcon name="upload" size={18} color="#D81B60" />
        </View>
      ) : (
        <View style={uc.checkBadge}>
          <FeatherIcon name="check" size={16} color="#059669" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const uc = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#F472B6', // Dashed pink border
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFF5F8',
  },
  cardUploaded: {
    borderColor: '#34D399',
    backgroundColor: '#F0FDF4',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUploaded: {
    backgroundColor: '#DCFCE7',
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  selectedInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  fileName: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
    maxWidth: '85%',
  },
  fileSizeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  existingText: {
    fontSize: 11.5,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  reSelectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  reSelectText: {
    fontSize: 11,
    color: '#D81B60',
    fontWeight: '700',
  },
  uploadBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function FundAccountStep2Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const fundAccountId = route.params?.fundAccountId;

  const { step2, loading, profile, fetchProfile } = useFundAccount();
  const [files, setFiles] = useState({
    balikaAadhaar: null,
    birthCertificate: null,
    balikaPhoto: null,
    parentAadhaar: null,
    parentBankPassbook: null,
  });
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const pickDocument = async (docKey) => {
    try {
      const allowedTypes = docKey === 'balikaPhoto'
        ? ['image/jpeg', 'image/png']
        : ['application/pdf', 'image/jpeg', 'image/png'];

      let picked = null;

      // 1. Try DocumentPicker
      if (DocumentPicker?.pickSingle) {
        try {
          const res = await DocumentPicker.pickSingle({
            type: allowedTypes,
            copyTo: 'cachesDirectory',
          });
          if (res) {
            const size = res.size || 0;
            if (size > MAX_SIZE_BYTES) {
              Alert.alert('फ़ाइल बड़ी है', 'फ़ाइल का आकार 5MB से अधिक नहीं होना चाहिए।');
              return;
            }
            picked = {
              uri: res.fileCopyUri || res.uri,
              name: res.name || `${docKey}.pdf`,
              type: res.type || (res.name?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
              fileSize: size,
            };
          }
        } catch (docErr) {
          if (isCancel(docErr) || DocumentPicker?.isCancel?.(docErr)) {
            return;
          }
          console.log('DocumentPicker note:', docErr?.message);
        }
      }

      // 2. Fallback to image picker if needed
      if (!picked) {
        const result = await launchImageLibrary({
          mediaType: 'mixed',
          quality: 0.85,
          selectionLimit: 1,
        });
        if (result.didCancel || !result.assets?.length) return;
        const asset = result.assets[0];
        const size = asset.fileSize || 0;
        if (size > MAX_SIZE_BYTES) {
          Alert.alert('फ़ाइल बड़ी है', 'फ़ाइल का आकार 5MB से अधिक नहीं होना चाहिए।');
          return;
        }
        picked = {
          uri: asset.uri,
          name: asset.fileName || `${docKey}.jpg`,
          type: asset.type || 'image/jpeg',
          fileSize: size,
        };
      }

      if (picked) {
        setFiles(prev => ({ ...prev, [docKey]: picked }));
        if (errors[docKey]) setErrors(prev => ({ ...prev, [docKey]: null }));
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'त्रुटि', text2: 'फ़ाइल चुनने में समस्या आई।' });
    }
  };

  const validate = () => {
    const e = {};
    const existing = profile?.documents || {};

    if (!files.balikaAadhaar && !existing.balikaAadhaar && !profile?.balikaAadhaar) {
      e.balikaAadhaar = 'बच्ची का आधार कार्ड अपलोड करें।';
    }
    if (!files.birthCertificate && !existing.birthCertificate && !profile?.birthCertificate) {
      e.birthCertificate = 'बच्ची का जन्म प्रमाण पत्र अपलोड करें।';
    }
    if (!files.balikaPhoto && !existing.balikaPhoto && !profile?.balikaPhoto) {
      e.balikaPhoto = 'बच्ची का पासपोर्ट साइज फोटो अपलोड करें।';
    }
    if (!files.parentAadhaar && !existing.parentAadhaar && !profile?.parentAadhaar) {
      e.parentAadhaar = 'मम्मी-पापा के आधार कार्ड अपलोड करें।';
    }
    if (!files.parentBankPassbook && !existing.parentBankPassbook && !profile?.parentBankPassbook) {
      e.parentBankPassbook = 'बैंक पासबुक की कॉपी अपलोड करें।';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) {
      Toast.show({ type: 'error', text1: 'त्रुटि', text2: 'कृपया सभी 5 अनिवार्य दस्तावेज़ अपलोड करें।' });
      return;
    }
    const fId = fundAccountId || profile?.fundAccountId || profile?._id;
    if (!fId) {
      Toast.show({ type: 'error', text1: 'त्रुटि', text2: 'Fund Account ID नहीं मिली। Step 1 से शुरू करें।' });
      return;
    }

    const hasAnyNewFile = Boolean(
      files.balikaAadhaar ||
      files.birthCertificate ||
      files.balikaPhoto ||
      files.parentAadhaar ||
      files.parentBankPassbook
    );

    const fullFilesPayload = {
      balikaAadhaar: files.balikaAadhaar || profile?.documents?.balikaAadhaar || profile?.balikaAadhaar,
      birthCertificate: files.birthCertificate || profile?.documents?.birthCertificate || profile?.birthCertificate,
      balikaPhoto: files.balikaPhoto || profile?.documents?.balikaPhoto || profile?.balikaPhoto,
      parentAadhaar: files.parentAadhaar || profile?.documents?.parentAadhaar || profile?.parentAadhaar,
      parentBankPassbook: files.parentBankPassbook || profile?.documents?.parentBankPassbook || profile?.parentBankPassbook,
    };

    if (!hasAnyNewFile) {
      navigation.navigate('FundAccountStep3', {
        fundAccountId: fId,
        step1Data: route.params?.step1Data,
        files: fullFilesPayload,
      });
      return;
    }

    try {
      const res = await step2(fId, files);
      if (res?.Status) {
        navigation.navigate('FundAccountStep3', {
          fundAccountId: fId,
          step1Data: route.params?.step1Data,
          files: fullFilesPayload,
        });
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
        <Text style={s.sectionTitle}>5 अनिवार्य दस्तावेज़ अपलोड करें</Text>

        {/* Info Banner */}
        <View style={s.infoBanner}>
          <Text style={s.infoBannerText}>
            🛡️ सभी 5 दस्तावेज़ अनिवार्य हैं। इनका सत्यापन SARVANA टीम द्वारा मैन्युअल रूप से किया जाएगा।
          </Text>
        </View>

        {DOC_CONFIGS.map(config => (
          <View key={config.key}>
            <UploadCard
              config={config}
              file={files[config.key]}
              existingPath={profile?.documents?.[config.key] || profile?.[config.key]}
              onPick={() => pickDocument(config.key)}
            />
            {errors[config.key] && <Text style={s.errorText}>{errors[config.key]}</Text>}
          </View>
        ))}

        {/* Tips */}
        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>📋 दिशानिर्देश</Text>
          {[
            'दस्तावेज़ स्पष्ट और पठनीय होने चाहिए',
            'प्रत्येक फ़ाइल का आकार 5MB से कम होना अनिवार्य है',
            'PDF, JPG या PNG प्रारूप स्वीकार्य हैं',
            'बालिका की फोटो हाल ही में ली गई होनी चाहिए',
            'बैंक पासबुक में खाता संख्या और IFSC कोड स्पष्ट दिखना चाहिए',
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
  errorText: { fontSize: 11.5, color: '#EF4444', fontWeight: '600', marginTop: -6, marginBottom: 10, marginLeft: 4 },
  tipsCard: {
    backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#E2E8F0', marginTop: 6, marginBottom: 8,
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
