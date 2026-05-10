const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: String,
  phone: String,
  address: {
    street: String, city: String, state: String, zipCode: String, country: String
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

// Hash password only if it's a plain text (not already hashed)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  // Bcrypt hashes are always 60 characters long and start with '$2b$'
  if (this.password && this.password.length === 60 && this.password.startsWith('$2b$')) {
    return next(); // already hashed, skip
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);