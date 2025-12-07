import React from "react";

type Props = {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
  ariaLabel?: string;
};

export default function ThemeToggle({ isDark, onToggle, className, ariaLabel }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`theme-toggle ${className ?? ""}`}
    >
      {isDark ? (
        // Sun icon when dark (meaning clicking will switch to light)
        <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20" aria-hidden>
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 7a5 5 0 100 10 5 5 0 000-10z" />
        </svg>
      ) : (
        // Moon icon when light (click to switch to dark)
        <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20" aria-hidden>
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}