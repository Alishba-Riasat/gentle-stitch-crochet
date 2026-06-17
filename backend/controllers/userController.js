const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    if (req.body.address) {
      user.address = { ...user.address, ...req.body.address };
    }
    // Note: password is NOT updated here – use change-password endpoint
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }
  if (await user.matchPassword(currentPassword)) {
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } else {
     return res.status(400).json({ message: 'Current password is incorrect' });
  }
};

// @desc    Add to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const addToWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.wishlist.includes(req.params.productId)) {
    return res.status(400).json({ message: 'Product already in wishlist' });
  }
  user.wishlist.push(req.params.productId);
  await user.save();
  res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
};

// @desc    Remove from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
  await user.save();
  res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
};



// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) res.json(user);
  else res.status(404).json({ message: 'User not found' });
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const search = req.query.search?.trim();

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { role: { $regex: search, $options: 'i' } },
            { 'address.street': { $regex: search, $options: 'i' } },
            { 'address.city': { $regex: search, $options: 'i' } },
            { 'address.state': { $regex: search, $options: 'i' } },
            { 'address.country': { $regex: search, $options: 'i' } },
            { 'address.postalCode': { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  // Prevent deleting self
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }
  await user.deleteOne();
  res.json({ message: 'User deleted' });
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  // Prevent removing last admin
  if (user.role === 'admin' && role !== 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 1) {
      return res.status(400).json({ message: 'Cannot remove the only admin' });
    }
  }
  user.role = role;
  await user.save();
  res.json({ message: 'Role updated', role: user.role });
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserById,
  deleteUser,
  updateUserRole,
  addToWishlist,
  removeFromWishlist,
  getUsers,
};