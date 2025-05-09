import React, { useEffect, useState } from 'react';
import { assets, currency } from '../assets/assets';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Pargination from '../components/Pargination';
import ViewToggle from '../components/ViewToggle';
import SortBtn from '../components/SortBtn';
import RecentlyView from '../components/RecentlyView';
import axiosInstance from '../../axios';
import { useAppContext } from '../context/appContext';
import toast from 'react-hot-toast';

const Products = () => {
  const [isHover, setIsHover] = useState(null);
  const [activeView, setActiveView] = useState('grid');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const { addToCart, addToWishlist, searchQuery } = useAppContext();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const api = await axiosInstance.get('/api/product');
        if (api.data.success) {
          setProducts(api.data.products.filter(p => p.inStock));
        } else {
          toast.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Fetch products error:', error.response?.data || error.message);
        toast.error('Error fetching products');
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let updatedProducts = [...products];

    if (searchQuery?.length > 0) {
      updatedProducts = updatedProducts.filter(product =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortOrder === 'price-low') {
      updatedProducts.sort((a, b) => a.productPrice - b.productPrice);
    } else if (sortOrder === 'price-high') {
      updatedProducts.sort((a, b) => b.productPrice - a.productPrice);
    }

    setFilteredProducts(updatedProducts);
    setCurrentPage(1);
  }, [products, searchQuery, sortOrder]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleAddToCart = async (product) => {
    const productId = product._id;
    const quantity = 1;
    const size = null;
    const color = null;

    if (!productId) {
      console.error('No product ID provided for product:', product);
      toast.error('Cannot add to cart: Invalid product');
      return;
    }

    try {
      await addToCart(productId, quantity, size, color);
      // toast.success('Added to cart!');
    } catch (err) {
      console.error('Failed to add to cart:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      await addToWishlist(product);
      toast.success('Added to wishlist!');
    } catch (err) {
      console.error('Failed to add to wishlist:', err.response?.data || err.message);
      toast.error('Failed to add to wishlist');
    }
  };

  return (
    <div className='mt-10'>
      <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white py-8 pl-5 md:pl-15">
        <a href='/' type="button">
          <p>Home</p>
        </a>
        <svg width="8" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m1 15 7.875-7L1 1" stroke="#6B7280" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p>All Products</p>
      </div>

      <div className='md:mx-10 mx-2 border-3 rounded-xl border-[#F1EEEE] pt-15 mt-10 pb-8 px-3 md:px-10'>
        <div className='flex justify-between mb-2 md:mb-5'>
          <h1 className='md:text-2xl text-xl font-bold'>All Products</h1>
          <div>
            <SortBtn setSortOrder={setSortOrder} />
          </div>
        </div>

        <div className='border-b-2 border-t-2 p-10 border-[#F1EEEE] flex justify-end'>
          <ViewToggle activeView={activeView} setActiveView={setActiveView} />
        </div>

        <div
          className={`${
            activeView === 'grid' ? 'grid grid-cols-1 md:grid-cols-5 gap-4' : 'flex flex-col gap-6'
          } md:mb-[150px]`}>
          {currentProducts.length > 0 ? (
            currentProducts.map((category, index) => (
              <div
                key={category._id}
                className={`hover:-translate-y-[5px] hover:shadow-2xl transition duration-300 rounded ${
                  activeView === 'grid' ? 'md:pt-8 pt-3' : 'flex gap-6 items-center'
                }`}>
                <div
                  onMouseEnter={() => setIsHover(index)}
                  onMouseLeave={() => setIsHover(null)}
                  className={activeView === 'list' ? 'flex w-full pl-5' : ''}>
                  <Link to={`/product/${category._id}`} className="block">
                    <img
                      className={`rounded-t-[5px] ${
                        activeView === 'list'
                          ? 'md:w-[150px] h-[110px] md:h-[150px] object-cover rounded'
                          : 'w-full'
                      }`}
                      src={
                        category.productImage && category.productImage.length > 0
                          ? `http://localhost:4800${category.productImage[0]}`
                          : '/placeholder.jpg'
                      }
                      alt={category.productName}
                    />
                  </Link>
                  <div className={activeView === 'list' ? 'pl-6' : 'pl-3'}>
                    <h5 className='text-xl mt-3 mb-1 font-bold'>{category.productName}</h5>
                    <p className='text-[18px] mb-4'>{category.productNumber}</p>
                    {category.productDescription.split('/').map(
                      (sentence, i) =>
                        sentence.trim() && (
                          <p key={i} className="text-[#787885]">
                            {sentence.trim()}
                          </p>
                        )
                    )}
                    <p className='font-semibold mt-3 mb-5'>{currency}{category.productPrice}</p>
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
                        } ${activeView === 'list'
                          ? 'flex-col md:flex-row mt-1'
                          : 'flex-row'} md:gap-4 gap-6 w-full`}>
                        <button
                          className='flex items-center justify-center gap-2 border border-red-500 px-5 py-2 rounded-md cursor-pointer'
                          onClick={() => handleAddToWishlist(category)}>
                          <img src={assets.wishlove} alt='Add to Wishlist' className='h-4 w-4' />
                          <span className='text-red-600 font-semibold'>Wishlist</span>
                        </button>
                        <button
                          className='flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition cursor-pointer'
                          onClick={() => handleAddToCart(category)}
                          disabled={category.productStock <= 0}
                        >
                          <img src={assets.wishcart} alt='Add to Cart' className='h-4 w-4' />
                          <span className='font-semibold'>Buy Now</span>
                        </button>
                      </div>
                      <div className={`${
                        activeView === 'list' ? 'min-h-[100px] md:min-h-[65px]' : 'min-h-[55px]'
                      }`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>

        <div className='mb-10 mt-5'>
          <Pargination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      <div className='mt-10'>
        <RecentlyView />
      </div>
    </div>
  );
};

export default Products;