const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get logged user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price images stock');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart (or update quantity)
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: `Only ${product.stock} in stock` });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (newQty > product.stock) return res.status(400).json({ message: `Only ${product.stock} in stock` });
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        name: product.name,
        image: product.images[0]?.url || '',
        stock: product.stock,
      });
    }
    await cart.save();
    // Re-populate product details before sending response
    await cart.populate('items.product', 'name price images stock');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not in cart' });
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (quantity > product.stock) return res.status(400).json({ message: `Only ${product.stock} in stock` });
      cart.items[itemIndex].quantity = quantity;
    }
    await cart.save();
    await cart.populate('items.product', 'name price images stock');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    await cart.populate('items.product', 'name price images stock');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync guest cart after login (merge)
// @route   POST /api/cart/merge
// @access  Private
const mergeGuestCart = async (req, res) => {
  const { guestCart } = req.body; // guestCart = { items: [...] }
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    // Merge logic: for each guest item, either add quantity or create new
    for (const guestItem of guestCart.items) {
      const existing = cart.items.find(item => item.product.toString() === guestItem.productId);
      if (existing) {
        const newQty = existing.quantity + guestItem.quantity;
        const product = await Product.findById(guestItem.productId);
        if (newQty > product.stock) {
          // Cap at stock? Or skip? We'll cap.
          existing.quantity = product.stock;
        } else {
          existing.quantity = newQty;
        }
      } else {
        const product = await Product.findById(guestItem.productId);
        if (product) {
          cart.items.push({
            product: guestItem.productId,
            quantity: guestItem.quantity,
            price: product.price,
            name: product.name,
            image: product.images[0]?.url || '',
            stock: product.stock,
          });
        }
      }
    }
    await cart.save();
    await cart.populate('items.product', 'name price images stock');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeGuestCart,
};