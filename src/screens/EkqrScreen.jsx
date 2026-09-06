import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { postData } from '../API';

export default function EkqrScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { amount } = route.params || {};

  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPayment = async () => {
      try {
        const orderId = `EKQR_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const body = {
          amount: String(amount),
          orderId: orderId,
          redirectUrl: 'https://yaarapay.com/payment-receipt',
          note: 'Payment via eKQR'
        };

        const res = await postData('api/payment/upi/create-order', body);
        console.log('eKQR Init:', res);

        const url = res?.data?.payment_url || res?.payment_url || res?.Data?.payment_url;

        if (url) {
          setPaymentUrl(url);
        } else {
          Alert.alert('Error', 'Unable to fetch payment URL from eKQR');
          navigation.goBack();
        }
      } catch (err) {
        console.error('eKQR error:', err);
        Alert.alert('Error', 'Failed to initialize eKQR payment');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    if (amount) {
      initPayment();
    } else {
      Alert.alert('Error', 'Invalid amount');
      navigation.goBack();
    }
  }, [amount]);

  const handleNavigationStateChange = navState => {
    const { url } = navState;
    console.log('eKQR WebView URL:', url);

    if (url.includes('yaarapay.com/payment-receipt') || url.includes('payment-receipt')) {
      Alert.alert('Payment Status', 'Your payment is being processed.');
      navigation.replace('Home');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#471d7d" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {paymentUrl ? (
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator
              color="#471d7d"
              size="large"
              style={styles.webviewLoader}
            />
          )}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  webviewLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18,
    marginTop: -18,
  },
});
