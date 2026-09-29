import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../constants/colors';

export default function FastagPaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { provider, ServiceId } = route.params || {};
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [amount, setAmount] = useState('');

  const handlePay = () => {
    if (!vehicleNumber.trim()) {
      alert('Please enter your vehicle registration number.');
      return;
    }
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Please enter a valid recharge amount.');
      return;
    }

    navigation.navigate('PaymentConfirmation', {
      rechargeData: {
        number: vehicleNumber.toUpperCase().trim(),
        amount,
        type: 'fastag',
      },
      operatorDetail: { ...(provider || {}), ServiceId: ServiceId || provider?._id },
      category: provider?.categoryId || 'fastag',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>FASTag Recharge</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Selected Provider Card */}
        {provider && (
          <View style={styles.providerBadge}>
            <Icon name="car-connected" size={24} color={colors.primary} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.providerName}>{provider.name || provider.operatorName || 'FASTag Issuer'}</Text>
              <Text style={styles.providerSub}>Selected Fastag Provider</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.changeBtn}
            >
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Vehicle Number / VRN</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. MH02AB1234"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
          />

          <Text style={styles.label}>Recharge Amount (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount (min ₹100)"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <View style={styles.quickAmounts}>
            {['200', '500', '1000', '2000'].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[styles.quickChip, amount === amt && styles.quickChipActive]}
                onPress={() => setAmount(amt)}
              >
                <Text style={[styles.quickChipText, amount === amt && styles.quickChipTextActive]}>
                  + ₹{amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handlePay}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Proceed to Pay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  providerBadge: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  providerSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  changeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  label: {
    fontSize: 13,
    marginTop: 10,
    marginBottom: 6,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 6,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickChipActive: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.primary,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  quickChipTextActive: {
    color: colors.primary,
  },
  button: {
    marginTop: 22,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
