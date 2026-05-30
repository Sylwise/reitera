import './EmptyDashboard.css';

const GHOST_CARDS = [
  { fill: 65, nameW: 55 },
  { fill: 40, nameW: 70 },
  { fill: 80, nameW: 45 },
  { fill: 25, nameW: 60 },
  { fill: 55, nameW: 50 },
];

function IconSparkles() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
      <path d="M20 3v4"/><path d="M22 5h-4"/>
      <path d="M4 17v2"/><path d="M5 18H3"/>
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

export default function EmptyDashboard({ onAddSubject, isModalOpen }) {
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

      {!isModalOpen && (
        <div className="empty-center">
          <div className="empty-icon-wrap">
            <IconSparkles />
          </div>
          <h1 className="empty-title">
            Comienza a dominar<br />tu semestre
          </h1>
          <p className="empty-subtitle">
            No tienes asignaturas registradas.<br />
            Añade la primera para empezar a trackear tus repasos.
          </p>
          <button className="empty-cta" onClick={onAddSubject}>
            <IconPlus />
            Añadir mi primera asignatura
          </button>
        </div>
      )}

    </div>
  );
}
