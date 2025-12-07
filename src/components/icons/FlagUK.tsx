import React from "react";

type Props = {
  className?: string;
  title?: string;
  width?: number | string;
  height?: number | string;
};

export default function FlagUK({ className, title = "English (UK)", width = 24, height = 16 }: Props) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 60 30"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      focusable="false"
    >
      <title>{title}</title>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L21,0 L60,24 L60,30 L39,30 L0,6 Z" fill="#fff" />
      <path d="M60,0 L39,0 L0,24 L0,30 L21,30 L60,6 Z" fill="#fff" />
      <path d="M0,0 L13,0 L60,23 L60,30 L47,30 L0,7 Z" fill="#C8102E" />
      <path d="M60,0 L47,0 L0,23 L0,30 L13,30 L60,7 Z" fill="#C8102E" />
      <rect x="24" width="12" height="30" fill="#fff" />
      <rect y="9" width="60" height="12" fill="#fff" />
      <rect x="25.5" width="9" height="30" fill="#C8102E" />
      <rect y="10.5" width="60" height="9" fill="#C8102E" />
    </svg>
  );
}