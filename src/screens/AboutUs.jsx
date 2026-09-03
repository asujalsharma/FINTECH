import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import COLORS from '../constants/colors';
import Footer from '../components/Footer';

const promises = [
  {
    icon: 'favorite',
    title: 'Customer-Centric Approach',
    desc: 'We put our customers first — understanding everyday needs and exceeding expectations.',
  },
  {
    icon: 'lightbulb',
    title: 'Innovation & Technology',
    desc: 'We continuously adopt cutting-edge financial rails to deliver split-second recharges.',
  },
  {
    icon: 'lock',
    title: 'Security & Trust',
    desc: 'Top-tier 256-bit encryption and multi-factor authorization to keep your wallet secure.',
  },
  {
    icon: 'balance',
    title: 'Transparency & Ethics',
    desc: 'Zero hidden deductions and honest pricing guide everything we do.',
  },
  {
    icon: 'trending-up',
    title: 'Continuous Improvement',
    desc: 'User feedback fuels our roadmap to build India’s smoothest recharge experience.',
  },
];

const AboutUs = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.headerBg} barStyle="light-content" />

      {/* Standard Elegant Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Icon name="bolt" size={14} color={COLORS.primary} />
            <Text style={styles.heroBadgeText}>NEXT-GEN FINTECH</Text>
          </View>
          <Text style={styles.heroTitle}>Welcome to Recharge Hoga</Text>
          <Text style={styles.heroSubtitle}>
            Redefining the future of digital payments and telecom utilities —
            one seamless transaction at a time.
          </Text>
        </View>

        {/* Journey Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="explore" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Our Journey</Text>
              <Text style={styles.milestoneBadge}>Started Dec 1, 2025</Text>
            </View>
          </View>
          <Text style={styles.cardContent}>
            Recharge Hoga embarked on its exciting journey with a singular vision:
            to revolutionize digital payments and prepaid recharge services.
            We began our mission to make financial utilities fast, reliable, and rewarding.
          </Text>
        </View>

        {/* Mission & Vision Row */}
        <View style={styles.gridRow}>
          <View style={styles.halfCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
              <Icon name="flag" size={18} color="#0284C7" />
            </View>
            <Text style={styles.miniCardTitle}>Our Mission</Text>
            <Text style={styles.miniCardContent}>
              Empower users with ultrafast, secure digital recharges and cashback rewards.
            </Text>
          </View>

          <View style={styles.halfCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
              <Icon name="visibility" size={18} color="#16A34A" />
            </View>
            <Text style={styles.miniCardTitle}>Our Vision</Text>
            <Text style={styles.miniCardContent}>
              Build a universal financial ecosystem accessible to every Indian consumer.
            </Text>
          </View>
        </View>

        {/* Core Promises */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="military-tech" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Our Core Pillars</Text>
          </View>

          <View style={styles.promisesList}>
            {promises.map((item, idx) => (
              <View key={idx} style={styles.promiseItem}>
                <View style={styles.promiseIconBox}>
                  <Icon name={item.icon} size={18} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promiseTitle}>{item.title}</Text>
                  <Text style={styles.promiseDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Join the Movement Card */}
        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Join the Revolution</Text>
          <Text style={styles.footerSubtitle}>
            Be part of the Recharge Hoga journey — where technology meets trust
            and innovation meets financial inclusion.
          </Text>

          <View style={styles.contactRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.contactChip}
              onPress={() => Linking.openURL('https://www.yarapay.in/')}
            >
              <Icon name="language" size={16} color={COLORS.primary} />
              <Text style={styles.contactChipText}>www.yarapay.in</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.contactChip}
              onPress={() => Linking.openURL('mailto:yarapay@zohomail.in')}
            >
              <Icon name="email" size={16} color={COLORS.primary} />
              <Text style={styles.contactChipText}>yarapay@zohomail.in</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Footer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutUs;

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
    marginBottom: 14,
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
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  milestoneBadge: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  halfCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  miniCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
    marginBottom: 6,
  },
  miniCardContent: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
  },
  promisesList: {
    gap: 14,
    marginTop: 6,
  },
  promiseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  promiseIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  promiseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  promiseDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
  },
  footerCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    textAlign: 'center',
  },
  footerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  footerSubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 14,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  contactChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  contactChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
