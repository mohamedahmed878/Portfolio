export default function ConfirmModal({ open, title, message, confirmLabel = 'حذف', onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box modal-sm fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon-warning">
          <i className="fa-solid fa-triangle-exclamation" />
        </div>
        <h3>{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            إلغاء
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
