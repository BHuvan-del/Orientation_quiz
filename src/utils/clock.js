// Utility for server-time synchronization and reliable countdowns
import { useEffect, useState, useRef } from 'react';

// Estimated clock offset: serverTime = Date.now() + estimatedOffsetMs
let estimatedOffsetMs = 0;

export function updateClockOffset(serverTimestampMillis) {
  if (!serverTimestampMillis) return;
  const now = Date.now();
  // If serverTimestamp was just created, now is slightly after serverTimestamp
  // offset = server - client
  const diff = serverTimestampMillis - now;
  // Use a damped update to prevent wild fluctuations
  if (Math.abs(diff) > 500) {
    estimatedOffsetMs = diff;
  }
}

export function getEstimatedServerTime() {
  return Date.now() + estimatedOffsetMs;
}

/**
 * Synchronized countdown hook anchored to server timestamp
 * Ensures 300+ devices end at the exact same instant regardless of phone clock skew or render delays
 */
export function useSynchronizedCountdown(startedAtTimestamp, durationSeconds, onExpire) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!startedAtTimestamp || !durationSeconds) {
      setTimeLeft(durationSeconds || 0);
      return;
    }

    const startMillis = startedAtTimestamp.toMillis 
      ? startedAtTimestamp.toMillis() 
      : (typeof startedAtTimestamp === 'number' ? startedAtTimestamp : Date.now());

    // Update estimated clock offset if available
    updateClockOffset(startMillis);

    const endMillis = startMillis + (durationSeconds * 1000);

    const update = () => {
      const nowServer = getEstimatedServerTime();
      const remainingMs = Math.max(0, endMillis - nowServer);
      const remainingSec = Math.ceil(remainingMs / 1000);

      setTimeLeft(remainingSec);

      if (remainingMs <= 0) {
        if (onExpireRef.current) {
          onExpireRef.current();
        }
        return false; // Stop
      }
      return true; // Continue
    };

    // Run initial tick immediately
    const shouldContinue = update();
    if (!shouldContinue) return;

    const intervalId = setInterval(() => {
      const cont = update();
      if (!cont) clearInterval(intervalId);
    }, 200);

    return () => clearInterval(intervalId);
  }, [startedAtTimestamp, durationSeconds]);

  return timeLeft;
}
