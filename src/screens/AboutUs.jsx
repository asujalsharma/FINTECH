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

import COLORS from '../constants/colors';
import Footer from '../components/Footer';

const AboutUs = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'#0A2E8A'} barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Image
            source={require('../Assets/playstore-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome to Online Adda!</Text>
          <Text style={styles.subtitle}>
            Har Ghar Digital — Redefining digital recharges, bill payments & financial ease for everyone.
          </Text>
        </View>

        {/* Journey Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Journey</Text>
          <Text style={styles.text}>
            Online Adda embarked on its exciting mission to bring fast, dependable, and rewarding digital payment solutions right to your fingertips. With a vision to empower users across India, we simplify utility payments, recharges, and transactions under one roof.
          </Text>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.text}>
            Our mission is to empower individuals and businesses with innovative fintech solutions that redefine convenience, trust, and speed. We push boundaries through advanced technology and customer-first support.
          </Text>
        </View>

        {/* Vision Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Vision</Text>
          <Text style={styles.text}>
            We envision a seamlessly connected digital Bharat where managing bills, transfers, and daily services is completely effortless, secure, and rewarding for every household.
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
              We put our users first — listening to feedback and delivering instant resolution.
            </Text>
          </View>

          <View style={styles.promiseBox}>
            <Text style={styles.promiseTitle}>💡 Innovation & Technology</Text>
            <Text style={styles.text}>
              We continuously evolve our platform for lightning-fast speeds and frictionless transactions.
            </Text>
          </View>

          <View style={styles.promiseBox}>
            <Text style={styles.promiseTitle}>🔒 Security & Trust</Text>
            <Text style={styles.text}>
              Top-grade encryption and secure banking channels to protect every rupee.
            </Text>
          </View>

          <View style={styles.promiseBox}>
            <Text style={styles.promiseTitle}>⚖️ Transparency & Integrity</Text>
            <Text style={styles.text}>
              Zero hidden fees, transparent commission charts, and instant cashback credits.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Join the Revolution</Text>
          <Text style={styles.text}>
            Be part of the Online Adda journey — where technology meets trust, and innovation meets inclusion.
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

export default AboutUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
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
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A2E8A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#0A2E8A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0A2E8A',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  promiseBox: {
    marginTop: 12,
  },
  promiseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  footer: {
    marginTop: 10,
    alignItems: 'center',
    padding: 16,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A2E8A',
    marginBottom: 6,
  },
  contact: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 6,
  },
});

