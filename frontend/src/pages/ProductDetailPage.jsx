import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductById, clearProduct } from '../redux/slices/productSlice';
import ProductReviews from '../components/Products/ProductReviews';
import ProductCard from '../components/Products/ProductCard';
import { useCartActions } from '../hooks/useCart';
import api from '../services/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading, error } = useSelector((state) => state.products);
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const { addToCart } = useCartActions();

  useEffect(() => {
    dispatch(getProductById(id));
    return () => {
      dispatch(clearProduct());
    };
  }, [dispatch, id]);

  // Fetch related products when product is loaded
  useEffect(() => {
    const fetchRelated = async () => {
      if (!product || !product.category) return;
      setLoadingRelated(true);
      try {
        const res = await api.get(`/products?category=${product.category.slug}&limit=12`);
        // Filter out the current product
        const filtered = res.data.products.filter(p => p._id !== product._id);
        setRelatedProducts(filtered.slice(0, 10));
      } catch (err) {
        console.error('Failed to fetch related products', err);
      } finally {
        setLoadingRelated(false);
      }
    };
    fetchRelated();
  }, [product]);

  useEffect(() => {
    if (product && product.images && product.images.length) {
      const main = product.images.find(img => img.isMain) || product.images[0];
      setMainImage(main.url);
    }
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">Loading product...</div>;
  if (error) return <div className="container mx-auto px-4 py-12 text-center text-red-500">{error}</div>;
  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
            </div>
            <span className="ml-2 text-sm text-gray-600">({product.numReviews} reviews)</span>
          </div>
          <div className="mb-4">
            <span className="text-2xl font-bold text-primary">Rs.{product.price.toFixed(2)}</span>
            {product.comparePrice > product.price && (
              <span className="ml-2 text-gray-500 line-through">Rs.{product.comparePrice.toFixed(2)}</span>
            )}
          </div>
          <div className="mb-4">
            
            <p className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </p>
          </div>
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 border-r">-</button>
                <span className="px-4 py-1">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-1 border-l">+</button>
              </div>
              <button className="btn-primary active:bg-primary/80 active:scale-95 transition-all duration-200  px-6 py-2" onClick={handleAddToCart}>
                Add to Cart
              </button>
            </div>
          )}
          <div className="border-t border-gray-200 mb-8"></div>
          <p className="text-gray-700 mb-4">{product.description}</p>
        </div>
      </div>

      {/* Reviews section */}
      <ProductReviews product={product} productId={product._id} />

      {/* You may also like section */}
      <div className="mt-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">You may also like</h2>
        <div className="border-t border-gray-200 mb-6"></div>
        {loadingRelated ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : relatedProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No related products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {relatedProducts.map((related) => (
              <ProductCard key={related._id} product={related} showAddToCart />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;