import { useState, useRef } from 'react';
import Panel from '../components/ui/Panel';
import StatusTag from '../components/ui/StatusTag';
import Skeleton from '../components/ui/Skeleton';
import AsyncSection from '../components/ui/AsyncSection';
import { getTopicStatus, getAsigColor, compareByUrgency } from '../utils/topicHelpers';

function examCountdownLabel(diff) {
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'mañana';
  if (diff > 1)   return `en ${diff} días`;
  return diff === -1 ? 'ayer' : `hace ${-diff} días`;
}

const CAL_DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_NAMES    = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function mondayDow(date) {
  return (date.getDay() + 6) % 7; // Monday=0 ... Sunday=6
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - mondayDow(d));
  return d;
}

function buildWeekDays(date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
}

function weekRangeLabel(weekDaysArr) {
  const first = weekDaysArr[0], last = weekDaysArr[6];
  const sameMonth = first.getMonth() === last.getMonth();
  const sameYear  = first.getFullYear() === last.getFullYear();
  const fmt = (d, withMonth) => `${d.getDate()}${withMonth ? ' ' + MONTH_NAMES[d.getMonth()].slice(0, 3).toLowerCase() : ''}`;
  const firstLabel = `${fmt(first, !sameMonth)}${!sameYear ? ' ' + first.getFullYear() : ''}`;
  return `${firstLabel} – ${fmt(last, true)} ${last.getFullYear()}`;
}

export default function Calendario({ topics, subjects, exams, onAddExam, onDeleteExam, onNavigateTopic, calendarState }) {
  const ready = !calendarState.isLoading && !calendarState.error && topics && subjects && exams;
  const safeTopics   = topics ?? [];
  const safeSubjects = subjects ?? [];
  const safeExams    = exams ?? [];

  // Recalculado en cada render: memoizarlo dejaba "hoy" anclado si la vista cruzaba la medianoche.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [sel,   setSel]   = useState(today);
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
  const [showOverdue, setShowOverdue] = useState(false);
  // Borrado en dos pasos: el primer clic arma el botón, el segundo confirma.
  const [pendingDeleteExam, setPendingDeleteExam] = useState(null);

  // ── long-press / right-click para añadir examen ──────────
  const pressTimer        = useRef(null);
  const longPressTriggered = useRef(false);

  function handleDayTouchStart(date) {
    longPressTriggered.current = false;
    if (!onAddExam) return;
    pressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      if (window.navigator.vibrate) window.navigator.vibrate(50);
      onAddExam(date);
    }, 600);
  }

  function handleDayTouchEnd() {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }

  function handleDayContextMenu(e, date) {
    if (!onAddExam) return;
    e.preventDefault();
    onAddExam(date);
  }

  function getTopicDate(t) {
    if (!t.name || t.nextReviewDate === null) return null;
    const [y, m, d] = t.nextReviewDate.split('-').map(Number);
    const reviewDate = new Date(y, m - 1, d);
    return reviewDate < today ? today : reviewDate;
  }

  function buildDays() {
    const first    = new Date(year, month, 1);
    const startDow = mondayDow(first);
    const daysInMonth     = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = startDow - 1; i >= 0; i--)
      days.push({ date: new Date(year, month - 1, daysInPrevMonth - i), other: true });
    for (let d = 1; d <= daysInMonth; d++)
      days.push({ date: new Date(year, month, d), other: false });
    let nd = 1;
    while (days.length < 42)
      days.push({ date: new Date(year, month + 1, nd++), other: true });
    return days;
  }

  function getDayTopics(date) {
    return safeTopics.filter(t => { const td = getTopicDate(t); return td && sameDay(td, date); });
  }
  function getDayExams(date) {
    return safeExams.filter(e => sameDay(new Date(e.date), date));
  }

  const days      = buildDays();
  const weekDays  = buildWeekDays(sel);
  const selTopics = getDayTopics(sel);
  const selExams  = getDayExams(sel);

  // Los atrasados se acumulan en "hoy": se muestran plegados para que
  // lo que toca de verdad hoy no quede enterrado bajo la lista de retrasos.
  const selSorted   = [...selTopics].sort(compareByUrgency);
  const selOverdue  = selSorted.filter(t => getTopicStatus(t) === 'overdue');
  const selOnTime   = selSorted.filter(t => getTopicStatus(t) !== 'overdue');

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }
  function prevWeek()  { const d = new Date(sel); d.setDate(d.getDate() - 7); setSel(d); setYear(d.getFullYear()); setMonth(d.getMonth()); }
  function nextWeek()  { const d = new Date(sel); d.setDate(d.getDate() + 7); setSel(d); setYear(d.getFullYear()); setMonth(d.getMonth()); }
  function goToday()   { setYear(today.getFullYear()); setMonth(today.getMonth()); setSel(today); }

  const selDateLabel = sel.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const selDateCap   = selDateLabel.charAt(0).toUpperCase() + selDateLabel.slice(1);

  return (
    <div className="page-wrap">
      <div className="cal-wrap fade-in">

        <div>
          <div className="filter-bar cal-view-toggle">
            <button className={`filter-btn${viewMode === 'month' ? ' active' : ''}`} onClick={() => setViewMode('month')}>Mes</button>
            <button className={`filter-btn${viewMode === 'week' ? ' active' : ''}`} onClick={() => setViewMode('week')}>Semana</button>
          </div>

          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={viewMode === 'month' ? prevMonth : prevWeek}>‹</button>
            <div className="cal-month-label">{viewMode === 'month' ? `${MONTH_NAMES[month]} ${year}` : weekRangeLabel(weekDays)}</div>
            <div style={{ display: 'flex', gap: '.4rem' }}>
              <button className="cal-today-btn" onClick={goToday}>Hoy</button>
              <button className="cal-nav-btn" onClick={viewMode === 'month' ? nextMonth : nextWeek}>›</button>
            </div>
          </div>

          {viewMode === 'month' ? (
            <div className="cal-grid">
              {CAL_DAY_LABELS.map(l => <div key={l} className="cal-day-hdr">{l}</div>)}
              {days.map((day, i) => {
                const dayTopics = getDayTopics(day.date);
                const dayExams  = getDayExams(day.date);
                const isToday   = sameDay(day.date, today);
                const isSel     = sameDay(day.date, sel);
                const dotColors = [...new Set(dayTopics.map(t => getAsigColor(t.subjectId, safeSubjects)).filter(Boolean))];
                return (
                  <div
                    key={i}
                    className={`cal-day${day.other ? ' other-month' : ''}${isToday ? ' is-today' : ''}${isSel ? ' selected' : ''}${dayExams.length ? ' has-exam' : ''}`}
                    onClick={() => { if (!longPressTriggered.current) { setSel(day.date); if (day.other) { setMonth(day.date.getMonth()); setYear(day.date.getFullYear()); } } }}
                    onContextMenu={(e) => handleDayContextMenu(e, day.date)}
                    onTouchStart={() => handleDayTouchStart(day.date)}
                    onTouchEnd={handleDayTouchEnd}
                    onTouchMove={handleDayTouchEnd}
                  >
                    <div className="cal-day-num">{day.date.getDate()}</div>
                    {(dayExams.length > 0 || dotColors.length > 0) && (
                      <div className="cal-dots">
                        {dayExams.map(e => (
                          <div key={`exam-${e.id}`} className="cal-dot-sm" style={{ background: 'var(--warn)' }} title={e.name} />
                        ))}
                        {dotColors.map(c => (
                          <div key={`color-${c}`} className="cal-dot-sm" style={{ background: c }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="cal-week-list">
              {weekDays.map(d => {
                const dTopics = getDayTopics(d);
                const dExams  = getDayExams(d);
                const isToday = sameDay(d, today);
                const isSel   = sameDay(d, sel);
                const visibleTopics = dTopics.slice(0, 4);
                const extra = dTopics.length - visibleTopics.length;
                return (
                  <div
                    key={d.toISOString()}
                    className={`cal-week-row${isToday ? ' is-today' : ''}${isSel ? ' selected' : ''}`}
                    onClick={() => { if (!longPressTriggered.current) { setSel(d); setMonth(d.getMonth()); setYear(d.getFullYear()); } }}
                    onContextMenu={(e) => handleDayContextMenu(e, d)}
                    onTouchStart={() => handleDayTouchStart(d)}
                    onTouchEnd={handleDayTouchEnd}
                    onTouchMove={handleDayTouchEnd}
                  >
                    <div className="cal-week-row-day">
                      <span className="cal-week-row-dow">{CAL_DAY_LABELS[mondayDow(d)]}</span>
                      <span className="cal-week-row-num">{d.getDate()}</span>
                    </div>
                    <div className="cal-week-row-content">
                      {!ready && <Skeleton w={110} h={16} r={9} />}
                      {ready && dTopics.length === 0 && dExams.length === 0 && (
                        <span className="cal-week-row-empty">Sin repasos</span>
                      )}
                      {dExams.map(e => (
                        <span key={`exam-${e.id}`} className="cal-week-chip exam" title={e.name}>📅 {e.name}</span>
                      ))}
                      {visibleTopics.map(t => (
                        <span
                          key={t.id}
                          className="cal-week-chip"
                          title={t.name}
                          onClick={(e) => { e.stopPropagation(); onNavigateTopic && onNavigateTopic(t); }}
                          style={onNavigateTopic ? { cursor: 'pointer' } : undefined}
                        >
                          <span className="cal-week-chip-dot" style={{ background: getAsigColor(t.subjectId, safeSubjects) }} />
                          {t.name}
                        </span>
                      ))}
                      {extra > 0 && <span className="cal-week-chip cal-week-chip-more">+{extra}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="cal-legend">
            <div className="cal-legend-item">
              <div className="cal-dot-sm" style={{ background: 'var(--warn)' }} />
              Exámenes
            </div>
            {!ready && [0, 1, 2].map(i => (
              <div key={`sk-${i}`} className="cal-legend-item">
                <Skeleton w={7} h={7} r="50%" />
                <Skeleton w={68 + i * 14} h={10} />
              </div>
            ))}
            {safeSubjects.map(s => (
              <div key={s.id} className="cal-legend-item">
                <div className="cal-dot-sm" style={{ background: s.color }} />
                {s.name}
              </div>
            ))}
          </div>
        </div>

        <div className="cal-side">
          <Panel
            title={selDateCap}
            titleAction={onAddExam && (
              <button
                onClick={() => onAddExam(sel)}
                title={ready ? 'Añadir examen' : 'Cargando…'}
                type="button"
                disabled={!ready}
                style={{
                  background: 'none', border: '1px solid var(--border2)', borderRadius: 6,
                  color: 'var(--muted)', width: 22, height: 22, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  fontSize: '1rem', lineHeight: 1, flexShrink: 0,
                  transition: 'color .15s, border-color .15s, background .15s',
                  ...(ready ? null : { opacity: .4, cursor: 'not-allowed' }),
                }}
                onMouseEnter={e => { if (!ready) return; e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='rgba(var(--accent-rgb),.08)'; }}
                onMouseLeave={e => { if (!ready) return; e.currentTarget.style.color='var(--muted)'; e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.background='none'; }}
              >
                +
              </button>
            )}
          >
            <AsyncSection
              isLoading={calendarState.isLoading}
              error={calendarState.error}
              onRetry={calendarState.retry}
              skeleton={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem', padding: '.4rem 0' }}>
                  {[0, 1, 2].map(i => <Skeleton key={i} h={16} w={`${88 - i * 14}%`} />)}
                </div>
              }
            >
            {selExams.length === 0 && selTopics.length === 0 && (
              <div className="cal-side-empty">Sin repasos ni exámenes este día</div>
            )}
            {selExams.map(exam => {
              const diff = Math.round((new Date(exam.date) - today) / 86400000);
              return (
                <div key={exam.id} className="risk-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.15rem', flex: 1, minWidth: 0 }}>
                    <div className="risk-name">📅 {exam.name}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '.7rem', color: 'var(--muted)' }}>{safeSubjects.find(s => s.id === exam.subjectId)?.name ?? ''}</div>
                  </div>
                  <span className={`exam-countdown ${diff <= 7 ? 'urgent' : diff <= 14 ? 'soon' : 'ok'}`}>{examCountdownLabel(diff)}</span>
                  {onDeleteExam && (
                    <button
                      className={`cal-event-del-btn${pendingDeleteExam === exam.id ? ' armed' : ''}`}
                      onClick={() => {
                        if (pendingDeleteExam === exam.id) {
                          setPendingDeleteExam(null);
                          onDeleteExam(exam.id);
                        } else {
                          setPendingDeleteExam(exam.id);
                        }
                      }}
                      onBlur={() => setPendingDeleteExam(p => p === exam.id ? null : p)}
                      title={pendingDeleteExam === exam.id ? 'Confirmar borrado' : 'Borrar examen'}
                    >
                      {pendingDeleteExam === exam.id ? '¿Borrar?' : '✕'}
                    </button>
                  )}
                </div>
              );
            })}
            {selOnTime.length > 0 && (
              <div style={{ marginTop: selExams.length ? '.75rem' : 0 }}>
                <div className="cal-side-section">Repasos ({selOnTime.length})</div>
                {selOnTime.map(t => (
                  <div
                    key={t.id}
                    className="risk-row"
                    onClick={() => onNavigateTopic && onNavigateTopic(t)}
                    style={onNavigateTopic ? { cursor: 'pointer' } : undefined}
                    title={onNavigateTopic ? 'Ir al tema' : undefined}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flex: 1, minWidth: 0 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: getAsigColor(t.subjectId, safeSubjects), flexShrink: 0, display: 'inline-block' }} />
                      <div className="risk-name" style={{ fontSize: '.78rem' }}>{t.name}</div>
                    </div>
                    <StatusTag status={getTopicStatus(t)} />
                  </div>
                ))}
              </div>
            )}
            {selOverdue.length > 0 && (
              <div style={{ marginTop: selOnTime.length || selExams.length ? '.75rem' : 0 }}>
                <button
                  className="cal-side-section cal-side-toggle"
                  onClick={() => setShowOverdue(v => !v)}
                  aria-expanded={showOverdue}
                >
                  <svg className={`chevron${showOverdue ? '' : ' collapsed'}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  Atrasados ({selOverdue.length})
                </button>
                {showOverdue && selOverdue.map(t => (
                  <div
                    key={t.id}
                    className="risk-row"
                    onClick={() => onNavigateTopic && onNavigateTopic(t)}
                    style={onNavigateTopic ? { cursor: 'pointer' } : undefined}
                    title={onNavigateTopic ? 'Ir al tema' : undefined}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flex: 1, minWidth: 0 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: getAsigColor(t.subjectId, safeSubjects), flexShrink: 0, display: 'inline-block' }} />
                      <div className="risk-name" style={{ fontSize: '.78rem' }}>{t.name}</div>
                    </div>
                    <StatusTag status={getTopicStatus(t)} />
                  </div>
                ))}
              </div>
            )}
            </AsyncSection>
          </Panel>
        </div>

      </div>
    </div>
  );
}
