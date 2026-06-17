const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopReviews,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateProduct, handleValidationErrors } = require('../utils/validation');

const router = express.Router();

// Public routes
router.route('/').get(getProducts);
router.route('/top-reviews').get(getTopReviews);
router.route('/:id').get(getProductById);

// Admin routes
router.route('/').post(protect, admin, validateProduct, handleValidationErrors, createProduct);
router.route('/:id').put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);

module.exports = router;