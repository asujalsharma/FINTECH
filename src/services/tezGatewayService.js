import { postData, getData } from '../API';
import { Linking, Alert } from 'react-native';

/**
 * TezGateway UPI Service for OnlineAdda
 * Handles order creation, status verification polling, and UPI intent launching.
 */

export const createTezGatewayOrder = async ({
  amount,
  customer_mobile,
  order_id,
  redirect_url,
  remark1,
  remark2,
}) => {
  const numAmount = Number(amount);
  if (!numAmount || numAmount < 10) {
    const errorMsg = 'Please enter a minimum amount of ₹10';
    console.error('❌ [TezGateway]', errorMsg);
    throw new Error(errorMsg);
  }

  const generatedOrderId =
    order_id || `ORD_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  const payload = {
    amount: numAmount,
    customer_mobile: String(customer_mobile || '9876543210'),
    order_id: generatedOrderId,
    orderId: generatedOrderId, // for compatibility with legacy route
    redirect_url:
      redirect_url || 'https://api.onlineadda.techember.in/api/tezgateway/return',
    redirectUrl:
      redirect_url || 'https://api.onlineadda.techember.in/api/tezgateway/return',
    remark1: remark1 || 'Wallet Topup',
    remark2: remark2 || 'onlineadda',
    note: remark1 || 'Wallet Topup',
  };

  try {
    console.log('🚀 [TezGateway] Creating Order via /api/tezgateway/create-order:', payload);
    const res = await postData('api/tezgateway/create-order', payload);
    console.log('✅ [TezGateway] Order Response:', res);
    return normalizeOrderResponse(res, generatedOrderId, amount);
  } catch (err) {
    console.warn(
      '⚠️ [TezGateway] /api/tezgateway/create-order failed, attempting fallback /api/payment/upi/create-order:',
      err?.response?.data || err?.message,
    );

    try {
      const fallbackRes = await postData('api/payment/upi/create-order', payload);
      console.log('✅ [TezGateway Fallback] Order Response:', fallbackRes);
      return normalizeOrderResponse(fallbackRes, generatedOrderId, amount);
    } catch (fallbackErr) {
      console.error(
        '❌ [TezGateway Fallback] Failed to create UPI order:',
        fallbackErr?.response?.data || fallbackErr?.message,
      );
      throw fallbackErr?.response?.data || fallbackErr;
    }
  }
};

/**
 * Normalizes backend order creation response into consistent structure
 */
const normalizeOrderResponse = (res, fallbackOrderId, fallbackAmount) => {
  const dataNode = res?.Data || res?.data || res || {};
  const innerData = dataNode?.data || {};

  const orderId =
    dataNode?.orderId ||
    dataNode?.order_id ||
    res?.orderId ||
    res?.order_id ||
    fallbackOrderId;

  const payment_url =
    dataNode?.payment_url ||
    dataNode?.paymentUrl ||
    res?.payment_url ||
    res?.paymentUrl ||
    '';

  const amount = dataNode?.amount || res?.amount || fallbackAmount;
  const method = dataNode?.method || res?.method || 'UPI';

  const phonepe_link =
    innerData?.phonepe_link ||
    dataNode?.phonepe_link ||
    res?.phonepe_link ||
    '';
  const gpay_link =
    innerData?.gpay_link ||
    dataNode?.gpay_link ||
    res?.gpay_link ||
    '';
  const paytm_link =
    innerData?.paytm_link ||
    dataNode?.paytm_link ||
    res?.paytm_link ||
    '';
  const bhim_link =
    innerData?.bhim_link ||
    dataNode?.bhim_link ||
    res?.bhim_link ||
    payment_url ||
    '';
  const qr_image =
    innerData?.qr_image ||
    dataNode?.qr_image ||
    res?.qr_image ||
    '';

  return {
    raw: res,
    status: Boolean(res?.status ?? res?.Status ?? true),
    statusCode: res?.statusCode || 201,
    remarks: res?.Remarks || res?.remarks || res?.message || 'Order Created Successfully',
    orderId,
    payment_url,
    amount,
    method,
    upiLinks: {
      phonepe_link,
      gpay_link,
      paytm_link,
      bhim_link,
      qr_image,
    },
  };
};

/**
 * Verifies the status of an existing order with TezGateway
 * Backend automatically credits wallet on confirmed SUCCESS
 */
export const checkTezGatewayOrder = async orderId => {
  if (!orderId) {
    throw new Error('Order ID is required to check status');
  }

  const payload = {
    order_id: String(orderId),
    orderId: String(orderId),
  };

  try {
    const res = await postData('api/tezgateway/check-order', payload);
    return normalizeStatusResponse(res, orderId);
  } catch (err) {
    console.warn(
      '⚠️ [TezGateway] /api/tezgateway/check-order failed, attempting fallback /api/payment/upi/check-status:',
      err?.response?.data || err?.message,
    );

    try {
      const fallbackRes = await postData('api/payment/upi/check-status', payload);
      return normalizeStatusResponse(fallbackRes, orderId);
    } catch (fallbackErr) {
      console.error(
        '❌ [TezGateway] check-order status request failed:',
        fallbackErr?.response?.data || fallbackErr?.message,
      );
      throw fallbackErr?.response?.data || fallbackErr;
    }
  }
};

/**
 * Normalizes backend status response
 */
const normalizeStatusResponse = (res, requestedOrderId) => {
  const dataNode = res?.Data || res?.data || res || {};

  const rawStatus =
    dataNode?.txnStatus ||
    dataNode?.status ||
    res?.txnStatus ||
    res?.status ||
    'PENDING';

  const normalizedStatus = String(rawStatus).trim().toUpperCase();

  const isSuccess =
    normalizedStatus === 'SUCCESS' ||
    normalizedStatus === 'TXN_SUCCESS' ||
    normalizedStatus === 'COMPLETED';

  const isFailed =
    normalizedStatus === 'FAIL' ||
    normalizedStatus === 'FAILED' ||
    normalizedStatus === 'FAILURE' ||
    normalizedStatus === 'TXN_FAILURE' ||
    normalizedStatus === 'TXN_FAILED';

  const isPending = !isSuccess && !isFailed;

  return {
    raw: res,
    status: Boolean(res?.status ?? res?.Status ?? true),
    statusCode: res?.statusCode || 200,
    remarks: res?.Remarks || res?.remarks || res?.message || 'Order Status Fetched',
    orderId: dataNode?.orderId || dataNode?.order_id || requestedOrderId,
    amount: dataNode?.amount || res?.amount,
    txnStatus: isSuccess ? 'SUCCESS' : isFailed ? 'FAIL' : 'PENDING',
    rawTxnStatus: normalizedStatus,
    utr: dataNode?.utr || res?.utr || '',
    isSuccess,
    isFailed,
    isPending,
  };
};

/**
 * Helper to launch external UPI app link safely
 */
export const openUpiApp = async (upiUrl, appName = 'UPI App') => {
  if (!upiUrl) {
    Alert.alert(
      'Payment Link Unavailable',
      `Direct link for ${appName} is not available. Please try the QR code or web payment option.`,
    );
    return false;
  }

  try {
    const supported = await Linking.canOpenURL(upiUrl);
    if (supported) {
      await Linking.openURL(upiUrl);
      return true;
    } else {
      // Some Android devices return false for canOpenURL for custom schemes, but openURL still works
      await Linking.openURL(upiUrl);
      return true;
    }
  } catch (err) {
    console.warn(`[TezGateway] Could not launch ${appName}:`, err?.message);
    Alert.alert(
      `${appName} Not Found`,
      `We could not open ${appName} directly. Please ensure the app is installed or choose another UPI app / Scan QR.`,
    );
    return false;
  }
};

/**
 * Admin balance fetch
 */
export const getTezGatewayAdminBalance = async () => {
  return await getData('api/tezgateway/balance');
};
