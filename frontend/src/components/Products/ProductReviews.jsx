import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import {
  StarIcon as StarOutline,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ProductReviews = ({ productId }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sort, setSort] = useState('newest');
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // for lightbox

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/product/${productId}`);
        setReviews(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  // Handle review submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      toast.error('Please login to review');
      return;
    }
    if (comment.length < 5) {
      toast.error('Comment must be at least 5 characters');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/reviews/product/${productId}/review`, {
        rating,
        title,
        comment,
        media,
      });
      toast.success('Review added!');
      setReviews([res.data.review, ...reviews]);
      setTitle('');
      setComment('');
      setRating(5);
      setMedia([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle image upload
  const handleMediaChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (media.length + files.length > 5) {
      toast.error('You can upload up to 5 images');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const uploadedFiles = [];
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
        uploadedFiles.push({
          url: res.data.url,
          publicId: res.data.public_id,
          resourceType: 'image',
        });
      }
      if (uploadedFiles.length > 0) {
        setMedia((prev) => [...prev, ...uploadedFiles]);
        toast.success('Images uploaded');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // Sort reviews
  const sortedReviews = [...reviews];
  if (sort === 'newest') sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sort === 'oldest') sortedReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else if (sort === 'highest') sortedReviews.sort((a, b) => b.rating - a.rating);
  else if (sort === 'lowest') sortedReviews.sort((a, b) => a.rating - b.rating);

  // Determine if the current user has already reviewed this product
  const userHasReviewed = userInfo
    ? reviews.some(
        (r) => r.user && r.user.toString() === userInfo._id.toString()
      )
    : false;

  // Lightbox handlers
  const openLightbox = (url) => setSelectedImage(url);
  const closeLightbox = () => setSelectedImage(null);

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        <p className="mt-2">Loading reviews...</p>
      </div>
    );
  }

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : 0;

  return (
    <>
      <div className="mt-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Customer Reviews</h2>
            {totalReviews > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) =>
                    i < Math.round(avgRating) ? (
                      <StarSolid key={i} className="h-5 w-5" />
                    ) : (
                      <StarOutline key={i} className="h-5 w-5" />
                    )
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">{avgRating}</span>
                <span className="text-sm text-gray-500">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 mb-6"></div>

        {/* Review list */}
        {sortedReviews.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedReviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <p className="font-semibold text-gray-800">{review.name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(review.createdAt).toLocaleDateString('en-PK', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) =>
                            i < review.rating ? (
                              <StarSolid key={i} className="h-4 w-4" />
                            ) : (
                              <StarOutline key={i} className="h-4 w-4" />
                            )
                          )}
                        </div>
                        {review.verifiedPurchase && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {review.title && (
                      <p className="font-medium text-gray-800 mt-2">{review.title}</p>
                    )}
                    <p className="text-gray-600 mt-1 leading-relaxed">{review.comment}</p>

                    {/* Review media – clickable thumbnails */}
                    {review.media && review.media.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {review.media.map((item, idx) => (
                          <div
                            key={idx}
                            className="w-25 h-25 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                            onClick={() => openLightbox(item.url)}
                          >
                            {item.resourceType === 'video' ? (
                              <video
                                src={item.url}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                            ) : (
                              <img
                                src={item.url}
                                alt={`Review media ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review form – only show if logged in and NOT already reviewed */}
        {userInfo && !userHasReviewed && (
          <div className="mt-12 border-t border-gray-200 pt-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Write a Review
              </h3>
              <p className="text-gray-500 text-center text-sm mb-6">
                Share your experience with this product
              </p>
              <form
                onSubmit={handleSubmit}
                className="space-y-5 bg-white rounded-xl p-6 shadow-md border border-gray-100"
              >
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        {star <= rating ? (
                          <StarSolid className="h-7 w-7 text-yellow-400" />
                        ) : (
                          <StarOutline className="h-7 w-7 text-gray-300" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Review Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                    placeholder="Summarize your experience"
                    maxLength="100"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comment</label>
                  <textarea
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                    placeholder="Share your thoughts..."
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
                        {uploading ? 'Uploading...' : 'Upload'}
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleMediaChange}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>

                    {media.map((item, index) => (
                      <div key={item.url} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                        <img
                          src={item.url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
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
                  disabled={submitting || uploading}
                  className="w-full sm:w-auto mx-auto btn-primary px-6 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition active:scale-95 disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        )}

        {userInfo && userHasReviewed && (
          <div className="mt-8 text-center bg-green-50 rounded-xl p-6 border border-green-200 max-w-2xl mx-auto">
            <p className="text-green-700">✅ You have already reviewed this product. Thank you!</p>
          </div>
        )}

        {!userInfo && (
          <div className="mt-8 text-center bg-gray-50 rounded-xl p-6 border border-gray-200 max-w-2xl mx-auto">
            <p className="text-gray-600">
              <Link to="/login" className="text-primary font-medium hover:underline">
                Log in
              </Link>
              {' '}to write a review.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Review full"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              onClick={closeLightbox}
              className="absolute -top-12 -right-4 text-white hover:text-gray-300 transition"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductReviews;