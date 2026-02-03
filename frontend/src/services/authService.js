import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'authToken';

const login = async (email, password) => {
  try {
    console.log('🔐 Attempting login with:', email);
    const res = await api.post('/auth/login', { email, password });
    console.log('✅ Login response:', res.data);
    
    const { token } = res.data;
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      console.log('✅ Token saved');
    }
    return res.data;
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    throw error;
  }
};

const logout = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  console.log('🚪 Logged out');
};

const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

const updateProfile = async (data) => {
  const res = await api.put('/auth/profile', data);
  return res.data;
};

const changePassword = async (data) => {
  const res = await api.put('/auth/change-password', data);
  return res.data;
};

export default { login, logout, getMe, updateProfile, changePassword };
