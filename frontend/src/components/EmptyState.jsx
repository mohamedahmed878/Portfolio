export default function EmptyState({ icon, title, actionLabel, onAction }) {
  return (
    <div className="empty-state fade-in">
      <div className="empty-icon">
        <i className={`fa-solid ${icon}`} />
      </div>
      <p>{title}</p>
      {actionLabel && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          <i className="fa-solid fa-plus" /> {actionLabel}
        </button>
      )}
    </div>
  );
}
