import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PencilIcon, TrashIcon, PlusIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AdminCategoryForm from '../../components/Admin/AdminCategoryForm';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, category: null });
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openDeleteModal = (category) => setDeleteModal({ open: true, category });
  const closeDeleteModal = () => !deleting && setDeleteModal({ open: false, category: null });

  const handleDelete = async () => {
    if (!deleteModal.category) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/categories/${deleteModal.category._id}`);
      toast.success('Category deleted');
      closeDeleteModal();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={() => { setEditingCategory(null); setModalOpen(true); }}
          className="btn-primary flex items-center gap-2 active:scale-95 transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id} className="border-t">
                  <td className="p-3">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">—</div>
                    )}
                  </td>
                  <td className="p-3 font-medium">{cat.name}</td>
                  <td className="p-3">
                    <button
                      onClick={() => { setEditingCategory(cat); setModalOpen(true); }}
                      className="text-primary mr-3 hover:text-primary/80 transition active:scale-95"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(cat)}
                      className="text-primary hover:text-primary/80 transition active:scale-95"
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

      {/* Delete Confirmation Modal (same style as product page) */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4 transition-all duration-300" onClick={closeDeleteModal}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/80" />
            <button onClick={closeDeleteModal} disabled={deleting} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="px-6 pb-6 pt-7">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/20">
                <ExclamationTriangleIcon className="h-8 w-8" />
              </div>
              <div className="mt-5 text-center">
                <h3 className="text-xl font-bold text-gray-900">Delete category</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Are you sure you want to delete <span className="font-semibold text-gray-800">“{deleteModal.category?.name}”</span>?<br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button onClick={closeDeleteModal} disabled={deleting} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/80 active:scale-95 disabled:opacity-60">
                  <TrashIcon className="h-4 w-4" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {modalOpen && (
        <AdminCategoryForm
          category={editingCategory}
          onClose={() => { setModalOpen(false); fetchCategories(); }}
          onSuccess={() => fetchCategories()}
        />
      )}
    </AdminLayout>
  );
};

export default AdminCategoriesPage;