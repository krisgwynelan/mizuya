import React, { useEffect, useRef } from 'react';
import styles from '../styles/Header.module.css';

const SakuraPetal = ({ style }) => (
  <div className={styles.petal} style={style} />
);

const Header = () => {
  const petalsRef = useRef([]);
  const NUM_PETALS = 12;

  const petals = Array.from({ length: NUM_PETALS }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 8}s`,
    animationDuration: `${6 + Math.random() * 6}s`,
    size: `${10 + Math.random() * 14}px`,
    opacity: 0.4 + Math.random() * 0.4,
  }));

  return (
    <header className={styles.header}>
      <div className={styles.petalsContainer}>
        {petals.map((p) => (
          <SakuraPetal
            key={p.id}
            style={{
              left: p.left,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      <div className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.kanji}>水屋</div>
        <div className={styles.dividerLine}>
          <span className={styles.dividerDot} />
          <span className={styles.dividerDot} />
          <span className={styles.dividerDot} />
        </div>
        <h1 className={styles.title}>Mizuya Exclusive Resort</h1>
        <p className={styles.subtitle}>Bukidnon, Philippines · Est. 2026</p>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>Check-in 3:00 PM</span>
          <span className={styles.badgeDivider}>·</span>
          <span className={styles.badge}>Check-out 11:00 AM</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
