import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

const GuestOrderReviewPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');
  const [reviewState, setReviewState] = useState({});
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/guest-order-review/${token}`);
        setOrderData(res.data);
        const initialState = {};
        res.data.items.forEach((item) => {
          initialState[item.product._id] = {
            rating: 5,
            title: '',
            comment: '',
            media: [],
            submitting: false,
          };
        });
        setReviewState(initialState);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired link');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [token]);

  const handleReviewChange = (productId, field, value) => {
    setReviewState((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const handleMediaUpload = async (productId, files) => {
    if (!files || files.length === 0) return;
    const currentMedia = reviewState[productId]?.media || [];
    if (currentMedia.length + files.length > 5) {
      toast.error('You can upload up to 5 images per review');
      return;
    }
    setUploading((prev) => ({ ...prev, [productId]: true }));
    try {
      const uploaded = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          toast.error('Only images are supported');
          continue;
        }
        const formData = new FormData();
        formData.append('image', file);
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploaded.push({
          url: res.data.url,
          publicId: res.data.public_id,
          resourceType: 'image',
        });
      }
      if (uploaded.length > 0) {
        handleReviewChange(productId, 'media', [...currentMedia, ...uploaded]);
        toast.success('Images uploaded');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const removeMedia = (productId, index) => {
    const currentMedia = reviewState[productId]?.media || [];
    const newMedia = currentMedia.filter((_, i) => i !== index);
    handleReviewChange(productId, 'media', newMedia);
  };

  const handleSubmit = async (productId, e) => {
    e.preventDefault();
    if (!reviewState[productId]) {
      console.error('Submit called but reviewState missing for', productId, reviewState);
      toast.error('Internal error: review data unavailable');
      return;
    }

    console.log('Submitting guest review', { productId, token });

    const { rating, title, comment, media } = reviewState[productId];
    if (comment.length < 5) {
      toast.error('Comment must be at least 5 characters');
      return;
    }
    setReviewState((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], submitting: true },
    }));
    try {
      const res = await api.post(`/reviews/guest-review/${token}`, {
        rating,
        title,
        comment,
        media,
        productId,
      });
      console.log('Guest review submit response', res.data);
      toast.success('Review submitted!');
      setOrderData((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.product._id === productId
            ? { ...item, alreadyReviewed: true }
            : item
        ),
      }));
      setReviewState((prev) => ({
        ...prev,
        [productId]: { rating: 5, title: '', comment: '', media: [], submitting: false },
      }));
    } catch (err) {
      console.error('Guest review submit failed', err);
      toast.error(err.response?.data?.message || 'Failed to submit review');
      setReviewState((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], submitting: false },
      }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-12 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        <p className="mt-2 text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-12 py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Oops!</h2>
          <p className="text-red-600">{error}</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-10 py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Review Your Order</h1>
        <p className="text-gray-500 mt-1">Order #{orderData.orderId.slice(-8).toUpperCase()} · Delivered</p>
        <div className="border-t border-gray-200 mt-3"></div>
      </div>

      <div className="space-y-8">
        {orderData.items.map((item) => {
          const productId = item.product._id;
          const state = reviewState[productId] || { rating: 5, title: '', comment: '', media: [], submitting: false };
          const isUploading = uploading[productId] || false;

          return (
            <div key={productId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={item.productImage || 'https://via.placeholder.com/80/EAE2D9/8B5A2B?text=GSC'}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} × Rs. {Number(item.price).toFixed(2)}</p>
                    {item.alreadyReviewed && (
                      <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        ✅ You reviewed this
                      </span>
                    )}
                  </div>
                </div>

                {item.alreadyReviewed ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
                    You have already submitted a review for this product. Thank you!
                  </div>
                ) : (
                  <form onSubmit={(e) => handleSubmit(productId, e)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleReviewChange(productId, 'rating', star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            {star <= state.rating ? (
                              <StarSolid className="h-7 w-7 text-yellow-400" />
                            ) : (
                              <StarOutline className="h-7 w-7 text-gray-300" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={state.title}
                        onChange={(e) => handleReviewChange(productId, 'title', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                        placeholder="Summarize your experience"
                        maxLength="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Comment</label>
                      <textarea
                        rows="3"
                        value={state.comment}
                        onChange={(e) => handleReviewChange(productId, 'comment', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                        placeholder="Share your thoughts about this product..."
                        minLength="5"
                        required
                      />
                    </div>

                    {/* Image upload – inline layout */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add photos (optional, max 5)</label>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50 transition">
                          <PhotoIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {isUploading ? 'Uploading...' : 'Upload'}
                          </span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleMediaUpload(productId, e.target.files)}
                            disabled={isUploading}
                            className="hidden"
                          />
                        </label>

                        {state.media.map((img, idx) => (
                          <div key={img.url} className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                            <img src={img.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeMedia(productId, idx)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={state.submitting}
                      className="w-full sm:w-auto btn-primary px-6 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition active:scale-95 disabled:opacity-60"
                    >
                      {state.submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-10 text-center">
        <Link to="/" className="text-primary hover:underline text-sm">← Back to Home</Link>
      </div>
    </div>
  );
};

export default GuestOrderReviewPage;