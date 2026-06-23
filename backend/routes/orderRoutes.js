const express = require('express');
const {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getGuestOrderByToken,
  getOrderForReview,
  // getGuestOrderForReview is now imported in server.js
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateOrder, handleValidationErrors } = require('../utils/validation');

const router = express.Router();

// Public route – guests can place orders (no authentication)
router.route('/').post(validateOrder, handleValidationErrors, addOrderItems).get(protect, admin, getOrders);

// Logged-in user routes
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.get('/:id/guest/:token', getGuestOrderByToken);

router.get('/:id/review', protect, getOrderForReview);

// Admin status & payment updates
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/pay').put(protect, admin, updatePaymentStatus);

module.exports = router;