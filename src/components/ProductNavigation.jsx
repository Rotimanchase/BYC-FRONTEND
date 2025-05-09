import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProductNavigation = ({ compact = false }) => {
  const [openCategory, setOpenCategory] = useState(null);
  const [openGender, setOpenGender] = useState(null);
  const dropdownRef = useRef(null);

  const categories = [
    {
      name: 'CHILDREN',
      link: '/children',
      subcategories: [
        { name: 'Boxers', link: '/children/boxers' },
        { name: 'Pants', link: '/children/pants' },
        { name: 'T-shirts', link: '/children/t-shirts' },
        { name: 'Singlet', link: '/children/singlet' },
        { name: 'Towels', link: '/children/towels' },
      ],
    },
    {
      name: 'MEN',
      link: '/men',
      subcategories: [
        { name: 'Boxers', link: '/boxer' },
        { name: 'Pants', link: '/men/pants' },
        { name: 'T-shirts', link: '/men/t-shirts' },
        { name: 'Singlet', link: '/men/singlet' },
        { name: 'Towels', link: '/men/towels' },
      ],
    },
    {
      name: 'WOMEN',
      link: '/women',
      subcategories: [
        { name: 'Camisole', link: '/camisole' },
        { name: 'Pants', link: '/women/pants' },
        { name: 'T-shirts', link: '/women/t-shirts' },
        { name: 'Singlet', link: '/women/singlet' },
        { name: 'Towels', link: '/women/towels' },
      ],
    },
  ];

  const genderCategories = [
    { name: 'MALE', link: '/male' },
    { name: 'FEMALE', link: '/female' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        console.log('ProductNavigation: Clicked outside, closing submenus');
        setOpenCategory(null);
        setOpenGender(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleCategory = (event, categoryName) => {
    event.stopPropagation(); // Prevent click from reaching Navbar's handleClickOutside
    console.log('Toggling category:', categoryName, 'current state:', openCategory);
    setOpenCategory(openCategory === categoryName ? null : categoryName);
    setOpenGender(null);
  };

  const toggleGender = (event, genderName) => {
    event.stopPropagation();
    console.log('Toggling gender:', genderName, 'current state:', openGender);
    setOpenGender(openGender === genderName ? null : genderName);
  };

  return (
    <div className={`w-full ${compact ? 'px-4' : 'px-4'} `} ref={dropdownRef}>
      {/* Main Navigation */}
      <div className="bg-[#F5F5F5] p-4">
        <Link to={'/product'} className="font-bold text-xl">ALL PRODUCTS</Link>
      </div>

      {/* Categories Bar */}
      <div className="px-4 md:px-[49px] bg-[#BD3A3A] text-white text-[16px] md:text-[20px] font-bold">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <div
              key={category.name}
              className={`relative ${!compact && category.name === 'MEN' ? 'md:ml-[268.8px]' : ''}`}>
              <button
                onClick={(e) => toggleCategory(e, category.name)}
                className="px-4 py-3 flex items-center hover:bg-red-700 focus:outline-none">
                {category.name}
                <svg
                  className={`ml-1 w-4 h-4 transition-transform ${
                    openCategory === category.name ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dropdown for CHILDREN */}
      {openCategory === 'CHILDREN' && (
        <div className="bg-[#F5F5F5] shadow-lg absolute left-0 w-full z-10">
          <div className="flex pl-4 md:pl-[49px]">
            {/* Gender sidebar */}
            <div className="w-32">
              {genderCategories.map((gender) => (
                <div key={gender.name} className="relative">
                  <button
                    onClick={(e) => toggleGender(e, gender.name)}
                    className="w-full py-3 px-4 text-left flex items-center justify-between hover:bg-gray-100 text-[16px] md:text-[20px] font-normal"
                  >
                    {gender.name}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* If a gender is selected, show subcategories */}
            {openGender && (
              <div className="flex-1 px-4 text-[16px] md:text-[20px] font-normal">
                <div className="flex flex-col gap-4">
                  {categories
                    .find((c) => c.name === 'CHILDREN')
                    ?.subcategories.map((subcat) => (
                      <a
                        key={subcat.name}
                        href={subcat.link}
                        className="block py-2 hover:text-red-600"
                      >
                        {subcat.name}
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dropdown for MEN */}
      {openCategory === 'MEN' && (
        <div
          className={`bg-[#F5F5F5] ${compact ? 'pl-4' : 'pl-4 md:pl-[470px]'} shadow-lg absolute left-0 w-full z-10`}>
          <div className="px-4 text-[16px] md:text-[20px] font-normal">
            <div className="flex md:pl-8 flex-col gap-[5px]">
              {categories
                .find((c) => c.name === 'MEN')
                ?.subcategories.map((subcat) => (
                  <a key={subcat.name}
                    href={subcat.link}
                    className="block py-2 hover:text-red-600" >
                    {subcat.name}
                  </a>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Dropdown for WOMEN */}
      {openCategory === 'WOMEN' && (
        <div
          className={`bg-[#F5F5F5] ${compact ? 'pl-4' : 'pl-4 md:pl-[576px]'} shadow-lg absolute left-0 w-full z-10`}>
          <div className="px-4 text-[16px] md:text-[20px] font-normal">
            <div className="flex flex-col md:pl-8 gap-[5px]">
              {categories
                .find((c) => c.name === 'WOMEN')
                ?.subcategories.map((subcat) => (
                  <a
                    key={subcat.name}
                    href={subcat.link}
                    className="block py-2 hover:text-red-600" >
                    {subcat.name}
                  </a>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductNavigation;