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
  const [fieldErrors, setFieldErrors] = useState({ email: '', name: '', password: '' });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, userInfo } = useSelector((state) => state.auth);

  const { register: registerField, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');
  const nameValue = watch('name');
  const confirmValue = watch('confirmPassword');

  useEffect(() => {
    if (fieldErrors.email && emailValue !== undefined) setFieldErrors(prev => ({ ...prev, email: '' }));
  }, [emailValue]);
  useEffect(() => {
    if (fieldErrors.name && nameValue !== undefined) setFieldErrors(prev => ({ ...prev, name: '' }));
  }, [nameValue]);
  useEffect(() => {
    if (fieldErrors.password && passwordValue !== undefined) setFieldErrors(prev => ({ ...prev, password: '' }));
  }, [passwordValue]);
  useEffect(() => {
    if (error) dispatch(clearError());
  }, [emailValue, passwordValue, nameValue, confirmValue, dispatch, error]);
  useEffect(() => {
    if (userInfo) navigate('/');
  }, [userInfo, navigate]);
  useEffect(() => {
    const flag = localStorage.getItem('email_verified_success');
    if (flag === 'true') {
      setShowVerifiedMsg(true);
      localStorage.removeItem('email_verified_success');
    }
  }, []);

  const onSubmit = async (data) => {
    setFieldErrors({ email: '', name: '', password: '' });
    const result = await dispatch(register({ name: data.name, email: data.email, password: data.password }));
    if (register.fulfilled.match(result)) {
      setModalMessage(result.payload?.message || 'Verification email sent. Please check your inbox.');
      setShowSuccessModal(true);
    } else if (register.rejected.match(result)) {
      const errMsg = result.payload || 'Registration failed';
      if (errMsg.toLowerCase().includes('email already registered') || errMsg.toLowerCase().includes('already registered')) {
        setFieldErrors(prev => ({ ...prev, email: errMsg }));
      }
    }
  };

  const closeModal = () => setShowSuccessModal(false);
  const closeVerifiedMsg = () => setShowVerifiedMsg(false);

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left side – Hero Image (larger on desktop) */}
      <div className="lg:flex-1 lg:w-2/3 relative bg-gradient-to-br from-primary/80 to-secondary/80">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://res.cloudinary.com/dlcrtkvzq/image/upload/v1782028124/register_image_crclrr.png)',
            objectFit: 'contain',
          }}
        ></div>
       
        
      </div>

      {/* Right side – Registration Form (compact) */}
      <div className="lg:w-1/3 flex items-center justify-center p-6 md:p-10 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 lg:hidden">
            <h1 className="text-2xl font-bold text-primary">Gentle Stitch</h1>
            <p className="text-gray-500 text-sm">Create your account</p>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 hidden lg:block" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Create Account</h1>

          {showVerifiedMsg && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
              <span className="text-sm">Your email has been verified successfully! You can now log in.</span>
              <button onClick={closeVerifiedMsg}><FiX size={18} /></button>
            </div>
          )}

          {error && !fieldErrors.email && !fieldErrors.name && !fieldErrors.password && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Full Name</label>
              <input
                type="text"
                {...registerField('name')}
                className={`input-field ${errors.name || fieldErrors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-sm">Email Address</label>
              <input
                type="email"
                {...registerField('email')}
                className={`input-field ${errors.email || fieldErrors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...registerField('password')}
                  className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-sm">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...registerField('confirmPassword')}
                  className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full active:bg-primary/80 active:scale-95 transition-all duration-200 " disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

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





/*
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
  const [fieldErrors, setFieldErrors] = useState({ email: '', name: '', password: '' });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, userInfo } = useSelector((state) => state.auth);

  const { register: registerField, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');
  const nameValue = watch('name');
  const confirmValue = watch('confirmPassword');

  useEffect(() => {
    if (fieldErrors.email && emailValue !== undefined) setFieldErrors(prev => ({ ...prev, email: '' }));
  }, [emailValue]);
  useEffect(() => {
    if (fieldErrors.name && nameValue !== undefined) setFieldErrors(prev => ({ ...prev, name: '' }));
  }, [nameValue]);
  useEffect(() => {
    if (fieldErrors.password && passwordValue !== undefined) setFieldErrors(prev => ({ ...prev, password: '' }));
  }, [passwordValue]);
  useEffect(() => {
    if (error) dispatch(clearError());
  }, [emailValue, passwordValue, nameValue, confirmValue, dispatch, error]);
  useEffect(() => {
    if (userInfo) navigate('/');
  }, [userInfo, navigate]);
  useEffect(() => {
    const flag = localStorage.getItem('email_verified_success');
    if (flag === 'true') {
      setShowVerifiedMsg(true);
      localStorage.removeItem('email_verified_success');
    }
  }, []);

  const onSubmit = async (data) => {
    setFieldErrors({ email: '', name: '', password: '' });
    const result = await dispatch(register({ name: data.name, email: data.email, password: data.password }));
    if (register.fulfilled.match(result)) {
      setModalMessage(result.payload?.message || 'Verification email sent. Please check your inbox.');
      setShowSuccessModal(true);
    } else if (register.rejected.match(result)) {
      const errMsg = result.payload || 'Registration failed';
      if (errMsg.toLowerCase().includes('email already registered') || errMsg.toLowerCase().includes('already registered')) {
        setFieldErrors(prev => ({ ...prev, email: errMsg }));
      }
    }
  };

  const closeModal = () => setShowSuccessModal(false);
  const closeVerifiedMsg = () => setShowVerifiedMsg(false);

  return (
    <div className="min-h-screen relative flex items-center justify-end bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(https://images.pexels.com/photos/3832504/close-up-of-crochet-wool-balls-3832504.jpg?auto=compress&cs=tinysrgb&w=1600)',
      }}
    >
      
      <div className="absolute inset-0 bg-black/40"></div>

    
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mx-4 md:mx-8 lg:mr-16">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Gentle Stitch
          </h1>
          <p className="text-gray-600 text-sm mt-1">Create your account</p>
        </div>

        {showVerifiedMsg && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
            <span className="text-sm">Your email has been verified successfully! You can now log in.</span>
            <button onClick={closeVerifiedMsg}><FiX size={18} /></button>
          </div>
        )}

        {error && !fieldErrors.email && !fieldErrors.name && !fieldErrors.password && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 text-sm">Full Name</label>
            <input
              type="text"
              {...registerField('name')}
              className={`w-full px-4 py-2 rounded-lg border ${errors.name || fieldErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary transition bg-white/80`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-sm">Email Address</label>
            <input
              type="email"
              {...registerField('email')}
              className={`w-full px-4 py-2 rounded-lg border ${errors.email || fieldErrors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary transition bg-white/80`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-sm">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...registerField('password')}
                className={`w-full px-4 py-2 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary pr-10 transition bg-white/80`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-sm">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...registerField('confirmPassword')}
                className={`w-full px-4 py-2 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary pr-10 transition bg-white/80`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-opacity-90 active:bg-primary/80 active:scale-95 transition-all duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>

    
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
*/

