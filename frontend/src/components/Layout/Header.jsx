import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { 
  ShoppingCartIcon, 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  HeartIcon as HeartOutlineIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const wishlistCount = useSelector((state) => state.wishlist?.items?.length || 0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
      setMobileMenuOpen(false);
      setShowMobileSearch(false);
    }
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
              Gentle Stitch
            </Link>

            <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
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

            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-5">
                <NavLink to="/" className={activeLinkClass}>Home</NavLink>
                <NavLink to="/shop" className={activeLinkClass}>Shop</NavLink>
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
                <Link to="/login" className="btn-primary py-2 px-4">Sign In</Link>
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
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
              </Link>
            </div>
          </div>

          {/* Mobile layout */}
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
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">0</span>
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

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
        <div className="relative w-80 h-full bg-white shadow-xl flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <span className="text-xl font-bold text-primary">Menu</span>
            <button onClick={() => setMobileMenuOpen(false)}>
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          <nav className="flex flex-col p-4 space-y-4">
            <NavLink to="/" className={({ isActive }) => isActive ? 'text-primary' : 'text-gray-700'} onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
            <NavLink to="/shop" className={({ isActive }) => isActive ? 'text-primary' : 'text-gray-700'} onClick={() => setMobileMenuOpen(false)}>Shop</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'text-primary' : 'text-gray-700'} onClick={() => setMobileMenuOpen(false)}>Contact</NavLink>
            <NavLink to="/faq" className={({ isActive }) => isActive ? 'text-primary' : 'text-gray-700'} onClick={() => setMobileMenuOpen(false)}>FAQ</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'text-primary' : 'text-gray-700'} onClick={() => setMobileMenuOpen(false)}>About</NavLink>
            {userInfo ? (
              <>
                {userInfo.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
                )}
                <button onClick={handleLogout} className="text-left text-gray-700">Logout</button>
              </>
            ) : (
              <Link to="/login" className="text-gray-700" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;