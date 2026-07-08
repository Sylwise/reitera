import { useState, useEffect, useRef } from 'react';
import ModalShell from '../ui/ModalShell';

const CONFIRM_WORD = 'ELIMINAR';

export default function DeleteAccountModal({ isOpen, onClose, onConfirm }) {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (isOpen) setConfirmText('');
  }, [isOpen]);

  const canConfirm = confirmText.trim().toUpperCase() === CONFIRM_WORD;

  const keyHandlerRef = useRef(null);
  keyHandlerRef.current = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && canConfirm) handleConfirm();
  };

  useEffect(() => {
    if (!isOpen) return;
    function handler(e) { keyHandlerRef.current(e); }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  function handleConfirm() {
    if (!canConfirm) return;
    onConfirm();
    onClose();
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <button className="btn-cancel" onClick={onClose}>✕</button>

      <div className="modal-asig" style={{ color: 'var(--danger)' }}>PELIGRO</div>
      <div className="modal-title" style={{ paddingBottom: '0.15em' }}>Eliminar cuenta</div>
      <div className="modal-divider" />

      <div className="fade-in" style={{ textAlign: 'center', padding: '.5rem 0 1rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
          Esto borrará permanentemente tu cuenta, junto con todas tus asignaturas, temas y exámenes.
          Esta acción no se puede deshacer.
        </p>

        <div className="modal-section-label" style={{ textAlign: 'left' }}>
          Escribe <strong style={{ color: 'var(--text)' }}>{CONFIRM_WORD}</strong> para confirmar
        </div>
        <input
          className="modal-input"
          type="text"
          placeholder={CONFIRM_WORD}
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          autoFocus
          style={{ marginBottom: '1.5rem' }}
        />

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-configure" style={{ flex: 1, background: 'var(--surface)', color: 'var(--text)' }} onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-confirm"
            disabled={!canConfirm}
            style={{ flex: 1, background: 'var(--danger)', borderColor: 'var(--danger)', color: '#fff' }}
            onClick={handleConfirm}
          >
            Sí, eliminar cuenta
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
