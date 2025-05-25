import React, { useState, useEffect, useCallback } from "react";
import { assets, currency } from "../assets/assets";
import axiosInstance from "../../axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../context/AppsContext";

const CheckOut = () => {
  const { cart, fetchCart, clearCart, user } = useAppContext();
  // const user = JSON.parse(localStorage.getItem("user")) || null;
  const userId = user?._id;
  const [formData, setFormData] = useState({
    fullname: "",
    company: "",
    country: "",
    city: "",
    state: "",
    phone: "",
    email: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      toast.error("User not logged in. Please log in to proceed.");
      navigate("/account");
      return;
    }
    fetchCart();
    fetchAddresses();
  }, [userId, navigate]);

  const fetchAddresses = async () => {
    if (!userId) return;
    try {
      const response = await axiosInstance.get(`/api/address/${userId}`);
      if (response.data.success) {
        setAddresses(response.data.addresses);
      }
    } catch (error) {
      toast.error("Failed to load addresses");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("User not logged in. Please log in to save an address.");
      navigate("/account");
      return;
    }

    const requiredFields = ["fullname", "country", "city", "state", "phone", "email"];
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    const payload = { userId, ...formData };

    try {
      const response = await axiosInstance.post("/api/address", payload);
      if (response.data.success) {
        toast.success("Address saved!");
        await fetchAddresses();
        setSelectedAddressId(response.data.address._id);
        setShowAddressForm(false);
        setFormData({
          fullname: "",
          company: "",
          country: "",
          city: "",
          state: "",
          phone: "",
          email: "",
        });
      } else {
        toast.error(response.data.error || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to save address");
    }
  };

  const handleChangeAddress = () => {
    setShowAddressForm(true);
  };

  const cartItems = Array.isArray(cart) ? cart : [];

  const calculateSubtotal = () => {
    try {
      return cartItems.reduce((sum, item) => {
        const price = item.productId?.productPrice ?? 0;
        const quantity = item.quantity ?? 0;
        if (typeof price !== "number" || typeof quantity !== "number") {
          console.warn("Invalid price or quantity:", { price, quantity, item });
          return sum;
        }
        return sum + price * quantity;
      }, 0);
    } catch (error) {
      console.error("Error calculating subtotal:", error);
      return 0;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + 2800;
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    
    if (!userId) {
      toast.error("User not logged in. Please log in to place an order.");
      navigate("/account");
      return;
    }
    
    if (isSubmitting) {
      return;
    }

    // Validate address selection
    const selectedAddress = selectedAddressId
      ? addresses.find((addr) => addr._id === selectedAddressId)
      : formData;

    if (!selectedAddress.fullname || !selectedAddress.city || !selectedAddress.country) {
      toast.error("Please provide a complete shipping address");
      return;
    }

    setIsSubmitting(true);

    const subtotal = calculateSubtotal();
    const deliveryFee = 2800;
    const total = subtotal + deliveryFee;

    const orderPayload = {
      userId,
      items: cartItems.map((item) => ({
        product: item.productId._id,
        name: item.productId.productName,
        variant: item.productId.productNumber || item.productId.variant,
        price: item.productId.productPrice,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      address: selectedAddress,
      paymentType: paymentMethod,
      subtotal,
      deliveryFee,
      total,
    };

    try {
      if (paymentMethod === "Bank Transfer") {
        const response = await axiosInstance.post("/api/order/create", orderPayload);
        
        if (response.data.success) {
          toast.success("Order placed successfully!");
          
          // Clear cart after successful order
          await axiosInstance.delete("/api/cart/clear");
          clearCart();
          await fetchCart();
          
          // Reset form
          setFormData({
            fullname: "",
            company: "",
            country: "",
            city: "",
            state: "",
            phone: "",
            email: "",
          });
          setPaymentMethod("");
          setSelectedAddressId("");
          setShowAddressForm(true);
          
          navigate("/my-orders");
        } else {
          toast.error(response.data.message || "Order placement failed");
        }
      } else {
        // Stripe Payment
        const response = await axiosInstance.post("/api/order/stripe", orderPayload);
        
        if (response.data.success) {
          // Store order info for payment success page
          sessionStorage.setItem('pendingOrderId', response.data.orderId);
          sessionStorage.setItem('orderTotal', total.toString());
          
          // Redirect to Stripe checkout - FIXED: use response.data.url instead of data.url
          window.location.href = response.data.url;
          
          // Don't clear cart here - wait for payment success
          // Don't navigate here - user will be redirected by Stripe
        } else {
          toast.error(response.data.message || "Order placement failed");
        }
      }
    } catch (error) {
      console.error("Error placing order:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  }, [cartItems, paymentMethod, userId, selectedAddressId, addresses, formData, navigate, fetchCart, clearCart, calculateTotal]);

  const selectedAddress = selectedAddressId
    ? addresses.find((addr) => addr._id === selectedAddressId)
    : null;

  return (
    <div className="my-20 px-4 md:px-10">
      <h1 className="text-xl py-5">Order Summary {cartItems.length} item(s)</h1>
      
      {/* Order Items */}
      <div className="md:flex gap-5 border-t-2 border-b-2 border-[#F3F0F0] pt-5 pb-10">
        <div className="md:grid md:grid-cols-1 ">
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <div key={item.productId._id || index} className="mb-5 md:flex gap-5">
                <img 
                  className="md:w-60 md:h-70 h-50 w-50 mt-5"
                  src={
                    item.productId?.productImage?.length > 0
                      ? item.productId.productImage[0]
                      : '/placeholder.jpg'
                  }
                  alt={item.productId.productName || "Product Image"}/>
                <div className="mt-5 md:text- ">
                  <h1 className="text-2xl font-bold">{item.productId.productName || "Untitled Project"}</h1>
                  <h1 className="text-xl mt-1">{item.productId.productNumber || item.productId.variant || "No Variant"}</h1>
                  <p className="md:text-[18px] text-sm font-light mb-5">{item.productId.productDescription || "No description available"}</p>
                  <h1 className="text-xl font-semibold">{currency}{item.productId.productPrice || 0}.00</h1>
                  <p className="text-xl mt-2">Quantity: {item.quantity}</p>
                  <Link to={`/modify/${item.productId._id}`}
                    className="bg-red-600 text-white rounded-md px-10 py-2 mt-4 inline-block hover:bg-red-700 transition">
                    Modify Cart
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500 text-lg">No items in cart.</p>
              <Link to="/products" className="bg-red-600 text-white px-6 py-2 rounded mt-4 inline-block">
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="md:w-1/2 border-l-2 border-[#F3F0F0] pl-7 pt-6 md:ml-15">
          <div className="flex justify-between mb-4">
            <h1 className="text-xl">Subtotal</h1>
            <h1 className="text-xl">{currency}{calculateSubtotal().toLocaleString()}</h1>
          </div>
          <div className="flex justify-between mb-10">
            <h1 className="text-xl">Delivery fee</h1>
            <h1 className="text-xl">{currency}2,800</h1>
          </div>
          <div className="flex justify-between border-t-2 pt-5 border-[#F3F0F0]">
            <h1 className="text-xl font-semibold">Total</h1>
            <h1 className="text-xl font-semibold">{currency}{calculateTotal().toLocaleString()}</h1>
          </div>
        </div>
      </div>

      <div className="flex border-b-2 pt-10 border-[#F3F0F0]">
        <h1 className="w-1/2 md:text-2xl text-xl font-bold mb-5">SHIPPING ADDRESS</h1>
        <h1 className="hidden md:block text-xl md:text-2xl font-bold">CHECKOUT</h1>
      </div>

      <form onSubmit={handleSubmit} className="md:flex gap-8 pt-10">
        {/* Address Section */}
        <div className="w-80 md:w-1/2 space-y-5">
          {showAddressForm ? (
            <>
              <div>
                <label className="block mb-2 text-lg font-light">Select Existing Address</label>
                <select value={selectedAddressId}
                  onChange={(e) => { setSelectedAddressId(e.target.value);
                    if (e.target.value) setShowAddressForm(false);
                  }}
                  className="w-3/4 p-3 border border-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-300">
                  <option value='' >Add or select an address</option>
                  {addresses.map((addr) => (
                    <option key={addr._id} value={addr._id}>
                      {addr.fullname}, {addr.city}, {addr.country}
                    </option>
                  ))}
                </select>
              </div>
              
              {[
                { label: "Full name", name: "fullname", required: true },
                { label: "Company name (optional)", name: "company", required: false },
                { label: "Country / Region", name: "country", required: true },
                { label: "Town / City", name: "city", required: true },
                { label: "State", name: "state", required: true },
                { label: "Phone", name: "phone", required: true },
                { label: "Email address", name: "email", type: "email", required: true },
              ].map(({ label, name, type = "text", required }) => (
                <div key={name}>
                  <label className="block mb-2 text-lg font-light" htmlFor={name}>
                    {label}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type={type}
                    value={formData[name] || ""}
                    onChange={handleChange}
                    className="w-3/4 p-3 border border-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-300"
                    required={required}
                  />
                </div>
              ))}
              
              <button type="button" onClick={handleSaveAddress} className="w-3/4 p-3 mt-2 text-white bg-red-400 hover:bg-red-500 rounded-lg text-sm font-light transition">
                Save Address
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Selected Address</h2>
              {selectedAddress ? (
                <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                  <p><strong>Name:</strong> {selectedAddress.fullname}</p>
                  {selectedAddress.company && <p><strong>Company:</strong> {selectedAddress.company}</p>}
                  <p><strong>Address:</strong> {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.country}</p>
                  <p><strong>Phone:</strong> {selectedAddress.phone}</p>
                  <p><strong>Email:</strong> {selectedAddress.email}</p>
                </div>
              ) : (
                <p className="text-gray-500">No address selected.</p>
              )}
              <button 
                type="button" 
                onClick={handleChangeAddress} 
                className="w-3/4 p-3 mt-2 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-light transition"
              >
                Change Address
              </button>
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div className="w-full md:w-1/2 mt-10 md:mt-0">
          <h1 className="block md:hidden mb-4 text-2xl font-bold">CHECKOUT</h1>
          <div className="bg-[#FFF8F8] rounded-xl px-6 pt-10 pb-6">
            
            {/* Bank Transfer Option */}
            <label className="flex items-center gap-4 mb-4 cursor-pointer">
              <input type="radio"  name="payment" 
                checked={paymentMethod === "Bank Transfer"}
                onChange={() => setPaymentMethod("Bank Transfer")}
                className="w-5 h-5 border-red-600 text-red-600 focus:ring-red-500"
                required/>
              <span className="text-base font-medium">Direct bank transfer</span>
            </label>
            
            {paymentMethod === "Bank Transfer" && (
              <div className="bg-gray-100 rounded-xl mt-4 mb-6 w-full md:ml-6 text-sm">
                <div className="px-4 py-3 text-xs leading-relaxed text-gray-700">
                  Make your payment directly into our bank account.
                  <br />
                  Please use your Order ID as the payment reference.
                  <br />
                  Your order will not be shipped until the funds have cleared in our account.
                </div>
              </div>
            )}
            
            {/* Online Payment Option */}
            <label className="flex items-center gap-4 mb-4 cursor-pointer">
              <input 
                type="radio"  
                name="payment"
                checked={paymentMethod === "Online Payment"}
                onChange={() => setPaymentMethod("Online Payment")}
                className="w-5 h-5 border-red-600 text-red-600 focus:ring-red-500"
                required
              />
              <span className="md:text-base text-sm font-medium">Secured Online Payment</span>
              <img 
                className="md:w-max md:max-w-[300px] w-30 mt-2 md:mt-0 object-contain" 
                src={assets.checkpay} 
                alt="payment options" 
              />
            </label>
            
            {paymentMethod === "Online Payment" && (
              <div className="bg-blue-50 rounded-xl mt-4 mb-6 w-full md:ml-6 text-sm">
                <div className="px-4 py-3 text-xs leading-relaxed text-blue-700">
                  You will be redirected to our secure payment processor to complete your transaction.
                  <br />
                  We accept all major credit and debit cards.
                </div>
              </div>
            )}
            
            <div className="md:ml-6 ml-2 pb-4 md:pt-6 pt-4">
              <small className="md:text-[15px] text-[12px] leading-relaxed text-gray-600">
                Your personal data will be used to process your order, support your
                experience throughout this website, and for other purposes described in our privacy policy.
              </small>
            </div>
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full p-3 bg-red-600 text-white rounded-lg text-sm font-light mt-6 hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={isSubmitting || cartItems.length === 0}>
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Processing...
              </span>
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckOut;