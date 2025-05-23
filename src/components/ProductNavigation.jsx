import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const ProductNavigation = ({ compact = false }) => {
  const [openCategory, setOpenCategory] = useState(null);
  const [openGender, setOpenGender] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const categories = [
    {
      name: 'CHILDREN',
      link: '/children',
      subcategories: [
        { name: 'Boxers', action: () => handleCategoryFilter('Children', 'BOXERS') },
        { name: 'Pants', action: () => handleCategoryFilter('Children', 'PANTS') },
        { name: 'T-shirts', action: () => handleCategoryFilter('Children', 'T-SHIRT') },
        { name: 'Singlet', action: () => handleCategoryFilter('Children', 'SINGLET') },
        { name: 'Towels', action: () => handleCategoryFilter('Children', 'TOWELS') },
      ],
    },
    {
      name: 'MEN',
      link: '/men',
      subcategories: [
        { name: 'Boxers', link: '/boxer' },
        { name: 'Pants', action: () => handleCategoryFilter('Men', 'PANTS') },
        { name: 'T-shirts', action: () => handleCategoryFilter('Men', 'T-SHIRT') },
        { name: 'Singlet', action: () => handleCategoryFilter('Men', 'SINGLET') },
        { name: 'Towels', action: () => handleCategoryFilter('Men', 'TOWELS') },
      ],
    },
    {
      name: 'WOMEN',
      link: '/women',
      subcategories: [
        { name: 'Camisole', link: '/camisole' },
        { name: 'Pants', action: () => handleCategoryFilter('Women', 'PANTS') },
        { name: 'T-shirts', action: () => handleCategoryFilter('Women', 'T-SHIRT') },
        { name: 'Singlet', action: () => handleCategoryFilter('Women', 'SINGLET') },
        { name: 'Towels', action: () => handleCategoryFilter('Women', 'TOWELS') },
      ],
    },
  ];

  const genderCategories = [
    { name: 'MALE', action: () => handleGenderFilter('Male') },
    { name: 'FEMALE', action: () => handleGenderFilter('Female') },
  ];

  const handleCategoryFilter = (category, productType) => {
    sessionStorage.setItem('filterCategory', category);
    sessionStorage.setItem('filterProductType', productType);
    
    navigate(`/product?t=${Date.now()}`);
    handleLinkClick();
  };

  const handleGenderFilter = (gender) => {
    sessionStorage.setItem('filterGender', gender);
    navigate(`/product?t=${Date.now()}`);
    handleLinkClick();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenCategory(null);
        setOpenGender(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {document.removeEventListener('mousedown', handleClickOutside);};
  }, []);

  const toggleCategory = (event, categoryName) => {
    event.stopPropagation();
    setOpenCategory(openCategory === categoryName ? null : categoryName);
    setOpenGender(null);
  };

  const toggleGender = (event, genderName) => {
    event.stopPropagation();
    setOpenGender(openGender === genderName ? null : genderName);
  };

  const handleLinkClick = () => {
    setOpenCategory(null);
    setOpenGender(null);
  };

  return (
    <div className={`w-full ${compact ? 'px-4' : 'px-4'} `} ref={dropdownRef}>
      <div className="bg-[#F5F5F5] p-4">
        <Link  to="/product"  className="font-bold text-xl" onClick={handleLinkClick} >
          ALL PRODUCTS
        </Link>
      </div>

      <div className="px-4 md:px-[49px] bg-[#BD3A3A] text-white text-[16px] md:text-[20px] font-bold">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <div key={category.name} className={`relative ${!compact && category.name === 'MEN' ? 'md:ml-[268.8px]' : ''}`} >
              <button onClick={(e) => toggleCategory(e, category.name)} className="px-4 py-3 flex items-center hover:bg-red-700 focus:outline-none">
                {category.name}
                <FiChevronDown/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {openCategory === 'CHILDREN' && (
        <div className="bg-[#F5F5F5] shadow-lg absolute left-0 w-full z-10">
          <div className="flex pl-4 md:pl-[49px]">
            <div className="w-32">
              {genderCategories.map((gender) => (
                <div key={gender.name} className="relative">
                  <button onClick={(e) => { e.stopPropagation(); gender.action(); }}
                    className="w-full py-3 px-4 text-left flex items-center justify-between hover:bg-gray-100 text-[16px] md:text-[20px] font-normal" >
                    {gender.name}
                    <FiChevronRight/>
                  </button>
                </div>
              ))}
            </div>

            {openGender && (
              <div className="flex-1 px-4 text-[16px] md:text-[20px] font-normal">
                <div className="flex flex-col gap-4">
                  {categories.find((c) => c.name === 'CHILDREN') ?.subcategories.map((subcat) => (
                      subcat.link ? (
                        <Link key={subcat.name} to={subcat.link} className="block py-2 hover:text-red-600" onClick={handleLinkClick} >
                          {subcat.name}
                        </Link>
                      ) : (
                        <button key={subcat.name} onClick={subcat.action} className="block py-2 hover:text-red-600 text-left w-full" >
                          {subcat.name}
                        </button>
                      )
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {openCategory === 'MEN' && (
        <div className={`bg-[#F5F5F5] ${compact ? 'pl-4' : 'pl-4 md:pl-[470px]'} shadow-lg absolute left-0 w-full z-10`} >
          <div className="px-4 text-[16px] md:text-[20px] font-normal">
            <div className="flex md:pl-8 flex-col gap-[5px]">
              {categories.find((c) => c.name === 'MEN') ?.subcategories.map((subcat) => (
                  subcat.link ? (
                    <Link key={subcat.name} to={subcat.link} className="block py-2 hover:text-red-600" onClick={handleLinkClick}>
                      {subcat.name}
                    </Link>
                  ) : (
                    <button key={subcat.name} onClick={subcat.action} className="block py-2 hover:text-red-600 text-left w-full">
                      {subcat.name}
                    </button>
                  )
                ))}
            </div>
          </div>
        </div>
      )}

      {openCategory === 'WOMEN' && (
        <div className={`bg-[#F5F5F5] ${compact ? 'pl-4' : 'pl-4 md:pl-[576px]'} shadow-lg absolute left-0 w-full z-10`} >
          <div className="px-4 text-[16px] md:text-[20px] font-normal">
            <div className="flex flex-col md:pl-8 gap-[5px]">
              {categories.find((c) => c.name === 'WOMEN') ?.subcategories.map((subcat) => (
                  subcat.link ? (
                    <Link key={subcat.name} to={subcat.link} className="block py-2 hover:text-red-600" onClick={handleLinkClick}>
                      {subcat.name}
                    </Link>
                  ) : (
                    <button key={subcat.name} onClick={subcat.action} className="block py-2 hover:text-red-600 text-left w-full">
                      {subcat.name}
                    </button>
                  )
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductNavigation;