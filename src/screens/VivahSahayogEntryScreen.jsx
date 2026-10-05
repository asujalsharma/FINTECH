import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../constants/colors';
import useFundAccount from '../hooks/useFundAccount';

const VIVAH_LOGO = require('../Assets/vivah_sahayog_logo.png');

const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: '#FFF7ED', border: '#FED7AA', color: '#F57C00', icon: 'clock-outline', label: 'समीक्षा में है' },
    approved: { bg: '#ECFDF5', border: '#A7F3D0', color: '#059669', icon: 'check-circle-outline', label: 'स्वीकृत' },
    rejected: { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', icon: 'close-circle-outline', label: 'अस्वीकृत' },
  }[status] || null;
  if (!config) return null;
  return (
    <View style={[s.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <MaterialIcon name={config.icon} size={14} color={config.color} />
      <Text style={[s.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

export default function VivahSahayogEntryScreen() {
  const navigation = useNavigation();
  const { profile, loading, fetchProfile } = useFundAccount();

  const load = useCallback(() => { fetchProfile(); }, [fetchProfile]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const currentStatus = profile?.approvalStatus || profile?.status;

  const handleCTA = () => {
    if (!profile || currentStatus === 'rejected') {
      navigation.navigate('FundAccountStep1');
    } else if (currentStatus === 'pending' || currentStatus === 'approved') {
      navigation.navigate('FundAccountProfile');
    }
  };

  const ctaLabel = () => {
    if (!profile) return 'आवेदन करें';
    if (currentStatus === 'pending') return 'आवेदन देखें';
    if (currentStatus === 'approved') return 'वॉलेट देखें';
    if (currentStatus === 'rejected') return 'पुनः आवेदन करें';
    return 'आवेदन करें';
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <View style={s.headerTitleRow}>
          <FontAwesome5 name="heart" size={16} color="#D81B60" solid />
          <Text style={s.headerTitle}>Vivah Sahayog</Text>
        </View>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} colors={[COLORS.primary]} />}
      >
        {/* Hero Banner */}
        <View style={s.heroBanner}>
          <Image source={VIVAH_LOGO} style={s.heroImg} resizeMode="contain" />
          <View style={s.heroTextCol}>
            <Text style={s.heroScheme}>बालिका विवाह सहयोग योजना</Text>
            <Text style={s.heroQuote}>"बेटी मुस्कुराएगी{'\n'}तो समाज आगे बढ़ेगा"</Text>
          </View>
        </View>

        {/* Main Card */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.cardIconCircle}>
              <MaterialIcon name="account-heart-outline" size={28} color="#D81B60" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.cardTitle}>Vivah Sahayog - आवेदन</Text>
              <Text style={s.cardSub}>बालिका विवाह सहयोग योजना</Text>
            </View>
          </View>

          {/* Status section */}
          {loading ? (
            <View style={s.loadingRow}>
              <ActivityIndicator color={COLORS.primary} size="small" />
              <Text style={s.loadingText}>स्थिति जाँच रहे हैं...</Text>
            </View>
          ) : (
            <>
              {!profile && (
                <View style={s.statusBlock}>
                  <View style={[s.badge, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
                    <MaterialIcon name="file-document-outline" size={14} color="#64748B" />
                    <Text style={[s.badgeText, { color: '#64748B' }]}>आवेदन नहीं किया गया</Text>
                  </View>
                  <Text style={s.statusDesc}>
                    अभी तक कोई आवेदन दर्ज नहीं है। नीचे दिए बटन से आवेदन शुरू करें।
                  </Text>
                </View>
              )}

              {profile && (
                <View style={s.statusBlock}>
                  <StatusBadge status={currentStatus} />
                  {currentStatus === 'pending' && (
                    <Text style={s.statusDesc}>
                      आपका आवेदन SARVANA टीम द्वारा समीक्षा में है। कृपया प्रतीक्षा करें।
                    </Text>
                  )}
                  {currentStatus === 'approved' && (
                    <Text style={[s.statusDesc, { color: '#059669' }]}>
                      🎉 बधाई! आपका आवेदन स्वीकृत हो गया। अपना फंड वॉलेट देखें।
                    </Text>
                  )}
                  {currentStatus === 'rejected' && (
                    <>
                      <Text style={[s.statusDesc, { color: '#DC2626' }]}>
                        आपका आवेदन अस्वीकृत हो गया।
                      </Text>
                      {profile.rejectionNote && (
                        <View style={s.rejectionNoteCard}>
                          <MaterialIcon name="information-outline" size={16} color="#DC2626" />
                          <Text style={s.rejectionNoteText}>{profile.rejectionNote}</Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              )}
            </>
          )}

          {/* CTA Button */}
          <TouchableOpacity style={s.ctaBtn} onPress={handleCTA} activeOpacity={0.85}>
            <Text style={s.ctaBtnText}>{ctaLabel()}</Text>
            <FeatherIcon name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Info steps */}
        <View style={s.stepsCard}>
          <Text style={s.stepsTitle}>आवेदन प्रक्रिया</Text>
          {[
            { n: '1', t: 'व्यक्तिगत जानकारी', d: 'बालिका एवं परिवार की जानकारी भरें' },
            { n: '2', t: 'दस्तावेज़ अपलोड', d: 'जन्म प्रमाण पत्र, आधार कार्ड, फोटो' },
            { n: '3', t: 'समीक्षा और सबमिट', d: 'जानकारी की पुष्टि करके सबमिट करें' },
          ].map(item => (
            <View key={item.n} style={s.stepRow}>
              <View style={s.stepNumCircle}>
                <Text style={s.stepNumText}>{item.n}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.stepRowTitle}>{item.t}</Text>
                <Text style={s.stepRowDesc}>{item.d}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <MaterialIcon name="shield-check-outline" size={16} color="#0F8A5F" />
          <Text style={s.disclaimerText}>
            यह योजना SARVANA Care Foundation द्वारा संचालित है। दस्तावेज़ों का सत्यापन टीम द्वारा मैन्युअल रूप से किया जाएगा।
          </Text>
        </View>

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
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#D81B60', letterSpacing: 0.3 },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },

  heroBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF0F5', borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: '#FCE7F3', marginBottom: 16,
  },
  heroImg: { width: 70, height: 70, borderRadius: 35, marginRight: 12 },
  heroTextCol: { flex: 1 },
  heroScheme: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 4 },
  heroQuote: { fontSize: 15, fontWeight: '800', color: '#D81B60', lineHeight: 22 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#FCE7F3',
    elevation: 4, shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#FFF0F5', alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  loadingText: { fontSize: 13, color: '#64748B' },

  statusBlock: { marginBottom: 14 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5, marginBottom: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  statusDesc: { fontSize: 13, color: '#475569', lineHeight: 19 },

  rejectionNoteCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FEF2F2', borderRadius: 10,
    padding: 10, borderWidth: 1, borderColor: '#FECACA', marginTop: 8,
  },
  rejectionNoteText: { flex: 1, fontSize: 12.5, color: '#DC2626', lineHeight: 18 },

  ctaBtn: {
    backgroundColor: '#D81B60', borderRadius: 30, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    elevation: 4, shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  ctaBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  stepsCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 14,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  stepsTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  stepNumCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FFF0F5', borderWidth: 1.5, borderColor: '#D81B60',
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { fontSize: 12, fontWeight: '800', color: '#D81B60' },
  stepRowTitle: { fontSize: 13.5, fontWeight: '700', color: '#1E293B' },
  stepRowDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },

  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#F0FDF4', borderRadius: 10,
    padding: 12, borderWidth: 1, borderColor: '#BBF7D0',
  },
  disclaimerText: { flex: 1, fontSize: 12, color: '#166534', lineHeight: 17 },
});
