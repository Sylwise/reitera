import { useState, useEffect } from 'react';
import ModalShell from '../ui/ModalShell';

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const DAYS   = ['L','M','X','J','V','S','D'];

function startOfDay(d) {
  const c = new Date(d); c.setHours(0,0,0,0); return c;
}

/** Mini calendario inline para elegir la fecha sin el picker nativo feo */
function DatePicker({ value, onChange }) {
  const [year,  setYear]  = useState(value.getFullYear());
  const [month, setMonth] = useState(value.getMonth());

  function prevM() { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }
  function nextM() { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }

  function buildDays() {
    const first    = new Date(year, month, 1);
    const startDow = (first.getDay() + 6) % 7;
    const inMonth  = new Date(year, month+1, 0).getDate();
    const prevLast = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = startDow-1; i >= 0; i--)
      days.push({ d: new Date(year, month-1, prevLast-i), other: true });
    for (let d = 1; d <= inMonth; d++)
      days.push({ d: new Date(year, month, d), other: false });
    let nd = 1;
    while (days.length < 42) days.push({ d: new Date(year, month+1, nd++), other: true });
    return days;
  }

  const days = buildDays();
  const today = startOfDay(new Date());

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.6rem' }}>
        <button className="cal-nav-btn" onClick={prevM} type="button">‹</button>
        <span style={{ fontFamily:'var(--mono)', fontSize:'.78rem', fontWeight:600 }}>
          {MONTHS[month]} {year}
        </span>
        <button className="cal-nav-btn" onClick={nextM} type="button">›</button>
      </div>
      {/* header días */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:2 }}>
        {DAYS.map(l => (
          <div key={l} style={{ fontFamily:'var(--mono)', fontSize:'.6rem', color:'var(--muted)', textAlign:'center', padding:'.25rem 0' }}>{l}</div>
        ))}
      </div>
      {/* celdas */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {days.map(({ d, other }, i) => {
          const isToday = d.getTime() === today.getTime();
          const isSel   = d.getTime() === startOfDay(value).getTime();
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(d)}
              style={{
                border: isSel
                  ? '1.5px solid var(--accent)'
                  : '1px solid transparent',
                borderRadius: 6,
                padding: '.3rem 0',
                fontFamily: 'var(--mono)',
                fontSize: '.72rem',
                fontWeight: isSel || isToday ? 700 : 400,
                background: isSel
                  ? 'rgba(var(--accent-rgb),.12)'
                  : 'transparent',
                color: other
                  ? 'var(--muted)'
                  : isSel
                    ? 'var(--accent)'
                    : isToday
                      ? 'var(--accent)'
                      : 'var(--text)',
                cursor: 'pointer',
                transition: 'background .1s',
                outline: 'none',
              }}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AddExamModal({ isOpen, onClose, onAdd, subjects, initialDate }) {
  const [name,      setName]      = useState('');
  const [subjectId, setSubjectId] = useState(null);
  const [date,      setDate]      = useState(new Date());
  useEffect(() => {
    if (isOpen) {
      setName('');
      setSubjectId(subjects[0]?.id ?? null);
      setDate(startOfDay(initialDate instanceof Date ? initialDate : new Date()));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && canSubmit) handleAdd();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, name, subjectId, date]);

  const canSubmit = name.trim() && subjectId != null;

  function handleAdd() {
    if (!canSubmit) return;
    const d = new Date(date); d.setHours(12, 0, 0, 0);
    onAdd({ name: name.trim(), subjectId, date: d });
    onClose();
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <button className="btn-cancel" onClick={onClose}>✕</button>

      <div className="modal-asig" style={{ color: 'var(--muted)' }}>NUEVO EVENTO</div>
      <div className="modal-title">Añadir evento</div>
      <div className="modal-divider" />

      <div className="modal-section-label">Nombre</div>
      <input
        className="modal-input"
        type="text"
        maxLength={50}
        placeholder="ej. Examen Bases de datos"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
      />

      <div className="modal-section-label">Asignatura</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginBottom: '1.5rem' }}>
        {subjects.map(s => (
          <button
            key={s.id}
            type="button"
            className={`filter-btn${subjectId === s.id ? ' active' : ''}`}
            style={subjectId === s.id
              ? { background: `${s.color}20`, borderColor: s.color, color: s.color }
              : {}}
            onClick={() => setSubjectId(s.id)}
          >
            <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background: s.color, marginRight:5, verticalAlign:'middle', marginTop:-1 }} />
            {s.name}
          </button>
        ))}
      </div>

      <div className="modal-section-label">Fecha</div>
      <DatePicker value={date} onChange={setDate} />

      <button
        className="btn-confirm"
        disabled={!canSubmit}
        onClick={handleAdd}
      >
        Añadir evento
        <span style={{ opacity: .5, fontSize: '.7rem', marginLeft: '.5rem' }}>Enter ↵</span>
      </button>
    </ModalShell>
  );
}
