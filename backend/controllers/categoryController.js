const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true });
  res.json(categories);
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json(category);
};

// @desc    Create category (admin)
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  const { name, description, image, parentCategory } = req.body;
  const category = new Category({
    name,
    description,
    image,
    parentCategory,
    level: parentCategory ? 1 : 0,
  });
  const created = await category.save();
  res.status(201).json(created);
};

// @desc    Update category (admin)
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  category.name = req.body.name || category.name;
  category.description = req.body.description || category.description;
  category.image = req.body.image || category.image;
  category.isActive = req.body.isActive !== undefined ? req.body.isActive : category.isActive;
  await category.save();
  res.json(category);
};

// @desc    Delete category (admin)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  // Check if any product uses this category
  const productsCount = await Product.countDocuments({ category: req.params.id });
  if (productsCount > 0) {
    return res.status(400).json({ message: 'Cannot delete category with associated products' });
  }
  await category.deleteOne();
  res.json({ message: 'Category removed' });
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};