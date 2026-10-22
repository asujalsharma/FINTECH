import React, { useState, useEffect } from 'react';
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
import { colors } from '../constants/colors';
import { fetchAllFundSchemes } from '../services/fundSchemeService';

const baseFaqData = [
  {
    category: 'General',
    question: 'What is Sarvana All In One?',
    answer:
      'Sarvana All In One is India\'s unique welfare-linked fintech application. It lets you recharge mobile & DTH, pay BBPS bills, and directly enroll into social welfare schemes like Vivah Sahayog, Vidya Sahayog, and Chikitsa Sahayog.',
  },
  {
    category: 'Recharge & BBPS',
    question: 'Does Sarvana support all mobile and utility operators?',
    answer:
      'Yes, Sarvana supports all Indian telecom providers (Jio, Airtel, Vi, BSNL) and over 20,000+ BBPS billers including FASTag, electricity boards, gas cylinders, and water bills.',
  },
  {
    category: 'Contributions',
    question: 'How do my recharges support social welfare?',
    answer:
      'When completing a recharge, a small voluntary contribution (or foundation commission share) goes towards the Sarvana Welfare Fund, directly funding poor girl marriages, school education kits, and elder medical aid.',
  },
  {
    category: 'Security & Refunds',
    question: 'What if my payment or recharge fails?',
    answer:
      'If any transaction fails at the operator end, 100% of your amount is automatically refunded back to your Sarvana Wallet or source payment method instantly.',
  },
];

const FAQScreen = ({ navigation }) => {
  const [faqs, setFaqs] = useState(baseFaqData);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const schemes = await fetchAllFundSchemes();
        if (isMounted && Array.isArray(schemes) && schemes.length > 0) {
          const schemeFaqs = [];
          schemes.forEach(s => {
            const catName = s.name || s.nameEn || 'Sahayog Schemes';
            if (Array.isArray(s.faqs)) {
              s.faqs.forEach(f => {
                schemeFaqs.push({
                  category: catName,
                  question: f.question,
                  answer: f.answer,
                });
              });
            }
          });
          if (schemeFaqs.length > 0) {
            setFaqs([...baseFaqData.slice(0, 1), ...schemeFaqs, ...baseFaqData.slice(1)]);
          }
        }
      } catch (err) {
        console.log('Error loading dynamic FAQs:', err);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const toggle = index => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
            <Icon name="help-outline" size={14} color={colors.primary} />
            <Text style={styles.heroBadgeText}>KNOWLEDGE BASE</Text>
          </View>
          <Text style={styles.heroTitle}>Frequently Asked Questions</Text>
          <Text style={styles.heroSubtitle}>
            Have questions about schemes, passbook statements, or BBPS recharges? Find answers below.
          </Text>
        </View>

        {/* Accordion FAQ Cards */}
        {faqs.map((item, index) => {
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
                      isOpen && { backgroundColor: colors.primary },
                    ]}
                  />
                  <Text
                    style={[
                      styles.questionText,
                      isOpen && { color: colors.primary },
                    ]}
                  >
                    {item.question}
                  </Text>
                </View>
                <View style={styles.arrowCircle}>
                  <Icon
                    name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={22}
                    color={isOpen ? colors.primary : '#64748B'}
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQScreen;

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
    marginBottom: 10,
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
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  activeCard: {
    borderColor: colors.primary,
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
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 20,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  answerText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#4B5563',
  },
});
