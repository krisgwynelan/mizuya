import React from 'react';
import styles from '../../styles/admin/AdminSidebar.module.css';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '◈', label: 'Dashboard' },
  { id: 'bookings',  icon: '≡', label: 'Bookings' },
  { id: 'calendar',  icon: '◻', label: 'Calendar' },
  { id: 'blocked',   icon: '✕', label: 'Blocked Dates' },
];

const AdminSidebar = ({ activeTab, setActiveTab, adminEmail, onLogout }) => (
  <aside className={styles.sidebar}>
    <div className={styles.brand}>
      <span className={styles.kanji}>水屋</span>
      <div>
        <div className={styles.brandName}>Mizuya</div>
        <div className={styles.brandSub}>Admin Portal</div>
      </div>
    </div>

    <nav className={styles.nav}>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
          onClick={() => setActiveTab(item.id)}
          type="button"
        >
          <span className={styles.navIcon}>{item.icon}</span>
          <span className={styles.navLabel}>{item.label}</span>
          {activeTab === item.id && <span className={styles.activeBar} />}
        </button>
      ))}
    </nav>

    <div className={styles.sidebarFooter}>
      <div className={styles.adminInfo}>
        <div className={styles.adminAvatar}>管</div>
        <div>
          <div className={styles.adminEmail}>{adminEmail}</div>
          <div className={styles.adminRole}>Administrator</div>
        </div>
      </div>
      <button className={styles.logoutBtn} onClick={onLogout} type="button">
        Sign out
      </button>
    </div>
  </aside>
);

export default AdminSidebar;
