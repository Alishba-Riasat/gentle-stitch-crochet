const express = require('express');
const {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
  resendVerification,
} = require('../controllers/authController');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors,
} = require('../utils/validation');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', validateRegister, handleValidationErrors, registerUser);
router.get('/verify-email', verifyEmail);
router.post('/login', validateLogin, handleValidationErrors, loginUser);
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);
router.put('/reset-password/:token', validateResetPassword, handleValidationErrors, resetPassword);
router.post('/logout', protect, logoutUser);
router.post('/resend-verification', resendVerification);

module.exports = router;