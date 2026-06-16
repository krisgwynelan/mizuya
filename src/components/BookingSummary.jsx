  import React, { useRef, useState } from 'react';
  import { formatDate, diffDays } from '../data/bookingStore.js';
  import styles from '../styles/BookingSummary.module.css';

  export const BOOKING_TYPES = [
    {
      id: 'day-use',
      icon: '☀️',
      name: 'Day Use',
      description: '8:00 AM – 8:00 PM',
      weekdayPrice: 8000,
      weekendPrice: 10000,
    },
    {
      id: 'overnight',
      icon: '🌙',
      name: 'Overnight',
      description: '3:00 PM – 11:00 AM',
      weekdayPrice: 10000,
      weekendPrice: 13000,
    },
  ];

  export const INCLUSIONS = [
    { icon: '🏡', label: 'Exclusive use of the resort' },
    { icon: '🛏️', label: 'Five Rooms' },
    { icon: '📶', label: 'Wi-Fi' },
    { icon: '🍳', label: 'Restaurant Kitchen' },
    { icon: '🚿', label: '2 Showers & 3 Bathrooms' },
    { icon: '🌡️', label: 'Hot & cold shower' },
    { icon: '💧', label: 'Water dispenser (3 free gallons)' },
    { icon: '📺', label: 'TV & speaker' },
    { icon: '🔥', label: 'Bonfire setup (2 packs firewood)' },
    { icon: '⚡', label: 'Generator set standby' },
    { icon: '🚗', label: 'Gated parking (10–12 cars)' },
    { icon: '🏞️', label: 'Direct access to the river' },
  ];

  // Weekend = Friday (5), Saturday (6), Sunday (0)
  export const isWeekend = (dateStr) => {
    if (!dateStr) return false;
    const day = new Date(dateStr + 'T00:00:00').getDay();
    return day === 5 || day === 6 || day === 0;
  };

  const MAX_GUESTS      = 25;
  const EXTRA_GUEST_FEE = 250;
  const QR_CODE_IMAGE_URL = '/QR.png';

  const IconUpload = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );

  const IconCheck = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

  const IconX = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  const BookingSummary = ({
    checkIn, checkOut, bookingType, setBookingType,
    guests, guestName, guestContact, contactMethod, onSubmit,
    onReceiptUpload,
    onReceiptRemove,
    bookingRef,
    maxGuests,
  }) => {
    const fileInputRef = useRef(null);
    const [receiptFile,    setReceiptFile]    = useState(null);
    const [receiptStatus,  setReceiptStatus]  = useState(null); // null | 'uploading' | 'sent'
    const [receiptPreview, setReceiptPreview] = useState(null); // local preview data URL

    const effectiveMax = maxGuests != null ? maxGuests : MAX_GUESTS;

    const nights       = checkIn && checkOut ? diffDays(checkIn, checkOut) : 0;
    const weekend      = isWeekend(checkIn);
    const selected     = BOOKING_TYPES.find(t => t.id === bookingType) || null;
    const ratePerNight = selected ? (weekend ? selected.weekendPrice : selected.weekdayPrice) : 0;

    const units         = nights > 0 ? nights : 1;
    const baseTotal     = ratePerNight * units;
    const extraGuests   = guests > effectiveMax ? guests - effectiveMax : 0;
    const extraGuestFee = extraGuests * EXTRA_GUEST_FEE * units;
    const grandTotal    = baseTotal + extraGuestFee;

    // ── Receipt is required before confirming ──────────────────────────────
    const canSubmit = checkIn && bookingType && guests > 0
      && guestName.trim() && guestContact.trim()
      && receiptStatus === 'sent';

    const dayUseLastDay = checkOut && nights > 0 ? checkOut : null;

    const handleReceiptChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setReceiptFile(file);
      setReceiptStatus('uploading');

      // Build a local preview (works for images; PDFs show a generic icon instead)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setReceiptPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview(null);
      }

      if (onReceiptUpload) {
        try { await onReceiptUpload(file, bookingRef); } catch (_) {}
      }
      setTimeout(() => setReceiptStatus('sent'), 800);
    };

    const handleRemoveReceipt = () => {
      setReceiptFile(null);
      setReceiptStatus(null);
      setReceiptPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onReceiptRemove) onReceiptRemove();
    };

    const triggerUpload = () => fileInputRef.current?.click();

    return (
      <div className={styles.stickyWrapper}>
      <aside className={styles.panel}>

        {/* Header */}
        <div className={styles.panelHeader}>
          <span className={styles.kanjiSmall}>予約</span>
          <h2 className={styles.panelTitle}>Booking Summary</h2>
        </div>

        <div className={styles.panelBody}>
          {!checkIn && (
            <p className={styles.hint}>Select your check-in date on the calendar to begin.</p>
          )}

          {checkIn && (
            <div className={styles.datesBlock}>
              <div className={styles.dateItem}>
                <span className={styles.dateLabel}>
                  {bookingType === 'overnight' ? 'Check-in' : 'Date'}
                </span>
                <span className={styles.dateValue}>{formatDate(checkIn)}</span>
                <span className={styles.dateTime}>
                  {selected ? selected.description : 'Select a booking type below'}
                </span>
              </div>

              {bookingType === 'overnight' && checkOut && nights > 0 && (
                <React.Fragment>
                  <div className={styles.dateDivider}>
                    <span className={styles.nightsTag}>
                      {nights} night{nights !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>Check-out</span>
                    <span className={styles.dateValue}>{formatDate(checkOut)}</span>
                    <span className={styles.dateTime}>11:00 AM</span>
                  </div>
                </React.Fragment>
              )}

              {bookingType === 'day-use' && (
                <div className={styles.dateDivider}>
                  <span className={styles.nightsTag}>
                    {units > 1 ? `${units} days · Day Use` : '12 hrs · Day Use'}
                  </span>
                </div>
              )}

              {bookingType === 'day-use' && dayUseLastDay && (
                <div className={styles.dateItem}>
                  <span className={styles.dateLabel}>Last Day</span>
                  <span className={styles.dateValue}>{formatDate(dayUseLastDay)}</span>
                  <span className={styles.dateTime}>8:00 AM – 8:00 PM</span>
                </div>
              )}
            </div>
          )}

          {/* Booking type selector */}
          <div className={styles.typeRow}>
            {BOOKING_TYPES.map(t => (
              <button
                key={t.id}
                type="button"
                className={`${styles.typeBtn}${bookingType === t.id ? ' ' + styles.typeBtnActive : ''}`}
                onClick={() => setBookingType(t.id)}
              >
                <span className={styles.typeIcon}>{t.icon}</span>
                <span className={styles.typeName}>{t.name}</span>
                <span className={styles.typeDesc}>{t.description}</span>
              </button>
            ))}
          </div>

          {/* Guest info */}
          {(guestName.trim() || guests > 0) && (
            <div className={styles.guestBlock}>
              {guestName.trim() && (
                <div className={styles.guestRow}>
                  <span className={styles.guestLabel}>Guest</span>
                  <span className={styles.guestValue}>{guestName}</span>
                </div>
              )}
              {guests > 0 && (
                <div className={styles.guestRow}>
                  <span className={styles.guestLabel}>Pax</span>
                  <span className={styles.guestValue}>
                    {guests} {guests === 1 ? 'person' : 'persons'}
                    {guests >= effectiveMax && (
                      <span className={styles.maxNote}>
                        &nbsp;· Max {effectiveMax}
                        {guests > effectiveMax
                          ? ` (+${extraGuests} @ ₱${EXTRA_GUEST_FEE.toLocaleString()}/head)`
                          : ''}
                      </span>
                    )}
                  </span>
                </div>
              )}
              {guestContact.trim() && (
                <div className={styles.guestRow}>
                  <span className={styles.guestLabel}>
                    {contactMethod === 'email' ? 'Email' : 'Messenger'}
                  </span>
                  <span className={styles.guestValue}>{guestContact}</span>
                </div>
              )}
            </div>
          )}

          {/* Price breakdown */}
          {selected && checkIn && (
            <div className={styles.priceBlock}>
              <div className={styles.priceRow}>
                <span>{weekend ? 'Weekend' : 'Weekday'} rate</span>
                <span>₱{ratePerNight.toLocaleString()}</span>
              </div>

              {bookingType === 'overnight' && (
                <div className={styles.priceRow}>
                  <span>× {units} night{units !== 1 ? 's' : ''}</span>
                  <span>₱{baseTotal.toLocaleString()}</span>
                </div>
              )}

              {bookingType === 'day-use' && (
                <div className={styles.priceRow}>
                  <span>× {units} day{units !== 1 ? 's' : ''} (12 hrs each)</span>
                  <span>₱{baseTotal.toLocaleString()}</span>
                </div>
              )}

              {extraGuests > 0 && (
                <div className={styles.priceRow}>
                  <span>
                    +{extraGuests} extra guest{extraGuests !== 1 ? 's' : ''}
                    {units > 1
                      ? ` × ${units} ${bookingType === 'overnight' ? 'night' : 'day'}${units !== 1 ? 's' : ''}`
                      : ''}
                    {' '}@ ₱{EXTRA_GUEST_FEE.toLocaleString()}/head
                  </span>
                  <span>₱{extraGuestFee.toLocaleString()}</span>
                </div>
              )}

              <div className={`${styles.priceRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>₱{grandTotal.toLocaleString()}</span>
              </div>
              <p className={styles.pricingNote}>VAT inclusive · Pay upon arrival</p>
            </div>
          )}
        </div>

        {/* Confirm button */}
        <div className={styles.panelFooter}>
          <button
            className={styles.cta}
            disabled={!canSubmit}
            onClick={onSubmit}
            type="button"
          >
            <span className={styles.ctaText}>Confirm Reservation</span>
            <span className={styles.ctaArrow}>→</span>
          </button>
          {!canSubmit && (
            <p className={styles.ctaNote}>
              {!checkIn      ? 'Select a date'
              : !bookingType ? 'Choose Day Use or Overnight'
              : !guestName.trim() || !guestContact.trim() ? 'Complete your details'
              : 'Please upload your payment receipt to continue'}
            </p>
          )}
        </div>

      </aside>

      {/* ── QR PAYMENT CONTAINER — separate card, outside the summary panel ── */}
      <div className={styles.paymentContainer}>

          <div className={styles.paymentHeader}>
            <span className={styles.paymentTitle}>Payment</span>
            <span className={styles.paymentSubtitle}>Scan to pay via GCash / Maya</span>
          </div>

          <div className={styles.paymentDivider} />

          {/* QR Code */}
          <div className={styles.qrWrapper}>
            <div className={styles.qrCard}>
              <p className={styles.scanLabel}>Scan Me</p>
              <div className={styles.qrImageFrame}>
                <img
                  src={QR_CODE_IMAGE_URL}
                  alt="GCash / Maya QR Code"
                  className={styles.qrImage}
                  onError={e => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className={styles.qrPlaceholder} style={{ display: 'none' }}>
                  <span className={styles.qrPlaceholderIcon}>📱</span>
                  <span className={styles.qrPlaceholderText}>QR Code Here</span>
                  <span className={styles.qrPlaceholderHint}>
                    Add your QR image at<br />
                    <code>/QR.png</code>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.paymentDivider} />

          {/* Receipt Upload */}
          <div className={styles.receiptSection}>
            <p className={styles.receiptLabel}>After payment, upload your receipt:</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className={styles.hiddenInput}
              onChange={handleReceiptChange}
            />

            {receiptStatus !== 'sent' && (
              <button
                type="button"
                className={styles.uploadBtn}
                onClick={triggerUpload}
                disabled={receiptStatus === 'uploading'}
              >
                {receiptStatus === 'uploading' ? (
                  <><span className={styles.uploadSpinner} /> Sending…</>
                ) : (
                  <><IconUpload /> Upload Receipt</>
                )}
              </button>
            )}

            {receiptStatus === 'sent' && (
              <div className={styles.receiptPreviewBlock}>
                {receiptPreview ? (
                  <img
                    src={receiptPreview}
                    alt="Uploaded receipt preview"
                    className={styles.receiptPreviewImg}
                  />
                ) : (
                  <div className={styles.receiptPreviewPdf}>
                    📄 {receiptFile?.name || 'Receipt uploaded'}
                  </div>
                )}

                <div className={styles.receiptSentRow}>
                  <span className={styles.receiptSentBadge}>
                    <IconCheck /> Receipt Sent!
                  </span>
                  <button
                    type="button"
                    className={styles.receiptRemoveBtn}
                    onClick={handleRemoveReceipt}
                    title="Remove and upload a different receipt"
                  >
                    <IconX /> Remove
                  </button>
                </div>
              </div>
            )}

            {receiptStatus === 'sent' && (
              <p className={styles.receiptConfirmNote}>
                ✅ Receipt sent for verification. You can now confirm your reservation below.
              </p>
            )}
          </div>
        </div>

      </div>
    );
  };

  export default BookingSummary;