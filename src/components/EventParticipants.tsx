import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

interface Participant {
  _id: string;
  user: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
  };
  joined_at: string;
  status: string;
}

interface EventParticipantsProps {
  eventId: string;
  totalParticipants?: number;
}

const EventParticipants = ({ eventId, totalParticipants = 0 }: EventParticipantsProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [previewLoading, setPreviewLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchParticipants = async () => {
    if (!eventId) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/event-guests/event/${eventId}`);
      console.log('Participants response:', response.data);
      
      let participantData = [];
      
      // 處理不同的 API 回應格式
      if (Array.isArray(response.data)) {
        participantData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        participantData = response.data.data;
      } else if (response.data.guests && Array.isArray(response.data.guests)) {
        participantData = response.data.guests;
      }
      
      setParticipants(participantData);
    } catch (err) {
      console.error('Failed to fetch participants:', err);
      setError('載入參加者列表失敗');
    } finally {
      setLoading(false);
    }
  };

  // 載入預覽數據
  useEffect(() => {
    if (eventId) {
      setPreviewLoading(true);
      fetchParticipants().finally(() => setPreviewLoading(false));
    }
  }, [eventId]);

  // 當打開 modal 時重新載入數據
  useEffect(() => {
    if (showModal) {
      fetchParticipants();
    }
  }, [showModal]);

  const handleShowAll = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // 顯示前5個參加者的頭像
  const displayParticipants = participants.slice(0, 5);
  const actualTotal = participants.length;

  return (
    <>
      {/* Participants Preview */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <h3 className="text-lg font-bold text-[#133366] mb-3">Who's going</h3>
        <div className="flex items-center">
          {previewLoading ? (
            <div className="flex items-center justify-center w-full py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#133366]"></div>
              <span className="ml-2 text-gray-500 text-sm">載入中...</span>
            </div>
          ) : (
            <>
              {/* Avatar List */}
              <div className="flex -space-x-2">
                {displayParticipants.map((participant, index) => (
                  <div key={participant._id} className="relative">
                    {participant.user.avatar ? (
                      <img
                        src={`${API_URL}${participant.user.avatar}`}
                        alt={`${participant.user.first_name} ${participant.user.last_name}`}
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-[#133366] flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {`${participant.user.first_name?.[0] || ''}${participant.user.last_name?.[0] || ''}`.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Count Text */}
              <div className="ml-4 flex-1">
                <span className="text-gray-500 text-sm">
                  {actualTotal > 0 ? `+${actualTotal} people joined` : 'No participants yet'}
                </span>
              </div>

              {/* View All Button */}
              {actualTotal > 0 && (
                <button
                  onClick={handleShowAll}
                  className="text-[#133366] hover:text-[#002e5d] text-sm font-medium transition-colors"
                >
                  查看全部
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#133366]">
                Who's going ({actualTotal})
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="text-center text-gray-500 py-8">載入中...</div>
              ) : error ? (
                <div className="text-center text-red-500 py-8">{error}</div>
              ) : participants.length === 0 ? (
                <div className="text-center text-gray-500 py-8">暫無參加者</div>
              ) : (
                <div className="space-y-4">
                  {participants.map((participant) => (
                    <div key={participant._id} className="flex items-center space-x-3">
                      {/* Avatar */}
                      {participant.user.avatar ? (
                        <img
                          src={`${API_URL}${participant.user.avatar}`}
                          alt={`${participant.user.first_name} ${participant.user.last_name}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#133366] flex items-center justify-center">
                          <span className="text-white font-medium">
                            {`${participant.user.first_name?.[0] || ''}${participant.user.last_name?.[0] || ''}`.toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* User Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#133366]">
                          {`${participant.user.first_name || ''} ${participant.user.last_name || ''}`.trim() || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-500">Member</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventParticipants;
