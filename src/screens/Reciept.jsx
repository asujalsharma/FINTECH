import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { postData } from '../API';

export default function PaymentReceipt({ route, navigation }) {
  const { orderId, amount } = route.params;
  const [status, setStatus] = useState();
  console.log('orderId, amount', orderId, amount);
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await postData(`api/payment/upi/tenz-status`, {
          orderId: orderId,
        });

        console.log('status res:', res);

        if (res?.Data?.txnStatus || res?.success) {
          setStatus(res?.Data?.txnStatus);
        } else {
          setStatus('failed');
        }
      } catch (err) {
        console.log('Status fetch error:', err);
        Alert.alert('Error fetching payment status');
        setStatus('failed');
      }
    };

    fetchStatus();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Receipt</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Order ID:</Text>
        <Text style={styles.value}>{orderId}</Text>

        <Text style={styles.label}>Amount:</Text>
        <Text style={styles.value}>₹ {amount}</Text>

        <Text style={styles.label}>Status:</Text>
        <Text
          style={[
            styles.value,
            { color: status === 'success' ? 'green' : 'red' },
          ]}
        >
          {status?.toUpperCase()}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f6f9ff',
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    elevation: 3,
    marginBottom: 20,
  },
  label: { fontSize: 16, fontWeight: '600', color: '#444', marginTop: 10 },
  value: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 5 },
  button: {
    backgroundColor: '#008CFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
