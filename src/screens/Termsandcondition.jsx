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

const TermsAndConditions = () => {
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
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.whiteSheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            {/* Header */}
            <Text style={styles.title}>Terms & Conditions</Text>
            <Text style={styles.intro}>
              Welcome to <Text style={styles.highlight}>99 Recharce</Text>. Your use of
              99 Recharce on our Website or Mobile App is governed by the following Terms
              and Conditions (“Terms”). Please read them carefully before
              registering, accessing, or using our services. By continuing to use
              the Site, you agree to be bound by these Terms, including any future
              modifications. If you do not agree, please discontinue use
              immediately.
            </Text>

            <Text style={styles.text}>
              For any queries, please contact us at{' '}
              <Text style={styles.link}>99 Recharcein@gmail.com</Text>.
            </Text>

            {/* Section 1 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.text}>
                By using the Website or Services, you acknowledge that you have read
                and understood these Terms and agree to be bound by them. The
                information provided on the Website does not constitute professional
                advice and is used at your own risk.{'\n\n'}
                You can accept these Terms by:
              </Text>
              <Text style={styles.listItem}>
                • Using the Website or any of its Services.
              </Text>
              <Text style={styles.listItem}>
                • Confirming that you are of legal age (18+) and not barred under
                applicable laws.
              </Text>
            </View>

            {/* Section 2 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Eligibility</Text>
              <Text style={styles.text}>
                The Services are not available to persons under 18 years of age or
                those previously suspended by 99 Recharce. By using the Site, you confirm
                that you meet eligibility requirements and that all information you
                provide is accurate and up to date.
              </Text>
            </View>

            {/* Section 3 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                3. Registration & Account Security
              </Text>
              <Text style={styles.text}>
                You will receive a user ID and OTP to access your account. Keep this
                information confidential as you are responsible for all activity
                under your account. If unauthorized access occurs, contact{' '}
                <Text style={styles.link}>99 Recharce.in@gmail.com</Text> immediately.
              </Text>
            </View>

            {/* Section 4 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. 99 Recharce Recharges</Text>
              <Text style={styles.text}>
                99 Recharce acts solely as a reseller of prepaid mobile and DTH services.
                We do not guarantee service quality or validity and are not
                responsible for disputes between you and your telecom provider.
              </Text>
            </View>

            {/* Section 5 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. General Conditions</Text>
              <Text style={styles.listItem}>
                • Service fees may apply depending on the transaction type.
              </Text>
              <Text style={styles.listItem}>
                • Reversals or failed payments may incur charges.
              </Text>
              <Text style={styles.listItem}>
                • 99 Recharce is not liable for delays beyond its control.
              </Text>
            </View>

            {/* Section 6 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Confidentiality</Text>
              <Text style={styles.text}>
                Privacy of communication is governed by RBI regulations. 99 Recharce may
                disclose information to authorities as required to provide Wallet or
                Payment services.
              </Text>
            </View>

            {/* Section 7 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                7. Intellectual Property Rights
              </Text>
              <Text style={styles.text}>
                All materials, trademarks, and content on the Site belong to 99 Recharce
                or its licensors. You may not copy, reproduce, modify, distribute,
                or create derivative works without written permission.
              </Text>
            </View>

            {/* Section 8 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Disclaimer (No Warranty)</Text>
              <Text style={styles.text}>
                99 Recharce provides its services on an “as is” and “as available” basis
                without warranties of any kind. We do not guarantee uninterrupted
                service, accuracy, or freedom from errors. 99 Recharce shall not be
                liable for data loss, errors, or technical disruptions.
              </Text>
            </View>

            {/* Section 9 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Indemnity</Text>
              <Text style={styles.text}>
                You agree to indemnify and hold 99 Recharce and its affiliates harmless
                from any claims, damages, or losses arising from your use of our
                platform or breach of these Terms.
              </Text>
            </View>

            {/* Section 10 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
              <Text style={styles.text}>
                99 Recharce and its associates will not be liable for indirect,
                incidental, or consequential damages. Our total liability shall not
                exceed the transaction amount involved.
              </Text>
            </View>

            {/* Section 11 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>11. Authorization</Text>
              <Text style={styles.text}>
                By accepting these Terms, you authorize 99 Recharce to process and
                transfer payments on your behalf between payment systems and your
                bank account.
              </Text>
            </View>

            {/* Section 12 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>12. Refund Policy</Text>
              <Text style={styles.text}>
                All sales are final. In cases of failed transactions, refunds will
                be processed within 7 working days after verification. Refunds will
                be credited to your 99 Recharce account or original payment method.
              </Text>
            </View>

            {/* Section 13 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>13. Technical Issues</Text>
              <Text style={styles.text}>
                For any technical issues, please raise a support ticket via{' '}
                <Text style={styles.link}>99 Recharce.in@gmail.com</Text>.
              </Text>
            </View>

            {/* Section 14 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                14. Governing Law & Dispute Resolution
              </Text>
              <Text style={styles.text}>
                These Terms are governed by the laws of India. Any disputes will be
                resolved exclusively in the courts of Pune, Maharashtra, India.
              </Text>
            </View>

            {/* Section 15 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>15. Customer Communication</Text>
              <Text style={styles.text}>
                You consent to receive communications via SMS, email, or push
                notifications. To opt out, email us at{' '}
                <Text style={styles.link}>99 Recharce.in@gmail.com</Text>.
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.text}>
                By continuing to use 99 Recharce, you confirm that you have read and
                agree to these Terms & Conditions.
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default TermsAndConditions;

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
  backBtn: {
    padding: 4,
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
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  highlight: {
    color: '#222',
    fontWeight: '600',
  },
  link: {
    color: '#1756C5',
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
  listItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginLeft: 10,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
  },
});
