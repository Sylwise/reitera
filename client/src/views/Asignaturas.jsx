import { useLongPress } from '../hooks/useLongPress';
import { getTopicStatus } from '../utils/topicHelpers';
import { SUBJECT_LIMIT } from '../data/subjects';

function IconDots() {
  return (
    <svg width="14" height="14" viewBox="0 0 4 16" fill="currentColor">
      <circle cx="2" cy="2" r="1.5" />
      <circle cx="2" cy="8" r="1.5" />
      <circle cx="2" cy="14" r="1.5" />
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

export default function Asignaturas({ subjects, topics, onEditSubject, onAddSubject }) {
  const longPress = useLongPress();
  const atSubjectLimit = subjects.length >= SUBJECT_LIMIT;

  return (
    <div className="page-wrap" style={{ maxWidth: 640 }}>
      <div className="temas-header fade-in">
        <div className="temas-title">Asignaturas</div>
      </div>

      {subjects.length === 0 ? (
        <div style={{ fontFamily: 'var(--mono)', fontSize: '.8rem', color: 'var(--muted)', padding: '3rem 0', textAlign: 'center' }}>
          Sin asignaturas todavía
        </div>
      ) : subjects.map((s, i) => {
        const subjTopics = topics.filter(t => t.subjectId === s.id);
        const mastered   = subjTopics.filter(t => getTopicStatus(t) === 'mastered').length;
        const pct        = s.totalTopics > 0 ? Math.round(mastered / s.totalTopics * 100) : 0;
        return (
          <div
            key={s.id}
            className="asig-group-header fade-in"
            style={{ animationDelay: `${i * 0.04}s` }}
            onClick={() => onEditSubject(s.id)}
            onContextMenu={(e) => { e.preventDefault(); onEditSubject(s.id); }}
            onTouchStart={() => longPress.onStart(() => onEditSubject(s.id))}
            onTouchEnd={longPress.onEnd}
            onTouchMove={longPress.onEnd}
          >
            <div className="asig-group-dot" style={{ background: s.color }} />
            <div className="asig-group-name">{s.name}</div>
            <div className="asig-group-count">{subjTopics.length} tema{subjTopics.length !== 1 ? 's' : ''}</div>
            <div className="asig-group-progress">
              <div className="asig-mini-bar">
                <div className="asig-mini-fill" style={{ width: `${pct}%`, background: s.color }} />
              </div>
              <div className="asig-mini-pct">{mastered}/{s.totalTopics} · {pct}%</div>
            </div>
            <button
              className="asig-menu-btn"
              onClick={(e) => { e.stopPropagation(); onEditSubject(s.id); }}
              title="Editar asignatura"
            >
              <IconDots />
            </button>
          </div>
        );
      })}

      <button
        className="btn-add-topic btn-add-subject-full"
        onClick={onAddSubject}
        disabled={atSubjectLimit}
        title={atSubjectLimit ? `Máximo de ${SUBJECT_LIMIT} asignaturas alcanzado` : undefined}
        style={atSubjectLimit ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
      >
        <IconPlus />
        {atSubjectLimit ? `Máximo de ${SUBJECT_LIMIT} asignaturas` : 'Añadir asignatura'}
      </button>
    </div>
  );
}
