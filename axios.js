import axios from 'axios';

// Simple hardcoded approach that works with Vercel builds
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://byc-backend.vercel.app'
  : 'http://localhost:4800';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 30000,
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
    if (adminToken && adminRoutes.some((route) => config.url?.includes(route))) {
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