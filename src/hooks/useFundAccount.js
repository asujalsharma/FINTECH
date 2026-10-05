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
  if (!raw) return null;
  const docs = raw.documents || {};
  const birthCertificate = docs.birthCertificate || raw.birthCertificate || null;
  const parentAadhaar = docs.parentAadhaar || raw.parentAadhaar || null;
  const balikaPhoto = docs.balikaPhoto || raw.balikaPhoto || null;

  return {
    ...raw,
    _id: raw._id || raw.fundAccountId,
    fundAccountId: raw.fundAccountId || raw._id,
    status: raw.status || raw.approvalStatus || 'pending',
    approvalStatus: raw.approvalStatus || raw.status || 'pending',
    wallet: raw.wallet || raw.fundWallet || null,
    fundWallet: raw.fundWallet || raw.wallet || null,
    birthCertificate,
    parentAadhaar,
    balikaPhoto,
    documents: {
      birthCertificate,
      parentAadhaar,
      balikaPhoto,
      ...docs,
    },
  };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export default function useFundAccount() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fundAccountId, setFundAccountIdState] = useState(null);
  const [statements, setStatements] = useState([]);
  const [statementsTotal, setStatementsTotal] = useState(0);
  const [statementsLoading, setStatementsLoading] = useState(false);
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
      const res = await postData('/api/fund-account/register/step1', data);
      if (res?.Status && res?.Data?.fundAccountId) {
        await saveFundAccountId(res.Data.fundAccountId);
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
  const step2 = useCallback(async (fAccountId, files) => {
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('fundAccountId', fAccountId);
      if (files.birthCertificate) {
        form.append('birthCertificate', {
          uri: files.birthCertificate.uri,
          name: files.birthCertificate.name || 'birthCertificate.jpg',
          type: files.birthCertificate.type || 'image/jpeg',
        });
      }
      if (files.parentAadhaar) {
        form.append('parentAadhaar', {
          uri: files.parentAadhaar.uri,
          name: files.parentAadhaar.name || 'parentAadhaar.jpg',
          type: files.parentAadhaar.type || 'image/jpeg',
        });
      }
      if (files.balikaPhoto) {
        form.append('balikaPhoto', {
          uri: files.balikaPhoto.uri,
          name: files.balikaPhoto.name || 'balikaPhoto.jpg',
          type: files.balikaPhoto.type || 'image/jpeg',
        });
      }
      const state = store.getState();
      const token = state?.user?.AccessToken;
      const response = await fetch(
        `${API_BASE_URL}/api/fund-account/register/step2`,
        {
          method: 'POST',
          headers: { token: token || '' },
          body: form,
        },
      );
      const res = await response.json();
      if (!res?.Status) setError(res?.Remarks || 'दस्तावेज़ अपलोड विफल।');
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
        const txns = res.Data?.transactions || res.Data?.statements || [];
        const total = res.Data?.total || txns.length;
        setStatementsTotal(total);
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
    profile, loading, fundAccountId, statements, statementsTotal,
    statementsLoading, error, setError, fetchProfile, step1, step2,
    submit, fetchStatements, loadFundAccountId, saveFundAccountId,
  };
}
