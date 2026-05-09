const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
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
router.post('/login', validateLogin, handleValidationErrors, loginUser);
router.post('/logout', protect, logoutUser);
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);
router.put('/reset-password/:token', validateResetPassword, handleValidationErrors, resetPassword);

module.exports = router;