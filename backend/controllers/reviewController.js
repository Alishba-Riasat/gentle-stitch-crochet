

const Product = require('../models/Product');
const Order = require('../models/Order');
const ReviewToken = require('../models/ReviewToken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// ──────────────────────────────────────────────
//  HELPER: Recalculate product rating
// ──────────────────────────────────────────────
const recalculateRating = async (productId) => {
  const product = await Product.findById(productId);
  const reviews = product.reviews || [];
  product.numReviews = reviews.length;
  product.rating = reviews.reduce((sum, r) => sum + r.rating, 0) / (product.numReviews || 1);
  await product.save();
};

// ──────────────────────────────────────────────
//  1. GET product reviews (public)
// ──────────────────────────────────────────────
const getProductReviews = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product.reviews);
};

// ──────────────────────────────────────────────
//  2. ADD review – LOGGED USER
// ──────────────────────────────────────────────
const addUserReview = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  const { rating, title, comment, media = [] } = req.body;
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // Check if user already reviewed
  const existing = product.reviews.find(
    r => r.user && r.user.toString() === req.user._id.toString()
  );
  if (existing) {
    return res.status(400).json({ message: 'You have already reviewed this product' });
  }

  // Verify purchase (must have a delivered order for this product)
  const hasDeliveredOrder = await Order.findOne({
    user: req.user._id,
    'orderItems.product': id,
    orderStatus: 'delivered',
  });
  if (!hasDeliveredOrder) {
    return res.status(400).json({ message: 'You can only review products you have purchased and received' });
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    email: req.user.email,
    rating: Number(rating),
    title: title || '',
    comment,
    isGuest: false,
    verifiedPurchase: true,
    createdAt: new Date(),
    order: hasDeliveredOrder._id,
media,
  };

  product.reviews.push(review);
  await product.save();
  await recalculateRating(product._id);

  res.status(201).json({ message: 'Review added successfully', review: review });
};

const addGuestReview = async (req, res) => {
  const { token } = req.params;
  const { rating, title, comment, media = [] } = req.body;

  const tokenDoc = await ReviewToken.findOne({ token, isUsed: false });
  if (!tokenDoc) {
    return res.status(400).json({ message: 'Invalid or expired review link' });
  }

  const order = await Order.findById(tokenDoc.order);
  if (!order) {
    return res.status(400).json({ message: 'Order not found' });
  }

  if (order.orderStatus !== 'delivered') {
    return res.status(400).json({ message: 'You can review this product after delivery' });
  }

  const itemExists = order.orderItems.some(
    item => item.product.toString() === tokenDoc.product.toString()
  );

  if (!itemExists) {
    return res.status(400).json({ message: 'This product does not belong to this order' });
  }

  const product = await Product.findById(tokenDoc.product);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const existing = product.reviews.find(
    review =>
      review.email === tokenDoc.email &&
      review.order &&
      review.order.toString() === order._id.toString()
  );

  if (existing) {
    return res.status(400).json({ message: 'You have already reviewed this product' });
  }

  const review = {
    user: null,
    order: order._id,
    name: order.shippingAddress?.fullName || 'Guest',
    email: tokenDoc.email,
    rating: Number(rating),
    title: title || '',
    comment,
    media,
    isGuest: true,
    verifiedPurchase: true,
    createdAt: new Date(),
  };

  product.reviews.push(review);
  await product.save();
  await recalculateRating(product._id);

  tokenDoc.isUsed = true;
  await tokenDoc.save();

  res.status(201).json({ message: 'Review added successfully', review });
};

// ──────────────────────────────────────────────
//  4. GENERATE review tokens for delivered orders
//     (called when order status changes to delivered)
// ──────────────────────────────────────────────
const generateReviewTokensForOrder = async (order) => {
  const tokens = [];
  for (const item of order.orderItems) {
    const existing = await ReviewToken.findOne({ order: order._id, product: item.product });
    if (!existing) {
      const token = require('crypto').randomBytes(32).toString('hex');
      const tokenDoc = new ReviewToken({
        order: order._id,
        product: item.product,
        email: order.guestEmail || order.user.email,
        token,
      });
      await tokenDoc.save();
      tokens.push(tokenDoc);
    }
  }
  return tokens;
};

// ──────────────────────────────────────────────
//  5. SEND review invitation email
// ──────────────────────────────────────────────
const sendReviewInvitation = async (order, product, token) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const reviewUrl = `${frontendUrl}/guest-review/${token}`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8B5A2B;">How was your ${product.name}?</h2>
      <p>We hope you loved your order. Please share your experience with us.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${reviewUrl}" style="background: #8B5A2B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          Write a Review
        </a>
      </div>
      <p style="font-size: 12px; color: #666;">This link is valid for 30 days.</p>
    </div>
  `;

  const recipientEmail = order.guestEmail || order.user.email;
  await sendEmail({
    email: recipientEmail,
    subject: `How was your ${product.name}?`,
    html: emailHtml,
  });
};



// ──────────────────────────────────────────────
//  6. ADMIN – Get all reviews with filters
// ──────────────────────────────────────────────
const getAllReviewsAdmin = async (req, res) => {
  try {
    const { search, product, rating, verification } = req.query;

    let productQuery = {};
    if (product) {
      productQuery._id = product;
    }
    if (search) {
      productQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'reviews.name': { $regex: search, $options: 'i' } },
        { 'reviews.comment': { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(productQuery, 'name reviews images');
    let allReviews = [];
    products.forEach(product => {
      const mainImage = product.images && product.images.length > 0 ? product.images[0].url : null;
      product.reviews.forEach(review => {
        if (rating && review.rating !== parseInt(rating)) return;
        if (verification) {
          if (verification === 'verified' && !review.verifiedPurchase) return;
          if (verification === 'guest' && !review.isGuest) return;
          if (verification === 'user' && review.isGuest) return;
        }
        allReviews.push({
          _id: review._id,
          productId: product._id,
          productName: product.name,
          productImage: mainImage,
          userName: review.name,
          email: review.email,
          rating: review.rating,
          title: review.title || '',
          comment: review.comment,
          isGuest: review.isGuest || false,
          verifiedPurchase: review.verifiedPurchase || false,
          isHidden: review.isHidden || false,
          createdAt: review.createdAt,
        });
      });
    });
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(allReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
//  7. ADMIN – Delete a review
// ──────────────────────────────────────────────
const deleteReviewAdmin = async (req, res) => {
  const { reviewId } = req.params;
  const product = await Product.findOne({ 'reviews._id': reviewId });
  if (!product) return res.status(404).json({ message: 'Review not found' });
  product.reviews.pull(reviewId);
  await product.save();
  await recalculateRating(product._id);
  res.json({ message: 'Review deleted' });
};

// ──────────────────────────────────────────────
//  8. ADMIN – Hide/restore review (soft delete)

const hideReviewAdmin = async (req, res) => {
  const { reviewId } = req.params;
  const product = await Product.findOne({ 'reviews._id': reviewId });
  if (!product) return res.status(404).json({ message: 'Review not found' });
  const review = product.reviews.id(reviewId);
  review.isHidden = !review.isHidden;
  await product.save();
  // Recalculate rating (only visible reviews)
  const visibleReviews = product.reviews.filter(r => !r.isHidden);
  product.numReviews = visibleReviews.length;
  product.rating = visibleReviews.reduce((sum, r) => sum + r.rating, 0) / (product.numReviews || 1);
  await product.save();
  res.json({ message: review.isHidden ? 'Review hidden' : 'Review restored' });
};

module.exports = {
  getProductReviews,
  addUserReview,
  addGuestReview,
  generateReviewTokensForOrder,
  sendReviewInvitation,
  getAllReviewsAdmin,
  deleteReviewAdmin,
  hideReviewAdmin,
  recalculateRating,
};
