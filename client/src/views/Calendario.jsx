import { useState, useMemo, useRef } from 'react';
import Panel from '../components/ui/Panel';
import StatusTag from '../components/ui/StatusTag';
import { getTopicStatus, getAsigColor } from '../utils/topicHelpers';

const CAL_DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_NAMES    = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function Calendario({ topics, subjects, exams, onAddExam, onDeleteExam }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [sel,   setSel]   = useState(today);

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
    const startDow = (first.getDay() + 6) % 7;
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
    return topics.filter(t => { const td = getTopicDate(t); return td && sameDay(td, date); });
  }
  function getDayExams(date) {
    return exams.filter(e => sameDay(new Date(e.date), date));
  }

  const days      = buildDays();
  const selTopics = getDayTopics(sel);
  const selExams  = getDayExams(sel);

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  const selDateLabel = sel.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const selDateCap   = selDateLabel.charAt(0).toUpperCase() + selDateLabel.slice(1);

  return (
    <div className="page-wrap">
      <div className="cal-wrap fade-in">

        <div>
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
            <div className="cal-month-label">{MONTH_NAMES[month]} {year}</div>
            <button className="cal-nav-btn" onClick={nextMonth}>›</button>
          </div>

          <div className="cal-grid">
            {CAL_DAY_LABELS.map(l => <div key={l} className="cal-day-hdr">{l}</div>)}
            {days.map((day, i) => {
              const dayTopics = getDayTopics(day.date);
              const dayExams  = getDayExams(day.date);
              const isToday   = sameDay(day.date, today);
              const isSel     = sameDay(day.date, sel);
              const dotColors = [...new Set(dayTopics.map(t => getAsigColor(t.subjectId, subjects)).filter(Boolean))];
              return (
                <div
                  key={i}
                  className={`cal-day${day.other ? ' other-month' : ''}${isToday ? ' is-today' : ''}${isSel ? ' selected' : ''}${dayExams.length ? ' has-exam' : ''}`}
                  onClick={() => { if (!longPressTriggered.current) { setSel(day.date); if (day.other) { setMonth(day.date.getMonth()); setYear(day.date.getFullYear()); } } }}
                  onContextMenu={(e) => handleDayContextMenu(e, day.date)}
                  onTouchStart={() => handleDayTouchStart(day.date)}
                  onTouchEnd={handleDayTouchEnd}
                  onTouchMove={handleDayTouchEnd}
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
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

          <div className="cal-legend">
            <div className="cal-legend-item">
              <div className="cal-dot-sm" style={{ background: 'var(--warn)' }} />
              Exámenes
            </div>
            {subjects.map(s => (
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
                title="Añadir evento"
                type="button"
                style={{
                  background: 'none', border: '1px solid var(--border2)', borderRadius: 6,
                  color: 'var(--muted)', width: 22, height: 22, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  fontSize: '1rem', lineHeight: 1, flexShrink: 0,
                  transition: 'color .15s, border-color .15s, background .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='rgba(var(--accent-rgb),.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.color='var(--muted)'; e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.background='none'; }}
              >
                +
              </button>
            )}
          >
            {selExams.length === 0 && selTopics.length === 0 && (
              <div className="cal-side-empty">Sin eventos este día</div>
            )}
            {selExams.map(exam => {
              const diff = Math.round((new Date(exam.date) - today) / 86400000);
              return (
                <div key={exam.id} className="risk-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.15rem', flex: 1, minWidth: 0 }}>
                    <div className="risk-name">📅 {exam.name}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '.65rem', color: 'var(--muted)' }}>{subjects.find(s => s.id === exam.subjectId)?.name ?? ''}</div>
                  </div>
                  <span className={`exam-countdown ${diff <= 7 ? 'urgent' : diff <= 14 ? 'soon' : 'ok'}`}>{diff}d</span>
                  {onDeleteExam && (
                    <button
                      className="cal-event-del-btn"
                      onClick={() => onDeleteExam(exam.id)}
                      title="Borrar evento"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
            {selTopics.length > 0 && (
              <div style={{ marginTop: selExams.length ? '.75rem' : 0 }}>
                <div className="cal-side-section">Repasos ({selTopics.length})</div>
                {selTopics.map(t => (
                  <div key={t.id} className="risk-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flex: 1, minWidth: 0 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: getAsigColor(t.subjectId, subjects), flexShrink: 0, display: 'inline-block' }} />
                      <div className="risk-name" style={{ fontSize: '.78rem' }}>{t.name}</div>
                    </div>
                    <StatusTag status={getTopicStatus(t)} />
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

      </div>
    </div>
  );
}
