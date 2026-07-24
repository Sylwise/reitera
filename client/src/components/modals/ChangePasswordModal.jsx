import { useState, useEffect, useRef } from 'react';
import ModalShell from '../ui/ModalShell';
import { isTouchDevice } from '../../utils/device';

export default function ChangePasswordModal({ isOpen, onClose, onConfirm }) {
  const keyHandlerRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => keyHandlerRef.current?.(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <ChangePasswordForm keyHandlerRef={keyHandlerRef} onClose={onClose} onConfirm={onConfirm} />
    </ModalShell>
  );
}

function ChangePasswordForm({ keyHandlerRef, onClose, onConfirm }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const canConfirm = oldPassword && newPassword.length >= 8 && newPassword === confirmPassword;

  useEffect(() => {
    keyHandlerRef.current = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && (e.repeat || e.target.tagName === 'BUTTON')) return;
      if (e.key === 'Enter' && canConfirm) handleConfirm();
    };
  });

  async function handleConfirm() {
    if (!canConfirm || loading) return;
    setError(null);
    setLoading(true);
    try {
      await onConfirm({ oldPassword, newPassword });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="btn-cancel" onClick={onClose}>✕</button>

      <div className="modal-asig" style={{ color: 'var(--muted)' }}>SEGURIDAD</div>
      <div className="modal-title" style={{ paddingBottom: '0.15em' }}>Cambiar contraseña</div>
      <div className="modal-divider" />

      <div className="modal-section-label">Contraseña actual</div>
      <input
        className="modal-input"
        type="password"
        autoComplete="current-password"
        value={oldPassword}
        onChange={e => setOldPassword(e.target.value)}
        autoFocus={!isTouchDevice}
        style={{ marginBottom: '1rem' }}
      />

      <div className="modal-section-label">Nueva contraseña</div>
      <input
        className="modal-input"
        type="password"
        minLength={8}
        maxLength={72}
        autoComplete="new-password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        style={{ marginBottom: '1rem' }}
      />

      <div className="modal-section-label">Confirmar nueva contraseña</div>
      <input
        className="modal-input"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        style={{ marginBottom: newPassword && confirmPassword && newPassword !== confirmPassword ? '0.4rem' : '1.5rem' }}
      />
      {newPassword && confirmPassword && newPassword !== confirmPassword && (
        <div className="modal-section-label" style={{ color: 'var(--danger)', marginBottom: '1.5rem' }}>
          Las contraseñas no coinciden.
        </div>
      )}

      {error && (
        <div className="modal-section-label" style={{ color: 'var(--danger)', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <button className="btn-confirm" disabled={!canConfirm || loading} onClick={handleConfirm}>
        {loading ? 'Un momento…' : 'Guardar contraseña'}
      </button>
    </>
  );
}
