import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../services/api';
import {
  ShoppingCartIcon,
  UsersIcon,
  CubeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="rounded-lg bg-white p-4 shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`rounded-full p-2 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    sales: { today: 0, week: 0, month: 0, total: 0 },
    orders: { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
    customers: { total: 0, newThisMonth: 0, guestOrders: 0, registeredOrders: 0 },
    products: { total: 0, outOfStock: 0, lowStock: 0 },
    topProducts: [],
    recentActivity: { orders: [], customers: [], products: [] },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Sales Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Today's Sales" value={`Rs. ${stats.sales.today.toFixed(2)}`} icon={ShoppingCartIcon} color="bg-blue-600" />
        <StatCard title="This Week" value={`Rs. ${stats.sales.week.toFixed(2)}`} icon={ShoppingCartIcon} color="bg-green-600" />
        <StatCard title="This Month" value={`Rs. ${stats.sales.month.toFixed(2)}`} icon={ShoppingCartIcon} color="bg-purple-600" />
        <StatCard title="Total Revenue" value={`Rs. ${stats.sales.total.toFixed(2)}`} icon={ShoppingCartIcon} color="bg-amber-600" />
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard title="Pending" value={stats.orders.pending} icon={ShoppingCartIcon} color="bg-yellow-600" />
        <StatCard title="Processing" value={stats.orders.processing} icon={ShoppingCartIcon} color="bg-blue-600" />
        <StatCard title="Shipped" value={stats.orders.shipped} icon={ShoppingCartIcon} color="bg-indigo-600" />
        <StatCard title="Delivered" value={stats.orders.delivered} icon={ShoppingCartIcon} color="bg-green-600" />
        <StatCard title="Cancelled" value={stats.orders.cancelled} icon={ShoppingCartIcon} color="bg-red-600" />
      </div>

      {/* Customer & Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold text-lg mb-3">Customers</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Total Customers:</span><span>{stats.customers.total}</span></div>
            <div className="flex justify-between"><span>New This Month:</span><span>{stats.customers.newThisMonth}</span></div>
            <div className="flex justify-between"><span>Guest Orders:</span><span>{stats.customers.guestOrders}</span></div>
            <div className="flex justify-between"><span>Registered Orders:</span><span>{stats.customers.registeredOrders}</span></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold text-lg mb-3">Products</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Total Products:</span><span>{stats.products.total}</span></div>
            <div className="flex justify-between text-red-600"><span>Out of Stock:</span><span>{stats.products.outOfStock}</span></div>
            <div className="flex justify-between text-amber-600"><span>Low Stock (&lt;10):</span><span>{stats.products.lowStock}</span></div>
          </div>
        </div>
      </div>

      {/* Top Selling Products with image */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h2 className="font-semibold text-lg mb-3">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Image</th>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-center">Sold</th>
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">
                    <img src={p.image || 'https://via.placeholder.com/40'} alt={p.name} className="w-10 h-10 object-cover rounded" />
                  </td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2 text-center">{p.totalSold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity with images for new products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Recent Orders</h3>
          {stats.recentActivity.orders.map(o => (
            <div key={o._id} className="text-sm border-b py-1">Order #{o._id.slice(-8)} - {o.user?.name || 'Guest'}</div>
          ))}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">New Customers</h3>
          {stats.recentActivity.customers.map(c => (
            <div key={c._id} className="text-sm border-b py-1">{c.name} ({c.email})</div>
          ))}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">New Products</h3>
          {stats.recentActivity.products.map(p => (
            <div key={p._id} className="flex items-center gap-2 text-sm border-b py-2">
              <img src={p.images?.[0]?.url || 'https://via.placeholder.com/30'} alt={p.name} className="w-8 h-8 object-cover rounded" />
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;