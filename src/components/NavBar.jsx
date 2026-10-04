import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import React from 'react';
import COLORS from '../constants/colors';

export default function NavBar({ navigation, data, activeTab = 'home' }) {
  const activeColor = '#1741B5';
  const inactiveColor = '#7682A0';

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {/* Left Actions */}
        <View style={styles.navLeft}>
          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Home', { userData: data })}
          >
            <View style={[styles.iconWrapper, activeTab === 'home' && styles.activeBg]}>
              <FeatherIcon
                name="home"
                size={22}
                color={activeTab === 'home' ? activeColor : inactiveColor}
              />
            </View>
            <Text style={[styles.navLabel, activeTab === 'home' && { color: activeColor }]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Chart', { id: data?._id })}
          >
            <View style={[styles.iconWrapper, activeTab === 'chart' && styles.activeBg]}>
              <Icon
                name="chart-bar"
                size={20}
                color={activeTab === 'chart' ? activeColor : inactiveColor}
              />
            </View>
            <Text style={[styles.navLabel, activeTab === 'chart' && { color: activeColor }]}>
              Stats
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center Floating Elevated QR Button */}
        <View style={styles.qrContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.qrButton}
            onPress={() => navigation.navigate('QRScan', { userData: data })}
          >
            <MaterialIcon name="qrcode-scan" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Right Actions */}
        <View style={styles.navRight}>
          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PinScreen', { userData: data })}
          >
            <View style={[styles.iconWrapper, activeTab === 'wallet' && styles.activeBg]}>
              <MaterialIcon
                name="wallet-outline"
                size={22}
                color={activeTab === 'wallet' ? activeColor : inactiveColor}
              />
            </View>
            <Text style={[styles.navLabel, activeTab === 'wallet' && { color: activeColor }]}>
              Wallet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Profile', { data })}
          >
            <View style={[styles.iconWrapper, activeTab === 'profile' && styles.activeBg]}>
              <AwesomeIcon
                name="user-o"
                size={20}
                color={activeTab === 'profile' ? activeColor : inactiveColor}
              />
            </View>
            <Text style={[styles.navLabel, activeTab === 'profile' && { color: activeColor }]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
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
  },
  navBar: {
    width: '92%',
    height: 68,
    marginBottom: Platform.OS === 'ios' ? 24 : 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 14,
    borderWidth: 1,
    borderColor: '#E3E9F7',
    shadowColor: '#172A61',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '40%',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '40%',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBg: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#DCE5FF',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7682A0',
    marginTop: 1,
  },
  qrContainer: {
    position: 'absolute',
    left: '50%',
    top: -22,
    marginLeft: -28,
    zIndex: 1001,
  },
  qrButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1741B5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#1741B5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 9,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
