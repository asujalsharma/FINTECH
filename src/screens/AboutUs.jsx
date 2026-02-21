import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  primary: '#1756C5',
  textDark: '#222',
  textLight: '#555',
  card: '#fff',
};

const AboutUs = () => {
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
          <Text style={styles.headerTitle}>About Us</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.whiteSheet}>
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
              <Text style={styles.title}>Welcome to 99 Recharce!</Text>
              <Text style={styles.subtitle}>
                Redefining the future of digital finance — one transaction at a
                time.
              </Text>
            </View>

            {/* Journey Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Our Journey</Text>
              <Text style={styles.text}>
                99 Recharce embarked on its exciting journey on{' '}
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
                effortless, secure, and accessible to everyone. With 99 Recharce, we’re
                building a future that drives inclusion, opportunity, and prosperity
                for all.
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
                Be part of the 99 Recharce journey — where technology meets trust, and
                innovation meets inclusion.
              </Text>
              <Text style={styles.contact}>🌐 www.99 Recharce.in</Text>
              <Text style={styles.contact}>📧 99 Recharce.in@gmail.com</Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: COLORS.background, // Removed as LinearGradient handles background
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  whiteSheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  scrollContainer: {
    paddingHorizontal: 20, // Adjusted padding to be inside whiteSheet
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
    color: COLORS.primary,
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
    color: COLORS.primary,
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
    color: COLORS.primary,
    marginBottom: 5,
  },
  contact: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 2,
  },
});
