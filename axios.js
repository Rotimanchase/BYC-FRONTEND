import axios from 'axios';

// Fix environment variable detection for Vite
const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://byc-zeta.vercel.app'  // ⚠️ REPLACE with your actual backend URL
    : 'http://localhost:4800'
  );

const axiosInstance = axios.create({
  baseURL: API_BASE, // ✅ Fixed: was hardcoded to localhost
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout for mobile networks
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

export default axiosInstance;