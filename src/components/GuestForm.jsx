import React from 'react';
import styles from '../styles/GuestForm.module.css';

const GuestForm = ({
  guestName, setGuestName,
  guestContact, setGuestContact,
  contactMethod, setContactMethod,
  guests, setGuests,
  maxGuests,
  specialRequests, setSpecialRequests
}) => {
  return (
    <section className={styles.section}>
      <div className={styles.sectionLabel}>
        <span className={styles.labelLine} />
        <span className={styles.labelText}>Your Details</span>
        <span className={styles.labelLine} />
      </div>

      <div className={styles.grid}>

        {/* Full Name — left col */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="guest-name">Full Name</label>
          <input
            id="guest-name"
            className={styles.input}
            type="text"
            placeholder="e.g. Maria Santos"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
        </div>

        {/* Number of Guests — right col */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="guest-count">Number of Guests</label>
          <div className={styles.guestCounter}>
            <button
              type="button"
              className={styles.counterBtn}
              onClick={() => setGuests(Math.max(1, guests - 1))}
            >−</button>
            <span className={styles.counterVal}>{guests}</span>
            <button
              type="button"
              className={styles.counterBtn}
              onClick={() => setGuests(Math.min(maxGuests || 5, guests + 1))}
            >+</button>
            {maxGuests && (
              <span className={styles.maxNote}>Max {maxGuests}</span>
            )}
          </div>
        </div>

        {/* Contact Method toggle + input — full width, stacked */}
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label className={styles.label}>Contact Method</label>
          <div className={styles.toggleGroup}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${contactMethod === 'email' ? styles.toggleActive : ''}`}
              onClick={() => { setContactMethod('email'); setGuestContact(''); }}
            >
              ✉ Email
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${contactMethod === 'messenger' ? styles.toggleActive : ''}`}
              onClick={() => { setContactMethod('messenger'); setGuestContact(''); }}
            >
              ✦ Messenger
            </button>
          </div>
        </div>

        <div className={`${styles.field} ${styles.fullWidth}`}>
          {contactMethod === 'email' ? (
            <>
              <label className={styles.label} htmlFor="guest-email">Email Address</label>
              <input
                id="guest-email"
                className={styles.input}
                type="email"
                placeholder="e.g. maria@example.com"
                value={guestContact}
                onChange={(e) => setGuestContact(e.target.value)}
              />
            </>
          ) : (
            <>
              <label className={styles.label} htmlFor="guest-messenger">Facebook Profile Link</label>
              <input
                id="guest-messenger"
                className={styles.input}
                type="url"
                placeholder="e.g. fb.com/mariasantos"
                value={guestContact}
                onChange={(e) => setGuestContact(e.target.value)}
              />
              <span className={styles.inputHint}>Enter your full Facebook profile URL</span>
            </>
          )}
        </div>

        {/* Special Requests — full width */}
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label className={styles.label} htmlFor="special">
            Special Requests <span className={styles.optional}>(optional)</span>
          </label>
          <textarea
            id="special"
            className={styles.textarea}
            placeholder="Dietary needs, room preferences, celebrations, etc."
            rows={3}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
          />
        </div>

      </div>
    </section>
  );
};

export default GuestForm;