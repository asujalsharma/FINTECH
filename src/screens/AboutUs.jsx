import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  StatusBar,
} from 'react-native';

import COLORS from '../constants/colors'; // If you have a color file
// else define '#1B2F9B' = '#1B2F9B';

const AboutUs = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'#1B2F9B'} barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header Section */}
        <View style={styles.header}>
          {/* <Image
            source={require('../assets/logo.png')} // replace with your logo
            style={styles.logo}
            resizeMode="contain"
          /> */}
          <Text style={styles.title}>Welcome to Karl Digital Hub!</Text>
          <Text style={styles.subtitle}>
            Redefining the future of digital finance — one transaction at a
            time.
          </Text>
        </View>

        {/* Journey Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Journey</Text>
          <Text style={styles.text}>
            Karl Digital Hub embarked on its exciting journey on{' '}
            <Text style={styles.bold}>December 1st, 2025</Text>. With a vision
            to revolutionize the fintech industry, we began our mission to
            simplify how people manage financial services — making life more
            convenient, secure, and enjoyable.
          </Text>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.text}>
            Our mission is to empower individuals and businesses with innovative
            fintech solutions that redefine convenience, trust, and efficiency.
            We aim to be a leading force in the industry, pushing boundaries
            through technology and customer-first innovation.
          </Text>
        </View>

        {/* Vision Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Vision</Text>
          <Text style={styles.text}>
            We envision a digital ecosystem where financial services are
            effortless, secure, and accessible to everyone. With Karl Digital
            Hub, we’re building a future that drives inclusion, opportunity, and
            prosperity for all.
          </Text>
        </View>

        {/* Promise Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>We Promise</Text>

          <View style={styles.promiseBox}>
            <Text style={styles.promiseTitle}>
              💙 Customer-Centric Approach
            </Text>
            <Text style={styles.text}>
              We put our customers first — understanding their needs and
              exceeding expectations.
            </Text>
          </View>

          <View style={styles.promiseBox}>
            <Text style={styles.promiseTitle}>💡 Innovation & Technology</Text>
            <Text style={styles.text}>
              We continuously adopt cutting-edge technology to enhance our
              services and features.
            </Text>
          </View>

          <View style={styles.promiseBox}>
            <Text style={styles.promiseTitle}>🔒 Security & Trust</Text>
            <Text style={styles.text}>
              We ensure top-level data security and transaction protection,
              always maintaining trust.
            </Text>
          </View>

          <View style={styles.promiseBox}>
            <Text style={styles.promiseTitle}>⚖️ Transparency & Ethics</Text>
            <Text style={styles.text}>
              Integrity and honesty guide everything we do — from communication
              to operations.
            </Text>
          </View>

          <View style={styles.promiseBox}>
            <Text style={styles.promiseTitle}>📈 Continuous Improvement</Text>
            <Text style={styles.text}>
              Your feedback fuels our growth. We’re always evolving to serve you
              better.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Join the Revolution</Text>
          <Text style={styles.text}>
            Be part of the Karl Digital Hub journey — where technology meets
            trust, and innovation meets inclusion.
          </Text>
          <Text style={styles.contact}>
            🌐 https://www.karlDigitalHub.co.in/
          </Text>
          <Text style={styles.contact}>📧 emil.kmustafizur@gmail.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B2F9B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 22,
  },
  section: {
    marginBottom: 25,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B2F9B',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
    color: COLORS.textDark,
  },
  promiseBox: {
    marginTop: 10,
  },
  promiseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 15,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B2F9B',
    marginBottom: 5,
  },
  contact: {
    fontSize: 14,
    color: '#E10600',
    marginTop: 2,
  },
});
