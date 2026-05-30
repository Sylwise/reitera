import { useState, useEffect } from 'react';
import ModalShell from '../ui/ModalShell';
import { PALETTE } from '../../data/subjects';

export default function AddSubjectModal({ isOpen, onClose, onAdd }) {
  const [name,        setName]        = useState('');
  const [totalTopics, setTotalTopics] = useState(6);
  const [color,       setColor]       = useState(PALETTE[0]);

  useEffect(() => {
    if (isOpen) { setName(''); setTotalTopics(6); setColor(PALETTE[0]); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && name.trim()) handleAdd();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, name, totalTopics, color]);

  function handleAdd() {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), totalTopics: Math.max(1, totalTopics), color });
    onClose();
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <button className="btn-cancel" onClick={onClose}>✕</button>

      <div className="modal-asig" style={{ color: 'var(--muted)' }}>NUEVA ASIGNATURA</div>
      <div className="modal-title" style={{ paddingBottom: '0.15em' }}>Añadir asignatura</div>
      <div className="modal-divider" />

      <div className="modal-section-label">Nombre</div>
      <input
        className="modal-input"
        type="text"
        maxLength={40}
        placeholder="ej. Programación"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
      />

      <div className="modal-section-label">Temas totales del curso</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.5rem' }}>
        <button className="stepper-btn" onClick={() => setTotalTopics(t => Math.max(1, t - 1))}>−</button>
        <input
          className="stepper-input"
          type="number"
          min={1}
          max={50}
          value={totalTopics}
          onChange={e => setTotalTopics(Math.max(1, parseInt(e.target.value) || 1))}
        />
        <button className="stepper-btn" onClick={() => setTotalTopics(t => Math.min(50, t + 1))}>+</button>
      </div>

      <div className="modal-section-label">Color</div>
      <div className="color-picker">
        {PALETTE.map(c => (
          <button
            key={c}
            className={`color-swatch${color === c ? ' selected' : ''}`}
            style={{ '--swatch-color': c, background: c, borderColor: color === c ? '#fff' : 'transparent', boxShadow: color === c ? `0 0 0 2px ${c}` : 'none' }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>

      <button
        className="btn-confirm"
        disabled={!name.trim()}
        onClick={handleAdd}
      >
        Crear asignatura
        <span style={{ opacity: .5, fontSize: '.7rem', marginLeft: '.5rem' }}>Enter ↵</span>
      </button>
    </ModalShell>
  );
}
