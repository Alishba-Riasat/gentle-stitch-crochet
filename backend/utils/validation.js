const { body, validationResult } = require('express-validator');

// ========== AUTH VALIDATIONS ==========
const validateRegister = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

const validateForgotPassword = [
  body('email').isEmail().withMessage('Valid email required'),
];

const validateResetPassword = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// ========== PRODUCT VALIDATIONS ==========
const validateProduct = [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Name must be 3–100 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be at least 20 characters'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non‑negative integer'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
];

const validateReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 5 }).withMessage('Comment must be at least 5 characters'),
];

// ========== SINGLE ERROR HANDLER ==========
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};


const validateOrder = [
  body('shippingAddress.street').notEmpty().withMessage('Street address required'),
  body('shippingAddress.city').notEmpty().withMessage('City required'),
  body('shippingAddress.state').optional(),
  body('shippingAddress.zipCode').optional(),
  body('shippingAddress.postalCode').optional(),
  body('shippingAddress.country').notEmpty().withMessage('Country required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone number required'),
];


// ========== SINGLE EXPORT ==========
module.exports = {
  // Auth
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  // Product
  validateProduct,
  validateReview,
  validateOrder,
  // Common
  handleValidationErrors,
};