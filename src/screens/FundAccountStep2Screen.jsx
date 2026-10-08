import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator, Alert, Linking, Image, Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DocumentPicker, { isCancel } from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import useFundAccount, { getDocumentUrl } from '../hooks/useFundAccount';

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
  },
  {
    key: 'birthCertificate',
    title: 'बच्ची का जन्म प्रमाण पत्र',
    subtitle: 'PDF / JPG / PNG (अधिकतम 5MB)',
  },
  {
    key: 'balikaPhoto',
    title: 'बच्ची का पासपोर्ट साइज फोटो',
    subtitle: 'JPG / PNG (अधिकतम 5MB)',
  },
  {
    key: 'parentAadhaar',
    title: 'मम्मी-पापा के आधार कार्ड',
    subtitle: 'PDF / JPG / PNG (अधिकतम 5MB)',
  },
  {
    key: 'parentBankPassbook',
    title: 'मम्मी या पापा की बैंक पासबुक की कॉपी',
    subtitle: 'PDF / JPG / PNG (अधिकतम 5MB)',
  },
];

const UploadCard = ({ config, uploadedValue, isUploading, onPick, onView }) => {
  const isUploaded = Boolean(uploadedValue);

  return (
    <View style={[uc.card, isUploaded && uc.cardUploaded]}>
      <View style={[uc.iconCircle, isUploaded && uc.iconCircleUploaded]}>
        {isUploading ? (
          <ActivityIndicator size="small" color="#D81B60" />
        ) : isUploaded ? (
          <MaterialIcon name="check-circle" size={26} color="#059669" />
        ) : (
          <MaterialIcon name="cloud-upload-outline" size={26} color="#D81B60" />
        )}
      </View>

      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={uc.cardTitle}>{config.title}</Text>

        {isUploading ? (
          <Text style={uc.uploadingText}>अपलोड हो रहा है...</Text>
        ) : isUploaded ? (
          <View style={uc.uploadedRow}>
            <Text style={uc.fileName} numberOfLines={1}>
              {typeof uploadedValue === 'string' && !uploadedValue.startsWith('http') && !uploadedValue.includes('/')
                ? uploadedValue
                : '✓ अपलोड हो चुका है'}
            </Text>
          </View>
        ) : (
          <Text style={uc.cardSubtitle}>{config.subtitle}</Text>
        )}
      </View>

      {/* Action CTA */}
      <View style={uc.actionsCol}>
        {isUploading ? (
          <View style={uc.loaderBadge}>
            <ActivityIndicator size="small" color="#D81B60" />
          </View>
        ) : isUploaded ? (
          <View style={uc.uploadedActions}>
            {typeof uploadedValue === 'string' && uploadedValue.length > 5 && (
              <TouchableOpacity
                style={uc.viewBtn}
                onPress={() => onView(uploadedValue, config.title)}
                activeOpacity={0.7}
              >
                <FeatherIcon name="eye" size={14} color="#059669" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={uc.replaceBtn}
              onPress={onPick}
              activeOpacity={0.7}
            >
              <MaterialIcon name="refresh" size={14} color="#D81B60" />
              <Text style={uc.replaceBtnText}>बदलें</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={uc.chooseBtn}
            onPress={onPick}
            activeOpacity={0.8}
          >
            <MaterialIcon name="plus" size={16} color="#FFFFFF" />
            <Text style={uc.chooseBtnText}>फाइल चुनें</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const uc = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#F472B6',
    borderRadius: 14,
    padding: 13,
    marginBottom: 12,
    backgroundColor: '#FFF5F8',
  },
  cardUploaded: {
    borderStyle: 'solid',
    borderColor: '#86EFAC',
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
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  uploadingText: {
    fontSize: 11.5,
    color: '#D81B60',
    fontWeight: '600',
    marginTop: 2,
  },
  uploadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  fileName: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  actionsCol: {
    alignItems: 'flex-end',
  },
  loaderBadge: {
    padding: 8,
  },
  uploadedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFF0F5',
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  replaceBtnText: {
    fontSize: 11,
    color: '#D81B60',
    fontWeight: '700',
  },
  chooseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D81B60',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chooseBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function FundAccountStep2Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const fundAccountIdParam = route.params?.fundAccountId;

  const { step2, profile, fetchProfile, fetchDraft } = useFundAccount();

  const [fundAccountId, setFundAccountId] = useState(fundAccountIdParam || null);
  const [uploadedDocs, setUploadedDocs] = useState({
    balikaAadhaar: null,
    birthCertificate: null,
    balikaPhoto: null,
    parentAadhaar: null,
    parentBankPassbook: null,
  });
  const [uploadingKeys, setUploadingKeys] = useState({});

  // Sync documents on mount
  useEffect(() => {
    (async () => {
      let draftDocs = route.params?.draftData?.documents;
      let targetId = fundAccountIdParam;

      if (!draftDocs || !targetId) {
        const res = await fetchDraft();
        if (res?.Data) {
          draftDocs = res.Data.documents;
          if (res.Data.fundAccountId) {
            targetId = res.Data.fundAccountId;
            setFundAccountId(res.Data.fundAccountId);
          }
        }
      }

      if (draftDocs) {
        setUploadedDocs(prev => ({
          balikaAadhaar: draftDocs.balikaAadhaar || prev.balikaAadhaar,
          birthCertificate: draftDocs.birthCertificate || prev.birthCertificate,
          balikaPhoto: draftDocs.balikaPhoto || prev.balikaPhoto,
          parentAadhaar: draftDocs.parentAadhaar || prev.parentAadhaar,
          parentBankPassbook: draftDocs.parentBankPassbook || prev.parentBankPassbook,
        }));
      }
    })();
  }, [fundAccountIdParam, route.params?.draftData, fetchDraft]);

  const targetFundAccountId = fundAccountId || route.params?.draftData?.fundAccountId || profile?.fundAccountId;

  // Count uploaded docs (out of 5)
  const uploadedCount = DOC_CONFIGS.filter(c => Boolean(uploadedDocs[c.key])).length;
  const isComplete = uploadedCount === 5;

  const pickAndUpload = async (docKey) => {
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

      if (!picked) return;

      // Instant Upload
      setUploadingKeys(prev => ({ ...prev, [docKey]: true }));
      try {
        const res = await step2(targetFundAccountId, { [docKey]: picked });
        if (res && (!res.Error || res.Status)) {
          const remotePath = res.Data?.documents?.[docKey] || picked.name || 'अपलोड हो चुका है';
          setUploadedDocs(prev => ({ ...prev, [docKey]: remotePath }));
          Toast.show({
            type: 'success',
            text1: 'सफलता',
            text2: 'दस्तावेज़ सफलतापूर्वक अपलोड हुआ ✅',
          });
          // Update fundAccountId if returned
          if (res.Data?.fundAccountId && !fundAccountId) {
            setFundAccountId(res.Data.fundAccountId);
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'त्रुटि',
            text2: res?.Remarks || 'दस्तावेज़ अपलोड विफल।',
          });
        }
      } catch (uploadErr) {
        Toast.show({
          type: 'error',
          text1: 'त्रुटि',
          text2: 'अपलोड विफल। नेटवर्क जांचें।',
        });
      } finally {
        setUploadingKeys(prev => ({ ...prev, [docKey]: false }));
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'त्रुटि', text2: 'फ़ाइल चुनने में समस्या आई।' });
    }
  };

  const [previewDoc, setPreviewDoc] = useState(null);

  const handleViewDocument = (path, title = 'दस्तावेज़') => {
    if (!path) return;
    const url = getDocumentUrl(path) || path;
    if (url) {
      setPreviewDoc({
        title,
        url,
        isPdf: typeof url === 'string' && url.toLowerCase().includes('.pdf'),
      });
    }
  };

  const handleSaveAndExit = () => {
    Toast.show({
      type: 'success',
      text1: 'प्रगति सहेज ली गई',
      text2: 'आप जब चाहें वापस आकर जारी रख सकते हैं ✅',
    });
    navigation.navigate('VivahSahayogEntry');
  };

  const handleProceedToStep3 = () => {
    if (!isComplete) {
      const remaining = 5 - uploadedCount;
      Toast.show({
        type: 'error',
        text1: 'दस्तावेज़ बाकी हैं',
        text2: `कृपया शेष ${remaining} दस्तावेज़ अपलोड करें।`,
      });
      return;
    }

    navigation.navigate('FundAccountStep3', {
      fundAccountId: targetFundAccountId,
      step1Data: route.params?.step1Data,
      files: uploadedDocs,
      draftData: route.params?.draftData,
    });
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>दस्तावेज़ अपलोड (चरण 2/3)</Text>
        <TouchableOpacity
          style={s.saveDraftBtn}
          onPress={handleSaveAndExit}
          activeOpacity={0.75}
        >
          <Text style={s.saveDraftBtnText}>बाद में पूरा करें</Text>
        </TouchableOpacity>
      </View>

      <StepProgress current={2} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Upload Progress Bar Card */}
        <View style={s.progressCard}>
          <View style={s.progressHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcon name="file-check-outline" size={20} color="#D81B60" />
              <Text style={s.progressTitle}>दस्तावेज़ स्थिति</Text>
            </View>
            <View style={[s.pillBadge, isComplete ? s.pillBadgeSuccess : s.pillBadgePending]}>
              <Text style={[s.pillBadgeText, isComplete ? s.pillBadgeTextSuccess : s.pillBadgeTextPending]}>
                {uploadedCount}/5 अपलोड पूर्ण
              </Text>
            </View>
          </View>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${(uploadedCount / 5) * 100}%` }]} />
          </View>
          <Text style={s.progressHint}>
            {isComplete
              ? '🎉 सभी 5 अनिवार्य दस्तावेज़ अपलोड हो चुके हैं!'
              : `प्रत्येक दस्तावेज़ चुनते ही स्वतः अपलोड हो जाएगा। शेष: ${5 - uploadedCount}`}
          </Text>
        </View>

        <Text style={s.sectionTitle}>5 अनिवार्य दस्तावेज़</Text>

        {DOC_CONFIGS.map(config => (
          <UploadCard
            key={config.key}
            config={config}
            uploadedValue={uploadedDocs[config.key]}
            isUploading={Boolean(uploadingKeys[config.key])}
            onPick={() => pickAndUpload(config.key)}
            onView={handleViewDocument}
          />
        ))}

        {/* Guidelines */}
        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>📋 अपलोड दिशानिर्देश</Text>
          {[
            'दस्तावेज़ स्पष्ट और पठनीय होने चाहिए (अधिकतम 5MB)',
            'PDF, JPG या PNG प्रारूप स्वीकार्य हैं',
            'बालिका का पासपोर्ट साइज फोटो हाल ही में लिया गया हो',
            'बैंक पासबुक में खाता संख्या और IFSC कोड स्पष्ट दिखना चाहिए',
          ].map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <MaterialIcon name="check-circle-outline" size={15} color="#059669" />
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={s.bottomExitBtn}
          onPress={handleSaveAndExit}
          activeOpacity={0.8}
        >
          <FeatherIcon name="save" size={16} color="#64748B" />
          <Text style={s.bottomExitText}>बाद में पूरा करें</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.bottomSubmitBtn, !isComplete && s.bottomSubmitBtnDisabled]}
          onPress={handleProceedToStep3}
          activeOpacity={0.85}
        >
          <Text style={s.bottomSubmitText}>
            {isComplete ? 'समीक्षा और सबमिट करें' : `शेष ${5 - uploadedCount} दस्तावेज़ अपलोड करें`}
          </Text>
          <FeatherIcon name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ── In-App Document Preview Modal ── */}
      <Modal
        visible={Boolean(previewDoc)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewDoc(null)}
      >
        <View style={s.previewOverlay}>
          <View style={s.previewModalCard}>
            <View style={s.previewHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.previewTitle} numberOfLines={1}>
                  {previewDoc?.title || 'दस्तावेज़'}
                </Text>
                <Text style={s.previewSub}>इन-ऐप पूर्वावलोकन • In-App Preview</Text>
              </View>
              <TouchableOpacity
                onPress={() => setPreviewDoc(null)}
                style={s.previewCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FeatherIcon name="x" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={s.previewImageContainer}>
              {previewDoc?.url ? (
                previewDoc.isPdf ? (
                  <View style={s.pdfFallbackContainer}>
                    <MaterialIcon name="file-pdf-box" size={64} color="#DC2626" />
                    <Text style={s.pdfTitle}>{previewDoc.title}</Text>
                    <Text style={s.pdfNote}>PDF दस्तावेज़ संलग्न है</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: previewDoc.url }}
                    style={s.previewImage}
                    resizeMode="contain"
                  />
                )
              ) : (
                <ActivityIndicator size="small" color="#D81B60" />
              )}
            </View>

            <View style={s.previewFooter}>
              <TouchableOpacity
                style={s.previewDoneBtn}
                onPress={() => setPreviewDoc(null)}
                activeOpacity={0.8}
              >
                <Text style={s.previewDoneText}>बंद करें (Close)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  scroll: { paddingHorizontal: 16, paddingTop: 14 },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pillBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  pillBadgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  pillBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  pillBadgeTextPending: {
    color: '#B45309',
  },
  pillBadgeTextSuccess: {
    color: '#15803D',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D81B60',
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },

  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },

  tipsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  bottomExitBtn: {
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bottomExitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  bottomSubmitBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 3,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  bottomSubmitBtnDisabled: {
    backgroundColor: '#94A3B8',
    elevation: 0,
    shadowOpacity: 0,
  },
  bottomSubmitText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewModalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  previewSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  previewCloseBtn: {
    padding: 4,
  },
  previewImageContainer: {
    width: '100%',
    height: 380,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  pdfFallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pdfTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 10,
    textAlign: 'center',
  },
  pdfNote: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  previewFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  previewDoneBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#D81B60',
  },
  previewDoneText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
