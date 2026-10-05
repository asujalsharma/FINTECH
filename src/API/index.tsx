import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../redux/store';
import { resetToLogin } from '../navigation/navigationRef';

// ✅ BASE URL
export const API_BASE_URL = 'https://api.sarvana.techember.in';

// ✅ Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request Interceptor → auto attach token
api.interceptors.request.use(
  async config => {
    const state = store.getState();
    let reduxToken =
      state?.user?.AccessToken ||
      state?.user?.token ||
      state?.user?.accessToken ||
      state?.user?.Data?.AccessToken ||
      state?.user?.user?.AccessToken;

    if (!reduxToken) {
      try {
        reduxToken =
          (await AsyncStorage.getItem('AccessToken')) ||
          (await AsyncStorage.getItem('token'));
      } catch {
        // ignore
      }
    }

    if (reduxToken && typeof reduxToken === 'string' && reduxToken.trim().length > 0) {
      config.headers.token = reduxToken;
      config.headers.Authorization = `Bearer ${reduxToken}`;
      if (typeof config.headers.set === 'function') {
        config.headers.set('token', reduxToken);
        config.headers.set('Authorization', `Bearer ${reduxToken}`);
      }
    }

    return config;
  },
  error => Promise.reject(error),
);

// ✅ Response Interceptor
api.interceptors.response.use(
  response => {
    const data = response?.data;
    const remarks = (data?.Remarks || data?.message || '').toLowerCase();
    if (
      data &&
      data.Status === false &&
      (remarks === 'invalid token' ||
        remarks === 'token expired' ||
        remarks.includes('invalid token') ||
        remarks.includes('token expired') ||
        remarks === 'unauthorized')
    ) {
      console.warn('Authentication token invalid or expired. Logging out...');
      store.dispatch({ type: 'LOGOUT' });
      AsyncStorage.removeItem('AccessToken').catch(() => {});
      AsyncStorage.removeItem('token').catch(() => {});
      resetToLogin();
    }
    return response.data;
  },
  error => {
    const errorData = error.response?.data;
    const status = error.response?.status;
    console.error('API Error:', errorData || error.message);

    const remarks = (errorData?.Remarks || errorData?.message || '').toLowerCase();
    if (
      status === 401 ||
      (status === 403 &&
        (remarks.includes('invalid token') ||
          remarks.includes('token expired') ||
          remarks.includes('unauthorized')))
    ) {
      console.warn('Session expired or unauthorized. Redirecting to Login...');
      store.dispatch({ type: 'LOGOUT' });
      AsyncStorage.removeItem('AccessToken').catch(() => {});
      AsyncStorage.removeItem('token').catch(() => {});
      resetToLogin();
    }

    return Promise.reject(error);
  },
);

// ✅ GET request
export const getData = async (endpoint: string, params: any = {}) => {
  console.log('endpoint ->> ', endpoint, 'body ->> ', params);
  return await api.get(endpoint, { params });
};

// ✅ POST request
export const postData = async (endpoint: string, body: any = {}) => {
  console.log(endpoint, body, 'API POST request');
  return await api.post(endpoint, body);
};

// ✅ PUT request
export const putData = async (endpoint: string, body: any = {}) => {
  return await api.put(endpoint, body);
};

// ✅ DELETE request
export const deleteData = async (endpoint: string) => {
  return await api.delete(endpoint);
};

export default api;
