import React, { useState, useEffect, useCallback } from "react";
import { assets, currency } from "../assets/assets";
import axiosInstance from "../../axios";
import { useAppContext } from "../context/appContext";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

const CheckOut = () => {
  const { cart, fetchCart, clearCart } = useAppContext();
  const user = JSON.parse(localStorage.getItem("user")) || null;
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

    setIsSubmitting(true);

    const selectedAddress = selectedAddressId
      ? addresses.find((addr) => addr._id === selectedAddressId)
      : { ...formData };

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
      console.log("Sending order payload:", JSON.stringify(orderPayload, null, 2));
      const response = await axiosInstance.post("/api/order/create", orderPayload);
      console.log("Order response:", JSON.stringify(response.data, null, 2));
      if (response.data.success) {
        toast.success("Order placed successfully!");
        await axiosInstance.delete("/api/cart/clear");
        clearCart();
        await fetchCart();
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
        toast.error(response.data.error || "Order placement failed");
      }
    } catch (error) {
      console.error("Error placing order:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  }, [cartItems, paymentMethod, userId, selectedAddressId, addresses, formData, navigate, fetchCart, clearCart]);

  const selectedAddress = selectedAddressId
    ? addresses.find((addr) => addr._id === selectedAddressId)
    : null;

  return (
    <div className="my-20 px-4 md:px-10">
      <h1 className="text-xl py-5">Order Summary {cartItems.length} item(s)</h1>
      <div className="md:flex gap-5 border-t-2 border-b-2 border-[#F3F0F0] pt-5 pb-10">
        <div className="md:grid md:grid-cols-3">
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <div key={item.productId._id || index} className="mb-5">
                <img
                  className="md:w-70 mt-5"
                  src={
                    Array.isArray(item.productId.productImage)
                      ? `http://localhost:4800${item.productId.productImage[0]}`
                      : typeof item.productId.productImage === "string"
                      ? `http://localhost:4800${item.productId.productImage.split(",")[0]}`
                      : "/placeholder.jpg"
                  }
                  alt={item.productId.productName || "Product Image"}
                />
                <div className="mt-5 text-center">
                  <h1 className="text-2xl font-bold">{item.productId.productName || "Untitled Project"}</h1>
                  <h1 className="text-xl font-semibold mt-1">{item.productId.productNumber || item.productId.variant || "No Variant"}</h1>
                  <p className="text-[18px] font-light mb-5">{item.productId.productDescription || "No description available"}</p>
                  <h1 className="text-xl font-semibold">{currency}{item.productId.productPrice || 0}.00</h1>
                  <p className="text-xl mt-2">Quantity: {item.quantity}</p>
                  <Link
                    to={`/modify/${item.productId._id}`}
                    className="bg-red-600 text-white rounded-md px-10 py-2 mt-4 inline-block">
                    Modify Cart
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>No items in cart.</p>
          )}
        </div>
        <div className="md:w-1/2 border-l-2 border-[#F3F0F0] pl-7 pt-6 md:ml-15">
          <div className="flex justify-between mb-4">
            <h1 className="text-xl">Subtotal</h1>
            <h1 className="text-xl">{currency}{calculateSubtotal()}.00</h1>
          </div>
          <div className="flex justify-between mb-10">
            <h1 className="text-xl">Delivery fee</h1>
            <h1 className="text-xl">{currency}2,800</h1>
          </div>
          <div className="flex justify-between border-t-2 pt-5 border-[#F3F0F0]">
            <h1 className="text-xl font-semibold">Total</h1>
            <h1 className="text-xl font-semibold">{currency}{calculateTotal()}.00</h1>
          </div>
        </div>
      </div>

      <div className="flex border-b-2 pt-10 border-[#F3F0F0]">
        <h1 className="w-1/2 md:text-2xl text-xl font-bold mb-5">SHIPPING ADDRESS</h1>
        <h1 className="hidden md:block text-xl md:text-2xl font-bold">CHECKOUT</h1>
      </div>

      <form onSubmit={handleSubmit} className="md:flex gap-8 pt-10">
        <div className="w-full md:w-1/2 space-y-5">
          {showAddressForm ? (
            <>
              <div>
                <label className="block mb-2 text-lg font-light">Select Existing Address</label>
                <select
                  value={selectedAddressId}
                  onChange={(e) => {
                    setSelectedAddressId(e.target.value);
                    if (e.target.value) setShowAddressForm(false);
                  }}
                  className="w-3/4 p-3 border border-red-600 rounded-md focus:outline-none">
                  <option value="">Add or select an address</option>
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
                  <label className="block mb-2 text-lg font-light" htmlFor={name}>{label}</label>
                  <input
                    id={name}
                    name={name}
                    type={type}
                    value={formData[name] || ""}
                    onChange={handleChange}
                    className="w-3/4 p-3 border border-red-600 rounded-md focus:outline-none"
                    required={required}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleSaveAddress}
                className="w-3/4 p-3 mt-2 text-white bg-blue-600 rounded-lg text-sm font-light">
                Save Address
              </button>
              <button
                type="submit"
                className="w-3/4 p-3 mt-2 text-white bg-red-600 rounded-lg text-sm font-light"
                disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Selected Address</h2>
              {selectedAddress ? (
                <div className="border border-gray-300 rounded-md p-4">
                  <p><strong>Name:</strong> {selectedAddress.fullname}</p>
                  {selectedAddress.company && <p><strong>Company:</strong> {selectedAddress.company}</p>}
                  <p><strong>Address:</strong> {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.country}</p>
                  <p><strong>Phone:</strong> {selectedAddress.phone}</p>
                  <p><strong>Email:</strong> {selectedAddress.email}</p>
                </div>
              ) : (
                <p>No address selected.</p>
              )}
              <button
                type="button"
                onClick={handleChangeAddress}
                className="w-3/4 p-3 mt-2 text-white bg-blue-600 rounded-lg text-sm font-light">
                Change Address
              </button>
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 mt-10 md:mt-0">
          <h1 className="block md:hidden mb-4 text-2xl font-bold">CHECKOUT</h1>
          <div className="bg-[#FFF8F8] rounded-xl px-6 pt-10 pb-6">
            <label className="flex items-center gap-4 mb-4">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "Bank Transfer"}
                onChange={() => setPaymentMethod("Bank Transfer")}
                className="w-5 h-5 border-red-600"
                required
              />
              <span className="text-base">Direct bank transfer</span>
            </label>
            <div className="bg-gray-100 rounded-xl mt-4 mb-10 w-3/4 md:ml-6 text-sm text-muted-foreground">
              <div className="px-4 py-3 leading-relaxed">
                Make your payment directly into our bank account.
                <br />
                Please use your Order ID as the payment reference.
                <br />
                Your order will not be shipped until the funds have cleared in our account.
              </div>
            </div>
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "Online Payment"}
                onChange={() => setPaymentMethod("Online Payment")}
                className="w-5 h-5 border-red-600"
                required
              />
              <span className="text-base">Secured Online Payment</span>
              <img className="w-max max-w-[300px] mt-2 md:mt-0 object-contain" src={assets.checkpay} alt="payment" />
            </label>
            <div className="md:ml-6 ml-2 pb-15 md:pt-25 pt-10">
              <small className="md:text-[15px] text-[12px] leading-relaxed">
                Your personal data will be used to process your order, support your
                experience throughout this website, and for other purposes described in our privacy policy.
              </small>
            </div>
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-red-600 text-white rounded-lg text-sm font-light mt-6 hover:bg-red-700 transition"
            disabled={isSubmitting}>
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckOut;