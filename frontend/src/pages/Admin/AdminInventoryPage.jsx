import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = async (pageToLoad = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await api.get(`/products?limit=100&page=${pageToLoad}`);
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

  const loadMoreProducts = () => {
    if (page < pages && !loadingMore) {
      fetchProducts(page + 1, true);
    }
  };

  useEffect(() => { fetchProducts(1, false); }, []);

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 10);
  const outOfStock = products.filter(p => p.stock === 0);

  if (loading) return <AdminLayout><div className="text-center py-12">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Inventory</h1>

      {/* Out of Stock Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          
          Out of Stock ({outOfStock.length})
        </h2>
        {outOfStock.length === 0 ? (
          <p className="text-gray-500 italic">No out of stock items.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {outOfStock.map(p => (
              <div key={p._id} className="bg-white rounded-lg shadow p-3 flex items-center gap-3">
                <img
                  src={p.images[0]?.url || 'https://via.placeholder.com/50'}
                  alt={p.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                  <p className="text-sm text-red-500 font-semibold">Stock: {p.stock}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Stock Section */}
      <div>
        <h2 className="text-xl font-semibold text-amber-600 mb-4 flex items-center gap-2">
          
          Low Stock &lt;10  ({lowStockProducts.length})
        </h2>
        {lowStockProducts.length === 0 ? (
          <p className="text-gray-500 italic">No low stock items.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {lowStockProducts.map(p => (
              <div key={p._id} className="bg-white rounded-lg shadow p-3 flex items-center gap-3">
                <img
                  src={p.images[0]?.url || 'https://via.placeholder.com/50'}
                  alt={p.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                  <p className="text-sm text-amber-600 font-semibold">Stock: {p.stock}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {page < pages && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMoreProducts}
            disabled={loadingMore}
            className="btn-primary px-5 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loadingMore ? 'Loading more products...' : `Load more products (${products.length} of ${totalProducts})`}
          </button>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminInventoryPage;