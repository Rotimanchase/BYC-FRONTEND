import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/appContext';
import { currency } from '../assets/assets';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart, fetchCart } = useAppContext();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [hasRun, setHasRun] = useState(false); // Prevent multiple runs

  const verifyPayment = useCallback(async () => {
    // Prevent multiple executions
    if (hasRun) return;
    setHasRun(true);

    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id') || sessionStorage.getItem('pendingOrderId');

    if (!sessionId || !orderId) {
      toast.error('Payment verification failed - missing parameters');
      navigate('/checkout');
      return;
    }

    try {
      const response = await axiosInstance.post('/api/order/verify-payment', {
        session_id: sessionId,
        order_id: orderId
      });

      if (response.data.success) {
        setVerified(true);
        setOrderDetails(response.data.order);
        
        // Show success toast only once
        toast.success('Payment successful! Order confirmed.', {
          id: 'payment-success' // Prevent duplicate toasts
        });
        
        // Clear cart after successful payment
        try {
          await axiosInstance.delete("/api/cart/clear");
          clearCart();
          await fetchCart();
        } catch (cartError) {
          console.log('Cart clear error (non-critical):', cartError);
        }
        
        // Clear session storage
        sessionStorage.removeItem('pendingOrderId');
        sessionStorage.removeItem('orderTotal');
        
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed. Please contact support if payment was deducted.', {
        id: 'payment-error' // Prevent duplicate toasts
      });
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  }, [searchParams, navigate, clearCart, fetchCart, hasRun]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  const handleViewOrders = () => {
    navigate('/my-orders');
  };

  const handleContinueShopping = () => {
    navigate('/product');
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-6"></div>
          <h2 className="text-2xl font-semibold mb-2">Verifying your payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your order.</p>
          <div className="mt-4 text-sm text-gray-500">
            Do not close this window or navigate away.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="text-center max-w-2xl mx-auto p-6">
        {verified ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            {/* Success Message */}
            <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 text-lg mb-6">
              Thank you for your order. Your payment has been processed successfully.
            </p>
            
            {/* Order Details */}
            {orderDetails && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-mono text-sm">{orderDetails._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-semibold">{currency}{orderDetails.total?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>Online Payment</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600 font-semibold">Confirmed</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleViewOrders}
                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                View My Orders
              </button>
              <button
                onClick={handleContinueShopping}
                className="px-8 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
              >
                Continue Shopping
              </button>
            </div>
            
            {/* Additional Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>What's next?</strong><br />
                You will receive an order confirmation email shortly. 
                Your order will be processed and shipped within 2-3 business days.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            
            {/* Error Message */}
            <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Verification Failed</h1>
            <p className="text-gray-600 text-lg mb-6">
              There was an issue verifying your payment. If your payment was processed, 
              please contact our support team with your transaction details.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleViewOrders}
                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Check My Orders
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="px-8 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;