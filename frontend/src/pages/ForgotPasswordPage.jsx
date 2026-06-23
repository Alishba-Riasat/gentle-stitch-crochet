import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';

const emailSchema = yup.string()
  .required('Email is required')
  .email('Please enter a valid email')
  .matches(/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/, 'Email must have a valid domain (e.g., name@example.com)');

const schema = yup.object({
  email: emailSchema,
}).required();

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSubmitted(true);
      setSuccessMsg('Reset link sent to your email.');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-12 py-12 max-w-md text-center">
        <div className="bg-green-100 text-green-700 p-4 rounded-lg">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Check your inbox</h2>
          <p>{successMsg}</p>
          <Link to="/login" className="text-primary mt-4 inline-block">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-12 py-12 max-w-md">
      <h1 className="text-3xl font-bold text-center mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Reset Password</h1>
      <p className="text-gray-600 text-center mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {/* Inline error message */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            {...register('email')}
            className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <p className="text-center mt-4">
          <Link to="/login" className="text-primary">Back to Login</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;