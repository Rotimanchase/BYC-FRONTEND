import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assets, currency } from '../assets/assets';
import axiosInstance from '../../axios';

const ByCatergory = () => {
  const [itemsPerSlide, setItemsPerSlide] = useState(3);
  const [active, setActive] = useState('men');
  const [activeProductType, setActiveProductType] = useState('T-SHIRT');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const updateItemsPerSlide = () => {
      setItemsPerSlide(window.innerWidth < 768 ? 1 : 3);
    };
    updateItemsPerSlide();
    window.addEventListener("resize", updateItemsPerSlide);
    return () => window.removeEventListener("resize", updateItemsPerSlide);
  }, []);

  // Fetch products based on active category and product type
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/product');
        
        if (response.data.success) {
          // Filter products based on active category and product type
          const filteredProducts = response.data.products.filter(product => {
            const categoryMap = {
              'men': 'Men',
              'women': 'Women', 
              'kids': 'Children'
            };
            
            const matchesCategory = product.category?.name === categoryMap[active];
            const matchesProductType = product.productName?.toUpperCase().includes(activeProductType);
            const isInStock = product.inStock !== false && product.productStock > 0;
            
            return matchesCategory && matchesProductType && isInStock;
          });

          setProducts(filteredProducts);
          setCurrentSlide(0); // Reset carousel when products change
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [active, activeProductType]);

  // Reset product type when category changes
  useEffect(() => {
    if (active === 'women') {
      setActiveProductType('CAMISOLE');
    } else {
      setActiveProductType('T-SHIRT');
    }
  }, [active]);

  // Group products dynamically for carousel
  const groupedProducts = [];
  for (let i = 0; i < products.length; i += itemsPerSlide) {
    groupedProducts.push(products.slice(i, i + itemsPerSlide));
  }

  const handlePrev = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? Math.max(groupedProducts.length - 1, 0) : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentSlide((prev) =>
      prev === Math.max(groupedProducts.length - 1, 0) ? 0 : prev + 1
    );
  };

  const tabs = [
    { label: 'For Women', value: 'women' },
    { label: 'For Men', value: 'men' },
    { label: 'For Kids', value: 'kids' },
  ];

  // Dynamic product types based on selected category
  const getProductTypes = () => {
    if (active === 'women') {
      return [
        { label: 'Camisole', value: 'CAMISOLE' },
        { label: 'Singlet', value: 'SINGLET' },
        { label: 'Pants', value: 'PANTS' },
        { label: 'Boxers', value: 'BOXERS' },
      ];
    } else {
      // Default for men and kids
      return [
        { label: 'T-shirt', value: 'T-SHIRT' },
        { label: 'Singlet', value: 'SINGLET' },
        { label: 'Pants', value: 'PANTS' },
        { label: 'Boxers', value: 'BOXERS' },
      ];
    }
  };

  const productTypes = getProductTypes();

  return (
    <>
      <div className='mt-[50px]'>
        <h2 className='md:text-[40px] text-3xl font-bold flex justify-center mb-8 md:mb-10'>
          Shop By Category
        </h2>

        {/* Category Tabs */}
        <div className='flex text-center justify-center gap-6'>
          {tabs.map((tab) => (
            <div  key={tab.value}  onClick={() => setActive(tab.value)}  className='cursor-pointer'>
              <h1 className={`md:text-3xl text-xl ${ active === tab.value ? 'text-gray-900' : 'text-gray-500 font-light' }`}>
                {tab.label}
              </h1>
              {active === tab.value && (
                <div className='w-full h-0.5 bg-gray-400 rounded-full mt-2'></div>
              )}
            </div>
          ))}
        </div>

        {/* Product Type Buttons */}
        <div className='md:flex grid grid-cols-2 text-center justify-center gap-3 mt-10 w-60 mx-auto md:ml-10 md:w-auto'>
          {productTypes.map((type) => (
            <button key={type.value} onClick={() => setActiveProductType(type.value)} className={`border-1 px-6 py-3 text-xl transition-colors ${
                activeProductType === type.value
                  ? 'bg-red-700 text-white'
                  : 'border-gray-300 hover:bg-gray-50'
              }`} >
              {type.label}
            </button>
          ))}
        </div>

        {/* Products Carousel */}
        <div className="relative w-full py-10 bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <p className="ml-4 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-96">
              <p className="text-gray-600 text-lg">
                No {activeProductType.toLowerCase().replace('-', ' ')} products found in {active}'s category
              </p>
            </div>
          ) : (
            <>
              {/* Carousel Wrapper */}
              <div className="overflow-hidden relative">
                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }} >
                  {groupedProducts.map((group, index) => (
                    <div key={index} className="flex-shrink-0 w-full flex justify-center gap-3" >
                      {group.map((product) => (
                        <div key={product._id} className="flex flex-col items-center" style={{ width: `${80 / itemsPerSlide}%` }} >
                          <Link to={`/product/${product._id}`}>
                            <img  src={ product.productImage && product.productImage.length > 0
                                  ? product.productImage[0] : '/placeholder.jpg' } 
                              alt={product.productName || 'Product'} className="w-150 h-100 object-cover rounded-lg hover:shadow-lg transition-shadow cursor-pointer" />
                          </Link>
                          
                          {/* Product Information */}
                          <div className="mt-6 w-full">
                            <div className='flex gap-3 items-center'>
                              <h3 className="font-bold text-xl truncate">
                                {product.productName}
                              </h3>
                              <p className="text-gray-600 text-lg">
                                {product.productNumber || 'N/A'}
                              </p>
                            </div>
                            <p className="text-xl">
                              {currency}{product.productPrice}
                            </p>
                            
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons - Only show if there are multiple slides */}
                {groupedProducts.length > 1 && (
                  <>
                    {/* Prev Button */}
                    <button onClick={handlePrev}
                      className="absolute top-1/2 left-5 -translate-y-1/2 text-black p-3 cursor-pointer z-10 hover:bg-gray-100 rounded-full transition-colors">
                      <img src={assets.arrowleft} alt="Previous" />
                    </button>

                    {/* Next Button */}
                    <button onClick={handleNext}
                      className="absolute top-1/2 right-5 -translate-y-1/2 cursor-pointer text-black p-3 z-10 hover:bg-gray-100 rounded-full transition-colors" >
                      <img src={assets.arrowright} alt="Next" />
                    </button>
                  </>
                )}
              </div>

              {/* Carousel Indicators */}
              {groupedProducts.length > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  {groupedProducts.map((_, index) => (
                    <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-colors ${
                        currentSlide === index ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ByCatergory;