import React from 'react';
import { formatDate } from '../data/bookingStore.js';
import { BOOKING_TYPES, isWeekend } from './BookingSummary.jsx';
import styles from '../styles/ConfirmationPage.module.css';

const ConfirmationPage = ({ data, onNewBooking }) => {
  if (!data) return null;
  const {
    checkIn, checkOut, nights, bookingType, guests,
    guestName, guestContact, contactMethod,
    specialRequests, total, refCode, receipt,
  } = data;

  const selected = BOOKING_TYPES.find(t => t.id === bookingType);
  const weekend  = isWeekend(checkIn);
  const isEmail  = contactMethod === 'email';

  const contactDisplay = isEmail
    ? guestContact
    : (
      <a href={guestContact?.startsWith('http') ? guestContact : `https://${guestContact}`}
        target="_blank" rel="noopener noreferrer" className={styles.messengerLink}>
        {guestContact}
      </a>
    );

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.successBadge}>
          <div className={styles.successIcon}>✦</div>
          <span className={styles.successLabel}>Reservation Confirmed</span>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.kanji}>ありがとう</span>
            <div>
              <h1 className={styles.title}>Thank you, {guestName?.split(' ')[0]}!</h1>
              <p className={styles.subtitle}>Your stay at Mizuya Exclusive Resort has been reserved.</p>
            </div>
          </div>

          <div className={styles.refRow}>
            <span className={styles.refLabel}>Reference Code</span>
            <span className={styles.refCode}>{refCode}</span>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailBlock}>
              <span className={styles.detailLabel}>Date</span>
              <span className={styles.detailValue}>{formatDate(checkIn)}</span>
              <span className={styles.detailNote}>{selected?.description}</span>
            </div>

            {bookingType === 'overnight' && checkOut && (
              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Check-out</span>
                <span className={styles.detailValue}>{formatDate(checkOut)}</span>
                <span className={styles.detailNote}>11:00 AM · Late check-out upon request</span>
              </div>
            )}

            {bookingType === 'overnight' && nights > 0 && (
              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Duration</span>
                <span className={styles.detailValue}>{nights} night{nights !== 1 ? 's' : ''}</span>
              </div>
            )}

            <div className={styles.detailBlock}>
              <span className={styles.detailLabel}>Guests</span>
              <span className={styles.detailValue}>{guests} guest{guests !== 1 ? 's' : ''}</span>
            </div>

            <div className={`${styles.detailBlock} ${styles.fullWidth}`}>
              <span className={styles.detailLabel}>Booking Type</span>
              <span className={styles.detailValue}>
                {selected ? `${selected.icon} ${selected.name}` : bookingType}
              </span>
              <span className={styles.detailNote}>{weekend ? 'Weekend' : 'Weekday'} rate</span>
            </div>

            <div className={styles.detailBlock}>
              <span className={styles.detailLabel}>{isEmail ? 'Email' : 'Messenger'}</span>
              <span className={styles.detailValue}>{contactDisplay}</span>
            </div>

            <div className={styles.detailBlock}>
              <span className={styles.detailLabel}>Total Amount</span>
              <span className={`${styles.detailValue} ${styles.totalVal}`}>
                ₱{(total || 0).toLocaleString()}
              </span>
              <span className={styles.detailNote}>VAT inclusive · Pay upon arrival</span>
            </div>

            {specialRequests && (
              <div className={`${styles.detailBlock} ${styles.fullWidth}`}>
                <span className={styles.detailLabel}>Special Requests</span>
                <span className={styles.detailNote}>{specialRequests}</span>
              </div>
            )}
          </div>

          {receipt && (
            <div className={styles.receiptBlock}>
              <span className={styles.detailLabel}>Payment Receipt</span>
              {receipt.startsWith('data:application/pdf') ? (
                <a href={receipt} target="_blank" rel="noopener noreferrer" className={styles.receiptPdfLink}>
                  📄 View uploaded PDF receipt
                </a>
              ) : (
                <img src={receipt} alt="Payment receipt" className={styles.receiptImage} />
              )}
              <p className={styles.detailNote}>
                Your receipt has been submitted for verification.
              </p>
            </div>
          )}

          <div className={styles.notice}>
            <span className={styles.noticeIcon}>🌸</span>
            {isEmail ? (
              <p>A confirmation email will be sent to <strong>{guestContact}</strong>.
                For inquiries: <strong>reservations@mizuya.ph</strong></p>
            ) : (
              <p>Our team will reach out via Messenger at <strong>{guestContact}</strong>.
                For inquiries: <strong>reservations@mizuya.ph</strong></p>
            )}
          </div>
        </div>

        <button className={styles.newBookingBtn} onClick={onNewBooking} type="button">
          ← Make Another Reservation
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPage;