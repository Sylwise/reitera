import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopicCard from '../components/ui/TopicCard';
import Skeleton from '../components/ui/Skeleton';
import AsyncSection from '../components/ui/AsyncSection';
import { getTopicStatus, compareByUrgency } from '../utils/topicHelpers';
import { useLongPress } from '../hooks/useLongPress';

const FILTERS = [
  { key: 'pending',  label: 'Pendientes' },
  { key: 'all',      label: 'Todos'      },
  { key: 'mastered', label: 'Afianzados' },
];

function computeCollapsed(subjects, topics, effectiveFocusAsig) {
  const s = new Set();
  subjects.forEach(subj => {
    if (effectiveFocusAsig) {
      if (subj.id !== effectiveFocusAsig) s.add(subj.name);
    } else {
      const ts = topics.filter(t => t.subjectId === subj.id);
      const hasPending = ts.some(t => ['today', 'overdue'].includes(getTopicStatus(t)));
      if (!hasPending) s.add(subj.name);
    }
  });
  return s;
}

function TopicRowSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-row">
        <Skeleton w={8} h={8} r="50%" />
        <Skeleton w="40%" h={13} />
        <Skeleton w={54} h={18} r={9} style={{ marginLeft: 'auto' }} />
      </div>
      <Skeleton w="25%" h={10} />
    </div>
  );
}

function TemasSkeleton() {
  return (
    <>
      {[0, 1].map(g => (
        <div key={g} className="asig-group">
          <div className="asig-group-header skeleton-asig-row">
            <Skeleton w={10} h={10} r="50%" />
            <Skeleton w={120} h={14} />
            <Skeleton w={58} h={11} style={{ marginLeft: 'auto' }} />
          </div>
          {[0, 1].map(i => <TopicRowSkeleton key={i} />)}
        </div>
      ))}
    </>
  );
}

export default function Temas({ topics, subjects, onMark, onEditTopic, onEditSubject, onAddTopic, focusAsig, focusTopicId, coreState }) {
  const ready = !coreState.isLoading && !coreState.error && topics && subjects;
  const safeTopics   = topics ?? [];
  const safeSubjects = subjects ?? [];

  const focusTopic       = focusTopicId != null ? safeTopics.find(t => t.id === focusTopicId) : null;
  const effectiveFocusAsig = focusAsig ?? focusTopic?.subjectId ?? null;

  const [filter, setFilter] = useState(effectiveFocusAsig ? 'all' : 'pending');
  const [search, setSearch] = useState('');
  const [highlightId, setHighlightId] = useState(focusTopicId ?? null);

  const subjectLongPress = useLongPress();

  const [collapsed, setCollapsed] = useState(() => computeCollapsed(safeSubjects, safeTopics, effectiveFocusAsig));

  // Al cambiar el foco de asignatura, se recalcula qué grupos van plegados y el filtro.
  const [prevFocusAsig, setPrevFocusAsig] = useState(focusAsig);
  if (focusAsig !== prevFocusAsig) {
    setPrevFocusAsig(focusAsig);
    setCollapsed(computeCollapsed(safeSubjects, safeTopics, effectiveFocusAsig));
    setFilter(effectiveFocusAsig ? 'all' : 'pending');
  }

  // En el primer render los datos aún no han llegado, así que el plegado inicial se
  // calcula cuando de verdad hay temas con los que decidir.
  const [wasReady, setWasReady] = useState(ready);
  if (ready && !wasReady) {
    setWasReady(true);
    setCollapsed(computeCollapsed(safeSubjects, safeTopics, effectiveFocusAsig));
  }

  // Scroll + flash-highlight al tema que nos trajo aquí desde el calendario.
  useEffect(() => {
    if (focusTopicId == null) return;
    const scrollTimer = setTimeout(() => {
      document.getElementById(`topic-card-${focusTopicId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
    const clearTimer = setTimeout(() => setHighlightId(null), 2200);
    return () => { clearTimeout(scrollTimer); clearTimeout(clearTimer); };
  }, [focusTopicId]);

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
    const subjectName = safeSubjects.find(s => s.id === t.subjectId)?.name ?? '';
    return t.name?.toLowerCase().includes(q) || subjectName.toLowerCase().includes(q);
  }

  const groups = safeSubjects.map(subj => {
    const { id, name, color, totalTopics } = subj;
    const subjTopics = safeTopics.filter(t => t.subjectId === id);
    const filtered   = subjTopics.filter(t => matchesFilter(t) && matchesSearch(t)).sort(compareByUrgency);
    const mastered   = subjTopics.filter(t => getTopicStatus(t) === 'mastered').length;
    const pct        = totalTopics > 0 ? Math.round(mastered / totalTopics * 100) : 0;
    return { id, name, color, topics: filtered, mastered, total: subjTopics.length, totalTopics, pct };
  }).filter(g => g.topics.length > 0);

  const total = safeTopics.filter(t => matchesFilter(t) && matchesSearch(t)).length;
  // Coincidencias de la búsqueda que el filtro activo está ocultando.
  const hiddenByFilter = search && filter !== 'all'
    ? safeTopics.filter(t => matchesSearch(t)).length - total
    : 0;

  return (
    <div className="page-wrap" style={{ maxWidth: 960 }}>
      <div className="temas-header fade-in">
        <div className="temas-title-row">
          <div className="temas-title">Todos los temas</div>
          {onAddTopic && (!ready || safeSubjects.length > 0) && (
            <button
              className="temas-add-btn"
              onClick={onAddTopic}
              aria-label="Añadir tema"
              type="button"
              disabled={!ready}
              title={ready ? undefined : (coreState.error ? 'No se han podido cargar los datos' : 'Cargando…')}
              style={!ready ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
        </div>
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            className="search-input"
            type="text"
            placeholder="Buscar tema o asignatura..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')} aria-label="Limpiar búsqueda" type="button">
              ✕
            </button>
          )}
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
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: '.7rem', color: 'var(--muted)', alignSelf: 'center' }}>
          {ready ? (
            <>
              {total} resultado{total !== 1 ? 's' : ''}
              {hiddenByFilter > 0 && (
                <button className="link-btn" onClick={() => setFilter('all')}>
                  +{hiddenByFilter} en “Todos”
                </button>
              )}
            </>
          ) : (
            <Skeleton w={72} h={11} />
          )}
        </span>
      </div>

      <AsyncSection
        isLoading={coreState.isLoading}
        error={coreState.error}
        onRetry={coreState.retry}
        skeleton={<TemasSkeleton />}
      >
      {groups.length === 0 ? (
        <div className="fade-in" style={{ fontFamily: 'var(--mono)', fontSize: '.8rem', color: 'var(--muted)', padding: '3rem 0', textAlign: 'center' }}>
          <div>Sin resultados{search ? <> para <span style={{ color: 'var(--text)' }}>“{search}”</span></> : ''}</div>
          <div style={{ marginTop: '.9rem', display: 'flex', gap: '.5rem', justifyContent: 'center' }}>
            {hiddenByFilter > 0 && (
              <button className="filter-btn" onClick={() => setFilter('all')}>
                Ver {hiddenByFilter} resultado{hiddenByFilter !== 1 ? 's' : ''} en “Todos”
              </button>
            )}
            {search && (
              <button className="filter-btn" onClick={() => setSearch('')}>Limpiar búsqueda</button>
            )}
          </div>
        </div>
      ) : groups.map((g, gi) => {
        const isCollapsed = !search && collapsed.has(g.name);
        return (
          <div key={g.id} className="asig-group fade-in" style={{ animationDelay: `${gi * 0.05}s` }}>
            <div
              className="asig-group-header"
              onClick={() => toggleCollapse(g.name)}
              onContextMenu={(e) => handleSubjectContextMenu(e, g.id)}
              onTouchStart={() => subjectLongPress.onStart(onEditSubject ? () => onEditSubject(g.id) : null)}
              onTouchEnd={subjectLongPress.onEnd}
              onTouchMove={subjectLongPress.onEnd}
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
                  style={{ overflow: "hidden", paddingTop: "3px" }}
                >
                  <AnimatePresence mode="sync">
                    {g.topics.map((t) => (
                      <TopicCard
                        key={t.id}
                        topic={t}
                        subjects={safeSubjects}
                        onMark={onMark}
                        onEditTopic={onEditTopic}
                        hideAsig
                        highlighted={t.id === highlightId}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      </AsyncSection>
    </div>
  );
}
