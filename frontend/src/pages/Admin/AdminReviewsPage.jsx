import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { TrashIcon, EyeIcon, EyeSlashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (productFilter) params.append('product', productFilter);
      if (filter !== 'all') params.append('rating', filter);
      if (verificationFilter !== 'all') params.append('verification', verificationFilter);

      const res = await api.get(`/reviews/admin/all?${params.toString()}`);
      setReviews(res.data);
    } catch (err) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, productFilter, filter, verificationFilter]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=100');
      setProducts(res.data.products);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/reviews/admin/${reviewId}`);
        toast.success('Review deleted');
        fetchReviews();
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  const handleToggleHide = async (reviewId, currentHidden) => {
  console.log('Toggle hide called for review:', reviewId, 'current hidden:', currentHidden);
  try {
    const res = await api.put(`/reviews/admin/${reviewId}/hide`);
    console.log('API response:', res);
    toast.success(currentHidden ? 'Review restored' : 'Review hidden');
    fetchReviews();
  } catch (err) {
    console.error('Error toggling hide:', err);
    toast.error(err.response?.data?.message || 'Action failed');
  }
};

  const handleReset = () => {
    setSearch('');
    setDebouncedSearch('');
    setProductFilter('');
    setFilter('all');
    setVerificationFilter('all');
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by product, reviewer, comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary w-64"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>

          {/* Product filter */}
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary"
          >
            <option value="">All Products</option>
            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>

          {/* Verification filter */}
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="verified">Verified Purchase</option>
            <option value="guest">Guest</option>
            <option value="user">Registered User</option>
          </select>

          {/* Rating filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 ★</option>
            <option value="4">4 ★</option>
            <option value="3">3 ★</option>
            <option value="2">2 ★</option>
            <option value="1">1 ★</option>
          </select>

          {/* Reset button */}
          <button onClick={handleReset} className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50">
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No reviews found</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white rounded-xl shadow-sm p-4 border">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img
                    src={r.productImage || 'https://via.placeholder.com/60'}
                    alt={r.productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>
                <div className="flex-1 flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">{r.productName}</p>
                    <p className="text-sm text-gray-500">
                      {r.userName} {r.isGuest ? '(Guest)' : ''}
                      {r.verifiedPurchase && <span className="ml-1 text-green-600">✓ Verified Purchase</span>}
                    </p>
                    <div className="flex text-yellow-400 mt-1">
                      {[...Array(5)].map((_, i) =>
                        i < r.rating ? <StarSolid key={i} className="h-4 w-4" /> : <StarOutline key={i} className="h-4 w-4" />
                      )}
                    </div>
                    {r.title && <p className="font-medium mt-1">{r.title}</p>}
                    <p className="text-gray-600 mt-1">{r.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleHide(r._id, r.isHidden)}
                      className="text-gray-500 hover:text-primary transition"
                      title={r.isHidden ? 'Restore' : 'Hide'}
                    >
                      {r.isHidden ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReviewsPage;