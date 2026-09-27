export default function StatCard({ icon, label, value, accent = 'primary', sub }) {
  return (
    <div className={`stat-card card accent-${accent}`}>
      <div className="stat-icon">
        <i className={`fa-solid ${icon}`} />
      </div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  );
}
