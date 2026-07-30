import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { getTopicStatus } from '../../utils/topicHelpers';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { useTheme } from '../../context/theme';
import { getInitials, getFirstName } from '../../utils/userHelpers';
import { longDate } from '../../utils/dateHelpers';

export default function Topbar({ topics, subjects, userName, onAddTopic, onOpenAsignaturas, onLogout, onChangePassword, onDeleteAccount }) {
  const { theme, toggleTheme } = useTheme();
  // Con las asignaturas aún sin cargar no sabemos si hay o no: el botón se muestra
  // pero deshabilitado, en vez de aparecer de golpe cuando llega la respuesta.
  const subjectsLoaded = subjects != null;
  const hasSubjects    = subjectsLoaded && subjects.length > 0;
  const showAddTopic   = !subjectsLoaded || hasSubjects;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useOutsideClick(menuRef, () => setMenuOpen(false), menuOpen);

  const dueCount = (topics ?? []).filter(t => ['today', 'overdue'].includes(getTopicStatus(t))).length;

  const hour     = new Date().getHours();
  const greet    = hour < 6 ? 'Buenas noches' : hour < 13 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  const dateCap  = longDate(new Date());
  // Sin los temas cargados no se puede afirmar ni que hay pendientes ni que no los hay.
  const dueLabel = topics == null
    ? null
    : dueCount > 0
      ? `${dueCount} tema${dueCount !== 1 ? 's' : ''} pendiente${dueCount !== 1 ? 's' : ''}`
      : 'Todo al día';

  return (
    <div className="inner-topbar">
      <div className="mobile-menu-wrap" ref={menuRef}>
          <motion.button whileTap={{ scale: 0.95 }} className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="sidebar-avatar" style={{ width: 36, height: 36, fontSize: '.85rem' }}>{getInitials(userName)}</div>
          </motion.button>

          {menuOpen && (
            <div className="mobile-dropdown-menu">

              {/* ── Bloque 1: Perfil ── */}
              <div className="mobile-menu-user">
                <div className="sidebar-avatar" style={{ width: 36, height: 36, fontSize: '.85rem' }}>{getInitials(userName)}</div>
                <div style={{ fontSize: '.83rem', fontWeight: 600, color: 'var(--text)' }}>{userName}</div>
              </div>

              {/* ── Bloque 2: Acciones ── */}
              <div className="mobile-menu-section">
                {showAddTopic && (
                  <motion.button
                    whileTap={hasSubjects ? { scale: 0.95 } : undefined}
                    className="dd-item"
                    disabled={!hasSubjects}
                    style={hasSubjects ? undefined : { opacity: 0.4, cursor: 'not-allowed' }}
                    onClick={() => { onAddTopic(); setMenuOpen(false); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Añadir tema
                  </motion.button>
                )}
                <motion.button whileTap={{ scale: 0.95 }} className="dd-item" onClick={() => { onOpenAsignaturas(); setMenuOpen(false); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  Asignaturas
                </motion.button>
              </div>

              {/* ── Bloque 3: Preferencias ── */}
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

              {/* ── Bloque 4: Cuenta ── */}
              <div className="mobile-menu-section">
                <motion.button whileTap={{ scale: 0.95 }} className="dd-item" onClick={() => { onChangePassword(); setMenuOpen(false); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Cambiar contraseña
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} className="dd-item" onClick={() => { onLogout(); setMenuOpen(false); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Cerrar sesión
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} className="dd-item danger" onClick={() => { onDeleteAccount(); setMenuOpen(false); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Eliminar cuenta
                </motion.button>
              </div>

            </div>
          )}
      </div>

      <div className="inner-topbar-left">
        <h2>{greet}, {getFirstName(userName)}</h2>
        <p>// {dateCap}{dueLabel ? ` · ${dueLabel}` : ''}</p>
      </div>
      <div className="inner-topbar-right">
        {showAddTopic && (
          <motion.button
            whileTap={hasSubjects ? { scale: 0.95 } : undefined}
            className="btn-add-topic hide-on-mobile"
            disabled={!hasSubjects}
            title={hasSubjects ? undefined : (subjectsLoaded ? undefined : 'Cargando asignaturas…')}
            style={hasSubjects ? undefined : { opacity: 0.4, cursor: 'not-allowed' }}
            onClick={onAddTopic}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> Añadir tema
          </motion.button>
        )}
      </div>
    </div>
  );
}
