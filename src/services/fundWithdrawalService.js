import axios from 'axios';
import { getData, postData } from '../API';

/**
 * Service for Scheme Fund Account Withdrawal operations.
 * Backend Base URL: /api/fund-account/withdraw (with fallback to /api/fund-withdrawal)
 */

/**
 * Fetch eligibility, balance limits, saved banks, and notice for a fund account.
 * GET /api/fund-account/withdraw/eligibility?fundAccountId=<id>
 */
export const fetchWithdrawalEligibility = async (fundAccountId) => {
  const endpoints = [
    '/api/fund-account/withdraw/eligibility',
    '/api/fund-withdrawal/eligibility',
    '/api/fund-account/withdrawal/eligibility',
  ];

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const res = await getData(endpoint, { fundAccountId });
      if (res && (res.Status === 'SUCCESS' || res.Status === true || res.Data || res.data)) {
        return res.Data || res.data || res;
      }
    } catch (err) {
      lastError = err;
      // If 404 or other error, try next endpoint
      if (err?.response?.status !== 404) {
        break;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }
  return null;
};

/**
 * Submit a new withdrawal request to admin.
 * POST /api/fund-account/withdraw/request
 */
export const submitWithdrawalRequest = async (payload) => {
  const endpoints = [
    '/api/fund-account/withdraw/request',
    '/api/fund-withdrawal/request',
    '/api/fund-account/withdrawal/request',
  ];

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const res = await postData(endpoint, payload);
      if (res && (res.Status === 'SUCCESS' || res.Status === true || res.Data || res.data || res.message)) {
        return res.Data || res.data || res;
      }
    } catch (err) {
      lastError = err;
      if (err?.response?.status !== 404) {
        break;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }
  return null;
};

/**
 * Fetch withdrawal request history with pagination and status filtering.
 * GET /api/fund-account/withdraw/my-requests?page=1&limit=20&status=all|pending|approved|rejected
 */
export const fetchMyWithdrawalRequests = async ({ page = 1, limit = 20, status = 'all', fundAccountId } = {}) => {
  const endpoints = [
    '/api/fund-account/withdraw/my-requests',
    '/api/fund-withdrawal/my-requests',
    '/api/fund-account/withdrawal/my-requests',
  ];

  const params = { page, limit, status };
  if (fundAccountId) {
    params.fundAccountId = fundAccountId;
  }

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const res = await getData(endpoint, params);
      if (res && (res.Status === 'SUCCESS' || res.Status === true || res.Data || res.data || Array.isArray(res))) {
        return res.Data || res.data || res;
      }
    } catch (err) {
      lastError = err;
      if (err?.response?.status !== 404) {
        break;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }
  return { requests: [], total: 0 };
};

/**
 * Fetch details of a single withdrawal request.
 * GET /api/fund-account/withdraw/:id
 */
export const fetchWithdrawalRequestDetails = async (requestId) => {
  if (!requestId) return null;

  const endpoints = [
    `/api/fund-account/withdraw/${requestId}`,
    `/api/fund-withdrawal/${requestId}`,
    `/api/fund-account/withdrawal/${requestId}`,
  ];

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const res = await getData(endpoint);
      if (res && (res.Status === 'SUCCESS' || res.Status === true || res.Data || res.data)) {
        return res.Data || res.data || res;
      }
    } catch (err) {
      lastError = err;
      if (err?.response?.status !== 404) {
        break;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }
  return null;
};

/**
 * Cancel a pending withdrawal request.
 * POST /api/fund-account/withdraw/cancel/:id
 */
export const cancelWithdrawalRequest = async (requestId, reason = '') => {
  if (!requestId) return null;

  const endpoints = [
    `/api/fund-account/withdraw/cancel/${requestId}`,
    `/api/fund-withdrawal/cancel/${requestId}`,
    `/api/fund-account/withdrawal/cancel/${requestId}`,
  ];

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const res = await postData(endpoint, { reason });
      if (res && (res.Status === 'SUCCESS' || res.Status === true || res.Data || res.data || res.message)) {
        return res.Data || res.data || res;
      }
    } catch (err) {
      lastError = err;
      if (err?.response?.status !== 404) {
        break;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }
  return null;
};

/**
 * Lookup Indian bank branch information by IFSC code using public Razorpay API.
 * e.g. IFSC "SBIN0001234"
 */
export const lookupIfscDetails = async (ifscCode) => {
  if (!ifscCode || typeof ifscCode !== 'string') return null;
  const clean = ifscCode.trim().toUpperCase();
  if (clean.length !== 11) return null;

  try {
    const res = await axios.get(`https://ifsc.razorpay.com/${clean}`, { timeout: 6000 });
    if (res?.data) {
      return {
        bankName: res.data.BANK || '',
        branchName: res.data.BRANCH || '',
        city: res.data.CITY || '',
        state: res.data.STATE || '',
        ifsc: res.data.IFSC || clean,
      };
    }
  } catch (err) {
    console.log('IFSC lookup error:', err?.message);
  }
  return null;
};
