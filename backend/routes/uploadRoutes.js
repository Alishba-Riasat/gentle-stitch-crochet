const express = require('express');
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', upload.single('image'), uploadImage);
router.delete('/', protect, admin, deleteImage);

module.exports = router;