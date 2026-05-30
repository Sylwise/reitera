import { useRef, useEffect } from 'react';

export function useOutsideClick(ref, callback, enabled = true) {
  const callbackRef = useRef(callback);
  useEffect(() => { callbackRef.current = callback; });

  useEffect(() => {
    if (!enabled) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) callbackRef.current?.();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, enabled]);
}
