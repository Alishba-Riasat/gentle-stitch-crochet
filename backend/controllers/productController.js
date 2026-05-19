const Product = require('../models/Product');
const Category = require('../models/Category');

// ========== PUBLIC ==========

// @desc    Get all products with filtering, search, sorting, pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;
    const sortBy = req.query.sort || '-createdAt'; // default newest first
    const keyword = req.query.keyword ? req.query.keyword.trim() : '';
    const categorySlug = req.query.category || '';
    const minPrice = Number(req.query.minPrice) || 0;
    const maxPrice = Number(req.query.maxPrice) || Infinity;
    const featured = req.query.featured === 'true' ? true : false;
    
    // Build query
    let query = { isActive: true };
    if (req.query.isNew === 'true') query.isNew = true;
    if (req.query.isBestSeller === 'true') query.isBestSeller = true;
    if (req.query.featured === 'true') query.featured = true;
    
    // Search by product name (partial, case‑insensitive)
    if (keyword) {
      if (keyword.length > 50) return res.status(400).json({ message: 'Search query too long' });
      query.name = { $regex: keyword, $options: 'i' };
    }
    
    // Filter by category (slug)
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug, isActive: true });
      if (!category) {
        return res.status(200).json({ products: [], page, pages: 0, total: 0 });
      }
      query.category = category._id;
    }
    
    // Price range
    query.price = { $gte: minPrice, $lte: maxPrice };
    if (minPrice > maxPrice) {
      return res.status(400).json({ message: 'Min price cannot be > max price' });
    }
    
    // Featured filter
    if (featured) query.featured = true;
    
    // Count total matching documents
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortBy)
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.json({
      products,
      page,
      pages: Math.ceil(total / pageSize),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .lean();
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Product not found' });
    res.status(500).json({ message: error.message });
  }
};

// ========== REVIEWS ==========

// @desc    Add a review to a product (logged‑in users only)
// @route   POST /api/products/:id/reviews
// @access  Private
const addProductReview = async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  // Check if user already reviewed this product
  const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) {
    return res.status(400).json({ message: 'You have already reviewed this product' });
  }
  
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  
  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.numReviews;
  
  await product.save();
  res.status(201).json({ message: 'Review added successfully', reviews: product.reviews, rating: product.rating, numReviews: product.numReviews });
};

// ========== ADMIN ==========

// @desc    Create a product (admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { name, description, price, category, stock, comparePrice, sku, featured, tags, images } = req.body;
  
  // Validate category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return res.status(400).json({ message: 'Invalid category' });
  }
  
  const product = new Product({
    name,
    description,
    price,
    category,
    stock,
    comparePrice: comparePrice || 0,
    sku: sku || `SKU-${Date.now()}`,
    featured: featured || false,
    tags: tags || [],
    images: images || [],
  });
  
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

// @desc    Update a product (admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const { name, description, price, category, stock, comparePrice, sku, featured, tags, images, isActive } = req.body;
  
  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.category = category || product.category;
  product.stock = stock !== undefined ? stock : product.stock;
  product.comparePrice = comparePrice !== undefined ? comparePrice : product.comparePrice;
  product.sku = sku || product.sku;
  product.featured = featured !== undefined ? featured : product.featured;
  product.tags = tags || product.tags;
  if (images) product.images = images;
  product.isActive = isActive !== undefined ? isActive : product.isActive;
  
  const updatedProduct = await product.save();
  res.json(updatedProduct);
};

// @desc    Delete a product (admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  await product.deleteOne();
  res.json({ message: 'Product removed' });
};



// @desc    Get top-rated reviews from all products
// @route   GET /api/products/top-reviews
// @access  Public
// @desc    Get all good reviews (rating >= 4.5) – no limit
// @route   GET /api/products/top-reviews
// @access  Public
const getTopReviews = async (req, res) => {
  try {
    const products = await Product.find({ 'reviews.0': { $exists: true } }, 'reviews');
    let allReviews = [];
    products.forEach(product => allReviews.push(...product.reviews));
    // Filter rating >= 4.5 (good reviews)
    const goodReviews = allReviews.filter(r => r.rating >= 4.0);
    goodReviews.sort((a, b) => {
      if (a.rating !== b.rating) return b.rating - a.rating;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    const topReviews = goodReviews.map(r => ({
      id: r._id,
      name: r.name,
      rating: r.rating,
      text: r.comment,
      createdAt: r.createdAt,
    }));
    res.json(topReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  getProducts,
  getProductById,
  addProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopReviews,   
};

