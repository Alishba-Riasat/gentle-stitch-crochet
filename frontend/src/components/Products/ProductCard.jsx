 

import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const ProductCard = ({ product, showAddToCart = false }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isInWishlist = wishlistItems.includes(product._id);

  const images = product.images || [];
  const mainImage = images.find(img => img.isMain) || images[0];
  const imageUrl = mainImage?.url || 'https://via.placeholder.com/300?text=No+Image';
  const rating = product.rating || 0;
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;
  const isOnSale = product.comparePrice && product.comparePrice > product.price;

  const handleAddToCart = () => {
    alert(`Added ${product.name} to cart (cart not implemented yet)`);
  };

  const toggleWishlist = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };

  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ease-in-out relative">
      {/* Wishlist Heart Button (top right) */}
      <button
        onClick={toggleWishlist}
        className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-1.5 shadow-sm hover:bg-white transition"
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isInWishlist ? (
          <HeartSolid className="h-5 w-5 text-red-500" />
        ) : (
          <HeartOutline className="h-5 w-5 text-gray-600 hover:text-red-500" />
        )}
      </button>

      <Link to={`/product/${product._id}`} className="block overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-gray-600 font-medium">Rs.{product.price?.toFixed(2) || '0.00'}</span>
          {isOnSale && (
            <>
              <span className="text-sm text-gray-400 line-through">Rs.{product.comparePrice?.toFixed(2)}</span>
              <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded">Sale</span>
            </>
          )}
        </div>

        <div className="flex items-center mt-2">
          <div className="flex text-yellow-400">
            {'★'.repeat(fullStars)}{'☆'.repeat(emptyStars)}
          </div>
          <span className="text-xs text-gray-500 ml-1">({product.numReviews || 0})</span>
        </div>

        {showAddToCart && (
          <button
            onClick={handleAddToCart}
            className="mt-3 w-full bg-gray-100 text-gray-800 text-sm py-2 rounded-lg hover:bg-primary hover:text-white transition-colors duration-200 font-medium"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;



