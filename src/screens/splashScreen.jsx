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
  ActivityIndicator,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../constants/colors';

const SARVANA_LOGO_IMG = require('../Assets/sarvana_logo.png');
const { width } = Dimensions.get('window');

const CAPSULES = [
  { label: 'Recharge',  icon: 'cellphone-wireless',  color: '#3B82F6', bg: '#EFF6FF' },
  { label: 'Sahayog',   icon: 'heart-pulse',          color: '#D81B60', bg: '#FFF0F5' },
  { label: 'Seva',      icon: 'hand-heart',            color: '#0F8A5F', bg: '#ECFDF5' },
  { label: 'बेहतर कल', icon: 'weather-sunset-up',    color: '#F57C00', bg: '#FFF7ED' },
];

const SplashScreen = ({ navigation }) => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  // One animated value per capsule for a staggered entry
  const capsuleAnims = useRef(CAPSULES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // 1. Logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 35,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Stagger capsules in after logo settles
      Animated.stagger(
        120,
        capsuleAnims.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 7,
            tension: 50,
            useNativeDriver: true,
          }),
        ),
      ).start();
    });

    const timer = setTimeout(() => {
      navigation?.replace
        ? navigation.replace('OnboardingScreen')
        : navigation?.navigate('OnboardingScreen');
    }, 2800);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, slideAnim, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Center: Logo + Loading + Capsules */}
      <View style={styles.centerContainer}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <Image source={SARVANA_LOGO_IMG} style={styles.logoImage} resizeMode="contain" />
        </Animated.View>

        <Animated.View style={[styles.loadingWrapper, { opacity: fadeAnim }]}>
          <ActivityIndicator size="small" color={COLORS.primary || '#D81B60'} />
          <Text style={styles.loadingText}>हर सेवा, हर सुविधा — एक ही जगह</Text>
        </Animated.View>

        {/* Capsule chips */}
        <View style={styles.capsulesRow}>
          {CAPSULES.map((cap, idx) => (
            <Animated.View
              key={cap.label}
              style={[
                styles.capsule,
                { backgroundColor: cap.bg },
                {
                  opacity: capsuleAnims[idx],
                  transform: [
                    {
                      scale: capsuleAnims[idx].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.65, 1],
                      }),
                    },
                    {
                      translateY: capsuleAnims[idx].interpolate({
                        inputRange: [0, 1],
                        outputRange: [14, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialIcon name={cap.icon} size={15} color={cap.color} />
              <Text style={[styles.capsuleText, { color: cap.color }]}>{cap.label}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerFoundationTitle}>SARVANA CARE FOUNDATION</Text>
        <Text style={styles.footerTagline}>सेवा आज, बेहतर कल</Text>
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  logoWrapper: {
    width: Math.min(width * 0.76, 290),
    height: Math.min(width * 0.76, 290),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  loadingWrapper: {
    marginTop: 28,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.3,
  },

  /* Capsules */
  capsulesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 22,
    paddingHorizontal: 8,
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
  },
  capsuleText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Footer */
  footerContainer: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerFoundationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary || '#D81B60',
    letterSpacing: 1.2,
  },
  footerTagline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F8A5F',
    marginTop: 2,
  },
});
