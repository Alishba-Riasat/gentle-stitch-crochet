const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// Helper to optionally authenticate user from token (for public routes)
const optionalAuth = async (req) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // invalid token – ignore, user remains null
    }
  }
};

// ---------- Helper: Send order status email ----------
const sendOrderStatusEmail = async (order, oldStatus, newStatus, trackingNumber = null) => {
  let userEmail = order.guestEmail;
  if (order.user) {
    const user = await order.user?.email ? order.user : await User.findById(order.user).select('email');
    userEmail = user?.email;
  }
  if (!userEmail) return;

  let subject = '';
  let html = '';
  const baseStyle = 'font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;';
  const orderLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/${order._id}`;

  switch (newStatus) {
    case 'pending':
      subject = `Order Confirmation #${order._id}`;
      html = `<div style="${baseStyle}"><h2 style="color: #8B5A2B;">Thank you for your order!</h2><p>Your order has been received and is pending confirmation.</p><p><strong>Order ID:</strong> ${order._id}</p><p><strong>Total:</strong> Rs. ${order.totalPrice.toFixed(2)}</p><p><strong>Payment:</strong> Cash on Delivery</p><p>You will receive another email once your order is confirmed.</p><a href="${orderLink}" style="background: #8B5A2B; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">Track Order</a></div>`;
      break;
    case 'processing':
      subject = `Order Confirmed #${order._id}`;
      html = `<div style="${baseStyle}"><h2 style="color: #8B5A2B;">Your order has been confirmed!</h2><p>We are preparing your items for shipment.</p><p><strong>Order ID:</strong> ${order._id}</p><p>Estimated processing: 1‑2 business days.</p><a href="${orderLink}" style="background: #8B5A2B; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">Track Order</a></div>`;
      break;
    case 'shipped':
      subject = `Order Shipped #${order._id}`;
      const trackingHtml = trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : '';
      html = `<div style="${baseStyle}"><h2 style="color: #8B5A2B;">Your order is on the way!</h2><p>Your order has been shipped.</p>${trackingHtml}<p>You can track your package using the link below.</p><a href="${orderLink}" style="background: #8B5A2B; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">Track Order</a></div>`;
      break;
    case 'delivered':
      subject = `Order Delivered #${order._id}`;
      html = `<div style="${baseStyle}"><h2 style="color: #8B5A2B;">Your order has been delivered!</h2><p>We hope you love your purchase. Please consider leaving a review.</p><a href="${orderLink}" style="background: #8B5A2B; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">Rate your experience</a></div>`;
      break;
    case 'cancelled':
      subject = `Order Cancelled #${order._id}`;
      html = `<div style="${baseStyle}"><h2 style="color: #8B5A2B;">Order Cancelled</h2><p>Your order has been cancelled. If you did not request this, please contact support.</p><a href="${orderLink}" style="background: #8B5A2B; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">View Order</a></div>`;
      break;
    default:
      return;
  }

  if (subject && html) {
    try {
      await sendEmail({ email: userEmail, subject, html });
      console.log(`Status email sent for order ${order._id} → ${newStatus}`);
    } catch (err) {
      console.error(`Email send failed for order ${order._id}:`, err);
    }
  }
};

// ---------- Create new order (COD) – supports guests and logged users ----------
const addOrderItems = async (req, res) => {
  // Optional authentication – sets req.user if token provided
  await optionalAuth(req);

  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    notes,
    email,               // for guest orders
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  // Validate stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
    }
  }

  // Determine user or guest
  const userId = req.user ? req.user._id : null;
  const guestEmail = !req.user ? email : undefined;

  const order = new Order({
    user: userId,
    guestEmail,
    orderItems,
    shippingAddress,
    paymentMethod: 'cod',
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    notes,
    paymentStatus: 'pending',
    orderStatus: 'pending',
  });

  const createdOrder = await order.save();

  // Deduct stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear user's cart if logged in
  if (req.user) {
    await Cart.findOneAndDelete({ user: req.user._id });
  }

  // Send confirmation email (fire and forget)
  sendOrderStatusEmail(createdOrder, null, 'pending').catch(console.error);

  res.status(201).json(createdOrder);
};

// ---------- Get order by ID (authenticated) ----------
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user && order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(order);
};

// ---------- Get logged in user orders ----------
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

// ---------- Get all orders (admin) ----------
const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
};

// ---------- Update order status (admin) – with email ----------
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const { trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const oldStatus = order.orderStatus;
  if (oldStatus === status) return res.status(400).json({ message: 'Order status is already ' + status });

  order.orderStatus = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === 'delivered') order.deliveredAt = Date.now();
  await order.save();

  sendOrderStatusEmail(order, oldStatus, status, order.trackingNumber).catch(console.error);
  res.json({ message: 'Order status updated', order });
};

// ---------- Update payment status to paid (admin) ----------
const updatePaymentStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.paymentStatus = 'paid';
  order.paidAt = Date.now();
  await order.save();

  try {
    const userEmail = order.user ? order.user.email : order.guestEmail;
    if (userEmail) {
      await sendEmail({
        email: userEmail,
        subject: `Payment Received for Order #${order._id}`,
        html: `<p>Your payment for order #${order._id} has been successfully received. Thank you!</p>`,
      });
    }
  } catch (err) {
    console.error('Payment email failed:', err);
  }

  res.json({ message: 'Payment status updated to paid' });
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
};