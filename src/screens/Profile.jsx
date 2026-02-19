

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Linking } from 'react-native';
import COLORS from '../constants/colors';
import { postData } from '../API';

const Profile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { name, phn, referralCode } = route.params;
  console.log(referralCode);
  const dispatch = useDispatch();
  const logoutUser = async () => {
    // logout();
    // props.navigation.replace('Login');
    const res = await postData('/api/auth/logout');
    console.log(res);
    if (res.Status) {
      dispatch({
        type: 'LOGOUT',
      });

      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: 'LogIn' }],
        }),
      );
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000ff" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile</Text>
        <View style={{}} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* User Info */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.phone}>+91 {phn}</Text>
          </View>
        </View>

        {/* Options */}
        <View style={styles.row}>
          <ProfileButton
            icon="share"
            text="Refer & Earn"
            onPress={() =>
              navigation.navigate('ReferScreen', { referralCode: referralCode })
            }
          />
          <ProfileButton
            icon="info-outline"
            text="About"
            onPress={() => navigation.navigate('AboutUs')}
          />
        </View>
        <View style={styles.row}>
          <ProfileButton
            icon="contacts"
            text="Contact"
            onPress={() => Linking.openURL('tel:+916309456800')}
          />
          <ProfileButton
            icon="policy"
            text="Privacy Policy"
            onPress={() => {
              navigation.navigate('Privacypolicy');
            }}
          />
        </View>
        <View style={styles.row}>
          <ProfileButton
            icon="menu-book"
            text="T & C"
            onPress={() => {
              navigation.navigate('Termsandcondition');
            }}
          />
          <ProfileButton
            icon="money-off"
            text="Refund Policy"
            onPress={() => {
              navigation.navigate('Refundpolicy');
            }}
          />
        </View>
        <View style={styles.row}>
          <ProfileButton
            icon="gavel"
            text="Grievance Policy"
            onPress={() => {
              navigation.navigate('GrievancePolicy');
            }}
          />
          <ProfileButton
            icon="help-outline"
            text="FAQ's"
            onPress={() => navigation.navigate('FAQScreen')}
          />
        </View>
        <View style={styles.row}>
          <ProfileButton
            icon="feedback"
            text="Feedback"
            onPress={() => Linking.openURL('mailto:ClubTYL.in@gmail.com')}
          />
          <ProfileButton
            icon="star"
            text="Give 5 Star"
            onPress={() => Linking.openURL('market://details?id=com.yourapp')}
          />
        </View>

        {/* Social Icons */}
        <View style={styles.socialRow}>
          <FontAwesome
            name="facebook"
            size={26}
            color="#007bff"
            style={styles.socialIcon}
          />
          <FontAwesome
            name="instagram"
            size={26}
            color="#007bff"
            style={styles.socialIcon}
          />
          <FontAwesome
            name="youtube-play"
            size={26}
            color="#007bff"
            style={styles.socialIcon}
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>Version : 1.1.7</Text>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logoutUser}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable Profile Button
const ProfileButton = ({
  icon,
  text,
  onPress,
}: {
  icon: string,
  text: string,
}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.buttonLeft}>
        <Icon name={icon} size={22} color="#007bff" />
        <Text style={styles.buttonText}>{text}</Text>
      </View>
      <Icon name="chevron-right" size={22} color="#007bff" />
    </TouchableOpacity>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },
  scrollContainer: {
    padding: 16,
    alignItems: 'center',
  },
  // header: {
  //   width: "100%",
  //   backgroundColor: "#007bff",
  //   padding: 16,
  //   alignItems: "center",
  //   borderRadius: 6,
  // },
  // headerTitle: {
  //   color: "#fff",
  //   fontSize: 18,
  //   fontWeight: "bold",
  // },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    width: '100%',
    padding: 16,
    marginVertical: 16,
    borderRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  phone: {
    fontSize: 14,
    color: 'gray',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 14,
    margin: 6,
    borderRadius: 10,
    elevation: 2,
  },
  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  socialRow: {
    flexDirection: 'row',
    marginVertical: 20,
  },
  socialIcon: {
    marginHorizontal: 12,
  },
  version: {
    fontSize: 13,
    color: 'gray',
    marginBottom: 20,
  },
  logoutBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    // paddingTop: 35,
    // marginTop: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 0,
  },
});
