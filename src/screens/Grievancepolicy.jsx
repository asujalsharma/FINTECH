import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';

const GrievancePolicy = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header */}
        <Text style={styles.title}>Grievance Redressal Policy</Text>
        <Text style={styles.intro}>
          At <Text style={styles.highlight}>Charlie Mobile Recharge App</Text>, we
          are committed to maintaining transparency, accountability, and
          fairness in all our customer interactions. This policy outlines how
          users can raise grievances and how we ensure timely and effective
          resolution.
        </Text>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Purpose</Text>
          <Text style={styles.text}>
            The purpose of this Grievance Redressal Policy is to ensure a prompt
            and fair process for resolving customer complaints. We aim to
            address concerns effectively while enhancing user trust and
            satisfaction.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Objective</Text>
          <Text style={styles.text}>This policy ensures:</Text>
          <Text style={styles.listItem}>
            • Fair and transparent handling of all grievances
          </Text>
          <Text style={styles.listItem}>
            • Quick and effective resolution of customer issues
          </Text>
          <Text style={styles.listItem}>
            • Compliance with regulatory guidelines (RBI and other authorities)
          </Text>
          <Text style={styles.listItem}>
            • Strengthened customer confidence in our services
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Scope</Text>
          <Text style={styles.text}>
            This policy applies to all users of Charlie Mobile Recharge App’s
            website, mobile app, and digital services. It covers complaints
            related to:
          </Text>
          <Text style={styles.listItem}>
            • Failed or delayed recharge transactions
          </Text>
          <Text style={styles.listItem}>• Refunds not processed</Text>
          <Text style={styles.listItem}>
            • Payment gateway or wallet issues
          </Text>
          <Text style={styles.listItem}>• Unauthorized transactions</Text>
          <Text style={styles.listItem}>
            • Customer service or communication issues
          </Text>
          <Text style={styles.listItem}>
            • Technical glitches or service interruptions
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Definition of a Grievance</Text>
          <Text style={styles.text}>
            A grievance is any expression of dissatisfaction by a user regarding
            Charlie Mobile Recharge App’s products, services, or operations that
            requires a formal response or resolution.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            5. Grievance Redressal Mechanism
          </Text>
          <Text style={styles.text}>
            Users can raise their complaints through the following channels:
          </Text>
          <Text style={styles.listItem}>
            • **In-App Support:** Submit a complaint directly through the app’s
            “Help” or “Support” section.
          </Text>
          <Text style={styles.listItem}>
            • **Email:** Write to us at{' '}
            <Text style={styles.link}>charliegedekar@gmail.com</Text>{' '}
            with full transaction details.
          </Text>
          <Text style={styles.listItem}>
            • **Website Contact Form:** Use the “Contact Us” form available on{' '}
            <Text style={styles.link}>www.CharlieMobileRecharge.in</Text>.
          </Text>

          <Text style={styles.text}>
            Once a complaint is received, our team will acknowledge it within
            **24 hours** and resolve it within **7 business days** depending on
            the nature of the issue.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Escalation Process</Text>
          <Text style={styles.text}>
            If your issue is not resolved within the stipulated time, you may
            escalate it to our **Grievance Officer**:
          </Text>
          <Text style={styles.contact}>
            📧 charliegedekar@gmail.com
          </Text>
          <Text style={styles.contact}>
            👤 Grievance Officer: [To be updated]
          </Text>
          <Text style={styles.contact}>
            📅 Resolution Timeline: Within 15 business days of escalation
          </Text>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. User Rights</Text>
          <Text style={styles.text}>
            Every Charlie Mobile Recharge App user has the right to:
          </Text>
          <Text style={styles.listItem}>
            • Raise concerns without fear of discrimination or unfair treatment
          </Text>
          <Text style={styles.listItem}>
            • Receive acknowledgment and timely updates on complaint progress
          </Text>
          <Text style={styles.listItem}>
            • Obtain a fair and reasoned response or resolution
          </Text>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Record Keeping</Text>
          <Text style={styles.text}>
            All customer grievances, along with their resolutions, are
            documented and reviewed periodically to identify patterns and
            improve service quality.
          </Text>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Review and Updates</Text>
          <Text style={styles.text}>
            Charlie Mobile Recharge App reserves the right to amend or update this
            Grievance Policy periodically to ensure continued compliance with
            applicable laws and evolving user needs.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.text}>
            At Charlie Mobile Recharge App, your satisfaction is our top priority.
            We are dedicated to resolving all customer concerns fairly,
            efficiently, and transparently.
          </Text>
          <Text style={styles.contact}>
            📧 charliegedekar@gmail.com
          </Text>
          <Text style={styles.contact}>🌐 www.CharlieMobileRecharge.in</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GrievancePolicy;

const COLORS = {
  primary: '#122536ff',
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
  link: {
    color: COLORS.primary,
  },
  highlight: {
    color: COLORS.textDark,
    fontWeight: '600',
  },
  contact: {
    color: COLORS.primary,
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
});
