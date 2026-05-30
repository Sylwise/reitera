import { useState, useEffect, useRef } from 'react';
import ModalShell from '../ui/ModalShell';

export default function DoneModal({ topic, isOpen, onClose, onConfirm }) {
  const [diff,      setDiff]      = useState('normal');
  const [score,     setScore]     = useState('');
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    if (isOpen) { setDiff('normal'); setScore(''); setShowScore(false); }
  }, [isOpen, topic?.id]);

  function validateScore(s) {
    if (!s.trim()) return null;
    const str = s.trim();
    
    if (str.includes('%')) {
      const match = str.match(/^(\d+)\s*%$/);
      if (!match) return 'Formato inválido (ej. 85%)';
      const num = parseInt(match[1], 10);
      if (num < 1 || num > 100) return 'Debe estar entre 1% y 100%';
      return null;
    }
    
    if (str.includes('/')) {
      const match = str.match(/^(\d+)\s*\/\s*(\d+)$/);
      if (!match) return 'Formato inválido (ej. 8/10)';
      const num = parseInt(match[1], 10);
      const div = parseInt(match[2], 10);
      if (div === 0) return 'El divisor no puede ser 0';
      if (num > div) return 'La nota no puede ser mayor al total';
      return null;
    }
    
    return 'Usa un formato como 8/10 o 85%';
  }

  const scoreError = validateScore(score);
  const canConfirm = !scoreError;

  const keyHandlerRef = useRef(null);
  keyHandlerRef.current = (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'Enter' && canConfirm) { onConfirm({ dificultad: diff, score: score.trim() }); onClose(); }
    if (e.key === '1')      setDiff('easy');
    if (e.key === '2')      setDiff('normal');
    if (e.key === '3')      setDiff('hard');
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    function handler(e) { keyHandlerRef.current(e); }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  function handleOverlay(e) { if (e.target === e.currentTarget) onClose(); }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <button className="btn-cancel" onClick={onClose}>✕</button>
      <div className="modal-asig">{topic?.asig}</div>
      <div className="modal-title">{topic?.name}</div>
      <div className="modal-sub">¿Cómo fue este repaso?</div>
      <div className="modal-divider" />

      <div className="modal-section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Dificultad</span>
        <span style={{ color: 'var(--muted)', fontSize: '.6rem', letterSpacing: '.04em' }}>teclas 1 · 2 · 3</span>
      </div>
      <div className="diff-btns">
        {[{ key: 'easy', label: 'Fácil' }, { key: 'normal', label: 'Normal' }, { key: 'hard', label: 'Difícil' }].map((b, i) => (
          <button
            key={b.key}
            className={`diff-btn ${b.key}${diff === b.key ? ' selected' : ''}`}
            onClick={() => setDiff(b.key)}
          >
            <span className="kbd-hint">{i + 1}</span>{b.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowScore(v => !v)}
        style={{ background: 'none', border: 'none', color: 'var(--muted)', fontFamily: 'var(--sans)', fontSize: '.75rem', cursor: 'pointer', padding: '0 0 .75rem', display: 'flex', alignItems: 'center', gap: '.35rem', transition: 'color .15s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
      >
        <span style={{ fontSize: '.65rem' }}>{showScore ? '▾' : '▸'}</span> Añadir puntuación (opcional)
      </button>

      {showScore && (
        <div style={{ marginBottom: '.5rem' }}>
          <input
            className="modal-input"
            style={{ borderColor: scoreError && score ? 'var(--danger)' : 'var(--border)' }}
            type="text"
            placeholder="ej. 8/10 o 85%"
            value={score}
            onChange={e => setScore(e.target.value)}
            autoFocus
          />
          {scoreError && score && (
            <div style={{ color: 'var(--danger)', fontSize: '.7rem', marginTop: '.3rem' }}>
              {scoreError}
            </div>
          )}
        </div>
      )}

      <button
        className="btn-confirm"
        disabled={!canConfirm}
        style={{ marginTop: showScore ? 0 : '.5rem' }}
        onClick={() => { if (canConfirm) { onConfirm({ dificultad: diff, score: score.trim() }); onClose(); } }}
      >
        ✓ Confirmar repaso
        <span style={{ opacity: .5, fontSize: '.7rem', marginLeft: '.5rem' }}>Enter ↵</span>
      </button>
    </ModalShell>
  );
}
