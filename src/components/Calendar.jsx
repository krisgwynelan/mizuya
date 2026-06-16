import React from 'react';
import { isWeekend, isHoliday, toDateStr } from '../data/bookingStore.js';
import styles from '../styles/Calendar.module.css';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const Calendar = ({
  year, month, checkIn, checkOut,
  onDateClick, hoveredDate, onDateHover,
  unavailableDates,
}) => {
  const _unavailable = unavailableDates || new Set();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isInRange = (dateStr) => {
    if (!checkIn) return false;
    const end = checkOut || hoveredDate;
    if (!end) return false;
    return dateStr > checkIn && dateStr < end;
  };

  const getDateClass = (dateStr, isPast, isUnavail) => {
    if (isPast || isUnavail) return styles.cellDisabled;
    const classes = [styles.cellAvailable];
    if (isWeekend(dateStr) || isHoliday(dateStr)) classes.push(styles.cellHighlight);
    if (dateStr === checkIn)       classes.push(styles.cellCheckIn);
    else if (dateStr === checkOut) classes.push(styles.cellCheckOut);
    else if (isInRange(dateStr))   classes.push(styles.cellInRange);
    return classes.join(' ');
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className={styles.calendar}>
      <div className={styles.monthHeader}>
        <span className={styles.monthName}>{MONTHS[month]}</span>
        <span className={styles.monthYear}>{year}</span>
      </div>
      <div className={styles.dayHeaders}>
        {DAYS.map(d => <div key={d} className={styles.dayLabel}>{d}</div>)}
      </div>
      <div className={styles.grid}>
        {cells.map((day, i) => {
          if (!day) return <div key={'e-' + i} className={styles.cellEmpty} />;

          const dateStr   = toDateStr(year, month, day);
          const isPast    = dateStr < todayStr;
          const isUnavail = _unavailable.has(dateStr);
          const isWE      = isWeekend(dateStr);
          const isHol     = isHoliday(dateStr);

          return (
            <div
              key={dateStr}
              className={getDateClass(dateStr, isPast, isUnavail)}
              onClick={() => !isPast && !isUnavail && onDateClick(dateStr)}
              onMouseEnter={() => !isPast && !isUnavail && onDateHover(dateStr)}
              onMouseLeave={() => onDateHover(null)}
              title={isUnavail ? 'Not available' : isHol ? 'Holiday' : isWE ? 'Weekend' : ''}
            >
              <span className={(isWE || isHol) && !isPast && !isUnavail ? styles.numHighlight : styles.num}>
                {day}
              </span>
              {dateStr === checkIn  && <span className={styles.label}>IN</span>}
              {dateStr === checkOut && <span className={styles.label}>OUT</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;