import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../redux/slices/productSlice';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import ProductCard from '../components/Products/ProductCard';
import ProductSort from '../components/Products/ProductSort';
import ProductFilters from '../components/Products/ProductFilters';
import Pagination from '../components/Common/Pagination';
import { ArrowLeftIcon, HomeIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ShopPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, page, pages } = useSelector((state) => state.products);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const currentPage = Number(searchParams.get('page')) || 1;
  const currentKeyword = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || '-createdAt';
  const categorySlug = searchParams.get('category') || '';

  const isNew = searchParams.get('isNew') === 'true';
  const isBestSeller = searchParams.get('isBestSeller') === 'true';
  const isFeatured = searchParams.get('featured') === 'true';

  useEffect(() => {
    const params = {
      page: currentPage,
      keyword: currentKeyword,
      sort: currentSort,
    };
    if (categorySlug) params.category = categorySlug;
    if (isNew) params.isNew = true;
    if (isBestSeller) params.isBestSeller = true;
    if (isFeatured) params.featured = true;
    // Additional filters from URL (price, featured) are already handled by getProducts via query params
    // We'll read them directly from searchParams and pass to API
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featured = searchParams.get('featured');
    if (minPrice) params.minPrice = Number(minPrice);
    if (maxPrice) params.maxPrice = Number(maxPrice);
    if (featured === 'true') params.featured = true;
    dispatch(getProducts(params));
  }, [dispatch, currentPage, currentKeyword, currentSort, categorySlug, isNew, isBestSeller, isFeatured, searchParams]);

  const getPageTitle = () => {
    if (currentKeyword) return `Search Results for "${currentKeyword}"`;
    if (isNew) return 'New Arrivals';
    if (isBestSeller) return 'Best Sellers';
    if (isFeatured) return 'Featured Products';
    if (categorySlug) {
      return categorySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return 'All Products';
  };

  const handleSortChange = (sortValue) => {
    setSearchParams({ ...Object.fromEntries(searchParams), sort: sortValue, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page: newPage });
  };

  const goBack = () => {
    navigate(-1);
  };

  const handleFilterChange = (newFilters) => {
    // Merge existing params with new filters, reset page to 1
    const updated = { ...Object.fromEntries(searchParams), ...newFilters, page: 1 };
    setSearchParams(updated);
    setFilterDrawerOpen(false);
  };

  const showBreadcrumb = categorySlug && !isNew && !isBestSeller && !isFeatured;
  const breadcrumb = showBreadcrumb ? (
    <div className="flex items-center text-sm text-gray-500 space-x-2">
      <Link to="/" className="hover:text-primary flex items-center gap-1">
        <HomeIcon className="h-4 w-4" /> Home
      </Link>
      <span>/</span>
      <span className="text-gray-700 font-medium">{getPageTitle()}</span>
      {pages > 1 && (
        <>
          <span>/</span>
          <span>Page {currentPage} of {pages}</span>
        </>
      )}
    </div>
  ) : null;

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-10 py-12 max-w-7xl">
      {/* Title row with back arrow (only for categories) */}
      <div className="relative flex items-center justify-center mb-4">
        {categorySlug && !isNew && !isBestSeller && !isFeatured && (
          <button
            onClick={goBack}
            className="absolute left-0 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{getPageTitle()}</h1>
      </div>

      <div className="border-t border-gray-200 mb-6 mt-8"></div>

      {/* Breadcrumb + Sort/Filter row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        {breadcrumb && <div>{breadcrumb}</div>}
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            aria-label="Open filters"
          >
            <FunnelIcon className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-700 hidden sm:inline">Filter</span>
          </button>
          <ProductSort value={currentSort} onChange={handleSortChange} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No products found. Try adjusting your search or browse other categories.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} showAddToCart />
            ))}
          </div>
          {pages > 1 && (
            <div className="mt-12">
              <Pagination currentPage={page} totalPages={pages} onPageChange={handlePageChange} />
            </div>
          )}
        </>
      )}

      {/* Filter Drawer */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFilterDrawerOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto transition-transform transform translate-x-0">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={() => setFilterDrawerOpen(false)}>
                  <XMarkIcon className="h-6 w-6 text-gray-700" />
                </button>
              </div>
              <ProductFilters
                activeFilters={{
                  category: searchParams.get('category') || '',
                  minPrice: searchParams.get('minPrice') || '',
                  maxPrice: searchParams.get('maxPrice') || '',
                  featured: searchParams.get('featured') === 'true',
                }}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;