import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import ProductCard from '../components/Products/ProductCard';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const wishlistIds = useSelector((state) => state.wishlist.items);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Fetch each product individually or use a batch endpoint
        const productPromises = wishlistIds.map(id => api.get(`/products/${id}`));
        const responses = await Promise.all(productPromises);
        setProducts(responses.map(res => res.data));
      } catch (error) {
        console.error('Failed to fetch wishlist products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistProducts();
  }, [wishlistIds]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-center mb-4">Your Wishlist</h1>
        <div className="border-t border-gray-200 mb-8"></div>
        <p className="text-gray-500 mb-6">Your wishlist is empty.</p>
        <Link to="/shop" className="btn-primary inline-block">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-6">Your Wishlist</h1>
      <div className="border-t border-gray-200 mb-12"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product._id} product={product} showAddToCart />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;