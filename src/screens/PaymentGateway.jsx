import React, { useCallback } from 'react';
import { ActivityIndicator, Alert, Linking, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { postData, getData } from '../API';

export default function PaymentWebviewScreen({ route, navigation }) {
  const {
    paymentUrl,
    orderId,
    amount,
    rechargeData,
    operatorDetail,
    from,
    isPrePaid,
    category,
  } = route.params;

  // ----------------------------------------
  // MAIN REQUEST HANDLER
  // ----------------------------------------
  const handleRequest = useCallback(event => {
    const url = event.url;
    console.log('URL Triggered:', url);

    // 1️⃣ intent:// → upi:// conversion
    if (url.startsWith('intent://')) {
      try {
        const newUrl = url.replace('intent://', 'upi://');
        Linking.openURL(newUrl);
      } catch (err) {
        console.log('Intent error:', err);
      }
      return false;
    }

    // 2️⃣ Regular UPI deep links
    if (
      url.startsWith('upi://') ||
      url.startsWith('phonepe://') ||
      url.startsWith('paytm://') ||
      url.startsWith('paytmmp://') ||
      url.startsWith('tez://') ||
      url.startsWith('gpay://')
    ) {
      Linking.openURL(url).catch(() => {
        Alert.alert(
          'UPI App Missing',
          'Please install a UPI-supported app to continue.',
        );
      });
      return false;
    }

    // 3️⃣ Wallet top-up redirect
    if (url.includes('pinpay.com/payment-receipt')) {
      handleWalletTopupResult();
      return false;
    }

    // 4️⃣ Recharge payment success callback
    if (url.includes('payment-success')) {
      verifyAndRecharge();
      return false;
    }

    // 5️⃣ Payment explicitly failed
    if (url.includes('payment-failed')) {
      navigation.replace('Success', {
        res: { Data: { status: 'Failed' } },
        from,
        rechargeData,
        operatorDetail,
        amount,
      });
      return false;
    }

    return true;
  }, []);

  // ----------------------------------------
  // WALLET TOP-UP RESULT HANDLER
  // ----------------------------------------
  const handleWalletTopupResult = async () => {
    try {
      const verifyRes = await postData('api/payment/upi/tenz-status', {
        orderId,
      });

      console.log('TOPUP VERIFY RESULT:', verifyRes);

      // Handle SUCCESS / FAILED / PENDING
      navigation.replace('Success', {
        res: verifyRes,
        from: 'wallet-topup',
        amount,
      });
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Error',
        'Payment succeeded but wallet update failed. Please contact support.',
      );
      navigation.replace('Success', {
        res: { Data: { status: 'Pending' } },
        from: 'wallet-topup',
        amount,
      });
    }
  };

  // ----------------------------------------
  // VERIFY PAYMENT THEN RECHARGE
  // ----------------------------------------
  const verifyAndRecharge = async () => {
    try {
      // STEP 1 → Verify UPI Payment
      const verifyRes = await postData('api/payment/upi/tenz-status', {
        orderId,
      });

      console.log('VERIFY PAYMENT:', verifyRes);

      // If FAILED or PENDING → directly show on success screen
      if (verifyRes?.Data?.txnStatus !== 'SUCCESS') {
        navigation.replace('Success', {
          res: verifyRes,
          rechargeData,
          operatorDetail,
          from,
          amount,
        });
        return;
      }

      // ----------------------------------------
      // STEP 2 → RUN RECHARGE API
      // ----------------------------------------
      let rechargeRes;

      if (isPrePaid) {
        rechargeRes = await getData(
          `api/cyrus/recharge_request?number=${operatorDetail.Mobile}&amount=${rechargeData.rs}&operator=${operatorDetail.OpCode}&circle=${operatorDetail.CircleCode}&isPrepaid=true&operatorName=${operatorDetail.Operator}&type=upi&ord=${orderId}`,
        );
      } else if (from === 'DTH') {
        rechargeRes = await getData(
          `api/cyrus/dth_request?number=${rechargeData.customerID}&operator=${operatorDetail.DthOpCode}&amount=${rechargeData.amount}&operatorName=${operatorDetail.DthName}&type=upi&ord=${orderId}`,
        );
      } else if (from === 'googleplay') {
        rechargeRes = await postData('api/cyrus/bbps/google-play?type=upi', {
          number: rechargeData.number,
          amount: rechargeData.amount,
          ord: orderId,
        });
      } else {
        // BBPS BILL PAYMENT
        rechargeRes = await postData(
          'api/cyrus/bbps/new-bill-payment?type=upi',
          {
            number: rechargeData.number,
            operatorCode: operatorDetail.op_id,
            operatorName: operatorDetail.operator_name,
            operatorId: operatorDetail.op_id,
            amount: rechargeData.amount,
            serviceId: operatorDetail.ServiceId,
            billDetails: rechargeData,
            operatorCategory: operatorDetail.categoryId,
            ord: orderId,
          },
        );
      }

      console.log('RECHARGE RESULT:', rechargeRes);

      // Redirect to unified status page
      navigation.replace('Success', {
        res: rechargeRes,
        rechargeData,
        operatorDetail,
        from,
        amount,
      });
    } catch (error) {
      console.log(error);

      navigation.replace('Success', {
        res: { Data: { status: 'Pending' } }, // fallback
        rechargeData,
        operatorDetail,
        from,
        amount,
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: paymentUrl }}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onShouldStartLoadWithRequest={handleRequest}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color="#008CFF"
            style={{ marginTop: 20 }}
          />
        )}
      />
    </View>
  );
}
