const Setting = require('../models/Setting');

// @desc    Get store settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update store settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }
    const { storeName, storeLogo, storeEmail, storePhone, shippingFee, freeShippingThreshold, codEnabled, bankTransferEnabled, socialLinks } = req.body;
    if (storeName !== undefined) settings.storeName = storeName;
    if (storeLogo !== undefined) settings.storeLogo = storeLogo;
    if (storeEmail !== undefined) settings.storeEmail = storeEmail;
    if (storePhone !== undefined) settings.storePhone = storePhone;
    if (shippingFee !== undefined) settings.shippingFee = shippingFee;
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = freeShippingThreshold;
    if (codEnabled !== undefined) settings.codEnabled = codEnabled;
    if (bankTransferEnabled !== undefined) settings.bankTransferEnabled = bankTransferEnabled;
    if (socialLinks) {
      settings.socialLinks = { ...settings.socialLinks, ...socialLinks };
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Add this function
const getPublicSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) settings = await Setting.create({});
    // Return only public fields (omit any internal flags if needed)
    res.json({
      storeName: settings.storeName,
      storeLogo: settings.storeLogo,
      storeEmail: settings.storeEmail,
      storePhone: settings.storePhone,
      shippingFee: settings.shippingFee,
      freeShippingThreshold: settings.freeShippingThreshold,
      codEnabled: settings.codEnabled,
      bankTransferEnabled: settings.bankTransferEnabled,
      socialLinks: settings.socialLinks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings, getPublicSettings };
