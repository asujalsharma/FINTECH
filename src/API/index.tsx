// api.js
import axios from 'axios';
import { store } from '../redux/store';
// ✅ Import Redux store instance
// ✅ BASE URL
const API_BASE_URL = 'https://api.charlie.techember.in';

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
    // console.log("reduxToken ->", reduxToken);

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
  response => response.data,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  },
);

// ✅ GET request
export const getData = async (endpoint, params = {}) => {
  console.log('endpoint ->> ', endpoint, 'body ->> ', params);
  return await api.get(endpoint, { params });
};

// ✅ POST request
export const postData = async (endpoint, body = {}) => {
  console.log(endpoint, body, 'API POST request');
  return await api.post(endpoint, body);
};

// ✅ PUT request
export const putData = async (endpoint, body = {}) => {
  return await api.put(endpoint, body);
};

// ✅ DELETE request
export const deleteData = async endpoint => {
  return await api.delete(endpoint);
};

export default api;
