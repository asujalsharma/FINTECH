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
        const txns = res.Data?.statements || res.Data?.transactions || [];
        const total = res.Data?.pagination?.total ?? res.Data?.total ?? txns.length;
        setStatementsTotal(total);

        if (res.Data?.wallet) {
          setFundWallet(res.Data.wallet);
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

  return {
    profile, draft, setDraft, loading, fundAccountId, statements, statementsTotal,
    statementsLoading, fundWallet, error, setError, fetchProfile, fetchDraft,
    saveDraft, step1, step2, submit, fetchStatements, loadFundAccountId, saveFundAccountId,
  };
}
