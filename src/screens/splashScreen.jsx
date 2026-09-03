import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#091B42" />

      {/* Decorative Glow Elements */}
      <View style={styles.topGlow} />

      <View style={styles.centerContent}>
        {/* Animated App Icon */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require('../Assets/recharge_hoga_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand Tagline */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.brandTitle}>RECHARGE HOGA</Text>
          <View style={styles.taglineBadge}>
            <Text style={styles.taglineText}>⚡ Ab Har Recharge Par Kamao! ⚡</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Security Footer */}
      <View style={styles.bottomFooter}>
        <View style={styles.securePill}>
          <Text style={styles.secureText}>🔒 100% Safe & Instant Recharges</Text>
        </View>
        <Text style={styles.versionText}>Recharge Hoga • v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#091B42',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
  },
  topGlow: {
    position: 'absolute',
    top: -80,
    width: width * 1.2,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(13, 82, 237, 0.25)',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoWrapper: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    shadowColor: '#00D2FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(13, 82, 237, 0.8)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  taglineBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 122, 0, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.4)',
  },
  taglineText: {
    color: '#FFA000',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bottomFooter: {
    alignItems: 'center',
    marginBottom: 10,
  },
  securePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  secureText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  versionText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
});
