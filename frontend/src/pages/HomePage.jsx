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
      <section className="relative h-[600px] md:h-[700px] bg-cover bg-center bg-no-repeat flex items-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)' }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-4 text-center text-white z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Handcrafted with Love</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">Unique crochet pieces for you and your home.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories Section – horizontal scroll (unchanged) */}
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl text-center font-bold text-gray-800 py-6">Shop by Category</h2>
        <div className="border-t border-gray-200 mb-8"></div>
        <div className="flex overflow-x-auto space-x-8 pb-4 pt-4 px-4 scrollbar-hide">
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
              <span className="mt-3 text-gray-700 font-medium group-hover:text-primary transition text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals – horizontal scroll (changed from grid) */}
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">New Arrivals</h2>
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
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 bg-gray-50 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Best Sellers</h2>
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
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Featured Products</h2>
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






/*
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import ProductCard from '../components/Products/ProductCard';
import { fetchCategories } from '../services/categoryService';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Testimonials from '../components/Home/Testimonials';

// HomePage displays the landing content for the store.
// It loads categories, new arrivals, best sellers, and featured products.
const HomePage = () => {
  const dispatch = useDispatch(); // redux dispatch hook, available if needed for future actions
  const navigate = useNavigate(); // router hook to navigate to shop filters

  // Local state for category and product sections
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
      {/* Hero Section */
    /*}
      <section className="relative h-[600px] md:h-[700px] bg-cover bg-center bg-no-repeat flex items-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)' }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-4 text-center text-white z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Handcrafted with Love</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">Unique crochet pieces for you and your home.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories Section }
<section className="container mx-auto  px-4 md:px-6 lg:px-8 py-16">
  
     <h2 className="text-2xl md:text-3xl text-center font-bold text-gray-800 py-6">Shop by Category</h2>
    
  <div className="border-t border-gray-200 mb-8"></div>
 <div className="flex overflow-x-auto space-x-16 pb-4 scrollbar-hide">
  {categories.map((cat) => (
    <Link
      key={cat._id}
      to={`/shop?category=${cat.slug}`}
      className="flex flex-col items-center group flex-shrink-0 w-32 md:w-40"
    >
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden bg-gray-200 border border-gray-200 shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
        {cat.image ? (
          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-primary/20 to-secondary/20">
            🧶
          </div>
        )}
      </div>
      <span className="mt-3 text-gray-700 font-medium group-hover:text-primary transition text-center">
        {cat.name}
      </span>
    </Link>
  ))}
</div>
</section>
      {/* New Arrivals Section (grid 5 cols) }
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">New Arrivals</h2>
          <button onClick={() => handleViewAll('new')} className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-medium">
            View All
          </button>
        </div>
        <div className="border-t border-gray-200 mb-8"></div>
        {loadingNew ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        ) : newArrivals.length === 0 ? (
          <p className="text-gray-500 text-center">No new arrivals yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {newArrivals.map((product) => <ProductCard key={product._id} product={product} showAddToCart />)}
          </div>
        )}
      </section>

      {/* Best Sellers Section }
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 bg-gray-50 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Best Sellers</h2>
          <button onClick={() => handleViewAll('best')} className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-medium">
            View All
          </button>
        </div>
         <div className="border-t border-gray-200 mb-8"></div>
        {loadingBest ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        ) : bestSellers.length === 0 ? (
          <p className="text-gray-500 text-center">No best sellers yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {bestSellers.map((product) => <ProductCard key={product._id} product={product} showAddToCart />)}
          </div>
        )}
      </section>

      {/* Featured Products Section }
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Featured Products</h2>
          <button onClick={() => handleViewAll('featured')} className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition text-sm font-medium">
            View All
          </button>
        </div>
        <div className="border-t border-gray-200 mb-8"></div>
        {loadingFeatured ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        ) : featured.length === 0 ? (
          <p className="text-gray-500 text-center">No featured products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {featured.map((product) => <ProductCard key={product._id} product={product} showAddToCart />)}
          </div>
        )}
      </section>

      {/* Testimonials Section }
      <Testimonials />
    </div>
  );
};

export default HomePage;
*/