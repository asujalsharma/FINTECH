import React from 'react';
import { ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PaymentWebviewScreen({ route, navigation }) {
  const { paymentUrl, orderId, amount } = route.params;

  const handleNavigationChange = navState => {
    // Payment gateway redirects here after success/failure
    if (navState.url.includes('payment-receipt')) {
      navigation.replace('PaymentReceipt', {
        orderId,
        amount,
        status: 'success',
      });
    }
  };

  return (
    <WebView
      source={{ uri: paymentUrl }}
      onNavigationStateChange={handleNavigationChange}
      startInLoadingState
      renderLoading={() => (
        <ActivityIndicator
          size="large"
          color="#008CFF"
          style={{ marginTop: 20 }}
        />
      )}
    />
  );
}
