import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import StatCard from '../components/StatCard.jsx';
import MonthPicker from '../components/MonthPicker.jsx';
import { CATEGORY_LABELS_AR } from '../components/ExpenseModal.jsx';
import { currentMonthKey } from '../utils/date.js';

export default function DashboardHome() {
  const { userName } = useOutletContext() || {};
  const [month, setMonth] = useState(currentMonthKey());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    axiosClient
      .get('/dashboard/stats', { params: { month } })
      .then(({ data }) => {
        if (!ignore) setStats(data);
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [month]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome back, {userName || 'Mohamed'} 👋</h1>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      {loading || !stats ? (
        <div className="loading-block">
          <span className="spinner" />
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              icon="fa-sack-dollar"
              label="مصروفات هذا الشهر"
              value={`${stats.totalExpensesThisMonth.toLocaleString()} EGP`}
              accent="primary"
            />
            <StatCard
              icon="fa-users"
              label="المشتركين"
              value={`${stats.totalSubscribers} مشترك`}
              sub={`إجمالي المدفوع: ${stats.paidThisMonth.toLocaleString()} EGP`}
              accent="secondary"
            />
            <StatCard
              icon="fa-chart-line"
              label="الإيراد المتوقع"
              value={`${stats.expectedRevenue.toLocaleString()} EGP`}
              accent="gold"
            />
            <StatCard
              icon={stats.netDifference >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}
              label="Net Difference"
              value={`${stats.netDifference >= 0 ? '+' : ''}${stats.netDifference.toLocaleString()} EGP`}
              accent={stats.netDifference >= 0 ? 'success' : 'danger'}
            />
          </div>

          <div className="dashboard-columns">
            <div className="card panel">
              <h3 className="panel-title">آخر المصروفات</h3>
              {stats.recentExpenses.length === 0 ? (
                <p className="text-muted">لا توجد مصروفات بعد</p>
              ) : (
                <ul className="recent-list">
                  {stats.recentExpenses.map((e) => (
                    <li key={e._id}>
                      <div>
                        <span className="recent-title">{e.title}</span>
                        <span className="recent-meta">
                          {CATEGORY_LABELS_AR[e.category] || e.category} · {new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <span className="recent-amount">{e.amount.toLocaleString()} EGP</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card panel">
              <h3 className="panel-title">آخر الاشتراكات</h3>
              {stats.recentPayments.length === 0 ? (
                <p className="text-muted">لا توجد مدفوعات بعد</p>
              ) : (
                <ul className="recent-list">
                  {stats.recentPayments.map((p) => (
                    <li key={p._id}>
                      <div>
                        <span className="recent-title">{p.subscriberId?.name || 'مشترك محذوف'}</span>
                        <span className="recent-meta">{new Date(p.paidAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                      </div>
                      <span className="recent-amount">{p.amount.toLocaleString()} EGP</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
