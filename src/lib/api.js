import axios from 'axios';
import { API_ENDPOINTS, API_CONFIG, ERROR_MESSAGES } from './config';

// Helper function to get token safely (adminToken from AuthContext)
const getToken = () => {
  if (typeof window !== 'undefined') {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) return adminToken;

      const user = localStorage.getItem('user') || '{}';
      const userJson = JSON.parse(user);
      return userJson.accessToken || '';
    } catch (error) {
      console.error('Error parsing auth token from localStorage:', error);
      return '';
    }
  }
  return '';
};

const api = axios.create({
    baseURL: `${API_CONFIG.BASE_URL}/api/admin`,
    headers: {
        "User-Agent": "MyCustomUserAgent",
        "Access-Control-Allow-Origin": "*",
    }
});

// Add request interceptor to dynamically set the token
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, redirect to login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminData');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;