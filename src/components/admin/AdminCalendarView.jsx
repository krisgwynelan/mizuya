import React, { useState } from 'react';
import { toDateStr, isWeekend, isHoliday } from '../../data/bookingStore.js';
import styles from '../../styles/admin/AdminCalendarView.module.css';

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const AdminCalendarView = ({ bookings, blockedDates, onToggleBlock }) => {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // No cancelled filter — deleted bookings are already gone from the array
  const bookedSet = new Set(
    bookings.flatMap(b => {
      const dates = [];
      let cur = new Date(b.checkIn + 'T00:00:00');
      const end = new Date((b.checkOut || b.checkIn) + 'T00:00:00');
      while (cur <= end) {
        dates.push(toDateStr(cur.getFullYear(), cur.getMonth(), cur.getDate()));
        cur.setDate(cur.getDate() + 1);
      }
      return dates;
    })
  );

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={prevMonth} type="button">&#8249;</button>
        <h2 className={styles.monthTitle}>{MONTHS[viewMonth]} {viewYear}</h2>
        <button className={styles.navBtn} onClick={nextMonth} type="button">&#8250;</button>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}><span className={styles.dotBooked} /> Guest Booked</span>
        <span className={styles.legendItem}><span className={styles.dotBlocked} /> Admin Blocked</span>
        <span className={styles.legendItem}><span className={styles.dotWE} /> Weekend/Holiday</span>
        <span className={styles.legendItem}><span className={styles.dotFree} /> Available</span>
      </div>

      <div className={styles.dayHeaders}>
        {DAYS.map(d => <div key={d} className={styles.dayLabel}>{d}</div>)}
      </div>

      <div className={styles.grid}>
        {cells.map((day, i) => {
          if (!day) return <div key={'e-' + i} />;

          const dateStr       = toDateStr(viewYear, viewMonth, day);
          const isPast        = dateStr < todayStr;
          const isGuestBooked = bookedSet.has(dateStr);
          const isAdminBlocked = blockedDates.has(dateStr);
          const isWE          = isWeekend(dateStr);
          const isHol         = isHoliday(dateStr);
          const isToday       = dateStr === todayStr;

          let cellClass = styles.cell;
          if (isPast)            cellClass += ' ' + styles.past;
          else if (isGuestBooked)  cellClass += ' ' + styles.booked;
          else if (isAdminBlocked) cellClass += ' ' + styles.blocked;
          else if (isWE || isHol)  cellClass += ' ' + styles.weekend;
          else                     cellClass += ' ' + styles.free;
          if (isToday)           cellClass += ' ' + styles.today;

          return (
            <div
              key={dateStr}
              className={cellClass}
              onClick={() => !isPast && !isGuestBooked && onToggleBlock(dateStr)}
              title={
                isGuestBooked
                  ? 'Guest booking'
                  : isAdminBlocked
                  ? 'Click to unblock'
                  : !isPast
                  ? 'Click to block'
                  : ''
              }
            >
              <span className={styles.dayNum}>{day}</span>
              {isGuestBooked   && <span className={styles.cellTag}>booked</span>}
              {isAdminBlocked  && <span className={styles.cellTag}>blocked</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminCalendarView;