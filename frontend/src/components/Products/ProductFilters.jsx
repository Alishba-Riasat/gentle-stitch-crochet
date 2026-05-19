import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ProductFilters = ({ activeFilters, onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [priceMin, setPriceMin] = useState(activeFilters.minPrice || '');
  const [priceMax, setPriceMax] = useState(activeFilters.maxPrice || '');
  const [selectedCategory, setSelectedCategory] = useState(activeFilters.category || '');
  const [featured, setFeatured] = useState(activeFilters.featured === 'true');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  const applyFilters = () => {
    const newFilters = {};
    if (selectedCategory) newFilters.category = selectedCategory;
    if (priceMin) newFilters.minPrice = priceMin;
    if (priceMax) newFilters.maxPrice = priceMax;
    if (featured) newFilters.featured = 'true';
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setPriceMin('');
    setPriceMax('');
    setFeatured(false);
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <h3 className="font-semibold text-lg mb-2">Filters</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full border rounded px-2 py-1"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Price Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-1/2 border rounded px-2 py-1"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-1/2 border rounded px-2 py-1"
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="featured"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="featured" className="text-sm">Featured Only</label>
      </div>
      
      <div className="flex gap-2 pt-2">
        <button onClick={applyFilters} className="btn-primary flex-1 py-1">Apply</button>
        <button onClick={resetFilters} className="border border-gray-300 rounded px-3 py-1">Reset</button>
      </div>
    </div>
  );
};

export default ProductFilters;