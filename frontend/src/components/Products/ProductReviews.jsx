import React, { useState } from 'react';
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

  React.useEffect(() => {
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
const res = await api.post(`/reviews/product/${productId}/review`, { rating, title, comment, media });      toast.success('Review added!');
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
  const handleMediaChange = async (e) => {
  const files = Array.from(e.target.files || []);

  if (files.length === 0) return;

  if (media.length + files.length > 5) {
    toast.error('You can upload up to 5 files');
    e.target.value = '';
    return;
  }

  setUploading(true);

  try {
    const uploadedFiles = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only images are supported right now');
        continue;
      }

      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      uploadedFiles.push({
        url: res.data.url,
        publicId: res.data.public_id,
        resourceType: 'image',
      });
    }

    setMedia((prev) => [...prev, ...uploadedFiles]);

    if (uploadedFiles.length > 0) {
      toast.success('Media uploaded');
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

  const sortedReviews = [...reviews];
  if (sort === 'newest') sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sort === 'oldest') sortedReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else if (sort === 'highest') sortedReviews.sort((a, b) => b.rating - a.rating);
  else if (sort === 'lowest') sortedReviews.sort((a, b) => a.rating - b.rating);

  if (loading) return <div className="py-4 text-center text-gray-500">Loading reviews...</div>;

  return (
    <div className="mt-8">
      {/* Sort */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-primary focus:border-primary"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      {/* Review list */}
      {sortedReviews.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl shadow-sm p-4 border">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {review.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-800">{review.name}</span>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) =>
                        i < review.rating ? <StarSolid key={i} className="h-4 w-4" /> : <StarOutline key={i} className="h-4 w-4" />
                      )}
                    </div>
                    {review.verifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Verified Purchase</span>
                    )}
                  </div>
                  {review.title && <p className="font-medium text-gray-800 mt-1">{review.title}</p>}
                  <p className="text-gray-600 mt-1">{review.comment}</p>
                  {review.media?.length > 0 && (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
    {review.media.map((item) => (
      <div key={item.url} className="rounded-lg overflow-hidden border">
        {item.resourceType === 'video' ? (
          <video src={item.url} controls className="h-32 w-full object-cover" />
        ) : (
          <img src={item.url} alt="Review media" className="h-32 w-full object-cover" />
        )}
      </div>
    ))}
  </div>
)}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review form for logged-in users */}
      {userInfo && (
        <div className="mt-8 border-t pt-6">
          <h4 className="font-semibold text-lg mb-3">Write a review</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    {star <= rating ? (
                      <StarSolid className="h-6 w-6 text-yellow-400" />
                    ) : (
                      <StarOutline className="h-6 w-6 text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-primary"
                placeholder="Summarize your experience"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Comment</label>
              <textarea
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-primary"
                placeholder="Share your thoughts..."
                minLength="5"
                required
              />
            </div>
            <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Add photos</label>

  <label className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
    <PhotoIcon className="h-5 w-5 text-gray-500" />
    <span className="text-sm text-gray-600">
      {uploading ? 'Uploading...' : 'Upload photos'}
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

  {media.length > 0 && (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
      {media.map((item, index) => (
        <div key={item.url} className="relative rounded-lg overflow-hidden border">
          <img src={item.url} alt="Review media" className="h-28 w-full object-cover" />
          <button
            type="button"
            onClick={() => removeMedia(index)}
            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )}
</div>
<button type="submit" disabled={submitting || uploading} className="btn-primary px-4 py-2">              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}
      {!userInfo && (
        <p className="text-gray-500 text-center mt-4">
          <Link to="/login" className="text-primary hover:underline">Log in</Link> to write a review.
        </p>
      )}
    </div>
  );
};

export default ProductReviews;