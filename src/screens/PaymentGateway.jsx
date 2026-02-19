import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  View,
  AppState,
} from 'react-native';
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

  // NEW: track whether we opened an external UPI app and expect a result
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const appState = useRef(AppState.currentState);
  const verifyingRef = useRef(false); // prevent concurrent verify calls
  const checkTimeoutRef = useRef(null);
  const CHECK_DELAY = 5000; // 5 seconds

  console.log('sujal', from);

  // ----------------------------------------
  // MAIN REQUEST HANDLER
  // ----------------------------------------
  const handleRequest = useCallback(
    event => {
      const url = event.url;
      console.log('URL Triggered:', url);

      // 1️⃣ intent:// → upi:// conversion
      if (url.startsWith('intent://')) {
        try {
          const newUrl = url.replace('intent://', 'upi://');
          setAwaitingPayment(true);
          Linking.openURL(newUrl).catch(err => {
            console.log('Intent open error:', err);
            setAwaitingPayment(false);
          });
        } catch (err) {
          console.log('Intent error:', err);
        }
        return false;
      }

      // 2️⃣ Regular UPI deep links — open external app and mark awaiting
      if (
        url.startsWith('upi://') ||
        url.startsWith('phonepe://') ||
        url.startsWith('paytm://') ||
        url.startsWith('paytmmp://') ||
        url.startsWith('tez://') ||
        url.startsWith('gpay://')
      ) {
        setAwaitingPayment(true);
        Linking.openURL(url).catch(() => {
          setAwaitingPayment(false);
          Alert.alert(
            'UPI App Missing',
            'Please install a UPI-supported app to continue.',
          );
        });
        return false;
      }

      // 3️⃣ Wallet top-up redirect
      if (url.includes('ClubTYL.com/payment-receipt')) {
        // If the gateway returns into the WebView we still handle it here
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
    },
    [from, orderId, rechargeData, operatorDetail, amount],
  );

  // ----------------------------------------
  // WALLET TOP-UP RESULT HANDLER
  // (unchanged)
  // ----------------------------------------
  const handleWalletTopupResult = async () => {
    try {
      const verifyRes = await postData('api/payment/upi/tenz-status', {
        orderId,
      });

      console.log('TOPUP VERIFY RESULT:', verifyRes);

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
        res: { Data: { status: 'Pending', orderId: orderId } },
        from: 'wallet-topup',
        amount,
      });
    } finally {
      setAwaitingPayment(false);
    }
  };

  // ----------------------------------------
  // VERIFY PAYMENT THEN RECHARGE
  // (unchanged except clear awaiting flag)
  // ----------------------------------------
  const verifyAndRecharge = async () => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;

    try {
      const verifyRes = await postData('api/payment/upi/tenz-status', {
        orderId,
      });

      console.log('VERIFY PAYMENT:', verifyRes);

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

      // STEP 2 → RUN RECHARGE API
      let rechargeRes;

      if (isPrePaid) {
        rechargeRes = await getData(
          `api/cyrus/recharge_request?number=${operatorDetail?.Mobile}&amount=${rechargeData?.rs}&operator=${operatorDetail?.OpCode}&circle=${operatorDetail?.CircleCode}&isPrepaid=true&operatorName=${operatorDetail?.Operator}&type=upi&ord=${orderId}`,
        );
      } else if (from === 'DTH') {
        rechargeRes = await getData(
          `api/cyrus/dth_request?number=${rechargeData?.customerID}&operator=${operatorDetail?.DthOpCode}&amount=${rechargeData?.amount}&operatorName=${operatorDetail?.DthName}&type=upi&ord=${orderId}`,
        );
      } else if (from === 'googleplay') {
        rechargeRes = await postData('api/cyrus/bbps/google-play?type=upi', {
          number: rechargeData?.number,
          amount: rechargeData?.amount,
          ord: orderId,
        });
      } else {
        rechargeRes = await postData(
          'api/cyrus/bbps/new-bill-payment?type=upi',
          {
            number: rechargeData?.number,
            operatorCode: operatorDetail?.op_id,
            operatorName: operatorDetail?.operator_name,
            operatorId: operatorDetail?.op_id,
            amount: rechargeData?.amount,
            serviceId: operatorDetail?.ServiceId,
            billDetails: rechargeData,
            operatorCategory: operatorDetail?.categoryId,
            ord: orderId,
          },
        );
      }

      console.log('RECHARGE RESULT:', rechargeRes);

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
        res: { Data: { status: 'Pending', orderId: orderId } },
        rechargeData,
        operatorDetail,
        from,
        amount,
      });
    } finally {
      verifyingRef.current = false;
      setAwaitingPayment(false);
    }
  };

  // ----------------------------------------
  // helper: schedule a delayed check (5s) and clear previous timeout
  // ----------------------------------------
  const scheduleDelayedCheck = () => {
    // clear any existing scheduled check
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
      checkTimeoutRef.current = null;
    }

    checkTimeoutRef.current = setTimeout(() => {
      // ensure we still expect a payment and not already verifying
      if (!awaitingPayment || verifyingRef.current) {
        checkTimeoutRef.current = null;
        return;
      }

      console.log('Running delayed payment status check (5s elapsed)');
      console.log(from);
      if (from === 'wallet-topup') {
        handleWalletTopupResult();
      } else {
        verifyAndRecharge();
      }
      checkTimeoutRef.current = null;
    }, CHECK_DELAY);
  };

  // ----------------------------------------
  // APP STATE: handle resume to verify payment after user returns from UPI app
  // with a 5 second delay
  // ----------------------------------------
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // Only act on transitions to active
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log(
          'App has come to the foreground! awaitingPayment=',
          awaitingPayment,
        );

        // If we were awaiting payment, schedule a delayed verify now
        if (awaitingPayment && !verifyingRef.current) {
          scheduleDelayedCheck();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
        checkTimeoutRef.current = null;
      }
    };
  }, [awaitingPayment, from, orderId, rechargeData, operatorDetail]);

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
