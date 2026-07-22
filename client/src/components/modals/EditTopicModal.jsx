import { useState, useEffect, useRef } from 'react';
import ModalShell from '../ui/ModalShell';
import { isTouchDevice } from '../../utils/device';

export default function EditTopicModal({ isOpen, onClose, onEdit, onDelete, onReset, topic }) {
  const keyHandlerRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => keyHandlerRef.current?.(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      {topic && (
        <EditTopicForm
          key={topic.id}
          keyHandlerRef={keyHandlerRef}
          onClose={onClose}
          onEdit={onEdit}
          onDelete={onDelete}
          onReset={onReset}
          topic={topic}
        />
      )}
    </ModalShell>
  );
}

function EditTopicForm({ keyHandlerRef, onClose, onEdit, onDelete, onReset, topic }) {
  const [name,          setName]          = useState(topic.name || '');
  const [confirmAction, setConfirmAction] = useState(null);

  const canEdit = name.trim().length >= 3;

  useEffect(() => {
    keyHandlerRef.current = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && (e.repeat || e.target.tagName === 'BUTTON')) return;
      if (e.key === 'Enter' && canEdit && !confirmAction) handleEdit();
    };
  });

  function handleEdit() {
    if (!canEdit || !topic) return;
    onEdit({ topicId: topic.id, name: name.trim() });
    onClose();
  }

  function handleConfirmAction() {
    if (!topic) return;
    if (confirmAction === 'delete') onDelete(topic.id);
    if (confirmAction === 'reset')  onReset(topic.id);
    onClose();
  }

  const CONFIRM_COPY = {
    delete: {
      title: '¿Estás seguro?',
      body: `Esto borrará permanentemente el tema "${topic?.name}" y su historial de repasos. Esta acción no se puede deshacer.`,
      cta: 'Sí, borrar',
    },
    reset: {
      title: '¿Reiniciar repasos?',
      body: `El progreso de "${topic?.name}" volverá a cero y el tema se programará para repasar hoy. Esta acción no se puede deshacer.`,
      cta: 'Sí, reiniciar',
    },
  };

  return (
    <>
      <button className="btn-cancel" onClick={onClose}>✕</button>

      <div className="modal-asig" style={{ color: 'var(--muted)' }}>AJUSTES</div>
      <div className="modal-title">Editar tema</div>
      <div className="modal-divider" />

      {confirmAction ? (
        <div className="fade-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ margin: '0 0 .5rem', color: 'var(--text)' }}>{CONFIRM_COPY[confirmAction].title}</h3>
          <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
            {CONFIRM_COPY[confirmAction].body}
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-configure" style={{ flex: 1, background: 'var(--surface)', color: 'var(--text)' }} onClick={() => setConfirmAction(null)}>
              Cancelar
            </button>
            <button className="btn-confirm" style={{ flex: 1, background: 'var(--danger)', borderColor: 'var(--danger)', color: '#fff' }} onClick={handleConfirmAction}>
              {CONFIRM_COPY[confirmAction].cta}
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
            minLength={3}
            maxLength={100}
            autoFocus={!isTouchDevice}
          />

          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
            <button
              className="btn-configure"
              onClick={() => setConfirmAction('reset')}
              style={{ flex: 1, background: 'var(--surface)', borderColor: 'var(--border)' }}
              title="Devolver los repasos a 0"
            >
              Reiniciar repasos
            </button>
            <button
              className="btn-confirm"
              disabled={!canEdit}
              onClick={handleEdit}
              style={{ flex: 1 }}
            >
              Guardar
            </button>
          </div>

          <button
            className="btn-configure"
            onClick={() => setConfirmAction('delete')}
            style={{ width: '100%', borderColor: 'transparent', color: 'var(--danger)', background: 'transparent' }}
          >
            Borrar tema
          </button>
        </div>
      )}
    </>
  );
}
