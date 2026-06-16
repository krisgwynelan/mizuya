import React, { useState } from 'react';
import Header from './components/Header.jsx';
import BookingPage from './components/BookingPage.jsx';
import ConfirmationPage from './components/ConfirmationPage.jsx';
import AdminLogin from './components/admin/AdminLogin.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import styles from './styles/App.module.css';

const ADMIN_SESSION_KEY = 'mizuya_admin_session';

const getRoute = () => window.location.hash === '#/admin' ? 'admin' : 'guest';

// Load saved admin session (survives refresh, clears on tab close)
const loadAdminSession = () => {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
};

const App = () => {
  const [route,       setRoute]       = useState(getRoute);
  const [bookingData, setBookingData] = useState(null);
  const [step,        setStep]        = useState('booking');
  const [adminUser,   setAdminUser]   = useState(loadAdminSession);  // ← restored on refresh

  React.useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const handleLogin = (user) => {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user)); // ← save on login
    setAdminUser(user);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);                    // ← clear on logout
    setAdminUser(null);
    window.location.hash = '';
  };

  const handleConfirm    = (data) => { setBookingData(data); setStep('confirmed'); };
  const handleNewBooking = ()     => { setBookingData(null); setStep('booking');   };

  if (route === 'admin') {
    if (!adminUser) return <AdminLogin onLogin={handleLogin} />;     // ← use handleLogin
    return <AdminDashboard admin={adminUser} onLogout={handleLogout} />;
  }

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        {step === 'booking'   && <BookingPage onConfirm={handleConfirm} />}
        {step === 'confirmed' && <ConfirmationPage data={bookingData} onNewBooking={handleNewBooking} />}
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerLogo}>水屋</span>
          <p>© 2026 Mizuya Exclusive Resort · Bukidnon, Philippines</p>
          <p>Check-in: 2:00 PM · Check-out: 12:00 NN</p>
        </div>
      </footer>
    </div>
  );
};

export default App;