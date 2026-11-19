import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Image, Animated } from 'react-native';

const SplashScreen = ({ onFinish }) => {
  const finishedRef = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  const handleFinish = () => {
    if (!finishedRef.current) {
      finishedRef.current = true;
      if (onFinish) {
        onFinish();
      }
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        handleFinish();
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#002E6E" />
      <Animated.View
        style={[
          styles.contentWrap,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../Assets/app_icon.png')}
          style={styles.appIcon}
          resizeMode="contain"
        />
        <Text style={styles.appName}>RightPay India</Text>
        <Text style={styles.tagline}>Digital Payments & Wallet</Text>
      </Animated.View>

      <View style={styles.footerWrap}>
        <Text style={styles.footerText}>100% Safe & Secure • Made in India 🇮🇳</Text>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002E6E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: 140,
    height: 140,
    borderRadius: 30,
    shadowColor: '#00BAF2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 12,
  },
  appName: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 22,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38C8F7',
    marginTop: 6,
    letterSpacing: 0.4,
  },
  footerWrap: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
});
