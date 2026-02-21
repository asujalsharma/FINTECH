// api.js
import axios from 'axios';
import { store } from '../redux/store';
import { logoutUser } from '../redux/actions/userActions';
import { URL } from '../constants/URL';

// ✅ BASE URL
const API_BASE_URL = URL;

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
    const u = state?.user;
    // Greedy check for token in various common paths
    const reduxToken =
      u?.AccessToken ||
      u?.Data?.AccessToken ||
      u?.user?.AccessToken ||
      u?.profile?.AccessToken ||
      u?.token ||
      u?.Data?.token ||
      u?.user?.token ||
      u?.profile?.token;

    if (reduxToken) {
      config.headers.token = reduxToken;
      config.headers.Token = reduxToken;
      // Some backends expect 'Authorization: Bearer <token>'
      config.headers.Authorization = `Bearer ${reduxToken}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

// ✅ Response Interceptor — auto-logout on expired/invalid token
api.interceptors.response.use(
  response => response.data,
  error => {
    const data = error.response?.data;
    const isInvalidToken =
      data?.StatusCode === 'Ex400' ||
      data?.Remarks === 'Invalid token' ||
      error.response?.status === 401;

    if (isInvalidToken) {
      console.warn('Token expired or invalid — logging out.');
      store.dispatch(logoutUser());
    } else {
      console.error('API Error:', data || error.message);
    }

    return Promise.reject(error);
  },
);

// ✅ GET request
export const getData = async (endpoint: string, params = {}) => {
  return await api.get(endpoint, { params });
};

// ✅ POST request
export const postData = async (endpoint: string, body = {}) => {
  return await api.post(endpoint, body);
};

// ✅ PUT request
export const putData = async (endpoint: string, body = {}) => {
  return await api.put(endpoint, body);
};

// ✅ DELETE request
export const deleteData = async (endpoint: string) => {
  return await api.delete(endpoint);
};

export default api;
