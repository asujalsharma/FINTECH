import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import COLORS from '../constants/colors';

/**
 * Full Online Adda Circular Badge Logo:
 * Renders the authentic high-resolution PNG round badge logo.
 */
export const SarvanaRoundLogo = ({ size = 180, style }) => {
  return (
    <View style={[styles.roundContainer, { width: size, height: size }, style]}>
      <Image
        source={require('../Assets/online_adda_logo.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );
};

export const OnlineAddaRoundLogo = SarvanaRoundLogo;

/**
 * Header Brand Logo with the round emblem icon & Online Adda text
 */
export const SarvanaHeaderLogo = ({
  size = 40,
  subtitle = 'Har Ghar Digital',
  subTagline,
  showIcon = true,
  textColor = '#0F172A',
}) => {
  return (
    <View style={styles.headerLogoRow}>
      {showIcon && (
        <View style={[styles.headerIconWrapper, { width: size, height: size }]}>
          <Image
            source={require('../Assets/online_adda_logo.png')}
            style={{ width: '100%', height: '100%', borderRadius: 8 }}
            resizeMode="contain"
          />
        </View>
      )}
      <View style={styles.headerTextCol}>
        <Text style={[styles.headerBrandTitle, { color: textColor }]}>ONLINE ADDA</Text>
        <Text style={styles.headerSubBadge}>{subtitle}</Text>
        {subTagline ? (
          <Text style={styles.headerSubTagline}>{subTagline}</Text>
        ) : null}
      </View>
    </View>
  );
};

export const OnlineAddaHeaderLogo = SarvanaHeaderLogo;

const styles = StyleSheet.create({
  roundContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrapper: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    justifyContent: 'center',
  },
  headerBrandTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#0F172A',
  },
  headerSubBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 1.5,
    marginTop: -1,
  },
  headerSubTagline: {
    fontSize: 8.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
});

export default SarvanaRoundLogo;

