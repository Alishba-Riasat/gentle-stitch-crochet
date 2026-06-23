import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { useSettings } from '../../hooks/useSettings';

const Footer = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <footer className="bg-slate-950 text-slate-100 mt-16 py-12">
        <div className="container mx-auto px-4 text-center text-slate-500">Loading...</div>
      </footer>
    );
  }

  const storeName = settings?.storeName || 'Gentle Stitch Crochet';
  const storeLogo = settings?.storeLogo || '';
  const storeTagline = settings?.storeTagline || 'Handcrafted crochet pieces made with love.';
  const storeEmail = settings?.storeEmail || '';
  const storePhone = settings?.storePhone || '';
  const socialLinks = settings?.socialLinks || {};

  const socialIcons = [
    { key: 'facebook', icon: FaFacebook, url: socialLinks.facebook },
    { key: 'instagram', icon: FaInstagram, url: socialLinks.instagram },
    { key: 'twitter', icon: FaTwitter, url: socialLinks.twitter },
  ].filter(item => item.url && item.url.trim() !== '');

  const hasSocialLinks = socialIcons.length > 0;
  const hasContactInfo = storeEmail || storePhone;

  return (
    <footer className="bg-slate-950 text-slate-100 ">
      <div className="container mx-auto px-10 py-12">
        {/* Main Grid – 1 column on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 gap-10 text-center md:text-left md:grid-cols-2 lg:grid-cols-3">
          {/* Column 1 – Brand + Social */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center gap-3">
              {storeLogo ? (
                <img
                  src={storeLogo}
                  alt={storeName}
                  className="h-12 w-auto rounded-lg bg-slate-900 p-2 object-contain shadow-lg"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                  {storeName.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold text-white">{storeName}</h3>
                <p className="text-sm text-slate-400">{storeTagline}</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              Discover cozy, timeless crochet designs made to brighten your home and delight every gift recipient.
            </p>

            {hasSocialLinks && (
              <div className="flex items-center gap-3 mt-2">
                {socialIcons.map(({ key, icon: Icon, url }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-slate-700 p-2.5 text-slate-200 transition hover:border-primary hover:text-white hover:bg-primary/10"
                    aria-label={key}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2 – Quick Links */}
          <div className=" pl-12 ml-10 ">
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-white transition">Shop All</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>

          {/* Column 3 – Customer Care */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Customer Care</h4>
            <div className="space-y-3 text-sm text-slate-400">
              {storeEmail && (
                <div>
                  <span className="block text-slate-200 font-medium">Email</span>
                  <a href={`mailto:${storeEmail}`} className="hover:text-white transition">
                    {storeEmail}
                  </a>
                </div>
              )}
              {storePhone && (
                <div>
                  <span className="block text-slate-200 font-medium">Phone</span>
                  <a href={`tel:${storePhone}`} className="hover:text-white transition">
                    {storePhone}
                  </a>
                </div>
              )}
              {!hasContactInfo && (
                <p className="text-slate-500">Reach out through the contact page for help with orders and custom requests.</p>
              )}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-slate-400">
                <p className="text-sm text-slate-300 font-medium">Need help?</p>
                <p className="text-sm">We’re here to help with orders, gifts, and styling advice.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;