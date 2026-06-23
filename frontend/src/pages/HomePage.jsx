import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/Products/ProductCard';
import { fetchCategories } from '../services/categoryService';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Testimonials from '../components/Home/Testimonials';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loadingNew, setLoadingNew] = useState(false);
  const [loadingBest, setLoadingBest] = useState(false);
  const [loadingFeatured, setLoadingFeatured] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      setLoadingNew(true);
      try {
        const res = await api.get('/products?isNew=true&limit=10');
        setNewArrivals(res.data.products);
      } catch (err) {
        console.error('Failed to fetch new arrivals', err);
      } finally {
        setLoadingNew(false);
      }
    };
    fetchNewArrivals();
  }, []);

  useEffect(() => {
    const fetchBestSellers = async () => {
      setLoadingBest(true);
      try {
        const res = await api.get('/products?isBestSeller=true&limit=10');
        setBestSellers(res.data.products);
      } catch (err) {
        console.error('Failed to fetch best sellers', err);
      } finally {
        setLoadingBest(false);
      }
    };
    fetchBestSellers();
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoadingFeatured(true);
      try {
        const res = await api.get('/products?featured=true&limit=10');
        setFeatured(res.data.products);
      } catch (err) {
        console.error('Failed to fetch featured products', err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleViewAll = (type) => {
    if (type === 'new') navigate('/shop?isNew=true');
    else if (type === 'best') navigate('/shop?isBestSeller=true');
    else if (type === 'featured') navigate('/shop?featured=true');
    else navigate('/shop');
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] bg-cover bg-center bg-no-repeat flex items-center mb-12"
        style={{ backgroundImage: 'url(https://res.cloudinary.com/dlcrtkvzq/image/upload/v1782029539/hero_image_ndgjth.jpg)',
          fit: 'cover'
         }}>
        
        
      </section>

      {/* Categories Section – horizontal scroll (unchanged) */}
      <section className="container mx-auto px-4 bg-primary/5 rounded-lg py-8">
<h2
    style={{
      fontSize: '36px',
      fontWeight: 700,
      color: '#1f2937',
      letterSpacing: '0.5px',
      marginBottom: '1rem',
      textAlign: 'center',
       fontFamily: "'Playfair Display', Georgia, serif",
    }}
    className="md:text-[44px] lg:text-[52px]"
  >
    Shop by Category
  </h2>     <div className="border-t border-gray-200 mb-8"></div>
        <div className="flex overflow-x-auto space-x-8 pb-4 pt-4 px-4 scrollbar-hide ">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${cat.slug}`}
              className="flex flex-col items-center group flex-shrink-0 w-32 md:w-48"
            >
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-[70px] overflow-hidden bg-gray-200 border border-gray-200 shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-primary/20 to-secondary/20">
                    🧶
                  </div>
                )}
              </div>
              <span className="mt-3 text-gray-700 font-medium group-hover:text-primary transition text-center uppercase">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals – horizontal scroll (changed from grid) */}
      <section className="container mx-auto px-4 md:px-6 lg:px-10 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">New Arrivals</h2>
          <button onClick={() => handleViewAll('new')} className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white active:bg-primary/80 active:scale-95 transition-all duration-200  text-sm font-medium">
            View All
          </button>
        </div>
        <div className="border-t border-gray-200 mb-8"></div>
        {loadingNew ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        ) : newArrivals.length === 0 ? (
          <p className="text-gray-500 text-center">No new arrivals yet.</p>
        ) : (
          <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
            {newArrivals.map((product) => (
              <div key={product._id} className="flex-shrink-0 w-64 md:w-72">
                <ProductCard product={product} showAddToCart />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Best Sellers – horizontal scroll */}
      <section className="container mx-auto px-4 md:px-6 lg:px-10 py-12 bg-gray-50 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Best Sellers</h2>
          <button onClick={() => handleViewAll('best')} className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white active:bg-primary/80 active:scale-95 transition-all duration-200  text-sm font-medium">
            View All
          </button>
        </div>
        <div className="border-t border-gray-200 mb-8"></div>
        {loadingBest ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        ) : bestSellers.length === 0 ? (
          <p className="text-gray-500 text-center">No best sellers yet.</p>
        ) : (
          <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
            {bestSellers.map((product) => (
              <div key={product._id} className="flex-shrink-0 w-64 md:w-72">
                <ProductCard product={product} showAddToCart />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products – horizontal scroll */}
      <section className="container mx-auto px-4 md:px-6 lg:px-10 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Featured Products</h2>
          <button onClick={() => handleViewAll('featured')} className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white active:bg-primary/80 active:scale-95 transition-all duration-200  text-sm font-medium">
            View All
          </button>
        </div>
        <div className="border-t border-gray-200 mb-8"></div>
        {loadingFeatured ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        ) : featured.length === 0 ? (
          <p className="text-gray-500 text-center">No featured products yet.</p>
        ) : (
          <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
            {featured.map((product) => (
              <div key={product._id} className="flex-shrink-0 w-64 md:w-72">
                <ProductCard product={product} showAddToCart />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials Section */}
      <Testimonials />
    </div>
  );
};

export default HomePage;






