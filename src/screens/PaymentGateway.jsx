import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  View,
  Text,
  StyleSheet,
  AppState,
  BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { postData, getData } from '../API';

export default function PaymentWebviewScreen({ route, navigation }) {
  const {
    paymentUrl,
    bankPostData,
    orderId,
    amount,
    rechargeData,
    operatorDetail,
    from,
    isPrePaid,
    category,
    isZaakpay,
  } = route.params;

  const POLL_INTERVAL = 5000; // Poll every 5 seconds
  const MAX_POLL_DURATION = 45000; // Till 45 seconds

  // Track whether an external UPI app was opened
  const awaitingPaymentRef = useRef(false);
  const appState = useRef(AppState.currentState);

  // Polling state and refs
  const [isPolling, setIsPolling] = useState(false);
  const isPollingRef = useRef(false);
  const pollingTimerRef = useRef(null);
  const pollingStartTimeRef = useRef(null);

  // ----------------------------------------
  // STOP POLLING HELPER
  // ----------------------------------------
  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    isPollingRef.current = false;
    setIsPolling(false);
    awaitingPaymentRef.current = false;
  }, []);

  // ----------------------------------------
  // HANDLE PAYMENT SUCCESS (Recharge / Top-up)
  // ----------------------------------------
  const handlePaymentSuccess = useCallback(
    async statusRes => {
      try {
        if (from === 'wallet-topup') {
          navigation.replace('Success', {
            res: statusRes,
            from: isZaakpay ? 'zaakpay-wallet-topup' : 'wallet-topup',
            amount,
            orderId,
          });
          return;
        }

        let rechargeRes;
        const gatewayType = isZaakpay ? 'zaakpay' : 'upi';

        if (isPrePaid) {
          rechargeRes = await getData(
            `api/cyrus/recharge_request?number=${operatorDetail?.Mobile}&amount=${rechargeData?.rs || rechargeData?.amount}&operator=${operatorDetail?.OpCode}&circle=${operatorDetail?.CircleCode}&isPrepaid=true&operatorName=${operatorDetail?.Operator}&type=${gatewayType}&ord=${orderId}`,
          );
        } else if (from === 'DTH') {
          const dthOp =
            operatorDetail?.DthOpCode ||
            operatorDetail?.OperatorCode ||
            operatorDetail?.OpCode;
          const dthName =
            operatorDetail?.DthName ||
            operatorDetail?.OperatorName ||
            operatorDetail?.Operator;
          rechargeRes = await getData(
            `api/cyrus/dth_request?number=${rechargeData?.customerID}&operator=${dthOp}&amount=${rechargeData?.amount}&operatorName=${dthName}&type=${gatewayType}&ord=${orderId}`,
          );
        } else if (from === 'googleplay') {
          rechargeRes = await postData(
            `api/cyrus/bbps/google-play?type=${gatewayType}`,
            {
              number: rechargeData?.number,
              amount: rechargeData?.amount,
              ord: orderId,
            },
          );
        } else {
          rechargeRes = await postData(
            `api/cyrus/bbps/new-bill-payment?type=${gatewayType}`,
            {
              number: rechargeData?.number,
              operatorCode:
                operatorDetail?.op_id || operatorDetail?.OperatorCode,
              operatorName:
                operatorDetail?.operator_name || operatorDetail?.OperatorName,
              operatorId:
                operatorDetail?.op_id || operatorDetail?.OperatorCode,
              amount: rechargeData?.amount,
              serviceId: operatorDetail?.ServiceId,
              billDetails: rechargeData,
              operatorCategory: operatorDetail?.categoryId,
              ord: orderId,
            },
          );
        }

        console.log('Recharge response:', rechargeRes);
        navigation.replace('Success', {
          res: rechargeRes,
          rechargeData,
          operatorDetail,
          from,
          amount,
          orderId,
        });
      } catch (error) {
        console.error('Recharge trigger error after payment success:', error);
        navigation.replace('Success', {
          res: { Data: { status: 'Pending', orderId } },
          rechargeData,
          operatorDetail,
          from,
          amount,
          orderId,
        });
      }
    },
    [
      amount,
      from,
      isPrePaid,
      isZaakpay,
      navigation,
      operatorDetail,
      orderId,
      rechargeData,
    ],
  );

  // ----------------------------------------
  // RUN POLL CHECK (forward declaration reference helper)
  // ----------------------------------------
  const runPollCheckRef = useRef(null);

  // ----------------------------------------
  // HANDLE PENDING OR SCHEDULE NEXT POLL
  // ----------------------------------------
  const handlePendingOrNextPoll = useCallback(() => {
    if (!isPollingRef.current) return;

    const elapsed = Date.now() - (pollingStartTimeRef.current || Date.now());
    console.log(
      `Polling elapsed time: ${elapsed}ms / ${MAX_POLL_DURATION}ms`,
    );

    // If 45 seconds have passed and still no return -> transition to Pending
    if (elapsed >= MAX_POLL_DURATION) {
      console.log(
        'Max polling duration (45s) reached with no definitive return. Marking transaction as Pending.',
      );
      stopPolling();
      navigation.replace('Success', {
        res: { Data: { status: 'Pending', orderId } },
        rechargeData,
        operatorDetail,
        from:
          from === 'wallet-topup'
            ? isZaakpay
              ? 'zaakpay-wallet-topup'
              : 'wallet-topup'
            : from,
        amount,
        orderId,
      });
    } else {
      // Poll again after 5 seconds
      pollingTimerRef.current = setTimeout(() => {
        if (runPollCheckRef.current) {
          runPollCheckRef.current();
        }
      }, POLL_INTERVAL);
    }
  }, [
    amount,
    from,
    isZaakpay,
    navigation,
    operatorDetail,
    orderId,
    rechargeData,
    stopPolling,
  ]);

  // ----------------------------------------
  // RUN POLL CHECK
  // ----------------------------------------
  const runPollCheck = useCallback(async () => {
    if (!isPollingRef.current) return;

    try {
      console.log(`Polling gateway status (orderId: ${orderId})...`);
      let statusRes;

      if (isZaakpay) {
        statusRes = await postData('api/payment/zaakpay/status', { orderId });
      } else {
        statusRes = await postData('api/payment/upi/tenz-status', { orderId });
      }

      console.log('Gateway poll response:', statusRes);

      const rawStatus =
        statusRes?.Data?.txnStatus ||
        statusRes?.Data?.status ||
        statusRes?.txnStatus ||
        statusRes?.status ||
        '';
      const normalizedStatus = String(rawStatus).trim().toUpperCase();

      // 1️⃣ SUCCESS
      if (
        normalizedStatus === 'SUCCESS' ||
        normalizedStatus === 'TXN_SUCCESS'
      ) {
        console.log('Gateway returned SUCCESS!');
        stopPolling();
        await handlePaymentSuccess(statusRes);
        return;
      }

      // 2️⃣ EXPLICIT FAILURE
      if (
        normalizedStatus === 'FAILURE' ||
        normalizedStatus === 'FAILED' ||
        normalizedStatus === 'TXN_FAILURE' ||
        normalizedStatus === 'TXN_FAILED'
      ) {
        console.log('Gateway returned FAILURE:', normalizedStatus);
        stopPolling();
        navigation.replace('Success', {
          res: statusRes || { Data: { status: 'Failed', orderId } },
          rechargeData,
          operatorDetail,
          from,
          amount,
          orderId,
        });
        return;
      }

      // 3️⃣ STILL NO RETURN / PENDING / PROCESSING
      console.log(
        'Gateway status still pending/processing:',
        normalizedStatus || 'NO_RETURN',
      );
      handlePendingOrNextPoll();
    } catch (err) {
      console.warn('Gateway poll check error:', err?.message);
      handlePendingOrNextPoll();
    }
  }, [
    handlePaymentSuccess,
    handlePendingOrNextPoll,
    isZaakpay,
    navigation,
    operatorDetail,
    orderId,
    rechargeData,
    from,
    amount,
    stopPolling,
  ]);

  useEffect(() => {
    runPollCheckRef.current = runPollCheck;
  }, [runPollCheck]);

  // ----------------------------------------
  // START POLLING (Poll after 5 sec till 45 sec)
  // ----------------------------------------
  const startPolling = useCallback(() => {
    if (isPollingRef.current) {
      console.log('Polling already active, ignoring duplicate trigger');
      return;
    }

    console.log(
      `Starting payment gateway polling for orderId: ${orderId}. Checking after 5s till 45s...`,
    );
    isPollingRef.current = true;
    setIsPolling(true);
    pollingStartTimeRef.current = Date.now();

    // First poll check after 5 seconds
    pollingTimerRef.current = setTimeout(() => {
      if (runPollCheckRef.current) {
        runPollCheckRef.current();
      }
    }, POLL_INTERVAL);
  }, [orderId]);

  // ----------------------------------------
  // MAIN REQUEST HANDLER (WebView Navigation)
  // ----------------------------------------
  const handleRequest = useCallback(
    event => {
      const url = event.url;
      console.log('URL Triggered:', url);

      // 1️⃣ intent:// → upi:// conversion
      if (url.startsWith('intent://')) {
        try {
          const newUrl = url.replace('intent://', 'upi://');
          awaitingPaymentRef.current = true;
          Linking.openURL(newUrl).catch(err => {
            console.log('Intent open error:', err);
            awaitingPaymentRef.current = false;
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
        awaitingPaymentRef.current = true;
        Linking.openURL(url).catch(() => {
          awaitingPaymentRef.current = false;
          Alert.alert(
            'UPI App Missing',
            'Please install a UPI-supported app to continue.',
          );
        });
        return false;
      }

      // 3️⃣ Zaakpay callback redirect detection
      if (
        url.includes('zaakpay/callback') ||
        url.includes('api.yarapay.techember.in/api/payment/zaakpay')
      ) {
        console.log('Zaakpay callback detected:', url);
        startPolling();
        return false;
      }

      // 4️⃣ Wallet top-up redirect (Case-insensitive check)
      const isRedirect = url
        .toLowerCase()
        .includes('yaarapay.com/payment-receipt');
      if (isRedirect) {
        console.log('Detected Redirect to Receipt URL');
        startPolling();
        return false;
      }

      // 5️⃣ Recharge payment success callback
      if (url.includes('payment-success')) {
        console.log('Detected payment-success URL');
        startPolling();
        return false;
      }

      // 6️⃣ Payment explicitly failed
      if (url.includes('payment-failed')) {
        stopPolling();
        navigation.replace('Success', {
          res: { Data: { status: 'Failed', orderId } },
          from,
          rechargeData,
          operatorDetail,
          amount,
          orderId,
        });
        return false;
      }

      return true;
    },
    [amount, from, navigation, operatorDetail, orderId, rechargeData, startPolling, stopPolling],
  );

  // ----------------------------------------
  // APP STATE: Resume verification when user returns from UPI app
  // ----------------------------------------
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log(
          'App has come to the foreground! awaitingPaymentRef=',
          awaitingPaymentRef.current,
        );

        if (awaitingPaymentRef.current && !isPollingRef.current) {
          startPolling();
        }
      }
      appState.current = nextAppState;
    });

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isPollingRef.current) {
          return true; // Prevent going back while polling
        }
        return false;
      },
    );

    return () => {
      subscription.remove();
      backHandler.remove();
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      isPollingRef.current = false;
    };
  }, [startPolling]);

  // Build Zaakpay 3DS HTML form POST source if needed
  const webviewSource = (() => {
    if (isZaakpay && bankPostData && Object.keys(bankPostData).length > 0) {
      const fields = Object.entries(bankPostData)
        .map(
          ([k, v]) =>
            `<input type="hidden" name="${k}" value="${String(v).replace(
              /"/g,
              '&quot;',
            )}" />`,
        )
        .join('');
      const html = `<!DOCTYPE html><html><body onload="document.forms[0].submit()">
        <form method="POST" action="${paymentUrl}">${fields}</form>
        <p style="font-family:sans-serif;text-align:center;padding-top:40px">Redirecting to bank...</p>
      </body></html>`;
      return { html };
    }
    return { uri: paymentUrl };
  })();

  return (
    <View style={styles.container}>
      <WebView
        source={webviewSource}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onShouldStartLoadWithRequest={handleRequest}
        startInLoadingState
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);

          // If it's our dummy redirect URL failing DNS, treat it as a trigger to poll
          if (
            nativeEvent.url?.toLowerCase().includes('yaarapay.com') ||
            nativeEvent.description?.includes('ERR_NAME_NOT_RESOLVED')
          ) {
            console.log(
              'Caught DNS error for redirect URL, starting polling...',
            );
            startPolling();
          }
        }}
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color="#008CFF"
            style={styles.loader}
          />
        )}
      />

      {/* Polling verification overlay */}
      {isPolling && (
        <View style={styles.pollingOverlay}>
          <View style={styles.pollingBox}>
            <ActivityIndicator size="large" color="#471d7d" />
            <Text style={styles.pollingTitle}>Verifying Payment</Text>
            <Text style={styles.pollingSubtitle}>
              Please wait while we confirm your payment with the gateway. Do not close the app or press back.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    marginTop: 20,
  },
  pollingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
    paddingHorizontal: 24,
  },
  pollingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  pollingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 18,
    marginBottom: 8,
  },
  pollingSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
