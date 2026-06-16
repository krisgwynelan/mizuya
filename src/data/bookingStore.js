// ─────────────────────────────────────────────────────────────────────────────
//  src/data/bookingStore.js  —  Firebase Firestore version
//  Drop-in replacement for the localStorage version.
//  All function signatures are identical so no other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase.js';

// ── Firestore collection references ─────────────────────────────────────────
const BOOKINGS_COL    = 'bookings';
const BLOCKED_DOC_REF = { col: 'meta', id: 'blockedDates' }; // single document

// ── Philippine public holidays (same as before) ──────────────────────────────
export const HOLIDAYS = new Set([
  '2026-06-12', '2026-08-21', '2026-08-31',
  '2026-11-01', '2026-11-02', '2026-11-30',
  '2026-12-08', '2026-12-25', '2026-12-30', '2026-12-31',
]);

// ── In-memory cache (mirrors Firestore; kept so synchronous getters still work)
let _bookings  = [];
let _blocked   = new Set();
let _listeners = [];

const notify = () => _listeners.forEach(fn => fn());

// ── Firestore real-time subscriptions ────────────────────────────────────────
//    Call initStore() once at app startup (useBookingStore does this).

export const initStore = () => {
  // 1. Listen to bookings collection
  const unsubBookings = onSnapshot(
    collection(db, BOOKINGS_COL),
    (snapshot) => {
      _bookings = snapshot.docs.map(d => ({ ...d.data(), _firestoreId: d.id }));
      notify();
    },
    (err) => console.error('[bookingStore] bookings listener error:', err),
  );

  // 2. Listen to blocked-dates meta document
  const blockedRef = doc(db, BLOCKED_DOC_REF.col, BLOCKED_DOC_REF.id);
  const unsubBlocked = onSnapshot(
    blockedRef,
    (snap) => {
      _blocked = snap.exists() ? new Set(snap.data().dates || []) : new Set();
      notify();
    },
    (err) => console.error('[bookingStore] blocked listener error:', err),
  );

  // Return a single unsubscribe function
  return () => { unsubBookings(); unsubBlocked(); };
};

// ── Subscription (used by useBookingStore hook) ───────────────────────────────
export const subscribe = (fn) => {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
};

// ── Synchronous getters (safe to call anytime; return cached data) ────────────
export const getBookings     = () => _bookings;
export const getBlockedDates = () => _blocked;

export const getGuestBookedDates = () => {
  const dates = new Set();
  _bookings.forEach(b => {
    let cur = new Date(b.checkIn + 'T00:00:00');
    const end = new Date((b.checkOut || b.checkIn) + 'T00:00:00');
    while (cur <= end) {
      dates.add(toDateStr(cur.getFullYear(), cur.getMonth(), cur.getDate()));
      cur.setDate(cur.getDate() + 1);
    }
  });
  return dates;
};

export const getUnavailableDates = () =>
  new Set([..._blocked, ...getGuestBookedDates()]);

// ── Write operations (async — fire-and-forget is fine for UI) ────────────────

export const addBooking = async (booking) => {
  try {
    // Use booking.id (ref code) as the Firestore document ID so it stays stable
    await setDoc(doc(db, BOOKINGS_COL, booking.id), booking);
  } catch (err) {
    console.error('[bookingStore] addBooking error:', err);
  }
};

export const togglePaid = async (id) => {
  // Find the booking in cache first so we know the current paid value
  const b = _bookings.find(x => x.id === id);
  if (!b) return;
  try {
    await updateDoc(doc(db, BOOKINGS_COL, id), { paid: !b.paid });
  } catch (err) {
    console.error('[bookingStore] togglePaid error:', err);
  }
};

export const cancelBooking = async (id) => {
  try {
    await deleteDoc(doc(db, BOOKINGS_COL, id));
  } catch (err) {
    console.error('[bookingStore] cancelBooking error:', err);
  }
};

export const editBooking = async (updatedBooking) => {
  const { _firestoreId, ...data } = updatedBooking; // strip internal field
  try {
    await updateDoc(doc(db, BOOKINGS_COL, updatedBooking.id), data);
  } catch (err) {
    console.error('[bookingStore] editBooking error:', err);
  }
};

export const toggleBlockDate = async (dateStr) => {
  const next = new Set(_blocked);
  next.has(dateStr) ? next.delete(dateStr) : next.add(dateStr);
  const blockedRef = doc(db, BLOCKED_DOC_REF.col, BLOCKED_DOC_REF.id);
  try {
    await setDoc(blockedRef, { dates: [...next] }, { merge: true });
  } catch (err) {
    console.error('[bookingStore] toggleBlockDate error:', err);
  }
};

// ── Pure helpers (unchanged) ──────────────────────────────────────────────────
export const isWeekend = (dateStr) => {
  const day = new Date(dateStr + 'T00:00:00').getDay();
  return day === 0 || day === 5 || day === 6;
};

export const isHoliday  = (dateStr) => HOLIDAYS.has(dateStr);
export const isBooked   = (dateStr) => getUnavailableDates().has(dateStr);

export const toDateStr = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });
};

export const diffDays = (start, end) => {
  if (!start || !end) return 0;
  return Math.round(
    (new Date(end + 'T00:00:00') - new Date(start + 'T00:00:00')) / 86400000,
  );
};

export const genRefCode = () =>
  'MZY-' + Math.random().toString(36).substr(2, 6).toUpperCase();