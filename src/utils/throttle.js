// UI Throttle helper to prevent re-render thrashing during answer spikes
import { useEffect, useRef, useState } from 'react';

export function useThrottledValue(value, intervalMs = 400) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef(Date.now());
  const timeoutRef = useRef(null);

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastUpdated.current;

    if (elapsed >= intervalMs) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, intervalMs - elapsed);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, intervalMs]);

  return throttledValue;
}
