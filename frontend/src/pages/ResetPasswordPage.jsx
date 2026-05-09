import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setValidToken(false);
      toast.error('No reset token provided');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          <h2 className="text-2xl font-bold">Invalid or missing token</h2>
          <p>Please request a new password reset link.</p>
          <Link to="/forgot-password" className="text-primary mt-4 inline-block">Forgot Password?</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-3xl font-bold text-center mb-8">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">New Password</label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength="6"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Confirm New Password</label>
          <input
            type="password"
            className="input-field"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;