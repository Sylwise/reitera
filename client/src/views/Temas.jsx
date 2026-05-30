import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopicCard from '../components/ui/TopicCard';
import { getTopicStatus } from '../utils/topicHelpers';
import { useLongPress } from '../hooks/useLongPress';

const FILTERS = [
  { key: 'pending',  label: 'Pendientes' },
  { key: 'all',      label: 'Todos'      },
  { key: 'mastered', label: 'Afianzados' },
];

export default function Temas({ topics, subjects, onMark, onEditTopic, onEditSubject, focusAsig }) {
  const [filter, setFilter] = useState(focusAsig ? 'all' : 'pending');
  const [search, setSearch] = useState('');
  
  const subjectLongPress = useLongPress();

  const subjectsRef = useRef(subjects);
  const topicsRef   = useRef(topics);
  subjectsRef.current = subjects;
  topicsRef.current   = topics;

  const [collapsed, setCollapsed] = useState(() => {
    const s = new Set();
    subjects.forEach(subj => {
      if (focusAsig) {
        if (subj.id !== focusAsig) s.add(subj.name);
      } else {
        const ts = topics.filter(t => t.subjectId === subj.id);
        const hasPending = ts.some(t => ['today', 'overdue'].includes(getTopicStatus(t)));
        if (!hasPending) s.add(subj.name);
      }
    });
    return s;
  });

  useEffect(() => {
    const s = new Set();
    subjectsRef.current.forEach(subj => {
      if (focusAsig) {
        if (subj.id !== focusAsig) s.add(subj.name);
      } else {
        const ts = topicsRef.current.filter(t => t.subjectId === subj.id);
        const hasPending = ts.some(t => ['today', 'overdue'].includes(getTopicStatus(t)));
        if (!hasPending) s.add(subj.name);
      }
    });
    setCollapsed(s);
    setFilter(focusAsig ? 'all' : 'pending');
  }, [focusAsig]);

  function toggleCollapse(asig) {
    if (subjectLongPress.didTrigger()) return;
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(asig) ? next.delete(asig) : next.add(asig);
      return next;
    });
  }

  function handleSubjectContextMenu(e, subjectId) {
    if (!onEditSubject) return;
    e.preventDefault();
    onEditSubject(subjectId);
  }

  function matchesFilter(t) {
    const s = getTopicStatus(t);
    if (s === 'empty')         return false;
    if (filter === 'all')      return true;
    if (filter === 'mastered') return s === 'mastered';
    if (filter === 'today')    return s === 'today';
    if (filter === 'overdue')  return s === 'overdue';
    if (filter === 'pending')  return s !== 'mastered';
    return true;
  }

  function matchesSearch(t) {
    if (!search) return true;
    const q           = search.toLowerCase();
    const subjectName = subjects.find(s => s.id === t.subjectId)?.name ?? '';
    return t.name?.toLowerCase().includes(q) || subjectName.toLowerCase().includes(q);
  }

  const groups = subjects.map(subj => {
    const { id, name, color, totalTopics } = subj;
    const subjTopics = topics.filter(t => t.subjectId === id && getTopicStatus(t) !== 'empty');
    const filtered   = subjTopics.filter(t => matchesFilter(t) && matchesSearch(t));
    const mastered   = subjTopics.filter(t => getTopicStatus(t) === 'mastered').length;
    const pct        = totalTopics > 0 ? Math.round(mastered / totalTopics * 100) : 0;
    return { id, name, color, topics: filtered, mastered, total: subjTopics.length, totalTopics, pct };
  }).filter(g => g.topics.length > 0);

  const total = topics.filter(t => matchesFilter(t) && matchesSearch(t)).length;

  return (
    <div className="page-wrap" style={{ maxWidth: 960 }}>
      <div className="temas-header fade-in">
        <div className="temas-title">Todos los temas</div>
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            className="search-input"
            type="text"
            placeholder="Buscar tema o asignatura..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-bar fade-in">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`filter-btn${f.key === 'mastered' ? ' mastered-filter' : ''}${filter === f.key ? ' active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: '.65rem', color: 'var(--muted)', alignSelf: 'center' }}>
          {total} resultado{total !== 1 ? 's' : ''}
        </span>
      </div>

      {groups.length === 0 ? (
        <div style={{ fontFamily: 'var(--mono)', fontSize: '.8rem', color: 'var(--muted)', padding: '3rem 0', textAlign: 'center' }}>
          Sin resultados
        </div>
      ) : groups.map((g, gi) => {
        const isCollapsed = collapsed.has(g.name);
        return (
          <div key={g.id} className="asig-group fade-in" style={{ animationDelay: `${gi * 0.05}s` }}>
            <div
              className="asig-group-header"
              onClick={() => toggleCollapse(g.name)}
              onContextMenu={(e) => handleSubjectContextMenu(e, g.name)}
              onTouchStart={() => subjectLongPress.onStart(onEditSubject ? () => onEditSubject(g.id) : null)}
              onTouchEnd={subjectLongPress.onEnd}
              onTouchMove={subjectLongPress.onEnd}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            >
              <svg className={`chevron${isCollapsed ? ' collapsed' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <div className="asig-group-dot" style={{ background: g.color }} />
              <div className="asig-group-name">{g.name}</div>
              <div className="asig-group-count">{g.total} tema{g.total !== 1 ? 's' : ''}</div>
              <div className="asig-group-progress">
                <div className="asig-mini-bar">
                  <div className="asig-mini-fill" style={{ width: `${g.pct}%`, background: g.color }} />
                </div>
                <div className="asig-mini-pct">{g.mastered}/{g.totalTopics} · {g.pct}%</div>
              </div>
              {onEditSubject && (
                <button
                  className="asig-menu-btn"
                  onClick={e => { e.stopPropagation(); onEditSubject(g.id); }}
                  onTouchStart={e => e.stopPropagation()}
                  onTouchEnd={e => e.stopPropagation()}
                  title="Opciones de asignatura"
                >
                  <svg width="14" height="14" viewBox="0 0 4 16" fill="currentColor">
                    <circle cx="2" cy="2" r="1.5" />
                    <circle cx="2" cy="8" r="1.5" />
                    <circle cx="2" cy="14" r="1.5" />
                  </svg>
                </button>
              )}
            </div>
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  key="content"
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={{
                    open: { opacity: 1, height: "auto" },
                    collapsed: { opacity: 0, height: 0 }
                  }}
                  transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                  style={{ overflow: "hidden" }}
                >
                  <AnimatePresence mode="sync">
                    {g.topics.map((t) => (
                      <TopicCard
                        key={t.id}
                        topic={t}
                        subjects={subjects}
                        onMark={onMark}
                        onEditTopic={onEditTopic}
                        hideAsig
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
