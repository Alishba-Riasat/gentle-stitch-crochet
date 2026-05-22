import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { 
  ShoppingCartIcon, 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  HeartIcon as HeartOutlineIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { fetchCategories } from '../../services/categoryService';
import api from '../../services/api';

const Header = () => {
  const { totalQuantity } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const wishlistCount = useSelector((state) => state.wishlist?.items?.length || 0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const categoriesRef = useRef(null);
  const searchRef = useRef(null);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  // Search suggestions with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        const fetchSuggestions = async () => {
          try {
            const res = await api.get(`/products?keyword=${encodeURIComponent(searchQuery.trim())}&limit=5`);
            setSearchSuggestions(res.data.products);
            setShowSuggestions(true);
          } catch (err) {
            console.error(err);
          }
        };
        fetchSuggestions();
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setShowCategoriesDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
      setMobileMenuOpen(false);
      setShowMobileSearch(false);
    }
  };

  const handleSuggestionClick = (productSlug) => {
    navigate(`/product/${productSlug}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const activeLinkClass = ({ isActive }) =>
    isActive ? 'text-primary font-medium' : 'text-gray-700 hover:text-primary transition';

  const HeartIcon = wishlistCount > 0 ? HeartSolidIcon : HeartOutlineIcon;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          {/* Desktop layout */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
              Gentle Stitch Crochet
            </Link>

            
            {/* Search Bar with Suggestions */}
            <div className="relative flex-1 max-w-md" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                  className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </form>
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border z-20 max-h-60 overflow-y-auto">
                  {searchSuggestions.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleSuggestionClick(product._id)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <img
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/40'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div>
                        <p className="text-gray-800 text-sm font-medium">{product.name}</p>
                        <p className="text-gray-500 text-xs">Rs. {product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            


            <div className="flex items-center space-x-4">
              <nav className="flex items-center space-x-4">
                <NavLink to="/" className={activeLinkClass}>Home</NavLink>
                <NavLink to="/shop" className={activeLinkClass}>ShopAll</NavLink>
                {/* Categories Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                className="flex items-center gap-1 text-gray-700 hover:text-primary transition"
              >
                Categories <ChevronDownIcon className="h-4 w-4" />
              </button>
              {showCategoriesDropdown && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-20 border">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/shop?category=${cat.slug}`}
                      onClick={() => setShowCategoriesDropdown(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

                <NavLink to="/contact" className={activeLinkClass}>ContactUs</NavLink>
                <NavLink to="/faq" className={activeLinkClass}>FAQ</NavLink>
                <NavLink to="/about" className={activeLinkClass}>AboutUs</NavLink>
              </nav>

              {userInfo ? (
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-primary">
                    <UserIcon className="h-5 w-5" />
                    <span>{userInfo.name.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
                    {userInfo.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Admin Panel</Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Logout</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="btn-primary py-2 px-4 active:bg-primary/80 active:scale-95 transition-all duration-200 ">Sign In</Link>
              )}

              <Link to="/wishlist" className="relative">
                <HeartIcon className="h-6 w-6 text-gray-700 hover:text-primary transition" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="relative">
                <ShoppingCartIcon className="h-6 w-6 text-gray-700 hover:text-primary transition" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalQuantity}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile layout (unchanged except for search toggle) */}
          <div className="md:hidden flex items-center justify-between">
            <button onClick={() => setMobileMenuOpen(true)} className="text-gray-700">
              <Bars3Icon className="h-6 w-6" />
            </button>
            <Link to="/" className="text-xl font-bold text-primary tracking-tight">
              Gentle Stitch
            </Link>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="text-gray-700 hover:text-primary">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
              {userInfo ? (
                <Link to="/profile" className="text-gray-700 hover:text-primary">
                  <UserIcon className="h-5 w-5" />
                </Link>
              ) : (
                <Link to="/login" className="text-gray-700 hover:text-primary">
                  <UserIcon className="h-5 w-5" />
                </Link>
              )}
              <Link to="/wishlist" className="text-gray-700 hover:text-primary">
                <HeartOutlineIcon className="h-5 w-5" />
              </Link>
              <Link to="/cart" className="relative">
                <ShoppingCartIcon className="h-5 w-5 text-gray-700 hover:text-primary" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {totalQuantity}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile search input */}
        {showMobileSearch && (
          <div className="md:hidden px-4 pb-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Sidebar (unchanged) */}
      {/* ... same as before ... */}
    </>
  );
};

export default Header;