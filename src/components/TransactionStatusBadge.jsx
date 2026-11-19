import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';

/**
 * High-performance animated status badge for payment/recharge results.
 * Supports 'Success', 'Failed', and 'Pending'.
 * Uses Lottie animations with seamless native Animated fallbacks (spring pop, ripple, wobble).
 */
const TransactionStatusBadge = ({ status = 'Success', size = 130 }) => {
  const isSuccess = status === 'Success';
  const isFailed = status === 'Failed';
  const isPending = status === 'Pending';

  const [lottieFailed, setLottieFailed] = useState(false);

  // Native Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0.8)).current;
  const rippleOpacity = useRef(new Animated.Value(0.8)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset
    scaleAnim.setValue(0);
    rippleScale.setValue(0.8);
    rippleOpacity.setValue(0.8);
    shakeAnim.setValue(0);

    // Spring Pop
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Pulse / Ripple
    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 1.45,
        duration: 900,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // If failed, trigger error wobble / shake
    if (isFailed) {
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -3, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }

    // If pending, continuous spin
    if (isPending) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    }
  }, [status, isFailed, isPending, scaleAnim, rippleScale, rippleOpacity, shakeAnim, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const mainColor = isSuccess ? '#059669' : isFailed ? '#DC2626' : '#D97706';
  const bgColor = isSuccess ? '#ECFDF5' : isFailed ? '#FEF2F2' : '#FFFBEB';
  const ringColor = isSuccess ? '#A7F3D0' : isFailed ? '#FECACA' : '#FDE68A';

  const lottieSource = isSuccess
    ? require('../Assets/success_animation.json')
    : isFailed
    ? require('../Assets/failed_animation.json')
    : null;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer Animated Pulse / Ripple Ring */}
      <Animated.View
        style={[
          styles.rippleRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: ringColor,
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          },
        ]}
      />

      {/* Main Core Badge */}
      <Animated.View
        style={[
          styles.coreBadge,
          {
            width: size * 0.76,
            height: size * 0.76,
            borderRadius: (size * 0.76) / 2,
            backgroundColor: bgColor,
            borderColor: mainColor,
            transform: [
              { scale: scaleAnim },
              { translateX: shakeAnim },
              ...(isPending ? [{ rotate: spin }] : []),
            ],
          },
        ]}
      >
        {/* Lottie Animation (if supported and source exists) */}
        {lottieSource && !lottieFailed ? (
          <LottieView
            source={lottieSource}
            autoPlay
            loop={false}
            resizeMode="contain"
            style={[styles.lottie, { width: size * 0.72, height: size * 0.72 }]}
            onAnimationFailure={() => setLottieFailed(true)}
          />
        ) : (
          /* Native Vector Fallback (always works) */
          <View style={[styles.iconCircle, { backgroundColor: mainColor, width: size * 0.54, height: size * 0.54, borderRadius: (size * 0.54) / 2 }]}>
            {isSuccess && <MaterialIcon name="check-bold" size={size * 0.3} color="#FFF" />}
            {isFailed && <MaterialIcon name="close-thick" size={size * 0.3} color="#FFF" />}
            {isPending && <MaterialIcon name="clock-outline" size={size * 0.3} color="#FFF" />}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleRing: {
    position: 'absolute',
    borderWidth: 3,
  },
  coreBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  lottie: {
    alignSelf: 'center',
  },
  iconCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
});

export default TransactionStatusBadge;

