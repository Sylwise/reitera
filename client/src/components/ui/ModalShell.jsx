import { useEffect, useState } from 'react';
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

export default function ModalShell({ isOpen, onClose, children }) {
  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          className="modal-overlay open"
          style={isMobile ? { alignItems: 'flex-end' } : {}}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="modal"
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
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
