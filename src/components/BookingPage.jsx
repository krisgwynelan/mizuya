import React, { useState } from 'react';
import Calendar from './Calendar.jsx';
import RoomSelector from './RoomSelector.jsx';
import GuestForm from './GuestForm.jsx';
import BookingSummary, { BOOKING_TYPES, isWeekend } from './BookingSummary.jsx';
import useBookingStore from '../data/useBookingStore.js';
import { diffDays, genRefCode } from '../data/bookingStore.js';
import styles from '../styles/BookingPage.module.css';

const TODAY     = new Date();
const CUR_YEAR  = TODAY.getFullYear();
const CUR_MONTH = TODAY.getMonth();

const MONTHS_LABEL = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const BookingPage = ({ onConfirm }) => {
  const { unavailableDates, addBooking } = useBookingStore();

  const [checkIn,       setCheckIn]       = useState(null);
  const [checkOut,      setCheckOut]      = useState(null);
  const [hoveredDate,   setHoveredDate]   = useState(null);
  const [bookingType,   setBookingType]   = useState(null);
  const [guests,        setGuests]        = useState(1);
  const [guestName,     setGuestName]     = useState('');
  const [contactMethod, setContactMethod] = useState('email');
  const [guestContact,  setGuestContact]  = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [viewStartMonth, setViewStartMonth] = useState({ year: CUR_YEAR, month: CUR_MONTH });

  // ── Receipt state ─────────────────────────────────────────────────────
  const [receiptDataUrl, setReceiptDataUrl] = useState(null);

  const nextViewMonth = viewStartMonth.month === 11
    ? { year: viewStartMonth.year + 1, month: 0 }
    : { year: viewStartMonth.year, month: viewStartMonth.month + 1 };

  const prevMonth = () => setViewStartMonth(v =>
    v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 });
  const nextMonth = () => setViewStartMonth(v =>
    v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 });

  const handleDateClick = (dateStr) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr); setCheckOut(null);
    } else {
      if (dateStr <= checkIn) { setCheckIn(dateStr); setCheckOut(null); }
      else setCheckOut(dateStr);
    }
  };

  // ── Convert uploaded receipt file to base64 data URL ───────────────────
  const handleReceiptUpload = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptDataUrl(reader.result);
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleReceiptRemove = () => {
    setReceiptDataUrl(null);
  };

  const handleSubmit = () => {
    const nights  = diffDays(checkIn, checkOut || checkIn);
    const weekend = isWeekend(checkIn);
    const selected = BOOKING_TYPES.find(t => t.id === bookingType);
    const rate    = selected ? (weekend ? selected.weekendPrice : selected.weekdayPrice) : 0;

    const units       = nights > 0 ? nights : 1;
    const baseTotal   = rate * units;
    const effectiveMax = 50; // matches maxGuests passed to GuestForm/BookingSummary
    const extraGuests = guests > effectiveMax ? guests - effectiveMax : 0;
    const extraGuestFee = extraGuests * 250 * units;
    const total = baseTotal + extraGuestFee;

    const refCode = genRefCode();

    const newBooking = {
      id:           refCode,
      refCode,
      guestName,
      guestContact,
      contactMethod,
      checkIn,
      checkOut:     bookingType === 'overnight' ? (checkOut || checkIn) : checkIn,
      nights:       bookingType === 'overnight' ? nights : 0,
      bookingType,
      guests,
      specialRequests,
      total,
      paid:         false,
      status:       'confirmed',
      createdAt:    new Date().toISOString(),
      receipt:      receiptDataUrl, // ⭐ uploaded receipt image (base64 data URL)
      room: {
        id:    bookingType,
        name:  selected ? selected.name : bookingType,
        icon:  selected ? selected.icon : '📋',
        price: rate,
      },
    };

    addBooking(newBooking);
    onConfirm(newBooking);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.leftCol}>

          <section className={styles.section}>
            <div className={styles.sectionLabel}>
              <span className={styles.labelLine} />
              <span className={styles.labelText}>Select Your Stay</span>
              <span className={styles.labelLine} />
            </div>

            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--white)', border: '2px solid var(--mist)' }} />
                <span>Available</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--mist)' }} />
                <span>Booked</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--crimson)' }} />
                <span>Check-in</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--teal)' }} />
                <span>Check-out</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDotHighlight} />
                <span style={{ color: 'var(--crimson)' }}>Weekend / Holiday</span>
              </div>
            </div>

            <div className={styles.calNavRow}>
              <button className={styles.navBtn} onClick={prevMonth} type="button">‹</button>
              <span className={styles.calNavLabel}>
                {MONTHS_LABEL[viewStartMonth.month]} – {MONTHS_LABEL[nextViewMonth.month]} {nextViewMonth.year}
              </span>
              <button className={styles.navBtn} onClick={nextMonth} type="button">›</button>
            </div>

            <div className={styles.calendarRow}>
              <Calendar
                year={viewStartMonth.year} month={viewStartMonth.month}
                checkIn={checkIn} checkOut={checkOut} hoveredDate={hoveredDate}
                onDateClick={handleDateClick} onDateHover={setHoveredDate}
                unavailableDates={unavailableDates}
              />
              <Calendar
                year={nextViewMonth.year} month={nextViewMonth.month}
                checkIn={checkIn} checkOut={checkOut} hoveredDate={hoveredDate}
                onDateClick={handleDateClick} onDateHover={setHoveredDate}
                unavailableDates={unavailableDates}
              />
            </div>

            {checkIn && !checkOut && bookingType === 'overnight' && (
              <p className={styles.calHint}>✦ Select your check-out date</p>
            )}
            {checkIn && checkOut && (
              <p className={styles.calSuccess}>
                ✦ {diffDays(checkIn, checkOut)} nights selected!
                <button className={styles.clearBtn}
                  onClick={() => { setCheckIn(null); setCheckOut(null); }} type="button">
                  Clear dates
                </button>
              </p>
            )}
          </section>

          <RoomSelector />

          <GuestForm
            guestName={guestName}         setGuestName={setGuestName}
            guestContact={guestContact}   setGuestContact={setGuestContact}
            contactMethod={contactMethod} setContactMethod={setContactMethod}
            guests={guests}               setGuests={setGuests}
            maxGuests={50}
            specialRequests={specialRequests} setSpecialRequests={setSpecialRequests}
          />
        </div>

        <div className={styles.rightCol}>
          <BookingSummary
            checkIn={checkIn}         checkOut={checkOut}
            bookingType={bookingType} setBookingType={setBookingType}
            guests={guests}
            guestName={guestName}
            guestContact={guestContact}
            contactMethod={contactMethod}
            onSubmit={handleSubmit}
            onReceiptUpload={handleReceiptUpload}
            onReceiptRemove={handleReceiptRemove}
            maxGuests={50}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingPage;