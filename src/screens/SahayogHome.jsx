import React, { useState, useEffect, useCallback } from 'react';
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
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import NavBar from '../components/NavBar';
import DonationStatsWidget from '../components/DonationStatsWidget';
import { fetchAllFundSchemes } from '../services/fundSchemeService';

const VIVAH_LOGO = require('../Assets/vivah_sahayog_logo.png');

export default function SahayogHome() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('schemes');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadSchemes = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await fetchAllFundSchemes();
      if (Array.isArray(data) && data.length > 0) {
        setSchemes(data);
      } else {
        setSchemes([]);
        setError('कोई योजना उपलब्ध नहीं है।');
      }
    } catch (err) {
      console.log('Error loading Sahayog schemes:', err);
      setError('योजना सूची लोड करने में असमर्थ।');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSchemes(false);
  }, [loadSchemes]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setActiveTab('schemes');
    });
    return unsubscribe;
  }, [navigation]);

  const handleSchemePress = scheme => {
    navigation.navigate('SchemeDetails', {
      schemeCode: scheme.code,
      schemeId: scheme.code,
      scheme,
      schemeTitle: scheme.name || scheme.nameEn,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <FeatherIcon name="chevron-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <FontAwesome5 name="heart" size={18} color="#D81B60" solid />
          <Text style={styles.headerTitle}>SARVANA SAHAYOG</Text>
        </View>
        <View style={{ width: 26 }} />
      </View>

      {/* Segmented Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'schemes' && styles.activeTabBtn]}
          onPress={() => setActiveTab('schemes')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'schemes' && styles.activeTabText]}>
            हमारी योजनाएँ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'mySahayog' && styles.activeTabBtn]}
          onPress={() => {
            setActiveTab('mySahayog');
            navigation.navigate('SahayogAccount');
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'mySahayog' && styles.activeTabText]}>
            मेरे सहयोग
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadSchemes(true)}
            colors={['#D81B60']}
            tintColor="#D81B60"
          />
        }
      >
        {/* Dynamic Schemes List */}
        {loading && schemes.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D81B60" />
            <Text style={styles.loadingText}>सहयोग योजनाएं लोड हो रही हैं...</Text>
          </View>
        ) : error && schemes.length === 0 ? (
          <View style={styles.errorContainer}>
            <MaterialIcon name="alert-circle-outline" size={44} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadSchemes(false)} activeOpacity={0.85}>
              <Text style={styles.retryBtnText}>पुनः प्रयास करें</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.schemesList}>
            {schemes.map(item => {
              const code = (item.code || '').toUpperCase();
              const isVivah = code === 'VIVAH_SAHAYOG' || code.includes('VIVAH');
              const themeColor = item.themeColor || '#D81B60';

              return (
                <TouchableOpacity
                  key={item.code || item._id || item.name}
                  style={styles.schemeCard}
                  activeOpacity={0.85}
                  onPress={() => handleSchemePress(item)}
                >
                  {/* Scheme Icon / Avatar */}
                  <View
                    style={[
                      styles.schemeAvatarContainer,
                      { borderColor: themeColor + '30', backgroundColor: themeColor + '10' },
                    ]}
                  >
                    {isVivah ? (
                      <Image source={item.image ? { uri: item.image } : VIVAH_LOGO} style={styles.schemeAvatar} resizeMode="cover" />
                    ) : item.image ? (
                      <Image source={{ uri: item.image }} style={styles.schemeAvatar} resizeMode="cover" />
                    ) : item.badgeSymbol ? (
                      <Text style={styles.badgeSymbolText}>{item.badgeSymbol}</Text>
                    ) : (
                      <MaterialIcon name="charity" size={24} color={themeColor} />
                    )}
                  </View>

                  {/* Title & Tagline */}
                  <View style={styles.schemeTextCol}>
                    <Text style={styles.schemeCardTitle}>{item.name || item.nameEn}</Text>
                    <Text style={styles.schemeCardSub} numberOfLines={2}>
                      {item.tagline || item.description || item.descriptionEn || item.nameEn}
                    </Text>
                  </View>

                  {/* Action Badge */}
                  {isVivah ? (
                    <View style={styles.activeSchemeBadge}>
                      <FeatherIcon name="check-circle" size={11} color="#0F8A5F" />
                      <Text style={styles.activeSchemeBadgeText}>Apply</Text>
                    </View>
                  ) : (
                    <View style={[styles.detailBadge, { borderColor: themeColor + '40', backgroundColor: themeColor + '12' }]}>
                      <FeatherIcon name="arrow-right" size={11} color={themeColor} />
                      <Text style={[styles.detailBadgeText, { color: themeColor }]}>विवरण</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Bottom Banner Card */}
        <TouchableOpacity
          style={styles.bottomBannerCard}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('DonationScreen', {
              schemeId: 'vivah',
              schemeTitle: 'Vivah Sahayog Yojna',
            })
          }
        >
          <View style={styles.bannerIconCircle}>
            <FontAwesome5 name="hand-holding-heart" size={22} color="#0F8A5F" />
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>आज ही सहयोग करें</Text>
            <Text style={styles.bannerSub}>एक छोटी मदद, बड़ी खुशियाँ • 80G Tax Exemption</Text>
          </View>
        </TouchableOpacity>

        {/* Live Donation Impact & Blessings Wall */}
        <View style={{ marginHorizontal: 16 }}>
          <DonationStatsWidget
            onDonatePress={() => navigation.navigate('DonationScreen')}
          />
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <NavBar navigation={navigation} activeTab="sahayog" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 2 },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D81B60',
    letterSpacing: 0.5,
  },

  /* Tab bar */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabBtn: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#D81B60', fontWeight: '700' },

  /* Scroll */
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  schemesList: { gap: 12, marginBottom: 20 },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 14,
    backgroundColor: '#D81B60',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },

  /* Scheme card */
  schemeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  schemeAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1.5,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schemeAvatar: { width: '100%', height: '100%' },
  badgeSymbolText: { fontSize: 24 },
  schemeTextCol: { flex: 1, paddingRight: 6 },
  schemeCardTitle: { fontSize: 14.5, fontWeight: '700', color: '#1E293B' },
  schemeCardSub: { fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 16 },

  /* Status badges */
  activeSchemeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeSchemeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F8A5F',
    letterSpacing: 0.1,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  /* Bottom banner */
  bottomBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  bannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerTextCol: { flex: 1 },
  bannerTitle: { fontSize: 14, fontWeight: '800', color: '#D81B60' },
  bannerSub: { fontSize: 12, color: '#334155', marginTop: 2 },

  /* ─── Modal ─── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,10,30,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  modalIconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#FED7AA',
  },
  modalIconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.3,
  },
  modalSchemeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D81B60',
    marginTop: 6,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
  },
  modalDivider: {
    width: '40%',
    height: 1.5,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginVertical: 16,
  },
  modalDesc: {
    fontSize: 13.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 21,
    fontWeight: '500',
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  modalCloseBtn: {
    backgroundColor: '#D81B60',
    paddingVertical: 13,
    paddingHorizontal: 36,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
