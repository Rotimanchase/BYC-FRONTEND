import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/appContext';
import axiosInstance from '../../../axios';

const OrderPage = () => {
  const boxIcon = "";
  const { currency } = useAppContext();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const { data } = await axiosInstance.get('/api/order/admin');
      console.log('Fetched orders:', JSON.stringify(data, null, 2));
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-medium">Orders List</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="flex flex-col md:items-center md:flex-row justify-between gap-5 p-5 max-w-4xl rounded-md border border-gray-300">
              <div className="flex gap-5 max-w-80">
                <img className="w-12 h-12 object-cover" src={boxIcon} alt="boxIcon" />
                <div>
                  {order.items.map((item, index) => {
                    console.log('Order item:', {
                      id: item._id,
                      name: item.name,
                      size: item.size,
                      color: item.color,
                      quantity: item.quantity
                    });
                    return (
                      <div key={index} className="flex flex-col mb-2">
                        <p className="font-medium">
                          {item.name} <span className="text-primary">x {item.quantity}</span>
                        </p>
                        <p className="text-sm text-black/60">
                          Size: {item.size}, Color: {item.color}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-sm md:text-base text-black/60">
                <p className="text-black/80">{order.address.fullname}</p>
                {order.address.company && <p>{order.address.company}</p>}
                <p>{order.address.city}, {order.address.state}, {order.address.country}</p>
                <p>{order.address.phone}</p>
                <p>{order.address.email}</p>
              </div>

              <p className="font-medium text-lg my-auto">{currency}{order.total.toLocaleString()}</p>

              <div className="flex flex-col text-sm md:text-base text-black/60">
                <p>Method: {order.paymentType}</p>
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Payment: {order.status === 'completed' ? 'Paid' : 'Pending'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderPage;