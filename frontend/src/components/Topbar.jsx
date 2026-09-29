import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function getInitialTheme() {
  return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
}

export default function Topbar({ onMenuClick, title }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const initials = (user?.name || user?.email || '?').slice(0, 1).toUpperCase();

  return (
    <header className="topbar">
      <button className="btn-icon btn-ghost topbar-menu-btn" onClick={onMenuClick} aria-label="Menu">
        <i className="fa-solid fa-bars" />
      </button>

      <h2 className="topbar-title">{title}</h2>

      <div className="topbar-actions">
        <button
          className="btn-icon btn-ghost"
          onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          title="تبديل الوضع الليلي/النهاري"
        >
          <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`} />
        </button>
        <button className="btn-icon btn-ghost" title="Notifications">
          <i className="fa-solid fa-bell" />
        </button>
        <div className="topbar-user">
          <div className="avatar">{initials}</div>
          <span className="topbar-username">{user?.name || user?.email}</span>
        </div>
      </div>
    </header>
  );
}
