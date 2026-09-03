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

const RefundPolicy = () => {
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
        <Text style={styles.headerTitle}>Refund Policy</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Hero Assurance Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Icon name="shield" size={14} color={COLORS.primary} />
            <Text style={styles.heroBadgeText}>100% SECURE TRANSACTIONS</Text>
          </View>
          <Text style={styles.heroTitle}>Transparent Refund Policy</Text>
          <Text style={styles.heroSubtitle}>
            Thank you for choosing <Text style={styles.boldText}>Recharge Hoga</Text>.
            We are committed to providing a reliable, swift, and transparent
            platform for all your mobile and DTH recharge transactions.
          </Text>

          {/* Quick Stats Grid */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>7 Days</Text>
              <Text style={styles.statLabel}>Max Duration</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Full Refund</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>₹0</Text>
              <Text style={styles.statLabel}>Deductions</Text>
            </View>
          </View>
        </View>

        {/* Section 1: Refund Duration */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="schedule" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>1. Refund Duration</Text>
          </View>
          <Text style={styles.cardContent}>
            Refund requests for failed transactions can be initiated within{' '}
            <Text style={styles.boldText}>7 business days</Text> from the date of
            the original transaction.
          </Text>
        </View>

        {/* Section 2: Conditions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="verified" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>2. Conditions for Refunds</Text>
          </View>
          <Text style={styles.cardContent}>
            Refunds are strictly applicable only for{' '}
            <Text style={styles.boldText}>failed transactions</Text>. Our automated
            systems ensure swift and accurate processing of refunds directly in
            such cases.
          </Text>
        </View>

        {/* Section 3: Request Process */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="assignment" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>3. Refund Request Process</Text>
          </View>
          <Text style={styles.cardContent}>To initiate a refund request, you can:</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                Lodge a complaint in-app for the specific failed transaction.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                Contact our dedicated support team directly with order details.
              </Text>
            </View>
          </View>
          <Text style={[styles.cardContent, { marginTop: 10 }]}>
            Our team is committed to providing prompt and efficient assistance
            for quick resolution.
          </Text>
        </View>

        {/* Section 4: Fees and Deductions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="money-off" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>4. Fees and Deductions</Text>
          </View>
          <Text style={styles.cardContent}>
            We believe in complete transparency. There are{' '}
            <Text style={styles.boldText}>no hidden charges, fees, or deductions</Text>{' '}
            during refund processing. The entire transaction amount will be credited back.
          </Text>
        </View>

        {/* Section 5: Modes of Refund */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="account-balance-wallet" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>5. Modes of Refund</Text>
          </View>
          <Text style={styles.cardContent}>
            Refunds will always be processed back to the{' '}
            <Text style={styles.boldText}>original payment method</Text> or your
            Recharge Hoga wallet used during the transaction.
          </Text>
        </View>

        {/* Section 6: Assistance & Contacts */}
        <View style={styles.supportCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="support-agent" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Need Assistance?</Text>
          </View>
          <Text style={styles.cardContent}>
            If you have any inquiries or need help regarding refunds, our team is
            available to help resolve your concerns.
          </Text>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.actionBtn}
              onPress={() => Linking.openURL('mailto:yarapay@zohomail.in')}
            >
              <Icon name="email" size={16} color={COLORS.primary} />
              <Text style={styles.actionBtnText}>Email Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.actionBtn}
              onPress={() => Linking.openURL('https://www.yarapay.in/')}
            >
              <Icon name="language" size={16} color={COLORS.primary} />
              <Text style={styles.actionBtnText}>Visit Website</Text>
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

export default RefundPolicy;

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
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
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
  supportCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    marginTop: 8,
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 21,
    color: '#475569',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
