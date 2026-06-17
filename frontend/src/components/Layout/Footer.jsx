import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope } from 'react-icons/fa';
import { useSettings } from '../../hooks/useSettings';

const Footer = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <footer className="bg-gray-900 text-gray-300 mt-16 py-12">
        <div className="container mx-auto px-4 text-center text-gray-500">Loading...</div>
      </footer>
    );
  }

  const storeName = settings?.storeName || 'Gentle Stitch Crochet';
  const storeEmail = settings?.storeEmail || '';
  const storePhone = settings?.storePhone || '';
  const socialLinks = settings?.socialLinks || {};

  // Filter social links with valid URLs
  const socialIcons = [
    { key: 'facebook', icon: FaFacebook, url: socialLinks.facebook },
    { key: 'instagram', icon: FaInstagram, url: socialLinks.instagram },
    { key: 'twitter', icon: FaTwitter, url: socialLinks.twitter },
  ].filter(item => item.url && item.url.trim() !== '');

  const hasContactInfo = storeEmail || storePhone;
  const hasSocialLinks = socialIcons.length > 0;
  const showStayConnected = hasContactInfo || hasSocialLinks;

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">{storeName}</h3>
            <p className="text-sm">Handcrafted crochet pieces made with love. Bringing warmth and joy to your home.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-white transition">Shop All</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/returns" className="hover:text-white transition">Returns & Exchanges</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition">Shipping Info</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Stay Connected – only if there is contact info or social links */}
          {showStayConnected && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Stay Connected</h4>
              {storeEmail && (
                <p className="text-sm mb-1">
                  <span className="font-medium">Email:</span>{' '}
                  <a href={`mailto:${storeEmail}`} className="hover:text-white transition">{storeEmail}</a>
                </p>
              )}
              {storePhone && (
                <p className="text-sm mb-3">
                  <span className="font-medium">Phone:</span>{' '}
                  <a href={`tel:${storePhone}`} className="hover:text-white transition">{storePhone}</a>
                </p>
              )}
              {hasSocialLinks && (
                <div className="flex space-x-4 mt-2">
                  {socialIcons.map(({ key, icon: Icon, url }) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition"
                      aria-label={key}
                    >
                      <Icon size={20} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;