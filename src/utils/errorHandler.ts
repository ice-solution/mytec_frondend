/**
 * 友善的錯誤處理工具
 * 將 API 錯誤轉換為用戶友好的提示訊息
 */

export interface ApiError {
  error: string;
  coachEventCount?: number;
  limit?: number;
  message?: string;
}

/**
 * 處理 join event 相關的錯誤
 */
export const handleJoinEventError = (error: any): string => {
  console.error('Join event error:', error);
  
  // 檢查是否有 API 回應
  if (error.response?.data) {
    const errorData: ApiError = error.response.data;
    
    // 處理教練活動限制錯誤
    if (errorData.error === 'Member can only join up to 2 events from the same coach') {
      const currentCount = errorData.coachEventCount || 0;
      const limit = errorData.limit || 2;
      
      return `抱歉，您已經參加了 ${currentCount} 個該教練的活動，達到上限 ${limit} 個。請選擇其他教練的活動或取消已參加的活動後再試。`;
    }
    
    // 處理其他已知錯誤
    if (errorData.error === 'Event is full') {
      return '抱歉，此活動已滿員，無法加入。';
    }
    
    if (errorData.error === 'Event has ended') {
      return '抱歉，此活動已結束，無法加入。';
    }
    
    if (errorData.error === 'Already joined this event') {
      return '您已經參加了此活動。';
    }
    
    if (errorData.error === 'Event not found') {
      return '找不到指定的活動，請重新選擇。';
    }
    
    if (errorData.error === 'User not found') {
      return '用戶資訊錯誤，請重新登入。';
    }
    
    // 如果有自定義訊息，使用它
    if (errorData.message) {
      return errorData.message;
    }
    
    // 如果有錯誤描述，使用它
    if (errorData.error) {
      return `加入活動失敗：${errorData.error}`;
    }
  }
  
  // 處理 HTTP 狀態碼錯誤
  if (error.response?.status === 401) {
    return '身份驗證失敗，請重新登入。';
  }
  
  if (error.response?.status === 403) {
    return '您沒有權限參加此活動。';
  }
  
  if (error.response?.status === 404) {
    return '找不到指定的活動或用戶。';
  }
  
  if (error.response?.status === 409) {
    return '您已經參加了此活動或達到參加限制。';
  }
  
  if (error.response?.status >= 500) {
    return '伺服器錯誤，請稍後再試。';
  }
  
  // 處理網路錯誤
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return '網路連接錯誤，請檢查網路連接後重試。';
  }
  
  // 處理超時錯誤
  if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
    return '請求超時，請稍後再試。';
  }
  
  // 預設錯誤訊息
  return '加入活動失敗，請稍後再試。如有問題，請聯繫客服。';
};

/**
 * 處理一般 API 錯誤
 */
export const handleApiError = (error: any, defaultMessage: string = '操作失敗'): string => {
  console.error('API error:', error);
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return defaultMessage;
};

/**
 * 顯示錯誤提示的通用函數
 */
export const showErrorToast = (message: string, _duration: number = 5000) => {
  // 這裡可以整合 toast 通知庫，如 react-hot-toast 或 react-toastify
  // 目前先使用 alert，後續可以替換為更好的 UI 組件
  alert(message);
};

/**
 * 檢查是否為教練活動限制錯誤
 */
export const isCoachEventLimitError = (error: any): boolean => {
  return error.response?.data?.error === 'Member can only join up to 2 events from the same coach';
};

/**
 * 獲取教練活動限制錯誤的詳細資訊
 */
export const getCoachEventLimitInfo = (error: any): { currentCount: number; limit: number } | null => {
  if (!isCoachEventLimitError(error)) {
    return null;
  }
  
  const errorData = error.response.data;
  return {
    currentCount: errorData.coachEventCount || 0,
    limit: errorData.limit || 2
  };
};
