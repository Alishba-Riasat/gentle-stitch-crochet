const mongoose = require('mongoose');

const reviewTokenSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null, // null indicates this token is for the entire order
    },
    email: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '30d', 
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true, 
  }
);

module.exports = mongoose.model('ReviewToken', reviewTokenSchema);