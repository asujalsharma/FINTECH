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

const sections = [
  {
    number: '1',
    title: 'Acceptance of Terms',
    content:
      'By using the Website or Services, you acknowledge that you have read and understood these Terms and agree to be bound by them. The information provided does not constitute professional advice and is used at your own risk.\n\nYou can accept these Terms by:',
    bullets: [
      'Using the Website or any of its Services.',
      'Confirming that you are of legal age (18+) and not barred under applicable laws.',
    ],
  },
  {
    number: '2',
    title: 'Eligibility',
    content:
      'The Services are not available to persons under 18 years of age or those previously suspended by Recharge Hoga. By using the Site, you confirm that you meet eligibility requirements and that all information you provide is accurate and up to date.',
  },
  {
    number: '3',
    title: 'Registration & Account Security',
    content:
      'You will receive a user ID and OTP to access your account. Keep this information confidential as you are responsible for all activity under your account. If unauthorized access occurs, please report immediately to our support team.',
    email: 'yarapay@zohomail.in',
  },
  {
    number: '4',
    title: 'Recharge Hoga Recharges',
    content:
      'Recharge Hoga acts solely as a reseller of prepaid mobile and DTH services. We do not guarantee service quality or validity and are not responsible for disputes between you and your telecom provider.',
  },
  {
    number: '5',
    title: 'General Conditions',
    content: 'Please observe the following transaction conditions:',
    bullets: [
      'Service fees may apply depending on the transaction type.',
      'Reversals or failed payments may incur banking charges.',
      'Recharge Hoga is not liable for delays beyond its reasonable control.',
    ],
  },
  {
    number: '6',
    title: 'Confidentiality',
    content:
      'Privacy of communication is strictly governed by RBI regulations. Karl Digital Hub may disclose information to authorities as required by law to provide Wallet or Payment services.',
  },
  {
    number: '7',
    title: 'Intellectual Property Rights',
    content:
      'All materials, trademarks, logos, and content on the Site belong to Karl Digital Hub or its licensors. You may not copy, reproduce, modify, distribute, or create derivative works without prior written permission.',
  },
  {
    number: '8',
    title: 'Disclaimer (No Warranty)',
    content:
      'Recharge Hoga provides its services on an "as is" and "as available" basis without warranties of any kind. We do not guarantee uninterrupted service, absolute accuracy, or complete freedom from errors.',
  },
  {
    number: '9',
    title: 'Indemnity',
    content:
      'You agree to indemnify and hold Recharge Hoga, its directors, and affiliates harmless from any claims, damages, or losses arising from your use of our platform or breach of these Terms.',
  },
  {
    number: '10',
    title: 'Limitation of Liability',
    content:
      'Recharge Hoga and its associates will not be liable for indirect, incidental, or consequential damages. Our total liability shall not exceed the transaction amount involved.',
  },
  {
    number: '11',
    title: 'Authorization',
    content:
      'By accepting these Terms, you authorize Recharge Hoga to process and transfer payments on your behalf between payment systems, wallets, and your bank account.',
  },
  {
    number: '12',
    title: 'Refund Policy',
    content:
      'All sales are final. In cases of failed transactions, refunds will be processed within 7 working days after verification and credited to your Recharge Hoga account or original payment method.',
  },
  {
    number: '13',
    title: 'Technical Issues',
    content:
      'For any technical issues or assistance, please raise a support ticket directly via our email channel.',
    email: 'yarapay@zohomail.in',
  },
  {
    number: '14',
    title: 'Governing Law & Dispute Resolution',
    content:
      'These Terms are governed by the laws of India. Any disputes will be resolved exclusively in the competent courts of Pune, Maharashtra, India.',
  },
  {
    number: '15',
    title: 'Customer Communication',
    content:
      'You consent to receive communications via SMS, email, or push notifications regarding your transactions and account alerts. To opt out, please contact support.',
    email: 'yarapay@zohomail.in',
  },
];

const TermsAndConditions = () => {
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
            <Icon name="gavel" size={14} color={COLORS.primary} />
            <Text style={styles.heroBadgeText}>LEGAL AGREEMENT</Text>
          </View>
          <Text style={styles.heroTitle}>Terms of Service</Text>
          <Text style={styles.heroSubtitle}>
            Welcome to <Text style={styles.boldText}>Recharge Hoga</Text>. Your
            use of our platform is governed by these Terms. Please read them
            carefully before registering or accessing our services.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.contactChip}
            onPress={() => Linking.openURL('mailto:yarapay@zohomail.in')}
          >
            <Icon name="mail-outline" size={16} color={COLORS.primary} />
            <Text style={styles.contactChipText}>yarapay@zohomail.in</Text>
          </TouchableOpacity>
        </View>

        {/* Section Cards */}
        {sections.map(section => (
          <View key={section.number} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberBadgeText}>{section.number}</Text>
              </View>
              <Text style={styles.cardTitle}>{section.title}</Text>
            </View>

            <Text style={styles.cardContent}>{section.content}</Text>

            {section.bullets && (
              <View style={styles.bulletList}>
                {section.bullets.map((bullet, idx) => (
                  <View key={idx} style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            )}

            {section.email && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.inlineAction}
                onPress={() => Linking.openURL(`mailto:${section.email}`)}
              >
                <Icon name="mail-outline" size={14} color={COLORS.primary} />
                <Text style={styles.inlineActionText}>{section.email}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Bottom Banner */}
        <View style={styles.agreementNotice}>
          <Icon name="verified-user" size={20} color={COLORS.primary} />
          <Text style={styles.agreementText}>
            By continuing to use Recharge Hoga, you confirm that you have read,
            understood, and agreed to these Terms & Conditions.
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
    marginBottom: 14,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 8,
  },
  contactChipText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
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
  inlineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#F3E8FF',
    borderRadius: 6,
    gap: 6,
  },
  inlineActionText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  agreementNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  agreementText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
    fontWeight: '500',
  },
});
