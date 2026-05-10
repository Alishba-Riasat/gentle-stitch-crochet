const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // already hashed
  verificationToken: { type: String, required: true, unique: true },
  verificationExpires: { type: Date, required: true },
});

// TTL index: automatically delete document when verificationExpires is past
pendingUserSchema.index({ verificationExpires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PendingUser', pendingUserSchema);