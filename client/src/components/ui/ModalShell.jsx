import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = e => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

// Atrapa el Tab dentro del modal y devuelve el foco a quien lo abrió al cerrar.
function FocusTrap({ children }) {
  const ref = useRef(null);
  // Capturado en render, antes de que el autoFocus de los inputs mueva el foco.
  const [opener] = useState(() => document.activeElement);

  useEffect(() => {
    const node = ref.current;
    if (!node.contains(document.activeElement)) {
      node.querySelector(FOCUSABLE)?.focus({ preventScroll: true });
    }

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return;
      const focusables = [...node.querySelectorAll(FOCUSABLE)];
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !node.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      opener?.focus?.({ preventScroll: true });
    };
  }, [opener]);

  return <div ref={ref} style={{ display: 'contents' }}>{children}</div>;
}

export default function ModalShell({ isOpen, onClose, children }) {
  const isMobile = useIsMobile();

  // Key distinta por apertura: si se reabre durante la animación de salida,
  // AnimatePresence monta un modal nuevo en vez de resucitar el que se iba
  // (que conservaría el estado anterior del formulario).
  const [openId, setOpenId] = useState(0);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setOpenId(id => id + 1);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key={`modal-overlay-${openId}`}
          className="modal-overlay open"
          style={isMobile ? { alignItems: 'flex-end' } : {}}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="modal"
            role="dialog"
            aria-modal="true"
            style={isMobile
              ? { width: '100%', borderRadius: '1rem 1rem 0 0', maxHeight: '85vh', overflowY: 'auto', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }
              : { maxHeight: '90vh', overflowY: 'auto' }
            }
            initial={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0 }}
            animate={isMobile ? { y: 0 }      : { scale: 1, opacity: 1 }}
            exit={isMobile
              ? { y: '100%', transition: { type: 'tween', duration: 0.26, ease: [0.4, 0, 1, 1] } }
              : { scale: 0.95, opacity: 0 }
            }
            transition={isMobile
              ? { type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }
              : { type: 'spring', damping: 25, stiffness: 300 }
            }
          >
            <FocusTrap>{children}</FocusTrap>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
