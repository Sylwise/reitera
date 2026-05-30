import { useState, useRef } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  function showToast(msg) {
    clearTimeout(timerRef.current);
    setToast(msg);
    timerRef.current = setTimeout(() => setToast(null), 3000);
  }

  function dismissToast() {
    clearTimeout(timerRef.current);
    setToast(null);
  }

  return { toast, showToast, dismissToast };
}
