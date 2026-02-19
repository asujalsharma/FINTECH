import COLORS from '../constants/colors';
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

const ContactScreen = () => {
  const navigation = useNavigation();
  const callUs = () => {
    Linking.openURL('tel:+916309456800');
  };

  const openWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=+916309456800');
  };

  const emailUs = () => {
    Linking.openURL('mailto:ClubTYL.in@gmail.com');
  };

  const faq = () => {
    navigation.navigate('FAQScreen');
  };

  const feedback = () => {
    Linking.openURL('mailto:ClubTYL.in@gmail.com');
  };

  const ratePlayStore = () => {
    Linking.openURL('market://details?id=com.ClubTYL');
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
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
        <Text style={styles.footer}>Made with ❤ by ClubTYL</Text>
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
        <IconComponent name={icon} size={22} color={COLORS.primary} />
        <Text style={styles.buttonText}>{text}</Text>
      </View>
      <Icon name="chevron-right" size={22} color={COLORS.primary} />
    </TouchableOpacity>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },
  scrollContainer: {
    // padding: 16,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    backgroundColor: COLORS.primary,
    padding: 16,
    // borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTime: {
    color: '#fff',
    fontSize: 12,
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
