import { useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getData, postData } from '../API/index';
import { API_BASE_URL } from '../API/index';
import { store } from '../redux/store';
import { fetchAllFundSchemes, fetchSingleFundScheme, getSchemeMeta, resolveSchemeCode } from '../services/fundSchemeService';
import useFundWithdrawal from './useFundWithdrawal';

export { fetchAllFundSchemes, fetchSingleFundScheme, getSchemeMeta, resolveSchemeCode, useFundWithdrawal };

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
 * Rule: For Vivah Sahayog (VIVAH_SAHAYOG), applicant's age must be greater than 20 (> 20, i.e. 21 years minimum) to withdraw funds.
 * For ALL other schemes (MAHILA_SAHAYOG, BAL_SAHAYOG, KISAN_SAHAYOG, VARISHTHA_NAGARIK_SAHAYOG), NO age restriction applies.
 */
export const calculateWithdrawalEligibility = (dob, currentAgeStr, schemeCode = 'VIVAH_SAHAYOG') => {
  const resolvedScheme = resolveSchemeCode(schemeCode);
  const isVivah = resolvedScheme === 'VIVAH_SAHAYOG';

  // For all non-Vivah schemes: NO AGE RESTRICTION
  if (!isVivah) {
    return {
      hasData: true,
      isEligible: true,
      yearsLeft: 0,
      monthsLeft: 0,
      currentAgeYears: null,
      targetAge: null,
      yearsLeftDisplay: 'उपलब्ध (पात्र)',
      detailedText: 'निकासी हेतु पात्र (आयु प्रतिबंध लागू नहीं)',
      badgeText: 'निकासी उपलब्ध',
      statusText: 'पात्र (Eligible)',
      ruleText: 'खाते में लॉक-इन राशि (Lock-in Amount) बनाए रखते हुए शेष राशि निकाली जा सकेगी।',
      withdrawalAgeText: 'आयु प्रतिबंध लागू नहीं',
    };
  }

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

  const rawAmount =
    item.amount !== undefined && item.amount !== null && item.amount !== '' && Number(item.amount) !== 0
      ? item.amount
      : item.txnAmount !== undefined && item.txnAmount !== null && item.txnAmount !== '' && Number(item.txnAmount) !== 0
      ? item.txnAmount
      : item.credit !== undefined && item.credit !== null && item.credit !== '' && Number(item.credit) !== 0
      ? item.credit
      : item.debit !== undefined && item.debit !== null && item.debit !== '' && Number(item.debit) !== 0
      ? item.debit
      : item.fundAmount !== undefined && item.fundAmount !== null && Number(item.fundAmount) !== 0
      ? item.fundAmount
      : item.value !== undefined && item.value !== null && Number(item.value) !== 0
      ? item.value
      : (item.balanceAfter !== undefined && item.balanceBefore !== undefined && Number(item.balanceAfter) !== Number(item.balanceBefore))
      ? Math.abs(Number(item.balanceAfter) - Number(item.balanceBefore))
      : item.txnAmount !== undefined && item.txnAmount !== null
      ? item.txnAmount
      : item.amount !== undefined && item.amount !== null
      ? item.amount
      : 0;

  let amountNum = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount).replace(/[^0-9.-]+/g, '')) || 0;

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

  if (amountNum === 0 && isInitialFund && initialBalance) {
    amountNum = Number(initialBalance) || 0;
  }

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
    amount: amountNum,
    txnAmount: amountNum,
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

export const normalizeAccount = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;
  const schemeCode = resolveSchemeCode(raw);
  const schemeMeta = getSchemeMeta(schemeCode);

  const accId = raw.fundAccountId || raw._id || raw.id;
  const accNum =
    raw.accountNumber ||
    raw.sahayogId ||
    raw.vivahSahayogId ||
    (accId ? `${schemeMeta.idPrefix}-${String(accId).slice(-6).toUpperCase()}` : '');

  const bName =
    raw.beneficiaryName ||
    raw.balikaName ||
    raw.applicantName ||
    raw.name ||
    `${schemeMeta.label} लाभार्थी`;

  return {
    ...raw,
    _id: accId,
    fundAccountId: accId,
    sahayogType: schemeCode,
    schemeCode: schemeCode,
    schemeName: raw.schemeName || raw.sahayogName || schemeMeta.name,
    themeColor: raw.themeColor || schemeMeta.color,
    beneficiaryName: bName,
    balikaName: raw.balikaName || bName,
    applicantName: raw.applicantName || bName,
    accountNumber: accNum,
    sahayogId: raw.sahayogId || accNum,
  };
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
    !raw.applicantName &&
    !raw.beneficiaryName
  ) {
    return null;
  }
  const norm = normalizeAccount(raw);
  const docs = norm.documents || {};
  const balikaAadhaar = docs.balikaAadhaar || docs.beneficiaryAadhaar || norm.balikaAadhaar || norm.beneficiaryAadhaar || null;
  const birthCertificate = docs.birthCertificate || docs.ageProof || norm.birthCertificate || norm.ageProof || null;
  const balikaPhoto = docs.balikaPhoto || docs.beneficiaryPhoto || norm.balikaPhoto || norm.beneficiaryPhoto || norm.photo || null;
  const parentAadhaar = docs.parentAadhaar || docs.guardianAadhaar || norm.parentAadhaar || norm.guardianAadhaar || null;
  const parentBankPassbook = docs.parentBankPassbook || docs.bankPassbook || norm.parentBankPassbook || norm.bankPassbook || null;

  return {
    ...norm,
    status: norm.status || norm.approvalStatus || 'pending',
    approvalStatus: norm.approvalStatus || norm.status || 'pending',
    wallet: norm.wallet || norm.fundWallet || null,
    fundWallet: norm.fundWallet || norm.wallet || null,
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

const SELECTED_ACCOUNT_ID_KEY = '@vivahSahayog_selectedAccountId';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export default function useFundAccount() {
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fundAccountId, setFundAccountIdState] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [statements, setStatements] = useState([]);
  const [statementsTotal, setStatementsTotal] = useState(0);
  const [statementsLoading, setStatementsLoading] = useState(false);
  const [fundWallet, setFundWallet] = useState(null);
  const [error, setError] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [schemesLoading, setSchemesLoading] = useState(false);

  const selectedAccountIdRef = useRef(selectedAccountId);
  selectedAccountIdRef.current = selectedAccountId;
  const selectedAccountRef = useRef(selectedAccount);
  selectedAccountRef.current = selectedAccount;
  const accountsRef = useRef(accounts);
  accountsRef.current = accounts;

  const saveFundAccountId = async id => {
    if (!id) return;
    setFundAccountIdState(id);
    await AsyncStorage.setItem(FUND_ACCOUNT_ID_KEY, String(id));
  };

  const loadFundAccountId = async () => {
    const id = await AsyncStorage.getItem(FUND_ACCOUNT_ID_KEY);
    if (id) setFundAccountIdState(id);
    return id;
  };

  // ─── Multi-Account: Fetch All Accounts ─────────────────────────────────────
  // GET /api/fund-account/my-accounts
  const fetchMyAccounts = useCallback(async (forcedSelectedId = null, optionalSahayogType = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getData('/api/fund-account/my-accounts');
      if (res && (!res.Error || res.Status)) {
        const rawList = res.Data?.accounts || (Array.isArray(res.Data) ? res.Data : []);
        const rawAccounts = rawList.map(normalizeAccount);
        const total = res.Data?.totalAccounts ?? rawAccounts.length;
        setAccounts(rawAccounts);
        setTotalAccounts(total);

        const targetSahayogType =
          typeof forcedSelectedId === 'object' && forcedSelectedId !== null
            ? (forcedSelectedId.sahayogType || forcedSelectedId.schemeCode)
            : optionalSahayogType;

        const targetId =
          typeof forcedSelectedId === 'string'
            ? forcedSelectedId
            : typeof forcedSelectedId === 'object' && forcedSelectedId !== null
            ? (forcedSelectedId.fundAccountId || forcedSelectedId._id)
            : null;

        // Filter pool to target scheme if specified
        const pool = targetSahayogType
          ? rawAccounts.filter(a => resolveSchemeCode(a) === resolveSchemeCode(targetSahayogType))
          : rawAccounts;

        // Find saved or desired active account
        const savedId = targetId || (await AsyncStorage.getItem(SELECTED_ACCOUNT_ID_KEY)) || (await AsyncStorage.getItem(FUND_ACCOUNT_ID_KEY));
        let active = null;
        if (savedId && pool.length > 0) {
          active = pool.find(a => (a.fundAccountId || a._id) === savedId);
        }
        if (!active && pool.length > 0) {
          // Prefer approved account if available
          active = pool.find(a => (a.approvalStatus || a.status || '').toLowerCase() === 'approved') || pool[0];
        }

        if (active) {
          const actId = active.fundAccountId || active._id;
          selectedAccountIdRef.current = actId;
          selectedAccountRef.current = active;
          setSelectedAccountId(actId);
          setSelectedAccount(active);
          const normalized = normalizeFundProfile(active);
          setProfile(normalized);
          setFundAccountIdState(actId);
          await AsyncStorage.setItem(SELECTED_ACCOUNT_ID_KEY, String(actId));
          await saveFundAccountId(actId);

          // Ensure wallet & statements only reflect this active account
          const isActApproved = (active.approvalStatus || active.status || '').toLowerCase() === 'approved';
          if (!isActApproved) {
            setFundWallet(null);
            setStatements([]);
            setStatementsTotal(0);
          } else if (active.fundWallet) {
            setFundWallet(active.fundWallet);
          }
        } else {
          selectedAccountIdRef.current = null;
          selectedAccountRef.current = null;
          setSelectedAccountId(null);
          setSelectedAccount(null);
          setFundWallet(null);
          setStatements([]);
          setStatementsTotal(0);
        }
        return res;
      }
      return res;
    } catch (err) {
      console.log('fetchMyAccounts error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Multi-Account: Select / Switch Account ────────────────────────────────
  const selectAccount = useCallback(async accountOrId => {
    if (!accountOrId) return;
    const targetId =
      typeof accountOrId === 'object'
        ? (accountOrId.fundAccountId || accountOrId._id)
        : accountOrId;

    if (!targetId) return;
    selectedAccountIdRef.current = targetId;
    setSelectedAccountId(targetId);
    setFundAccountIdState(targetId);
    await AsyncStorage.setItem(SELECTED_ACCOUNT_ID_KEY, String(targetId));
    await saveFundAccountId(targetId);

    // Immediately clear previous account's statements & wallet
    setStatements([]);
    setStatementsTotal(0);

    // Update active account object
    setAccounts(prevList => {
      const found = prevList.find(a => (a.fundAccountId || a._id) === targetId);
      if (found) {
        selectedAccountRef.current = found;
        setSelectedAccount(found);
        setProfile(normalizeFundProfile(found));
        const isApproved = (found.approvalStatus || found.status || '').toLowerCase() === 'approved';
        if (isApproved && found.fundWallet) {
          setFundWallet(found.fundWallet);
        } else {
          setFundWallet(null);
        }
      }
      return prevList;
    });

    // Refresh profile for this specific account
    try {
      const pRes = await getData('/api/fund-account/profile', { fundAccountId: targetId });
      if (pRes?.Status && pRes?.Data) {
        setProfile(normalizeFundProfile(pRes.Data));
      }
    } catch (e) {
      console.log('Error refreshing profile after selectAccount:', e);
    }
  }, []);

  // ─── Clear Active Account (For New Registration) ──────────────────────────
  const clearActiveAccount = useCallback(async () => {
    selectedAccountIdRef.current = null;
    selectedAccountRef.current = null;
    setSelectedAccountId(null);
    setSelectedAccount(null);
    setDraft(null);
    setProfile(null);
    setFundAccountIdState(null);
    await AsyncStorage.removeItem(SELECTED_ACCOUNT_ID_KEY);
    await AsyncStorage.removeItem(FUND_ACCOUNT_ID_KEY);
  }, []);

  // GET /api/fund-account/draft (strictly isolates drafts by sahayogType and/or fundAccountId)
  const fetchDraft = useCallback(async (accountOrParams, optionalSahayogType) => {
    setLoading(true);
    setError(null);
    try {
      let targetId = null;
      let targetSahayogType = null;

      if (typeof accountOrParams === 'object' && accountOrParams !== null) {
        targetId = accountOrParams.fundAccountId || accountOrParams._id || null;
        targetSahayogType = accountOrParams.sahayogType || accountOrParams.schemeCode || null;
      } else if (typeof accountOrParams === 'string') {
        if (accountOrParams.toUpperCase().includes('SAHAYOG')) {
          targetSahayogType = accountOrParams;
        } else {
          targetId = accountOrParams;
        }
      }

      if (optionalSahayogType) {
        targetSahayogType = optionalSahayogType;
      }

      if (!targetId) {
        targetId = selectedAccountIdRef.current;
      }

      const params = {};
      if (targetId) params.fundAccountId = targetId;
      if (targetSahayogType) params.sahayogType = targetSahayogType;

      const res = await getData('/api/fund-account/draft', params);
      if (res && (!res.Error || res.Status)) {
        const d = res.Data;
        if (d && (d.hasDraft || d.fundAccountId || d.vivahSahayogId || d.formData?.balikaName || d.formData?.beneficiaryName)) {
          // If custom targetId was specified, ensure returned draft matches requested ID
          if (targetId && d.fundAccountId && String(d.fundAccountId) !== String(targetId)) {
            setDraft(null);
            return { Status: false, Remarks: 'No draft for this account' };
          }
          // If targetSahayogType was specified, ensure returned draft matches requested scheme
          const dScheme = (d.sahayogType || d.schemeCode || d.formData?.sahayogType || d.formData?.schemeCode || '').toUpperCase();
          if (targetSahayogType && dScheme && !dScheme.includes(targetSahayogType.toUpperCase()) && !targetSahayogType.toUpperCase().includes(dScheme)) {
            setDraft(null);
            return { Status: false, Remarks: 'No draft for this scheme' };
          }
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
      const payload = {
        sahayogType: data.sahayogType || data.schemeCode || 'VIVAH_SAHAYOG',
        ...data,
      };
      if (data.createNew) payload.createNew = true;
      const res = await postData('/api/fund-account/register/save-draft', payload);
      if (res && (!res.Error || res.Status)) {
        const newId = res.Data?.fundAccountId || res.Data?._id;
        if (newId) {
          await saveFundAccountId(newId);
          selectedAccountIdRef.current = newId;
          setSelectedAccountId(newId);
        }
        setDraft(prev => {
          const isSameAccount = prev?.fundAccountId && newId && String(prev.fundAccountId) === String(newId);
          return {
            hasDraft: true,
            fundAccountId: newId,
            ...(res.Data || {}),
            formData: {
              ...(isSameAccount ? prev?.formData : {}),
              ...payload,
              ...(res.Data?.formData || {}),
            },
            documents: res.Data?.documents || (isSameAccount ? prev?.documents : {}),
            updatedAt: new Date().toISOString(),
          };
        });
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
  const fetchProfile = useCallback(async (customAccountIdOrParams, optionalSahayogType = null) => {
    setLoading(true);
    setError(null);
    let customAccountId = null;
    try {
      const targetSahayogType =
        typeof customAccountIdOrParams === 'object' && customAccountIdOrParams !== null
          ? (customAccountIdOrParams.sahayogType || customAccountIdOrParams.schemeCode)
          : optionalSahayogType;

      customAccountId =
        typeof customAccountIdOrParams === 'string'
          ? customAccountIdOrParams
          : typeof customAccountIdOrParams === 'object' && customAccountIdOrParams !== null
          ? (customAccountIdOrParams.fundAccountId || customAccountIdOrParams._id)
          : null;

      const targetId =
        customAccountId ||
        selectedAccountIdRef.current ||
        (await AsyncStorage.getItem(SELECTED_ACCOUNT_ID_KEY)) ||
        (await AsyncStorage.getItem(FUND_ACCOUNT_ID_KEY));

      const params = {};
      if (targetId) params.fundAccountId = targetId;
      if (targetSahayogType) params.sahayogType = targetSahayogType;

      const res = await getData('/api/fund-account/profile', params);
      if (res?.Status && res?.Data) {
        const normalized = normalizeFundProfile(res.Data);
        const resScheme = (normalized.sahayogType || normalized.schemeCode || normalized.scheme || '').toUpperCase();
        // If targetSahayogType specified, verify returned profile matches scheme
        if (!targetSahayogType || !resScheme || resScheme === targetSahayogType.toUpperCase()) {
          setProfile(normalized);
          if (normalized?.fundAccountId || normalized?._id) {
            await saveFundAccountId(normalized.fundAccountId || normalized._id);
          }
        }
      } else {
        if (customAccountId) {
          const fallbackAcc = (accountsRef.current || []).find(a => (a.fundAccountId || a._id) === customAccountId);
          setProfile(fallbackAcc ? normalizeFundProfile(fallbackAcc) : null);
        } else if (!selectedAccountRef.current) {
          setProfile(null);
        }
      }
      return res;
    } catch (err) {
      if (customAccountId) {
        const fallbackAcc = (accountsRef.current || []).find(a => (a.fundAccountId || a._id) === customAccountId);
        setProfile(fallbackAcc ? normalizeFundProfile(fallbackAcc) : null);
      } else if (!selectedAccountRef.current) {
        setProfile(null);
      }
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
        sahayogType: data.sahayogType || data.schemeCode || 'VIVAH_SAHAYOG',
        ...data,
        isDraft: data.isDraft !== undefined ? data.isDraft : false,
      };
      if (data.createNew) payload.createNew = true;
      const res = await postData('/api/fund-account/register/step1', payload);
      if (res && (!res.Error || res.Status)) {
        const id = res.Data?.fundAccountId || res.Data?._id;
        if (id) {
          await saveFundAccountId(id);
          selectedAccountIdRef.current = id;
          setSelectedAccountId(id);
        }
        setDraft(prev => {
          const isSameAccount = prev?.fundAccountId && id && String(prev.fundAccountId) === String(id);
          return {
            hasDraft: true,
            fundAccountId: id,
            ...(res.Data || {}),
            formData: {
              ...(isSameAccount ? prev?.formData : {}),
              ...payload,
              ...(res.Data?.formData || {}),
            },
            documents: res.Data?.documents || (isSameAccount ? prev?.documents : {}),
            updatedAt: new Date().toISOString(),
          };
        });
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
  // Supports partial uploads (1 or more files) with fundAccountId and sahayogType
  const step2 = useCallback(async (fAccountIdOrParams, files, optionalSahayogType) => {
    setLoading(true);
    setError(null);
    try {
      let fAccountId = null;
      let sType = null;
      if (typeof fAccountIdOrParams === 'object' && fAccountIdOrParams !== null) {
        fAccountId = fAccountIdOrParams.fundAccountId || fAccountIdOrParams._id;
        sType = fAccountIdOrParams.sahayogType || fAccountIdOrParams.schemeCode;
      } else {
        fAccountId = fAccountIdOrParams;
      }
      if (optionalSahayogType) {
        sType = optionalSahayogType;
      }

      const form = new FormData();
      if (fAccountId) {
        form.append('fundAccountId', fAccountId);
      }
      if (sType) {
        form.append('sahayogType', sType);
      }

      if (files && typeof files === 'object') {
        Object.entries(files).forEach(([key, file]) => {
          if (file && file.uri) {
            form.append(key, {
              uri: file.uri,
              name: file.name || `${key}.${file.type?.includes('pdf') ? 'pdf' : 'jpg'}`,
              type: file.type || 'image/jpeg',
            });
          }
        });
      }

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
  const submit = useCallback(async fAccountIdOrParams => {
    setLoading(true);
    setError(null);
    try {
      const payload =
        typeof fAccountIdOrParams === 'object' && fAccountIdOrParams !== null
          ? {
              fundAccountId: fAccountIdOrParams.fundAccountId || fAccountIdOrParams._id,
              sahayogType: fAccountIdOrParams.sahayogType || fAccountIdOrParams.schemeCode,
              ...fAccountIdOrParams,
            }
          : { fundAccountId: fAccountIdOrParams };
      const res = await postData('/api/fund-account/register/submit', payload);
      return res;
    } catch (err) {
      const msg = err?.response?.data?.Remarks || 'सबमिट विफल।';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear statements manually
  const clearStatements = useCallback(() => {
    setStatements([]);
    setStatementsTotal(0);
    setFundWallet(null);
  }, []);

  // GET /api/fund-account/statements
  const fetchStatements = useCallback(async (page = 1, limit = 10, append = false, customAccountId) => {
    setStatementsLoading(true);
    if (!append) {
      setStatements([]);
      setStatementsTotal(0);
      setFundWallet(null);
    }
    try {
      const targetId =
        customAccountId ||
        selectedAccountIdRef.current ||
        (await AsyncStorage.getItem(SELECTED_ACCOUNT_ID_KEY)) ||
        (await AsyncStorage.getItem(FUND_ACCOUNT_ID_KEY));
      const params = { page, limit };
      if (targetId) params.fundAccountId = targetId;

      const res = await getData('/api/fund-account/statements', params);
      if (res?.Status) {
        const rawTxns = res.Data?.statements || res.Data?.transactions || [];
        const wallet = res.Data?.wallet;
        const initialBal = wallet?.initialBalance;
        const txns = rawTxns.map((t, idx) => normalizeFundStatement(t, idx, rawTxns, initialBal));
        const total = res.Data?.pagination?.total ?? res.Data?.total ?? txns.length;
        setStatementsTotal(total);

        if (wallet) {
          setFundWallet(wallet);
        } else if (!append) {
          setFundWallet(null);
        }

        if (append) {
          setStatements(prev => [...prev, ...txns]);
        } else {
          setStatements(txns);
        }
      } else {
        if (!append) {
          setStatements([]);
          setStatementsTotal(0);
          setFundWallet(null);
        }
      }
      return res;
    } catch (err) {
      if (!append) {
        setStatements([]);
        setStatementsTotal(0);
        setFundWallet(null);
      }
      setError(err?.response?.data?.Remarks || 'विवरण लोड विफल।');
      return null;
    } finally {
      setStatementsLoading(false);
    }
  }, []);

  // GET /api/fund-account/status
  const fetchStatus = useCallback(async (sahayogTypeOrParams) => {
    setLoading(true);
    setError(null);
    try {
      const params =
        typeof sahayogTypeOrParams === 'string'
          ? { sahayogType: sahayogTypeOrParams }
          : typeof sahayogTypeOrParams === 'object' && sahayogTypeOrParams !== null
          ? { ...sahayogTypeOrParams }
          : {};
      const res = await getData('/api/fund-account/status', params);
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
        const fallbackParams =
          typeof sahayogTypeOrParams === 'string'
            ? { sahayogType: sahayogTypeOrParams }
            : (sahayogTypeOrParams || {});
        const draftRes = await getData('/api/fund-account/draft', fallbackParams);
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
  const payRegistrationGateway = useCallback(async ({ gateway = 'TezGateway', redirectUrl, fundAccountId, sahayogType } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        gateway,
        redirectUrl: redirectUrl || 'https://sarvana.techember.in/payment-callback',
      };
      if (fundAccountId) payload.fundAccountId = fundAccountId;
      if (sahayogType) payload.sahayogType = sahayogType;
      const res = await postData('/api/fund-account/register/pay', payload);
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
  const verifyRegistrationPayment = useCallback(async ({ orderId, fundAccountId, sahayogType } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { orderId };
      if (fundAccountId) payload.fundAccountId = fundAccountId;
      if (sahayogType) payload.sahayogType = sahayogType;
      const res = await postData('/api/fund-account/register/verify-payment', payload);
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
  const payRegistrationWallet = useCallback(async ({ mPin, fundAccountId, sahayogType } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { mPin };
      if (fundAccountId) payload.fundAccountId = fundAccountId;
      if (sahayogType) payload.sahayogType = sahayogType;
      const res = await postData('/api/fund-account/register/pay-wallet', payload);
      return res;
    } catch (err) {
      const msg = err?.response?.data?.Remarks || 'वॉलेट द्वारा भुगतान विफल।';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Sahayog Schemes: Fetch All Schemes (GET /api/fund-account/schemes) ───
  const fetchSchemes = useCallback(async () => {
    setSchemesLoading(true);
    try {
      const list = await fetchAllFundSchemes();
      if (Array.isArray(list) && list.length > 0) {
        setSchemes(list);
      }
      return list;
    } catch (err) {
      console.log('useFundAccount fetchSchemes error:', err);
      return [];
    } finally {
      setSchemesLoading(false);
    }
  }, []);

  // ─── Sahayog Schemes: Fetch Single Scheme (GET /api/fund-account/schemes/:code)
  const fetchSchemeDetails = useCallback(async (code) => {
    try {
      const scheme = await fetchSingleFundScheme(code);
      return scheme;
    } catch (err) {
      console.log('useFundAccount fetchSchemeDetails error:', err);
      return null;
    }
  }, []);

  return {
    profile, draft, setDraft, loading, fundAccountId, statements, statementsTotal,
    statementsLoading, fundWallet, error, setError, fetchProfile, fetchDraft,
    fetchStatus, saveDraft, step1, step2, submit, fetchStatements, loadFundAccountId, saveFundAccountId,
    payRegistrationGateway, verifyRegistrationPayment, payRegistrationWallet,
    accounts, totalAccounts, selectedAccount, selectedAccountId, fetchMyAccounts, selectAccount, clearActiveAccount, clearStatements,
    schemes, schemesLoading, fetchSchemes, fetchSchemeDetails,
  };
}

