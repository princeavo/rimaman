import React, { useEffect, useRef } from 'react';
import { usePreloader } from '../../hooks/usePreloader';

/**
 * Full-screen premium preloader for RIMAMAN.
 * Uses only CSS custom properties from the existing design system.
 * Mounts once, animates out on completion, then sets display:none.
 */
export const Preloader: React.FC = () => {
  const { progress, done } = usePreloader();
  const overlayRef = useRef<HTMLDivElement>(null);

  // On completion: play exit animation, then hide overlay
  useEffect(() => {
    if (!done) return;

    const overlay = overlayRef.current;
    if (!overlay) return;

    // Trigger CSS exit class
    overlay.classList.add('preloader--exit');

    const handleTransitionEnd = () => {
      overlay.style.display = 'none';
    };

    overlay.addEventListener('transitionend', handleTransitionEnd, { once: true });

    return () => {
      overlay.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [done]);



  return (
    <div
      ref={overlayRef}
      className="preloader-overlay"
      role="progressbar"
      aria-label="Chargement de RIMAMAN"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-live="polite"
    >
      {/* Decorative background grain dots */}
      <span className="preloader-grain preloader-grain--1" aria-hidden="true" />
      <span className="preloader-grain preloader-grain--2" aria-hidden="true" />
      <span className="preloader-grain preloader-grain--3" aria-hidden="true" />

      {/* Central content */}
      <div className="preloader-content">
        {/* Logo */}
        <div className="preloader-logo-wrap">
          <img
            src="/logo.png"
            alt="RIMAMAN — Les Farines du Moulin d'Or"
            className="preloader-logo"
            draggable="false"
          />
        </div>

        {/* Tagline */}
        <p className="preloader-tagline">Les Farines du Moulin d'Or</p>

        {/* Progress area */}
        <div className="preloader-progress-wrap">
          {/* Percentage */}
          <span className="preloader-percent">{progress}%</span>

          {/* Track + fill */}
          <div className="preloader-bar-track" aria-hidden="true">
            <div
              className="preloader-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom label */}
      <span className="preloader-bottom-label" aria-hidden="true">
        rimaman.com
      </span>
    </div>
  );
};
