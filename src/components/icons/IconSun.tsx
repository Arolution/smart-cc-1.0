import React from "react";

type Props = {
  className?: string;
  title?: string;
  size?: number | string;
};

export default function IconSun({ className, title = "Hellmodus (Sonne)", size = 20 }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      focusable="false"
      fill="currentColor"
    >
      <title>{title}</title>
      <circle cx="12" cy="12" r="4" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1="12" y1="1.5" x2="12" y2="4.5" />
        <line x1="12" y1="19.5" x2="12" y2="22.5" />
        <line x1="1.5" y1="12" x2="4.5" y2="12" />
        <line x1="19.5" y1="12" x2="22.5" y2="12" />
        <line x1="4.2" y1="4.2" x2="6.0" y2="6.0" />
        <line x1="18.0" y1="18.0" x2="19.8" y2="19.8" />
        <line x1="4.2" y1="19.8" x2="6.0" y2="18.0" />
        <line x1="18.0" y1="6.0" x2="19.8" y2="4.2" />
      </g>
    </svg>
  );
}