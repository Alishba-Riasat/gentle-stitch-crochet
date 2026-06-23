import React from 'react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTwitter, FaEnvelope } from 'react-icons/fa';
import { useSettings } from '../hooks/useSettings';

const ContactPage = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-10 py-12 max-w-4xl text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  // Helper to format phone for WhatsApp (remove spaces, dashes, plus sign)
  const formatPhoneForWhatsApp = (phone) => {
    if (!phone) return '';
    return phone.replace(/[\s\-+]/g, '');
  };

  // Social links mapping
  const socialItems = [
    { key: 'facebook', icon: FaFacebook, label: 'Facebook', url: settings?.socialLinks?.facebook },
    { key: 'instagram', icon: FaInstagram, label: 'Instagram', url: settings?.socialLinks?.instagram },
    { key: 'twitter', icon: FaTwitter, label: 'Twitter', url: settings?.socialLinks?.twitter },
  ].filter(item => item.url && item.url.trim() !== '');

  const storeEmail = settings?.storeEmail || '';
  const storePhone = settings?.storePhone || '';

  const hasContactInfo = storeEmail || storePhone || socialItems.length > 0;

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-10 py-12 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Contact Us</h1>
      <div className="border-t border-gray-200 mb-8"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        {hasContactInfo && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Get in Touch</h2>
            <p className="text-gray-600 mb-6">
              Have a question about an order, a product, or custom request? We’d love to hear from you.
            </p>
            <div className="space-y-4">
              {storePhone && (
                <a
                  href={`https://wa.me/${formatPhoneForWhatsApp(storePhone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-700 hover:text-primary transition"
                >
                  <FaWhatsapp className="h-6 w-6 text-green-600" />
                  <span>{storePhone}</span>
                </a>
              )}
              {storeEmail && (
                <a
                  href={`mailto:${storeEmail}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-primary transition"
                >
                  <FaEnvelope className="h-6 w-6 text-red-500" />
                  <span>{storeEmail}</span>
                </a>
              )}
              {socialItems.map(({ key, icon: Icon, label, url }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-700 hover:text-primary transition"
                >
                  <Icon className="h-6 w-6" />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Business Hours */}
        <div className="bg-primary/5 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-primary mb-4">Business Hours</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex justify-between"><span>Monday – Friday:</span><span>10:00 AM – 7:00 PM</span></li>
            <li className="flex justify-between"><span>Saturday:</span><span>11:00 AM – 5:00 PM</span></li>
            <li className="flex justify-between"><span>Sunday:</span><span>Closed</span></li>
          </ul>
          <p className="mt-4 text-sm text-gray-500">
            Replies to emails and messages are typically within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;