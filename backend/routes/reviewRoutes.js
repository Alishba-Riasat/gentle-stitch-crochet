const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getProductReviews,
  addUserReview,
  addGuestReview,
  getAllReviewsAdmin,
  deleteReviewAdmin,
  hideReviewAdmin,
} = require('../controllers/reviewController');

const router = express.Router();

// Public – get reviews for a product
router.get('/product/:id', getProductReviews);

// Logged user – add review
router.post('/product/:id/review', protect, addUserReview);

// Guest – add review via token
router.post('/guest-review/:token', addGuestReview);

// Admin routes
router.get('/admin/all', protect, admin, getAllReviewsAdmin);
router.delete('/admin/:reviewId', protect, admin, deleteReviewAdmin);
router.put('/admin/:reviewId/hide', protect, admin, hideReviewAdmin);

module.exports = router;