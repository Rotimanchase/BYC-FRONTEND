import React, { useState, useEffect } from 'react';
import { FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ViewToggle from '../components/ViewToggle';
import SortBtn from '../components/SortBtn';
import { assets, currency } from '../assets/assets';
import axiosInstance from '../../axios';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppsContext';

const Boxers = () => {
  const [isHover, setIsHover] = useState(null);
  const [activeView, setActiveView] = useState('grid');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToWishlist, addToCart, addRecentlyViewed } = useAppContext();

  useEffect(() => {
    const fetchBoxers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all products and filter client-side for better control
        let response = await axiosInstance.get('/api/product');
        
        let boxerProducts = [];
        
        if (response.data.success ) {
          boxerProducts = response.data.products.filter(product => {
            if (!product.productName) return false;
            
            const productNameUpper = product.productName.toUpperCase();
            const hasBoxerInName = productNameUpper.includes('BOXERS');
            
            // Check if it's a men's category product
            const isMenCategory = (product.category && product.category.name === 'Men') 
            
            // Check if it's in stock
            const isInStock = product.inStock !== false && product.productStock > 0;

            return hasBoxerInName && isMenCategory && isInStock;
          });
        }

        console.log('Found boxer products:', boxerProducts);
        const filteredBoxers = boxerProducts;

        setProducts(filteredBoxers);
        setFilteredProducts(filteredBoxers);
        
      } catch (err) {
        console.error('Error fetching boxers:', err);
        setError('Error loading boxers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBoxers();
  }, []);

  const handleWishlist = async (product) => {
    try {
      await addToWishlist(product);
      toast.success('Added to wishlist');
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
    }
  };

  const handleCart = async (productId) => {
    try {
      await addToCart(productId, 1, null, null);
      // Optional: show success message
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const handleProductClick = (productId) => {
    addRecentlyViewed(productId);
  };

  return (
    <div className='mt-10'>
      <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white py-8 pl-5 md:pl-15">
        <Link to='/' type="button">
          <p>Home</p>
        </Link>
        <svg width="8" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m1 15 7.875-7L1 1" stroke="#6B7280" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p>Men</p>
        <svg width="8" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m1 15 7.875-7L1 1" stroke="#6B7280" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className='text-red-500'>Boxers</p>
      </div>

      <div className='md:mx-10 mx-2 pt-15 md:mt-5 pb-8 px-3 md:px-10'>
        <div className='flex justify-between mb-2 md:mb-5'>
          <h1 className='md:text-2xl text-xl font-bold'>Men's Boxers</h1>
          <div>
            <SortBtn 
              variant="red"
              data={filteredProducts}
              setData={setFilteredProducts}
              defaultSort="Most Sold"
            />
          </div>
        </div>

        <div className='border-b-2 border-t-2 p-10 border-gray-200 flex justify-between'>
          <p className='mt-5'>
            {loading ? 'Loading...' : `${filteredProducts.length} Boxer Product${filteredProducts.length !== 1 ? 's' : ''} Found`}
          </p>
          <ViewToggle activeView={activeView} setActiveView={setActiveView} />
        </div>

        {loading ? (
          <div className='text-center py-16'>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <p className='text-gray-600 mt-4'>Loading boxers...</p>
          </div>
        ) : error ? (
          <div className='text-center py-16'>
            <p className='text-red-500 text-lg'>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className='text-center py-16'>
            <p className='text-gray-500 mt-2'>Check back later for new arrivals!</p>
          </div>
        ) : (
          <div
            className={`${
              activeView === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-5 md:gap-4 gap-2' 
                : 'flex flex-col gap-6'
            } mb-8 mt-8`} >
            {filteredProducts.map((product, index) => (
              <div key={product._id}
                className={`hover:-translate-y-1 hover:shadow-2xl transition duration-300 rounded ${
                  activeView === 'grid' ? 'md:pt-8 pt-3' : 'flex gap-6 items-center'
                }`} >
                <div 
                  onMouseEnter={() => setIsHover(index)}
                  onMouseLeave={() => setIsHover(null)}
                  onClick={() => handleProductClick(product._id)}
                  className={activeView === 'list' ? 'flex w-full pl-5' : ''}>
                  <Link to={`/product/${product._id}`} className="block">
                    <img className={`rounded-t object-cover ${
                        activeView === 'list'
                          ? 'md:w-full h-32 w-24 md:h-full rounded'
                          : 'w-full h-40 md:h-60'}`}
                      src={product.productImage && product.productImage.length > 0
                          ? product.productImage[0]
                          : '/placeholder.jpg'} alt={product.productName} loading="lazy"/>
                  </Link>
                  <div className={activeView === 'list' ? 'pl-6 flex-1' : 'pl-3'}>
                    <h5 className='md:text-xl md:mt-3 mt-1 mb-1 font-bold truncate'>
                      {product.productName}
                    </h5>
                    <p className='md:text-lg mb-2 md:mb-4 text-gray-600'>
                      {product.productNumber}
                    </p>
                    
                    {product.productDescription && (
                      <div className="line-clamp-2 md:line-clamp-none overflow-hidden">
                        {product.productDescription.split('/').map(
                          (sentence, i) =>
                            sentence.trim() && (
                              <p key={i} className="text-gray-500 md:text-sm text-xs mb-1">
                                {sentence.trim()}
                              </p>
                            )
                        )}
                      </div>
                    )}
                    
                    <p className='font-semibold mt-3 mb-2 md:text-xl text-sm md:mb-5 text-green-600'>
                      {currency}{product.productPrice}
                    </p>
                    
                    <div className='flex items-center mb-5'>
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < Math.floor(product.ratings || 0) ? (
                            <FaStar className="text-yellow-500" />
                          ) : i < Math.ceil(product.ratings || 0) && (product.ratings % 1) >= 0.5 ? (
                            <FaStarHalfAlt className="text-yellow-500" />
                          ) : (
                            <FaRegStar className="text-gray-300" />
                          )}
                        </span>
                      ))}
                      <p className='ml-2 text-sm text-gray-600'>
                        {product.ratings ? product.ratings.toFixed(1) : '0.0'}
                      </p>
                    </div>
                    
                    <div className='relative'>
                      <div className={`absolute ${
                          isHover === index ? 'flex' : 'hidden'
                        } ${
                          activeView === 'list' 
                            ? 'flex-col md:flex-row mt-1' 
                            : 'flex-row'
                        } md:gap-4 gap-2 w-full z-10`}
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleWishlist(product);
                          }}
                          className='flex items-center justify-center gap-2 border border-red-500 md:px-5 md:py-2 px-2 py-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer'
                        >
                          <img src={assets.wishlove} alt='Add to Wishlist' className='md:h-4 md:w-4 hidden md:block' />
                          <span className='text-red-600 font-semibold text-xs md:text-sm'>Wishlist</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleCart(product._id);
                          }}
                          className='flex items-center justify-center gap-2 bg-red-600 text-white md:px-5 md:py-2 px-2 py-1 rounded-md hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50'
                          disabled={product.productStock <= 0}
                        >
                          <img src={assets.wishcart} alt='Add to Cart' className='md:h-4 md:w-4 hidden md:block' />
                          <span className='font-semibold text-xs md:text-sm'>
                            {product.productStock <= 0 ? 'Out of Stock' : 'Buy Now'}
                          </span>
                        </button>
                      </div>
                      <div
                        className={`${
                          activeView === 'list' ? 'min-h-24 md:min-h-16' : 'min-h-14'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Boxers;