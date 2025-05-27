import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { format, parseISO, startOfDay } from 'date-fns';
import { assets, currency } from '../../assets/assets';
import axiosInstance from '../../../axios';
import toast from 'react-hot-toast';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 max-w-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({ orders: [] });
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productStats, setProductStats] = useState({ count: 0, value: 0 });
  const [products, setProducts] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    orderId: null,
    action: null,
    title: '',
    message: '',
  });

  const handleMarkAsPaid = async (orderId) => {
    if (isUpdating) return;
    if (!orderId) {
      toast.error('Error: Invalid order ID');
      return;
    }
    setIsUpdating(orderId);
    try {
      const res = await axiosInstance.patch(`/api/order/${orderId}/mark-paid`);
      if (res.data.success) {
        toast.success('Order marked as paid');
        updateOrderInState(orderId, res.data.order);
        setActiveDropdown(null);
      } else {
        toast.error(res.data.message || 'Failed to mark as paid');
      }
    } catch (err) {
      const message = err.response?.status === 500
        ? 'Server error: Unable to process request'
        : err.response?.data?.message || err.message || 'Request failed';
      toast.error(`Error: ${message}`);
      console.error('Mark as paid error:', err);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (isUpdating) return;
    if (!orderId) {
      toast.error('Error: Invalid order ID');
      return;
    }
    setIsUpdating(orderId);
    try {
      const res = await axiosInstance.patch(`/api/order/${orderId}/cancel`);
      if (res.data.success) {
        toast.success('Order cancelled');
        updateOrderInState(orderId, res.data.order);
        setActiveDropdown(null);
      } else {
        toast.error(res.data.message || 'Failed to cancel order');
      }
    } catch (err) {
      const message = err.response?.status === 500
        ? 'Server error: Unable to process request'
        : err.response?.data?.message || err.message || 'Request failed';
      toast.error(`Error: ${message}`);
      console.error('Cancel order error:', err);
    } finally {
      setIsUpdating(null);
    }
  };

  const openModal = (orderId, action, title, message) => {
    setModalState({ isOpen: true, orderId, action, title, message });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, orderId: null, action: null, title: '', message: '' });
  };

  const confirmAction = () => {
    const { orderId, action } = modalState;
    if (action === 'mark-paid') {
      handleMarkAsPaid(orderId);
    } else if (action === 'cancel') {
      handleCancelOrder(orderId);
    }
    closeModal();
  };

  const updateOrderInState = (orderId, updatedOrder) => {
    setAllOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, ...updatedOrder } : order
      )
    );
    setDashboardData((prevData) => ({
      ...prevData,
      orders: prevData.orders.map((order) =>
        order.id === orderId ? { ...order, ...updatedOrder } : order
      ),
    }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get('/api/product');
        if (res.data.success && Array.isArray(res.data.products)) {
          setProducts(res.data.products);
          const totalCount = res.data.products.reduce(
            (sum, p) => sum + (p.productStock || 0),
            0
          );
          const totalValue = res.data.products.reduce(
            (sum, p) => sum + ((p.productStock || 0) * (p.productPrice || 0)),
            0
          ).toFixed(2);
          setProductStats({ count: totalCount, value: totalValue });
        } else {
          toast.error('Failed to fetch products');
        }
      } catch (error) {
        toast.error('Error loading products: ' + error.message);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get('/api/order/admin?page=1&limit=1000');
        if (res.data.success) {
          const mappedOrders = res.data.orders.map((order) => ({
            id: order._id || order.id || Math.random().toString(36).substring(2),
            user: { name: order.address?.fullname || 'Unknown User' },
            product: {
              name: order.items && order.items.length > 0
                ? order.items.map((item) => item.name || item.productName || 'Unknown Item').join(', ')
                : 'Unknown Product',
            },
            totalPrice: Number(order.total) || 0,
            paymentType: order.paymentType || 'Unknown',
            paymentStatus: order.paymentStatus || 'pending',
            orderStatus: order.status || 'pending',
            createdAt: order.createdAt || new Date().toISOString(),
          }));

          setAllOrders(mappedOrders);
          const recentOrders = mappedOrders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 8);
          setDashboardData({ orders: recentOrders });

        } else {
          const message = res.data.message || 'Unknown error';
          setError('Failed to fetch orders: ' + message);
          toast.error(message);
        }
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Network error';
        setError('Error fetching orders: ' + message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Prepare chart data
  const chartData = useMemo(() => {
    const days = 30;
    const today = startOfDay(new Date());
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date;
    }).reverse();

    const totalOrdersData = new Array(days).fill(0);
    const revenueData = new Array(days).fill(0);
    const paidOrdersData = new Array(days).fill(0);
    const pendingOrdersData = new Array(days).fill(0);
    const cancelledOrdersData = new Array(days).fill(0);

    allOrders.forEach((order) => {
      const orderDate = startOfDay(parseISO(order.createdAt));
      const index = dates.findIndex((d) => d.getTime() === orderDate.getTime());
      if (index !== -1) {
        totalOrdersData[index]++;
        if (order.paymentStatus === 'completed') {
          revenueData[index] += Number(order.totalPrice) || 0;
          paidOrdersData[index]++;
        }
        if (order.orderStatus === 'pending') {
          pendingOrdersData[index]++;
        }
        if (order.orderStatus === 'cancelled') {
          cancelledOrdersData[index]++;
        }
      }
    });

    return {
      labels: dates.map((d) => format(d, 'MMM dd')),
      datasets: [
        {
          label: 'Total Orders',
          data: totalOrdersData,
          borderColor: 'rgb(239, 68, 68)', 
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Revenue',
          data: revenueData,
          borderColor: 'rgb(59, 130, 246)', 
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.4,
          fill: false,
          hidden: true, 
        },
        {
          label: 'Paid Orders',
          data: paidOrdersData,
          borderColor: 'rgb(34, 197, 94)', 
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Pending Orders',
          data: pendingOrdersData,
          borderColor: 'rgb(234, 179, 8)', 
          backgroundColor: 'rgba(234, 179, 8, 0.2)',
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Cancelled Orders',
          data: cancelledOrdersData,
          borderColor: 'rgb(107, 114, 128)',
          backgroundColor: 'rgba(107, 114, 128, 0.2)',
          tension: 0.4,
          fill: false,
        },
      ],
    };
  }, [allOrders]);

  const { totalOrders, totalRevenue, paidOrders, pendingOrders, cancelledOrders } = useMemo(() => {
    const ordersCount = allOrders.length;
    const paidOrdersCount = allOrders.filter(order => order.paymentStatus === 'completed').length;
    const cancelledOrdersCount = allOrders.filter(order => order.orderStatus === 'cancelled').length;
    const pendingOrdersCount = allOrders.filter(order => order.orderStatus === 'pending').length;
    const revenue = allOrders
      .filter(order => order.paymentStatus === 'completed')
      .reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0)
      .toFixed(2);

    return { 
      totalOrders: ordersCount, 
      totalRevenue: revenue,
      paidOrders: paidOrdersCount,
      pendingOrders: pendingOrdersCount,
      cancelledOrders: cancelledOrdersCount
    };
  }, [allOrders]);

  if (loading) {
    return (
      <div className="ml-8 mt-5 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-8 mt-5 text-red-500">
        {error}
        <button className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          onClick={() => window.location.reload()} >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="md:ml-8 ml-3 mt-5 md:mr-0 mr-5 no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <h2 className="md:text-5xl text-3xl">Dashboard</h2>
      <p className="md:text-xl md:max-w-4xl text-sm max-w-1xl mt-2">
        Monitor your sales, track orders, and analyze revenue—all in one place. Stay updated with real-time insights to ensure smooth operations.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 my-5 md:my-8">
        <div className="border-2 border-red-400 rounded flex md:p-3 p-2">
          <img src={assets.totalIcon} alt="Total Stock Icon" className="h-10" />
          <div className="flex flex-col ml-4 font-medium">
            <p className="text-red-500 text-lg">Total Products</p>
            <p className="text-red-400 text-base font-bold">{productStats.count}</p>
          </div>
        </div>

        <div className="border-2 border-red-400 rounded flex md:p-4 p-2">
          <img src={assets.totalPRev} alt="Stock Value Icon" className="h-10" />
          <div className="flex flex-col ml-4 font-medium">
            <p className="text-red-500 text-lg">Stock Value</p>
            <p className="text-red-400 text-base font-bold">{currency}{productStats.value}</p>
          </div>
        </div>

        <div className="border-2 border-red-400 rounded flex md:p-4 p-2">
          <img src={assets.totalIcon} alt="Total Orders Icon" className="h-10"/>
          <div className="flex flex-col ml-4 font-medium">
            <p className="text-red-500 text-lg">Total Orders</p>
            <p className="text-red-400 text-base font-bold">{totalOrders}</p>
            <p className="text-xs text-gray-500">
              {paidOrders} paid, {pendingOrders} pending, {cancelledOrders} cancelled
            </p>
          </div>
        </div>

        <div className="border-2 border-red-400 rounded flex md:p-4 p-2">
          <img src={assets.totalPRev} alt="Total Revenue Icon" className="h-10"/>
          <div className="flex flex-col ml-4 font-medium">
            <p className="text-red-500 text-lg">Total Revenue</p>
            <p className="text-red-400 text-base font-bold">{currency}{totalRevenue}</p>
            <p className="text-xs text-gray-500">From paid orders only</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl text-blue-950/70 font-medium mb-5 md:block hidden">Sales Statistics</h2>
      <div className="w-full max-w-5xl bg-white border border-gray-300 rounded-lg p-4 mb-8 md:block hidden">
        {allOrders.length > 0 ? (
          <Line data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    boxWidth: 20,
                    padding: 15,
                    font: {
                      size: 12,
                    },
                  },
                },
                title: {
                  display: true,
                  text: 'Sales Metrics Over Time (Last 30 Days)',
                  font: { size: 16, weight: 'bold' },
                  padding: { top: 10, bottom: 20 },
                },
                tooltip: { mode: 'index', intersect: false,
                  callbacks: {
                    label: (context) => {
                      const dataset = context.dataset;
                      const value = context.parsed.y;
                      if (dataset.label === 'Revenue') {
                        return `${dataset.label}: ${currency}${value.toFixed(2)}`;
                      }
                      return `${dataset.label}: ${value}`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  title: { display: true, text: 'Date' },
                },
                y: {
                  title: { display: true, text: 'Value' },
                  beginAtZero: true,
                },
              },
              interaction: { mode: 'nearest', axis: 'x', intersect: false, },
            }} aria-label="Sales statistics chart showing total orders, revenue, paid orders, pending orders, and cancelled orders over the last 30 days"/>
        ) : (
          <div className="flex flex-col items-center justify-center h-48">
            <p className="text-lg font-medium text-gray-500 mb-2">No sales data available</p>
            <p className="text-sm text-gray-400">Order statistics will appear once sales are recorded</p>
          </div>
        )}
      </div>

      <h2 className="text-xl text-blue-950/70 font-medium mb-5">Recent Sales</h2>

      <div className="w-full max-w-5xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
        <table className="w-full" role="grid" aria-label="Recent Sales">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="py-3 px-4 text-gray-800 font-medium text-left">Customer Name</th>
              <th className="py-3 px-4 text-gray-800 font-medium text-left max-sm:hidden">Product Name(s)</th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">Total Amount</th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">Payment Method</th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {dashboardData.orders.length > 0 ? (
              dashboardData.orders.map((item) => (
                <tr key={item.id} className="hover:bg-gray-100">
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300">{item.user.name}</td>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden">
                    <div className="max-w-xs truncate" title={item.product.name}>
                      {item.product.name}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300 text-center">
                    {currency}{Number(item.totalPrice).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300 text-center w-">
                    <span className={`py-1 px-2 md:text-xs text-[10px] rounded-full ${ item.paymentType === 'Online Payment' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600' }`}>
                      {item.paymentType === 'Online Payment' ? 'Stripe' : 'Bank Transfer'}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-t border-gray-300 text-center ">
                    {item.paymentStatus === 'completed' ? (
                      <span className="py-1 px-3 text-xs rounded-full bg-green-200 text-green-600">
                        Paid
                      </span>
                    ) : item.orderStatus === 'cancelled' ? (
                      <span className="py-1 px-3 text-xs rounded-full bg-red-200 text-red-600">
                        Cancel
                      </span>
                    ) : (
                      <div className="relative inline-block text-left">
                        <button onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)} className="py-1 px-3 text-xs rounded-full bg-amber-200 text-yellow-600 hover:bg-amber-300" >
                          Pending
                        </button>
                        {activeDropdown === item.id && (
                          <div className="absolute z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1 text-sm text-gray-700">
                              <button onClick={() => openModal(item.id, 'mark-paid', 'Mark as Paid', 'Are you sure you want to mark this order as paid?')}
                                disabled={isUpdating === item.id}
                                className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${isUpdating === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {isUpdating === item.id ? 'Updating...' : 'Mark as Paid'}
                              </button>
                              <button onClick={() => openModal(item.id, 'cancel', 'Cancel Order', 'Are you sure you want to cancel this order?')}
                                disabled={isUpdating === item.id}
                                className={`block w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600 ${isUpdating === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {isUpdating === item.id ? 'Updating...' : 'Cancel Order'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 px-4 text-gray-700 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-lg font-medium text-gray-500 mb-2">No recent sales found</p>
                    <p className="text-sm text-gray-400">Orders will appear here once customers start purchasing</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal isOpen={modalState.isOpen} onClose={closeModal} onConfirm={confirmAction} title={modalState.title} message={modalState.message}/>
    </div>
  );
};

export default Dashboard;