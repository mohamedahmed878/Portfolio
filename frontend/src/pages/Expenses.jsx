import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import MonthPicker from '../components/MonthPicker.jsx';
import ExpenseModal, { CATEGORY_LABELS_AR } from '../components/ExpenseModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useToast } from '../context/ToastContext';
import { currentMonthKey } from '../utils/date.js';

export default function Expenses() {
  const { showToast } = useToast();
  const [month, setMonth] = useState(currentMonthKey());
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [expenses, setExpenses] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/expenses', { params: { month } });
      setTotal(data.total);
      setExpenses(data.expenses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (expense) => {
    setEditing(expense);
    setModalOpen(true);
  };

  const handleSubmit = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await axiosClient.put(`/expenses/${editing._id}`, form);
        showToast('تم تعديل المصروف');
      } else {
        await axiosClient.post('/expenses', form);
        showToast('تم إضافة المصروف');
      }
      setModalOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await axiosClient.delete(`/expenses/${deleting._id}`);
      showToast('تم حذف المصروف');
      setDeleting(null);
      await load();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>مصروفاتي</h1>
          <p className="page-sub">
            Total Expenses: <strong>{total.toLocaleString()} EGP</strong>
          </p>
        </div>
        <div className="page-header-actions">
          <MonthPicker value={month} onChange={setMonth} />
          <button className="btn btn-primary" onClick={openAdd}>
            <i className="fa-solid fa-plus" /> إضافة مصروف
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-block">
          <span className="spinner" />
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState icon="fa-receipt" title="لا توجد مصروفات لهذا الشهر" actionLabel="إضافة أول مصروف" onAction={openAdd} />
      ) : (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>اسم المصروف</th>
                <th>التصنيف</th>
                <th>المبلغ</th>
                <th>ملاحظات</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e._id}>
                  <td data-label="التاريخ">{new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                  <td data-label="اسم المصروف">{e.title}</td>
                  <td data-label="التصنيف">
                    <span className="category-chip">{CATEGORY_LABELS_AR[e.category] || e.category}</span>
                  </td>
                  <td data-label="المبلغ">{e.amount.toLocaleString()} EGP</td>
                  <td data-label="ملاحظات" className="text-muted">{e.notes || '—'}</td>
                  <td data-label="" className="table-actions">
                    <button className="btn-icon btn-ghost" onClick={() => openEdit(e)} title="Edit">
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button className="btn-icon btn-ghost" onClick={() => setDeleting(e)} title="Delete">
                      <i className="fa-solid fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ExpenseModal
        open={modalOpen}
        initialData={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        saving={saving}
      />

      <ConfirmModal
        open={Boolean(deleting)}
        title="حذف المصروف؟"
        message={`هل أنت متأكد أنك تريد حذف "${deleting?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
