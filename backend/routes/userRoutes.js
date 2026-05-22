const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  addToWishlist,
  removeFromWishlist,
  getUsers,
} = require('../controllers/userController');

const router = express.Router();

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.put('/change-password', protect, changePassword);      // <-- new route
router.route('/wishlist/:productId').post(protect, addToWishlist).delete(protect, removeFromWishlist);
router.route('/').get(protect, admin, getUsers);

module.exports = router;