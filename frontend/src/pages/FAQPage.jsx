import React, { useState } from 'react';
import { Link } from 'react-router-dom';   
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const faqs = [
  {
    q: "How long does shipping take?",
    a: "Orders are processed within 2-3 business days. Delivery typically takes 5-7 business days across Pakistan."
  },
  {
    q: "Do you offer Cash on Delivery (COD)?",
    a: "Yes, we offer Cash on Delivery for all orders within Pakistan. You only pay when you receive your package."
  },
  {
    q: "Can I return or exchange an item?",
    a: "We accept returns within 7 days of delivery if the item is unused and in original packaging. Please contact our support team to initiate a return."
  },
  {
    q: "Are your products handmade?",
    a: "Absolutely! Every item is handcrafted by skilled artisans, making each piece unique."
  },
  {
    q: "Do you take custom orders?",
    a: "Yes, we love custom projects! Reach out via WhatsApp or email with your idea, and we'll provide a quote."
  },
  {
    q: "What payment methods do you accept?",
    a: "Currently we accept Cash on Delivery. Online payments (card / bank transfer) will be added soon."
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-10 py-12 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Frequently Asked Questions</h1>
      <div className="border-t border-gray-200 mb-8"></div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggle(idx)}
              className="w-full flex justify-between items-center p-5 text-left font-medium text-gray-800 hover:bg-gray-50 transition"
            >
              <span>{faq.q}</span>
              {openIndex === idx ? (
                <ChevronUpIcon className="h-5 w-5 text-primary" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-primary" />
              )}
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-5 text-gray-600 border-t border-gray-100">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        Still have questions? <Link to="/contact" className="text-primary hover:underline">Contact us</Link> directly.
      </div>
    </div>
  );
};

export default FAQPage;