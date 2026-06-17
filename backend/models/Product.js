const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '' },
  comment: { type: String, required: true, minlength: 5 },
 order: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Order',
},
media: [
  {
    url: { type: String, required: true },
    publicId: { type: String },
    resourceType: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
  },
],
isHidden: {
  type: Boolean,
  default: false,
},
verifiedPurchase: {
  type: Boolean,
  default: false,
},
isGuest: {
  type: Boolean,
  default: false,
},
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [2000, 'Description too long'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0.01, 'Price must be greater than 0'],
  },
  comparePrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  images: [{
    url: { type: String, required: true },
    public_id: { type: String, required: true },
    isMain: { type: Boolean, default: false },
  }],
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  sku: { type: String, unique: true, sparse: true },
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  tags: [String],
}, { timestamps: true });

// Auto‑generate slug from name
/*productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  }
  next();
});
*/
productSchema.pre('validate', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  next();
});
// Prevent duplicate reviews – ensure a user can review a product only once

productSchema.index({ 'reviews.user': 1, _id: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);