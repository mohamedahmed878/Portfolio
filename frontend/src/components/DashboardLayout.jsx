import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const titles = {
  '/dashboard': 'Dashboard',
  '/dashboard/expenses': 'مصروفاتي',
  '/dashboard/subscriptions': 'الاشتراكات',
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    showToast('تم تسجيل الخروج بنجاح', 'success');
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-shell">
      <div className="glass-bg">
        <div className="glow glow-1" />
        <div className="glow glow-2" />
      </div>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />

      <div className="dashboard-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={titles[location.pathname] || 'Dashboard'} />
        <main className="dashboard-content fade-in">
          <Outlet context={{ userName: user?.name }} />
        </main>
      </div>
    </div>
  );
}
