import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Gentle Stitch Crochet. Handcrafted with love.</p>
      </div>
    </footer>
  );
};

export default Footer;