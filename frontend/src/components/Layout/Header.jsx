import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">Gentle Stitch Crochet</Link>
        <nav className="flex items-center space-x-6">
          <Link to="/shop" className="text-gray-700 hover:text-primary">Shop</Link>
          {userInfo && <Link to="/profile" className="text-gray-700 hover:text-primary">Profile</Link>}
          {userInfo?.role === 'admin' && <Link to="/admin" className="text-gray-700 hover:text-primary">Admin</Link>}
          <Link to="/cart" className="relative">
            <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
          </Link>
          {userInfo ? (
            <div className="relative group">
              <button className="flex items-center space-x-1">
                <UserIcon className="h-6 w-6 text-gray-700" />
                <span>{userInfo.name}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block">
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn-primary">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;