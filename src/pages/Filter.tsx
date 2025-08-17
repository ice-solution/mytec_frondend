import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Filter = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-b-2xl shadow px-4 py-4 flex items-center relative">
          <button onClick={() => navigate(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl text-[#133366]">←</button>
          <span className="flex-1 text-center text-lg font-bold text-[#133366]">Filters</span>
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-[#133366]/60">Clear all</button>
        </div>
        {/* Filter Content */}
        <div className="flex-1 px-4 py-4 space-y-6">
          {/* Categories */}
          <div>
            <div className="font-bold text-[#133366] mb-2">Categories</div>
            <div className="flex flex-wrap gap-2">
              {['Music', 'Wine', 'Food & Drink', 'Arts', 'Business', 'Community'].map(cat => (
                <button key={cat} className="bg-[#e6eff8] text-[#133366] px-4 py-2 rounded-full">{cat}</button>
              ))}
            </div>
          </div>
          {/* Event Type */}
          <div>
            <div className="font-bold text-[#133366] mb-2">Event Type</div>
            <div className="flex flex-wrap gap-2">
              {['Conference', 'Seminar', 'Expo', 'Festival', 'Convention'].map(type => (
                <button key={type} className="bg-[#e6eff8] text-[#133366] px-4 py-2 rounded-full">{type}</button>
              ))}
            </div>
          </div>
          {/* Languages */}
          <div>
            <div className="font-bold text-[#133366] mb-2">Languages</div>
            <div className="flex flex-wrap gap-2">
              {['English', 'Cantonese', 'Putonghua'].map(lang => (
                <button key={lang} className="bg-[#e6eff8] text-[#133366] px-4 py-2 rounded-full">{lang}</button>
              ))}
            </div>
          </div>
          {/* Price */}
          <div>
            <div className="font-bold text-[#133366] mb-2">Price</div>
            <label className="flex items-center space-x-2">
              <span>Free events</span>
              <input type="checkbox" className="form-checkbox rounded" />
            </label>
          </div>
          {/* Apply Filter */}
          <button
            className="w-full py-3 rounded-full border border-[#133366] text-[#133366] text-lg font-semibold mt-6"
            onClick={() => navigate(-1)}
          >
            Apply Filter
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Filter;