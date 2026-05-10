







const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const generateToken = require('../utils/generateToken');

// @desc    Register – creates pending user, sends verification email (with button)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Check if already verified
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered. Please login.' });
  }

  // 2. Delete any expired pending user for this email (so user can re-register)
  await PendingUser.deleteMany({ email, verificationExpires: { $lt: Date.now() } });

  // 3. Check if a non‑expired pending user already exists
  const existingPending = await PendingUser.findOne({ email, verificationExpires: { $gt: Date.now() } });
  if (existingPending) {
    return res.status(400).json({ message: 'Verification email already sent. Check your inbox.' });
  }

  // 4. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 5. Create new pending user (valid for 1 minute)
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = Date.now() + 10 * 60 * 1000; // 1 minute

  await PendingUser.create({
    name,
    email,
    password: hashedPassword,
    verificationToken,
    verificationExpires,
  });

  // 6. Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #8B5A2B;">Welcome to Gentle Stitch Crochet!</h2>
      <p>Thank you for registering. Please verify your email address to activate your account.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #8B5A2B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Verify Email Address
        </a>
      </div>
      <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size: 12px; color: #666; word-break: break-all;">${verificationUrl}</p>
      <p>This link expires in 1 minute.</p>
    </div>
  `;

  try {
    await sendEmail({ email, subject: 'Verify your email', html });
    res.status(201).json({ message: 'Verification email sent. Please check your inbox to activate your account.' });
  } catch (err) {
    await PendingUser.deleteOne({ email });
    res.status(500).json({ message: 'Failed to send verification email. Try again.' });
  }
};

// @desc    Verify email – moves user from Pending to User collection
// @route   GET /api/auth/verify-email?token=...
// @access  Public
// @desc    Verify email – moves user from Pending to User collection
// @route   GET /api/auth/verify-email?token=...
// @access  Public
const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    // Find pending user with valid token
    const pending = await PendingUser.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    });

    if (!pending) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    // Check if a user with this email already exists (in case link was clicked twice)
    const existingUser = await User.findOne({ email: pending.email });
    if (existingUser) {
      // Already verified – just delete the pending record and return success
      await pending.deleteOne();
      return res.status(200).json({ message: 'Email already verified. You can now login.' });
    }

    // Create the actual user
    const newUser = new User({
      name: pending.name,
      email: pending.email,
      password: pending.password, // already hashed (will not be re-hashed due to pre-save check)
      role: 'user',
    });

    await newUser.save(); // This will trigger pre-save but skip re-hashing

    // Only after successful user creation, delete the pending document
    await pending.deleteOne();

    res.status(200).json({ message: 'Email verified successfully! You can now login.' });
  } catch (error) {
    console.error('Verification error:', error);
    // Do NOT delete the pending user here – it may still be valid for retry
    // Send a generic error
    res.status(500).json({ message: 'Verification failed due to server error. Please try again later.' });
  }
};

// @desc    Login – only for verified users (in User collection)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Please register to login' });
  }

  if (await user.matchPassword(password)) {
    const token = generateToken(res, user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Forgot password – sends reset email with button
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'No account found with that email. Please register first.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes for testing
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = resetExpire;
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #8B5A2B;">Password Reset Request</h2>
      <p>You requested to reset your password for your Gentle Stitch Crochet account.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #8B5A2B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size: 12px; color: #666; word-break: break-all;">${resetUrl}</p>
      <p>This link expires in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  try {
    await sendEmail({ email: user.email, subject: 'Password Reset', html });
    res.json({ message: 'Reset link sent to your email.' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).json({ message: 'Email could not be sent.' });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() },   // use new Date() for consistency
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: 'Password updated successfully.' });
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out' });
};

// @desc    Resend verification email (optional)
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
  const { email } = req.body;
  const pending = await PendingUser.findOne({ email });
  if (!pending) {
    return res.status(404).json({ message: 'No pending registration found. Please register again.' });
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${pending.verificationToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #8B5A2B;">Verify Your Email</h2>
      <p>We received a request to resend your verification link.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #8B5A2B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Verify Email Address
        </a>
      </div>
      <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size: 12px; color: #666; word-break: break-all;">${verificationUrl}</p>
      <p>This link expires in 24 hours.</p>
    </div>
  `;

  try {
    await sendEmail({ email, subject: 'Verify your email', html });
    res.json({ message: 'Verification email resent.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not resend email.' });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
  resendVerification,
};
