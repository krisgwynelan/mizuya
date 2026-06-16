// ─────────────────────────────────────────────────────────────────────────────
//  src/data/useBookingStore.js  —  Firebase Firestore version
//  Drop-in replacement; same return shape as the localStorage version.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import {
  initStore,
  subscribe,
  getBookings,
  getBlockedDates,
  getUnavailableDates,
  addBooking,
  togglePaid,
  cancelBooking,
  toggleBlockDate,
  editBooking,
} from './bookingStore.js';

// ── Singleton guard — only start the Firestore listeners once ────────────────
let _storeInitialized  = false;
let _storeUnsubscribe  = null;

const ensureStoreRunning = () => {
  if (!_storeInitialized) {
    _storeUnsubscribe  = initStore();
    _storeInitialized  = true;
  }
};

// ── Hook ─────────────────────────────────────────────────────────────────────
const useBookingStore = () => {
  const [bookings,         setBookings]         = useState(getBookings());
  const [blockedDates,     setBlockedDates]     = useState(getBlockedDates());
  const [unavailableDates, setUnavailableDates] = useState(getUnavailableDates());

  useEffect(() => {
    // Start Firestore real-time listeners the very first time any component
    // mounts. Subsequent mounts just reuse the running listeners.
    ensureStoreRunning();

    // Subscribe to in-memory cache notifications (triggered by Firestore updates)
    const unsub = subscribe(() => {
      setBookings([...getBookings()]);
      setBlockedDates(new Set(getBlockedDates()));
      setUnavailableDates(new Set(getUnavailableDates()));
    });

    return unsub; // clean up this component's subscription on unmount
  }, []);

  return {
    bookings,
    blockedDates,
    unavailableDates,
    addBooking,
    togglePaid,
    cancelBooking,
    toggleBlockDate,
    editBooking,
  };
};

export default useBookingStore;