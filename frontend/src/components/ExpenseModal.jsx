import { useEffect, useState } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Other'];
const CATEGORY_LABELS_AR = {
  Food: 'أكل',
  Transport: 'مواصلات',
  Bills: 'فواتير',
  Shopping: 'تسوق',
  Entertainment: 'ترفيه',
  Health: 'صحة',
  Other: 'أخرى',
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = { title: '', amount: '', category: 'Food', date: todayISO(), notes: '' };

export default function ExpenseModal({ open, initialData, onClose, onSubmit, saving }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      if (initialData) {
        setForm({
          title: initialData.title,
          amount: initialData.amount,
          category: initialData.category,
          date: initialData.date ? initialData.date.slice(0, 10) : todayISO(),
          notes: initialData.notes || '',
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('اسم المصروف مطلوب');
    if (!form.amount || Number(form.amount) < 0) return setError('المبلغ غير صحيح');

    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
    } catch (err) {
      setError(err?.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? 'تعديل مصروف' : 'إضافة مصروف'}</h3>
          <button className="btn-icon btn-ghost" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Expense Name</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: غداء"
              autoFocus
            />
          </div>

          <div className="modal-row">
            <div className="field-group">
              <label className="field-label">المبلغ (EGP)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="150"
              />
            </div>
            <div className="field-group">
              <label className="field-label">Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS_AR[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Date</label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="field-group">
            <label className="field-label">ملاحظات</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="اختياري"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { CATEGORY_LABELS_AR };
