import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({ 
  baseURL: API_BASE, 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json; charset=UTF-8'
  },
  responseType: 'json',
  responseEncoding: 'utf8'
});

// Attach token from AsyncStorage to each request
api.interceptors.request.use(async (config) => {
  console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    console.error('Error getting token:', e);
  }
  return config;
}, (error) => {
  console.error('❌ Request Error:', error);
  return Promise.reject(error);
});

// Response interceptor for better error logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ API Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
    } else {
      console.error('❌ Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
