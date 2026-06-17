const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Sales stats
    const todaySales = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const weekSales = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfWeek }, orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const monthSales = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    // Order counts by status
    const orderStats = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);
    const orderCounts = {
      pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0,
    };
    orderStats.forEach(s => { orderCounts[s._id] = s.count; });

    // Customer stats
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const newCustomersThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfMonth },
    });
    const guestOrders = await Order.countDocuments({ user: null });
    const registeredOrders = await Order.countDocuments({ user: { $ne: null } });

    // Product stats
    const totalProducts = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lt: 10 } });

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      { $group: { _id: '$orderItems.product', totalSold: { $sum: '$orderItems.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', totalSold: 1, price: '$product.price', image: { $arrayElemAt: ['$product.images.url', 0] } } },
    ]);

    // Recent activity (combine orders, customers, products)
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');
    const recentCustomers = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5);
    const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      sales: {
        today: todaySales[0]?.total || 0,
        week: weekSales[0]?.total || 0,
        month: monthSales[0]?.total || 0,
        total: totalRevenue[0]?.total || 0,
      },
      orders: orderCounts,
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
        guestOrders,
        registeredOrders,
      },
      products: {
        total: totalProducts,
        outOfStock,
        lowStock,
      },
      topProducts,
      recentActivity: {
        orders: recentOrders,
        customers: recentCustomers,
        products: recentProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };