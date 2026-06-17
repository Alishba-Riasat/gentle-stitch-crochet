import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CenteredNotification from '../Common/CenteredNotification';

const AdminProductForm = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    category: '',
    stock: '',
    sku: '',
    isNew: false,
    isBestSeller: false,
    featured: false,
    images: [],
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      category: '',
      stock: '',
      sku: '',
      isNew: false,
      isBestSeller: false,
      featured: false,
      images: [],
    });

    setValidationErrors({});
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        setNotification({ message: 'Failed to load categories', type: 'error' });
      }
    };

    fetchCategories();

    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        comparePrice: product.comparePrice || '',
        category: product.category?._id || product.category || '',
        stock: product.stock || '',
        sku: product.sku || '',
        isNew: product.isNew || false,
        isBestSeller: product.isBestSeller || false,
        featured: product.featured || false,
        images: product.images || [],
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    setUploading(true);

    try {
      const uploadedImages = [];

      for (const file of files) {
        const formDataImg = new FormData();
        formDataImg.append('image', file);

        const res = await api.post('/upload', formDataImg);

        uploadedImages.push({
          url: res.data.url,
          public_id: res.data.public_id,
          isMain: formData.images.length === 0 && uploadedImages.length === 0,
        });
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));

      setValidationErrors(prev => ({
        ...prev,
        images: '',
      }));
    } catch (err) {
      console.error('IMAGE UPLOAD ERROR:', err.response?.data || err);

      setValidationErrors(prev => ({
        ...prev,
        images:
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Image upload failed',
      }));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.price) errors.price = 'Price is required';
    if (Number(formData.price) <= 0) errors.price = 'Price must be greater than 0';
    if (!formData.category) errors.category = 'Please select a category';
    if (Number(formData.stock) < 0) errors.stock = 'Stock cannot be negative';
    if (formData.images.length === 0) errors.images = 'At least one image required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploading) {
      setNotification({
        message: 'Please wait until image upload is complete',
        type: 'error',
      });
      return;
    }

    const isValid = validateForm();

    if (!isValid) {
      setNotification({
        message: 'Please fix the highlighted fields',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    setNotification(null);

    try {
      if (product) {
        await api.put(`/products/${product._id}`, formData);

        setNotification({
          message: 'Product updated successfully',
          type: 'success',
        });

        if (onSuccess) onSuccess();

        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        await api.post('/products', formData);

        setNotification({
          message: 'Product created successfully',
          type: 'success',
        });

        resetForm();

        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error('Product save failed:', err.response?.data || err.message);

      setNotification({
        message:
          err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          err.message ||
          'Product creation failed',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full px-4 py-2 rounded-lg border ${
      hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'
    } focus:outline-none focus:ring-2 transition`;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{product ? 'Edit Product' : 'Add Product'}</h2>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              X
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass(!!validationErrors.name)}
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className={inputClass(false)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Price (Rs.) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={inputClass(!!validationErrors.price)}
                />
                {validationErrors.price && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Compare Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="comparePrice"
                  value={formData.comparePrice}
                  onChange={handleChange}
                  className={inputClass(false)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={inputClass(!!validationErrors.category)}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {validationErrors.category && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className={inputClass(!!validationErrors.stock)}
                />
                {validationErrors.stock && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.stock}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">SKU optional</label>
              <input
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className={inputClass(false)}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} />
                New Arrival
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} />
                Best Seller
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
                Featured Product
              </label>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Images *</label>

              <div className="flex gap-2 flex-wrap mb-2">
                {formData.images.map((img, idx) => (
                  <div key={`${img.public_id}-${idx}`} className="relative w-20 h-20">
                    <img
                      src={img.url}
                      alt="Product"
                      className="w-full h-full object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>

              <label className="btn-primary cursor-pointer inline-block active:scale-95 transition-all duration-200">
                {uploading ? 'Uploading...' : 'Upload Images'}
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>

              {validationErrors.images && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.images}</p>
              )}

              <p className="text-xs text-gray-500 mt-1">
                Upload at least one image: JPG, PNG, WEBP
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition active:scale-95"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || uploading}
                className="btn-primary px-6 py-2 active:scale-95 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Saving...' : uploading ? 'Uploading...' : product ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {notification && (
        <CenteredNotification
          {...notification}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default AdminProductForm;