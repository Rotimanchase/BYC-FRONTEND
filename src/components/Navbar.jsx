import { useEffect, useRef, useState } from 'react';
import { FiSearch, FiUser, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { assets } from '../assets/assets';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaChevronDown, FaSearch } from 'react-icons/fa';
// import { useAppContext } from '../context/appContext';
import ProductNavigation from './ProductNavigation';
import { useAppContext } from '../context/AppsContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userDropdownRef = useRef(null);
  const shopDropdownRef = useRef(null);
  const { cart, searchQuery, setSearchQuery } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const darkBgPage = ['/wishlist'];
  const isDarkBg = darkBgPage.includes(path);
  const [user, setUser] = useState(null);

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
      if (isOutsideUser && isOutsideShop) {
        setShowUserMenu(false);
        setShowShopDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false); // Reset isOpen on desktop
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // const toggleSearch = () => setShowSearch(!showSearch);
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
    navigate('/account');
  };

  
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.length > 0 && location.pathname !== '/product') {
        navigate('/product');
      }
    }, 300);
  
    return () => clearTimeout(delay);
  }, [searchQuery, location.pathname]);
  
  useEffect(() => {
    if (location.pathname !== '/product' && searchQuery) {
      setSearchQuery('');
    }
  }, [location.pathname]);
  
  return (
    <nav className={`${isDarkBg ? 'bg-black text-white' : 'bg-white'} relative `}>
      <div className="flex items-center justify-center h-30 md:mx-8">
        {/* Left section */}
        <div className="absolute z-10 left-4 space-x-6 md:flex hidden ml-5">
          <button onClick={toggleShopDropdown}
            className={`${isDarkBg ? '' : 'text-gray-700 hover:text-black'} cursor-pointer`}>
            Shop Products
          </button>
          <Link to="/Blogs" className={`${isDarkBg ? '' : 'text-gray-700 hover:text-black'}`}>
            Blog
          </Link>
          <a href="#" className={`${isDarkBg ? '' : 'text-gray-700 hover:text-black'}`}>
            FAQ
          </a>
        </div>

        {/* Center Logo */}
        {!showSearch ? (
          <div className="flex md:justify-center justify-left cursor-pointer md:ml-0 ml-5 w-full md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
            <Link to="/" className="text-xl font-bold">
              <img src={assets.byc} alt="Logo" className="h-11 w-18" />
            </Link>
          </div>
        ) : (
          <div className={`flex items-center border-b pb-1 w-[40%] ${
              isDarkBg ? 'border-white' : 'border-gray-500' }`} >
            <input onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Search Product"
              className="bg-transparent border-none w-full focus:outline-none"/>
            <button onClick={() => setShowSearch(false)} className="p-0 ml-2">
              <FaSearch />
            </button>
          </div>
        )}

        {/* Right section */}
        <div className="absolute right-4 md:flex hidden items-center space-x-6 text-gray-700 mr-5">
          <Link
            to="/about"
            className={`${isDarkBg ? 'text-white' : 'text-gray-700 hover:text-black'}`} >
            About Us
          </Link>
          <Link
            to="/contact"
            className={`${isDarkBg ? 'text-white' : 'text-gray-700 hover:text-black'}`}>
            Contact
          </Link>
          {!showSearch && (
            <button onClick={toggleSearch}>
              <FiSearch
                className={`w-5 h-5 ${isDarkBg ? 'text-white' : 'hover:text-black'}`}
              />
            </button>
          )}

          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <div
                className={`flex items-center gap-2 cursor-pointer ${
                  isDarkBg ? 'text-white' : 'hover:text-black'
                }`}
                onClick={toggleUserMenu}>
                <FiUser className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Hi {user.name || user.username || 'User'}
                </span>
              </div>

              {showUserMenu && (
                <div className="absolute top-6 right-0 bg-white text-black shadow-lg p-2 text-sm rounded-md z-100">
                  <button
                    onClick={() => navigate('/my-orders')}
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left" >
                    My Orders
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left">
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

          <Link to="wishlist">
            <FiHeart
              className={`w-5 h-5 ${isDarkBg ? 'text-white' : 'hover:text-black'}`}
            />
          </Link>
          <Link to="cart" className="relative">
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

        {/* Mobile Hamburger */}
        <div className="md:hidden absolute right-4 flex items-center">
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
              strokeLinejoin="round"
            >
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
        <div ref={shopDropdownRef} className="hidden md:block absolute top-full left-0 w-full bg-white z-100 shadow-lg">
          <ProductNavigation compact={false} />
        </div>
      )}

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 text-gray-700">
          <button onClick={toggleShopDropdown} className={`block ${isDarkBg ? 'text-white' : 'hover:text-black'}`} >
            Shop Products
          </button>
          {showShopDropdown && (
            <div ref={shopDropdownRef} className="bg-white text-black p-4">
              <ProductNavigation compact={true} />
            </div>
          )}
          <Link
            to="blogs"
            className={`block ${isDarkBg ? 'text-white' : 'hover:text-black'}`}>
            Blog
          </Link>
          <a href="#" className={`block ${isDarkBg ? 'text-white' : 'hover:text-black'}`}>
            FAQ
          </a>
          <Link to="about" className={`block ${isDarkBg ? 'text-white' : 'hover:text-black'}`}>
            About Us
          </Link>
          <Link to="contact" className={`block ${isDarkBg ? 'text-white' : 'hover:text-black'}`} >
            Contact
          </Link>
          <div className="flex space-x-4 pt-2">
            <button onClick={toggleSearch}>
              <FiSearch className={`w-5 h-5 ${isDarkBg ? 'text-white' : 'hover:text-black'}`} />
            </button>
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <div className={`flex items-center gap-2 cursor-pointer ${ isDarkBg ? 'text-white' : 'hover:text-black'
                  }`} onClick={toggleUserMenu} >
                  <FiUser className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Hi {user.name || user.username || 'User'}
                  </span>
                </div>

                {showUserMenu && (
                  <div className="absolute top-6 right-0 bg-white text-black shadow-lg p-2 text-sm rounded-md z-100">
                    <button onClick={() => navigate('/my-orders')} className="block px-4 py-2 hover:bg-gray-100 w-full text-left">
                      My Orders
                    </button>
                    <button onClick={handleLogout} className="block px-4 py-2 hover:bg-gray-100 w-full text-left" >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => navigate('/account')}>
                <FiUser className={`w-5 h-5 ${isDarkBg ? 'text-white' : 'hover:text-black'}`}/>
              </button>
            )}
            <Link to="wishlist">
              <FiHeart className={`w-5 h-5 ${isDarkBg ? 'text-white' : 'hover:text-black'}`} />
            </Link>
            <Link to="cart" className="relative">
              <FiShoppingCart className={`w-5 h-5 ${isDarkBg ? 'text-white' : 'hover:text-black'}`}/>
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