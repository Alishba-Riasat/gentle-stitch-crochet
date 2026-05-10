import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { Link } from 'react-router-dom';

const schema = yup.object({
  email: yup.string().required('Email is required').email('Valid email required'),
});

const ResendVerificationPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await api.post('/auth/resend-verification', { email: data.email });
      setSuccessMsg('Verification email resent! Check your inbox.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-3xl font-bold text-center mb-8">Resend Verification Email</h1>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
          {successMsg}
        </div>
      )}
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
            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Resend Verification'}
        </button>
        <p className="text-center mt-4">
          <Link to="/login" className="text-primary">Back to Login</Link>
        </p>
      </form>
    </div>
  );
};

export default ResendVerificationPage;