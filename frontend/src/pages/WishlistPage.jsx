import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import ProductCard from '../components/Products/ProductCard';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const wishlistIds = useSelector((state) => state.wishlist.items);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizedWishlistIds = useMemo(() => {
    if (!Array.isArray(wishlistIds)) return [];
    return Array.from(new Set(
      wishlistIds
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') return item._id || item.id || item.productId;
          return null;
        })
        .filter(Boolean)
    ));
  }, [wishlistIds]);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (normalizedWishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const productPromises = normalizedWishlistIds.map((id) => api.get(`/products/${id}`));
        const results = await Promise.allSettled(productPromises);
        const successfulProducts = results
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value.data);

        setProducts(successfulProducts);
        if (successfulProducts.length === 0) {
          setError('Unable to load wishlist products. Please refresh or try again later.');
        }
      } catch (fetchError) {
        console.error('Failed to fetch wishlist products', fetchError);
        setError('Unable to load wishlist products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistProducts();
  }, [normalizedWishlistIds]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-12 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-12 py-12 text-center">
        <h1 className="text-3xl font-bold text-center mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Your Wishlist</h1>
        <div className="border-t border-gray-200 mb-8"></div>
        <p className="text-gray-500 mb-6">
          {error ? error : 'Your wishlist is empty.'}
        </p>
        <Link to="/shop" className="btn-primary inline-block active:bg-primary/80 active:scale-95 transition-all duration-200 ">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-10 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Your Wishlist</h1>
      <div className="border-t border-gray-200 mb-12 mt-12"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product._id} product={product} showAddToCart />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;