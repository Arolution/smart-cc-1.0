import React from "react";

type Props = {
  className?: string;
  title?: string;
  size?: number | string;
};

export default function IconMoon({ className, title = "Dunkelmodus (Mond)", size = 20 }: Props) {
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}