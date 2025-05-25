import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axios';
import { currency } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppsContext';

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAppContext();

  // const user = JSON.parse(localStorage.getItem('user')) || null;

  const fetchMyOrders = async () => {
    if (!user || !user._id) {
      setError('User not logged in. Please log in to view your orders.');
      setLoading(false);
      navigate('/account');
      return;
    }


    try {
      const { data } = await axiosInstance.get('/api/order/user');
      if (data.success) {
        setMyOrders(data.orders || []);
      } else {
        setError('Failed to fetch orders: ' + (data.message || 'Unknown error'));
        toast.error('Failed to fetch orders.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      setError('Error fetching orders. Please try again.');
      toast.error('Error fetching orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  // useEffect(() => {
  //   if (!user) {
  //     navigate('/account');
  //   }
  // }, [user, navigate]);


  // Format address as a single line
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    const { fullname, company, country, city, state } = address;
    const parts = [fullname, company, city, state, country].filter(part => part);
    return parts.join(', ') || 'N/A';
  };

  if (loading) {
    return <div className="mt-16 pb-16 text-center">Loading orders...</div>;
  }

  if (error) {
    return <div className="mt-16 pb-16 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="mt-16 pb-16 md:ml-15 ml-5 mr-5 md:mr-0">
      <div className="flex flex-col items-end w-max mb-10">
        <p className="text-2xl font-medium uppercase">My Orders</p>
        <div className="w-16 h-0.5 bg-primary rounded-full"></div>
      </div>

      {myOrders.length === 0 ? (
        <p className="text-center text-gray-500">No orders found.</p>
      ) : (
        myOrders.map((order, index) => {
          return (
            <div
              key={order._id || index}
              className="border border-gray-300 rounded-lg mb-10 px-3 py-5 max-w-5xl"
            >
              <div className="flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col px-4 pb-4">
                <div>
                  <span>OrderId: {order._id || 'N/A'}</span>
                  <p className="text-sm mt-1">
                    Address: {formatAddress(order.address)}
                  </p>
                </div>
                <div className="max-md:mt-2">
                  <span>Payment: {order.paymentType || 'N/A'}</span>
                  <p className="text-sm mt-1">
                    Total Amount: {currency}{order.total?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
              {order.items && Array.isArray(order.items) ? (
                order.items.map((item, itemIndex) => {
                  if (!item.product) {
                    console.warn('Item missing product data:', JSON.stringify(item, null, 2));
                    return (
                      <div
                        key={item._id || itemIndex}
                        className={`relative bg-white text-gray-500/70 ${
                          order.items.length !== itemIndex + 1 && 'border-b'
                        } border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 md:gap-16 w-full`}
                      >
                        <div className="flex items-center mb-4 md:mb-0">
                          <div className="bg-primary/10 p-4 rounded-lg">
                            <img
                              className="md:w-20 w-16 object-cover"
                              src="/placeholder.jpg"
                              alt="Missing Product"
                            />
                          </div>
                          <div className="ml-4">
                            <h2 className="text-xl font-medium text-gray-800">
                              {item.name || 'Product Unavailable'}
                            </h2>
                            <p>Category: Uncategorized</p>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center md:ml-8 mb-4 md:mb-0 text-sm">
                          <p>Quantity: {item.quantity || 1}</p>
                          <p>Size: {item.size || 'N/A'}</p>
                          <p>Color: {item.color || 'N/A'}</p>
                          <p>Status: {order.status || 'Pending'}</p>
                          <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p className="text-primary font-medium text-lg">
                          Amount: {currency}{(item.price || 0) * (item.quantity || 1)}
                        </p>
                      </div>
                    );
                  }
                  if (!item.product.productImage || (Array.isArray(item.product.productImage) && item.product.productImage.length === 0)) {
                    console.warn('Missing or invalid productImage for item:', JSON.stringify(item.product, null, 2));
                  }
                  if (!item.product.category?.name) {
                    console.warn('Missing or invalid category for item:', JSON.stringify(item.product, null, 2));
                  }
                  return (
                    <div
                      key={item._id || itemIndex}
                      className={`relative bg-white text-gray-500/70 ${
                        order.items.length !== itemIndex + 1 && 'border-b'
                        } border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 md:gap-16 w-full`}
                    >
                      <div className="flex items-center mb-4 md:mb-0">
                        <div className="bg-primary/10 p-4 rounded-lg">
                          <img
                            className="md:w-20 w-16 object-cover"
                            src={
                              item.product.productImage && item.product.productImage.length > 0
                                ? item.product.productImage[0]
                                : '/placeholder.jpg'
                            }
                            alt={item.product.productName || item.name || 'Product Image'}
                          />
                        </div>
                        <div className="ml-4">
                          <h2 className="text-xl font-medium text-gray-800">
                            {item.product.productName || item.name || 'Untitled Product'}
                          </h2>
                          <p>Category: {item.product.category?.name || 'Uncategorized'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center md:ml-8 mb-4 md:mb-0 text-sm">
                        <p>Quantity: {item.quantity || 1}</p>
                        <p>Size: {item.size || 'N/A'}</p>
                        <p>Color: {item.color || 'N/A'}</p>
                        <p>Status: {order.status || 'Pending'}</p>
                        <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-primary font-medium text-lg">
                        Amount: {currency}{(item.price || 0) * (item.quantity || 1)}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p>No items found in this order or items is not an array. Type: {typeof order.items}</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default MyOrders;