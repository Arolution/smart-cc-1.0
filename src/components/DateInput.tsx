import React from 'react';

type Props = {
  value?: string; // ISO date 'YYYY-MM-DD'
  onChange?: (isoDate: string) => void;
  min?: string;
  id?: string;
  className?: string;
  ariaLabel?: string;
};

/**
 * DateInput with visible calendar icon and a clean API.
 * - If value is undefined, the input will show the provided min or today's+1 (caller should pass DEFAULTS.defaultStartDateIso).
 * - onChange returns ISO string 'YYYY-MM-DD'.
 */
export default function DateInput({ value, onChange, min, id, className, ariaLabel }: Props) {
  const displayValue = value || min || '';

  return (
    <div className={`date-input flex items-center gap-2 ${className || ''}`} role="group" aria-label={ariaLabel || 'Datumsauswahl'}>
      <label htmlFor={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </label>
      <input
        id={id}
        type="date"
        value={displayValue}
        min={min}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="border rounded px-2 py-1"
        aria-label={ariaLabel || 'Startdatum'}
      />
    </div>
  );
}