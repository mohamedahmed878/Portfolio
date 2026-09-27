import { useEffect, useState } from 'react';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = { name: '', phone: '', monthlyPrice: 200, joinedAt: todayISO(), notes: '' };

export default function SubscriberModal({ open, initialData, onClose, onSubmit, saving }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      if (initialData) {
        setForm({
          name: initialData.name,
          phone: initialData.phone,
          monthlyPrice: initialData.monthlyPrice,
          joinedAt: initialData.joinedAt ? initialData.joinedAt.slice(0, 10) : todayISO(),
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
    if (!form.name.trim()) return setError('اسم المشترك مطلوب');
    if (!form.phone.trim()) return setError('رقم الهاتف مطلوب');
    if (form.monthlyPrice === '' || Number(form.monthlyPrice) < 0) return setError('قيمة الاشتراك غير صحيحة');

    try {
      await onSubmit({ ...form, monthlyPrice: Number(form.monthlyPrice) });
    } catch (err) {
      setError(err?.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? 'تعديل مشترك' : 'إضافة مشترك'}</h3>
          <button className="btn-icon btn-ghost" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Name</label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: Ahmed Mohamed"
              autoFocus
            />
          </div>

          <div className="field-group">
            <label className="field-label">Phone</label>
            <input
              className="input-field"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0100xxxxxxx"
            />
          </div>

          <div className="modal-row">
            <div className="field-group">
              <label className="field-label">Monthly Price (EGP)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                value={form.monthlyPrice}
                onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">First Payment Date</label>
              <input
                type="date"
                className="input-field"
                value={form.joinedAt}
                onChange={(e) => setForm({ ...form, joinedAt: e.target.value })}
              />
            </div>
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
