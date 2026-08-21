import { useState, useEffect } from 'react';

/** Duration (ms) the preloader runs before triggering the exit */
const PRELOADER_DURATION = 2200;
/** How often (ms) we tick the progress counter */
const TICK_INTERVAL = 30;

export interface PreloaderState {
  /** 0–100 */
  progress: number;
  /** true when the progress bar reached 100 and exit has begun */
  done: boolean;
}

/**
 * Drives a smooth, eased progress counter from 0 → 100 over PRELOADER_DURATION.
 * Uses an ease-out cubic curve so the bar starts fast and decelerates at the end.
 */
export const usePreloader = (): PreloaderState => {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const startTime = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / PRELOADER_DURATION, 1);

      // Ease-out cubic: fast start, smooth deceleration
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(eased * 100);

      setProgress(value);

      if (t < 1) {
        timerId = window.setTimeout(tick, TICK_INTERVAL);
      } else {
        // Small buffer so the bar visually "completes" before exit
        window.setTimeout(() => setDone(true), 180);
      }
    };

    let timerId = window.setTimeout(tick, TICK_INTERVAL);

    return () => window.clearTimeout(timerId);
  }, []);

  return { progress, done };
};
