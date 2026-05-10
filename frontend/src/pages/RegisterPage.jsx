import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { register, clearError } from '../redux/slices/authSlice';

const emailSchema = yup.string()
  .required('Email is required')
  .email('Please enter a valid email')
  .matches(/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/, 'Email must have a valid domain (e.g., name@example.com)');

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
}).required();

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showVerifiedMsg, setShowVerifiedMsg] = useState(false);
  
  // Field‑specific server errors
  const [fieldErrors, setFieldErrors] = useState({ email: '', name: '', password: '' });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, userInfo } = useSelector((state) => state.auth);

  const { register: registerField, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: yupResolver(schema),
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');
  const nameValue = watch('name');
  const confirmValue = watch('confirmPassword');

  // Clear field error when user starts typing in that field
  useEffect(() => {
    if (fieldErrors.email && emailValue !== undefined) {
      setFieldErrors(prev => ({ ...prev, email: '' }));
    }
  }, [emailValue]);
  useEffect(() => {
    if (fieldErrors.name && nameValue !== undefined) {
      setFieldErrors(prev => ({ ...prev, name: '' }));
    }
  }, [nameValue]);
  useEffect(() => {
    if (fieldErrors.password && passwordValue !== undefined) {
      setFieldErrors(prev => ({ ...prev, password: '' }));
    }
  }, [passwordValue]);

  // Clear Redux error when any field changes
  useEffect(() => {
    if (error) dispatch(clearError());
  }, [emailValue, passwordValue, nameValue, confirmValue, dispatch, error]);

  // If already logged in, go to home
  useEffect(() => {
    if (userInfo) navigate('/');
  }, [userInfo, navigate]);

  // Check for successful verification flag
  useEffect(() => {
    const flag = localStorage.getItem('email_verified_success');
    if (flag === 'true') {
      setShowVerifiedMsg(true);
      localStorage.removeItem('email_verified_success');
    }
  }, []);

  const onSubmit = async (data) => {
    // Clear previous field errors
    setFieldErrors({ email: '', name: '', password: '' });
    
    const result = await dispatch(register({ name: data.name, email: data.email, password: data.password }));
    
    if (register.fulfilled.match(result)) {
      // Success – show modal
      setModalMessage(result.payload?.message || 'Verification email sent. Please check your inbox.');
      setShowSuccessModal(true);
    } else if (register.rejected.match(result)) {
      const errMsg = result.payload || 'Registration failed';
      // Check if error is related to email already registered
      if (errMsg.toLowerCase().includes('email already registered') || 
          errMsg.toLowerCase().includes('already registered')) {
        setFieldErrors(prev => ({ ...prev, email: errMsg }));
      } else {
        // Other errors – show general error (still displayed in red box)
        // You could also map to other fields if needed
        // For simplicity, we keep general error box for non‑email errors
        // But we also show it under email? No, keep general.
      }
      // The Redux error will also be set (if needed for general box)
    }
  };

  const closeModal = () => setShowSuccessModal(false);
  const closeVerifiedMsg = () => setShowVerifiedMsg(false);

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-3xl font-bold text-center mb-8">Create Account</h1>

      {/* Success message after email verification */}
      {showVerifiedMsg && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
          <span>Your email has been verified successfully! You can now log in.</span>
          <button onClick={closeVerifiedMsg} className="text-green-700 hover:text-green-900">
            <FiX size={18} />
          </button>
        </div>
      )}

      {/* General error message from backend (non‑field specific) */}
      {error && !fieldErrors.email && !fieldErrors.name && !fieldErrors.password && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            {...registerField('name')}
            className={`input-field ${errors.name || fieldErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          {fieldErrors.name && <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>}
        </div>

        {/* Email Field – shows server error under it */}
        <div>
          <label className="block text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            {...registerField('email')}
            className={`input-field ${errors.email || fieldErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...registerField('password')}
              className={`input-field pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-gray-700 mb-2">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              {...registerField('confirmPassword')}
              className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-center">
        Already have an account? <Link to="/login" className="text-primary font-medium">Login</Link>
      </p>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Check Your Email</h3>
              <p className="mt-2 text-sm text-gray-500">{modalMessage}</p>
              <button onClick={closeModal} className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;