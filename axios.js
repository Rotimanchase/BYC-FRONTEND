import axios from 'axios';

// Remove trailing slash and fix environment detection
const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://byc-backend.vercel.app'  // No trailing slash
    : 'http://localhost:4800'
  );

console.log('🔍 API Base URL:', API_BASE); // Debug log

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Rest of your interceptors remain the same...
axiosInstance.interceptors.request.use(
  (config) => {
    const userToken = localStorage.getItem('token');
    if (userToken) {
      config.headers['Authorization'] = `Bearer ${userToken}`;
    }

    const adminToken = localStorage.getItem('adminToken');
    const adminRoutes = ['/api/admin', '/api/product/add', '/api/product/stock'];
    if (adminToken && adminRoutes.some((route) => config.url.includes(route))) {
      config.headers['x-auth-token'] = adminToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request, clearing tokens');
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;