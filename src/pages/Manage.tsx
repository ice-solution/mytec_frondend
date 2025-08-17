import { useState } from 'react';
import { motion } from 'framer-motion';

const mockEvents = [
  {
    id: 1,
    title: 'Flexible Workspace Formula',
    date: 'Tuesday, August 8 2024',
    location: 'The Executive Centre (TEC)',
    img: 'https://images.unsplash.com/photo-1514361892635-cebb9b6c7ca5?auto=format&fit=crop&w=400&q=80',
    type: 'upcoming',
  },
  // 可再加 past event
];

const Manage = () => {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const events = mockEvents.filter(e => e.type === tab);

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
          <span className="flex-1 text-center text-lg font-bold text-[#133366]">My Event</span>
        </div>
        {/* Tabs */}
        <div className="flex justify-center mt-6 mb-4 border-b border-gray-200">
          <button
            className={`px-6 pb-2 font-bold text-base ${tab === 'upcoming' ? 'text-[#133366] border-b-2 border-[#D1A65E]' : 'text-gray-400'}`}
            onClick={() => setTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`px-6 pb-2 font-bold text-base ${tab === 'past' ? 'text-[#133366] border-b-2 border-[#D1A65E]' : 'text-gray-400'}`}
            onClick={() => setTab('past')}
          >
            Past
          </button>
        </div>
        {/* Event Card List */}
        <div className="px-4">
          {events.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">No events</div>
          ) : (
            events.map(event => (
              <div key={event.id} className="bg-white rounded-2xl shadow flex items-center p-4 mb-4">
                <img src={event.img} alt="Event" className="w-20 h-20 object-cover rounded-lg mr-4" />
                <div>
                  <div className="font-semibold text-[#133366] text-base mb-1">{event.title}</div>
                  <div className="text-sm text-gray-600 flex items-center mb-1">
                    <span className="mr-1">📅</span> {event.date}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <span className="mr-1">📍</span> {event.location}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Create Event Button */}
        <div className="flex justify-center mt-4 mb-8">
          <button className="flex items-center px-6 py-3 rounded-full bg-[#133366] text-white font-bold text-base shadow-lg">
            <span className="text-xl mr-2">＋</span> Create Event
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Manage; 