import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Footer from '../components/Footer';
import COLORS from '../constants/colors';

const faqData = [
  {
    category: 'General',
    question: 'What is Recharge Hoga?',
    answer:
      'Recharge Hoga is a next-generation digital payment app that allows you to recharge prepaid mobile, DTH, pay utility bills, and manage money — all in one lightning-fast and secure platform.',
  },
  {
    category: 'Security',
    question: 'Is Recharge Hoga safe to use?',
    answer:
      'Absolutely! Recharge Hoga utilizes bank-grade 256-bit encryption, strict RBI guidelines, and multi-factor authentication to ensure all transactions and user data remain 100% secure.',
  },
  {
    category: 'Rewards',
    question: 'Do I get rewards on payments?',
    answer:
      'Yes! Recharge Hoga provides instant cashback, referral bonuses, and promotional discounts on recharges, bill payments, and friend referrals.',
  },
  {
    category: 'Getting Started',
    question: 'How do I get started?',
    answer:
      'Simply sign in with your 10-digit mobile number, verify the 4-digit OTP, and you are ready to recharge or top up your wallet in seconds.',
  },
  {
    category: 'Operators',
    question: 'Does Recharge Hoga support all operators?',
    answer:
      'Yes, Recharge Hoga supports all major Indian mobile operators (Jio, Airtel, Vi, BSNL), DTH providers (Tata Play, Sun Direct, Dish TV, etc.), and BBPS registered billers nationwide.',
  },
  {
    category: 'Transactions',
    question: 'What happens if a recharge fails?',
    answer:
      'If an operator transaction fails, our automated reconciliation engine refunds the full amount directly back to your Recharge Hoga wallet or source account within 7 business days with zero deductions.',
  },
];

const FAQScreen = ({ navigation }) => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = index => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
        <Text style={styles.headerTitle}>Help & FAQ</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Icon name="help-outline" size={14} color={COLORS.primary} />
            <Text style={styles.heroBadgeText}>KNOWLEDGE BASE</Text>
          </View>
          <Text style={styles.heroTitle}>Frequently Asked Questions</Text>
          <Text style={styles.heroSubtitle}>
            Have queries about recharges, cashbacks, or security? Find instant answers below.
          </Text>
        </View>

        {/* Accordion FAQ Cards */}
        {faqData.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <View
              key={index}
              style={[
                styles.card,
                isOpen && styles.activeCard,
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.questionRow}
                onPress={() => toggle(index)}
              >
                <View style={styles.questionLeft}>
                  <View
                    style={[
                      styles.categoryDot,
                      isOpen && { backgroundColor: COLORS.primary },
                    ]}
                  />
                  <Text
                    style={[
                      styles.questionText,
                      isOpen && { color: COLORS.primary },
                    ]}
                  >
                    {item.question}
                  </Text>
                </View>
                <View style={styles.arrowCircle}>
                  <Icon
                    name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={22}
                    color={isOpen ? COLORS.primary : '#64748B'}
                  />
                </View>
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={{ marginTop: 24 }}>
          <Footer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQScreen;

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
    marginBottom: 10,
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
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    overflow: 'hidden',
  },
  activeCard: {
    borderColor: '#D8B4FE',
    shadowOpacity: 0.05,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  questionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  answerText: {
    fontSize: 13.5,
    lineHeight: 21,
    color: '#475569',
  },
});
