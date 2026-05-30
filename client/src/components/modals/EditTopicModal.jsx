import { useState, useEffect } from 'react';
import ModalShell from '../ui/ModalShell';

const TOTAL_OPTS = [2, 3, 4, 5, 6];

export default function EditTopicModal({ isOpen, onClose, onEdit, onDelete, onReset, topic }) {
  const [name,          setName]          = useState('');
  const [reviewsNeeded, setReviewsNeeded] = useState(4);
  const [showConfirm,   setShowConfirm]   = useState(false);

  useEffect(() => {
    if (isOpen && topic) {
      setName(topic.name || '');
      setReviewsNeeded(topic.reviewsNeeded || 4);
      setShowConfirm(false);
    }
  }, [isOpen, topic]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && name.trim() && !showConfirm) handleEdit();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, name, reviewsNeeded, showConfirm]);

  function handleEdit() {
    if (!name.trim() || !topic) return;
    onEdit({ topicId: topic.id, name: name.trim(), reviewsNeeded });
    onClose();
  }

  function handleDelete() {
    if (!topic) return;
    onDelete(topic.id);
    onClose();
  }

  function handleReset() {
    if (!topic) return;
    onReset(topic.id);
    onClose();
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <button className="btn-cancel" onClick={onClose}>✕</button>

      <div className="modal-asig" style={{ color: 'var(--muted)' }}>AJUSTES</div>
      <div className="modal-title">Editar tema</div>
      <div className="modal-divider" />

      {showConfirm ? (
        <div className="fade-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ margin: '0 0 .5rem', color: 'var(--text)' }}>¿Estás seguro?</h3>
          <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
            Esto borrará los datos del tema y lo devolverá a su estado de "hueco vacío".
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

          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
            <button
              className="btn-configure"
              onClick={handleReset}
              style={{ flex: 1, background: 'var(--surface)', borderColor: 'var(--border)' }}
              title="Devolver los repasos a 0"
            >
              Reiniciar repasos
            </button>
            <button
              className="btn-confirm"
              disabled={!name.trim()}
              onClick={handleEdit}
              style={{ flex: 1 }}
            >
              Guardar
            </button>
          </div>

          <button
            className="btn-configure"
            onClick={() => setShowConfirm(true)}
            style={{ width: '100%', borderColor: 'transparent', color: 'var(--danger)', background: 'transparent' }}
          >
            Borrar tema
          </button>
        </div>
      )}
    </ModalShell>
  );
}
