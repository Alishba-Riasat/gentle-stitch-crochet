import React, { useState } from 'react';
import api from '../../services/api';
import CenteredNotification from '../Common/CenteredNotification';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AdminCategoryForm = ({ category, onClose, onSuccess }) => {
  const [name, setName] = useState(category?.name || '');
  const [image, setImage] = useState(category?.image || '');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/upload', formData);
      setImage(res.data.url);
      if (errors.image) setErrors({ ...errors, image: '' });
    } catch (err) {
      setNotification({ message: 'Image upload failed', type: 'error' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = () => setImage('');

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Category name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { name: name.trim(), image };
      if (category) {
        await api.put(`/admin/categories/${category._id}`, payload);
        setNotification({ message: 'Category updated', type: 'success' });
      } else {
        await api.post('/admin/categories', payload);
        setNotification({ message: 'Category created', type: 'success' });
      }
      if (onSuccess) onSuccess();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setNotification({ message: err.response?.data?.message || 'Operation failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{category ? 'Edit Category' : 'Add Category'}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-primary focus:outline-none focus:ring-2 transition`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Category Image</label>
              <div className="flex items-center gap-4">
                {image && (
                  <div className="relative w-16 h-16">
                    <img src={image} alt="Category" className="w-full h-full object-cover rounded border" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
                <label className="btn-primary cursor-pointer inline-block active:scale-95 transition-all duration-200">
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">Optional. Used on homepage category circles.</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50 active:scale-95">Cancel</button>
              <button type="submit" disabled={loading || uploading} className="btn-primary px-6 py-2 active:scale-95 disabled:opacity-50">
                {loading ? 'Saving...' : category ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {notification && <CenteredNotification {...notification} onClose={() => setNotification(null)} />}
    </>
  );
};

export default AdminCategoryForm;