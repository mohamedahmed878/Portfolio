function shiftMonth(monthKey, delta) {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function label(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export default function MonthPicker({ value, onChange }) {
  return (
    <div className="month-picker">
      <button className="btn-icon btn-ghost" onClick={() => onChange(shiftMonth(value, -1))} aria-label="Previous month">
        <i className="fa-solid fa-chevron-right" />
      </button>
      <span className="month-picker-label">
        <i className="fa-regular fa-calendar" /> {label(value)}
      </span>
      <button className="btn-icon btn-ghost" onClick={() => onChange(shiftMonth(value, 1))} aria-label="Next month">
        <i className="fa-solid fa-chevron-left" />
      </button>
    </div>
  );
}
