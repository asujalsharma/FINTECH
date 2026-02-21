import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const RefundPolicy = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={['#0A237A', '#1756C5', '#4285F4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A237A" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refund Policy</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.whiteSheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            {/* Header Content */}
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
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RefundPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  whiteSheet: {
    flex: 1,
    backgroundColor: '#F5FAFF',
    marginTop: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1756C5',
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  intro: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
  },
  highlight: {
    color: '#222',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1756C5',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  listItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginLeft: 10,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '600',
    color: '#222',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
  },
  contact: {
    color: '#1756C5',
    fontSize: 14,
    marginTop: 5,
    fontWeight: '600',
  },
});
