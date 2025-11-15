import React from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import COLORS from '../constants/colors';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const IntroLogoAnimationScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <LottieView
            source={require('../Assets/logo.json')}
            autoPlay
            loop={false}
            resizeMode="contain"
            style={styles.logoAnimation}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoAnimation: {
    width: width * 0.35, // 🔥 35% of screen width → dynamically smaller
    height: width * 0.35 * (800 / 360), // keeps same aspect ratio
    transform: [{ scale: 0.6 }], // 👈 extra scale down
    alignSelf: 'center',
  },
});

export default IntroLogoAnimationScreen;
