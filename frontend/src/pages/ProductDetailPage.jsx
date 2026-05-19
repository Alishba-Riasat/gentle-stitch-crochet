import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductById, clearProduct } from '../redux/slices/productSlice';
import ProductReviews from '../components/Products/ProductReviews';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading, error } = useSelector((state) => state.products);
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  useEffect(() => {
    dispatch(getProductById(id));
    return () => {
      dispatch(clearProduct());
    };
  }, [dispatch, id]);
  
  useEffect(() => {
    if (product && product.images && product.images.length) {
      const main = product.images.find(img => img.isMain) || product.images[0];
      setMainImage(main.url);
    }
  }, [product]);
  
  if (loading) return <div className="container mx-auto px-4 py-12 text-center">Loading product...</div>;
  if (error) return <div className="container mx-auto px-4 py-12 text-center text-red-500">{error}</div>;
  if (!product) return null;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-primary hover:underline">← Back</button>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="border rounded-lg overflow-hidden mb-2">
            <img src={mainImage} alt={product.name} className="w-full h-96 object-cover" />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`Thumb ${idx}`}
                  onClick={() => setMainImage(img.url)}
                  className={`w-20 h-20 object-cover border rounded cursor-pointer ${mainImage === img.url ? 'border-primary ring-2 ring-primary' : ''}`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          {product.category && (
            <p className="text-gray-500 mb-2">Category: {product.category.name}</p>
          )}
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
            </div>
            <span className="ml-2 text-sm text-gray-600">({product.numReviews} reviews)</span>
          </div>
          <div className="mb-4">
            <span className="text-2xl font-bold text-primary">₹{product.price.toFixed(2)}</span>
            {product.comparePrice > product.price && (
              <span className="ml-2 text-gray-500 line-through">₹{product.comparePrice.toFixed(2)}</span>
            )}
          </div>
          <p className="text-gray-700 mb-4">{product.description}</p>
          
          <div className="mb-4">
            <p className="font-medium">Availability:</p>
            <p className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </p>
          </div>
          
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 border-r">-</button>
                <span className="px-4 py-1">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-1 border-l">+</button>
              </div>
              <button 
                className="btn-primary px-6 py-2"
                onClick={() => alert(`Add ${quantity} to cart (cart not implemented yet)`)}
              >
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Reviews section */}
      <ProductReviews product={product} productId={product._id} />
    </div>
  );
};

export default ProductDetailPage;