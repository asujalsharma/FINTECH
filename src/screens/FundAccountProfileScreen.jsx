import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, StatusBar, Image, ActivityIndicator, RefreshControl,
  Modal, Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../constants/colors';
import useFundAccount, { getDocumentUrl } from '../hooks/useFundAccount';

const InfoRow = ({ icon, label, value }) => (
  <View style={ir.row}>
    <View style={ir.iconWrap}>
      <MaterialIcon name={icon} size={18} color="#D81B60" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={ir.label}>{label}</Text>
      <Text style={ir.value}>{value || '—'}</Text>
    </View>
  </View>
);

const ir = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', gap: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF0F5', alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11.5, color: '#94A3B8', fontWeight: '600', marginBottom: 1 },
  value: { fontSize: 13.5, color: '#1E293B', fontWeight: '700' },
});

const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: '#FFF7ED', border: '#FED7AA', color: '#F57C00', icon: 'clock-outline', label: 'आवेदन दर्ज (Applied)' },
    approved: { bg: '#ECFDF5', border: '#A7F3D0', color: '#059669', icon: 'check-decagram', label: 'स्वीकृत - बधाई हो! (Approved Congratulations)' },
    draft: { bg: '#FFF7ED', border: '#FED7AA', color: '#D97706', icon: 'pencil-outline', label: 'अधूरा पंजीकरण (Draft)' },
    rejected: { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', icon: 'close-circle-outline', label: 'अस्वीकृत' },
  }[status] || { bg: '#FFF7ED', border: '#FED7AA', color: '#F57C00', icon: 'clock-outline', label: 'आवेदन दर्ज (Applied)' };
  if (!config) return null;
  return (
    <View style={[sb.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <MaterialIcon name={config.icon} size={16} color={config.color} />
      <Text style={[sb.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const sb = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'center', marginBottom: 16 },
  text: { fontSize: 14, fontWeight: '800' },
});

export default function FundAccountProfileScreen() {
  const navigation = useNavigation();
  const { profile, loading, fetchProfile } = useFundAccount();
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);

  const load = useCallback(() => { fetchProfile(); }, [fetchProfile]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const rawPhoto = profile?.documents?.balikaPhoto || profile?.balikaPhoto;
  const balikaPhotoUri = rawPhoto ? getDocumentUrl(rawPhoto) : null;

  const currentStatus = profile?.approvalStatus || profile?.status;
  const wallet = profile?.fundWallet || profile?.wallet;

  const documentsList = [
    {
      id: 'balikaAadhaar',
      title: 'बच्ची का आधार कार्ड',
      path: profile?.documents?.balikaAadhaar || profile?.balikaAadhaar,
      type: 'आधार कार्ड',
      icon: 'card-account-details-outline',
    },
    {
      id: 'birthCertificate',
      title: 'बालिका का जन्म प्रमाण पत्र',
      path: profile?.documents?.birthCertificate || profile?.birthCertificate,
      type: 'जन्म प्रमाण पत्र',
      icon: 'file-document-outline',
    },
    {
      id: 'balikaPhoto',
      title: 'बालिका का पासपोर्ट फोटो',
      path: profile?.documents?.balikaPhoto || profile?.balikaPhoto,
      type: 'पासपोर्ट फोटो',
      icon: 'camera-outline',
    },
    {
      id: 'parentAadhaar',
      title: 'मम्मी-पापा के आधार कार्ड',
      path: profile?.documents?.parentAadhaar || profile?.parentAadhaar,
      type: 'पहचान पत्र',
      icon: 'shield-account-outline',
    },
    {
      id: 'parentBankPassbook',
      title: 'बैंक पासबुक की कॉपी',
      path: profile?.documents?.parentBankPassbook || profile?.parentBankPassbook,
      type: 'पासबुक',
      icon: 'bank-outline',
    },
  ];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Vivah Sahayog - प्रोफ़ाइल</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading && !profile ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={s.loadingText}>लोड हो रहा है...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} colors={[COLORS.primary]} />}
        >
          {/* Hero / Photo */}
          <View style={s.heroSection}>
            <View style={s.photoCircle}>
              {balikaPhotoUri ? (
                <Image source={{ uri: balikaPhotoUri }} style={s.photoImg} />
              ) : (
                <MaterialIcon name="account-child-circle" size={64} color="#D81B60" />
              )}
            </View>
            <Text style={s.heroName}>{profile?.balikaName || '—'}</Text>
            <Text style={s.heroSub}>बालिका — Vivah Sahayog</Text>
            <StatusBadge status={currentStatus} />
          </View>

          {/* Rejection Note */}
          {currentStatus === 'rejected' && profile?.rejectionNote && (
            <View style={s.rejectionCard}>
              <MaterialIcon name="alert-circle-outline" size={20} color="#DC2626" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={s.rejectionTitle}>अस्वीकृति का कारण</Text>
                <Text style={s.rejectionNote}>{profile.rejectionNote}</Text>
              </View>
            </View>
          )}

          {/* Personal Info */}
          <View style={s.card}>
            <Text style={s.cardTitle}>व्यक्तिगत जानकारी</Text>
            <InfoRow icon="calendar-outline" label="जन्म तिथि" value={profile?.dob} />
            <InfoRow icon="human" label="वर्तमान आयु" value={profile?.currentAge} />
            <InfoRow icon="cellphone" label="मोबाइल नंबर" value={profile?.mobileNumber} />
            <InfoRow icon="cash-multiple" label="वार्षिक आय" value={profile?.annualIncome} />
            <InfoRow icon="map-marker-outline" label="राज्य" value={profile?.state} />
            <InfoRow icon="city-variant-outline" label="जिला" value={profile?.district} />
          </View>

          {/* Uploaded Documents */}
          <View style={s.card}>
            <View style={s.cardHeaderRow}>
              <MaterialIcon name="file-document-multiple-outline" size={18} color="#D81B60" />
              <Text style={s.cardTitle}>अपलोड किए गए दस्तावेज़</Text>
            </View>

            {documentsList.map(doc => {
              const isUploaded = Boolean(doc.path);
              const docUrl = isUploaded ? getDocumentUrl(doc.path) : null;
              return (
                <View key={doc.id} style={s.docItemRow}>
                  <View style={[s.docIconBox, isUploaded && s.docIconBoxActive]}>
                    <MaterialIcon
                      name={doc.icon}
                      size={20}
                      color={isUploaded ? '#059669' : '#94A3B8'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.docTitleText}>{doc.title}</Text>
                    <Text style={[s.docStatusText, { color: isUploaded ? '#059669' : '#EF4444' }]}>
                      {isUploaded ? '✓ संलग्न है (Uploaded)' : 'अपलोड नहीं किया गया'}
                    </Text>
                  </View>
                  {isUploaded && (
                    <View style={s.docActionsRow}>
                      <TouchableOpacity
                        style={s.docActionBtn}
                        onPress={() => setSelectedPreviewDoc({ title: doc.title, url: docUrl })}
                        activeOpacity={0.7}
                      >
                        <FeatherIcon name="eye" size={14} color="#D81B60" />
                        <Text style={s.docActionBtnText}>देखें</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Application Timestamps */}
          <View style={s.card}>
            <Text style={s.cardTitle}>आवेदन विवरण</Text>
            <InfoRow icon="clock-outline" label="आवेदन तिथि" value={profile?.submittedAt || profile?.createdAt ? new Date(profile.submittedAt || profile.createdAt).toLocaleDateString('hi-IN') : '—'} />
            {profile?.approvedAt && <InfoRow icon="check-circle-outline" label="स्वीकृति तिथि" value={new Date(profile.approvedAt).toLocaleDateString('hi-IN')} />}
            {profile?.rejectedAt && <InfoRow icon="close-circle-outline" label="अस्वीकृति तिथि" value={new Date(profile.rejectedAt).toLocaleDateString('hi-IN')} />}
          </View>

          {/* Fund Wallet Card (if approved) */}
          {currentStatus === 'approved' && wallet && (
            <View style={s.walletCard}>
              <View style={s.walletTop}>
                <View style={s.walletIconCircle}>
                  <MaterialIcon name="wallet-outline" size={26} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.walletLabel}>फंड वॉलेट शेष</Text>
                  <Text style={s.walletBalance}>₹ {Number(wallet.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={s.walletBtn}
                onPress={() => navigation.navigate('FundWalletStatements')}
                activeOpacity={0.85}
              >
                <MaterialIcon name="format-list-bulleted" size={18} color="#D81B60" />
                <Text style={s.walletBtnText}>विवरण देखें</Text>
                <FeatherIcon name="arrow-right" size={16} color="#D81B60" />
              </TouchableOpacity>
            </View>
          )}

          {/* Re-apply CTA if rejected */}
          {currentStatus === 'rejected' && (
            <TouchableOpacity
              style={s.reApplyBtn}
              onPress={() => navigation.navigate('FundAccountStep1')}
              activeOpacity={0.85}
            >
              <Text style={s.reApplyBtnText}>पुनः आवेदन करें</Text>
              <FeatherIcon name="arrow-right" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Document In-App Preview Modal */}
      <Modal
        visible={!!selectedPreviewDoc}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPreviewDoc(null)}
      >
        <View style={s.previewOverlay}>
          <View style={s.previewModalCard}>
            <View style={s.previewHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.previewTitle} numberOfLines={1}>
                  {selectedPreviewDoc?.title || 'दस्तावेज'}
                </Text>
                <Text style={s.previewSub}>पूर्वावलोकन (Preview)</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedPreviewDoc(null)}
                style={s.previewCloseBtn}
              >
                <FeatherIcon name="x" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={s.previewImageContainer}>
              {selectedPreviewDoc?.url && (
                <Image
                  source={{ uri: selectedPreviewDoc.url }}
                  style={s.previewImage}
                  resizeMode="contain"
                />
              )}
            </View>

            <View style={s.previewFooter}>
              <TouchableOpacity
                style={s.previewDoneBtn}
                onPress={() => setSelectedPreviewDoc(null)}
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
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  scroll: { paddingHorizontal: 16, paddingTop: 20 },

  heroSection: { alignItems: 'center', marginBottom: 20 },
  photoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#FFF0F5', borderWidth: 3, borderColor: '#FCE7F3',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', marginBottom: 12,
    elevation: 4, shadowColor: '#D81B60', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6,
  },
  photoImg: { width: 100, height: 100, borderRadius: 50 },
  heroName: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  heroSub: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginBottom: 12 },

  rejectionCard: {
    flexDirection: 'row', backgroundColor: '#FEF2F2', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#FECACA', marginBottom: 14,
    alignItems: 'flex-start',
  },
  rejectionTitle: { fontSize: 13, fontWeight: '800', color: '#DC2626', marginBottom: 4 },
  rejectionNote: { fontSize: 13, color: '#DC2626', lineHeight: 19 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 14,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 4 },

  docItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 12,
  },
  docIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIconBoxActive: {
    backgroundColor: '#ECFDF5',
  },
  docTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  docStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  docActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  docActionBtnSecondary: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
  },
  docActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D81B60',
  },

  walletCard: {
    borderRadius: 16, overflow: 'hidden',
    backgroundColor: '#1E293B', marginBottom: 14,
    padding: 16,
    elevation: 5, shadowColor: '#1E293B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10,
  },
  walletTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  walletIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#D81B60', alignItems: 'center', justifyContent: 'center' },
  walletLabel: { fontSize: 12, color: '#CBD5E1', fontWeight: '600', marginBottom: 4 },
  walletBalance: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  walletBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFFFFF', borderRadius: 10, paddingVertical: 10,
  },
  walletBtnText: { fontSize: 14, fontWeight: '700', color: '#D81B60' },

  reApplyBtn: {
    backgroundColor: '#D81B60', borderRadius: 30, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginBottom: 14,
    elevation: 4, shadowColor: '#D81B60', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  reApplyBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
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
    height: 340,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  previewExternalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFF0F5',
  },
  previewExternalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D81B60',
  },
  previewDoneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  previewDoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
