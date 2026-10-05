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
import { colors } from '../constants/colors';

const promises = [
  {
    icon: 'favorite',
    title: 'Welfare-Driven Fintech',
    desc: 'Every mobile & utility recharge contributes directly to girl child marriage and elder welfare.',
  },
  {
    icon: 'verified-user',
    title: '100% Trust & Transparency',
    desc: 'Direct beneficiary bank transfers and publicly auditable welfare ledger statements.',
  },
  {
    icon: 'bolt',
    title: 'Split-Second Recharges',
    desc: 'High-speed BBPS integrated gateway for instant mobile, DTH, and electricity payments.',
  },
  {
    icon: 'support-agent',
    title: 'Dedicated Community Support',
    desc: '24x7 helpdesk for scheme registrations, document verifications, and transaction inquiries.',
  },
  {
    icon: 'trending-up',
    title: 'Continuous Empowerment',
    desc: 'Expanding educational stipends, medical aid, and rural community programs across India.',
  },
];

const AboutUs = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Sarvana</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Icon name="volunteer-activism" size={14} color={colors.primary} />
            <Text style={styles.heroBadgeText}>WELFARE & UTILITIES</Text>
          </View>
          <Text style={styles.heroTitle}>Sarvana All In One</Text>
          <Text style={styles.heroSubtitle}>
            Uniting seamless digital utility payments with impactful social welfare schemes — empowering communities one recharge at a time.
          </Text>
        </View>

        {/* Mission & Vision Row */}
        <View style={styles.gridRow}>
          <View style={styles.halfCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FCE7F3' }]}>
              <Icon name="flag" size={18} color={colors.primary} />
            </View>
            <Text style={styles.miniCardTitle}>Our Mission</Text>
            <Text style={styles.miniCardContent}>
              Provide every Indian transparent financial aid for marriages, education, and eldercare.
            </Text>
          </View>

          <View style={styles.halfCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
              <Icon name="visibility" size={18} color={colors.secondary} />
            </View>
            <Text style={styles.miniCardTitle}>Our Vision</Text>
            <Text style={styles.miniCardContent}>
              A self-sustaining welfare ecosystem where utility recharges drive social transformation.
            </Text>
          </View>
        </View>

        {/* Core Pillars */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="military-tech" size={18} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Our Core Pillars</Text>
          </View>

          <View style={styles.promisesList}>
            {promises.map((item, idx) => (
              <View key={idx} style={styles.promiseItem}>
                <View style={styles.promiseIconBox}>
                  <Icon name={item.icon} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promiseTitle}>{item.title}</Text>
                  <Text style={styles.promiseDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    height: 56,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
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
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
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
    borderColor: '#E5E7EB',
  },
  miniCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 10,
    marginBottom: 6,
  },
  miniCardContent: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
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
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  promiseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  promiseDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },
  footerCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
  },
  footerSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#4B5563',
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
    backgroundColor: colors.surfaceLight,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  contactChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
