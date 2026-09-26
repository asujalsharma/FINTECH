import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import COLORS from '../constants/colors';

/**
 * Online Adda Circular / Badge Logo
 */
export const OnlineAddaRoundLogo = ({ size = 180, style }) => {
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

/**
 * Header Brand Logo with icon & Online Adda text + tagline
 */
export const OnlineAddaHeaderLogo = ({
  size = 38,
  subtitle = 'Har Ghar Digital',
  subTagline,
  showIcon = true,
  textColor = '#0F172A',
  badgeColor = COLORS.primary,
}) => {
  return (
    <View style={styles.headerLogoRow}>
      {showIcon && (
        <View style={[styles.headerIconWrapper, { width: size, height: size }]}>
          <Image
            source={require('../Assets/online_adda_logo.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </View>
      )}
      <View style={styles.headerTextCol}>
        <Text style={[styles.headerBrandTitle, { color: textColor }]}>
          Online <Text style={{ color: COLORS.primaryLight }}>Adda</Text>
        </Text>
        {subtitle ? (
          <View style={styles.taglineBadge}>
            <Text style={[styles.headerSubBadge, { color: badgeColor }]}>{subtitle}</Text>
          </View>
        ) : null}
        {subTagline ? (
          <Text style={styles.headerSubTagline}>{subTagline}</Text>
        ) : null}
      </View>
    </View>
  );
};

// Aliases for backwards compatibility
export const SarvanaRoundLogo = OnlineAddaRoundLogo;
export const SarvanaHeaderLogo = OnlineAddaHeaderLogo;

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
    borderRadius: 10,
    overflow: 'hidden',
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  headerTextCol: {
    justifyContent: 'center',
  },
  headerBrandTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#0F172A',
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSubBadge: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.8,
    marginTop: -1,
  },
  headerSubTagline: {
    fontSize: 8.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
});

export default OnlineAddaRoundLogo;
