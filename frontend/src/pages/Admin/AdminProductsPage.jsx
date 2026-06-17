import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AdminProductForm from '../../components/Admin/AdminProductForm';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async (pageToLoad = 1, append = false, keyword = '') => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({ limit: '100', page: pageToLoad.toString() });
      if (keyword) params.append('keyword', keyword);
      const res = await api.get(`/products?${params.toString()}`);
      const fetchedProducts = res.data.products || [];

      setProducts(prev => (append ? [...prev, ...fetchedProducts] : fetchedProducts));
      setPage(pageToLoad);
      setPages(res.data.pages || 1);
      setTotalProducts(res.data.total || 0);
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, false, searchQuery);
  }, [searchQuery]);

  const openDeleteModal = (product) => setDeleteModal({ open: true, product });
  const closeDeleteModal = () => !deleting && setDeleteModal({ open: false, product: null });

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteModal.product._id}`);
      toast.success('Product deleted');
      closeDeleteModal();
      fetchProducts(1, false, searchQuery);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const loadMoreProducts = () => {
    if (page < pages && !loadingMore) {
      fetchProducts(page + 1, true, searchQuery);
    }
  };

  const handleToggleFeatured = async (id, currentFeatured) => {
    try {
      await api.put(`/admin/products/${id}`, { featured: !currentFeatured });
      toast.success('Updated');
      fetchProducts(1, false, searchQuery);
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm.trim());
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by name, category or sku..."
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
            <button type="submit" className="btn-primary py-2 px-4">Search</button>
            {searchQuery && (
              <button type="button" onClick={handleResetSearch} className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50">
                Reset
              </button>
            )}
          </form>
          <button
            onClick={() => { setEditingProduct(null); setShowModal(true); }}
            className="btn-primary flex items-center gap-2 active:scale-95 transition-all duration-200"
          >
            <PlusIcon className="h-5 w-5" /> Add Product
          </button>
        </div>
      </div>

      {loading ? (
  <div className="text-center py-12">Loading...</div>
) : products.length === 0 ? (
  <div className="bg-white rounded-lg shadow p-10 text-center">
    <MagnifyingGlassIcon className="mx-auto h-10 w-10 text-gray-300" />
    <h2 className="mt-3 text-lg font-semibold text-gray-900">
      No products found
    </h2>
    <p className="mt-1 text-sm text-gray-500">
      {searchQuery
        ? `No products match "${searchQuery}". Try searching by name, category, SKU, stock, featured, or best seller.`
        : 'No products have been added yet.'}
    </p>

    {searchQuery && (
      <button
        type="button"
        onClick={handleResetSearch}
        className="mt-5 btn-primary px-4 py-2"
      >
        Clear search
      </button>
    )}
  </div>
) : (
  <>
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full">
              <thead className="bg-gray-50">
    <tr>
      <th className="p-3 text-left">Image</th>
      <th className="p-3 text-left">Name</th>
      <th className="p-3 text-left">Price</th>
      <th className="p-3 text-left">Stock</th>
      <th className="p-3 text-left">Featured</th>
      <th className="p-3 text-left">Actions</th>
    </tr>
  </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} className="border-t">
                    <td className="p-3">
                      <img src={p.images[0]?.url || 'https://via.placeholder.com/50'} alt={p.name} className="w-12 h-12 object-cover rounded" />
                    </td>
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">Rs.{p.price.toFixed(2)}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleFeatured(p._id, p.featured)}
                        className={`px-2 py-1 rounded transition ${p.featured ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {p.featured ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => { setEditingProduct(p); setShowModal(true); }}
                        className="text-primary mr-2 hover:text-primary/80 transition active:scale-95"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(p)}
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

          {page < pages && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={loadMoreProducts}
                disabled={loadingMore}
                className="btn-primary px-5 py-2 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loadingMore ? 'Loading more products...' : `Load more products (${products.length} of ${totalProducts})`}
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal – Primary Colour Scheme */}
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
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="px-6 pb-6 pt-7">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/20">
                <ExclamationTriangleIcon className="h-8 w-8" />
              </div>

              <div className="mt-5 text-center">
                <h3 className="text-xl font-bold text-gray-900">Delete product</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Are you sure you want to delete <span className="font-semibold text-gray-800">“{deleteModal.product?.name}”</span>?<br />
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

      {showModal && (
        <AdminProductForm
          product={editingProduct}
          onClose={() => {
            setShowModal(false);
            fetchProducts();
          }}
        />
      )}
    </AdminLayout>
  );
};

export default AdminProductsPage;