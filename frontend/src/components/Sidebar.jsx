import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: 'fa-house', end: true },
  { to: '/dashboard/expenses', label: 'مصروفاتي', icon: 'fa-sack-dollar' },
  { to: '/dashboard/subscriptions', label: 'الاشتراكات', icon: 'fa-users' },
];

export default function Sidebar({ open, onClose, onLogout }) {
  return (
    <>
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <i className="fa-solid fa-shield-halved" />
          <span>Dashboard</span>
        </div>

        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <i className={`fa-solid ${l.icon}`} />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-link" type="button" disabled title="قريبًا">
            <i className="fa-solid fa-gear" />
            <span>Settings</span>
          </button>
          <button className="sidebar-link sidebar-logout" type="button" onClick={onLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
    </>
  );
}
