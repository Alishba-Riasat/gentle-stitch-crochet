import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { login } from '../redux/slices/authSlice';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, userInfo } = useSelector((state) => state.auth);

  // Redirect after successful login (or if already logged in)
  if (userInfo) {
    if (userInfo.role === 'admin') navigate('/admin');
    else navigate('/');
    return null;
  }

  // Client‑side validation
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
    // Run client‑side validation first
    if (!validateForm()) return;

    // Clear any previous server errors
    setEmailError('');
    setPasswordError('');

    const result = await dispatch(login({ email, password }));
    if (login.rejected.match(result)) {
      const errMsg = result.payload || 'Login failed';
      const lowerMsg = errMsg.toLowerCase();
      // Map server error to the appropriate field
      if (lowerMsg.includes('please register') || lowerMsg.includes('verify your email')) {
        setEmailError(errMsg);
      } else if (lowerMsg.includes('invalid email or password')) {
        setPasswordError(errMsg);
      } else {
        // Fallback – show as password error
        setPasswordError(errMsg);
      }
    }
  };

  // Clear email error when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  // Clear password error when user starts typing
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome Back</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={`input-field ${emailError ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              className={`input-field pr-10 ${passwordError ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          <div className="text-right mt-1">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-6 text-center">
        Don't have an account? <Link to="/register" className="text-primary font-medium">Register</Link>
      </p>
    </div>
  );
};

export default LoginPage;