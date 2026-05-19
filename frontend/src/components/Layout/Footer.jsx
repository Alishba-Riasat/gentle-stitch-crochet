import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const handleSocialClick = (e) => {
    e.preventDefault();
    // TODO: Replace with actual social media URLs
    console.log('Social link clicked – add real URL later');
  };

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Gentle Stitch Crochet</h3>
            <p className="text-sm">Handcrafted crochet pieces made with love. Bringing warmth and joy to your home.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-white transition">Shop All</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/returns" className="hover:text-white transition">Returns & Exchanges</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition">Shipping Info</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Stay Connected</h4>
            <p className="text-sm mb-3">Get the latest updates on new products and offers.</p>
            <form className="flex mb-4" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 rounded-l-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-opacity-90 transition">Subscribe</button>
            </form>
            <div className="flex space-x-4">
              <a href="#" onClick={handleSocialClick} className="hover:text-white transition" aria-label="Facebook">
                <FaFacebook size={20} />
              </a>
              <a href="#" onClick={handleSocialClick} className="hover:text-white transition" aria-label="Instagram">
                <FaInstagram size={20} />
              </a>
              <a href="#" onClick={handleSocialClick} className="hover:text-white transition" aria-label="Twitter">
                <FaTwitter size={20} />
              </a>
              <a href="#" onClick={handleSocialClick} className="hover:text-white transition" aria-label="Email">
                <FaEnvelope size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Gentle Stitch Crochet. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;