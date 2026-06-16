import React from 'react';
import styles from '../../styles/admin/StatCard.module.css';

const StatCard = ({ icon, label, value, sub, accent }) => (
  <div className={`${styles.card} ${accent ? styles[accent] : ''}`}>
    <div className={styles.iconWrap}>{icon}</div>
    <div className={styles.body}>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
      {sub && <div className={styles.sub}>{sub}</div>}
    </div>
  </div>
);

export default StatCard;