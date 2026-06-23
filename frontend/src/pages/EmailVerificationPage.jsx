import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    // Clear any leftover success flag before starting (optional)
    localStorage.removeItem('email_verified_success');

    if (!token) {
      setError('No verification token provided.');
      setTimeout(() => navigate('/register'), 2000);
      return;
    }

    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        // SUCCESS – set flag and redirect
        localStorage.setItem('email_verified_success', 'true');
        navigate('/register');   // No query param needed – flag triggers message
      } catch (err) {
        // FAILURE – ensure flag is removed
        localStorage.removeItem('email_verified_success');
        setError(err.response?.data?.message || 'Verification failed. Link may be expired or invalid.');
        setTimeout(() => navigate('/register'), 2000);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-12 py-12 max-w-md text-center">
      {!error && (
        <div className="bg-blue-100 text-blue-700 p-4 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto mb-2"></div>
          <p>Verifying your email...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
          <p className="text-sm mt-2">Redirecting to register page...</p>
        </div>
      )}
    </div>
  );
};

export default EmailVerificationPage;