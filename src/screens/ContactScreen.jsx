import { THEME_COLORS, GRADIENTS } from '../constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import React, { useActionState } from 'react';
import {
  View,
  Text,
  StyleSheet,

  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ContactScreen = () => {
  const navigation = useNavigation();
  const callUs = () => {
    Linking.openURL('tel:+916309456800');
  };

  const openWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=+916309456800');
  };

  const emailUs = () => {
    Linking.openURL('mailto:recharge99.in@gmail.com');
  };

  const faq = () => {
    navigation.navigate('FAQScreen');
  };

  const feedback = () => {
    Linking.openURL('mailto:recharge99.in@gmail.com');
  };

  const ratePlayStore = () => {
    Linking.openURL('market://details?id=com.recharge99');
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A237A" />

      {/* Header */}
      <LinearGradient
        colors={['#0A237A', '#1246C0', '#1A6FE0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.headerTitle}>Support</Text>
        </View>
        <View />
      </LinearGradient>

      {/* Content */}
      <View style={styles.whiteSheet}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>

          {/* Illustration */}
          <FastImage
            source={{
              uri: 'https://ik.imagekit.io/palame/rechargeapp/contact.gif',
              priority: FastImage.priority.high,
            }}
            style={styles.image}
            resizeMode={FastImage.resizeMode.contain}
          />

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

          {/* Footer */}
          <Text style={styles.footer}>Made with ❤ by 99 Recharce</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// Reusable Button Component
const ContactButton = ({ icon, text, type = 'material', onPress }) => {
  const IconComponent = type === 'fa' ? FontAwesome : Icon;
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.buttonLeft}>
        <IconComponent name={icon} size={22} color={THEME_COLORS.orange} />
        <Text style={styles.buttonText}>{text}</Text>
      </View>
      <Icon name="chevron-right" size={22} color={THEME_COLORS.orange} />
    </TouchableOpacity>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A237A',
  },
  whiteSheet: {
    flex: 1,
    backgroundColor: '#F5FAFF',
    marginTop: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  scrollContainer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  header: {
    paddingTop: 30, // Adjust for safe area if needed
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  image: {
    width: 400,
    height: 300,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    alignSelf: 'center',
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
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginVertical: 2,
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  card: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 14,
    paddingVertical: 2,
    // elevation: 2,
  },
  card1: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 14,
    // paddingVertical: 6,
    // elevation: 2,
  },
  footer: {
    marginTop: 20,
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
});
