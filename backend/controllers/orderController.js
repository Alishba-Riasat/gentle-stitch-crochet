const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const crypto = require('crypto');
const {
  generateReviewTokensForOrder,
  sendReviewInvitation,
} = require('./reviewController');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
const formatPaymentMethod = (method) => {
  if (method === 'cod') return 'Cash on Delivery';
  if (method === 'bank') return 'Bank Transfer';
  if (method === 'bank-transfer') return 'Bank Transfer';
  return method || 'Cash on Delivery';
};

const buildOrderLink = (order) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  if (order.user) {
    return `${frontendUrl}/order/${order._id}`;
  }
  return `${frontendUrl}/guest-order/${order._id}/${order.guestAccessToken}`;
};

const buildButton = (href, label, secondary = false) => `
  <a href="${href}" style="
    display:inline-block;
    background:${secondary ? '#ffffff' : '#8B5A2B'};
    color:${secondary ? '#8B5A2B' : '#ffffff'};
    border:1px solid #8B5A2B;
    padding:12px 18px;
    border-radius:8px;
    text-decoration:none;
    font-weight:700;
    margin:6px 4px;
  ">${label}</a>
`;

const buildOrderItemsHtml = (order) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:16px;">
    <thead>
      <tr>
        <th align="left" style="padding:8px 0;font-size:12px;color:#777;border-bottom:1px solid #ddd;">Item</th>
        <th align="right" style="padding:8px 0;font-size:12px;color:#777;border-bottom:1px solid #ddd;">Total</th>
      </tr>
    </thead>
    <tbody>
    ${order.orderItems.map(item => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;flex-shrink:0;margin-right:8px;" />` : ''}
          <div style="flex:1;min-width:120px;">
            <strong>${item.name}</strong><br/>
            <span style="color:#777;font-size:13px;">Qty: ${item.quantity} x Rs. ${Number(item.price).toFixed(2)}</span>
          </div>
        </td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid #eee;white-space:nowrap;">
          Rs. ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
        </td>
      </tr>
    `).join('')}
    </tbody>
  </table>
`;

const buildEmailLayout = ({ title, intro, order, buttons, note }) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @media only screen and (max-width: 600px) {
        .container { padding: 12px 8px !important; }
        .inner-content { padding: 20px 16px !important; }
        .header { padding: 20px 16px !important; text-align: center !important; }
        .order-item { flex-wrap: wrap !important; gap: 8px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f7f3ef;font-family:Arial,sans-serif;color:#2f2a25;">
    <div class="container" style="max-width:680px;margin:0 auto;padding:28px 14px;">
      <div style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eadfd5;">
        <div class="header" style="background:#8B5A2B;color:#ffffff;padding:26px 28px;text-align:center;">
          <h1 style="margin:0;font-size:24px;letter-spacing:0.5px;">Gentle Stitch Crochet</h1>
          <p style="margin:6px 0 0;font-size:14px;opacity:.9;">Handmade with care</p>
        </div>

        <div class="inner-content" style="padding:28px;">
          <h2 style="margin:0 0 10px;color:#8B5A2B;font-size:22px;">${title}</h2>
          <p style="margin:0 0 18px;color:#5f564f;line-height:1.6;">${intro}</p>

          <div style="background:#fbf8f5;border:1px solid #eadfd5;border-radius:12px;padding:16px;margin:18px 0;">
            <p style="margin:0 0 8px;"><strong>Order:</strong> #${order._id}</p>
            <p style="margin:0 0 8px;"><strong>Payment:</strong> ${formatPaymentMethod(order.paymentMethod)}</p>
            <p style="margin:0;"><strong>Total:</strong> Rs. ${Number(order.totalPrice).toFixed(2)}</p>
          </div>

          ${buildOrderItemsHtml(order)}

          <div style="background:#fbf8f5;border:1px solid #eadfd5;border-radius:12px;padding:16px;margin:18px 0;">
            <p style="margin:0;font-weight:700;">Shipping Information</p>
            <p style="margin:8px 0 0;color:#5f564f;line-height:1.5;">
              ${order.shippingAddress?.fullName || ''}<br/>
              ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}<br/>
              ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zipCode || ''}<br/>
              ${order.shippingAddress?.country || ''}<br/>
              Phone: ${order.shippingAddress?.phone || ''}
            </p>
          </div>

          <div style="text-align:center;margin-top:24px;">
            ${buttons}
          </div>

          ${note ? `<p style="font-size:13px;color:#7a7068;line-height:1.5;margin-top:20px;">${note}</p>` : ''}
        </div>
      </div>
    </div>
  </body>
  </html>
`;

const sendOrderStatusEmail = async (order, oldStatus, newStatus, reviewToken = null) => {
  const populatedOrder = await Order.findById(order._id)
    .select('+guestAccessToken')
    .populate('user', 'name email');

  const email = populatedOrder.user?.email || populatedOrder.guestEmail;
  if (!email) {
    console.error('No email available for order status notification', {
      orderId: populatedOrder._id,
      user: populatedOrder.user,
      guestEmail: populatedOrder.guestEmail,
      newStatus,
    });
    return;
  }

  const orderLink = buildOrderLink(populatedOrder);

  if (newStatus === 'shipped') return;

  // Build correct review link based on user type
  let reviewLink;
  if (populatedOrder.user) {
    reviewLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/${populatedOrder._id}/review`;
  } else {
    // guest – use the token link if available
    if (reviewToken) {
      reviewLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/guest-order-review/${reviewToken}`;
    } else {
      // fallback (should not happen)
      reviewLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/guest-order/${populatedOrder._id}/${populatedOrder.guestAccessToken}`;
    }
  }

  let subject;
  let html;

  if (newStatus === 'pending') {
    subject = `Order Confirmation #${populatedOrder._id}`;
    html = buildEmailLayout({
      title: 'Thank you for your order',
      intro: 'Your order has been received and is currently pending. We will notify you when it is accepted and being prepared.',
      order: populatedOrder,
      buttons: buildButton(orderLink, 'View Order Details'),
    });
  }

  if (newStatus === 'processing') {
    subject = `Your order has been accepted #${populatedOrder._id}`;
    html = buildEmailLayout({
      title: 'Your order is being prepared',
      intro: 'Good news! Your order has been accepted and our team is preparing your handmade items.',
      order: populatedOrder,
      buttons: buildButton(orderLink, 'View Order Details'),
    });
  }

  if (newStatus === 'delivered') {
    subject = `Order Delivered #${populatedOrder._id}`;
    html = buildEmailLayout({
      title: 'Your order has been delivered',
      intro: 'We hope you love your crochet pieces. You can view your order or write a verified purchase review.',
      order: populatedOrder,
      buttons: `
        ${buildButton(orderLink, 'View Order Details')}
        ${buildButton(reviewLink, 'Write a Review', true)}
      `,
      note: 'Guest customers will receive secure product review links for each item in the order.',
    });
  }

  if (newStatus === 'cancelled') {
    subject = `Order Cancelled #${populatedOrder._id}`;
    html = buildEmailLayout({
      title: 'Your order was cancelled',
      intro: 'This order has been cancelled. If you have questions, please contact our support team.',
      order: populatedOrder,
      buttons: buildButton(orderLink, 'View Order Details'),
    });
  }

  if (!subject || !html) return;
  await sendEmail({ email, subject, html });
};

// ---------- Create new order ----------
const addOrderItems = async (req, res) => {
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
    email,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  const enrichedOrderItems = [];
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
    }
    const image = product.images && product.images.length > 0 ? product.images[0].url : '';
    enrichedOrderItems.push({ ...item, image });
  }

  const userId = req.user ? req.user._id : null;
  const guestEmail = !req.user ? email : undefined;
  const guestAccessToken = !req.user ? crypto.randomBytes(32).toString('hex') : undefined;

  const order = new Order({
    user: userId,
    guestEmail,
    orderItems: enrichedOrderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'cod',
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    notes,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    guestAccessToken,
  });

  const createdOrder = await order.save();

  for (const item of enrichedOrderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  if (req.user) {
    await Cart.findOneAndDelete({ user: req.user._id });
  }

  console.log('Order created — sending pending email', { orderId: createdOrder._id, user: createdOrder.user, guestEmail: createdOrder.guestEmail });
  await sendOrderStatusEmail(createdOrder, null, 'pending').catch((err) => {
    console.error('Failed to send pending order email:', err);
  });

  res.status(201).json(createdOrder);
};

const getGuestOrderByToken = async (req, res) => {
  const order = await Order.findById(req.params.id).select('+guestAccessToken');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (!order.guestAccessToken || order.guestAccessToken !== req.params.token) {
    return res.status(403).json({ message: 'Invalid or expired order link' });
  }
  res.json(order);
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user && order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(order);
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

const getOrders = async (req, res) => {
  let keyword = req.query.keyword ? req.query.keyword.trim() : '';
  const orderStatus = req.query.orderStatus ? req.query.orderStatus.trim() : '';
  const paymentStatus = req.query.paymentStatus ? req.query.paymentStatus.trim() : '';
  keyword = keyword.replace(/^#+/, '');

  const baseMatch = {};
  if (orderStatus) baseMatch.orderStatus = orderStatus;
  if (paymentStatus) baseMatch.paymentStatus = paymentStatus;

  if (!keyword) {
    const orders = await Order.find(baseMatch).populate('user', 'name email').sort({ createdAt: -1 });
    return res.json(orders);
  }

  const escapedKeyword = escapeRegex(keyword);
  const regex = new RegExp(escapedKeyword, 'i');
  const searchConditions = [
    { guestEmail: regex },
    { 'shippingAddress.fullName': regex },
    { 'shippingAddress.phone': regex },
    { orderStatus: regex },
    { paymentStatus: regex },
    { trackingNumber: regex },
  ];

  if (mongoose.Types.ObjectId.isValid(keyword)) {
    searchConditions.unshift({ _id: mongoose.Types.ObjectId(keyword) });
  }

  const orders = await Order.aggregate([
    {
      $addFields: {
        orderIdString: { $toString: '$_id' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $and: [
          baseMatch,
          {
            $or: [
              { orderIdString: regex },
              ...searchConditions,
              { 'user.name': regex },
              { 'user.email': regex },
            ],
          },
        ],
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  res.json(orders);
};

const updateOrderStatus = async (req, res) => {
  let { status, trackingNumber } = req.body;
  if (status === 'processed') status = 'processing';

  const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  const order = await Order.findById(req.params.id)
    .select('+guestAccessToken')
    .populate('user', 'email');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const oldStatus = order.orderStatus;
  if (oldStatus === status) {
    return res.status(400).json({ message: 'Order status is already ' + status });
  }

  order.orderStatus = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === 'delivered') order.deliveredAt = Date.now();

  await order.save();

  // Generate review token if delivered (for guests)
  let reviewToken = null;
  if (status === 'delivered') {
    try {
      const tokens = await generateReviewTokensForOrder(order);
      if (tokens.length > 0) {
        reviewToken = tokens[0].token;
        // For guests, send the invitation email
        if (order.guestEmail) {
          await sendReviewInvitation(order, reviewToken);
        }
      }
    } catch (err) {
      console.error('Failed to generate review tokens:', err);
    }
  }

  // Send status email with the review token (if any)
  sendOrderStatusEmail(order, oldStatus, status, reviewToken).catch(console.error);

  res.json({ message: 'Order status updated', order });
};

// ---------- Get order for review (logged-in user) ----------
const getOrderForReview = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate({
      path: 'orderItems.product',
      select: 'name images price',
    });

  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (
    order.user &&
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (order.orderStatus !== 'delivered') {
    return res.status(400).json({ message: 'You can only review delivered orders' });
  }

  const itemsWithReviewStatus = await Promise.all(
    order.orderItems.map(async (item) => {
      const product = await Product.findById(item.product._id);
      if (!product) return { ...item.toObject(), alreadyReviewed: false };

      const existingReview = product.reviews.find(
        (r) =>
          r.user &&
          r.user.toString() === req.user._id.toString() &&
          r.order &&
          r.order.toString() === order._id.toString()
      );

      return {
        ...item.toObject(),
        alreadyReviewed: !!existingReview,
        reviewId: existingReview?._id || null,
        productImage: product.images?.[0]?.url || '',
      };
    })
  );

  res.json({
    order: {
      _id: order._id,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
    },
    items: itemsWithReviewStatus,
  });
};

// ---------- Get order for review (guest via token) ----------
const getGuestOrderForReview = async (req, res) => {
  const { token } = req.params;
  const tokenDoc = await ReviewToken.findOne({ token, isUsed: false });
  if (!tokenDoc) {
    return res.status(400).json({ message: 'Invalid or expired review link' });
  }

  const order = await Order.findById(tokenDoc.order)
    .populate({
      path: 'orderItems.product',
      select: 'name images price',
    });
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  if (order.orderStatus !== 'delivered') {
    return res.status(400).json({ message: 'This order is not yet delivered' });
  }

  const itemsWithStatus = await Promise.all(
    order.orderItems.map(async (item) => {
      const product = await Product.findById(item.product._id);
      if (!product) return { ...item.toObject(), alreadyReviewed: false };

      const existing = product.reviews.find(
        (r) =>
          r.email === tokenDoc.email &&
          r.order &&
          r.order.toString() === order._id.toString()
      );
      return {
        ...item.toObject(),
        alreadyReviewed: !!existing,
        productImage: product.images?.[0]?.url || '',
      };
    })
  );

  res.json({
    orderId: order._id,
    token: tokenDoc.token,
    email: tokenDoc.email,
    items: itemsWithStatus,
  });
};

// ---------- Update payment status ----------
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

const deleteOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  await order.deleteOne();
  res.json({ message: 'Order deleted' });
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getGuestOrderByToken,
  getOrderForReview,
  getGuestOrderForReview, 
};