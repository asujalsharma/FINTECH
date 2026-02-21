import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.44;
import { THEME_COLORS, GRADIENTS } from '../constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import { Platform } from 'react-native';
const BLUE = THEME_COLORS.primary;

export default function FastagPaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { provider, ServiceId } = route.params;
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  console.log(
    '🚀 ~ file: FastagPayment.jsx:18 ~ FastagPaymentScreen ~ provider:',
    provider,
    ServiceId,
  );
  const handlePay = () => {
    setIsLoading(true);
    navigation.navigate('PaymentConfirmation', {
      rechargeData: {
        number: vehicleNumber,
        amount,
        type: 'fastag',
      },
      operatorDetail: { ...provider, ServiceId: ServiceId },
      category: provider.categoryId,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FASTag Recharge</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Vehicle Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. MP09AB1234"
          placeholderTextColor="#94A3B8"
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Recharge Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity style={styles.button} onPress={handlePay}>
          <Text style={styles.buttonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  card: {
    marginTop: -40,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 24,
    elevation: 8,
    shadowColor: '#1756C5',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  label: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    letterSpacing: 1,
  },
  button: {
    marginTop: 30,
    backgroundColor: THEME_COLORS.orange,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#FF9500',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
