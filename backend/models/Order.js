const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, required: true },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  guestAccessToken: {
  type: String,
  select: false,
},
  guestEmail: {
    type: String,
    lowercase: true,
    trim: true,
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'Pakistan' },
    phone: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'bank_transfer'],
    default: 'cod',
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
  },
  itemsPrice: { type: Number, required: true, default: 0.0 },
  taxPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  discountPrice: { type: Number, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  paidAt: Date,
  deliveredAt: Date,
  couponCode: String,
  trackingNumber: String,
  notes: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);