import React from 'react';
import styles from '../../styles/admin/ConfirmModal.module.css';

const ConfirmModal = ({ isOpen, type, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const icons = {
    cancel:  { emoji: '🚫', color: styles.typeDanger },
    delete:  { emoji: '🗑️', color: styles.typeDanger },
    edit:    { emoji: '✏️', color: styles.typeInfo    },
    warning: { emoji: '⚠️', color: styles.typeWarning },
  };

  const { emoji, color } = icons[type] || icons.warning;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Icon */}
        <div className={`${styles.iconWrap} ${color}`}>
          <span className={styles.iconEmoji}>{emoji}</span>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel} type="button">
            Go Back
          </button>
          <button
            className={`${styles.confirmBtn} ${color}`}
            onClick={onConfirm}
            type="button"
          >
            Yes, Proceed
          </button>
        </div>

        {/* Close X */}
        <button className={styles.closeBtn} onClick={onCancel} type="button">×</button>
      </div>
    </div>
  );
};

export default ConfirmModal;