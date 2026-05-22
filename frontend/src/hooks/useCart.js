// frontend/src/hooks/useCart.js
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCartBackend,
  addToCartGuest,
  updateCartItemBackend,
  updateCartItemGuest,
  removeCartItemBackend,
  removeCartItemGuest,
  clearCartBackend,
  clearCartGuest,
} from '../redux/slices/cartSlice';
import { showNotification } from '../redux/slices/cartNotificationSlice';

export const useCartActions = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const isLoggedIn = !!userInfo;

  const addToCart = async (product, quantity = 1) => {
    try {
      if (isLoggedIn) {
        await dispatch(addToCartBackend({ productId: product._id, quantity })).unwrap();
      } else {
        dispatch(addToCartGuest({ product, quantity }));
      }
      // Show the custom slide‑in notification
      dispatch(showNotification({ product, quantity }));
    } catch (err) {
      // Silent fail or log to console (no toast)
      console.error('Add to cart failed:', err);
    }
  };

  const updateQuantity = (productId, quantity, stock) => {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }
    if (quantity > stock) {
      console.error(`Only ${stock} in stock`);
      return;
    }
    try {
      if (isLoggedIn) {
        dispatch(updateCartItemBackend({ productId, quantity }));
      } else {
        dispatch(updateCartItemGuest({ productId, quantity }));
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const removeItem = (productId) => {
    if (isLoggedIn) {
      dispatch(removeCartItemBackend(productId));
    } else {
      dispatch(removeCartItemGuest(productId));
    }
  };

  const clearCart = () => {
    if (isLoggedIn) {
      dispatch(clearCartBackend());
    } else {
      dispatch(clearCartGuest());
    }
  };

  return { addToCart, updateQuantity, removeItem, clearCart };
};