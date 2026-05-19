import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { submitReview } from '../../redux/slices/productSlice';
import toast from 'react-hot-toast';

const ProductReviews = ({ product, productId }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      await dispatch(submitReview({ id: productId, rating, comment })).unwrap();
      toast.success('Review added!');
      setComment('');
      setRating(5);
    } catch (err) {
      toast.error(err.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
      {product.reviews && product.reviews.length > 0 ? (
        <div className="space-y-4 mb-6">
          {product.reviews.map((review, idx) => (
            <div key={idx} className="border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                <span className="font-medium">{review.name}</span>
                <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-700 mt-1">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-4">No reviews yet. Be the first to review!</p>
      )}

      {userInfo ? (
        <form onSubmit={handleSubmit} className="border-t pt-4">
          <h4 className="font-medium mb-2">Write a review</h4>
          <div className="mb-3">
            <label className="block text-sm mb-1">Rating</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border rounded px-2 py-1">
              <option value="5">5 – Excellent</option>
              <option value="4">4 – Very Good</option>
              <option value="3">3 – Average</option>
              <option value="2">2 – Poor</option>
              <option value="1">1 – Terrible</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm mb-1">Comment</label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-field"
              placeholder="Share your experience..."
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <p className="text-center text-gray-500 mt-4">Please <a href="/login" className="text-primary">log in</a> to write a review.</p>
      )}
    </div>
  );
};

export default ProductReviews;