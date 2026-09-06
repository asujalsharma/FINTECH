import axios from 'axios';
import { store } from '../redux/store';
import { resetToLogin } from '../navigation/navigationRef';

// ✅ BASE URL
export const API_BASE_URL = 'https://api.rechargehoga.techember.in';

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
    const reduxToken = state?.user?.AccessToken;
    console.log('reduxToken ->', reduxToken);

    if (reduxToken) {
      config.headers.token = reduxToken;
      // config.headers.Authorization = `Bearer ${reduxToken}`;
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
      (remarks.includes('invalid token') ||
        remarks.includes('token expired') ||
        remarks.includes('unauthorized'))
    ) {
      console.warn('Authentication token invalid or expired. Logging out...');
      store.dispatch({ type: 'LOGOUT' });
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
      status === 403 ||
      remarks.includes('invalid token') ||
      remarks.includes('token expired') ||
      remarks.includes('unauthorized')
    ) {
      console.warn('Session expired or unauthorized. Redirecting to Login...');
      store.dispatch({ type: 'LOGOUT' });
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
