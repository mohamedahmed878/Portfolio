import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

function monthLabel(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export default function SubscriberDrawer({ subscriberId, onClose, onEdit, onDelete, onChanged }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/subscribers/${subscriberId}`);
      setData(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subscriberId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriberId]);

  const markPaid = async () => {
    setMarking(true);
    try {
      await axiosClient.post(`/payments/${subscriberId}/mark-paid`);
      await load();
      onChanged?.();
    } finally {
      setMarking(false);
    }
  };

  if (!subscriberId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="drawer fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="btn-icon btn-ghost drawer-close" onClick={onClose}>
          <i className="fa-solid fa-xmark" />
        </button>

        {loading || !data ? (
          <div className="drawer-loading">
            <span className="spinner" />
          </div>
        ) : (
          <>
            <div className="drawer-header">
              <div className="avatar avatar-lg">{data.subscriber.name.slice(0, 1).toUpperCase()}</div>
              <h2>{data.subscriber.name}</h2>
              <span className={`badge badge-${data.status === 'Paid' ? 'paid' : data.status === 'Due Soon' ? 'due' : 'unpaid'}`}>
                {data.status}
              </span>
            </div>

            <div className="drawer-info-grid">
              <div>
                <span className="field-label">Phone</span>
                <p>{data.subscriber.phone}</p>
              </div>
              <div>
                <span className="field-label">Monthly Subscription</span>
                <p>{data.subscriber.monthlyPrice.toLocaleString()} EGP</p>
              </div>
              <div>
                <span className="field-label">Total Paid</span>
                <p>{data.totalPaid.toLocaleString()} EGP</p>
              </div>
              <div>
                <span className="field-label">Joined</span>
                <p>{new Date(data.subscriber.joinedAt).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {data.status !== 'Paid' && (
              <button className="btn btn-primary drawer-mark-paid" onClick={markPaid} disabled={marking}>
                {marking ? <span className="spinner" /> : <><i className="fa-solid fa-check" /> Mark as Paid</>}
              </button>
            )}

            <h4 className="drawer-section-title">Payment History</h4>
            <div className="payment-history">
              {data.payments.length === 0 && <p className="text-muted">لا يوجد مدفوعات بعد</p>}
              {data.payments.map((p) => (
                <div key={p._id} className="payment-row">
                  <span>{monthLabel(p.month)}</span>
                  <span className="payment-amount">
                    <i className="fa-solid fa-check text-success" /> {p.amount.toLocaleString()} EGP
                  </span>
                </div>
              ))}
            </div>

            <div className="drawer-footer-actions">
              <button className="btn btn-ghost" onClick={() => onEdit(data.subscriber)}>
                <i className="fa-solid fa-pen" /> Edit
              </button>
              <button className="btn btn-danger" onClick={() => onDelete(data.subscriber)}>
                <i className="fa-solid fa-trash" /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
