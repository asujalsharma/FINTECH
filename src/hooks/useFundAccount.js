import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getData, postData } from '../API/index';
import { API_BASE_URL } from '../API/index';
import { store } from '../redux/store';

const FUND_ACCOUNT_ID_KEY = '@vivahSahayog_fundAccountId';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const calculateAge = dob => {
  if (!dob) return '';
  const [day, month, year] = dob.split('/').map(Number);
  if (!day || !month || !year) return '';
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years < 0) return '';
  return months > 0 ? `${years} Year ${months} Month` : `${years} Year`;
};

/**
 * Calculates years left for fund account withdrawal.
 * Rule: Applicant's age must be greater than 20 (> 20, i.e. 21 years minimum) to withdraw funds.
 */
export const calculateWithdrawalEligibility = (dob, currentAgeStr) => {
  const MIN_WITHDRAWAL_AGE = 21; // Age must be strictly greater than 20 (> 20) -> reaches 21
  const today = new Date();
  let birthDate = null;
  let parsedAgeYears = null;
  let parsedAgeMonths = 0;

  if (dob && typeof dob === 'string') {
    const trimmed = dob.trim();
    if (trimmed.includes('/') || trimmed.includes('-')) {
      const delimiter = trimmed.includes('/') ? '/' : '-';
      const parts = trimmed.split(delimiter).map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        if (parts[0] > 1000) {
          // YYYY-MM-DD
          birthDate = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
          // DD-MM-YYYY or DD/MM/YYYY
          birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      }
    }
    if (!birthDate || isNaN(birthDate.getTime())) {
      const fallback = new Date(trimmed);
      if (!isNaN(fallback.getTime())) birthDate = fallback;
    }
  } else if (dob instanceof Date && !isNaN(dob.getTime())) {
    birthDate = dob;
  }

  if (birthDate && !isNaN(birthDate.getTime())) {
    let y = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    let d = today.getDate() - birthDate.getDate();
    if (d < 0) m--;
    if (m < 0) {
      y--;
      m += 12;
    }
    parsedAgeYears = Math.max(0, y);
    parsedAgeMonths = Math.max(0, m);
  } else if (currentAgeStr) {
    const match = String(currentAgeStr).match(/\d+/);
    if (match) {
      parsedAgeYears = parseInt(match[0], 10);
    }
  }

  if (parsedAgeYears === null || isNaN(parsedAgeYears)) {
    return {
      hasData: false,
      isEligible: false,
      yearsLeft: null,
      monthsLeft: null,
      currentAgeYears: null,
      targetAge: MIN_WITHDRAWAL_AGE,
      yearsLeftDisplay: '—',
      detailedText: 'आयु विवरण उपलब्ध नहीं',
      badgeText: '—',
      statusText: 'आयु विवरण प्रतीक्षारत',
      ruleText: 'आवेदक की आयु 20 वर्ष से अधिक होने पर ही फंड खाता राशि निकाली जा सकती है।',
    };
  }

  // If age > 20 (meaning >= 21)
  if (parsedAgeYears >= MIN_WITHDRAWAL_AGE) {
    return {
      hasData: true,
      isEligible: true,
      yearsLeft: 0,
      monthsLeft: 0,
      currentAgeYears: parsedAgeYears,
      targetAge: MIN_WITHDRAWAL_AGE,
      yearsLeftDisplay: '0 वर्ष (निकासी पात्र)',
      detailedText: 'निकासी हेतु पात्र (आयु 20 वर्ष से अधिक)',
      badgeText: 'निकासी उपलब्ध',
      statusText: 'पात्र (Eligible)',
      ruleText: 'आवेदक की आयु 20 वर्ष से अधिक हो चुकी है। फंड राशि निकासी के लिए उपलब्ध है।',
      withdrawalAgeText: '20 वर्ष से अधिक (> 20)',
    };
  }

  // Not yet eligible: calculate remaining years and months
  let yearsLeft = MIN_WITHDRAWAL_AGE - parsedAgeYears;
  let monthsLeft = 0;

  if (birthDate && !isNaN(birthDate.getTime())) {
    const targetDate = new Date(birthDate.getFullYear() + MIN_WITHDRAWAL_AGE, birthDate.getMonth(), birthDate.getDate());
    yearsLeft = targetDate.getFullYear() - today.getFullYear();
    monthsLeft = targetDate.getMonth() - today.getMonth();
    if (targetDate.getDate() < today.getDate()) {
      monthsLeft--;
    }
    if (monthsLeft < 0) {
      yearsLeft--;
      monthsLeft += 12;
    }
    if (yearsLeft < 0) yearsLeft = 0;
  }

  const roundedYearsLeft = Math.max(1, yearsLeft);
  const detailedText = monthsLeft > 0
    ? `${yearsLeft} वर्ष ${monthsLeft} माह शेष`
    : `${roundedYearsLeft} वर्ष शेष`;

  return {
    hasData: true,
    isEligible: false,
    yearsLeft: roundedYearsLeft,
    monthsLeft,
    currentAgeYears: parsedAgeYears,
    targetAge: MIN_WITHDRAWAL_AGE,
    yearsLeftDisplay: `${roundedYearsLeft} वर्ष शेष`,
    detailedText,
    badgeText: `${roundedYearsLeft} वर्ष शेष`,
    statusText: 'लॉक-इन (Lock-in)',
    ruleText: 'आवेदक की आयु 20 वर्ष से अधिक होने पर ही फंड राशि निकाली जा सकती है।',
    withdrawalAgeText: '20 वर्ष से अधिक (> 20 वर्ष)',
  };
};

export const sanitizeFundText = text => {
  if (!text || typeof text !== 'string') return text;
  let s = text.trim();
  if (/^(bulk|admin|admin\s*credit|bulk\s*credit|bulk\s*admin\s*credit|admin\s*bulk\s*credit)$/i.test(s)) {
    return 'Vivah Sahayog Welfare Grant Credit';
  }
  if (/^(initial\s*fund\s*credit|initial\s*credit|initial\s*balance|initial\s*fund)$/i.test(s)) {
    return 'Account Opening Fund Credit';
  }
  return s
    .replace(/bulk\s*admin\s*credit/gi, 'Vivah Sahayog Welfare Grant Credit')
    .replace(/admin\s*bulk\s*credit/gi, 'Vivah Sahayog Welfare Grant Credit')
    .replace(/admin\s*credit/gi, 'Vivah Sahayog Welfare Grant Credit')
    .replace(/bulk\s*credit/gi, 'Vivah Sahayog Welfare Grant Credit')
    .replace(/bulk\s*distribution/gi, 'Welfare Grant Credit')
    .replace(/bulk\s*transfer/gi, 'Welfare Grant Credit')
    .replace(/initial\s*fund\s*credit/gi, 'Account Opening Fund Credit')
    .replace(/initial\s*credit/gi, 'Account Opening Fund Credit')
    .replace(/initial\s*balance/gi, 'Account Opening Fund Credit')
    .replace(/\badmin\b/gi, 'Welfare Grant')
    .replace(/\bbulk\b/gi, 'Welfare Grant')
    .trim();
};

/**
 * Normalizes fund statement transactions to eliminate admin/bulk text.
 * Rule:
 * 1. Bulk / Admin Credit -> Display as "Vivah Sahayog Welfare Grant Credit"
 * 2. Initial Fund Credit -> Display as "Account Opening Fund Credit"
 */
export const normalizeFundStatement = (item, index = 0, allItems = [], initialBalance = null) => {
  if (!item || typeof item !== 'object') return item;

  const rawName = String(item.txnName || item.name || '').trim();
  const rawType = String(item.txnType || item.type || '').trim();
  const rawRemarks = String(item.remarks || '').trim();
  const rawDesc = String(item.txnDesc || item.description || '').trim();
  const rawCategory = String(item.category || item.source || '').trim();

  const combined = `${rawName} ${rawType} ${rawRemarks} ${rawDesc} ${rawCategory}`.toLowerCase();

  const isDebit =
    rawType.toLowerCase() === 'debit' ||
    combined.includes('debit') ||
    combined.includes('withdrawal') ||
    combined.includes('डेबिट') ||
    combined.includes('संवितरण');

  const rawAmount = item.txnAmount !== undefined ? item.txnAmount : (item.amount || 0);
  const amountNum = typeof rawAmount === 'number' ? rawAmount : parseFloat(rawAmount) || 0;

  const isInitialAmountMatch =
    Boolean(initialBalance && Number(initialBalance) === amountNum && (index === 0 || (allItems && index === allItems.length - 1)));

  const isInitialFund =
    !isDebit &&
    (combined.includes('initial') ||
     combined.includes('opening') ||
     combined.includes('account opening') ||
     combined.includes('खाता प्रारंभ') ||
     combined.includes('प्रारंभिक') ||
     combined.includes('registration grant') ||
     combined.includes('welcome') ||
     isInitialAmountMatch);

  const isBulkOrAdmin =
    !isDebit &&
    (combined.includes('bulk') ||
     combined.includes('admin') ||
     combined.includes('welfare') ||
     combined.includes('grant') ||
     combined.includes('कल्याण') ||
     combined.includes('सहयोग'));

  let cleanName = item.txnName || item.name;
  let cleanType = item.txnType || item.type;
  let cleanDesc = item.txnDesc || item.description;
  let cleanRemarks = item.remarks;
  let pillLabel = isDebit ? 'डेबिट' : 'क्रेडिट';

  if (isDebit) {
    cleanName = cleanName || 'फंड संवितरण (Debit)';
    cleanType = 'Debit';
    pillLabel = 'डेबिट';
    cleanDesc = sanitizeFundText(cleanDesc);
  } else if (isInitialFund) {
    cleanName = 'Account Opening Fund Credit';
    cleanType = 'Account Opening Fund Credit';
    pillLabel = 'Account Opening Credit';
    cleanRemarks = 'Account Opening Fund Credit';
    cleanDesc = 'Account Opening Fund Credit - खाता प्रारंभ अनुदान';
  } else if (isBulkOrAdmin || !isDebit) {
    cleanName = 'Vivah Sahayog Welfare Grant Credit';
    cleanType = 'Vivah Sahayog Welfare Grant Credit';
    pillLabel = 'Welfare Grant Credit';
    cleanRemarks = 'Vivah Sahayog Welfare Grant Credit';
    if (!cleanDesc || /admin|bulk|credit/i.test(cleanDesc)) {
      cleanDesc = 'Vivah Sahayog Welfare Grant Credit - मासिक कल्याणकारी अनुदान';
    } else {
      cleanDesc = sanitizeFundText(cleanDesc);
    }
  }

  cleanName = sanitizeFundText(cleanName);
  cleanType = sanitizeFundText(cleanType);
  cleanDesc = sanitizeFundText(cleanDesc);
  cleanRemarks = sanitizeFundText(cleanRemarks);

  return {
    ...item,
    txnName: cleanName,
    txnType: cleanType,
    type: isDebit ? 'debit' : 'credit',
    displayType: cleanType,
    pillLabel,
    txnDesc: cleanDesc,
    remarks: cleanRemarks,
  };
};

export const getDocumentUrl = path => {
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};

export const normalizeFundProfile = raw => {
  if (!raw || typeof raw !== 'object') return null;
  // If raw has no identifying fields, it is not an active profile
  if (
    !raw._id &&
    !raw.fundAccountId &&
    !raw.balikaName &&
    !raw.accountNumber &&
    !raw.vivahSahayogId &&
    !raw.applicantName
  ) {
    return null;
  }
  const docs = raw.documents || {};
  const balikaAadhaar = docs.balikaAadhaar || raw.balikaAadhaar || null;
  const birthCertificate = docs.birthCertificate || raw.birthCertificate || null;
  const balikaPhoto = docs.balikaPhoto || raw.balikaPhoto || null;
  const parentAadhaar = docs.parentAadhaar || raw.parentAadhaar || null;
  const parentBankPassbook = docs.parentBankPassbook || raw.parentBankPassbook || null;

  return {
    ...raw,
    _id: raw._id || raw.fundAccountId,
    fundAccountId: raw.fundAccountId || raw._id,
    status: raw.status || raw.approvalStatus || 'pending',
    approvalStatus: raw.approvalStatus || raw.status || 'pending',
    wallet: raw.wallet || raw.fundWallet || null,
    fundWallet: raw.fundWallet || raw.wallet || null,
    balikaAadhaar,
    birthCertificate,
    balikaPhoto,
    parentAadhaar,
    parentBankPassbook,
    documents: {
      balikaAadhaar,
      birthCertificate,
      balikaPhoto,
      parentAadhaar,
      parentBankPassbook,
      ...docs,
    },
  };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export default function useFundAccount() {
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fundAccountId, setFundAccountIdState] = useState(null);
  const [statements, setStatements] = useState([]);
  const [statementsTotal, setStatementsTotal] = useState(0);
  const [statementsLoading, setStatementsLoading] = useState(false);
  const [fundWallet, setFundWallet] = useState(null);
  const [error, setError] = useState(null);

  const saveFundAccountId = async id => {
    if (!id) return;
    setFundAccountIdState(id);
    await AsyncStorage.setItem(FUND_ACCOUNT_ID_KEY, id);
  };

  const loadFundAccountId = async () => {
    const id = await AsyncStorage.getItem(FUND_ACCOUNT_ID_KEY);
    if (id) setFundAccountIdState(id);
    return id;
  };

  // GET /api/fund-account/draft (Alias: GET /api/fund-account/status)
  const fetchDraft = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getData('/api/fund-account/draft');
      if (res && (!res.Error || res.Status)) {
        const d = res.Data;
        if (d && (d.hasDraft || d.fundAccountId || d.vivahSahayogId || d.formData?.balikaName)) {
          setDraft(d);
          if (d?.fundAccountId) {
            await saveFundAccountId(d.fundAccountId);
          }
        } else {
          setDraft(null);
        }
        return res;
      }
      setDraft(null);
      return res;
    } catch (err) {
      setDraft(null);
      const msg = err?.response?.data?.Remarks || 'ड्राफ्ट लोड करने में विफल।';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // POST /api/fund-account/register/save-draft
  const saveDraft = useCallback(async (data = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await postData('/api/fund-account/register/save-draft', data);
      if (res && (!res.Error || res.Status)) {
        if (res.Data?.fundAccountId) {
          await saveFundAccountId(res.Data.fundAccountId);
        }
        setDraft(prev => ({
          ...prev,
          ...(res.Data || {}),
          formData: {
            ...(prev?.formData || {}),
            ...data,
            ...(res.Data?.formData || {}),
          },
        }));
      }
      return res;
    } catch (err) {
      const msg = err?.response?.data?.Remarks || 'ड्राफ्ट सहेजने में विफल।';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // GET /api/fund-account/profile
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getData('/api/fund-account/profile');
      if (res?.Status && res?.Data) {
        const normalized = normalizeFundProfile(res.Data);
        setProfile(normalized);
        if (normalized?.fundAccountId || normalized?._id) {
          await saveFundAccountId(normalized.fundAccountId || normalized._id);
        }
      } else {
        setProfile(null);
      }
      return res;
    } catch (err) {
      setProfile(null);
      const msg = err?.response?.data?.Remarks || 'कनेक्शन विफल। पुनः प्रयास करें।';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // POST /api/fund-account/register/step1
  const step1 = useCallback(async data => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...data,
        isDraft: data.isDraft !== undefined ? data.isDraft : false,
      };
      const res = await postData('/api/fund-account/register/step1', payload);
      if (res && (!res.Error || res.Status)) {
        const id = res.Data?.fundAccountId || res.Data?._id;
        if (id) {
          await saveFundAccountId(id);
        }
      }
      return res;
    } catch (err) {
      const msg = err?.response?.data?.Remarks || 'Step 1 सबमिट विफल।';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // POST /api/fund-account/register/step2 (multipart/form-data)
  // Supports partial uploads (1 or more files)
  const step2 = useCallback(async (fAccountId, files) => {
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      if (fAccountId) {
        form.append('fundAccountId', fAccountId);
      }

      const docKeys = [
        'balikaAadhaar',
        'birthCertificate',
        'balikaPhoto',
        'parentAadhaar',
        'parentBankPassbook',
      ];

      docKeys.forEach(key => {
        const file = files?.[key];
        if (file && file.uri) {
          form.append(key, {
            uri: file.uri,
            name: file.name || `${key}.${file.type?.includes('pdf') ? 'pdf' : 'jpg'}`,
            type: file.type || 'image/jpeg',
          });
        }
      });

      const state = store.getState();
      const token =
        state?.user?.AccessToken ||
        state?.user?.token ||
        (await AsyncStorage.getItem('AccessToken')) ||
        (await AsyncStorage.getItem('token'));

      const response = await fetch(
        `${API_BASE_URL}/api/fund-account/register/step2`,
        {
          method: 'POST',
          headers: { token: token || '' },
          body: form,
        },
      );
      const res = await response.json();
      if (res?.Error) {
        setError(res?.Remarks || 'दस्तावेज़ अपलोड विफल।');
      }
      return res;
    } catch (err) {
      const msg = err?.response?.data?.Remarks || 'दस्तावेज़ अपलोड विफल।';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // POST /api/fund-account/register/submit
  const submit = useCallback(async fAccountId => {
    setLoading(true);
    setError(null);
    try {
      const res = await postData('/api/fund-account/register/submit', { fundAccountId: fAccountId });
      return res;
    } catch (err) {
      const msg = err?.response?.data?.Remarks || 'सबमिट विफल।';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // GET /api/fund-account/statements
  const fetchStatements = useCallback(async (page = 1, limit = 10, append = false) => {
    setStatementsLoading(true);
    try {
      const res = await getData('/api/fund-account/statements', { page, limit });
      if (res?.Status) {
        const rawTxns = res.Data?.statements || res.Data?.transactions || [];
        const wallet = res.Data?.wallet;
        const initialBal = wallet?.initialBalance;
        const txns = rawTxns.map((t, idx) => normalizeFundStatement(t, idx, rawTxns, initialBal));
        const total = res.Data?.pagination?.total ?? res.Data?.total ?? txns.length;
        setStatementsTotal(total);

        if (wallet) {
          setFundWallet(wallet);
        }

        if (append) {
          setStatements(prev => [...prev, ...txns]);
        } else {
          setStatements(txns);
        }
      }
      return res;
    } catch (err) {
      setError(err?.response?.data?.Remarks || 'विवरण लोड विफल।');
      return null;
    } finally {
      setStatementsLoading(false);
    }
  }, []);

  // GET /api/fund-account/status
  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getData('/api/fund-account/status');
      if (res && (!res.Error || res.Status)) {
        const d = res.Data;
        if (d) {
          setDraft(d);
          if (d?.fundAccountId) {
            await saveFundAccountId(d.fundAccountId);
          }
        }
        return res;
      }
      return res;
    } catch (err) {
      // Fallback to fetchDraft if status returns error
      try {
        const draftRes = await getData('/api/fund-account/draft');
        if (draftRes?.Data) {
          setDraft(draftRes.Data);
          return draftRes;
        }
      } catch {}
      const msg = err?.response?.data?.Remarks || 'पंजीकरण स्थिति प्राप्त करने में विफल।';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // POST /api/fund-account/register/pay (Gateway payment)
  const payRegistrationGateway = useCallback(async ({ gateway = 'TezGateway', redirectUrl } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await postData('/api/fund-account/register/pay', {
        gateway,
        redirectUrl: redirectUrl || 'https://sarvana.techember.in/payment-callback',
      });
      return res;
    } catch (err) {
      const msg = err?.response?.data?.Remarks || 'गेटवे भुगतान सत्र शुरू करने में विफल।';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // POST /api/fund-account/register/verify-payment
  const verifyRegistrationPayment = useCallback(async ({ orderId } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await postData('/api/fund-account/register/verify-payment', { orderId });
      return res;
    } catch (err) {
      const msg = err?.response?.data?.Remarks || 'भुगतान सत्यापन विफल।';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // POST /api/fund-account/register/pay-wallet
  const payRegistrationWallet = useCallback(async ({ mPin } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await postData('/api/fund-account/register/pay-wallet', { mPin });
      return res;
    } catch (err) {
      const msg = err?.response?.data?.Remarks || 'वॉलेट द्वारा भुगतान विफल।';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile, draft, setDraft, loading, fundAccountId, statements, statementsTotal,
    statementsLoading, fundWallet, error, setError, fetchProfile, fetchDraft,
    fetchStatus, saveDraft, step1, step2, submit, fetchStatements, loadFundAccountId, saveFundAccountId,
    payRegistrationGateway, verifyRegistrationPayment, payRegistrationWallet,
  };
}

