import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import jsQR from 'jsqr';
import api from '../services/api';

// QR Code Scanner component using getUserMedia
const QrCodeScanner = ({ onScanResult }: { onScanResult: (result: string) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false); // 使用 ref 來避免狀態更新時序問題
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    // 頁面載入時不自動啟動攝像頭，讓用戶手動啟動
    setDebugInfo('📱 準備就緒，點擊"開始掃描"來啟動攝像頭');
    
    // 清理函數：頁面卸載時關閉攝像頭
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      setDebugInfo('正在啟動攝像頭...');
      console.log('Starting camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // 使用後置攝像頭
      });
      
      streamRef.current = stream; // 儲存stream引用
      console.log('Camera stream obtained');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // 等待video準備好再開始掃描
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          setDebugInfo('攝像頭已啟動，開始掃描...');
          
          // 直接啟動掃描，使用和強制按鈕相同的邏輯
          console.log('Starting scan from normal flow');
          isScanningRef.current = true;
          setIsScanning(true);
          startScanning();
        };
        
        await videoRef.current.play();
        console.log('Video play started');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('無法訪問攝像頭，請檢查權限設置');
      setDebugInfo(`❌ 攝像頭啟動失敗: ${err}`);
    }
  };

  // 新增獨立的掃描啟動函數
  const startScanning = () => {
    console.log('startScanning called');
    
    // 清除舊的間隔
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    // 確保攝像頭和元素都存在
    if (!videoRef.current || !canvasRef.current) {
      console.log('Missing video or canvas elements');
      setDebugInfo('❌ 缺少 video 或 canvas 元素');
      return;
    }
    
    // 使用 setInterval 替代 setTimeout 遞歸
    scanIntervalRef.current = window.setInterval(() => {
      scanQRCode();
    }, 100);
    
    console.log('Scan interval started:', scanIntervalRef.current);
    setDebugInfo('🔍 開始掃描循環...');
  };

  const stopCamera = () => {
    console.log('stopCamera called');
    
    // 停止掃描間隔
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    // 停止所有攝像頭tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    // 清除video元素的srcObject
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    isScanningRef.current = false;
    setIsScanning(false);
    setDebugInfo('攝像頭已停止');
  };

  const scanQRCode = () => {
    console.log('scanQRCode called, isScanningRef.current:', isScanningRef.current, 'isScanning state:', isScanning);
    
    // 詳細檢查每個條件
    if (!videoRef.current) {
      setDebugInfo('❌ Video 元素不存在');
      console.log('Video element missing');
      return;
    }
    
    if (!canvasRef.current) {
      setDebugInfo('❌ Canvas 元素不存在');
      console.log('Canvas element missing');
      return;
    }
    
    // 使用 ref 來檢查掃描狀態，避免狀態更新時序問題
    if (!isScanningRef.current) {
      setDebugInfo('⏸️ 掃描已停止');
      console.log('Scanning stopped, isScanningRef.current:', isScanningRef.current);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      setDebugInfo('❌ 無法獲取 Canvas context');
      return;
    }

    // 檢查video是否準備好
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      setDebugInfo(`⏳ Video 未準備好 (readyState: ${video.readyState})`);
      return;
    }

    try {
      // 設置canvas尺寸
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (canvas.width === 0 || canvas.height === 0) {
        setDebugInfo(`⏳ Video 尺寸為 0 (${canvas.width}x${canvas.height})`);
        return;
      }

      // 繪製video畫面到canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 獲取圖像數據
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      setDebugInfo(`🔍 正在掃描... (${canvas.width}x${canvas.height})`);
      
      // 使用 jsQR 解析 QR Code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        console.log('QR Code 掃描成功:', code.data);
        setDebugInfo(`✅ 掃描成功: ${code.data}`);
        
        // 停止掃描
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }
        isScanningRef.current = false;
        setIsScanning(false);
        
        onScanResult(code.data);
        return;
      }

      // 不需要手動遞歸，由 setInterval 管理

    } catch (err) {
      console.error('QR 掃描錯誤:', err);
      setDebugInfo(`❌ 掃描錯誤: ${err}`);
    }
  };

  // 模擬掃描結果的測試按鈕
  const simulateQRScan = () => {
    // 模擬用戶ID - 在實際應用中這會從QR碼中獲取
    const mockUserId = "676d123456789abcdef00000";
    setDebugInfo(`🧪 測試掃描: ${mockUserId}`);
    onScanResult(mockUserId);
  };

  // 手動輸入用戶ID
  const handleManualInput = () => {
    if (manualInput.trim()) {
      setDebugInfo(`✍️ 手動輸入: ${manualInput.trim()}`);
      onScanResult(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <div className="relative">
      <div className="bg-black rounded-lg overflow-hidden mb-4 relative">
        <video
          ref={videoRef}
          className="w-full h-64 object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* 掃描框疊加層 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* 半透明遮罩 */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          {/* 中央透明掃描區域 */}
          <div className="relative z-10">
            <div className="w-48 h-48 border-2 border-white rounded-lg relative bg-transparent">
              {/* 四角指示器 */}
              <div className="absolute -top-1 -left-1 w-6 h-6">
                <div className="w-full h-1 bg-blue-400 rounded"></div>
                <div className="w-1 h-full bg-blue-400 rounded"></div>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6">
                <div className="w-full h-1 bg-blue-400 rounded"></div>
                <div className="w-1 h-full bg-blue-400 rounded absolute top-0 right-0"></div>
              </div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6">
                <div className="w-1 h-full bg-blue-400 rounded absolute bottom-0"></div>
                <div className="w-full h-1 bg-blue-400 rounded absolute bottom-0"></div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6">
                <div className="w-1 h-full bg-blue-400 rounded absolute bottom-0 right-0"></div>
                <div className="w-full h-1 bg-blue-400 rounded absolute bottom-0"></div>
              </div>
              
              {/* 掃描線動畫 */}
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div className="w-full h-0.5 bg-blue-400 animate-pulse absolute top-1/2 transform -translate-y-1/2"></div>
              </div>
            </div>
          </div>
          
          {/* 創建掃描區域的透明窗口 */}
          <div 
            className="absolute w-48 h-48 z-20"
            style={{
              background: 'transparent',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)'
            }}
          ></div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="text-center text-gray-600 mb-4">
        將 QR Code 對準掃描框進行掃描
      </div>

      {/* Debug 信息 */}
      {debugInfo && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded mb-4 text-sm">
          <strong>Debug:</strong> {debugInfo}
        </div>
      )}

      {/* 手動輸入區域 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          手動輸入用戶 ID (Debug 用)
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="輸入用戶 ID..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleManualInput}
            disabled={!manualInput.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            提交
          </button>
        </div>
      </div>

      {/* 測試按鈕 - 開發用 */}
      <div className="space-y-2 mb-2">
        <button
          onClick={simulateQRScan}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg text-sm"
        >
          🧪 測試掃描 (開發用)
        </button>
        
        <button
          onClick={() => window.open('/qr-test', '_blank')}
          className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-purple-600"
        >
          📱 打開 QR Code 生成器
        </button>
        
        <button
          onClick={() => {
            console.log('Force start scanning - checking camera state');
            if (streamRef.current && videoRef.current && canvasRef.current) {
              console.log('Camera already available, starting scan directly');
              isScanningRef.current = true;
              setIsScanning(true);
              startScanning();
            } else {
              console.log('No camera, starting camera first');
              startCamera();
            }
          }}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-orange-600"
        >
          🔧 強制啟動 (Debug)
        </button>
      </div>

      <button
        onClick={() => {
          console.log('Main button clicked, isScanning:', isScanning);
          if (isScanning) {
            console.log('Stopping camera');
            stopCamera();
          } else {
            console.log('Starting camera');
            startCamera();
          }
        }}
        className={`w-full py-2 px-4 rounded-lg ${
          isScanning 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isScanning ? '🛑 停止掃描' : '📷 開始掃描'}
      </button>

      {/* 額外的狀態信息 */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        {isScanning ? '掃描中...' : '點擊開始掃描'}
      </div>
    </div>
  );
};

// 用戶資訊顯示組件 - 票券風格設計
const UserInfo = ({ userResult, onCheckIn, event }: { 
  userResult: any; 
  onCheckIn: () => void;
  event: any;
}) => {
  const { user, eventParticipation, tickets } = userResult;
  const isJoined = eventParticipation?.joined;
  const hasCheckedIn = eventParticipation?.checkin_at;
  const ticket = tickets && tickets.length > 0 ? tickets[0] : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    };
    
    return {
      date: date.toLocaleDateString('en-US', options),
      time: date.toLocaleTimeString('en-US', timeOptions)
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* 票券主體 */}
      <div className="bg-gradient-to-br from-[#133366] to-[#1e4a7a] p-6 rounded-t-3xl">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          
          {/* Name */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1 font-medium">Name</div>
            <div className="text-xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </div>
          </div>

          {/* Event */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1 font-medium">Event</div>
            <div className="text-base text-gray-900 font-semibold">
              {event?.title || 'Event Title'}
            </div>
          </div>

          {/* Ticket */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1 font-medium">Ticket</div>
            <div className="text-base text-gray-900 font-semibold">
              {ticket ? `${ticket.ticket_name} - HK$ ${ticket.cost}` : 'Standard Ticket'}
            </div>
          </div>

          {/* Date & Venue */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-1 font-medium">Date</div>
              <div className="text-sm text-gray-900">
                {event?.date ? (() => {
                  const { date, time } = formatDate(event.date);
                  return (
                    <>
                      <div>{date}</div>
                      <div>{time}</div>
                    </>
                  );
                })() : (
                  <>
                    <div>Event Date</div>
                    <div>Time</div>
                  </>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1 font-medium">Venue</div>
              <div className="text-sm text-gray-900">
                {event?.location || 'Event Venue'}
              </div>
            </div>
          </div>

          {/* 虛線分割 */}
          <div className="border-t border-dashed border-gray-300 my-6"></div>

          {/* Order number */}
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1 font-medium">Order number</div>
            <div className="text-base text-gray-900 font-mono">
              #{eventParticipation?.event_ticket || 'N/A'}
            </div>
          </div>

          {/* Organiser */}
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1 font-medium">Organiser</div>
            <div className="text-base text-gray-900">
              {event?.organizer || user.first_name + ' ' + user.last_name}
            </div>
          </div>

          {/* Status & Remarks */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1 font-medium">Status</div>
            <div className="text-sm">
              {!isJoined ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  ❌ 未註冊此活動
                </span>
              ) : hasCheckedIn ? (
                <div className="space-y-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ 已簽到
                  </span>
                  <div className="text-xs text-gray-600">
                    簽到時間: {new Date(eventParticipation.checkin_at).toLocaleString()}
                  </div>
                  {eventParticipation.status && (
                    <div className="text-xs text-gray-600">
                      狀態: {eventParticipation.status}
                    </div>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⏳ 已註冊，尚未簽到
                </span>
              )}
            </div>
          </div>

          {/* Remarks section */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2 font-medium">Remarks</div>
            <div className="bg-gray-50 rounded-lg p-3 min-h-[60px] text-sm text-gray-600">
              {eventParticipation?.joined_at && (
                <div>註冊時間: {new Date(eventParticipation.joined_at).toLocaleString()}</div>
              )}
              {user.email && (
                <div>聯絡信箱: {user.email}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Check-in 按鈕 */}
      <div className="bg-gradient-to-br from-[#133366] to-[#1e4a7a] px-6 pb-6 rounded-b-3xl">
        {!isJoined ? (
          <div className="w-full bg-red-600 text-white font-bold py-4 px-6 rounded-2xl text-center text-lg">
            ❌ 未註冊此活動
          </div>
        ) : hasCheckedIn ? (
          <div className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-2xl text-center text-lg">
            ✓ 已完成簽到
          </div>
        ) : (
          <button
            onClick={onCheckIn}
            className="w-full bg-[#133366] hover:bg-[#0f2a54] text-white font-bold py-4 px-6 rounded-2xl transition-colors text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={false}
          >
            📝 立即簽到
          </button>
        )}
      </div>

      {/* 票券邊緣裝飾 */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3">
        <div className="w-6 h-6 bg-[#F0F2F5] rounded-full"></div>
      </div>
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3">
        <div className="w-6 h-6 bg-[#F0F2F5] rounded-full"></div>
      </div>
    </motion.div>
  );
};

const QrCheckIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;
  const eventId = location.state?.eventId || event?._id;

  const [userResult, setUserResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  // 監聽頁面離開事件，確保攝像頭被關閉
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 這裡會在頁面卸載時執行，但可能來不及執行完整的清理
      // 主要的清理還是依賴組件的 useEffect cleanup
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 處理QR碼掃描結果
  const handleScanResult = async (userId: string) => {
    if (!eventId) {
      setError('活動 ID 不存在');
      return;
    }

    setLoading(true);
    setError('');
    setUserResult(null);

    try {
      console.log('Checking user participation:', { userId, eventId });
      
      const response = await api.get(`/event-tickets/user/${userId}/event/${eventId}`);
      console.log('API Response:', response.data);
      
      setUserResult(response.data);
    } catch (err: any) {
      console.error('API Error:', err);
      if (err.response?.status === 404) {
        setError('找不到用戶或活動資訊');
      } else {
        setError('檢查用戶資訊失敗，請重試');
      }
    } finally {
      setLoading(false);
    }
  };

  // 處理簽到
  const handleCheckIn = async () => {
    if (!userResult?.user?._id || !eventId) {
      setError('缺少必要的用戶或活動信息');
      return;
    }

    setCheckingIn(true);
    setError('');
    
    try {
      console.log('Starting check-in for user:', userResult.user._id, 'event:', eventId);
      
      // 調用真實的簽到 API
      const response = await api.post(`/event-guests/${userResult.user._id}/checkin/${eventId}`);
      
      console.log('Check-in API response:', response.data);
      
      if (response.data.success) {
        // 成功簽到，更新本地狀態
        setUserResult({
          ...userResult,
          eventParticipation: {
            ...userResult.eventParticipation,
            checkin_at: response.data.data.checkin_at,
            status: response.data.data.status
          }
        });
        
        console.log('Check-in successful:', response.data.message);
      }
      
    } catch (err: any) {
      console.error('Check-in API error:', err);
      
      // 處理不同的錯誤情況
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.error === 'Already checked in') {
          // 已經簽到過了
          setUserResult({
            ...userResult,
            eventParticipation: {
              ...userResult.eventParticipation,
              checkin_at: errorData.checkin_at,
              status: 'checked_in'
            }
          });
          setError(`此用戶已於 ${new Date(errorData.checkin_at).toLocaleString()} 簽到過了`);
        } else if (errorData.error === 'No token provided') {
          // Token 問題
          setError('身份驗證失敗，請重新登入');
        } else if (errorData.error === 'Event not found') {
          // 活動不存在
          setError('找不到指定的活動');
        } else if (errorData.error === 'User not registered for this event') {
          // 用戶未註冊此活動
          setError('此用戶未註冊參加此活動');
        } else {
          // 其他錯誤
          setError(`簽到失敗: ${errorData.error || '未知錯誤'}`);
        }
      } else if (err.response?.status === 401) {
        // 未授權
        setError('身份驗證失敗，請重新登入');
      } else if (err.response?.status === 404) {
        // 未找到
        setError('活動或用戶不存在');
      } else {
        // 網路或其他錯誤
        setError('網路錯誤，請檢查連接後重試');
      }

    } finally {
      setCheckingIn(false);
    }
  };

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
          <button
            onClick={() => navigate(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl text-[#133366]"
          >
            ←
          </button>
          <span className="flex-1 text-center text-lg font-bold text-[#133366]">
            QR Code Check In
          </span>
        </div>

        {/* Event Info */}
        {event && (
          <div className="px-4 mt-4 mb-4">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="font-semibold text-[#133366] text-lg mb-1">
                {event.title}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                {event.date ? new Date(event.date).toLocaleString() : ''}
              </div>
              <div className="text-sm text-gray-600">
                {event.location}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 px-4">
          {!userResult ? (
            /* QR Scanner Section */
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-bold text-[#133366] mb-4 text-center">
                掃描參加者 QR Code
              </h3>
              
              <QrCodeScanner onScanResult={handleScanResult} />
              
              {loading && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#133366]"></div>
                  <p className="mt-2 text-gray-600">檢查用戶資訊中...</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-4">
                  {error}
                </div>
              )}
            </div>
          ) : (
            /* User Info Section */
            <div>
              <UserInfo 
                userResult={userResult} 
                onCheckIn={handleCheckIn}
                event={event}
              />
              
              {checkingIn && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#133366]"></div>
                  <p className="mt-2 text-gray-600">正在處理簽到...</p>
                </div>
              )}
              
              {/* 顯示簽到相關的錯誤信息 */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-4">
                  {error}
                </div>
              )}
              
              <button
                onClick={() => {
                  setUserResult(null);
                  setError('');
                }}
                className="w-full mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
              >
                掃描下一位參加者
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QrCheckIn;
