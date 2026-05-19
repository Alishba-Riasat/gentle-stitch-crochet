import React from 'react';

const ProductSort = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="-createdAt">Newest</option>
      <option value="price">Price: Low to High</option>
      <option value="-price">Price: High to Low</option>
      <option value="-rating">Highest Rated</option>
      <option value="name">Name: A to Z</option>
    </select>
  );
};

export default ProductSort;