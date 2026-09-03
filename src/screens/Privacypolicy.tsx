import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Footer from '../components/Footer';
import COLORS from '../constants/colors';

const PrivacyPolicy = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.headerBg} barStyle="light-content" />

      {/* Elegant Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Icon name="lock" size={14} color={COLORS.primary} />
            <Text style={styles.heroBadgeText}>DATA PRIVACY & SECURITY</Text>
          </View>
          <Text style={styles.heroTitle}>Your Privacy Matters</Text>
          <Text style={styles.heroSubtitle}>
            At <Text style={styles.boldText}>Recharge Hoga</Text>, safeguarding
            your personal and transaction data is our topmost priority. This
            policy transparently details what we collect and how we protect it.
          </Text>

          {/* Highlights Row */}
          <View style={styles.highlightsRow}>
            <View style={styles.highlightPill}>
              <Icon name="security" size={14} color={COLORS.primary} />
              <Text style={styles.highlightPillText}>256-Bit Encrypted</Text>
            </View>
            <View style={styles.highlightPill}>
              <Icon name="block" size={14} color={COLORS.primary} />
              <Text style={styles.highlightPillText}>Zero Data Selling</Text>
            </View>
            <View style={styles.highlightPill}>
              <Icon name="check-circle" size={14} color={COLORS.primary} />
              <Text style={styles.highlightPillText}>RBI Guidelines</Text>
            </View>
          </View>
        </View>

        {/* Section 1: Consent */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="how-to-reg" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>1. User Consent</Text>
          </View>
          <Text style={styles.cardContent}>
            By accessing or using our mobile application or website, you hereby
            consent to our Privacy Policy and unconditionally agree to its terms.
          </Text>
        </View>

        {/* Section 2: Information We Collect */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="folder-shared" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>2. Information We Collect</Text>
          </View>
          <Text style={styles.cardContent}>
            The personal details requested from you will always be transparently
            disclosed at the point of collection:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Profile Information:</Text> Mobile
                number, name, email address, and optional KYC verification details.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Transaction Records:</Text> Payment
                amounts, operator selected, timestamp, and transaction identifiers.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Device Info:</Text> Device model, OS
                version, unique hardware ID for multi-factor fraud detection.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 3: How We Use Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="psychology" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>3. How We Use Information</Text>
          </View>
          <Text style={styles.cardContent}>We use the collected information to:</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Icon name="check" size={16} color={COLORS.accent} />
              <Text style={styles.bulletText}>Process and complete recharges and bill payments</Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="check" size={16} color={COLORS.accent} />
              <Text style={styles.bulletText}>Detect and prevent fraudulent or unauthorized activity</Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="check" size={16} color={COLORS.accent} />
              <Text style={styles.bulletText}>Provide transaction receipts, rewards, and support alerts</Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="check" size={16} color={COLORS.accent} />
              <Text style={styles.bulletText}>Improve platform stability, speed, and user experience</Text>
            </View>
          </View>
        </View>

        {/* Section 4: Log Files & Cookies */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="analytics" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>4. Log Files & Cookies</Text>
          </View>
          <Text style={styles.cardContent}>
            Recharge Hoga follows standard secure logging procedures to analyze
            anomalies, track system stability, and administer the app safely.
            Information collected includes IP addresses, network provider, and
            session timestamps.
          </Text>
        </View>

        {/* Section 5: GDPR & CCPA Rights */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="policy" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>5. Your Privacy Rights</Text>
          </View>
          <Text style={styles.cardContent}>
            Under applicable digital data protection standards, every user retains
            the right to:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>Request a complete copy of stored personal data</Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>Request correction or completion of inaccurate information</Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>Request account erasure subject to regulatory financial retention rules</Text>
            </View>
          </View>
        </View>

        {/* Section 6: Children's Privacy */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="child-care" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>6. Protection of Minors</Text>
          </View>
          <Text style={styles.cardContent}>
            Protecting children's privacy is essential. Recharge Hoga does not
            knowingly collect personal information from individuals under the
            age of 18 without parental or guardian consent.
          </Text>
        </View>

        {/* Contact Support Footer */}
        <View style={styles.supportBox}>
          <Text style={styles.supportTitle}>Questions about Privacy?</Text>
          <Text style={styles.supportText}>
            Our Data Protection Officer can be reached directly for inquiries or data requests:
          </Text>
          <View style={styles.contactRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.contactBtn}
              onPress={() => Linking.openURL('mailto:yarapay@zohomail.in')}
            >
              <Icon name="email" size={16} color={COLORS.primary} />
              <Text style={styles.contactBtnText}>yarapay@zohomail.in</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.contactBtn}
              onPress={() => Linking.openURL('https://www.yarapay.in/')}
            >
              <Icon name="language" size={16} color={COLORS.primary} />
              <Text style={styles.contactBtnText}>www.yarapay.in</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Footer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 56,
    backgroundColor: COLORS.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
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
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 16,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  highlightPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  bulletList: {
    marginTop: 10,
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 21,
    color: '#475569',
  },
  supportBox: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  supportText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
  },
  contactBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
