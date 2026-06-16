import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar.jsx';
import StatCard from './StatCard.jsx';
import BookingsTable from './BookingsTable.jsx';
import AdminCalendarView from './AdminCalendarView.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import useBookingStore from '../../data/useBookingStore.js';
import styles from '../../styles/admin/AdminDashboard.module.css';

const AdminDashboard = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { bookings, blockedDates, togglePaid, cancelBooking, editBooking, toggleBlockDate } = useBookingStore();

  const [modal, setModal] = useState({
    isOpen: false, type: 'warning', title: '', message: '', onConfirm: null,
  });

  const openModal = ({ type, title, message, onConfirm }) =>
    setModal({ isOpen: true, type, title, message, onConfirm });
  const closeModal = () =>
    setModal(prev => ({ ...prev, isOpen: false, onConfirm: null }));
  const handleModalConfirm = () => {
    if (modal.onConfirm) modal.onConfirm();
    closeModal();
  };

  const handleLogoutClick = () => {
    openModal({
      type:    'warning',
      title:   'Sign Out?',
      message: 'You will be logged out of the admin portal. Any unsaved changes will remain in localStorage.',
      onConfirm: onLogout,
    });
  };

  const active       = bookings.filter(b => b.status !== 'cancelled');
  const totalRevenue = active.reduce((s, b) => s + (b.total || 0), 0);
  const paidRevenue  = active.filter(b => b.paid).reduce((s, b) => s + (b.total || 0), 0);
  const paidCount    = active.filter(b => b.paid).length;
  const unpaidCount  = active.filter(b => !b.paid).length;
  const todayStr     = new Date().toISOString().slice(0, 10);
  const upcoming     = active
    .filter(b => b.checkIn >= todayStr)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 5);

  return (
    <>
      <ConfirmModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={handleModalConfirm}
        onCancel={closeModal}
      />

      <div className={styles.layout}>
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          adminEmail={admin.email}
          onLogout={handleLogoutClick}
        />

        <main className={styles.main}>
          <div className={styles.topBar}>
            <div>
              <h1 className={styles.pageTitle}>
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'bookings'  && 'All Bookings'}
                {activeTab === 'calendar'  && 'Booking Calendar'}
                {activeTab === 'blocked'   && 'Blocked Dates'}
              </h1>
              <p className={styles.pageDate}>
                {new Date().toLocaleDateString('en-PH', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* ── DASHBOARD ── display only, no actions */}
          {activeTab === 'dashboard' && (
            <div className={styles.content}>
              <div className={styles.statsGrid}>
                <StatCard icon="📋" label="Total Bookings"
                  value={active.length}
                  sub={`${bookings.filter(b => b.status === 'cancelled').length} cancelled`}
                  accent="crimson" />
                <StatCard icon="💰" label="Total Revenue"
                  value={`₱${totalRevenue.toLocaleString()}`}
                  sub="all active bookings" accent="gold" />
                <StatCard icon="✓" label="Paid"
                  value={paidCount}
                  sub={`₱${paidRevenue.toLocaleString()} collected`} accent="teal" />
                <StatCard icon="⏳" label="Awaiting Payment"
                  value={unpaidCount} sub="need follow-up" />
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Upcoming Arrivals</h2>
                  <button className={styles.seeAllBtn}
                    onClick={() => setActiveTab('bookings')} type="button">
                    See all →
                  </button>
                </div>
                <div className={styles.upcomingList}>
                  {upcoming.length === 0
                    ? <p className={styles.emptyNote}>No upcoming arrivals.</p>
                    : upcoming.map(b => {
                        const contact      = b.guestContact || '';
                        const isMessenger  = b.contactMethod === 'messenger';
                        const messengerUrl = contact
                          ? (contact.startsWith('http') ? contact : `https://${contact}`)
                          : null;
                        return (
                          <div key={b.id} className={styles.upcomingCard}>
                            <div className={styles.upcomingRoom}>{b.room?.icon || '📋'}</div>
                            <div className={styles.upcomingInfo}>
                              <div className={styles.upcomingName}>{b.guestName}</div>
                              <div className={styles.upcomingMeta}>
                                {b.room?.name} · {b.guests} pax
                              </div>
                            </div>
                            <div className={styles.upcomingDate}>
                              <div className={styles.upcomingDateVal}>
                                {new Date(b.checkIn + 'T00:00:00').toLocaleDateString('en-PH', {
                                  month: 'short', day: 'numeric',
                                })}
                              </div>
                              <div className={styles.upcomingDateSub}>Check-in</div>
                            </div>
                            {isMessenger && messengerUrl && (
                              <a href={messengerUrl} target="_blank" rel="noopener noreferrer"
                                className={styles.messengerBtnSmall}>
                                💬 Messenger
                              </a>
                            )}
                            <span className={`${styles.paidPill} ${b.paid ? styles.paidPillYes : styles.paidPillNo}`}>
                              {b.paid ? 'Paid' : 'Unpaid'}
                            </span>
                            {/* ── NO cancel button here — manage in Bookings tab ── */}
                          </div>
                        );
                      })}
                </div>
              </div>

              <div className={styles.twoCol}>
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Revenue Breakdown</h2>
                  <div className={styles.revenueBar}>
                    <div className={styles.revenueBarFill}
                      style={{ width: totalRevenue > 0 ? `${(paidRevenue / totalRevenue) * 100}%` : '0%' }} />
                  </div>
                  <div className={styles.revenueLegend}>
                    <span className={styles.revenuePaid}>₱{paidRevenue.toLocaleString()} paid</span>
                    <span className={styles.revenueUnpaid}>₱{(totalRevenue - paidRevenue).toLocaleString()} pending</span>
                  </div>
                </div>
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Quick Actions</h2>
                  <div className={styles.quickActions}>
                    <button className={styles.qaBtn} onClick={() => setActiveTab('bookings')} type="button">📋 View All Bookings</button>
                    <button className={styles.qaBtn} onClick={() => setActiveTab('blocked')} type="button">🚫 Manage Blocked Dates</button>
                    <button className={styles.qaBtn} onClick={() => setActiveTab('calendar')} type="button">📅 View Calendar</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── BOOKINGS TABLE ── all actions here */}
          {activeTab === 'bookings' && (
            <div className={styles.content}>
              <BookingsTable
                bookings={bookings}
                onTogglePaid={togglePaid}
                onCancelBooking={cancelBooking}
                onEditBooking={editBooking}
              />
            </div>
          )}

          {/* ── CALENDAR ── */}
          {activeTab === 'calendar' && (
            <div className={styles.content}>
              <p className={styles.calNote}>🌸 Red = guest booked · Gray = admin blocked</p>
              <AdminCalendarView bookings={bookings} blockedDates={blockedDates} onToggleBlock={toggleBlockDate} />
            </div>
          )}

          {/* ── BLOCKED DATES ── */}
          {activeTab === 'blocked' && (
            <div className={styles.content}>
              <p className={styles.calNote}>🚫 Click a date to block/unblock it.</p>
              <AdminCalendarView bookings={bookings} blockedDates={blockedDates} onToggleBlock={toggleBlockDate} />
              <div className={styles.blockedList}>
                <h3 className={styles.blockedTitle}>Blocked Dates ({blockedDates.size})</h3>
                <div className={styles.blockedTags}>
                  {[...blockedDates].sort().map(d => (
                    <span key={d} className={styles.blockedTag}>
                      {d}
                      <button className={styles.removeTag} onClick={() => toggleBlockDate(d)} type="button">×</button>
                    </span>
                  ))}
                  {blockedDates.size === 0 && <p className={styles.emptyNote}>No dates blocked.</p>}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;