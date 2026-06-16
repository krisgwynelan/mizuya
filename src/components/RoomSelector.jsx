import React from 'react';
import styles from '../styles/RoomSelector.module.css';

const INCLUSIONS = [
  { icon: '🏡', label: 'Exclusive use of the resort' },
  { icon: '🛏️', label: 'Villa Rooms' },
  { icon: '📶', label: 'Wi-Fi' },
  { icon: '🍳', label: 'Restaurant Kitchen' },
  { icon: '🚿', label: '2 Shower and 3 Bathrooms' },
  { icon: '❄️', label: 'Hot & cold shower' },
  { icon: '💧', label: 'Water dispenser (3 free gallons)' },
  { icon: '📺', label: 'TV & speaker' },
  { icon: '🔥', label: 'Bonfire setup (2 packs firewood)' },
  { icon: '🌿', label: 'Garden at standby' },
  { icon: '🅿️', label: 'Gated parking (10–12 cars)' },
  { icon: '🛡️', label: 'Closed circuit in the area' },
];

const RoomSelector = ({ selectedRoom, onSelect }) => (
  <section className={styles.section}>
    <div className={styles.sectionLabel}>
      <span className={styles.labelLine} />
      <span className={styles.labelText}>Inclusions</span>
      <span className={styles.labelLine} />
    </div>

    <div className={styles.inclusionsGrid}>
      {INCLUSIONS.map((item, i) => (
        <div key={i} className={styles.inclusionCard}>
          <span className={styles.inclusionIcon}>{item.icon}</span>
          <span className={styles.inclusionLabel}>{item.label}</span>
        </div>
      ))}
    </div>

    <div className={styles.inclusionNote}>
      <span className={styles.noteIcon}>🌸</span>
      <p>All inclusions are available for both Day Use and Overnight bookings.</p>
    </div>
  </section>
);

export default RoomSelector;