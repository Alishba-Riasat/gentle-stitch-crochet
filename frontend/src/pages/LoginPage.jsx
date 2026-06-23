import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { login } from '../redux/slices/authSlice';
import { mergeGuestCartBackend, fetchCart } from '../redux/slices/cartSlice';
import { setWishlist } from '../redux/slices/wishlistSlice';
import api from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, userInfo } = useSelector((state) => state.auth);
  const localWishlistItems = useSelector((state) => state.wishlist.items);

  const normalizeWishlistItems = (items) => {
    if (!Array.isArray(items)) return [];
    return Array.from(new Set(
      items
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') return item._id || item.id || item.productId;
          return null;
        })
        .filter(Boolean)
    ));
  };

  if (userInfo) {
    if (userInfo.role === 'admin') navigate('/admin');
    else navigate('/');
    return null;
  }

  const validateForm = () => {
    let isValid = true;
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setEmailError('');
    setPasswordError('');

    const result = await dispatch(login({ email, password }));

    if (login.rejected.match(result)) {
      const errMsg = result.payload || 'Login failed';
      const lowerMsg = errMsg.toLowerCase();
      if (lowerMsg.includes('please register') || lowerMsg.includes('verify your email')) {
        setEmailError(errMsg);
      } else if (lowerMsg.includes('invalid email or password')) {
        setPasswordError(errMsg);
      } else {
        setPasswordError(errMsg);
      }
    } 
    else if (login.fulfilled.match(result)) {
      // 1. Merge guest cart
      const guestCartRaw = localStorage.getItem('guest_cart');
      if (guestCartRaw) {
        try {
          const guestCart = JSON.parse(guestCartRaw);
          if (guestCart.items && guestCart.items.length > 0) {
            await dispatch(mergeGuestCartBackend(guestCart)).unwrap();
          }
        } catch (err) {
          console.error('Cart merge failed', err);
        }
      }
      // 2. Refresh cart from backend
      await dispatch(fetchCart());

      // 3. Sync wishlist from backend and apply local guest changes
      try {
        const localWishlistIds = normalizeWishlistItems(localWishlistItems);
        const profileRes = await api.get('/users/profile');
        const backendWishlistIds = Array.from(new Set(
          (profileRes.data.wishlist || [])
            .map(product => product._id)
            .filter(Boolean)
        ));

        const toAdd = localWishlistIds.filter(id => !backendWishlistIds.includes(id));
        const toRemove = backendWishlistIds.filter(id => !localWishlistIds.includes(id));

        await Promise.all([
          ...toAdd.map((id) => api.post(`/users/wishlist/${id}`)),
          ...toRemove.map((id) => api.delete(`/users/wishlist/${id}`)),
        ]);

        dispatch(setWishlist(localWishlistIds));
      } catch (err) {
        console.error('Failed to sync wishlist', err);
      }
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      <div className="lg:flex-1 lg:w-2/3 relative bg-gradient-to-br from-primary/80 to-secondary/80">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://res.cloudinary.com/dlcrtkvzq/image/upload/v1782027254/login_image_v98c43.png)',
            objectFit: 'cover',
          }}
        ></div>
        
        
      </div>

      <div className="lg:w-1/3 flex items-center justify-center p-6 md:p-10 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 lg:hidden">
            <h1 className="text-2xl font-bold text-primary">Gentle Stitch</h1>
            <p className="text-gray-500 text-sm">Log in to your account</p>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 hidden lg:block">Log in</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Email address</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-4 py-2 rounded-lg border ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} focus:outline-none focus:ring-2 transition`}
              />
              {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2 rounded-lg border ${passwordError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary pr-10`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-opacity-90 active:bg-primary/80 active:scale-95 transition-all duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;