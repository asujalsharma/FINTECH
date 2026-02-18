import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native'; // optional, can replace with your color values

const PrivacyPolicy = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header */}
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.intro}>
          At <Text style={styles.highlight}>99 Recharce</Text>, accessible from{' '}
          <Text style={styles.link}>https://99 Recharce.in</Text>, protecting your
          privacy is one of our top priorities. This Privacy Policy explains how
          we collect, use, and safeguard your information.
        </Text>

        {/* Section: Consent */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consent</Text>
          <Text style={styles.text}>
            By using our website or app, you hereby consent to our Privacy
            Policy and agree to its terms.
          </Text>
        </View>

        {/* Section: Information Collection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.text}>
            The personal information we ask you to provide, and the reasons why,
            will always be made clear at the time of collection.{'\n\n'}
            If you contact us directly, we may collect additional details such
            as your name, email, phone number, and any message contents or
            attachments you send us.{'\n\n'}
            When registering for an account, we may request information such as
            your name, company name, address, email, and contact number.
          </Text>
        </View>

        {/* Section: How We Use Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.text}>We use collected information to:</Text>
          <Text style={styles.listItem}>
            • Provide, operate, and maintain our website
          </Text>
          <Text style={styles.listItem}>
            • Improve and personalize user experience
          </Text>
          <Text style={styles.listItem}>
            • Understand usage patterns and develop new features
          </Text>
          <Text style={styles.listItem}>
            • Communicate updates, offers, and customer support
          </Text>
          <Text style={styles.listItem}>
            • Send emails and prevent fraudulent activity
          </Text>
        </View>

        {/* Section: Log Files */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Log Files</Text>
          <Text style={styles.text}>
            99 Recharce follows a standard log file procedure. These files log
            visitors when they visit websites. Information collected includes IP
            address, browser type, ISP, timestamps, and referring pages.{'\n\n'}
            This data is used to analyze trends, administer the site, and
            understand user interactions.
          </Text>
        </View>

        {/* Section: Cookies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cookies and Web Beacons</Text>
          <Text style={styles.text}>
            Like most websites, 99 Recharce uses cookies to store user preferences
            and optimize your experience. These help personalize content based
            on your browser and activity.{'\n\n'}
            You can manage or disable cookies through your browser settings.
          </Text>
        </View>

        {/* Section: Advertising Partners */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advertising Partners</Text>
          <Text style={styles.text}>
            Third-party ad networks may use cookies, JavaScript, or web beacons
            to deliver personalized advertisements.{'\n\n'}
            99 Recharce has no control over cookies used by third-party advertisers.
            Please review their privacy policies for detailed information.
          </Text>
        </View>

        {/* Section: Third Party Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Third-Party Privacy Policies</Text>
          <Text style={styles.text}>
            99 Recharce’s Privacy Policy does not apply to external websites or
            advertisers. We encourage users to read the respective privacy
            policies of these third parties for more details and opt-out
            instructions.
          </Text>
        </View>

        {/* Section: CCPA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CCPA Privacy Rights</Text>
          <Text style={styles.text}>Under the CCPA, California users can:</Text>
          <Text style={styles.listItem}>
            • Request disclosure of collected personal data
          </Text>
          <Text style={styles.listItem}>
            • Request deletion of personal data
          </Text>
          <Text style={styles.listItem}>• Request that data not be sold</Text>
          <Text style={styles.text}>
            If you wish to exercise these rights, please contact us. We will
            respond within one month.
          </Text>
        </View>

        {/* Section: GDPR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GDPR Data Protection Rights</Text>
          <Text style={styles.text}>Every user has the right to:</Text>
          <Text style={styles.listItem}>
            • Access and request copies of your data
          </Text>
          <Text style={styles.listItem}>
            • Request corrections or completion of information
          </Text>
          <Text style={styles.listItem}>
            • Request deletion under certain conditions
          </Text>
          <Text style={styles.listItem}>
            • Restrict or object to data processing
          </Text>
          <Text style={styles.listItem}>• Request transfer of your data</Text>
          <Text style={styles.text}>
            To exercise these rights, contact us at our support email.
          </Text>
        </View>

        {/* Section: Children */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Information</Text>
          <Text style={styles.text}>
            Protecting children’s privacy is a top priority. 99 Recharce does not
            knowingly collect personal data from children under 13.{'\n\n'}
            If you believe your child has shared such data, please contact us
            immediately, and we will remove it from our records.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.text}>
            For more information or to exercise your privacy rights, contact us
            at:
          </Text>
          <Text style={styles.contact}>📧 99 Recharce.in@gmail.com</Text>
          <Text style={styles.contact}>🌐 www.99 Recharce.in</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;

const COLORS = {
  primary: '#007bff',
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
    fontWeight: '600',
    color: COLORS.textDark,
  },
  link: {
    color: COLORS.primary,
  },
  section: {
    marginBottom: 25,
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
    marginLeft: 10,
    marginBottom: 2,
    lineHeight: 22,
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
