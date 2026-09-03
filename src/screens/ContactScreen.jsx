import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';
import COLORS from '../constants/colors';

const ContactScreen = () => {
  const navigation = useNavigation();

  const callUs = () => {
    Linking.openURL('tel:+919343789798');
  };

  const openWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=+919343789798&text=Hello%20Recharge%20Hoga%20Support');
  };

  const emailUs = () => {
    Linking.openURL('mailto:techemberwork@gmail.com');
  };

  const openFaq = () => {
    navigation.navigate('FAQScreen');
  };

  const ratePlayStore = () => {
    Linking.openURL('market://details?id=com.RechargeHoga');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg || '#0A2568'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>24/7 Help & Support</Text>
          <Text style={styles.headerTime}>Operating Hours: 11 AM – 7 PM IST</Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Support Agent Banner */}
        <View style={styles.agentBanner}>
          <View style={styles.agentIconCircle}>
            <MaterialCommunityIcons
              name="face-agent"
              size={54}
              color={COLORS.primary || '#0D52ED'}
            />
          </View>

          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Support Desk Online</Text>
          </View>

          <Text style={styles.agentTitle}>How can we help you?</Text>
          <Text style={styles.agentSubtitle}>
            Reach out through our direct phone line, WhatsApp desk, or email for instant assistance.
          </Text>
        </View>

        {/* Primary Contact Channels */}
        <Text style={styles.sectionLabel}>Direct Assistance</Text>

        <View style={styles.primaryChannelsRow}>
          {/* Call Us */}
          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.channelCard}
            onPress={callUs}
          >
            <View style={[styles.channelIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="phone" size={26} color="#0D52ED" />
            </View>
            <Text style={styles.channelTitle}>Call Us</Text>
            <Text style={styles.channelSubtitle}>+91 9343789798</Text>
          </TouchableOpacity>

          {/* WhatsApp */}
          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.channelCard}
            onPress={openWhatsApp}
          >
            <View style={[styles.channelIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <FontAwesome name="whatsapp" size={26} color="#10B981" />
            </View>
            <Text style={styles.channelTitle}>WhatsApp</Text>
            <Text style={[styles.channelSubtitle, { color: '#059669' }]}>Instant Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Email Support Card */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.emailCard}
          onPress={emailUs}
        >
          <View style={styles.emailLeft}>
            <View style={[styles.channelIconCircle, { backgroundColor: '#F0F5FF' }]}>
              <Icon name="email" size={24} color="#0D52ED" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.emailTitle}>Email Support</Text>
              <Text style={styles.emailSubtitle}>techemberwork@gmail.com</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={22} color="#94A3B8" />
        </TouchableOpacity>

        {/* Self Help Options */}
        <Text style={styles.sectionLabel}>Quick Resources</Text>

        <View style={styles.optionsCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.optionRow}
            onPress={openFaq}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Icon name="help-outline" size={20} color="#D97706" />
              </View>
              <Text style={styles.optionText}>Frequently Asked Questions (FAQ)</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.optionRow}
            onPress={emailUs}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconBox, { backgroundColor: '#EDE9FE' }]}>
                <Icon name="chat" size={20} color="#7C3AED" />
              </View>
              <Text style={styles.optionText}>Send App Feedback</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.optionRow}
            onPress={ratePlayStore}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconBox, { backgroundColor: '#FEF9C3' }]}>
                <Icon name="star" size={20} color="#CA8A04" />
              </View>
              <Text style={styles.optionText}>Rate us on Google Play Store</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* GST Registration Details */}
        {/* <View style={styles.gstCard}>
          <View style={styles.gstHeader}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#10B981" />
            <Text style={styles.gstHeaderText}>GST Registration Details</Text>
          </View>

          <View style={styles.gstBadgeRow}>
            <Text style={styles.gstBadgeLabel}>GSTIN / REGISTRATION NUMBER</Text>
            <View style={styles.gstinBox}>
              <Text style={styles.gstinText}>09IILPS7906E1ZM</Text>
            </View>
          </View>

          <View style={styles.gstRow}>
            <Text style={styles.gstLabel}>Trade Name</Text>
            <Text style={styles.gstValue}>AYDS digital hub</Text>
          </View>

          <View style={styles.gstRow}>
            <Text style={styles.gstLabel}>Legal Name</Text>
            <Text style={styles.gstValue}>YAGYADUTT SHARMA</Text>
          </View>

          <View style={styles.gstRow}>
            <Text style={styles.gstLabel}>Constitution</Text>
            <Text style={styles.gstValue}>Proprietorship</Text>
          </View>

          <View style={styles.gstDivider} />

          <View style={styles.gstAddressContainer}>
            <Text style={styles.gstLabel}>Principal Place of Business</Text>
            <Text style={styles.gstAddressText}>
              Building No. 523, Allipur Road, Near Prathmik Vidyalaya, Padari, Allipur, District: Lakhimpur Kheri, Uttar Pradesh - 261501
            </Text>
          </View>

          <View style={styles.govTag}>
            <Text style={styles.govTagText}>🏛️ Form GST REG-06 • Government of India</Text>
          </View>
        </View> */}

        {/* Footer */}
        <View style={{ marginTop: 'auto', paddingTop: 24, marginHorizontal: -16 }}>
          <Footer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    width: '100%',
    backgroundColor: COLORS.headerBg || '#0A2568',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: COLORS.headerBg || '#0A2568',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerTime: {
    color: '#D9E7FF',
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
  },

  /* AGENT BANNER */
  agentBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginBottom: 20,
  },
  agentIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 8,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  agentTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#091838',
  },
  agentSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* SECTION LABELS */
  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#091838',
    marginBottom: 10,
    letterSpacing: 0.2,
  },

  /* CHANNELS ROW */
  primaryChannelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  channelCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  channelIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  channelTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#091838',
  },
  channelSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '600',
  },

  /* EMAIL CARD */
  emailCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    marginBottom: 20,
  },
  emailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#091838',
  },
  emailSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },

  /* OPTIONS CARD */
  optionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#091838',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  /* GST CARD */
  gstCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  gstHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  gstHeaderText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#091838',
  },
  gstBadgeRow: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  gstBadgeLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gstinBox: {
    backgroundColor: COLORS.primary || '#0D52ED',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  gstinText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  gstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  gstLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  gstValue: {
    fontSize: 13.5,
    color: '#091838',
    fontWeight: '700',
  },
  gstDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  gstAddressContainer: {
    marginTop: 2,
  },
  gstAddressText: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 18,
  },
  govTag: {
    marginTop: 14,
    backgroundColor: '#F0FDF4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
  },
  govTagText: {
    color: '#166534',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
