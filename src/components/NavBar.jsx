import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import React from 'react';
import COLORS from '../constants/colors';

export default function NavBar({ navigation: navProp, data, activeTab = 'home' }) {
  const navHook = useNavigation();
  const navigation = navProp || navHook;
  const activeColor = COLORS.primary || '#D81B60';
  const inactiveColor = '#94A3B8';

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {/* Tab 1: Home */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home', { userData: data })}
        >
          <FeatherIcon
            name="home"
            size={22}
            color={activeTab === 'home' ? activeColor : inactiveColor}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'home' && { color: activeColor, fontWeight: '700' },
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Donation */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('DonationScreen', { userData: data })}
        >
          <MaterialIcon
            name="hand-heart"
            size={23}
            color={activeTab === 'donation' || activeTab === 'Donation' ? activeColor : inactiveColor}
          />
          <Text
            style={[
              styles.navLabel,
              (activeTab === 'donation' || activeTab === 'Donation') && { color: activeColor, fontWeight: '700' },
            ]}
          >
            Donation
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Sahayog (Center Elevated / Highlighted Pink Button) */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('SahayogHome', { userData: data })}
        >
          <View
            style={[
              styles.sahayogWrapper,
              activeTab === 'sahayog' && styles.sahayogWrapperActive,
            ]}
          >
            <FontAwesome
              name="heart"
              size={18}
              color={activeTab === 'sahayog' ? COLORS.white : COLORS.primary}
            />
          </View>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'sahayog' && { color: activeColor, fontWeight: '700' },
            ]}
          >
            Sahayog
          </Text>
        </TouchableOpacity>

        {/* Tab 4: History */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('History', { userData: data })}
        >
          <MaterialIcon
            name="history"
            size={24}
            color={activeTab === 'history' ? activeColor : inactiveColor}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'history' && { color: activeColor, fontWeight: '700' },
            ]}
          >
            History
          </Text>
        </TouchableOpacity>

        {/* Tab 5: Profile */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Profile', { data })}
        >
          <FeatherIcon
            name="user"
            size={22}
            color={activeTab === 'profile' ? activeColor : inactiveColor}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'profile' && { color: activeColor, fontWeight: '700' },
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  navBar: {
    width: '100%',
    height: Platform.OS === 'ios' ? 76 : 64,
    paddingBottom: Platform.OS === 'ios' ? 16 : 6,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  sahayogWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sahayogWrapperActive: {
    backgroundColor: COLORS.primary || '#D81B60',
    elevation: 4,
    shadowColor: COLORS.primary || '#D81B60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  navLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
});
