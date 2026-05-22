const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeGuestCart,
} = require('../controllers/cartController');

const router = express.Router();

router.route('/').get(protect, getCart).post(protect, addToCart).delete(protect, clearCart);
router.route('/:productId').put(protect, updateCartItem).delete(protect, removeFromCart);
router.post('/merge', protect, mergeGuestCart);

module.exports = router;