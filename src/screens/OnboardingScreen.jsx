import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../constants/colors';
import { OnlineAddaHeaderLogo } from '../components/OnlineAddaLogo';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'हर घर डिजिटल,\nहर सेवा आसान',
    subtitle: 'Mobile & DTH Recharge से लेकर सभी बिल भुगतान एक ही ऐप में',
    features: [
      { id: 'f1', icon: 'cellphone-wireless', type: 'material', title: 'Recharge' },
      { id: 'f2', icon: 'flash', type: 'material', title: 'BBPS Bills' },
      { id: 'f3', icon: 'shield-check', type: 'material', title: '100% Secure' },
    ],
  },
  {
    id: 2,
    title: 'डिजिटल वॉलेट एवं\nकैशबैक रिवार्ड्स',
    subtitle: 'हर रिचार्ज और बिल भुगतान पर पाएं आकर्षक कैशबैक और सुरक्षित डिजिटल वॉलेट',
    features: [
      { id: 'f4', icon: 'wallet', type: 'material', title: 'Smart Wallet' },
      { id: 'f5', icon: 'gift', type: 'fa5', title: 'Cashbacks' },
      { id: 'f6', icon: 'account-check', type: 'material', title: '100% Safe' },
    ],
  },
  {
    id: 3,
    title: 'फास्टैग, बिल एवं\nबैंकिंग सेवाएं',
    subtitle: 'FASTag, Electricity, LPG, EMI Loan और Instant Cashbacks',
    features: [
      { id: 'f7', icon: 'car-connected', type: 'material', title: 'FASTag' },
      { id: 'f8', icon: 'bank-transfer', type: 'material', title: 'Fast Payout' },
      { id: 'f9', icon: 'headset', type: 'material', title: '24x7 Help' },
    ],
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const handleNext = () => {
    if (activeSlide < SLIDES.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      navigation.navigate('LogIn');
    }
  };

  const handleSkip = () => {
    navigation.navigate('LogIn');
  };

  const current = SLIDES[activeSlide];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Online Adda Logo */}
      <View style={styles.topLogoContainer}>
        <OnlineAddaHeaderLogo size={46} subtitle="Har Ghar Digital" />
      </View>

      {/* Slide Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.titleText}>{current.title}</Text>
        <Text style={styles.subtitleText}>{current.subtitle}</Text>

        {/* 3 Feature Cards */}
        <View style={styles.featureRow}>
          {current.features.map(item => (
            <View key={item.id} style={styles.featureCard}>
              <View style={styles.featureIconCircle}>
                {item.type === 'fa5' ? (
                  <FontAwesome5 name={item.icon} size={22} color="#0A3EB8" />
                ) : (
                  <MaterialIcon name={item.icon} size={26} color="#0A3EB8" />
                )}
              </View>
              <Text style={styles.featureTitle}>{item.title}</Text>
            </View>
          ))}
        </View>

        {/* Carousel Dots Indicator */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeSlide === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={handleNext}
        >
          <Text style={styles.primaryBtnText}>
            {activeSlide === SLIDES.length - 1 ? 'शुरू करें →' : 'आगे बढ़ें →'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          activeOpacity={0.7}
          onPress={handleSkip}
        >
          <Text style={styles.skipBtnText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  topLogoContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A3EB8',
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 36,
    width: '100%',
  },
  featureCard: {
    alignItems: 'center',
    width: (width - 80) / 3,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    elevation: 2,
    shadowColor: '#0A3EB8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  featureIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  featureTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#0A3EB8',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#E2E8F0',
  },
  bottomActions: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#0A3EB8',
    paddingVertical: 15,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#0A3EB8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  skipBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 6,
  },
  skipBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});
