import axios from 'axios';

// Fix environment variable detection for Vite
const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://your-backend-domain.com'  // ⚠️ REPLACE with your actual backend URL
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

// Add request interceptor with better logging
axiosInstance.interceptors.request.use(
  (config) => {
    // Debug logging (remove in production)
    if (import.meta.env.MODE === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.baseURL + config.url,
        data: config.data
      });
    }

    const userToken = localStorage.getItem('token');
    if (userToken) {
      config.headers['Authorization'] = `Bearer ${userToken}`;
    }

    const adminToken = localStorage.getItem('adminToken');
    const adminRoutes = ['/api/admin', '/api/product/add', '/api/product/stock', '/api/order/admin'];
    if (adminToken && adminRoutes.some((route) => config.url?.includes(route))) {
      config.headers['x-auth-token'] = adminToken;
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with retry logic
axiosInstance.interceptors.response.use(
  (response) => {
    // Debug logging (remove in production)
    if (import.meta.env.MODE === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    // Enhanced error logging
    console.error('❌ API Error:', {
      message: error.message,
      status: error.response?.status,
      url: config?.url,
      baseURL: config?.baseURL,
      method: config?.method?.toUpperCase(),
      data: error.response?.data
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized request, clearing tokens');
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      
      // Optionally redirect to login
      if (typeof window !== 'undefined' && window.location.pathname !== '/account') {
        window.location.href = '/account';
      }
    }

    // Retry logic for network errors (helpful for mobile)
    if (!config._retry && (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNABORTED' ||
      error.message.includes('Network Error') ||
      error.message.includes('timeout')
    )) {
      config._retry = true;
      config._retryCount = (config._retryCount || 0) + 1;
      
      if (config._retryCount <= 2) { // Max 2 retries
        console.log(`🔄 Retrying request... Attempt ${config._retryCount}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * config._retryCount));
        return axiosInstance(config);
      } else {
        console.error('❌ Max retries exceeded');
      }
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

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🔍 Testing API connection to:', API_BASE);
    const response = await axiosInstance.get('/api/test');
    console.log('✅ API Connection successful');
    return true;
  } catch (error) {
    console.error('❌ API Connection failed:', error.message);
    return false;
  }
};

// Export API_BASE for debugging
export { API_BASE };

export default axiosInstance;