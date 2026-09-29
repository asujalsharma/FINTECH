import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { colors } from '../constants/colors';
import NavBar from '../components/NavBar';

const Profile = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth?.user || state.user?.user || null);
  const userName = reduxUser?.name || 'Rohit Sharma';
  const userPhone = reduxUser?.mobile || reduxUser?.phone || '+91 98765 43210';
  const userEmail = reduxUser?.email || 'rohit.sharma@example.com';
  const memberSince = 'Member since Jan 2024';

  const menuSections = [
    {
      title: 'Sarvana Sahayog Welfare',
      items: [
        {
          id: 'sahayog_account',
          title: 'My Sahayog Account',
          subtitle: 'Active applications, statements & passbook',
          icon: 'heart-pulse',
          iconColor: colors.primary,
          onPress: () => navigation.navigate('SahayogAccount'),
        },
        {
          id: 'apply_scheme',
          title: 'Apply for New Scheme',
          subtitle: 'Vivah, Vidya, Chikitsa & Vridh Sahayog',
          icon: 'hand-heart',
          iconColor: colors.secondary,
          onPress: () => navigation.navigate('SahayogHome'),
        },
      ],
    },
    {
      title: 'Transactions & Services',
      items: [
        {
          id: 'recharge_history',
          title: 'Transaction & Recharge History',
          subtitle: 'Past mobile recharges, bills & BBPS',
          icon: 'history',
          iconColor: '#3B82F6',
          onPress: () => navigation.navigate('RechargeHistory'),
        },
        {
          id: 'wallet',
          title: 'My Wallet & Passbook',
          subtitle: 'Balance, cashback & foundation points',
          icon: 'wallet-outline',
          iconColor: '#8B5CF6',
          onPress: () => navigation.navigate('Wallet'),
        },
        {
          id: 'reports',
          title: 'All Transaction Reports',
          subtitle: 'Filter & download monthly statements',
          icon: 'file-chart-outline',
          iconColor: '#0EA5E9',
          onPress: () => navigation.navigate('ReportsScreen'),
        },
      ],
    },
    {
      title: 'Support & Foundation',
      items: [
        {
          id: 'about_us',
          title: 'About Sarvana Foundation',
          subtitle: 'Our 100% transparent welfare mission',
          icon: 'information-outline',
          iconColor: colors.primary,
          onPress: () => navigation.navigate('AboutUs'),
        },
        {
          id: 'faq',
          title: 'Help & FAQs',
          subtitle: '24x7 support and common queries',
          icon: 'help-circle-outline',
          iconColor: '#F59E0B',
          onPress: () => navigation.navigate('FAQScreen'),
        },
        {
          id: 'terms',
          title: 'Terms & Conditions',
          subtitle: 'Legal and scheme compliance policies',
          icon: 'file-document-outline',
          iconColor: '#6B7280',
          onPress: () => navigation.navigate('Termsandcondition'),
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          subtitle: 'How we protect your data',
          icon: 'shield-check-outline',
          iconColor: '#10B981',
          onPress: () => navigation.navigate('Privacypolicy'),
        },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out from Sarvana All In One?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => Alert.alert('Edit Profile', 'Profile editing is coming in the next update.')}
        >
          <Icon name="account-edit-outline" size={20} color="#FFFFFF" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Icon name="check-decagram" size={16} color={colors.secondary} />
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userPhone}>{userPhone}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
            <View style={styles.memberBadge}>
              <Icon name="shield-star" size={12} color={colors.primary} />
              <Text style={styles.memberText}>{memberSince}</Text>
            </View>
          </View>
        </View>

        {/* Foundation Impact Badge */}
        <View style={styles.impactCard}>
          <View style={styles.impactIconBg}>
            <Icon name="heart-multiple" size={24} color={colors.primary} />
          </View>
          <View style={styles.impactInfo}>
            <Text style={styles.impactTitle}>Sarvana Community Contributor</Text>
            <Text style={styles.impactDesc}>
              Every recharge you make helps support girl child weddings & elder healthcare.
            </Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuBox}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuRow,
                    iIdx < section.items.length - 1 && styles.menuRowBorder,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconBg, { backgroundColor: `${item.iconColor}15` }]}>
                    <Icon name={item.icon} size={22} color={item.iconColor} />
                  </View>
                  <View style={styles.menuTexts}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSub}>{item.subtitle}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}


        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Icon name="logout-variant" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Sarvana All In One App • v2.4.0</Text>
          <Text style={styles.subVersionText}>Made with ❤️ by Sarvana Welfare Foundation</Text>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <NavBar activeTab="profile" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  editBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 2,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  userPhone: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 1,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
    gap: 4,
  },
  memberText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  impactCard: {
    backgroundColor: '#FFF0F5',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  impactIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  impactInfo: {
    flex: 1,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  impactDesc: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionContainer: {
    marginTop: 18,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTexts: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  menuItemSub: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  subVersionText: {
    fontSize: 11,
    color: '#D1D5DB',
    marginTop: 2,
  },
});

export default Profile;
