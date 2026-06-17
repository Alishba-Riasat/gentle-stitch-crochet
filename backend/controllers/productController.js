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
    const sortBy = req.query.sort || '-createdAt';
    const keyword = req.query.keyword ? req.query.keyword.trim() : '';
    const categorySlug = req.query.category || '';
    const minPrice = Number(req.query.minPrice) || 0;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : Infinity;

    let query = { isActive: true };

    if (req.query.isNew === 'true') query.isNew = true;
    if (req.query.isBestSeller === 'true') query.isBestSeller = true;
    if (req.query.featured === 'true') query.featured = true;

    if (minPrice > maxPrice) {
      return res.status(400).json({ message: 'Min price cannot be > max price' });
    }

    query.price = { $gte: minPrice, $lte: maxPrice };

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug, isActive: true });

      if (!category) {
        return res.status(200).json({
          products: [],
          page,
          pages: 0,
          total: 0,
        });
      }

      query.category = category._id;
    }

    if (keyword) {
      if (keyword.length > 50) {
        return res.status(400).json({ message: 'Search query too long' });
      }

      const regex = new RegExp(keyword, 'i');
      const normalizedKeyword = keyword.toLowerCase();
      const numericKeyword = Number(keyword);

      const matchesAnyKeyword = (...words) =>
        words.some(word => word.includes(normalizedKeyword));

      const matchingCategories = await Category.find({
        $or: [
          { name: regex },
          { slug: regex },
        ],
      }).select('_id');

      const searchConditions = [
        { name: regex },
        { description: regex },
        { sku: regex },
        { tags: regex },
      ];

      if (matchingCategories.length > 0) {
        searchConditions.push({
          category: {
            $in: matchingCategories.map(category => category._id),
          },
        });
      }

      if (!Number.isNaN(numericKeyword)) {
        searchConditions.push(
          { price: numericKeyword },
          { comparePrice: numericKeyword },
          { stock: numericKeyword }
        );
      }

      if (matchesAnyKeyword('featured', 'feature', 'yes')) {
        searchConditions.push({ featured: true });
      }

      if (matchesAnyKeyword('not featured', 'unfeatured', 'no')) {
        searchConditions.push({ featured: false });
      }

      if (
        matchesAnyKeyword(
          'best seller',
          'best sellers',
          'bestseller',
          'best-selling',
          'best selling'
        )
      ) {
        searchConditions.push({ isBestSeller: true });
      }

      if (matchesAnyKeyword('new', 'new product', 'new arrival')) {
        searchConditions.push({ isNew: true });
      }

      if (matchesAnyKeyword('out of stock', 'outofstock')) {
        searchConditions.push({ stock: 0 });
      }

      if (matchesAnyKeyword('low stock', 'lowstock')) {
        searchConditions.push({ stock: { $gt: 0, $lt: 10 } });
      }

      query.$or = searchConditions;
    }

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



// ========== ADMIN ==========

// @desc    Create a product (admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      comparePrice,
      sku,
      featured,
      isNew,
      isBestSeller,
      tags,
      images,
    } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'Upload at least one image' });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock) || 0,
      comparePrice: Number(comparePrice) || 0,
      sku: sku || `SKU-${Date.now()}`,
      featured: featured || false,
      isNew: isNew || false,
      isBestSeller: isBestSeller || false,
      tags: tags || [],
      images,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Update a product (admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      name,
      description,
      price,
      category,
      stock,
      comparePrice,
      sku,
      featured,
      isNew,
      isBestSeller,
      tags,
      images,
      isActive,
    } = req.body;

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    product.name = name !== undefined ? name : product.name;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.category = category !== undefined ? category : product.category;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.comparePrice = comparePrice !== undefined ? Number(comparePrice) : product.comparePrice;
    product.sku = sku !== undefined ? sku : product.sku;
    product.featured = featured !== undefined ? featured : product.featured;
    product.isNew = isNew !== undefined ? isNew : product.isNew;
    product.isBestSeller = isBestSeller !== undefined ? isBestSeller : product.isBestSeller;
    product.tags = tags !== undefined ? tags : product.tags;

    if (images !== undefined) {
      if (!Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ message: 'Upload at least one image' });
      }

      product.images = images;
    }

    product.isActive = isActive !== undefined ? isActive : product.isActive;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
  
  createProduct,
  updateProduct,
  deleteProduct,
  getTopReviews,   
};

