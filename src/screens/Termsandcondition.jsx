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
import { colors } from '../constants/colors';

const sections = [
  {
    number: '1',
    title: 'Acceptance of Terms',
    content:
      'By using Sarvana All In One App or Services, you acknowledge that you have read and understood these Terms and agree to be bound by them. The platform provides digital utility payments, BBPS bill payments, and social welfare grant applications.',
  },
  {
    number: '2',
    title: 'Eligibility for Sahayog Welfare Schemes',
    content:
      'Applicants for Vivah Sahayog, Vidya Sahayog, Chikitsa Sahayog, or Vridh Sahayog must be Indian citizens meeting specific family income and documentation requirements as outlined in respective scheme guidelines.',
  },
  {
    number: '3',
    title: 'Recharge & BBPS Payments',
    content:
      'Sarvana operates with authorized NPCI / BBPS Bharat BillPay channels. Payments processed are instant, and receipts are generated directly on your app passbook.',
  },
  {
    number: '4',
    title: 'Voluntary Welfare Contributions',
    content:
      'Contributions made during recharges or through direct foundation donations are non-refundable and directly allocated towards verified beneficiaries and social welfare initiatives.',
  },
  {
    number: '5',
    title: 'Account Security & MPIN',
    content:
      'Users are responsible for maintaining the confidentiality of their 4-digit MPIN and OTP. Never share your security credentials with anyone.',
  },
  {
    number: '6',
    title: 'Refund & Failed Transactions',
    content:
      'If any recharge or utility payment fails at the provider gateway, 100% of the deduction is credited back to your Sarvana Wallet or original payment method immediately.',
  },
];

const TermsAndConditions = () => {
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Icon name="gavel" size={14} color={colors.primary} />
            <Text style={styles.heroBadgeText}>LEGAL AGREEMENT</Text>
          </View>
          <Text style={styles.heroTitle}>Sarvana Terms of Service</Text>
          <Text style={styles.heroSubtitle}>
            Welcome to <Text style={styles.boldText}>Sarvana All In One</Text>. Please read our terms and scheme guidelines before using our services.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.contactChip}
            onPress={() => Linking.openURL('mailto:legal@sarvana.org')}
          >
            <Icon name="mail-outline" size={16} color={colors.primary} />
            <Text style={styles.contactChipText}>legal@sarvana.org</Text>
          </TouchableOpacity>
        </View>

        {/* Section Cards */}
        {sections.map((section) => (
          <View key={section.number} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberBadgeText}>{section.number}</Text>
              </View>
              <Text style={styles.cardTitle}>{section.title}</Text>
            </View>

            <Text style={styles.cardContent}>{section.content}</Text>
          </View>
        ))}

        {/* Bottom Banner */}
        <View style={styles.agreementNotice}>
          <Icon name="verified-user" size={20} color={colors.secondary} />
          <Text style={styles.agreementText}>
            By continuing to use Sarvana All In One, you confirm that you agree to all terms and welfare foundation guidelines.
          </Text>
        </View>

        <View style={{ marginTop: 24 }}>
          <Footer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsAndConditions;

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
    marginBottom: 16,
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
    marginBottom: 14,
  },
  boldText: {
    fontWeight: '700',
    color: colors.primary,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 8,
  },
  contactChipText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  cardContent: {
    fontSize: 13.5,
    lineHeight: 21,
    color: '#4B5563',
  },
  agreementNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  agreementText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#065F46',
    fontWeight: '500',
  },
});
