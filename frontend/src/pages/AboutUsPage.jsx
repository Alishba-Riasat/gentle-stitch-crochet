import React from 'react';
import { HeartIcon, StarIcon, SparklesIcon, TruckIcon } from '@heroicons/react/24/outline';
import { useSettings } from '../hooks/useSettings';

const AboutUsPage = () => {
  const { settings, loading } = useSettings();
  const storeName = settings?.storeName || 'Gentle Stitch Crochet';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">About {storeName}</h1>
      <div className="border-t border-gray-200 mb-8"></div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-primary mb-3">Our Story</h2>
          <p className="text-gray-600 leading-relaxed">
            {storeName} was born from a love of handmade artistry and a desire to bring warmth and joy to homes across Pakistan. 
            What started as a small hobby in a living room has grown into a community of passionate crocheters who believe that every piece tells a story. 
            Each blanket, toy, scarf, and accessory is carefully handcrafted with premium yarns, ensuring quality and durability.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-primary mb-3">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            We aim to create beautiful, sustainable crochet items that bring comfort and happiness to your everyday life. 
            By supporting local artisans and using eco‑friendly materials, we strive to make a positive impact on both people and the planet.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-primary mb-3">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="flex items-start gap-3">
              <HeartIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-800">100% Handmade</h3>
                <p className="text-gray-500 text-sm">Every item is individually crafted, never mass‑produced.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <StarIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-800">Premium Quality</h3>
                <p className="text-gray-500 text-sm">Soft, durable yarns that last for years.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <SparklesIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-800">Eco‑Friendly</h3>
                <p className="text-gray-500 text-sm">Sustainable materials and minimal waste.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TruckIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-800">Fast Shipping</h3>
                <p className="text-gray-500 text-sm">Reliable delivery across Pakistan.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 p-6 rounded-2xl">
          <h2 className="text-2xl font-semibold text-primary mb-3">Our Promise</h2>
          <p className="text-gray-600 leading-relaxed">
            Every purchase supports local craftsmanship. We personally check each item before shipping to ensure you receive a product you’ll love. 
            If you're ever unhappy, our customer care team is here to help.
          </p>
        </section>

        {settings?.storeEmail || settings?.storePhone ? (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Contact us at{' '}
              {settings?.storeEmail && (
                <a href={`mailto:${settings.storeEmail}`} className="text-primary hover:underline">{settings.storeEmail}</a>
              )}
              {settings?.storeEmail && settings?.storePhone && ' or '}
              {settings?.storePhone && (
                <a href={`tel:${settings.storePhone}`} className="text-primary hover:underline">{settings.storePhone}</a>
              )}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AboutUsPage;