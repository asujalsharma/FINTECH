// api.js
import axios from 'axios';

// ✅ Set your base URL here
// const API_BASE_URL = 'https://anpshopping.com/dev/app/';
const API_BASE_URL = 'https://api.new.techember.in';

// ✅ Create an axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGQyZjU1MjRiYzFmYjI2YzQ0ZjVhMDkiLCJpYXQiOjE3NTg5NjA2NjJ9.MeQvormbHb6PEhhav2JbJ16BvjmQsGWBt16gZdI1fFY',
  },
});

// ✅ Interceptors for adding tokens, logging, etc.
api.interceptors.request.use(
  async (config) => {
    const STATIC_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGQyZjU1MjRiYzFmYjI2YzQ0ZjVhMDkiLCJpYXQiOjE3NTg5NjA2NjJ9.MeQvormbHb6PEhhav2JbJ16BvjmQsGWBt16gZdI1fFY';
    // Example: attach token if available
    const token = await getAuthToken(); // Implement this
    if (STATIC_TOKEN) {
      config.headers.Authorization = `Bearer ${STATIC_TOKEN}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle errors globally
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

// ------------------------------
// 📌 Common API Functions
// ------------------------------

// GET request
export const getData = async (endpoint, params = {}) => {
  return await api.get(endpoint, { params });
};

// POST request
export const postData = async (endpoint, body = {}) => {
    console.log(endpoint, body, "API POST request");
    
  return await api.post(endpoint, body);
};

// PUT request
export const putData = async (endpoint, body = {}) => {
  return await api.put(endpoint, body);
};

// DELETE request
export const deleteData = async (endpoint) => {
  return await api.delete(endpoint);
};

// Example: fetch token from storage (AsyncStorage)
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAuthToken = async () => {
  return await AsyncStorage.getItem('authToken');
};
