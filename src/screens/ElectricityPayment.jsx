import React, { useState } from 'react';
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
import Icon from 'react-native-vector-icons/Feather';
import { THEME_COLORS, GRADIENTS } from '../constants/theme';
import Img from '../Assets/billpayment.png';
import Button from '../components/Button';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const ElectricityPayment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userData } = route.params || {};

  const [acNo, setacNo] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    if (acNo === '' || amount === '') {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'All fields are required',
      });
    } else {
      navigation.navigate('Verify', { data: userData, amount: amount });
    }
  };

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
        <Text style={styles.headerTitle}>Electricity Bill</Text>
      </LinearGradient>

      {/* Hero Banner */}
      <View style={styles.bannerContainer}>
        <LinearGradient
          colors={['#1756C5', '#4285F4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}
        >
          <Image source={Img} style={styles.bannerImage} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Pay Instantly</Text>
            <Text style={styles.bannerSubtitle}>Secure Electricity Payments</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.Content}>
        <View style={styles.inputCard}>
          <Text style={styles.label}>Consumer Number / A/C No.</Text>
          <View style={styles.inputWrapper}>
            <Icon name="hash" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 123456789"
              placeholderTextColor="#94A3B8"
              onChangeText={text => setacNo(text)}
              value={acNo}
            />
          </View>

          <Text style={styles.label}>Amount</Text>
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

          <Button
            style={styles.payBtn}
            title="FETCH & PAY"
            filled
            onpress={handleSubmit}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ElectricityPayment;

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
    fontSize: 22,
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
    paddingHorizontal: 20,
  },
  bannerImage: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    width: 150,
    height: 150,
    resizeMode: 'contain',
    opacity: 0.9,
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
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
    marginBottom: 10,
    marginTop: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  rsPrefix: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
    marginRight: 8,
  },
  payBtn: {
    marginTop: 30,
    borderRadius: 18,
    height: 56,
  },
});
