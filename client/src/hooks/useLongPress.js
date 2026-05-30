import { useRef } from 'react';

export function useLongPress(delay = 600) {
  const timer     = useRef(null);
  const triggered = useRef(false);

  function onStart(callback) {
    triggered.current = false;
    if (!callback) return;
    timer.current = setTimeout(() => {
      triggered.current = true;
      if (window.navigator.vibrate) window.navigator.vibrate(50);
      callback();
    }, delay);
  }

  function onEnd() {
    clearTimeout(timer.current);
  }

  return { onStart, onEnd, didTrigger: () => triggered.current };
}
