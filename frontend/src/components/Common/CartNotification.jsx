// frontend/src/components/Common/CartNotification.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { hideNotification } from '../../redux/slices/cartNotificationSlice';

const CartNotification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { open, product, quantity } = useSelector((state) => state.cartNotification);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [open, dispatch]);

  if (!open || !product) return null;

  const handleViewCart = () => {
    dispatch(hideNotification());
    navigate('/cart');
  };

  const handleCheckout = () => {
    dispatch(hideNotification());
    navigate('/checkout');
  };

  const productImage = product.images?.[0]?.url || 'https://via.placeholder.com/80';

  return (
    <div className="fixed top-20 right-4 z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200 animate-slide-in-right">
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="font-semibold text-gray-800">Item added to your cart</h3>
        <button
          onClick={() => dispatch(hideNotification())}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4">
        <div className="flex gap-3">
          <img src={productImage} alt={product.name} className="w-16 h-16 object-cover rounded" />
          <div className="flex-1">
            <p className="font-medium text-gray-800">{product.name}</p>
            <p className="text-sm text-gray-500">Quantity: {quantity}</p>
            <p className="text-sm text-primary font-semibold mt-1">Rs. {product.price?.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleViewCart}
            className="flex-1 border border-primary text-primary py-2 rounded-lg hover:bg-primary hover:text-white transition"
          >
            View cart ({quantity})
          </button>
          <button
            onClick={handleCheckout}
            className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-opacity-90 transition"
          >
            Check out
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartNotification;