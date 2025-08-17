import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

const QrTestGenerator = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [userId, setUserId] = useState('676d123456789abcdef00000');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const generateQRCode = async () => {
    try {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, userId, {
          width: 300,
          margin: 2,
        });
        
        // 也生成 Data URL 用於顯示
        const dataUrl = await QRCode.toDataURL(userId, {
          width: 300,
          margin: 2,
        });
        setQrCodeDataUrl(dataUrl);
      }
    } catch (err) {
      console.error('生成 QR Code 失敗:', err);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [userId]);

  const testUserIds = [
    '676d123456789abcdef00000',
    '676d123456789abcdef00001', 
    '676d123456789abcdef00002',
    '675e234567890bcdef12345',
    '674f345678901cdef234567',
  ];

  return (
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
          QR Code 測試生成器
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        <div className="bg-white rounded-xl shadow p-6">
          
          {/* 說明 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#133366] mb-2">測試說明</h3>
            <p className="text-sm text-gray-600 mb-2">
              1. 選擇或輸入一個用戶 ID
            </p>
            <p className="text-sm text-gray-600 mb-2">
              2. 生成對應的 QR Code
            </p>
            <p className="text-sm text-gray-600 mb-2">
              3. 用另一台設備掃描這個 QR Code 來測試掃描功能
            </p>
          </div>

          {/* 用戶 ID 輸入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用戶 ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="輸入用戶 ID..."
            />
          </div>

          {/* 預設測試 ID */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              或選擇測試 ID
            </label>
            <div className="grid grid-cols-1 gap-2">
              {testUserIds.map((id) => (
                <button
                  key={id}
                  onClick={() => setUserId(id)}
                  className={`px-3 py-2 text-left text-sm rounded-md border ${
                    userId === id
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          {/* QR Code 顯示 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              生成的 QR Code
            </label>
            <div className="flex justify-center">
              <div className="bg-white p-4 border border-gray-300 rounded-lg">
                <canvas ref={canvasRef} style={{ display: 'block' }} />
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="space-y-3">
            <button
              onClick={generateQRCode}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
            >
              重新生成 QR Code
            </button>
            
            <button
              onClick={() => navigate('/qr-checkin')}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
            >
              前往掃描頁面測試
            </button>

            {qrCodeDataUrl && (
              <a
                href={qrCodeDataUrl}
                download={`qr-code-${userId}.png`}
                className="block w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-center"
              >
                下載 QR Code 圖片
              </a>
            )}
          </div>

          {/* 使用提示 */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 使用提示</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• 可以將 QR Code 顯示在另一台設備上進行掃描測試</li>
              <li>• 或者下載圖片並在其他地方顯示</li>
              <li>• 確保 QR Code 清晰且有足夠的對比度</li>
              <li>• 掃描時保持適當的距離和角度</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrTestGenerator;
