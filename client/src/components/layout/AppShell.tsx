import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAvatars } from '../../hooks/useAvatars';
import './layout.css';

const NAV = [
  { to: '/', icon: '🏠', label: 'Үйрену', end: true },
  { to: '/games', icon: '🎮', label: 'Ойындар', end: false },
  { to: '/activity', icon: '📊', label: 'Белсенділік', end: false },
  { to: '/profile', icon: '👤', label: 'Профиль', end: false },
];

const AppShell: React.FC = () => {
  const { user } = useAuth();
  const { emojiFor } = useAvatars();
  const location = useLocation();

  return (
    <div className="shell">
      <nav className="sidenav" aria-label="Негізгі мәзір">
        <div className="brand">qazaqsha</div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="shell-main">
        <header className="topbar">
          <div className="brand brand-mobile">qazaqsha</div>
          <div className="topbar-stats">
            <span className="stat-pill stat-streak" title="Күнделікті серия">
              🔥 {user?.currentStreak ?? 0}
            </span>
            <span className="stat-pill stat-xp" title="Жалпы XP">
              ⚡ {user?.totalXp ?? 0}
            </span>
            <NavLink to="/profile" className="topbar-avatar" title={user?.displayName}>
              {emojiFor(user?.avatarId ?? '')}
            </NavLink>
          </div>
        </header>

        <main key={location.pathname} className="page anim-fade-in">
          <Outlet />
        </main>
      </div>

      <nav className="bottomnav" aria-label="Негізгі мәзір">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `bottom-item ${isActive ? 'is-active' : ''}`}>
            <span className="nav-icon">{n.icon}</span>
            <span className="bottom-label">{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AppShell;
