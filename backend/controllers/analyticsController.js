const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get revenue data for charts (last 30 days)
// @route   GET /api/admin/analytics/revenue
// @access  Private/Admin
const getRevenueData = async (req, res) => {
  try {
    const days = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const revenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, orderStatus: 'delivered' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order counts per status
// @route   GET /api/admin/analytics/orders
// @access  Private/Admin
const getOrderStatusData = async (req, res) => {
  try {
    const counts = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);
    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getReviewAnalytics = async (req, res) => {
  try {
    const products = await Product.find({}, 'name reviews');
    let totalReviews = 0;
    let totalRating = 0;
    let productWithMostReviews = null;
    let productWithLowestRating = null;

    products.forEach(p => {
      const count = p.reviews.length;
      if (count > 0) {
        totalReviews += count;
        const avg = p.reviews.reduce((sum, r) => sum + r.rating, 0) / count;
        totalRating += avg;
        if (!productWithMostReviews || count > productWithMostReviews.count) {
          productWithMostReviews = { name: p.name, count };
        }
        if (!productWithLowestRating || avg < productWithLowestRating.avg) {
          productWithLowestRating = { name: p.name, avg };
        }
      }
    });

    const avgRating = totalReviews > 0 ? totalRating / products.filter(p => p.reviews.length > 0).length : 0;

    res.json({
      totalReviews,
      avgRating,
      productWithMostReviews,
      productWithLowestRating,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRevenueData, getOrderStatusData, getReviewAnalytics };