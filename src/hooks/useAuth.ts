import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = (requireAuth: boolean = false, redirectTo: string = '/login', showPrompt: boolean = false) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const authenticated = !!token;
      setIsAuthenticated(authenticated);

      if (requireAuth && !authenticated) {
        setShowLoginModal(true);
        // 延遲重定向，讓用戶看到提示訊息
        setTimeout(() => {
          navigate(redirectTo);
        }, 2000);
      } else if (showPrompt && !authenticated) {
        // 只顯示提示，不強制重定向
        setShowLoginModal(true);
      }
    };

    checkAuth();
  }, [requireAuth, redirectTo, navigate, showPrompt]);

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate(redirectTo);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  return {
    isAuthenticated,
    showLoginModal,
    handleLoginRedirect,
    handleCloseModal
  };
};
