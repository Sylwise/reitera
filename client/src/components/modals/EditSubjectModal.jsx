import { useState, useEffect, useRef } from 'react';
import ModalShell from '../ui/ModalShell';
import { PALETTE } from '../../data/subjects';

export default function EditSubjectModal({ isOpen, onClose, onEdit, onDelete, subject }) {
  const [name,        setName]        = useState('');
  const [totalTopics, setTotalTopics] = useState(6);
  const [color,       setColor]       = useState(PALETTE[0]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && subject) {
      setName(subject.name);
      setTotalTopics(subject.totalTopics);
      setColor(subject.color);
      setShowConfirm(false);
    }
  }, [isOpen, subject]);

  const keyHandlerRef = useRef(null);
  keyHandlerRef.current = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && name.trim() && !showConfirm) handleEdit();
  };

  useEffect(() => {
    if (!isOpen) return;
    function handler(e) { keyHandlerRef.current(e); }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  function handleEdit() {
    if (!name.trim() || !subject) return;
    onEdit({ id: subject.id, newName: name.trim(), totalTopics: Math.max(1, totalTopics), color });
    onClose();
  }

  function handleDelete() {
    if (!subject) return;
    onDelete(subject.id);
    onClose();
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <button className="btn-cancel" onClick={onClose}>✕</button>

      <div className="modal-asig" style={{ color: 'var(--muted)' }}>AJUSTES</div>
      <div className="modal-title" style={{ paddingBottom: '0.15em' }}>Editar asignatura</div>
      <div className="modal-divider" />

      {showConfirm ? (
        <div className="fade-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ margin: '0 0 .5rem', color: 'var(--text)' }}>¿Estás seguro?</h3>
          <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
            Esto borrará permanentemente la asignatura "{subject?.name}" y todos sus temas. Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-configure" style={{ flex: 1, background: 'var(--surface)', color: 'var(--text)' }} onClick={() => setShowConfirm(false)}>
              Cancelar
            </button>
            <button className="btn-confirm" style={{ flex: 1, background: 'var(--danger)', borderColor: 'var(--danger)', color: '#fff' }} onClick={handleDelete}>
              Sí, borrar
            </button>
          </div>
        </div>
      ) : (
        <div className="fade-in">
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
          <div className="color-picker" style={{ marginBottom: '1.5rem' }}>
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
            onClick={handleEdit}
            style={{ marginBottom: '1rem' }}
          >
            Guardar cambios
          </button>

          <button
            className="btn-configure"
            onClick={() => setShowConfirm(true)}
            style={{ width: '100%', borderColor: 'transparent', color: 'var(--danger)', background: 'transparent' }}
          >
            Borrar asignatura
          </button>
        </div>
      )}
    </ModalShell>
  );
}
