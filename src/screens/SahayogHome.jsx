import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Modal,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import NavBar from '../components/NavBar';
import COLORS from '../constants/colors';

const VIVAH_LOGO = require('../Assets/vivah_sahayog_logo.png');

const SCHEMES = [
  {
    id: 'vivah',
    title: 'Vivah Sahayog Yojna',
    subtitle: 'बेटी का भविष्य, हमारा संकल्प',
    image: null,           // uses local VIVAH_LOGO below
    localImage: VIVAH_LOGO,
  },
  {
    id: 'shiksha',
    title: 'Beti Shiksha Sahayog',
    subtitle: 'शिक्षा का अधिकार',
    image:
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=200&auto=format&fit=crop&q=60',
  },
  {
    id: 'sanitary',
    title: 'Sanitary Pad Support',
    subtitle: 'स्वस्थ बेटी, स्वस्थ समाज',
    image:
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=200&auto=format&fit=crop&q=60',
  },
  {
    id: 'vridha',
    title: 'Vridha Sahayog',
    subtitle: 'वरिष्ठ नागरिकों के लिए सहायता',
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60',
  },
  {
    id: 'parivar',
    title: 'Parivar Sahayog',
    subtitle: 'जरूरतमंद परिवारों की मदद',
    image:
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&auto=format&fit=crop&q=60',
  },
];

export default function SahayogHome() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('schemes');

  // Coming Soon modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  const openComingSoon = (scheme) => {
    setSelectedScheme(scheme);
    setModalVisible(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSchemePress = (scheme) => {
    if (scheme.id === 'vivah') {
      navigation.navigate('SchemeDetails', {
        schemeId: scheme.id,
        schemeTitle: scheme.title,
      });
    } else {
      openComingSoon(scheme);
    }
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 160, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 0,    duration: 160, useNativeDriver: true }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedScheme(null);
      scaleAnim.setValue(0.8);
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Scheme Cards List */}
        <View style={styles.schemesList}>
          {SCHEMES.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.schemeCard}
              activeOpacity={0.85}
              onPress={() => handleSchemePress(item)}
            >
              {/* Avatar — local image or remote URI */}
              <View style={styles.schemeAvatarContainer}>
                <Image
                  source={item.localImage ? item.localImage : { uri: item.image }}
                  style={styles.schemeAvatar}
                  resizeMode="cover"
                />
              </View>

              {/* Text */}
              <View style={styles.schemeTextCol}>
                <Text style={styles.schemeCardTitle}>{item.title}</Text>
                <Text style={styles.schemeCardSub}>{item.subtitle}</Text>
              </View>

              {/* Badge: Active for Vivah, Coming Soon for others */}
              {item.id === 'vivah' ? (
                <View style={styles.activeSchemeBadge}>
                  <FeatherIcon name="check-circle" size={11} color="#0F8A5F" />
                  <Text style={styles.activeSchemeBadgeText}>Active</Text>
                </View>
              ) : (
                <View style={styles.comingSoonBadge}>
                  <MaterialIcon name="clock-outline" size={11} color="#F57C00" />
                  <Text style={styles.comingSoonBadgeText}>Coming Soon</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

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
            <Text style={styles.bannerSub}>एक छोटी मदद, बड़ी खुशियाँ</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <NavBar navigation={navigation} activeTab="sahayog" />

      {/* ─── Coming Soon Modal ─── */}
      <Modal transparent visible={modalVisible} animationType="none" onRequestClose={closeModal}>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeModal} />

          <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>
            {/* Glowing icon ring */}
            <View style={styles.modalIconRing}>
              <View style={styles.modalIconInner}>
                <MaterialIcon name="clock-time-four-outline" size={36} color="#F57C00" />
              </View>
            </View>

            <Text style={styles.modalHeading}>Coming Soon</Text>
            <Text style={styles.modalSchemeName}>{selectedScheme?.title}</Text>
            <Text style={styles.modalSubtitle}>{selectedScheme?.subtitle}</Text>

            <View style={styles.modalDivider} />

            <Text style={styles.modalDesc}>
              यह योजना जल्द ही शुरू होगी।{'\n'}हम इसे आपके लिए तैयार कर रहे हैं — बने रहें!
            </Text>

            {/* Dot indicators */}
            <View style={styles.dotRow}>
              {[0, 1, 2].map(i => (
                <View key={i} style={[styles.dot, i === 1 && { backgroundColor: '#F57C00', width: 18 }]} />
              ))}
            </View>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={closeModal} activeOpacity={0.85}>
              <Text style={styles.modalCloseBtnText}>ठीक है, समझ गया!</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
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
    borderColor: '#FCE7F3',
    marginRight: 12,
  },
  schemeAvatar: { width: '100%', height: '100%' },
  schemeTextCol: { flex: 1 },
  schemeCardTitle: { fontSize: 14.5, fontWeight: '700', color: '#1E293B' },
  schemeCardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },

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
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  comingSoonBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F57C00',
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
