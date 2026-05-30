import { useState, useEffect, useRef } from 'react';
import ModalShell from '../ui/ModalShell';
import { useOutsideClick } from '../../hooks/useOutsideClick';

const TOTAL_OPTS = [2, 3, 4, 5, 6];

export default function ConfigTopicModal({ isOpen, onClose, onConfirm, subjects, topics, initialAsig }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [slotId,            setSlotId]            = useState('');
  const [name,              setName]              = useState('');
  const [reviewsNeeded,     setReviewsNeeded]     = useState(4);
  const [slotOpen,          setSlotOpen]          = useState(false);
  const slotRef = useRef(null);

  useOutsideClick(slotRef, () => setSlotOpen(false), slotOpen);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedSubjectId(initialAsig ?? subjects[0]?.id ?? null);
    setName(''); setReviewsNeeded(4); setSlotId('');
  }, [isOpen, initialAsig]);

  useEffect(() => { setSlotId(''); setSlotOpen(false); }, [selectedSubjectId]);

  const emptySlots = topics.filter(t => t.subjectId === selectedSubjectId && !t.name);

  useEffect(() => {
    if (emptySlots.length > 0 && !slotId) setSlotId(emptySlots[0].id);
  }, [selectedSubjectId, emptySlots.length]);

  function getSlotNum(topicId) {
    return topics.filter(t => t.subjectId === selectedSubjectId).findIndex(t => t.id === topicId) + 1;
  }

  function handleConfirm() {
    if (!name.trim() || !slotId) return;
    onConfirm({ slotId, name: name.trim(), reviewsNeeded });
    onClose();
  }

  const keyHandlerRef = useRef(null);
  keyHandlerRef.current = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && name.trim() && slotId) handleConfirm();
  };

  useEffect(() => {
    if (!isOpen) return;
    function handler(e) { keyHandlerRef.current(e); }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const canConfirm = name.trim() && slotId && emptySlots.length > 0;

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <button className="btn-cancel" onClick={onClose}>✕</button>
      <div className="modal-asig" style={{ color: 'var(--muted)' }}>NUEVO TEMA</div>
      <div className="modal-title">Añadir tema</div>
      <div className="modal-divider" />

      <div className="modal-section-label">Asignatura</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginBottom: '1.5rem' }}>
        {subjects.map(s => (
          <button
            key={s.id}
            className={`filter-btn${selectedSubjectId === s.id ? ' active' : ''}`}
            style={selectedSubjectId === s.id ? { background: `${s.color}20`, borderColor: s.color, color: s.color } : {}}
            onClick={() => setSelectedSubjectId(s.id)}
          >
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: s.color, marginRight: 5, verticalAlign: 'middle', marginTop: -1 }} />
            {s.name}
          </button>
        ))}
      </div>

      <div className="modal-section-label">Posición</div>
      {emptySlots.length === 0 ? (
        <p style={{ fontFamily: 'var(--mono)', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
          Todos los temas de esta asignatura están configurados
        </p>
      ) : (
        <div className="custom-select" ref={slotRef}>
          <button
            className={`custom-select-trigger${slotOpen ? ' open' : ''}`}
            onClick={() => setSlotOpen(o => !o)}
            type="button"
          >
            <span>{slotId ? `Tema ${getSlotNum(slotId)}` : '— elige posición —'}</span>
            <svg className={`custom-select-chevron${slotOpen ? ' open' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="2,4 6,8 10,4" />
            </svg>
          </button>
          {slotOpen && (
            <div className="custom-select-list">
              {emptySlots.map(t => (
                <div
                  key={t.id}
                  className={`custom-select-option${slotId === t.id ? ' selected' : ''}`}
                  onClick={() => { setSlotId(t.id); setSlotOpen(false); }}
                >
                  Tema {getSlotNum(t.id)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="modal-section-label">Nombre del tema</div>
      <input
        className="modal-input"
        type="text"
        placeholder="ej. Introducción a SQL"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
      />

      <div className="modal-section-label">Repasos necesarios</div>
      <div style={{ display: 'flex', gap: '.4rem', marginBottom: '1.5rem' }}>
        {TOTAL_OPTS.map(n => (
          <button
            key={n}
            className={`diff-btn normal${reviewsNeeded === n ? ' selected' : ''}`}
            style={{ flex: 1, ...(reviewsNeeded === n ? { background: 'rgba(200,251,78,.1)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}) }}
            onClick={() => setReviewsNeeded(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <button
        className="btn-confirm"
        disabled={!canConfirm}
        onClick={handleConfirm}
      >
        Confirmar tema
        <span style={{ opacity: .5, fontSize: '.7rem', marginLeft: '.5rem' }}>Enter ↵</span>
      </button>
    </ModalShell>
  );
}
