// api.js
import axios from 'axios';
import { store } from '../redux/store';
// ✅ Import Redux store instance
// ✅ BASE URL
export const API_BASE_URL = 'https://api.onlineadda.techember.in';

// ✅ Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request Interceptor → auto attach token & DevTools Console Logger
api.interceptors.request.use(
  async config => {
    const state = store.getState();
    const reduxToken = state?.user?.AccessToken;

    if (reduxToken) {
      config.headers.token = reduxToken;
    }

    if (__DEV__) {
      (config as any)._startTime = Date.now();
      console.log(
        `🌐 [REQUEST] ${config.method?.toUpperCase()} ${config.baseURL || ''}/${config.url?.replace(/^\//, '')}`,
        {
          headers: config.headers,
          params: config.params,
          data: config.data,
        },
      );
    }

    return config;
  },
  error => Promise.reject(error),
);

// ✅ Response Interceptor → DevTools Console Logger & Error Handling
api.interceptors.response.use(
  response => {
    if (__DEV__) {
      const startTime = (response.config as any)?._startTime;
      const duration = startTime ? `${Date.now() - startTime}ms` : '';
      console.log(
        `✅ [RESPONSE ${response.status}] ${response.config.method?.toUpperCase()} ${response.config.url} (${duration})`,
        {
          status: response.status,
          duration,
          data: response.data,
        },
      );
    }
    return response.data;
  },
  error => {
    if (__DEV__) {
      const startTime = (error.config as any)?._startTime;
      const duration = startTime ? `${Date.now() - startTime}ms` : '';
      console.log(
        `❌ [RESPONSE ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration})`,
        {
          status: error.response?.status,
          error: error.message,
          data: error.response?.data,
        },
      );
    }
    console.error('API Error:', error.response?.data || error.message);
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
