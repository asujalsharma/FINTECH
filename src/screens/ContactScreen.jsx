import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ContactScreen = () => {

  const navigation = useNavigation();
  const callUs = () => {
    Linking.openURL('tel:+917717797827');
  };

  const openWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=+917717797827');
  };

  const emailUs = () => {
    Linking.openURL('mailto:online7adda@gmail.com');
  };

  const faq = () => {
    navigation.navigate('FAQScreen');
  };

  const feedback = () => {
    Linking.openURL('mailto:online7adda@gmail.com');
  };

  const ratePlayStore = () => {
    Linking.openURL('market://details?id=com.pinpay');
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2E8A" />
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

        <View style={{ height: 40 }} />
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
        <IconComponent name={icon} size={22} color="#0A2E8A" />
        <Text style={styles.buttonText}>{text}</Text>
      </View>
      <Icon name="chevron-right" size={22} color="#0A2E8A" />
    </TouchableOpacity>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    backgroundColor: '#0A2E8A',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0A2E8A',
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
    marginLeft: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
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
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#EEF2FF',
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
    width: '92%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginTop: 14,
    padding: 6,
    elevation: 3,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  card1: {
    width: '92%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginTop: 14,
    padding: 4,
    elevation: 3,
    shadowColor: '#0A2E8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#EEF2FF',
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
    color: '#0F172A',
  },
  contactSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});



