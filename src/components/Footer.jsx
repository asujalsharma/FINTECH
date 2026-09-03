import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../constants/colors';

const Footer = () => {
  return (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>
        © 2026 Tech Ember Solutions. All Rights Reserved.
      </Text>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: COLORS.headerBg || '#0A2568',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
