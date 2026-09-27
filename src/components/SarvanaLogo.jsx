import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import COLORS from '../constants/colors';

const SARVANA_LOGO_IMG = require('../Assets/sarvana_logo.png');

/**
 * Full Sarvana Circular Official Badge Logo
 */
export const SarvanaRoundLogo = ({ size = 200, style }) => {
  return (
    <View style={[styles.roundContainer, { width: size, height: size }, style]}>
      <Image
        source={SARVANA_LOGO_IMG}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
};

/**
 * Header Brand Logo using the official Sarvana icon and text
 */
export const SarvanaHeaderLogo = ({
  size = 38,
  subtitle = 'ALL IN ONE',
  subTagline,
  showIcon = true,
  textColor = '#0A2568',
}) => {
  return (
    <View style={styles.headerLogoRow}>
      {showIcon && (
        <Image
          source={SARVANA_LOGO_IMG}
          style={[styles.headerIconImage, { width: size, height: size }]}
          resizeMode="contain"
        />
      )}
      <View style={styles.headerTextCol}>
        <Text style={[styles.headerBrandTitle, { color: textColor }]}>SARVANA</Text>
        <Text style={styles.headerSubBadge}>{subtitle}</Text>
        {subTagline ? (
          <Text style={styles.headerSubTagline}>{subTagline}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  roundContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconImage: {
    marginRight: 8,
  },
  headerTextCol: {
    justifyContent: 'center',
  },
  headerBrandTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#0A2568',
  },
  headerSubBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E11D68',
    letterSpacing: 2,
    marginTop: -2,
  },
  headerSubTagline: {
    fontSize: 8.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
});

export default SarvanaRoundLogo;
