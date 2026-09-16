/**
 * Civentral Mobile Apps - Central Date Formatting Utility
 * Standard:
 *   Date only:      MMM D, YYYY           (e.g., Sep 16, 2026)
 *   Date + Time:    MMM D, YYYY • h:mm A  (e.g., Sep 16, 2026 • 2:30 PM)
 *   Fallback/Empty: —
 */

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export interface ParsedDateComponents {
  year: number;
  monthIndex: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  hasTime: boolean;
}

/**
 * Safely parse a date or datetime string without unintended UTC day-shifting on date-only strings (YYYY-MM-DD).
 */
export function parseDateInput(value?: string | Date | null): ParsedDateComponents | null {
  if (!value) return null;

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return {
      year: value.getFullYear(),
      monthIndex: value.getMonth(),
      day: value.getDate(),
      hours: value.getHours(),
      minutes: value.getMinutes(),
      seconds: value.getSeconds(),
      hasTime: true,
    };
  }

  if (typeof value !== 'string') return null;

  const clean = value.trim();
  if (!clean || clean === '0000-00-00' || clean === '0000-00-00 00:00:00') {
    return null;
  }

  // Match pure date: YYYY-MM-DD
  const dateOnlyMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (dateOnlyMatch) {
    const y = parseInt(dateOnlyMatch[1], 10);
    const m = parseInt(dateOnlyMatch[2], 10) - 1;
    const d = parseInt(dateOnlyMatch[3], 10);
    if (m >= 0 && m < 12 && d >= 1 && d <= 31) {
      return {
        year: y,
        monthIndex: m,
        day: d,
        hours: 0,
        minutes: 0,
        seconds: 0,
        hasTime: false,
      };
    }
    return null;
  }

  // Match SQL datetime: YYYY-MM-DD HH:mm[:ss]
  const sqlDtMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (sqlDtMatch) {
    const sy = parseInt(sqlDtMatch[1], 10);
    const sm = parseInt(sqlDtMatch[2], 10) - 1;
    const sd = parseInt(sqlDtMatch[3], 10);
    const sh = parseInt(sqlDtMatch[4], 10);
    const smin = parseInt(sqlDtMatch[5], 10);
    const ssec = sqlDtMatch[6] ? parseInt(sqlDtMatch[6], 10) : 0;
    if (sm >= 0 && sm < 12 && sd >= 1 && sd <= 31) {
      return {
        year: sy,
        monthIndex: sm,
        day: sd,
        hours: sh,
        minutes: smin,
        seconds: ssec,
        hasTime: true,
      };
    }
  }

  // Fallback: standard Date parsing (e.g. ISO 8601 with timezone offset)
  const parsed = new Date(clean);
  if (isNaN(parsed.getTime())) {
    return null;
  }
  return {
    year: parsed.getFullYear(),
    monthIndex: parsed.getMonth(),
    day: parsed.getDate(),
    hours: parsed.getHours(),
    minutes: parsed.getMinutes(),
    seconds: parsed.getSeconds(),
    hasTime: true,
  };
}

function formatTimePart(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  let h = hours % 12;
  if (h === 0) h = 12;
  const minStr = (minutes < 10 ? '0' : '') + minutes;
  return `${h}:${minStr} ${period}`;
}

/**
 * Format value as Date Only: MMM D, YYYY (e.g., Sep 16, 2026)
 */
export function formatDate(dateStr?: string | Date | null, fallback = '—'): string {
  const parsed = parseDateInput(dateStr);
  if (!parsed) return fallback;
  const month = MONTH_NAMES_SHORT[parsed.monthIndex] || '';
  return `${month} ${parsed.day}, ${parsed.year}`;
}

/**
 * Format value as Date + Time: MMM D, YYYY • h:mm A (e.g., Sep 16, 2026 • 2:30 PM)
 */
export function formatDateTime(dateStr?: string | Date | null, fallback = '—'): string {
  const parsed = parseDateInput(dateStr);
  if (!parsed) return fallback;
  const month = MONTH_NAMES_SHORT[parsed.monthIndex] || '';
  const datePart = `${month} ${parsed.day}, ${parsed.year}`;
  const timePart = formatTimePart(parsed.hours, parsed.minutes);
  return `${datePart} • ${timePart}`;
}
