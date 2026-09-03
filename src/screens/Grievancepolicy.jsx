import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Footer from '../components/Footer';
import COLORS from '../constants/colors';

const GrievancePolicy = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.headerBg} barStyle="light-content" />

      {/* Elegant Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grievance Redressal</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Icon name="verified-user" size={14} color={COLORS.primary} />
            <Text style={styles.heroBadgeText}>CUSTOMER FIRST POLICY</Text>
          </View>
          <Text style={styles.heroTitle}>Grievance Redressal Policy</Text>
          <Text style={styles.heroSubtitle}>
            At <Text style={styles.boldText}>Recharge Hoga</Text>, we are committed
            to transparency, accountability, and fairness. This framework ensures
            prompt and structured resolution for any concerns.
          </Text>

          {/* Timeline Pills */}
          <View style={styles.timelineRow}>
            <View style={styles.timelineItem}>
              <Icon name="done-all" size={16} color={COLORS.primary} />
              <View>
                <Text style={styles.timelineTitle}>24 Hours</Text>
                <Text style={styles.timelineSubtitle}>Acknowledgment</Text>
              </View>
            </View>
            <View style={styles.timelineDivider} />
            <View style={styles.timelineItem}>
              <Icon name="alarm-on" size={16} color={COLORS.primary} />
              <View>
                <Text style={styles.timelineTitle}>7 Business Days</Text>
                <Text style={styles.timelineSubtitle}>Resolution Target</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 1 & 2: Purpose & Objectives */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="track-changes" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>1. Purpose & Objective</Text>
          </View>
          <Text style={styles.cardContent}>
            This policy ensures a fair, swift, and transparent process for resolving
            customer complaints while maintaining strict compliance with regulatory
            guidelines (RBI and telecom authorities).
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>Fair and transparent grievance handling</Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>Fast turnaround and proactive progress updates</Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>Continuous service improvements from user feedback</Text>
            </View>
          </View>
        </View>

        {/* Section 3: Scope */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="domain-verification" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>2. Scope of Issues Covered</Text>
          </View>
          <Text style={styles.cardContent}>
            Applies to all users of Recharge Hoga mobile app and digital services for issues regarding:
          </Text>
          <View style={styles.tagGrid}>
            {[
              'Failed Recharges',
              'Pending Refunds',
              'Payment Gateway Delays',
              'Wallet Top-up Issues',
              'Account Access',
              'Billing Inquiries',
            ].map((tag, idx) => (
              <View key={idx} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section 4: Channels */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="contact-support" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>3. How to Raise a Grievance</Text>
          </View>
          <Text style={styles.cardContent}>
            Users can lodge complaints through any of the following channels:
          </Text>

          <View style={styles.channelList}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.channelItem}
              onPress={() => Linking.openURL('mailto:yarapay@zohomail.in')}
            >
              <View style={styles.channelIcon}>
                <Icon name="email" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.channelTitle}>Email Support</Text>
                <Text style={styles.channelSubtitle}>yarapay@zohomail.in</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.channelItem}
              onPress={() => Linking.openURL('https://www.yarapay.in/')}
            >
              <View style={styles.channelIcon}>
                <Icon name="language" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.channelTitle}>Official Portal</Text>
                <Text style={styles.channelSubtitle}>https://www.yarapay.in/</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 5: Escalation */}
        <View style={styles.escalationCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Icon name="security" size={18} color="#EF4444" />
            </View>
            <Text style={styles.cardTitle}>4. Escalation Process</Text>
          </View>
          <Text style={styles.cardContent}>
            If your complaint is not resolved within 7 business days, you may escalate directly to our Grievance Officer:
          </Text>

          <View style={styles.officerBox}>
            <View style={styles.officerRow}>
              <Icon name="person" size={16} color={COLORS.primary} />
              <Text style={styles.officerLabel}>Grievance Officer: Designated Redressal Head</Text>
            </View>
            <View style={styles.officerRow}>
              <Icon name="schedule" size={16} color={COLORS.primary} />
              <Text style={styles.officerLabel}>Escalation Resolution: Within 15 business days</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.escalateBtn}
              onPress={() => Linking.openURL('mailto:yarapay@zohomail.in?subject=Escalated%20Grievance')}
            >
              <Icon name="mail-outline" size={15} color="#FFF" />
              <Text style={styles.escalateBtnText}>Escalate to Grievance Desk</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 6: User Rights */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="verified" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>5. User Rights & Protection</Text>
          </View>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Icon name="check-circle" size={16} color={COLORS.accent} />
              <Text style={styles.bulletText}>Raise concerns without fear of service disruption</Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="check-circle" size={16} color={COLORS.accent} />
              <Text style={styles.bulletText}>Receive written acknowledgment and tracking ID</Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="check-circle" size={16} color={COLORS.accent} />
              <Text style={styles.bulletText}>Obtain fair, reasoned, and transparent explanations</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Footer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GrievancePolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 56,
    backgroundColor: COLORS.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  headerRightPlaceholder: {
    width: 38,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 16,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  timelineRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  timelineSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  timelineDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  escalationCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  bulletList: {
    marginTop: 10,
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  bulletText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
    color: '#475569',
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  channelList: {
    marginTop: 12,
    gap: 8,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  channelIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  channelSubtitle: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
  },
  officerBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
  },
  officerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  officerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78350F',
  },
  escalateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 6,
    gap: 8,
  },
  escalateBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
