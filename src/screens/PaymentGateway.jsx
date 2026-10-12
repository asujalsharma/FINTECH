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

      // 3️⃣ Wallet top-up & Callback redirects
      const isReceiptRedirect =
        url.toLowerCase().includes('payment-receipt') ||
        url.toLowerCase().includes('payment-callback') ||
        url.toLowerCase().includes('donation/receipt') ||
        url.toLowerCase().includes('sarvana.com/payment-receipt');

      if (isReceiptRedirect) {
        console.log('Detected Redirect to Receipt URL');
        if (from === 'fund-account-reg') {
          handleFundAccountRegResult();
        } else if (from === 'sahayog-donation') {
          handleSahayogDonationResult();
        } else {
          handleWalletTopupResult();
        }
        return false;
      }

      // 4️⃣ Recharge payment success callback
      if (url.includes('payment-success')) {
        if (from === 'fund-account-reg') {
          handleFundAccountRegResult();
        } else if (from === 'sahayog-donation') {
          handleSahayogDonationResult();
        } else {
          verifyAndRecharge();
        }
        return false;
      }

      // 5️⃣ Payment explicitly failed
      if (url.includes('payment-failed')) {
        navigation.replace('Success', {
          res: { Data: { status: 'Failed', orderId } },
          from,
          rechargeData,
          operatorDetail,
          amount,
          orderId,
          isPrePaid,
          category,
        });
        return false;
      }

      return true;
    },
    [from, orderId, rechargeData, operatorDetail, amount],
  );

  // ----------------------------------------
  // FUND ACCOUNT REGISTRATION RESULT HANDLER
  // ----------------------------------------
  const handleFundAccountRegResult = async (isPolling = false) => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    try {
      const verifyRes = await postData('/api/fund-account/register/verify-payment', {
        orderId,
      });
      console.log('FUND REG VERIFY RESULT:', verifyRes);

      const pStatus = (
        verifyRes?.Data?.paymentStatus ||
        verifyRes?.paymentStatus ||
        verifyRes?.Data?.progress?.paymentStatus ||
        ''
      ).toLowerCase();

      const isPaid =
        pStatus === 'paid' ||
        pStatus === 'success' ||
        pStatus === 'completed' ||
        verifyRes?.Data?.progress?.isPaymentComplete === true ||
        verifyRes?.Data?.isPaymentComplete === true;

      if (isPaid) {
        navigation.replace('FundAccountStep3', {
          paymentVerified: true,
          vivahSahayogId: verifyRes?.Data?.vivahSahayogId || verifyRes?.Data?.account?.vivahSahayogId,
          fundAccountId: verifyRes?.Data?.fundAccountId || route.params?.fundAccountId,
        });
        return;
      }

      // If this is a background poll while user is still on the gateway, KEEP WEBVIEW OPEN
      if (isPolling) {
        console.log('Registration payment still pending in polling; keeping WebView open.');
        return;
      }

      // If user was redirected back to callback/receipt but payment is not complete yet
      if (pStatus === 'failed') {
        Alert.alert('भुगतान विफल', 'आपका भुगतान पूरा नहीं हो सका। कृपया पुनः प्रयास करें।');
        navigation.replace('FundAccountStep3', {
          paymentVerified: false,
          orderId,
        });
      } else {
        Alert.alert(
          'भुगतान प्रक्रियाधीन (Pending)',
          verifyRes?.Remarks || 'भुगतान अभी प्रक्रियाधीन है। यदि आपके खाते से राशि कट गई है, तो कृपया कुछ क्षण प्रतीक्षा करें।',
          [
            {
              text: 'ठीक है',
              onPress: () => {
                navigation.replace('FundAccountStep3', {
                  paymentVerified: false,
                  paymentPending: true,
                  orderId,
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.log('Fund account verify error:', error);
      if (isPolling) return;
      navigation.replace('FundAccountStep3', {
        paymentVerified: false,
        paymentPending: true,
        orderId,
      });
    } finally {
      verifyingRef.current = false;
      setAwaitingPayment(false);
    }
  };

  // ----------------------------------------
  // SAHAYOG DONATION RESULT HANDLER
  // ----------------------------------------
  const handleSahayogDonationResult = async (isPolling = false) => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    try {
      const verifyRes = await postData('/api/donation/verify', {
        orderId,
      });
      console.log('DONATION VERIFY RESULT:', verifyRes);

      const status = (
        verifyRes?.Data?.status ||
        verifyRes?.status ||
        ''
      ).toLowerCase();

      const isSuccess =
        status === 'success' ||
        status === 'completed' ||
        status === 'paid' ||
        verifyRes?.Data?.isPaid === true;

      if (isSuccess) {
        navigation.replace('DonationReceipt', {
          receipt: verifyRes?.Data || verifyRes?.data || verifyRes,
          orderId,
          amount,
          paymentUrl: route.params?.paymentUrl || route.params?.url,
        });
        return;
      }

      if (isPolling) {
        console.log('Donation payment still pending in polling; keeping WebView open.');
        return;
      }

      navigation.replace('DonationReceipt', {
        receipt: verifyRes?.Data || { status: 'Pending', orderId, amount },
        orderId,
        amount,
        paymentUrl: route.params?.paymentUrl || route.params?.url,
      });
    } catch (error) {
      console.log('Donation verify error:', error);
      if (isPolling) return;
      navigation.replace('DonationReceipt', {
        orderId,
        amount,
        paymentUrl: route.params?.paymentUrl || route.params?.url,
      });
    } finally {
      verifyingRef.current = false;
      setAwaitingPayment(false);
    }
  };

  // ----------------------------------------
  // UPIGATEWAY RESULT HANDLER
  // ----------------------------------------
  const handleWalletTopupResult = async (isPolling = false) => {
    try {
      const verifyRes = await postData('api/payment/upi/tenz-status', {
        orderId,
      });

      console.log('TOPUP VERIFY RESULT:', verifyRes);

      const rawTxnStatus = (
        verifyRes?.Data?.txnStatus ||
        verifyRes?.Data?.status ||
        verifyRes?.status ||
        ''
      ).toUpperCase();

      const isSuccess =
        rawTxnStatus === 'SUCCESS' ||
        rawTxnStatus === 'COMPLETED' ||
        rawTxnStatus === 'PAID';

      if (isPolling && !isSuccess) {
        // While polling in WebView, do not close WebView if still pending
        return;
      }

      navigation.replace('Success', {
        res: verifyRes,
        from: 'wallet-topup',
        amount,
        orderId,
      });
    } catch (error) {
      console.log(error);
      if (isPolling) return;
      Alert.alert(
        'Error',
        'Payment succeeded but wallet update failed. Please contact support.',
      );
      navigation.replace('Success', {
        res: { Data: { status: 'Pending', orderId: orderId } },
        from: 'wallet-topup',
        amount,
        orderId,
      });
    } finally {
      setAwaitingPayment(false);
    }
  };

  // ----------------------------------------
  // VERIFY PAYMENT THEN RECHARGE
  // (unchanged except clear awaiting flag)
  // ----------------------------------------
  const verifyAndRecharge = async (isPolling = false) => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;

    try {
      const verifyRes = await postData('api/payment/upi/tenz-status', {
        orderId,
      });

      console.log('VERIFY PAYMENT:', verifyRes);

      if (verifyRes?.Data?.txnStatus !== 'SUCCESS') {
        if (isPolling) {
          return;
        }
        navigation.replace('Success', {
          res: verifyRes,
          rechargeData,
          operatorDetail,
          from,
          amount,
          orderId,
          isPrePaid,
          category,
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
        orderId,
        isPrePaid,
        category,
      });
    } catch (error) {
      console.log(error);

      navigation.replace('Success', {
        res: { Data: { status: 'Pending', orderId: orderId } },
        rechargeData,
        operatorDetail,
        from,
        amount,
        orderId,
        isPrePaid,
        category,
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
      } else if (from === 'fund-account-reg') {
        handleFundAccountRegResult();
      } else if (from === 'sahayog-donation') {
        handleSahayogDonationResult();
      } else {
        verifyAndRecharge();
      }
      checkTimeoutRef.current = null;
    }, CHECK_DELAY);
  };

  // ----------------------------------------
  // POLLING: Check status every 10 seconds while WebView is open
  // ----------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (!verifyingRef.current && !awaitingPayment) {
        console.log('Polling payment status...');
        if (from === 'wallet-topup') {
          handleWalletTopupResult(true);
        } else if (from === 'fund-account-reg') {
          handleFundAccountRegResult(true);
        } else if (from === 'sahayog-donation') {
          handleSahayogDonationResult(true);
        } else {
          verifyAndRecharge(true);
        }
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [from, orderId, rechargeData, operatorDetail, awaitingPayment]);

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
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);

          // If it's our dummy redirect URL failing DNS, treat it as a trigger to verify
          if (
            nativeEvent.url?.toLowerCase().includes('Sarvana.com') ||
            nativeEvent.description?.includes('ERR_NAME_NOT_RESOLVED')
          ) {
            console.log('Caught DNS error for redirect URL, handling results...');
            if (from === 'wallet-topup') {
              handleWalletTopupResult();
            } else if (from === 'fund-account-reg') {
              handleFundAccountRegResult();
            } else if (from === 'sahayog-donation') {
              handleSahayogDonationResult();
            } else {
              verifyAndRecharge();
            }
          }
        }}
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
