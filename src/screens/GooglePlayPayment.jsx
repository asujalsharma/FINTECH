import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { THEME_COLORS, GRADIENTS } from '../constants/theme';
import Button from '../components/Button';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getData } from '../API';
import LinearGradient from 'react-native-linear-gradient';

const GooglePlayPayment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { ServiceId } = route.params || {};
  const [amount, setAmount] = useState('');
  const [UserData, setUserData] = useState(null);

  const handleSubmit = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Amount',
        text2: 'Please enter a valid amount to continue.',
      });
      return;
    }

    navigation.navigate('PaymentConfirmation', {
      rechargeData: {
        amount: amount,
        userDetails: UserData,
        number: UserData?.phone || UserData?.mobile || '',
      },
      operatorDetail: {
        amount: amount,
        ServiceId: ServiceId,
        name: 'Google Play',
      },
      from: 'googleplay',
      isPrePaid: false,
    });
  };

  const fetchUser = async () => {
    try {
      const res = await getData(`/api/user/profile`);
      if (res?.Status === true || res?.success === true) {
        setUserData(res?.Data || res?.user);
      }
    } catch (err) {
      console.log('User Fetch Error →', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Google Play Recharge</Text>
      </LinearGradient>

      {/* Hero Banner */}
      <View style={styles.bannerContainer}>
        <LinearGradient
          colors={['#00C853', '#009688']} // Greenish theme for Google Play
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}
        >
          <Icon name="google-play" size={80} color="rgba(255,255,255,0.3)" style={styles.bannerIcon} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Google Play</Text>
            <Text style={styles.bannerSubtitle}>Get your redeem code instantly</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.Content}>
        <View style={styles.inputCard}>
          <Text style={styles.label}>Add the Amount</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.rsPrefix}>₹</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              onChangeText={text => setAmount(text)}
              value={amount}
            />
          </View>

          <Text style={styles.helperText}>
            Min: ₹10 | Max: ₹5000
          </Text>

          <Button
            style={styles.payBtn}
            title="GENERATE REDEEM CODE"
            filled
            onpress={handleSubmit}
          />
        </View>

        <View style={styles.infoBox}>
          <Icon name="shield-check" size={24} color={THEME_COLORS.primary} />
          <Text style={styles.infoText}>
            The redeem code will be sent to your registered mobile number and email address.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default GooglePlayPayment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  bannerContainer: {
    marginHorizontal: 20,
    marginTop: -40,
    height: 140,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#1756C5',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  bannerGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  bannerIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  Content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 25,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  label: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  rsPrefix: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A2E',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  helperText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'right',
  },
  payBtn: {
    marginTop: 30,
    borderRadius: 18,
    height: 56,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    marginTop: 25,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1E8FF',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '600',
    lineHeight: 18,
  },
});
