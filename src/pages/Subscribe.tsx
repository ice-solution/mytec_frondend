import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const Subscribe = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;
  const eventId = event?._id;
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    if (!eventId) {
      navigate(-1);
      return;
    }
    const fetchTickets = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/event-tickets/event/${eventId}`);
        setTickets(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setError('載入失敗');
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [eventId, navigate]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      <div className="bg-white rounded-b-2xl shadow px-4 py-4 flex items-center">
        <button className="mr-2" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} className="text-2xl text-[#133366]" />
        </button>
        <span className="text-lg font-bold text-[#133366] mx-auto">Select Ticket</span>
      </div>
      {/* 活動資訊 */}
      {event && (
        <div className="px-4 mt-4 mb-2">
          <div className="bg-white rounded-xl shadow p-4 flex flex-col">
            <div className="font-semibold text-[#133366] text-lg mb-1">{event.title}</div>
            <div className="text-sm text-gray-600 mb-1">{event.date ? new Date(event.date).toLocaleString() : ''}</div>
            <div className="text-sm text-gray-600 mb-1">{event.location}</div>
            {event.event_img && (
              <img src={`${API_URL}${event.event_img}`} alt="Event" className="w-full h-32 object-cover rounded-lg mt-2" />
            )}
          </div>
        </div>
      )}
      <div className="px-4 mt-2">
        <h2 className="text-xl font-bold text-[#133366]">Please select a ticket:</h2>
        {loading ? (
          <div className="text-center text-gray-400 mt-8">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-400 mt-8">{error}</div>
        ) : tickets.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">No tickets available</div>
        ) : (
          tickets.map((ticket: any) => (
            <div
              key={ticket._id || ticket.id}
              className="bg-white rounded-xl shadow mb-4 p-4 flex flex-col cursor-pointer hover:bg-[#e6eff8] transition"
              onClick={() => navigate('/checkout', { state: { event, ticket } })}
            >
              <div className="font-semibold text-[#133366] text-base mb-1">{ticket.ticket_name}</div>
              <div className="text-sm text-gray-600">$ {ticket.cost !== 0 ? ticket.cost : 'Free'}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Subscribe; 