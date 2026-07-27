import React, { useActionState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Footer from '../components/Footer';

const ContactScreen = () => {

  const navigation = useNavigation();
  const callUs = () => {
    Linking.openURL('tel:+918887990055');
  };

  const openWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=+918887990055');
  };

  const emailUs = () => {
    Linking.openURL('mailto:yarapay@zohomail.in');
  };

  const faq = () => {
    navigation.navigate('FAQScreen');
  };

  const feedback = () => {
    Linking.openURL('mailto:yarapay@zohomail.in');
  };

  const ratePlayStore = () => {
    Linking.openURL('market://details?id=https://www.yarapay.in/');
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#F2F4F7" />
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contact us</Text>
          <Text style={styles.headerTime}>Timing : 11AM to 07PM</Text>
        </View>

        {/* Illustration */}
        {/* <Image
          source={{
            uri: 'https://ik.imagekit.io/palame/rechargeapp/contact.gif',
          }}
          style={styles.image}
        /> */}
        {/* <FastImage
          source={{
            uri: 'https://ik.imagekit.io/palame/rechargeapp/contact.gif',
            priority: FastImage.priority.high,
          }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.contain}
        /> */}
        <View style={styles.contactSupport}>
  <View style={styles.agentIcon}>
    <MaterialCommunityIcons
  name="face-agent"
  size={52}
  color="#1E3A8A"
/>
  </View>

  <Text style={styles.contactTitle}>Contact Us</Text>

  <Text style={styles.contactSubtitle}>
    Need help? Our support team is here for you.
  </Text>
</View>

        {/* Title */}
        <Text style={styles.sectionTitle}>How can I Help You</Text>

        {/* Buttons */}
        <View style={styles.row}>
          <ContactButton icon="call" text="Call Us" onPress={() => callUs()} />
          <ContactButton
            icon="whatsapp"
            text="Whatsapp"
            type="fa"
            onPress={() => openWhatsApp()}
          />
        </View>
        <View style={styles.card1}>
          <ContactButton
            icon="email"
            text="Email Us"
            onPress={() => emailUs()}
          />
        </View>

        <View style={styles.card}>
          <ContactButton
            icon="help-outline"
            text="Frequently Asked Question's"
            onPress={() => faq()}
          />
          <ContactButton
            icon="feedback"
            text="Feedback"
            onPress={() => feedback()}
          />
          <ContactButton
            icon="star"
            text="Rate us on Playstore"
            onPress={() => ratePlayStore()}
          />
        </View>

        {/* GST Registration Card */}
        <View style={styles.gstCard}>
          <View style={styles.gstHeader}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#157363" />
            <Text style={styles.gstHeaderText}>GST Registration Details</Text>
          </View>

          <View style={styles.gstBadgeRow}>
            <Text style={styles.gstBadgeLabel}>GSTIN / REGISTRATION NO.</Text>
            <View style={styles.gstinBox}>
              <Text style={styles.gstinText}>09IILPS7906E1ZM</Text>
            </View>
          </View>

          <View style={styles.gstDivider} />

          <View style={styles.gstRow}>
            <Text style={styles.gstLabel}>Trade Name</Text>
            <Text style={styles.gstValue}>AYDS digital hub</Text>
          </View>

          <View style={styles.gstRow}>
            <Text style={styles.gstLabel}>Legal Name</Text>
            <Text style={styles.gstValue}>YAGYADUTT SHARMA</Text>
          </View>

          <View style={styles.gstRow}>
            <Text style={styles.gstLabel}>Constitution</Text>
            <Text style={styles.gstValue}>Proprietorship</Text>
          </View>

          <View style={styles.gstDivider} />

          <View style={styles.gstAddressContainer}>
            <Text style={styles.gstLabel}>Principal Place of Business</Text>
            <Text style={styles.gstAddressText}>
              Building No. 523, Allipur Road, Near Prathmik Vidyalaya, Padari, Allipur, District: Lakhimpur Kheri, Uttar Pradesh - 261501
            </Text>
          </View>

          <View style={styles.govTag}>
            <Text style={styles.govTagText}>🏛️ Form GST REG-06 • Govt. of India</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={{ marginTop: 24, width: '100%' }}>
          <Footer />
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};


// Reusable Button Component
const ContactButton = ({ icon, text, type = 'material', onPress }) => {
  const IconComponent = type === 'fa' ? FontAwesome : Icon;
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.buttonLeft}>
        <IconComponent name={icon} size={22} color="#58007b" />
        <Text style={styles.buttonText}>{text}</Text>
      </View>
      <Icon name="chevron-right" size={22} color="#58007b" />
    </TouchableOpacity>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },
  scrollContainer: {
    // padding: 16,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    backgroundColor: '#471d7d',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 19,
    fontWeight: '800',
  },
  headerTime: {
    color: '#D9E7FF',
    fontSize: 12,
    fontWeight: '600',
  },
  image: {
    width: 320,
    height: 220,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 14,
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 18,
    marginVertical: 4,
    flex: 1,
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginTop: 14,
    padding: 6,
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  card1: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginTop: 14,
    padding: 4,
    elevation: 3,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  footer: {
    marginTop: 24,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
  contactSupport: {
  alignItems: 'center',
  paddingVertical: 24,
  paddingHorizontal: 20,
},

agentIcon: {
  width: 90,
  height: 90,
  borderRadius: 45,
  backgroundColor: '#EEF2FF',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 14,
},

contactTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: '#1F2937',
},

contactSubtitle: {
  marginTop: 6,
  fontSize: 14,
  color: '#6B7280',
  textAlign: 'center',
  lineHeight: 20,
},

  /* GST CARD STYLES */
  gstCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 22,
    marginTop: 18,
    padding: 18,
    elevation: 4,
    shadowColor: '#471d7d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gstHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  gstHeaderText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  gstBadgeRow: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  gstBadgeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gstinBox: {
    backgroundColor: '#471d7d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  gstinText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  gstDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  gstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  gstLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  gstValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  gstAddressContainer: {
    marginTop: 4,
  },
  gstAddressText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 19,
  },
  govTag: {
    marginTop: 14,
    backgroundColor: '#F0FDF4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
  },
  govTagText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
});


