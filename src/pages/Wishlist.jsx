import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { assets, currency } from '../assets/assets';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppsContext';

const Wishlist = () => {
  const [isHover, setIsHover] = useState(null);
  const [activeView] = useState('grid');
  const { addToCart, wishlist, removeFromWishlist } = useAppContext();

  useEffect(() => {
    // console.log('Wishlist data:', JSON.stringify(wishlist, null, 2));
  }, [wishlist]);

  const handleAddToCart = async (product) => {
    const productId = product?._id || product?.id;
    const quantity = 1;
    const size = null;
    const color = null;

    if (!productId) {
      console.error('No product ID provided for product:', JSON.stringify(product, null, 2));
      toast.error('Cannot add to cart: Invalid product');
      return;
    }

    try {
      await addToCart(productId, quantity, size, color);
      toast.success('Added to cart! Please select size/color in cart.');
    } catch (err) {
      console.error('Failed to add to cart:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    if (removeFromWishlist && productId) {
      removeFromWishlist(productId);
      toast.success('Removed from wishlist!');
    } else {
      console.error('Cannot remove from wishlist. Product ID:', productId);
      toast.error('Unable to remove item from wishlist.');
    }
  };

  // Filter out null or undefined wishlist items
  const validWishlist = Array.isArray(wishlist) ? wishlist.filter(item => item != null) : [];

  return (
    <div className='mt-10'>
      <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white py-8 pl-5 md:pl-15">
        <Link to='/' type="button">
          <p>Home</p>
        </Link>
        <span>/</span>
        <p className='text-red-500'>Wishlist</p>
      </div>

      <div className='md:mx-10 mx-2 pt-15 md:mt-5 pb-8 px-3 md:px-10'>
        <div className='flex justify-between mb-2 md:mb-5'>
          <h1 className='md:text-2xl text-xl font-bold'>Wishlist</h1>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-[20px]'>
          {validWishlist.length > 0 ? (
            validWishlist.map((category, index) => (
              <div
                key={category._id || category.id || index}
                className={`hover:-translate-y-[5px] hover:shadow-2xl transition duration-300 rounded ${
                  activeView === 'grid' ? 'md:pt-8 pt-3' : 'flex gap-6 items-center'
                }`}
              >
                <Link
                  to={`/product/${category._id || category.id || '#'}`}
                  onMouseEnter={() => setIsHover(index)}
                  onMouseLeave={() => setIsHover(null)}
                >
                  <img
                    className='rounded-t-[5px] w-full'
                    src={
                      category.productImage && Array.isArray(category.productImage) && category.productImage.length > 0
                        ? category.productImage[0]
                        : '/placeholder.jpg'
                    }
                    alt={category.productName || 'Product Image'}
                  />
                  <div className='pl-3'>
                    <h5 className='text-xl mt-3 mb-1 font-bold'>{category.productName || 'Untitled Product'}</h5>
                    <p className='text-[18px] mb-4'>{category.productCode || category.productNumber || 'N/A'}</p>
                    {activeView === 'grid' ? (
                      category.productDescription?.split('/')?.map(
                        (sentence, i) =>
                          sentence.trim() && (
                            <p key={i} className="text-[#787885]">
                              {sentence.trim()}
                            </p>
                          )
                      )
                    ) : (
                      <p className="text-[#787885]">
                        {category.productDescription?.replace(/\//g, ' ') || 'No description available'}
                      </p>
                    )}
                    <p className='font-semibold mt-3 mb-5'>
                      {category.productPrice ? `${currency}${category.productPrice.toLocaleString()}` : 'N/A'}
                    </p>
                    <div className='flex items-center mb-5'>
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < Math.floor(category.ratings || 0) ? (
                            <FaStar className="text-yellow-500" />
                          ) : i < Math.ceil(category.ratings || 0) && (category.ratings % 1) >= 0.5 ? (
                            <FaStarHalfAlt className="text-yellow-500" />
                          ) : (
                            <FaRegStar className="text-gray-300" />
                          )}
                        </span>
                      ))}
                      <p className='ml-2'>{category.ratings ? category.ratings.toFixed(1) : '0.0'}</p>
                    </div>
                    <div className='relative'>
                      <div
                        className={`absolute ${
                          isHover === index ? 'flex' : 'hidden'
                        } flex-row md:gap-4 gap-6 w-full`}
                      >
                        <button
                          onClick={() => handleRemoveFromWishlist(category._id || category.id)}
                          className='flex items-center justify-center gap-2 border border-red-500 px-5 py-2 rounded-md cursor-pointer'
                        >
                          <span className='text-red-600 font-semibold'>Remove</span>
                        </button>
                        <button
                          className='flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition cursor-pointer'
                          onClick={() => handleAddToCart(category)}
                        >
                          <img src={assets.wishcart} alt='Add to Cart' className='h-4 w-4' />
                          <span className='font-semibold'>Buy Now</span>
                        </button>
                      </div>
                      <div className='min-h-[55px]'></div>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p>Your wishlist is empty.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;