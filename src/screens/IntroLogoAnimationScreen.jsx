import React from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import COLORS from '../constants/colors';

const { width } = Dimensions.get('window');
const SARVANA_LOGO_IMG = require('../Assets/sarvana_logo.png');

const IntroLogoAnimationScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.centerContainer}>
        <Image
          source={SARVANA_LOGO_IMG}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: Math.min(width * 0.7, 260),
    height: Math.min(width * 0.7, 260),
  },
});

export default IntroLogoAnimationScreen;
