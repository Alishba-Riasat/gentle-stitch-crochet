import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md text-center">
        <div className="bg-green-100 text-green-700 p-4 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Check your email</h2>
          <p>We've sent a password reset link to <strong>{email}</strong>.</p>
          <Link to="/login" className="text-primary mt-4 inline-block">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-3xl font-bold text-center mb-8">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
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