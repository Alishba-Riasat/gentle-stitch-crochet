const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No image file provided. Field name must be image',
      });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'gentle-stitch/products',
          resource_type: 'image',
          timeout: 120000,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    res.status(201).json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Image upload failed:', error);

    const statusCode = error.http_code === 401 ? 502 : error.http_code || 500;

    res.status(statusCode).json({
      message: 'Image upload failed',
      error: error.message,
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({
        message: 'public_id is required',
      });
    }

    await cloudinary.uploader.destroy(public_id);

    res.json({
      message: 'Image deleted',
    });
  } catch (error) {
    console.error('Image delete failed:', error);

    res.status(500).json({
      message: 'Delete failed',
      error: error.message,
    });
  }
};

module.exports = { uploadImage, deleteImage };