import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'#F4F7FF'} barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header */}
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.intro}>
          At <Text style={styles.highlight}>Online Adda</Text>,
          protecting your privacy is one of our top priorities. This Privacy
          Policy explains how we collect, use, and safeguard your information.
        </Text>

        {/* Section: Consent */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consent</Text>
          <Text style={styles.text}>
            By using our app, you hereby consent to our Privacy
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
            your name, mobile number, and email.
          </Text>
        </View>

        {/* Section: How We Use Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.text}>We use collected information to:</Text>
          <Text style={styles.listItem}>
            • Provide, operate, and maintain our application
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
            • Prevent fraudulent activity and protect account security
          </Text>
        </View>

        {/* Section: Log Files */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Log Files</Text>
          <Text style={styles.text}>
            Online Adda follows standard logging procedures for security and fraud
            prevention. Information collected includes device info, timestamps, and
            service interactions.{'\n\n'}
            This data is used to analyze trends, administer security, and improve performance.
          </Text>
        </View>

        {/* Section: Data Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Security & Encryption</Text>
          <Text style={styles.text}>
            We implement industry-standard encryption protocols to protect your personal
            and transactional information from unauthorized access.
          </Text>
        </View>

        {/* Section: Children */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Information</Text>
          <Text style={styles.text}>
            Protecting children’s privacy is a top priority. Online Adda does not
            knowingly collect personal data from children under 13.
            {'\n\n'}
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
          <Text style={styles.contact}>📧 online7adda@gmail.com</Text>
        </View>

        <View style={{ marginTop: 24 }}>
          <Footer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;

const COLORS = {
  primary: '#092B88',
  textDark: '#0F172A',
  textLight: '#475569',
  background: '#F4F7FF',
  card: '#FFFFFF',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#092B88',
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
    fontWeight: '700',
    color: COLORS.textDark,
  },
  link: {
    color: '#2563EB',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#092B88',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#092B88',
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
    marginBottom: 4,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  contact: {
    color: '#2563EB',
    fontSize: 14,
    marginTop: 5,
    fontWeight: '600',
  },
});
