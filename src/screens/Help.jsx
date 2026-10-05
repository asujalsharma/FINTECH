import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const SUPPORT_EMAIL = 'sarvanaone@gmail.com';
const SUPPORT_PHONE = '8463821995';
const SUPPORT_WEBSITE = 'https://sarvanaone.in';
const SUPPORT_WEBSITE_DISPLAY = 'Sarvanaone.in';

export default function Help() {
  const navigation = useNavigation();

  const handleCall = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => {
      Alert.alert('Unable to Call', `Please dial manually: ${SUPPORT_PHONE}`);
    });
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Support Request - Sarvana`).catch(() => {
      Alert.alert('Unable to Open Email', `Please email us at: ${SUPPORT_EMAIL}`);
    });
  };

  const handleWhatsApp = () => {
    const url = `whatsapp://send?phone=+91${SUPPORT_PHONE}&text=${encodeURIComponent(
      'Hello Sarvana Support, I need help with my account.',
    )}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/91${SUPPORT_PHONE}`).catch(() => {
        Alert.alert('WhatsApp Not Installed', `Please contact us at ${SUPPORT_PHONE}`);
      });
    });
  };

  const handleWebsite = () => {
    Linking.openURL(SUPPORT_WEBSITE).catch(() => {
      Alert.alert('Unable to Open Link', `Please visit: ${SUPPORT_WEBSITE_DISPLAY}`);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F8A5F" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Support Banner Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <MaterialCommunityIcons name="face-agent" size={48} color="#0F8A5F" />
          </View>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Support Desk Active</Text>
          </View>
          <Text style={styles.heroTitle}>How can we assist you?</Text>
          <Text style={styles.heroSubtitle}>
            Have questions regarding recharges, wallet, or services? Our team is available to assist you.
          </Text>
        </View>

        {/* Section: Direct Support Channels */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Support Channels</Text>
          <Text style={styles.sectionBadge}>Direct Help</Text>
        </View>

        {/* 1. Contact Number Card */}
        <TouchableOpacity
          style={styles.channelCard}
          activeOpacity={0.8}
          onPress={handleCall}
        >
          <View style={[styles.channelIconBox, { backgroundColor: '#ECFDF5' }]}>
            <MaterialIcons name="phone-in-talk" size={26} color="#0F8A5F" />
          </View>
          <View style={styles.channelInfo}>
            <Text style={styles.channelLabel}>Customer Care Helpline</Text>
            <Text style={styles.channelValue}>+91 {SUPPORT_PHONE}</Text>
            <Text style={styles.channelSubtext}>Mon – Sat (10:00 AM – 7:00 PM IST)</Text>
          </View>
          <View style={styles.actionBtnPill}>
            <Text style={styles.actionBtnText}>Call</Text>
          </View>
        </TouchableOpacity>

        {/* 2. Gmail / Email Card */}
        <TouchableOpacity
          style={styles.channelCard}
          activeOpacity={0.8}
          onPress={handleEmail}
        >
          <View style={[styles.channelIconBox, { backgroundColor: '#FEF2F2' }]}>
            <MaterialCommunityIcons name="gmail" size={26} color="#DC2626" />
          </View>
          <View style={styles.channelInfo}>
            <Text style={styles.channelLabel}>Email Support</Text>
            <Text style={styles.channelValue}>{SUPPORT_EMAIL}</Text>
            <Text style={styles.channelSubtext}>Get responses within 2–4 business hours</Text>
          </View>
          <View style={[styles.actionBtnPill, { backgroundColor: '#DC2626' }]}>
            <Text style={styles.actionBtnText}>Email</Text>
          </View>
        </TouchableOpacity>

        {/* 3. WhatsApp Support Card */}
        <TouchableOpacity
          style={styles.channelCard}
          activeOpacity={0.8}
          onPress={handleWhatsApp}
        >
          <View style={[styles.channelIconBox, { backgroundColor: '#DCFCE7' }]}>
            <FontAwesome name="whatsapp" size={28} color="#16A34A" />
          </View>
          <View style={styles.channelInfo}>
            <Text style={styles.channelLabel}>WhatsApp Support</Text>
            <Text style={styles.channelValue}>+91 {SUPPORT_PHONE}</Text>
            <Text style={styles.channelSubtext}>Fast chat assistance for recharge queries</Text>
          </View>
          <View style={[styles.actionBtnPill, { backgroundColor: '#16A34A' }]}>
            <Text style={styles.actionBtnText}>Chat</Text>
          </View>
        </TouchableOpacity>

        {/* 4. Official Website Card */}
        <TouchableOpacity
          style={styles.channelCard}
          activeOpacity={0.8}
          onPress={handleWebsite}
        >
          <View style={[styles.channelIconBox, { backgroundColor: '#EFF6FF' }]}>
            <MaterialCommunityIcons name="earth" size={26} color="#2563EB" />
          </View>
          <View style={styles.channelInfo}>
            <Text style={styles.channelLabel}>Official Portal</Text>
            <Text style={styles.channelValue}>{SUPPORT_WEBSITE_DISPLAY}</Text>
            <Text style={styles.channelSubtext}>Explore policies, services & updates</Text>
          </View>
          <View style={[styles.actionBtnPill, { backgroundColor: '#2563EB' }]}>
            <Text style={styles.actionBtnText}>Visit</Text>
          </View>
        </TouchableOpacity>

        {/* FAQs Shortcut Banner */}
        <TouchableOpacity
          style={styles.faqCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('FAQScreen')}
        >
          <View style={styles.faqIconBox}>
            <MaterialIcons name="help-outline" size={26} color="#0F8A5F" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            <Text style={styles.faqSubtitle}>
              Find quick answers to common recharge, payment, and refund questions.
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="#0F8A5F" />
        </TouchableOpacity>

        {/* Safe & Secure Guarantee Note */}
        <View style={styles.trustBadge}>
          <MaterialCommunityIcons name="shield-check" size={20} color="#0F8A5F" />
          <Text style={styles.trustText}>
            Official Sarvana Support • Verified & Encrypted
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F8A5F',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    elevation: 3,
    shadowColor: '#0F8A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  heroIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#059669',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F8A5F',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  channelIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  channelInfo: {
    flex: 1,
  },
  channelLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  channelValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  channelSubtext: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionBtnPill: {
    backgroundColor: '#0F8A5F',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    marginLeft: 8,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  faqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1.2,
    borderColor: '#A7F3D0',
  },
  faqIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  faqTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 2,
  },
  faqSubtitle: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 16,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F8A5F',
  },
});
