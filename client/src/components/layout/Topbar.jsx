import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { getTopicStatus } from '../../utils/topicHelpers';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { useTheme } from '../../context/ThemeContext';

export default function Topbar({ topics, subjects, streak, onAddTopic, onAddSubject, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const hasSubjects = subjects.length > 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useOutsideClick(menuRef, () => setMenuOpen(false), menuOpen);

  const dueCount = topics.filter(t => ['today', 'overdue'].includes(getTopicStatus(t))).length;

  const hour     = new Date().getHours();
  const greet    = hour < 13 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  const dateStr  = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const dateCap  = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  const dueLabel = dueCount > 0
    ? `${dueCount} tema${dueCount !== 1 ? 's' : ''} pendiente${dueCount !== 1 ? 's' : ''}`
    : 'Todo al día';

  return (
    <div className="inner-topbar">
      <div className="inner-topbar-left">
        <h2>{greet}, Pencho 👋</h2>
        <p>// {dateCap} · {dueLabel}</p>
      </div>
      <div className="inner-topbar-right">
        <div className="streak-badge hide-on-mobile">🔥 <span>{streak} días</span></div>
        {hasSubjects && (
          <motion.button whileTap={{ scale: 0.95 }} className="btn-add-topic hide-on-mobile" onClick={onAddTopic}>
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> Añadir tema
          </motion.button>
        )}

        <div className="mobile-menu-wrap" ref={menuRef}>
          <motion.button whileTap={{ scale: 0.95 }} className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="sidebar-avatar" style={{ width: 36, height: 36, fontSize: '.85rem' }}>PD</div>
          </motion.button>
          
          {menuOpen && (
            <div className="mobile-dropdown-menu">

              {/* ── Bloque 1: Perfil ── */}
              <div className="mobile-menu-user">
                <div className="sidebar-avatar" style={{ width: 36, height: 36, fontSize: '.85rem' }}>PD</div>
                <div>
                  <div style={{ fontSize: '.83rem', fontWeight: 600, color: 'var(--text)' }}>Pencho Deskov</div>
                  <div style={{ fontSize: '.65rem', color: 'var(--accent)', marginTop: '2px' }}>🔥 {streak} días de racha</div>
                </div>
              </div>

              {/* ── Bloque 2: Acciones ── */}
              <div className="mobile-menu-section">
                {hasSubjects && (
                  <motion.button whileTap={{ scale: 0.95 }} className="dd-item" onClick={() => { onAddTopic(); setMenuOpen(false); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Añadir tema
                  </motion.button>
                )}
                <motion.button whileTap={{ scale: 0.95 }} className="dd-item" onClick={() => { onAddSubject(); setMenuOpen(false); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  Nueva asignatura
                </motion.button>
              </div>

              {/* ── Bloque 3: Ajustes ── */}
              <div className="mobile-menu-section">
                <motion.button whileTap={{ scale: 0.95 }} className="dd-item" onClick={() => { toggleTheme(); setMenuOpen(false); }}>
                  {theme === 'dark' ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                      </svg>
                      Modo Claro
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                      </svg>
                        Modo Oscuro
                    </>
                  )}
                </motion.button>
              </div>

              {/* ── Bloque 4: Peligro ── */}
              <div className="mobile-menu-section">
                <motion.button whileTap={{ scale: 0.95 }} className="dd-item danger" onClick={() => { onLogout(); setMenuOpen(false); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Cerrar sesión
                </motion.button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
