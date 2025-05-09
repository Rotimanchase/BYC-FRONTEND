import React, { useState, useEffect } from 'react';
import { assets, currency } from '../assets/assets';
import { FiMinus, FiPlus } from 'react-icons/fi';
import RecentlyView from '../components/RecentlyView';
import { useAppContext } from '../context/appContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, fetchCart } = useAppContext();
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    // console.log('Cart state:', cart);
    let total = 0;
    if (Array.isArray(cart)) {
      cart.forEach((item) => {
        if (item.productId && typeof item.productId.productPrice === 'number') {
          total += item.productId.productPrice * item.quantity;
        } else {
          console.warn('Invalid cart item:', item);
        }
      });
    } else {
      console.warn('Cart is not an array:', cart);
    }
    setTotalPrice(total);
    // console.log('Total price calculated:', total);
  }, [cart]);

  const handleIncrease = (productId, size, color) => {
    const item = cart.find(
      (item) =>
        item.productId?._id === productId &&
        (item.size || null) === (size || null) &&
        (item.color || null) === (color || null)
    );
    if (item) {
      if (item.quantity >= item.productId.productStock) {
        toast.error(`Only ${item.productId.productStock} items in stock`);
        return;
      }
      // console.log('Increasing quantity:', { productId, size, color, newQuantity: item.quantity + 1 });
      updateQuantity(productId, item.quantity + 1, size, color);
    } else {
      console.warn('Item not found for increase:', { productId, size, color });
    }
  };

  const handleDecrease = (productId, size, color) => {
    const item = cart.find(
      (item) =>
        item.productId?._id === productId &&
        (item.size || null) === (size || null) &&
        (item.color || null) === (color || null)
    );
    if (item && item.quantity > 1) {
      // console.log('Decreasing quantity:', { productId, size, color, newQuantity: item.quantity - 1 });
      updateQuantity(productId, item.quantity - 1, size, color);
    } else {
      console.warn('Item not found or quantity <= 1:', { productId, size, color });
    }
  };

  const handleRemove = async (productId, size, color) => {
    try {
      // console.log('Removing from cart:', { productId, size, color });
      await removeFromCart(productId, size, color);
      await fetchCart();
      // console.log('Cart after remove:', cart);
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove item from cart.');
    }
  };

  return (
    <>
      <div className="mx-2">
        <div className="md:border-3 my-20 border-[#F3F0F0] py-5 rounded-sm md:mx-10 md:pr-15">
          <h1 className="text-xl pl-15 py-5">Cart ({cart.length} item(s))</h1>
          <div className="mx-4 md:ml-15 border-t-2 border-b-2 border-[#F3F0F0] pt-5 pb-10">
            {Array.isArray(cart) && cart.length > 0 ? (
              cart.map((item, index) => (
                <div
                  key={`${item.productId?._id || 'unknown'}-${item.size || ''}-${item.color || ''}-${index}`}
                  className="mb-10"
                >
                  <div className="md:flex">
                    <img
                      className="md:w-70 mt-5"
                      src={
                        item.productId?.productImage?.length > 0
                          ? `http://localhost:4800${item.productId.productImage[0]}`
                          : '/placeholder.jpg'
                      }
                      alt={item.productId?.productName || 'Product Image'}
                    />
                    <div className="mt-5 md:w-1/3">
                      <h1 className="text-2xl font-bold">{item.productId?.productName || 'Untitled Product'}</h1>
                      <h1 className="text-2xl mb-5 font-semibold mt-1">
                        {item.productId?.productNumber || 'No SKU'}
                      </h1>
                      <h1 className="text-[20px] font-light mb-5">
                        {item.productId?.productDescription || 'No description available'}
                      </h1>
                      {item.size && <p className="text-gray-600">Size: {item.size}</p>}
                      {item.color && <p className="text-gray-600">Color: {item.color}</p>}
                      <div className="flex justify gap-3 mt-9">
                        <a className="flex items-center border border-red-500 text-red-500 rounded-[10px] md:px-15 px-5 py-2 cursor-pointer">
                          <img className="mr-2" src={assets.wishlove} alt="" /> Wishlist
                        </a>
                        <a
                          className="flex items-center bg-red-500 text-white rounded-[10px] md:px-15 px-5 py-2 cursor-pointer"
                          onClick={() => handleRemove(item.productId?._id, item.size, item.color)}
                        >
                          <img className="mr-2" src={assets.cartdel} alt="" />Remove
                        </a>
                      </div>
                    </div>
                    <div className="md:flex md:justify-between">
                      <div className="mt-5 md:text-center md:w-100">
                        <h5 className="font-light text-xl ml-12 md:ml-0">Quantity</h5>
                        <div className="md:flex md:justify-center mt-3 gap-3 cursor-pointer">
                          <button
                            className="bg-red-600 border-0 py-3 px-4"
                            onClick={() => handleDecrease(item.productId?._id, item.size, item.color)}
                          >
                            <FiMinus className="text-white" />
                          </button>
                          <input
                            className="border-0 outline-none text-center w-16"
                            value={item.quantity}
                            disabled
                          />
                          <button
                            className="bg-red-600 border-0 py-3 px-4"
                            onClick={() => handleIncrease(item.productId?._id, item.size, item.color)}
                          >
                            <FiPlus className="text-white" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-5 md:ml-20">
                        <h1 className="text-[20px] font-light mb-5 ml-10 md:ml-0 md:text-center">Unit Price</h1>
                        <h1 className="text-2xl font-bold ml-5 md:ml-0">
                          {currency}
                          {item.productId?.productPrice || 'N/A'}.00
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Your cart is empty.</p>
            )}
          </div>
          <div className="flex md:justify-end ml-5 md:mr-15 pt-7">
            <div className="md:w-1/2">
              <h1 className="text-2xl font-semibold md:ml-30 mb-5">CART TOTALS</h1>
              <div className="flex justify-between">
                <h1 className="text-xl md:ml-30 mb-4">Subtotal</h1>
                <h1 className="text-xl md:mr-10">
                  {currency}
                  {totalPrice}.00
                </h1>
              </div>
              <div className="flex justify-between mb-15">
                <h1 className="text-xl md:ml-30">Total</h1>
                <h1 className="text-xl md:mr-10">
                  {currency}
                  {totalPrice}.00
                </h1>
              </div>
              <div className="flex md:ml-30 gap-5 mb-6">
                <a
                  className="flex items-center border-1 border-red-500 text-red-500 text-sm rounded-[10px] md:px-17 md:py-3 py-2 px-3"
                  href="/product"
                >
                  Continue Shopping
                </a>
                <a
                  className="flex items-center bg-red-500 text-white rounded-[10px] md:px-17 md:py-3 py-2 px-3"
                  href="/checkout"
                >
                  Proceed to Checkout
                </a>
              </div>
            </div>
          </div>
        </div>
        <RecentlyView />
      </div>
    </>
  );
};

export default Cart;