import React, { useEffect, useState } from 'react';
import { assets, currency } from '../assets/assets';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import Pargination from '../components/Pargination';
import ViewToggle from '../components/ViewToggle';
import SortBtn from '../components/SortBtn';
import RecentlyView from '../components/RecentlyView';
import axiosInstance from '../../axios';
import { useAppContext } from '../context/appContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Products = () => {
  const [isHover, setIsHover] = useState(null);
  const [activeView, setActiveView] = useState('grid');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const productsPerPage = 10;
  const { addToCart, addToWishlist, searchQuery } = useAppContext();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  const filterParam = queryParams.get('filter');


  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const filterCategory = sessionStorage.getItem('filterCategory');
        const filterProductType = sessionStorage.getItem('filterProductType');
        const filterGender = sessionStorage.getItem('filterGender');

        console.log('Filters found:', { filterCategory, filterProductType, filterGender });

        let filteredProducts = [];

        const response = await axiosInstance.get('/api/product');
        
        if (response.data.success) {
          let allProducts = response.data.products.filter(p => p.inStock !== false && p.productStock > 0);
          
          if (filterCategory && filterProductType) {
            filteredProducts = allProducts.filter(product => {
              const matchesCategory = product.category?.name === filterCategory;
              const matchesProductType = product.productName?.toUpperCase().includes(filterProductType);
              
              return matchesCategory && matchesProductType;
            });
          } else if (filterGender) {
            filteredProducts = allProducts.filter(product => {
              const matchesGender = product.category?.name === (filterGender === 'Male' ? 'Men' : 'Women');
              return matchesGender;
            });
          } else {
            filteredProducts = allProducts;
          }
        }

        setProducts(filteredProducts);
        setFilteredProducts(filteredProducts);

        sessionStorage.removeItem('filterCategory');
        sessionStorage.removeItem('filterProductType');
        sessionStorage.removeItem('filterGender');

      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location]); 


  useEffect(() => {
    let updatedProducts = [...products];

    if (searchQuery?.length > 0) {
      updatedProducts = updatedProducts.filter(product =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryParam) {
      updatedProducts = updatedProducts.filter(product =>
        product.productCategory?.toLowerCase() === categoryParam.toLowerCase()
      );
    }
  
    if (filterParam) {
      updatedProducts = updatedProducts.filter(product =>
        product.productFor?.toLowerCase() === filterParam.toLowerCase()
      );
    }

    setFilteredProducts(updatedProducts);
    setCurrentPage(1);
  }, [products, searchQuery, categoryParam, filterParam]);

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
        <Link to='/' type="button">
          <p>Home</p>
        </Link>
        <svg width="8" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m1 15 7.875-7L1 1" stroke="#6B7280" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p>All Products</p>
      </div>

      <div className='md:mx-10 mx-2 border-3 rounded-xl border-gray-200 pt-15 mt-10 pb-8 px-3 md:px-10'>
        <div className='flex justify-between mb-2 md:mb-5'>
          <h1 className='md:text-2xl text-xl font-bold'>All Products</h1>
          <div>
            <SortBtn 
              data={filteredProducts} 
              setData={setFilteredProducts}
              defaultSort="Most Sold"
            />
          </div>
        </div>

        <div className='border-b-2 border-t-2 p-10 border-gray-200 flex justify-end'>
          <ViewToggle activeView={activeView} setActiveView={setActiveView} />
        </div>

        <div className={`${
            activeView === 'grid' ? 'grid grid-cols-2 md:grid-cols-5 md:gap-4 gap-2' : 'flex flex-col gap-6'
          } md:mb-32`}>
          {currentProducts.length > 0 ? (
            currentProducts.map((category, index) => (
              <div key={category._id}
                className={`hover:-translate-y-1 hover:shadow-2xl transition duration-300 rounded ${
                  activeView === 'grid' ? 'md:pt-8 pt-3' : 'flex gap-6 items-center'
                }`}>
                <div
                  onMouseEnter={() => setIsHover(index)}
                  onMouseLeave={() => setIsHover(null)}
                  className={activeView === 'list' ? 'flex w-full pt-2' : ''}>
                  <Link to={`/product/${category._id}`} className="block">
                    <img className={`rounded-t object-cover ${ activeView === 'list' ? 'md:w-65 h-32 w-24 md:h-65 rounded' : 'w-full h-40 md:h-60' }`}
                      src={category.productImage && category.productImage.length > 0 ? category.productImage[0]  : '/placeholder.jpg' } alt={category.productName}/>
                  </Link>
                  <div className={activeView === 'list' ? 'pl-6 flex-1' : 'pl-3'}>
                    <h5 className='md:text-xl md:mt-3 mt-1 mb-1 font-bold truncate'>{category.productName}</h5>
                    <p className='md:text-lg mb-2 md:mb-4 text-gray-600'>{category.productNumber}</p>
                    <div className="overflow-hidden">
                      <p className="text-gray-500 md:text-sm text-xs line-clamp-2 md:line-clamp-3">
                        {category.productDescription}
                      </p>
                    </div>
                    <p className='font-semibold mt-3 mb-2 md:text-xl text-sm md:mb-5 '>
                      {currency}{category.productPrice}
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
                      <p className='ml-2 text-xs md:text-sm text-gray-600'>
                        {category.ratings ? category.ratings.toFixed(1) : '0.0'}
                      </p>
                    </div>
                    <div className='relative'>
                      <div className={`absolute ${
                          isHover === index ? 'flex' : 'hidden'
                        } ${activeView === 'list'
                          ? 'flex-col md:flex-row mt-1'
                          : 'flex-row'} md:gap-4 gap-2 w-full z-10`}>
                        <button
                          className='flex items-center justify-center gap-2 border border-red-500 md:px-5 md:py-2 px-2 py-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer'
                          onClick={() => handleAddToWishlist(category)}>
                          <img src={assets.wishlove} alt='Add to Wishlist' className='md:h-4 md:w-4 hidden md:block' />
                          <span className='text-red-600 font-semibold text-xs md:text-sm'>Wishlist</span>
                        </button>
                        <button
                          className='flex items-center justify-center gap-2 bg-red-600 text-white md:px-5 md:py-2 px-2 py-1 rounded-md hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                          onClick={() => handleAddToCart(category)}
                          disabled={category.productStock <= 0}
                        >
                          <img src={assets.wishcart} alt='Add to Cart' className='h-4 w-4 hidden md:block' />
                          <span className='font-semibold text-xs md:text-sm'>
                            {category.productStock <= 0 ? 'Out of Stock' : 'Buy Now'}
                          </span>
                        </button>
                      </div>
                      <div className={`${
                        activeView === 'list' ? 'min-h-24 md:min-h-16' : 'min-h-14'
                      }`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-500 text-lg">No products found.</p>
            </div>
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