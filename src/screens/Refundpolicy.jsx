import { THEME_COLORS, GRADIENTS } from '../constants/theme';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';

const RefundPolicy = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header */}
        <Text style={styles.title}>Refund Policy</Text>
        <Text style={styles.intro}>
          Thank you for choosing <Text style={styles.highlight}>99 Recharce</Text>{' '}
          for your recharge needs. We are committed to providing a seamless and
          reliable platform for all your mobile and DTH recharge transactions.
          However, we understand that there may be cases where a refund is
          required. Please review our refund policy below to ensure complete
          clarity and transparency.
        </Text>

        {/* Section 1: Refund Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Refund Duration</Text>
          <Text style={styles.text}>
            Refund requests for failed transactions can be initiated within{' '}
            <Text style={styles.bold}>7 business days</Text> from the date of
            the transaction.
          </Text>
        </View>

        {/* Section 2: Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conditions for Refunds</Text>
          <Text style={styles.text}>
            Refunds are strictly applicable only for{' '}
            <Text style={styles.bold}>failed transactions</Text>. Our automated
            systems ensure swift and accurate processing of refunds in such
            cases.
          </Text>
        </View>

        {/* Section 3: Request Process */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Refund Request Process</Text>
          <Text style={styles.text}>
            To initiate a refund request, users can:
          </Text>
          <Text style={styles.listItem}>
            • Lodge a complaint for the specific failed transaction, or
          </Text>
          <Text style={styles.listItem}>
            • Contact our dedicated support team directly.
          </Text>
          <Text style={styles.text}>
            Our representatives are committed to providing prompt and efficient
            assistance to ensure quick resolution.
          </Text>
        </View>

        {/* Section 4: Fees */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fees and Deductions</Text>
          <Text style={styles.text}>
            We believe in <Text style={styles.bold}>complete transparency</Text>{' '}
            when it comes to refunds. There are{' '}
            <Text style={styles.bold}>
              no hidden charges, fees, or deductions
            </Text>{' '}
            during refund processing. The full transaction amount will be
            credited back to your original payment method.
          </Text>
        </View>

        {/* Section 5: Modes of Refund */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modes of Refund</Text>
          <Text style={styles.text}>
            Refunds will always be processed back to the{' '}
            <Text style={styles.bold}>original payment method</Text> used during
            the transaction. We value your trust and ensure a smooth, secure,
            and hassle-free experience throughout the process.
          </Text>
        </View>

        {/* Section 6: Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Assistance?</Text>
          <Text style={styles.text}>
            If you have any inquiries or need help regarding refunds, our
            knowledgeable support team is here for you. Your satisfaction is our
            utmost priority, and we’re dedicated to resolving your concerns
            promptly.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.text}>
            For refund-related queries or assistance, please contact:
          </Text>
          <Text style={styles.contact}>📧 99 Recharce.in@gmail.com</Text>
          <Text style={styles.contact}>🌐 www.99 Recharce.in</Text>
          <Text style={styles.text}>
            Thank you for your understanding and continued support.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RefundPolicy;

const COLORS = {
  primary: THEME_COLORS.orange,
  textDark: '#222',
  textLight: '#555',
  background: '#f9f9f9',
  card: '#fff',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 15,
  },
  intro: {
    fontSize: 15,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: 15,
  },
  highlight: {
    color: COLORS.textDark,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  listItem: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 22,
    marginLeft: 10,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '600',
    color: COLORS.textDark,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  contact: {
    color: COLORS.primary,
    fontSize: 14,
    marginTop: 5,
  },
});
