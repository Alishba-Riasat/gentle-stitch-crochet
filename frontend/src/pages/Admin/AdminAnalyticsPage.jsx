import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdminAnalyticsPage = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch revenue data
      try {
        const revenueRes = await api.get('/admin/analytics/revenue');
        setRevenueData(revenueRes.data);
      } catch (err) {
        console.error('Failed to fetch revenue data:', err);
        // Keep empty array
      }

      // Fetch order status data
      try {
        const ordersRes = await api.get('/admin/analytics/orders');
        setOrderStatus(ordersRes.data);
      } catch (err) {
        console.error('Failed to fetch order status:', err);
      }

      // Fetch review analytics (optional)
      try {
        const reviewsRes = await api.get('/admin/analytics/reviews');
        setReviewStats(reviewsRes.data);
      } catch (err) {
        console.error('Failed to fetch review analytics:', err);
        // Leave reviewStats as null – the section won't render
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Analytics</h1>

      {/* Revenue Chart */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Daily Revenue (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <XAxis dataKey="_id" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#8B5A2B" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders by Status */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Orders by Status</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={orderStatus}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8B5A2B" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Review Analytics (only if data exists) */}
      {reviewStats && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Review Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-primary/5 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-800">{reviewStats.totalReviews}</p>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold text-gray-800">{reviewStats.avgRating.toFixed(1)} ★</p>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Most Reviewed Product</p>
              <p className="text-base font-semibold text-gray-800">{reviewStats.productWithMostReviews?.name || 'N/A'}</p>
              <p className="text-xs text-gray-500">{reviewStats.productWithMostReviews?.count || 0} reviews</p>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Lowest Rated Product</p>
              <p className="text-base font-semibold text-gray-800">{reviewStats.productWithLowestRating?.name || 'N/A'}</p>
              <p className="text-xs text-gray-500">Avg {reviewStats.productWithLowestRating?.avg?.toFixed(1) || 0} ★</p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;