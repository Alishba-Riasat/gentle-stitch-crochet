import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { TrashIcon, ExclamationTriangleIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, order: null });
  const [deleting, setDeleting] = useState(false);

  const fetchOrders = async (keyword = '', orderStatus = '', paymentStatus = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (orderStatus) params.append('orderStatus', orderStatus);
      if (paymentStatus) params.append('paymentStatus', paymentStatus);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get(`/orders${queryString}`);
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(searchQuery, statusFilter, paymentFilter); }, [searchQuery, statusFilter, paymentFilter]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchOrders(searchQuery, statusFilter, paymentFilter);
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const openDeleteModal = (order) => setDeleteModal({ open: true, order });
  const closeDeleteModal = () => !deleting && setDeleteModal({ open: false, order: null });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm.trim());
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  const resetFilters = () => {
    setStatusFilter('');
    setPaymentFilter('');
  };

  const activeFilterText = [
    searchQuery ? `"${searchQuery}"` : null,
    statusFilter ? `Status: ${statusFilter}` : null,
    paymentFilter ? `Payment: ${paymentFilter}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  const handleDelete = async () => {
    if (!deleteModal.order) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/orders/${deleteModal.order._id}`);
      toast.success('Order deleted');
      closeDeleteModal();
      fetchOrders(searchQuery, statusFilter, paymentFilter);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const statusColors = {
    pending: 'bg-yellow-100',
    processing: 'bg-blue-100',
    shipped: 'bg-purple-100',
    delivered: 'bg-green-100',
    cancelled: 'bg-red-100',
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Orders</h1>
          {(searchQuery || statusFilter || paymentFilter) && (
            <p className="mt-2 text-sm text-gray-500">
              Showing results for{' '}
              {searchQuery && <span className="font-semibold text-gray-700">"{searchQuery}"</span>}
              {statusFilter && <span className="font-semibold text-gray-700">{searchQuery ? ', ' : ''}Status: {statusFilter}</span>}
              {paymentFilter && <span className="font-semibold text-gray-700">{(searchQuery || statusFilter) ? ', ' : ''}Payment: {paymentFilter}</span>}
            </p>
          )}
        </div>
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders by ID, customer, email, phone, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-72 px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary focus:outline-none"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <button type="submit" className="btn-primary px-4 py-2">Search</button>
          {searchQuery && (
            <button type="button" onClick={handleResetSearch} className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50">
              Reset
            </button>
          )}
        </form>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <button
          type="button"
          onClick={() => setStatusFilter('')}
          className={`rounded-full px-3 py-1 text-sm ${statusFilter === '' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          All
        </button>
        {statusOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatusFilter(option)}
            className={`rounded-full px-3 py-1 text-sm ${statusFilter === option ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <label htmlFor="paymentFilter" className="text-sm font-medium text-gray-700">Payment</label>
          <select
            id="paymentFilter"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary focus:outline-none"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
        >
          Clear filters
        </button>
      </div>
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No orders found{searchQuery ? ` for "${searchQuery}"` : ''}.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Order ID</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-t">
                  <td className="p-3">#{order._id.slice(-8)}</td>
                  <td className="p-3">{order.user?.name || order.guestEmail || 'Guest'}</td>
                  <td className="p-3">Rs.{order.totalPrice.toFixed(2)}</td>
                  <td className="p-3">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className={`px-2 py-1 rounded ${statusColors[order.orderStatus]}`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Link to={`/order/${order._id}`} className="text-primary hover:underline mr-3">
                      View
                    </Link>
                    <button
                      onClick={() => openDeleteModal(order)}
                      className="text-red-600 hover:text-red-800 transition active:scale-95"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal (same style as products) */}
      {deleteModal.open && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center px-4 transition-all duration-300"
          onClick={closeDeleteModal}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/80" />
            <button
              onClick={closeDeleteModal}
              disabled={deleting}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="px-6 pb-6 pt-7">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/20">
                <ExclamationTriangleIcon className="h-8 w-8" />
              </div>
              <div className="mt-5 text-center">
                <h3 className="text-xl font-bold text-gray-900">Delete order</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Are you sure you want to delete order{' '}
                  <span className="font-semibold text-gray-800">#{deleteModal.order?._id.slice(-8)}</span>?<br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/80 active:scale-95 disabled:opacity-60"
                >
                  <TrashIcon className="h-4 w-4" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrdersPage;