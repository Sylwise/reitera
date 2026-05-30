import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { getTopicStatus } from '../../utils/topicHelpers';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { useTheme } from '../../context/ThemeContext';

const VIEW_LABELS = { dashboard: 'Dashboard', temas: 'Temas', stats: 'Estadísticas', calendario: 'Calendario' };

const ICONS = {
  dashboard: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="0" y="0" width="6" height="6" rx="1.5"/><rect x="8" y="0" width="6" height="6" rx="1.5"/>
      <rect x="0" y="8" width="6" height="6" rx="1.5"/><rect x="8" y="8" width="6" height="6" rx="1.5"/>
    </svg>
  ),
  temas: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="0" y="1" width="14" height="2" rx="1"/><rect x="0" y="6" width="10" height="2" rx="1"/>
      <rect x="0" y="11" width="12" height="2" rx="1"/>
    </svg>
  ),
  stats: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="0" y="6" width="3" height="8" rx="1"/><rect x="4" y="3" width="3" height="11" rx="1"/>
      <rect x="8" y="1" width="3" height="13" rx="1"/><rect x="12" y="4" width="2" height="10" rx="1"/>
    </svg>
  ),
  calendario: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="0" y="2" width="14" height="11" rx="2" opacity=".35"/>
      <rect x="0" y="2" width="14" height="4" rx="2"/>
      <rect x="3" y="0" width="2" height="4" rx="1"/><rect x="9" y="0" width="2" height="4" rx="1"/>
      <rect x="2" y="8" width="2" height="2" rx=".5"/><rect x="6" y="8" width="2" height="2" rx=".5"/>
      <rect x="10" y="8" width="2" height="2" rx=".5"/>
    </svg>
  ),
};

export default function Sidebar({ view, onViewChange, onSelectSubject, subjects, topics, onAddSubject, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const dueCount = topics.filter(t => ['today', 'overdue'].includes(getTopicStatus(t))).length;
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const menuRef = useRef(null);

  function openMenu()  { setMenuOpen(true); setMenuClosing(false); }
  function closeMenu() {
    setMenuClosing(true);
    setTimeout(() => { setMenuOpen(false); setMenuClosing(false); }, 150);
  }

  useOutsideClick(menuRef, closeMenu, menuOpen);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-dot" />
        REITERA
      </div>

      <span className="sidebar-nav-label">General</span>
      {['dashboard', 'temas', 'stats', 'calendario'].map(v => (
        <motion.button
          key={v}
          whileTap={{ scale: 0.96 }}
          className={`sidebar-item${view === v ? ' active' : ''}`}
          onClick={() => onViewChange(v)}
        >
          {ICONS[v]}
          {VIEW_LABELS[v]}
          {v === 'dashboard' && dueCount > 0 && (
            <span className="s-badge">{dueCount}</span>
          )}
        </motion.button>
      ))}

      <span className="sidebar-nav-label">Asignaturas</span>
      {subjects.map(s => {
        const pending = topics.filter(t => t.subjectId === s.id && ['today', 'overdue'].includes(getTopicStatus(t))).length;
        return (
          <motion.button
            key={s.id}
            whileTap={{ scale: 0.96 }}
            className="sidebar-item subject-item"
            onClick={() => onSelectSubject(s.id)}
          >
            <span className="sidebar-asig-dot" style={{ background: s.color }} />
            {s.name}
            {pending > 0 && <span className="s-badge">{pending}</span>}
          </motion.button>
        );
      })}
      <motion.button
        whileTap={{ scale: 0.96 }}
        className="sidebar-item subject-action"
        onClick={onAddSubject}
      >
        <span>+</span> Nueva asignatura
      </motion.button>

      <div className="sidebar-footer" ref={menuRef}>
        {menuOpen && (
          <div className={`sidebar-user-menu${menuClosing ? ' closing' : ''}`}>
            <button className="sidebar-user-menu-item" onClick={() => { toggleTheme(); closeMenu(); }}>
              {theme === 'dark' ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                  Modo Claro
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                  Modo Oscuro
                </>
              )}
            </button>
            <button className="sidebar-user-menu-item danger" onClick={onLogout}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Cerrar sesión
            </button>
          </div>
        )}
        <div className="sidebar-user" onClick={() => menuOpen ? closeMenu() : openMenu()}>
          <div className="sidebar-avatar">PD</div>
          <span className="sidebar-username">Pencho Deskov</span>
        </div>
      </div>
    </aside>
  );
}
