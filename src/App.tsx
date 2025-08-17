import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from './layouts/MainLayout';
import Splash from './pages/Splash';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';
import Notification from './pages/Notification';
import NotificationDetails from './pages/NotificationDetails';
import Events from './pages/Events';
import Filter from './pages/Filter';
import Manage from './pages/Manage';
import GuestList from './pages/GuestList';
import MemberCard from './pages/MemberCard';
import Search from './pages/Search';
import MyEvent from './pages/MyEvent';
import MySubscribe from './pages/MySubscribe';
import Subscribe from './pages/Subscribe';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import EventBySlug from './pages/EventBySlug';
import EventManagement from './pages/EventManagement';
import QrCheckIn from './pages/QrCheckIn';
import QrTestGenerator from './pages/QrTestGenerator';
import MyFavorites from './pages/MyFavorites';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/home" element={<Home />} /> */}
        <Route path="/event-details" element={<EventDetails />} />
        <Route path="/events/:categories/:slug" element={<EventBySlug />} />
        <Route path="/event-management" element={<EventManagement />} />
        <Route path="/qr-checkin" element={<QrCheckIn />} />
        <Route path="/qr-test" element={<QrTestGenerator />} />
        <Route path="/guest-list" element={<GuestList />} />
        {/* <Route path="/profile" element={<Profile />} /> */}
        <Route path="/notification" element={<Notification />} />
        <Route path="/notification-details" element={<NotificationDetails />} />
        <Route element={<MainLayout />}>
          <Route path="/manage" element={<Manage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/filter" element={<Filter />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/guest-list" element={<GuestList />} />
          <Route path="/member-card" element={<MemberCard />} />
          <Route path="/my-event" element={<MyEvent />} />
          <Route path="/my-subscribe" element={<MySubscribe />} />
          <Route path="/my-favorites" element={<MyFavorites />} />
          <Route path="/search" element={<Search />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
