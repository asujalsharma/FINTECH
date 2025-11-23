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
const BLUE = '#0078FF';

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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>FASTag Recharge</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Vehicle Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. MP09AB1234"
          placeholderTextColor="#999"
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
        />

        <Text style={styles.label}>Recharge Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity
          style={[
            styles.button,
             ]}
          onPress={handlePay}
        >
         
            <Text style={styles.buttonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F9',
  },

  header: {
    backgroundColor: BLUE,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    padding: 4,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  card: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    elevation: 5,
    alignItems: 'center',
  },

  iconWrapper: {
    backgroundColor: '#EAF3FF',
    padding: 18,
    borderRadius: 50,
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    alignSelf: 'flex-start',
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '600',
  },

  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },

  button: {
    marginTop: 24,
    backgroundColor: BLUE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },

  disabledBtn: {
    backgroundColor: '#8cbcff',
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
