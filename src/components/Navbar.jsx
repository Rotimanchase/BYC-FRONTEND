import { useEffect, useRef, useState } from 'react';
import { FiSearch, FiUser, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { assets } from '../assets/assets';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import ProductNavigation from './ProductNavigation';
import { useAppContext } from '../context/AppsContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userDropdownRef = useRef(null);
  const shopDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null); // New ref for mobile menu
  const { cart, searchQuery, setSearchQuery } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const darkBgPage = ['/wishlist'];
  const isDarkBg = darkBgPage.includes(path);
  const [user, setUser] = useState(null);

  // Helper function to get first name
  const getFirstName = (fullName) => {
    if (!fullName) return 'User';
    return fullName.split(' ')[0];
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideUser = userDropdownRef.current && !userDropdownRef.current.contains(event.target);
      const isOutsideShop = shopDropdownRef.current && !shopDropdownRef.current.contains(event.target);
      const isOutsideMobileMenu = mobileMenuRef.current && !mobileMenuRef.current.contains(event.target);
      if (isOutsideUser && isOutsideShop && isOutsideMobileMenu) {
        setShowUserMenu(false);
        setShowShopDropdown(false);
        setIsOpen(false); // Close hamburger menu
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSearch = () => {
    if (showSearch) {
      setSearchQuery('');
    }
    setShowSearch(!showSearch);
  };

  const toggleShopDropdown = () => {
    setShowShopDropdown(!showShopDropdown);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowShopDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false); // Close user dropdown
    setIsOpen(false); // Close hamburger menu
    navigate('/account');
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.length > 0 && location.pathname !== '/product') {
        navigate('/product');
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery, location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname !== '/product' && searchQuery) {
      setSearchQuery('');
    }
  }, [location.pathname, setSearchQuery]);

  return (
    <nav className={`${isDarkBg ? 'bg-black text-white' : 'bg-white'} relative`}>
      <div className="flex items-center justify-between h-16 md:h-20 px-4 md:px-8">
        {/* Desktop Left section */}
        <div className="hidden md:flex space-x-6">
          <button onClick={toggleShopDropdown} className={`${isDarkBg ? '' : 'text-gray-700 hover:text-black'} cursor-pointer`} >
            Shop Products
          </button>
          <Link to="/blogs" className={`${isDarkBg ? '' : 'text-gray-700 hover:text-black'}`}>
            Blog
          </Link>
          <a href="#" className={`${isDarkBg ? '' : 'text-gray-700 hover:text-black'}`}>
            FAQ
          </a>
        </div>

        {/* Mobile Left - Logo & Search */}
        <div className="md:hidden flex items-center flex-grow">
          {!showSearch ? (
            <Link to="/" className="text-xl font-bold">
              <img src={assets.byc} alt="Logo" className="h-8 w-14" />
            </Link>
          ) : (
            <div className={`flex items-center border-b pb-1 w-full max-w-[220px] ${isDarkBg ? 'border-white' : 'border-gray-500'}`}>
              <input
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Search Product"
                className="bg-transparent border-none w-full focus:outline-none"
                autoFocus
              />
              <button onClick={toggleSearch} className="p-0 ml-2">
                <FaSearch />
              </button>
            </div>
          )}
        </div>

        {/* Desktop Center - Logo or Search */}
        <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
          {!showSearch ? (
            <Link to="/" className="text-xl font-bold">
              <img src={assets.byc} alt="Logo" className="h-11 w-18" />
            </Link>
          ) : (
            <div className={`flex items-center border-b pb-1 w-full ${isDarkBg ? 'border-white' : 'border-gray-500'}`}>
              <input
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Search Product"
                className="bg-transparent border-none w-full focus:outline-none"
                autoFocus
              />
              <button onClick={toggleSearch} className="p-0 ml-2">
                <FaSearch />
              </button>
            </div>
          )}
        </div>

        {/* Desktop Right section */}
        <div className="hidden md:flex items-center space-x-6 text-gray-700">
          <Link
            to="/about"
            className={`${isDarkBg ? 'text-white' : 'text-gray-700 hover:text-black'}`}
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className={`${isDarkBg ? 'text-white' : 'text-gray-700 hover:text-black'}`}
          >
            Contact
          </Link>
          
          <button
            onClick={toggleSearch}
            className={`ml-2 ${showSearch ? 'hidden' : 'block'}`}
          >
            <FiSearch
              className={`w-5 h-5 ${isDarkBg ? 'text-white' : 'hover:text-black'}`}
            />
          </button>

          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <div
                className={`flex items-center gap-2 cursor-pointer ${
                  isDarkBg ? 'text-white' : 'hover:text-black'
                }`}
                onClick={toggleUserMenu}
              >
                <FiUser className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Hi {getFirstName(user.name || user.username)}!
                </span>
              </div>

              {showUserMenu && (
                <div className="absolute top-8 right-0 bg-white text-black shadow-lg p-2 text-sm min-w-30 rounded-md z-50">
                  <button
                    onClick={() => {
                      navigate('/my-orders');
                      setShowUserMenu(false);
                    }}
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                  >
                    My Orders
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/account')}>
              <FiUser
                className={`w-5 h-5 ${isDarkBg ? 'text-white' : 'hover:text-black'}`}
              />
            </button>
          )}

          <Link to="/wishlist" className="relative">
            <FiHeart
              className={`w-5 h-5 ${isDarkBg ? 'text-white' : 'hover:text-black'}`}
            />
          </Link>
          
          <Link to="/cart" className="relative">
            <FiShoppingCart
              className={`w-5 h-5 ${isDarkBg ? 'text-white' : 'hover:text-black'}`}
            />
            {Array.isArray(cart) && cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Right section */}
        <div className="md:hidden flex items-center gap-3">
          <button onClick={toggleSearch} className={`ml-2 ${showSearch ? 'hidden' : 'block'}`}>
            <FiSearch className={`w-5 h-5 ${isDarkBg ? 'text-white' : 'hover:text-black'}`} />
          </button>

          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <div className={`flex items-center gap-1 cursor-pointer ${ isDarkBg ? 'text-white' : 'hover:text-black' }`}
                onClick={toggleUserMenu} >
                <FiUser className="w-5 h-5" />
                <span className="text-xs font-medium">
                  Hi {getFirstName(user.name || user.username)}
                </span>
              </div>

              {showUserMenu && (
                <div className="absolute top-8 right-0 bg-white text-black shadow-lg p-2 text-sm rounded-md z-50 min-w-32">
                  <button
                    onClick={() => {
                      navigate('/my-orders');
                      setShowUserMenu(false);
                      setIsOpen(false); // Close hamburger menu
                    }}
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-center"
                  >
                    My Orders
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-center"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => {
              navigate('/account');
              setIsOpen(false); // Close hamburger menu
            }}>
              <FiUser className={`w-5 h-5 ${isDarkBg ? 'text-white' : 'hover:text-black'}`} />
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`focus:outline-none ${isDarkBg ? 'text-white' : 'text-gray-700'}`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round">
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Shop Products Dropdown (Desktop) */}
      {showShopDropdown && (
        <div ref={shopDropdownRef} className="hidden md:block absolute top-full left-0 w-full bg-white z-50 shadow-lg">
          <ProductNavigation compact={false} />
        </div>
      )}

      {/* Mobile Dropdown */}
      {isOpen && (
        <div ref={mobileMenuRef} className="md:hidden px-4 pb-4 space-y-2 text-gray-700 bg-white border-t z-50">
          <button onClick={() => { toggleShopDropdown(); }} className={`block ${isDarkBg ? 'text-black' : 'hover:text-black'} py-2`} >
            Shop Products
          </button>
          
          {showShopDropdown && (
            <div ref={shopDropdownRef} className="bg-gray-50 text-black p-4 rounded">
              <ProductNavigation compact={true} />
            </div>
          )}
          
          <Link
            to="/blogs"
            className={`block ${isDarkBg ? 'text-black' : 'hover:text-black'} py-2`}
            onClick={() => setIsOpen(false)} // Close hamburger menu
          >
            Blog
          </Link>
          
          <a
            href="#"
            className={`block ${isDarkBg ? 'text-black' : 'hover:text-black'} py-2`}
            onClick={() => setIsOpen(false)} // Close hamburger menu
          >
            FAQ
          </a>
          
          <Link
            to="/about"
            className={`block ${isDarkBg ? 'text-black' : 'hover:text-black'} py-2`}
            onClick={() => setIsOpen(false)} // Close hamburger menu
          >
            About Us
          </Link>
          
          <Link to="/contact" className={`block ${isDarkBg ? 'text-black' : 'hover:text-black'} py-2`} onClick={() => setIsOpen(false)} >
            Contact
          </Link>
          
          <div className="space-x-4 pt-2">
            <Link to="/wishlist" className="" onClick={() => setIsOpen(false)} >
              <FiHeart className="w-5 h-5 text-gray-700 hover:text-black" />
            </Link>
            
            <Link to="/cart" className="relative " onClick={() => setIsOpen(false)} >
              <FiShoppingCart className="w-5 h-5 text-gray-700 hover:text-black" />
              {Array.isArray(cart) && cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}