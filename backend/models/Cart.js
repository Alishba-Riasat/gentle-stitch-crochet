const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // snapshot price at time of adding
  name: { type: String, required: true },
  image: { type: String, required: true },
  stock: { type: Number, required: true }, // snapshot stock at time of adding
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
  totalQuantity: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
}, { timestamps: true });

// Helper: recalculate totals before save
cartSchema.pre('save', function(next) {
  let totalQuantity = 0;
  let totalAmount = 0;
  this.items.forEach(item => {
    totalQuantity += item.quantity;
    totalAmount += item.price * item.quantity;
  });
  this.totalQuantity = totalQuantity;
  this.totalAmount = totalAmount;
  next();
});

module.exports = mongoose.model('Cart', cartSchema);