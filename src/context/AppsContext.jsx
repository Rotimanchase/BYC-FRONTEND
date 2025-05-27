import React, { useState, useContext, createContext, useEffect, useCallback } from 'react';
import axiosInstance, { setAuthToken } from '../../axios.js';
import toast from 'react-hot-toast';

const AppsContext = createContext();

export const useAppContext = () => useContext(AppsContext);

export const AppsProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const currency = import.meta.env.VITE_CURRENCY;

  const fetchAdmin = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsAdmin(false);
        return;
      }
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        localStorage.removeItem('adminToken');
        setIsAdmin(false);
        return;
      }
      const res = await axiosInstance.get('/api/admin');
      setIsAdmin(res.data.success);
    } catch (error) {
      console.error('fetchAdmin error:', error.response?.data?.message || error.message);
      setIsAdmin(false);
    }
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      if (!user?._id) {
        setCart([]);
        return [];
      }
      const response = await axiosInstance.get(`/api/cart?userId=${user._id}`);
      if (response.data.success) {
        const cartItems = response.data.cart?.items || [];
        setCart(cartItems);
        return cartItems;
      } else {
        toast.error('Failed to fetch cart');
        setCart([]);
        return [];
      }
    } catch (error) {
      console.error('Fetch cart error:', error.response?.data || error.message);
      toast.error('Error fetching cart');
      setCart([]);
      return [];
    }
  }, [user]);

  const fetchWishlist = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/wishlist');
      const wishlistData = response.data.items || [];
      setWishlist(wishlistData);
      return wishlistData;
    } catch (error) {
      console.error('Fetch wishlist error:', error.response?.data || error.message);
      setWishlist([]);
      return [];
    }
  }, []);

  const addToCart = useCallback(async (productId, quantity, size, color) => {
    if (isLoading || !user) {
      toast.error('Please log in to add to cart');
      return;
    }
    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      toast.error('Cannot add to cart: Invalid product ID');
      return;
    }
    try {
      setIsLoading(true);
      let product = null;
      try {
        const productResponse = await axiosInstance.get(`/api/product/${productId}`);
        if (productResponse.data.success) {
          product = productResponse.data.product;
          if (product.sizes?.length > 0 && !size) {
            toast.error(`Please select a size: ${product.sizes.join(', ')}`);
            return;
          }
          if (product.colors?.length > 0 && !color) {
            toast.error(`Please select a color: ${product.colors.join(', ')}`);
            return;
          }
        }
      } catch (_) {}

      const response = await axiosInstance.post('/api/cart/add', { userId: user._id, productId, quantity: quantity || 1, size: size || null, color: color || null, });
      if (response.data.success) {
        setCart(response.data.cart?.items || []);
        toast.success('Product added to cart!');
      } else {
        toast.error(response.data.message || 'Failed to add to cart');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding to cart');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, user]);

  const updateQuantity = useCallback(async (productId, quantity, size, color) => {
    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      toast.error('Cannot update cart: Invalid product ID');
      return;
    }
    try {
      const response = await axiosInstance.put('/api/cart/update', {
        userId: user._id,
        productId,
        quantity,
        size: size || null,
        color: color || null,
      });
      if (response.data.success) {
        setCart(response.data.cart?.items || []);
      } else {
        toast.error(response.data.message || 'Failed to update cart');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating cart');
    }
  }, [user]);

  const removeFromCart = useCallback(async (productId, size, color) => {
    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      toast.error('Cannot remove from cart: Invalid product ID');
      return;
    }
    try {
      const response = await axiosInstance.delete('/api/cart/remove', {
        data: { userId: user._id, productId, size: size || null, color: color || null },
      });
      if (response.data.success) {
        setCart(response.data.cart?.items || []);
        toast.success('Item removed from cart!');
      } else {
        toast.error(response.data.message || 'Failed to remove from cart');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error removing from cart');
    }
  }, [user]);

  const addToWishlist = useCallback(async (product) => {
    if (isLoading || !user) {
      toast.error('Please log in to add to wishlist');
      return;
    }
    const productId = product._id;
    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      toast.error('Cannot add to wishlist: Invalid product ID');
      return;
    }
    try {
      setIsLoading(true);
      const response = await axiosInstance.post('/api/wishlist/add', { productId });
      if (response.data.success) {
        await fetchWishlist();
        // toast.success('Product added to wishlist!');
      } else {
        toast.error(response.data.message || 'Failed to add to wishlist');
      }
    } catch (error) {
      toast.error('Error adding to wishlist');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, user, fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (isLoading || !user) {
      toast.error('Please log in to remove from wishlist');
      return;
    }
    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      toast.error('Cannot remove from wishlist: Invalid product ID');
      return;
    }
    try {
      setIsLoading(true);
      const response = await axiosInstance.post('/api/wishlist/remove', { productId });
      if (response.data.success) {
        await fetchWishlist();
        toast.success('Item removed from wishlist!');
      } else {
        toast.error(response.data.message || 'Failed to remove from wishlist');
      }
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, user, fetchWishlist]);

  const clearCart = () => {
    setCart([]);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('recentlyViewed');
    setIsAdmin(false);
    setUser(null);
    setCart([]);
    setWishlist([]);
    setRecentlyViewed([]);
  };

  const fetchRecentlyViewed = useCallback(async () => {
    try {
      // Always check localStorage
      const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const productPromises = viewedIds.map(async (id) => {
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
          console.warn(`Invalid product ID in recentlyViewed: ${id}`);
          return null;
        }
        try {
          const response = await axiosInstance.get(`/api/product/${id}`);
          if (response.data.success) {
            return response.data.product;
          }
          return null;
        } catch (error) {
          console.error(`Error fetching product ${id}:`, error.response?.data || error.message);
          return null;
        }
      });
      let products = (await Promise.all(productPromises)).filter(p => p !== null);

      // For authenticated users, also fetch server-side recently viewed
      if (user) {
        try {
          const response = await axiosInstance.get('/api/user/recently-viewed');
          if (response.data.success && Array.isArray(response.data.recentlyViewed)) {
            // Merge server products, avoiding duplicates
            const serverProducts = response.data.recentlyViewed;
            const productMap = new Map(products.map(p => [p._id, p]));
            serverProducts.forEach(p => {
              if (!productMap.has(p._id)) {
                productMap.set(p._id, p);
              }
            });
            products = Array.from(productMap.values());
            // Update localStorage to include server IDs
            const mergedIds = [...new Set([...viewedIds, ...serverProducts.map(p => p._id)])];
            localStorage.setItem('recentlyViewed', JSON.stringify(mergedIds.slice(0, 5)));
          }
        } catch (error) {
          console.error('Error fetching server recently viewed:', error.response?.data || error.message);
        }
      }

      setRecentlyViewed(products.slice(0, 5));
    } catch (error) {
      console.error('Fetch recently viewed error:', error.response?.data || error.message);
      setRecentlyViewed([]);
      toast.error('Failed to load recently viewed products');
    }
  }, [user]);

  const addRecentlyViewed = useCallback(async (productId) => {
    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      console.error('Invalid product ID:', productId);
      toast.error('Invalid product ID');
      return;
    }
    try {
      // Validate product exists
      let product = null;
      try {
        const response = await axiosInstance.get(`/api/product/${productId}`);
        if (response.data.success) {
          product = response.data.product;
        } else {
          console.warn(`Product not found: ${productId}`);
          return;
        }
      } catch (error) {
        console.error(`Error validating product ${productId}:`, error.response?.data || error.message);
        return;
      }

      // Update localStorage
      const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const updatedIds = viewedIds.filter(id => id !== productId);
      updatedIds.unshift(productId);
      localStorage.setItem('recentlyViewed', JSON.stringify(updatedIds.slice(0, 5)));

      // For authenticated users, update server
      if (user) {
        try {
          const response = await axiosInstance.post('/api/user/recently-viewed', { productId });
          if (!response.data.success) {
            console.warn('Failed to update server recently viewed:', response.data.message);
          }
        } catch (error) {
          console.error('Error updating server recently viewed:', error.response?.data || error.message);
        }
      }

      // Update state
      const currentProducts = recentlyViewed.filter(p => p._id !== productId);
      currentProducts.unshift(product);
      setRecentlyViewed(currentProducts.slice(0, 5));
    } catch (error) {
      console.error('Add recently viewed error:', error.response?.data || error.message);
      toast.error('Failed to add recently viewed product');
    }
  }, [user, recentlyViewed]);

  const clearRecentlyViewed = useCallback(async () => {
    try {
      localStorage.setItem('recentlyViewed', '[]');
      if (user) {
        const response = await axiosInstance.delete('/api/user/recently-viewed');
        if (!response.data.success) {
          console.warn('Failed to clear server recently viewed:', response.data.message);
        }
      }
      setRecentlyViewed([]);
      // toast.success('Recently viewed products cleared');
    } catch (error) {
      console.error('Clear recently viewed error:', error.response?.data || error.message);
      toast.error('Failed to clear recently viewed');
    }
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp >= now) {
          fetchAdmin();
        } else {
          localStorage.removeItem('adminToken');
          setIsAdmin(false);
        }
      } catch {
        localStorage.removeItem('adminToken');
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [fetchAdmin]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      axiosInstance.get('/api/user/me')
        .then((response) => {
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            setUser(null);
            setCart([]);
            setWishlist([]);
            setRecentlyViewed([]);
          }
        })
        .catch(() => {
          setUser(null);
          setCart([]);
          setWishlist([]);
          setRecentlyViewed([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
      setWishlist([]);
      setCart([]);
      setRecentlyViewed([]);
    }
  }, []);

  const loginUser = useCallback(async (token) => {
    try {
      localStorage.setItem('token', token);
      setAuthToken(token);
      
      const response = await axiosInstance.get('/api/user/me');
      if (response.data.success) {
        setUser(response.data.user);
        return response.data.user;
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchCart();
      fetchWishlist();
      fetchRecentlyViewed();
    }
  }, [user, fetchCart, fetchWishlist, fetchRecentlyViewed]);

  return (
    <AppsContext.Provider
      value={{
        cart,
        wishlist,
        user,
        addToCart,
        addToWishlist,
        updateQuantity,
        removeFromCart,
        removeFromWishlist,
        clearCart,
        fetchCart,
        fetchWishlist,
        searchQuery,
        setSearchQuery,
        isAdmin,
        setIsAdmin,
        logout,
        currency,
        recentlyViewed,
        addRecentlyViewed,
        clearRecentlyViewed,
        fetchRecentlyViewed,
        loginUser,
      }}>
      {children}
    </AppsContext.Provider>
  );
};