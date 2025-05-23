import React, { useEffect, useState } from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import { FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/appContext';
import toast from 'react-hot-toast';

const RecentlyView = () => {
  const { recentlyViewed, fetchRecentlyViewed, clearRecentlyViewed, user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRecentlyViewed = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchRecentlyViewed();
      } catch (err) {
        setError('Failed to load recently viewed products');
        console.error('Error fetching recently viewed:', err);
      } finally {
        setLoading(false);
      }
    };
    loadRecentlyViewed();
  }, [fetchRecentlyViewed]);

  const handleClearRecentlyViewed = () => {
    clearRecentlyViewed();
    toast.success('Recently viewed products cleared');
  };

  return (
    <div className='md:mx-10 mx-2 border-3 rounded-xl border-[#F1EEEE] pt-15 pb-8 px-3 md:px-10'>
      <div className='flex justify-between items-center mb-5'>
        <h1 className='md:text-2xl text-sm font-bold'>Recently Viewed</h1>
        <div className='flex items-center space-x-4'>
          {recentlyViewed.length > 0 && (
            <button
              onClick={handleClearRecentlyViewed}
              className='text-[9px] md:text-xl text-red-500 hover:underline'
            >
              Clear Recently Viewed
            </button>
          )}
          <Link to={'#'} className='flex items-center text-[9px] md:text-xl text-red-500'>
            <p>See all</p>
            <FiChevronRight />
          </Link>
        </div>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4 border-t-3 border-[#F1EEEE]'>
        {loading ? (
          <div className='col-span-5 text-center py-8'>
            <p className='text-gray-600'>Loading recently viewed products...</p>
          </div>
        ) : error ? (
          <div className='col-span-5 text-center py-8'>
            <p className='text-red-500'>{error}</p>
          </div>
        ) : recentlyViewed.length > 0 ? (
          recentlyViewed.map((product) => (
            <div
              key={product._id}
              className='hover:-translate-y-[5px] hover:shadow-2xl transition duration-300 md:pt-8 pt-3 rounded'>
              <Link to={`/product/${product._id}`}>
                <img
                  className='w-full rounded-t-[5px] md:h-60 h-40'
                  src={
                    product.productImage && product.productImage.length > 0
                      ? product.productImage[0]
                      : '/placeholder.jpg'
                  }
                  alt={product.productName}/>
              </Link>
              <h5 className='md:text-xl pl-3 mt-3 mb-1 font-bold'>{product.productName || 'Unnamed Product'}</h5>
              <p className='md:text-[18px] pl-3 mb-4'>{product.productNumber}</p>
              <div className="overflow-hidden pl-3">
                <p className="text-gray-500 md:text-sm text-xs line-clamp-2 md:line-clamp-3">
                  {product.productDescription}
                </p>
              </div>
              <p className='pl-3 md:text-xl text-sm font-semibold mt-3 mb-5'>
                ₦{product.productPrice ? product.productPrice.toLocaleString() : '0'}
              </p>
              <div className='flex items-center pl-3 mb-5'>
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
                <p className='ml-2 text-xs md:text-sm'>{product.ratings ? product.ratings.toFixed(1) : '0.0'}</p>
              </div>
            </div>
          ))
        ) : (
          <div className='col-span-5 text-center py-8'>
            <p className='text-gray-600'>No recently viewed products.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentlyView;