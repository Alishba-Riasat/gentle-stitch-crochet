import React, { useEffect, useState } from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import api from '../../services/api';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Increase limit to get many reviews for horizontal scrolling
        const res = await api.get('/products/top-reviews');
        setReviews(res.data);
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;
    const stars = [];
    for (let i = 0; i < full; i++) stars.push(<FaStar key={i} className="text-yellow-400" />);
    if (half) stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    return stars;
  };

  const getAvatar = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B5A2B&color=fff&rounded=true&bold=true`;

  if (loading) {
    return (
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-16 bg-gray-50 rounded-2xl my-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-16 bg-gray-50 rounded-2xl my-8 text-center">
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16 bg-gray-50 rounded-2xl my-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Our customers love us</h2>
        <div className="flex justify-center items-center gap-2 mt-2">
          <div className="flex text-yellow-400">{renderStars(5)}</div>
          <span className="text-gray-600">5.0 star • Based on {reviews.length}+ reviews</span>
        </div>
      </div>

      {/* Horizontal scroll container – no arrows, just scrollable */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6" style={{ width: 'max-content' }}>
          {reviews.map((review, idx) => (
            <div
              key={review.id || idx}
              className="bg-white p-5 rounded-[30px] shadow-sm hover:shadow-md transition w-80 flex-shrink-0"
            >
              <div className="flex items-center gap-3 mb-2">
                <img src={getAvatar(review.name)} alt={review.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="font-semibold text-gray-800">{review.name}</h4>
                  <div className="flex text-yellow-400 text-sm">{renderStars(review.rating)}</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;