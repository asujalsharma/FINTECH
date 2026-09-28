import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { postData } from '../API';

const BLUE = '#0A2E8A';

const Profile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { name, phn, referralCode } = route.params || {};
  const dispatch = useDispatch();

  const logoutUser = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out of Online Adda?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await postData('/api/auth/logout');
          } catch (e) {
            console.log('Logout error (ignored):', e);
          } finally {
            dispatch({ type: 'LOGOUT' });
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'LogIn' }],
              }),
            );
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#040E2D" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Hero Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
              }}
              style={styles.avatar}
            />
            <View style={styles.verifiedCheckBadge}>
              <Icon name="check" size={12} color="#FFF" />
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.name}>{name || 'Online Adda Partner'}</Text>
            <Text style={styles.phone}>+91 {phn || '9876543210'}</Text>

            <View style={styles.badgeRow}>
              <View style={styles.memberBadge}>
                <Icon name="verified" size={12} color="#0A2E8A" />
                <Text style={styles.memberBadgeText}>Verified Partner</Text>
              </View>

              {referralCode ? (
                <View style={styles.referralChip}>
                  <Text style={styles.referralChipText}>Ref: {referralCode}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* SECTION 1: Earnings & Growth */}
        <Text style={styles.sectionHeaderTitle}>Services & Earnings</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="card-giftcard"
            title="Refer & Earn"
            subtitle="Invite friends & get up to ₹100 cashback"
            iconColor="#2563EB"
            iconBg="#EEF2FF"
            onPress={() =>
              navigation.navigate('ReferScreen', { referralCode: referralCode })
            }
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="trending-up"
            title="Commission Chart"
            subtitle="Check your recharge commission rates"
            iconColor="#059669"
            iconBg="#ECFDF5"
            onPress={() => navigation.navigate('CommissionChart')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="help-outline"
            title="FAQ's & Guides"
            subtitle="Frequently asked questions & solutions"
            iconColor="#D97706"
            iconBg="#FEF3C7"
            onPress={() => navigation.navigate('FAQScreen')}
          />
        </View>

        {/* SECTION 2: Support & Company */}
        <Text style={styles.sectionHeaderTitle}>Support & Feedback</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="headset-mic"
            title="Contact Support"
            subtitle="Call or WhatsApp our 24x7 helpdesk"
            iconColor="#0A2E8A"
            iconBg="#EEF2FF"
            onPress={() => navigation.navigate('ContactScreen')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="feedback"
            title="Feedback & Suggestions"
            subtitle="Write directly to the product team"
            iconColor="#7C3AED"
            iconBg="#F5F3FF"
            onPress={() => Linking.openURL('mailto:online7adda@gmail.com')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="star-rate"
            title="Rate Us on Playstore"
            subtitle="Love Online Adda? Give us 5 stars"
            iconColor="#EAB308"
            iconBg="#FEFCE8"
            onPress={() =>
              Linking.openURL('market://details?id=com.pinpay')
            }
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="info-outline"
            title="About Online Adda"
            subtitle="Learn more about our mission & story"
            iconColor="#0284C7"
            iconBg="#F0F9FF"
            onPress={() => navigation.navigate('AboutUs')}
          />
        </View>

        {/* SECTION 3: Legal & Policies */}
        <Text style={styles.sectionHeaderTitle}>Legal & Compliance</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="policy"
            title="Privacy Policy"
            subtitle="How we protect and secure your data"
            iconColor="#475569"
            iconBg="#F1F5F9"
            onPress={() => navigation.navigate('Privacypolicy')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="gavel"
            title="Terms & Conditions"
            subtitle="Rules and service agreements"
            iconColor="#475569"
            iconBg="#F1F5F9"
            onPress={() => navigation.navigate('Termsandcondition')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="currency-exchange"
            title="Refund Policy"
            subtitle="Our 100% money-back guarantee"
            iconColor="#475569"
            iconBg="#F1F5F9"
            onPress={() => navigation.navigate('Refundpolicy')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="security"
            title="Grievance Redressal"
            subtitle="Escalation process & nodal officer"
            iconColor="#475569"
            iconBg="#F1F5F9"
            onPress={() => navigation.navigate('GrievancePolicy')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={logoutUser}
          activeOpacity={0.85}
        >
          <Icon name="logout" size={20} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>

        {/* App Version & Branding */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionTitle}>Online Adda</Text>
          <Text style={styles.versionSubtitle}>Har Ghar Digital • Version 1.0.0</Text>
          <View style={styles.securitySeal}>
            <MaterialCommunityIcons name="shield-check" size={14} color="#059669" />
            <Text style={styles.securitySealText}>100% Bank-Grade 256-bit SSL Protected</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable List Menu Item
const MenuItem = ({
  icon,
  title,
  subtitle,
  iconColor,
  iconBg,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconCircle, { backgroundColor: iconBg }]}>
        <Icon name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>
      <Icon name="chevron-right" size={22} color="#CBD5E1" />
    </TouchableOpacity>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07153A',
  },

  /* HEADER */
  header: {
    backgroundColor: '#040E2D',
    paddingTop: Platform.OS === 'ios' ? 12 : 18,
    paddingBottom: 22,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  /* PROFILE CARD */
  profileCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    padding: 18,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: '#4B9EFF',
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#22C55E',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#07153A',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  phone: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(75,158,255,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(75,158,255,0.30)',
  },
  memberBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B9EFF',
    marginLeft: 3,
  },
  referralChip: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  referralChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.90)',
  },

  /* SECTION HEADERS */
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginLeft: 6,
    marginBottom: 8,
    marginTop: 6,
  },

  /* MENU CARD */
  menuCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 18,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuSubtitle: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginLeft: 72,
  },

  /* LOGOUT BUTTON */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.30)',
    marginTop: 10,
    marginBottom: 24,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.3,
  },

  /* APP VERSION & BRANDING */
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  versionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.90)',
  },
  versionSubtitle: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
    fontWeight: '500',
  },
  securitySeal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  securitySealText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#22C55E',
    marginLeft: 4,
  },
});
