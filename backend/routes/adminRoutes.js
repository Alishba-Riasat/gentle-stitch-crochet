const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { getDashboardStats } = require('../controllers/adminController');
const { getRevenueData, getOrderStatusData, getReviewAnalytics} = require('../controllers/analyticsController');
const {
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const {
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { getUsers, getUserById, deleteUser, updateUserRole } = require('../controllers/userController');
const { getSettings, updateSettings } = require('../controllers/settingController');
const { getAdminProfile, updateAdminProfile } = require('../controllers/adminProfileController');
const router = express.Router();

// All routes require admin
router.use(protect, admin);

// Dashboard & Analytics
router.get('/stats', getDashboardStats);
router.get('/analytics/revenue', getRevenueData);
router.get('/analytics/orders', getOrderStatusData);
router.get('/analytics/reviews', getReviewAnalytics);
// Delete order
router.delete('/orders/:id', deleteOrder);
// Products (admin CRUD)
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Categories (admin CRUD)
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Orders status update
router.put('/orders/:id/status', updateOrderStatus);

// Customers (user management)
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);



router.route('/settings').get(getSettings).put(updateSettings);
router.route('/profile').get(getAdminProfile).put(updateAdminProfile);

module.exports = router;