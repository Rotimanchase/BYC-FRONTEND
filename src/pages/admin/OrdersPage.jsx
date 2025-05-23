import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import axiosInstance from '../../../axios';
import { assets } from '../../assets/assets'; // Import assets for placeholder icon
import { useAppContext } from '../../context/AppsContext';

const OrderPage = () => {
  const { currency } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/api/order/admin');
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (order) => {
    if (order.status === 'cancelled') {
      return (
        <span className="py-1 px-3 text-xs rounded-full bg-red-200 text-red-600">
          Cancelled
        </span>
      );
    }
    if (order.paymentStatus === 'completed') {
      return (
        <span className="py-1 px-3 text-xs rounded-full bg-green-200 text-green-600">
          Paid
        </span>
      );
    }
    return (
      <span className="py-1 px-3 text-xs rounded-full bg-amber-200 text-yellow-600">
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-medium text-blue-950/70">Orders List</h2>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-lg font-medium text-gray-500 mb-2">No orders found</p>
            <p className="text-sm text-gray-400">Orders will appear here once customers start purchasing</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="flex flex-col md:items-center md:flex-row justify-between gap-5 p-5 max-w-4xl rounded-md border border-gray-300"
            >
              <div className="flex gap-5 max-w-80">
                <img
                  className="w-12 h-12 object-cover"
                  src={assets.totalIcon || 'https://via.placeholder.com/48'}
                  alt="Product Icon"
                />
                <div>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div key={index} className="flex flex-col mb-2">
                        <p className="font-medium">
                          {item.name || 'Unknown Item'}{' '}
                          <span className="text-red-500">x {item.quantity || 1}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Size: {item.size || 'N/A'}, Color: {item.color || 'N/A'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No items available</p>
                  )}
                </div>
              </div>

              <div className="text-sm md:text-base text-gray-600">
                <p className="text-gray-800 font-medium">
                  {order.address?.fullname || 'Unknown Customer'}
                </p>
                {order.address?.company && <p>{order.address.company}</p>}
                <p>
                  {order.address?.city || 'N/A'}, {order.address?.state || 'N/A'},{' '}
                  {order.address?.country || 'N/A'}
                </p>
                <p>{order.address?.phone || 'N/A'}</p>
                <p>{order.address?.email || 'N/A'}</p>
              </div>

              <p className="font-medium text-lg my-auto">
                {currency}
                {(order.total || 0).toLocaleString()}
              </p>

              <div className="flex flex-col text-sm md:text-base text-gray-600">
                <p>Method: {order.paymentType || 'Unknown'}</p>
                <p>
                  Date:{' '}
                  {order.createdAt
                    ? format(parseISO(order.createdAt), 'MMM dd, yyyy')
                    : 'N/A'}
                </p>
                <p>Status: {getStatusBadge(order)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderPage;