const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  storeName: { type: String, default: 'Gentle Stitch Crochet' },
  storeLogo: { type: String, default: '' },
  storeEmail: { type: String, default: 'support@gentlestitch.com' },
  storePhone: { type: String, default: '+92 336 7072502' },
  shippingFee: { type: Number, default: 199 },
  freeShippingThreshold: { type: Number, default: 5000 },
  codEnabled: { type: Boolean, default: true },
  bankTransferEnabled: { type: Boolean, default: true },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);