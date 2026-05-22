// frontend/src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { TrashIcon, PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  updateCartItemBackend,
  removeCartItemBackend,
  clearCartBackend,
  updateCartItemGuest,
  removeCartItemGuest,
  clearCartGuest,
} from '../redux/slices/cartSlice';
import ProductCard from '../components/Products/ProductCard';
import api from '../services/api';
import toast from 'react-hot-toast';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const [processing, setProcessing] = useState(false);
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  const isLoggedIn = !!userInfo;

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoadingFeatured(true);
      try {
        const res = await api.get('/products?featured=true&limit=8');
        setFeatured(res.data.products);
      } catch (err) {
        console.error('Failed to fetch featured products', err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(item);
      return;
    }
    if (newQuantity > item.stock) {
      setErrorMessage(`Only ${item.stock} left in stock. Cannot add more.`);
      return;
    }
    try {
      if (isLoggedIn) {
        dispatch(updateCartItemBackend({ productId: item.productId, quantity: newQuantity }));
      } else {
        dispatch(updateCartItemGuest({ productId: item.productId, quantity: newQuantity }));
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = (item) => {
    if (isLoggedIn) {
      dispatch(removeCartItemBackend(item.productId));
    } else {
      dispatch(removeCartItemGuest(item.productId));
    }
    toast.success(`${item.name} removed from cart`);
  };

  const handleClearCart = () => {
    setShowClearCartModal(true);
  };

  const confirmClearCart = () => {
    if (isLoggedIn) {
      dispatch(clearCartBackend());
    } else {
      dispatch(clearCartGuest());
    }
    toast.success('Cart cleared');
    setShowClearCartModal(false);
  };

  const handleCheckout = () => {
    setProcessing(true);
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn-primary inline-block">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {errorMessage && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold text-center mb-8">Shopping Cart</h1>
      <div className="border-t border-gray-200 mb-8"></div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="flex justify-between items-center mb-6">
            <Link to="/shop" className="text-primary text-sm hover:underline flex items-center gap-1">
              Continue Shopping
            </Link>
            <button onClick={handleClearCart} className="text-red-600 text-sm hover:underline">
              Clear Cart
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-600 border-b">
              <div className="md:col-span-6">Product</div>
              <div className="md:col-span-2 text-center">Price</div>
              <div className="md:col-span-2 text-center">Quantity</div>
              <div className="md:col-span-1 text-center">Total</div>
              <div className="md:col-span-1"></div>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.productId} className="flex flex-col md:grid md:grid-cols-12 gap-4 p-4 md:p-6 items-center">
                  <div className="flex items-center gap-4 md:col-span-6 w-full">
                    <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                    <div>
                      <Link to={`/product/${item.productId}`} className="font-semibold text-gray-800 hover:text-primary">
                        {item.name}
                      </Link>
                      <p className={`text-sm ${item.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </p>
                    </div>
                  </div>
                  <div className="text-center md:col-span-2">
                    <span className="text-gray-600">Rs. {item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-center md:col-span-2">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                        className="px-3 py-1 border-r hover:bg-gray-100"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-1 min-w-[3rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                        disabled={item.stock === 0}
                        className={`px-3 py-1 border-l ${item.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-center md:col-span-1 font-semibold text-gray-800">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </div>
                  <div className="text-center md:col-span-1">
                    <button onClick={() => handleRemoveItem(item)} className="text-red-500 hover:text-red-700 transition">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-800 text-lg pt-2 border-t">
                <span>Total</span>
                <span>Rs. {totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={handleCheckout} disabled={processing} className="btn-primary w-full mt-6 py-3 text-lg active:bg-primary/80 active:scale-95 transition-all duration-200">
              {processing ? 'Processing...' : 'Proceed to Checkout'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-4">Cash on Delivery available</p>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">You may also like</h2>
        <div className="border-t border-gray-200 mb-6"></div>
        {loadingFeatured ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>
        ) : featured.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No featured products available.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.slice(0, 8).map((product) => <ProductCard key={product._id} product={product} showAddToCart />)}
            </div>
            <div className="text-center mt-8">
              <Link to="/shop?featured=true" className="btn-primary inline-block px-6 py-2 active:bg-primary/80 active:scale-95 transition-all duration-200">
                View All Featured Products
              </Link>
            </div>
          </>
        )}
      </div>

      {showClearCartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Clear Cart</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to remove all items from your cart? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowClearCartModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
              <button onClick={confirmClearCart} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition">Yes, Clear Cart</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;