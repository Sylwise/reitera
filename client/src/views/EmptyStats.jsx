import './EmptyState.css';

const GHOST_CARDS = [
  { fill: 65, nameW: 55 },
  { fill: 40, nameW: 70 },
  { fill: 80, nameW: 45 },
  { fill: 25, nameW: 60 },
  { fill: 55, nameW: 50 },
];

function IconBars() {
  return (
    <svg width="32" height="32" viewBox="0 0 14 14" fill="currentColor">
      <rect x="0" y="6" width="3" height="8" rx="1"/><rect x="4" y="3" width="3" height="11" rx="1"/>
      <rect x="8" y="1" width="3" height="13" rx="1"/><rect x="12" y="4" width="2" height="10" rx="1"/>
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="M12 5v14"/>
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>
    </svg>
  );
}

export default function EmptyStats({ hasSubjects, onAddSubject, onGoToTemas }) {
  return (
    <div className="empty-dashboard">

      <div className="empty-ghost" aria-hidden="true">
        <div className="ghost-layout">
          <div className="ghost-col-left">
            {GHOST_CARDS.map((c, i) => (
              <div key={i} className="ghost-card">
                <div className="ghost-card-name" style={{ width: `${c.nameW}%` }} />
                <div className="ghost-track">
                  <div className="ghost-fill" style={{ width: `${c.fill}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="ghost-col-right">
            <div className="ghost-panel" />
            <div className="ghost-panel ghost-panel--short" />
          </div>
        </div>
      </div>

      <div className="empty-center">
        <div className="empty-icon-wrap">
          <IconBars />
        </div>
        <h1 className="empty-title">
          Todavía no hay<br />datos que mostrar
        </h1>
        {hasSubjects ? (
          <>
            <p className="empty-subtitle">
              Completa tu primer repaso para empezar<br />a ver aquí tu evolución.
            </p>
            <button className="empty-cta" onClick={onGoToTemas}>
              Ir a mis temas
              <IconArrowRight />
            </button>
          </>
        ) : (
          <>
            <p className="empty-subtitle">
              No tienes asignaturas registradas todavía.<br />
              Añade la primera para empezar a trackear tu progreso.
            </p>
            <button className="empty-cta" onClick={onAddSubject}>
              <IconPlus />
              Añadir mi primera asignatura
            </button>
          </>
        )}
      </div>

    </div>
  );
}
