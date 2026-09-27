import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import StatCard from '../components/StatCard.jsx';
import SubscriberModal from '../components/SubscriberModal.jsx';
import SubscriberDrawer from '../components/SubscriberDrawer.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useToast } from '../context/ToastContext';

function badgeClass(status) {
  if (status === 'Paid') return 'badge-paid';
  if (status === 'Due Soon') return 'badge-due';
  return 'badge-unpaid';
}
function badgeDot(status) {
  if (status === 'Paid') return '🟢';
  if (status === 'Due Soon') return '🟡';
  return '🔴';
}

export default function Subscriptions() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [month, setMonth] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [openDrawerId, setOpenDrawerId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/subscribers');
      setSubscribers(data.subscribers);
      setMonth(data.month);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalSubscribers = subscribers.length;
  const paidThisMonth = subscribers
    .filter((s) => s.status === 'Paid')
    .reduce((sum, s) => sum + s.monthlyPrice, 0);
  const expectedRevenue = subscribers.reduce((sum, s) => sum + s.monthlyPrice, 0);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (subscriber) => {
    setEditing(subscriber);
    setModalOpen(true);
    setOpenDrawerId(null);
  };

  const handleSubmit = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await axiosClient.put(`/subscribers/${editing._id}`, form);
        showToast('تم تعديل بيانات المشترك');
      } else {
        await axiosClient.post('/subscribers', form);
        showToast('تم إضافة المشترك');
      }
      setModalOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (subscriber) => {
    setMarkingId(subscriber._id);
    try {
      await axiosClient.post(`/payments/${subscriber._id}/mark-paid`);
      showToast(`تم تسجيل دفعة ${subscriber.name}`);
      await load();
    } finally {
      setMarkingId(null);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await axiosClient.delete(`/subscribers/${deleting._id}`);
      showToast('تم حذف المشترك');
      setDeleting(null);
      setOpenDrawerId(null);
      await load();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>الاشتراكات</h1>
        <button className="btn btn-primary" onClick={openAdd}>
          <i className="fa-solid fa-plus" /> إضافة مشترك
        </button>
      </div>

      <div className="stats-grid stats-grid-3">
        <StatCard icon="fa-users" label="Total Subscribers" value={totalSubscribers} accent="secondary" />
        <StatCard icon="fa-circle-check" label="Paid This Month" value={`${paidThisMonth.toLocaleString()} EGP`} accent="success" />
        <StatCard icon="fa-chart-line" label="Expected Revenue" value={`${expectedRevenue.toLocaleString()} EGP`} accent="gold" />
      </div>

      {loading ? (
        <div className="loading-block">
          <span className="spinner" />
        </div>
      ) : subscribers.length === 0 ? (
        <EmptyState icon="fa-user-group" title="لا يوجد مشتركون حتى الآن" actionLabel="إضافة مشترك" onAction={openAdd} />
      ) : (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>اسم الشخص</th>
                <th>رقم الهاتف</th>
                <th>قيمة الاشتراك</th>
                <th>آخر دفع</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s._id}>
                  <td data-label="اسم الشخص">
                    <button className="link-btn" onClick={() => setOpenDrawerId(s._id)}>
                      {s.name}
                    </button>
                  </td>
                  <td data-label="رقم الهاتف">{s.phone}</td>
                  <td data-label="قيمة الاشتراك">{s.monthlyPrice.toLocaleString()} EGP</td>
                  <td data-label="آخر دفع">
                    {s.lastPaymentDate ? new Date(s.lastPaymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                  </td>
                  <td data-label="الحالة">
                    <span className={`badge ${badgeClass(s.status)}`}>
                      {badgeDot(s.status)} {s.status}
                    </span>
                  </td>
                  <td data-label="" className="table-actions">
                    {s.status !== 'Paid' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => markPaid(s)}
                        disabled={markingId === s._id}
                      >
                        {markingId === s._id ? <span className="spinner" /> : 'Mark as Paid'}
                      </button>
                    )}
                    <button className="btn-icon btn-ghost" onClick={() => openEdit(s)} title="Edit">
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button className="btn-icon btn-ghost" onClick={() => setDeleting(s)} title="Delete">
                      <i className="fa-solid fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SubscriberModal
        open={modalOpen}
        initialData={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        saving={saving}
      />

      {openDrawerId && (
        <SubscriberDrawer
          subscriberId={openDrawerId}
          onClose={() => setOpenDrawerId(null)}
          onEdit={openEdit}
          onDelete={(s) => setDeleting(s)}
          onChanged={load}
        />
      )}

      <ConfirmModal
        open={Boolean(deleting)}
        title="حذف المشترك؟"
        message={`هل أنت متأكد أنك تريد حذف "${deleting?.name}"؟ سيتم حذف كل سجل المدفوعات الخاص به.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
