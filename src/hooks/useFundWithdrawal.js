import { useState, useCallback } from 'react';
import {
  fetchWithdrawalEligibility,
  submitWithdrawalRequest,
  fetchMyWithdrawalRequests,
  fetchWithdrawalRequestDetails,
  cancelWithdrawalRequest,
  lookupIfscDetails,
} from '../services/fundWithdrawalService';

export default function useFundWithdrawal() {
  const [eligibility, setEligibility] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState(null);

  const [requests, setRequests] = useState([]);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [currentRequestLoading, setCurrentRequestLoading] = useState(false);

  /**
   * Fetch live eligibility data for the specified fund account
   */
  const loadEligibility = useCallback(async (fundAccountId) => {
    if (!fundAccountId) return null;
    setEligibilityLoading(true);
    setEligibilityError(null);
    try {
      const data = await fetchWithdrawalEligibility(fundAccountId);
      if (data) {
        setEligibility(data);
      }
      return data;
    } catch (err) {
      const msg = err?.response?.data?.Remarks || err?.response?.data?.message || err?.message || 'पात्रता विवरण प्राप्त करने में असमर्थ।';
      setEligibilityError(msg);
      console.log('Error fetching withdrawal eligibility:', err);
      return null;
    } finally {
      setEligibilityLoading(false);
    }
  }, []);

  /**
   * Fetch withdrawal requests history with status filter and pagination
   */
  const loadRequests = useCallback(async ({
    page = 1,
    limit = 20,
    status = 'all',
    fundAccountId,
    append = false,
  } = {}) => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const data = await fetchMyWithdrawalRequests({ page, limit, status, fundAccountId });
      let list = [];
      let total = 0;

      if (Array.isArray(data)) {
        list = data;
        total = data.length;
      } else if (data?.requests && Array.isArray(data.requests)) {
        list = data.requests;
        total = data.total !== undefined ? Number(data.total) : data.requests.length;
      } else if (data?.Data?.requests) {
        list = data.Data.requests;
        total = data.Data.total || list.length;
      } else if (data?.items && Array.isArray(data.items)) {
        list = data.items;
        total = data.total || list.length;
      }

      setRequests((prev) => (append ? [...prev, ...list] : list));
      setRequestsTotal(total);
      return { requests: list, total };
    } catch (err) {
      const msg = err?.response?.data?.Remarks || err?.response?.data?.message || err?.message || 'निकासी इतिहास लोड करने में त्रुटि।';
      setRequestsError(msg);
      return { requests: [], total: 0 };
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  /**
   * Submit a new withdrawal request
   */
  const submitRequest = useCallback(async (payload) => {
    setSubmitting(true);
    try {
      const res = await submitWithdrawalRequest(payload);
      // Automatically refresh eligibility if fundAccountId is available
      if (payload?.fundAccountId) {
        loadEligibility(payload.fundAccountId).catch(() => {});
      }
      return res;
    } catch (err) {
      const msg = err?.response?.data?.Remarks || err?.response?.data?.message || err?.message || 'निकासी अनुरोध सबमिट करने में विफल।';
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  }, [loadEligibility]);

  /**
   * Cancel an existing pending request
   */
  const cancelRequest = useCallback(async (requestId, reason = '', fundAccountId) => {
    setCancelling(true);
    try {
      const res = await cancelWithdrawalRequest(requestId, reason);
      // Update local request status
      setRequests((prev) =>
        prev.map((r) =>
          (r._id === requestId || r.id === requestId || r.requestId === requestId)
            ? { ...r, status: 'cancelled', isCancelled: true }
            : r
        )
      );
      if (fundAccountId) {
        loadEligibility(fundAccountId).catch(() => {});
      }
      return res;
    } catch (err) {
      const msg = err?.response?.data?.Remarks || err?.response?.data?.message || err?.message || 'अनुरोध रद्द करने में विफल।';
      throw new Error(msg);
    } finally {
      setCancelling(false);
    }
  }, [loadEligibility]);

  /**
   * Load details for a single request
   */
  const loadRequestDetails = useCallback(async (requestId) => {
    if (!requestId) return null;
    setCurrentRequestLoading(true);
    try {
      const data = await fetchWithdrawalRequestDetails(requestId);
      setCurrentRequest(data);
      return data;
    } catch (err) {
      console.log('Error loading withdrawal request details:', err);
      return null;
    } finally {
      setCurrentRequestLoading(false);
    }
  }, []);

  /**
   * Helper to validate entered withdrawal amount against eligibility rules
   */
  const validateWithdrawalAmount = (rawAmount, elig) => {
    const num = Number(rawAmount);
    const walletBalance = Number(elig?.walletBalance || 0);
    const minBalReq = Number(elig?.minAccountBalanceRequired || 0);
    const maxWithdrawable = Number(
      elig?.maxWithdrawableAmount !== undefined
        ? elig.maxWithdrawableAmount
        : Math.max(0, walletBalance - minBalReq - Number(elig?.pendingWithdrawalAmount || 0))
    );
    const minWithdrawal = Number(elig?.minWithdrawalAmount || 100);
    const maxWithdrawal = Number(elig?.maxWithdrawalAmount || 1000000);

    if (isNaN(num) || num <= 0) {
      return {
        valid: false,
        error: 'कृपया एक मान्य राशि दर्ज करें।',
        projectedBalance: walletBalance,
      };
    }

    if (num < minWithdrawal) {
      return {
        valid: false,
        error: `न्यूनतम निकासी राशि ₹${minWithdrawal.toLocaleString('en-IN')} है।`,
        projectedBalance: walletBalance - num,
      };
    }

    if (num > maxWithdrawal) {
      return {
        valid: false,
        error: `अधिकतम निकासी सीमा ₹${maxWithdrawal.toLocaleString('en-IN')} है।`,
        projectedBalance: walletBalance - num,
      };
    }

    if (num > maxWithdrawable) {
      return {
        valid: false,
        error: `आप अधिकतम ₹${maxWithdrawable.toLocaleString('en-IN')} ही निकाल सकते हैं।`,
        projectedBalance: walletBalance - num,
      };
    }

    const projectedBalance = walletBalance - num;
    if (projectedBalance < minBalReq) {
      return {
        valid: false,
        error: `खाते में आवश्यक न्यूनतम शेष राशि ₹${minBalReq.toLocaleString('en-IN')} बनाए रखना अनिवार्य है।`,
        projectedBalance,
      };
    }

    return {
      valid: true,
      error: null,
      projectedBalance,
    };
  };

  return {
    eligibility,
    setEligibility,
    eligibilityLoading,
    eligibilityError,
    loadEligibility,

    requests,
    setRequests,
    requestsTotal,
    requestsLoading,
    requestsError,
    loadRequests,

    submitting,
    submitRequest,

    cancelling,
    cancelRequest,

    currentRequest,
    currentRequestLoading,
    loadRequestDetails,

    validateWithdrawalAmount,
    lookupIfscDetails,
  };
}
