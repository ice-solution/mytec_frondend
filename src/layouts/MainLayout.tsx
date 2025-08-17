
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import FooterNav from '../components/FooterNav';

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5]">
      <div className="flex-grow relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-30%', opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="absolute w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
      <FooterNav />
    </div>
  );
};

export default MainLayout;