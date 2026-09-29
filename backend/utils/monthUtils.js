// Small helpers for working with "YYYY-MM" month strings

function currentMonthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function monthKeyFromDate(date) {
  return currentMonthKey(new Date(date));
}

function monthRange(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { start, end };
}

function isValidMonthKey(key) {
  return typeof key === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(key);
}

function monthLabel(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

module.exports = { currentMonthKey, monthKeyFromDate, monthRange, isValidMonthKey, monthLabel };
