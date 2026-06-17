import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, XMarkIcon, TrashIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const AdminCustomersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async (search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(searchTerm);
  };

  const handleReset = () => {
    setSearchTerm('');
    fetchUsers('');
  };

  const openDeleteModal = (user) => setDeleteModal({ open: true, user });
  const closeDeleteModal = () => !deleting && setDeleteModal({ open: false, user: null });

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteModal.user._id}`);
      toast.success('User deleted');
      closeDeleteModal();
      fetchUsers(searchTerm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'user' ? 'admin' : 'user';
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers(searchTerm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary focus:outline-none"
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
            <button type="submit" className="btn-primary py-2 px-4">Search</button>
            {searchTerm && (
              <button type="button" onClick={handleReset} className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50">
                Reset
              </button>
            )}
          </form>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No customers found</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.phone || '—'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-gray-100'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleRole(u._id, u.role)}
                      className="text-primary hover:text-primary/80 transition active:scale-95 mr-3"
                      title="Toggle role (user/admin)"
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(u)}
                      className="text-primary hover:text-primary/80 transition active:scale-95"
                      title="Delete user"
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

      {/* Delete Confirmation Modal – same as product page */}
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
                <h3 className="text-xl font-bold text-gray-900">Delete user</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Are you sure you want to delete <span className="font-semibold text-gray-800">“{deleteModal.user?.name}”</span>?<br />
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

export default AdminCustomersPage;