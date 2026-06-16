import React, { useState } from 'react';
import { formatDate } from '../../data/bookingStore.js';
import ConfirmModal from './ConfirmModal.jsx';
import styles from '../../styles/admin/BookingsTable.module.css';

const STATUS_COLORS = {
  confirmed: styles.statusConfirmed,
  pending:   styles.statusPending,
};

// ── SVG Icons ────────────────────────────────────────────────────────────────
const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const IconMessenger = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconReceipt = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 1V2z"/>
    <line x1="8" y1="7" x2="16" y2="7"/>
    <line x1="8" y1="11" x2="16" y2="11"/>
    <line x1="8" y1="15" x2="13" y2="15"/>
  </svg>
);

/* ─── Receipt Modal ──────────────────────────────────────────────────────── */
const ReceiptModal = ({ booking, onClose, onMarkPaid }) => {
  if (!booking) return null;
  const receipt = booking.receipt;

  return (
    <div className={styles.editOverlay} onClick={onClose}>
      <div className={styles.receiptModal} onClick={e => e.stopPropagation()}>
        <div className={styles.editHeader}>
          <h2 className={styles.editTitle}>Payment Receipt</h2>
          <span className={styles.editRef}>{booking.id}</span>
        </div>
        <div className={styles.receiptModalBody}>
          {!receipt ? (
            <p className={styles.noReceiptText}>No receipt uploaded for this booking.</p>
          ) : receipt.startsWith('data:application/pdf') ? (
            <a href={receipt} target="_blank" rel="noopener noreferrer" className={styles.receiptPdfLink}>
              📄 Open PDF receipt in new tab
            </a>
          ) : (
            <img src={receipt} alt="Payment receipt" className={styles.receiptModalImage} />
          )}
        </div>
        <div className={styles.editFooter}>
          <button className={styles.editCancelBtn} onClick={onClose} type="button">Close</button>
          {receipt && !booking.paid && (
            <button className={styles.editSaveBtn} onClick={() => { onMarkPaid(booking.id); onClose(); }} type="button">
              Mark as Paid
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Edit Modal ─────────────────────────────────────────────────────────── */
const EditModal = ({ booking, onSave, onClose }) => {
  const [form, setForm] = useState({
    guestName:       booking.guestName       || '',
    guestContact:    booking.guestContact    || '',
    checkIn:         booking.checkIn         || '',
    checkOut:        booking.checkOut        || '',
    guests:          booking.guests          || 1,
    total:           booking.total           || 0,
    paid:            booking.paid            || false,
    specialRequests: booking.specialRequests || '',
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.guestName.trim())   e.guestName = 'Name is required.';
    if (!form.checkIn)            e.checkIn   = 'Check-in date is required.';
    if (form.checkOut && form.checkOut < form.checkIn)
                                  e.checkOut  = 'Check-out must be after check-in.';
    if (form.guests < 1)          e.guests    = 'At least 1 guest.';
    if (form.total < 0)           e.total     = 'Total cannot be negative.';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const nights = form.checkIn && form.checkOut
      ? Math.max(0, Math.round(
          (new Date(form.checkOut) - new Date(form.checkIn)) / 86400000
        ))
      : booking.nights || 0;

    onSave({ ...booking, ...form, guests: Number(form.guests), total: Number(form.total), nights });
  };

  return (
    <div className={styles.editOverlay} onClick={onClose}>
      <div className={styles.editModal} onClick={e => e.stopPropagation()}>
        <div className={styles.editHeader}>
          <h2 className={styles.editTitle}>Edit Booking</h2>
          <span className={styles.editRef}>{booking.id}</span>
        </div>

        <div className={styles.editBody}>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Guest Name</label>
            <input
              className={`${styles.editInput} ${errors.guestName ? styles.inputError : ''}`}
              value={form.guestName}
              onChange={e => set('guestName', e.target.value)}
            />
            {errors.guestName && <span className={styles.editError}>{errors.guestName}</span>}
          </div>

          <div className={styles.editField}>
            <label className={styles.editLabel}>Contact / Messenger URL</label>
            <input
              className={styles.editInput}
              value={form.guestContact}
              onChange={e => set('guestContact', e.target.value)}
            />
          </div>

          <div className={styles.editRow}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Check-in</label>
              <input
                type="date"
                className={`${styles.editInput} ${errors.checkIn ? styles.inputError : ''}`}
                value={form.checkIn}
                onChange={e => set('checkIn', e.target.value)}
              />
              {errors.checkIn && <span className={styles.editError}>{errors.checkIn}</span>}
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Check-out</label>
              <input
                type="date"
                className={`${styles.editInput} ${errors.checkOut ? styles.inputError : ''}`}
                value={form.checkOut}
                onChange={e => set('checkOut', e.target.value)}
              />
              {errors.checkOut && <span className={styles.editError}>{errors.checkOut}</span>}
            </div>
          </div>

          <div className={styles.editRow}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Guests (pax)</label>
              <input
                type="number" min="1"
                className={`${styles.editInput} ${errors.guests ? styles.inputError : ''}`}
                value={form.guests}
                onChange={e => set('guests', e.target.value)}
              />
              {errors.guests && <span className={styles.editError}>{errors.guests}</span>}
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Total (PHP)</label>
              <input
                type="number" min="0"
                className={`${styles.editInput} ${errors.total ? styles.inputError : ''}`}
                value={form.total}
                onChange={e => set('total', e.target.value)}
              />
              {errors.total && <span className={styles.editError}>{errors.total}</span>}
            </div>
          </div>

          <div className={styles.editField}>
            <label className={styles.editLabel}>Payment Status</label>
            <div className={styles.editToggleRow}>
              <button
                type="button"
                className={`${styles.editToggleBtn} ${form.paid ? styles.togglePaid : ''}`}
                onClick={() => set('paid', true)}
              >
                Paid
              </button>
              <button
                type="button"
                className={`${styles.editToggleBtn} ${!form.paid ? styles.toggleUnpaid : ''}`}
                onClick={() => set('paid', false)}
              >
                Unpaid
              </button>
            </div>
          </div>

          <div className={styles.editField}>
            <label className={styles.editLabel}>Special Requests</label>
            <textarea
              className={styles.editTextarea}
              rows={3}
              value={form.specialRequests}
              onChange={e => set('specialRequests', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.editFooter}>
          <button className={styles.editCancelBtn} onClick={onClose} type="button">Cancel</button>
          <button className={styles.editSaveBtn} onClick={handleSave} type="button">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

/* ─── BookingsTable ──────────────────────────────────────────────────────── */
const BookingsTable = ({ bookings, onTogglePaid, onCancelBooking, onEditBooking }) => {
  const [filter,        setFilter]       = useState('all');
  const [search,        setSearch]       = useState('');
  const [expandedId,    setExpandedId]   = useState(null);
  const [editTarget,    setEditTarget]   = useState(null);
  const [receiptTarget, setReceiptTarget] = useState(null);

  const [modal, setModal] = useState({
    isOpen: false, type: 'warning', title: '', message: '', onConfirm: null,
  });

  const openModal = ({ type, title, message, onConfirm }) =>
    setModal({ isOpen: true, type, title, message, onConfirm });
  const closeModal = () =>
    setModal(prev => ({ ...prev, isOpen: false, onConfirm: null }));
  const handleModalConfirm = () => {
    if (modal.onConfirm) modal.onConfirm();
    closeModal();
  };

  const handleDeleteClick = (b) => {
    openModal({
      type:    'cancel',
      title:   'Delete Booking?',
      message: `Permanently delete the booking of ${b.guestName} (${b.id})? This cannot be undone.`,
      onConfirm: () => {
        if (expandedId === b.id) setExpandedId(null);
        onCancelBooking(b.id);
      },
    });
  };

  const handlePaidClick = (b) => {
    openModal({
      type:    b.paid ? 'warning' : 'edit',
      title:   b.paid ? 'Mark as Unpaid?' : 'Mark as Paid?',
      message: b.paid
        ? `This will mark ${b.guestName}'s booking as unpaid. You can change this anytime.`
        : `This will mark ${b.guestName}'s booking (PHP ${b.total.toLocaleString()}) as paid. Please confirm.`,
      onConfirm: () => onTogglePaid(b.id),
    });
  };

  const handleEditClick  = (b) => setEditTarget(b);

  const handleEditSave = (updated) => {
    openModal({
      type:    'edit',
      title:   'Save Changes?',
      message: `Save changes to ${updated.guestName}'s booking (${updated.id})?`,
      onConfirm: () => {
        onEditBooking(updated);
        setEditTarget(null);
      },
    });
  };

  const handleMarkPaidFromReceipt = (id) => {
    onTogglePaid(id);
  };

  const FILTERS = ['all', 'confirmed', 'paid', 'unpaid'];

  const filtered = bookings.filter(b => {
    const matchFilter =
      filter === 'all' ||
      (filter === 'paid'      &&  b.paid) ||
      (filter === 'unpaid'    && !b.paid) ||
      (filter === 'confirmed' && b.status === 'confirmed');
    const contact = b.guestContact || '';
    const matchSearch = !search ||
      b.guestName.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      contact.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <React.Fragment>
      <ConfirmModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={handleModalConfirm}
        onCancel={closeModal}
      />

      {editTarget && (
        <EditModal
          booking={editTarget}
          onSave={handleEditSave}
          onClose={() => setEditTarget(null)}
        />
      )}

      {receiptTarget && (
        <ReceiptModal
          booking={receiptTarget}
          onClose={() => setReceiptTarget(null)}
          onMarkPaid={handleMarkPaidFromReceipt}
        />
      )}

      <div className={styles.wrapper}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            {FILTERS.map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                onClick={() => setFilter(f)}
                type="button"
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <input
            className={styles.search}
            type="text"
            placeholder="Search name, contact, ref code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span>🌸</span>
            <p>No bookings found.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ref Code</th>
                  <th>Guest</th>
                  <th>Type</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Nights</th>
                  <th>Total</th>
                  <th>Receipt</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const contact      = b.guestContact || '';
                  const isMessenger  = b.contactMethod === 'messenger';
                  const messengerUrl = contact
                    ? (contact.startsWith('http') ? contact : 'https://' + contact)
                    : null;
                  const needsVerification = !!b.receipt && !b.paid;

                  return (
                    <React.Fragment key={b.id}>
                      <tr
                        className={styles.row}
                        onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                      >
                        <td><span className={styles.refCode}>{b.id}</span></td>
                        <td>
                          <div className={styles.guestName}>{b.guestName}</div>
                          <div className={styles.guestEmail}>
                            {isMessenger
                              ? <span className={styles.messengerTag}>Messenger</span>
                              : contact}
                          </div>
                        </td>
                        <td>
                          <span className={styles.roomTag}>
                            {b.room ? b.room.icon : ''} {b.room ? b.room.name : ''}
                          </span>
                        </td>
                        <td className={styles.date}>{formatDate(b.checkIn)}</td>
                        <td className={styles.date}>{b.checkOut ? formatDate(b.checkOut) : '-'}</td>
                        <td className={styles.center}>{b.nights > 0 ? b.nights + 'N' : '-'}</td>
                        <td className={styles.total}>PHP {(b.total || 0).toLocaleString()}</td>

                        <td onClick={e => e.stopPropagation()} className={styles.center}>
                          {b.receipt ? (
                            <button
                              className={`${styles.iconBtn} ${needsVerification ? styles.iconBtnPending : ''}`}
                              onClick={() => setReceiptTarget(b)}
                              type="button"
                              title={needsVerification ? 'Receipt uploaded — needs verification' : 'View payment receipt'}
                            >
                              <IconReceipt />
                            </button>
                          ) : (
                            <span className={styles.noReceiptDash}>—</span>
                          )}
                        </td>

                        <td onClick={e => e.stopPropagation()}>
                          <button
                            className={`${styles.paidBtn} ${b.paid ? styles.paidYes : (needsVerification ? styles.paidPending : styles.paidNo)}`}
                            onClick={() => handlePaidClick(b)}
                            type="button"
                            title={needsVerification ? 'Receipt received — click to confirm payment' : 'Click to change payment status'}
                          >
                            {b.paid ? 'Paid' : (needsVerification ? 'Verify Payment' : 'Unpaid')}
                          </button>
                        </td>

                        <td>
                          <span className={`${styles.statusBadge} ${STATUS_COLORS[b.status] || ''}`}>
                            {b.status}
                          </span>
                        </td>

                        <td onClick={e => e.stopPropagation()}>
                          <div className={styles.actionGroup}>
                            <button
                              className={styles.iconBtn}
                              onClick={() => handleEditClick(b)}
                              type="button"
                              title="Edit booking"
                            >
                              <IconEdit />
                            </button>

                            {isMessenger && messengerUrl ? (
                              <a
                                href={messengerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.iconBtnLink}
                                title="Open Messenger"
                              >
                                <IconMessenger />
                              </a>
                            ) : null}

                            <button
                              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                              onClick={() => handleDeleteClick(b)}
                              type="button"
                              title="Delete booking"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedId === b.id ? (
                        <tr className={styles.expandedRow}>
                          <td colSpan={11}>
                            <div className={styles.expandedContent}>
                              <div className={styles.expandedItem}>
                                <span className={styles.expandLabel}>Guests</span>
                                <span>{b.guests} pax</span>
                              </div>
                              <div className={styles.expandedItem}>
                                <span className={styles.expandLabel}>Contact</span>
                                <span>
                                  {isMessenger && messengerUrl ? (
                                    <a
                                      href={messengerUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={styles.messengerLink}
                                    >
                                      {contact}
                                    </a>
                                  ) : contact}
                                </span>
                              </div>
                              <div className={styles.expandedItem}>
                                <span className={styles.expandLabel}>Booked On</span>
                                <span>{new Date(b.createdAt).toLocaleString('en-PH')}</span>
                              </div>
                              <div className={styles.expandedItem}>
                                <span className={styles.expandLabel}>Special Requests</span>
                                <span>{b.specialRequests ? b.specialRequests : 'None'}</span>
                              </div>
                              {b.receipt && (
                                <div className={`${styles.expandedItem} ${styles.expandedReceiptItem}`}>
                                  <span className={styles.expandLabel}>Receipt</span>
                                  {b.receipt.startsWith('data:application/pdf') ? (
                                    <a href={b.receipt} target="_blank" rel="noopener noreferrer" className={styles.messengerLink}>
                                      📄 View PDF receipt
                                    </a>
                                  ) : (
                                    <img
                                      src={b.receipt}
                                      alt="Receipt"
                                      className={styles.expandedReceiptThumb}
                                      onClick={() => setReceiptTarget(b)}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.tableFooter}>
          Showing {filtered.length} of {bookings.length} bookings
        </div>
      </div>
    </React.Fragment>
  );
};

export default BookingsTable;