import { useState, useRef, useCallback, useEffect } from 'react';

const BASE_SECONDS = 90;

export function useTimer(onExpire) {
  const [remaining, setRemaining] = useState(BASE_SECONDS);
  const endTimeRef      = useRef(null);
  const intervalRef     = useRef(null);
  const onExpireRef     = useRef(onExpire);
  const pausedRemRef    = useRef(null); // ms left when paused

  // Always call the latest onExpire without recreating tick
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  const tick = useCallback(() => {
    const rem = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
    setRemaining(rem);
    if (rem <= 0) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      onExpireRef.current?.();
    }
  }, []);

  const startTimer = useCallback((duration = BASE_SECONDS) => {
    clearInterval(intervalRef.current);
    pausedRemRef.current  = null;
    endTimeRef.current    = Date.now() + duration * 1000;
    setRemaining(duration);
    intervalRef.current   = setInterval(tick, 250);
  }, [tick]);

  // Accepts negative values too — a gravity-well collapse subtracts time. When a
  // running clock goes past zero the next tick fires onExpire, which is exactly
  // the intended "collapse ended your run" beat.
  const addTime = useCallback((seconds) => {
    if (pausedRemRef.current !== null) {
      // Timer is paused — adjust the frozen snapshot, never below zero
      pausedRemRef.current = Math.max(0, pausedRemRef.current + seconds * 1000);
      setRemaining(Math.ceil(pausedRemRef.current / 1000));
      return;
    }
    if (!endTimeRef.current) return;
    endTimeRef.current += seconds * 1000;
  }, []);

  /**
   * Halve whatever time is left — the gravity-well collapse penalty.
   *
   * Proportional rather than a flat subtraction so it scales with the run:
   * losing 30s off a full clock is devastating, losing 3s off a dying one is
   * survivable. It also means a collapse can never directly zero the timer,
   * so the run always ends on the clock rather than on a single mistake.
   *
   * @returns {number} whole seconds removed, for the UI to display
   */
  const halveTime = useCallback(() => {
    if (pausedRemRef.current !== null) {
      const lostMs = pausedRemRef.current / 2;
      pausedRemRef.current = Math.max(0, pausedRemRef.current - lostMs);
      setRemaining(Math.ceil(pausedRemRef.current / 1000));
      return Math.round(lostMs / 1000);
    }
    if (!endTimeRef.current) return 0;
    const leftMs = Math.max(0, endTimeRef.current - Date.now());
    const lostMs = leftMs / 2;
    endTimeRef.current -= lostMs;
    setRemaining(Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000)));
    return Math.round(lostMs / 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    if (!intervalRef.current || !endTimeRef.current) return;
    clearInterval(intervalRef.current);
    intervalRef.current  = null;
    pausedRemRef.current = Math.max(0, endTimeRef.current - Date.now());
    endTimeRef.current   = null;
  }, []);

  const resumeTimer = useCallback(() => {
    if (intervalRef.current || pausedRemRef.current === null) return;
    endTimeRef.current   = Date.now() + pausedRemRef.current;
    pausedRemRef.current = null;
    intervalRef.current  = setInterval(tick, 250);
  }, [tick]);

  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current  = null;
    endTimeRef.current   = null;
    pausedRemRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  return { remaining, startTimer, addTime, halveTime, stopTimer, pauseTimer, resumeTimer };
}
