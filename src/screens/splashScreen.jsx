import React from 'react';
import { View, StyleSheet, Dimensions, Text, StatusBar } from 'react-native';
import FastImage from 'react-native-fast-image';
import COLORS from '../constants/colors';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#002B9A" />
      <View style={styles.logoWrapper}>
        <FastImage
          source={require('../Assets/playstore-icon.png')}
          style={styles.logo}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>
      <View style={styles.taglineWrapper}>
        <Text style={styles.taglineText}>Har Ghar Digital</Text>
        <Text style={styles.subTagline}>Fast • Secure • Reliable</Text>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002B9A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  taglineWrapper: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  taglineText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  subTagline: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 6,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
