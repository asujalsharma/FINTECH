import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,

  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import { THEME_COLORS, GRADIENTS } from '../constants/theme';
import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { postData, getData } from '../API';
import COLORS from '../constants/colors';

const Profile = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const reduxUserData = useSelector(state => state.user);
  const route = useRoute();
  const params = route.params || {};
  const { name, phn, referralCode } = params;

  // Use state for data if not passed in params, or to refresh
  const [profileData, setProfileData] = useState({
    name: name || 'User',
    phn: phn || '',
    referralCode: referralCode || ''
  });

  // Fetch fresh Profile Data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getData('api/user/profile');
        if (res?.Status === true || res?.success === true) {
          const userData = res?.Data || res?.user;

          // Merge with Redux to ensure "Register" names persist
          const fName = (reduxUserData?.firstName || reduxUserData?.Data?.firstName || reduxUserData?.user?.firstName) || (userData?.firstName || userData?.user?.firstName);
          const lName = (reduxUserData?.lastName || reduxUserData?.Data?.lastName || reduxUserData?.user?.lastName) || (userData?.lastName || userData?.user?.lastName);

          setProfileData({
            name: (fName && lName)
              ? `${fName} ${lName}`
              : (reduxUserData?.name || reduxUserData?.Data?.name || userData?.name || 'User'),
            phn: userData?.phone || reduxUserData?.phone || reduxUserData?.Data?.phone || userData?.user?.phone || '',
            referralCode: userData?.referalId || reduxUserData?.referalId || reduxUserData?.Data?.referalId || userData?.user?.referalId || ''
          });
        }
      } catch (err) {
        console.log('Profile Fetch Error:', err);
      }
    };
    fetchProfile();
  }, [reduxUserData]);

  const logoutUser = async () => {
    try {
      const res = await postData('/api/auth/logout');
      if (res.Status) {
        dispatch({ type: 'LOGOUT' });
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'LogIn' }], // Ensure this matches stack
          })
        );
      } else {
        // Fallback local logout
        dispatch({ type: 'LOGOUT' });
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'LogIn' }] }));
      }
    } catch (e) {
      console.log(e);
      // Force logout on error
      dispatch({ type: 'LOGOUT' });
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'LogIn' }] }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A237A" />

      {/* Header Area */}
      <LinearGradient
        colors={['#0A237A', '#1246C0', '#1A6FE0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.whiteSheet}>

          {/* User Info Card */}
          <View style={styles.profileCard}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.name}>{profileData.name}</Text>
              <Text style={styles.phone}>+91 {profileData.phn}</Text>
            </View>
          </View>

          {/* Menu Options */}
          <View style={styles.row}>
            <ProfileButton
              icon="share"
              text="Refer & Earn"
              onPress={() =>
                navigation.navigate('ReferScreen', { referralCode: profileData.referralCode })
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
                navigation.navigate('TermsandCondition');
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
              onPress={() => Linking.openURL('mailto:recharge99.in@gmail.com')}
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
              color={THEME_COLORS.orange}
              style={styles.socialIcon}
            />
            <FontAwesome
              name="instagram"
              size={26}
              color={THEME_COLORS.orange}
              style={styles.socialIcon}
            />
            <FontAwesome
              name="youtube-play"
              size={26}
              color={THEME_COLORS.orange}
              style={styles.socialIcon}
            />
          </View>

          {/* Version */}
          <Text style={styles.version}>Version : 1.1.7</Text>

          {/* Logout */}
          <LinearGradient colors={GRADIENTS.orangeBtn} style={styles.logoutBtn}>
            <TouchableOpacity onPress={logoutUser} style={{ width: '100%', alignItems: 'center' }}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={{ height: 50 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable Profile Button
const ProfileButton = ({
  icon,
  text,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.buttonLeft}>
        <Icon name={icon} size={22} color={THEME_COLORS.orange} />
        <Text style={styles.buttonText}>{text}</Text>
      </View>
      <Icon name="chevron-right" size={22} color={THEME_COLORS.orange} />
    </TouchableOpacity>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A237A', // Blue Theme
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  whiteSheet: {
    backgroundColor: '#F5FAFF', // Or pure white #fff
    marginTop: 10,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 20,
    paddingTop: 30,
    flex: 1,
    minHeight: '100%',
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    width: '100%',
    padding: 16,
    marginBottom: 20,
    borderRadius: 14,
    elevation: 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    flexShrink: 1,
  },
  socialRow: {
    flexDirection: 'row',
    marginVertical: 20,
    justifyContent: 'center',
  },
  socialIcon: {
    marginHorizontal: 12,
  },
  version: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 20,
    textAlign: 'center',
  },
  logoutBtn: {
    padding: 16,
    width: '100%',
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
