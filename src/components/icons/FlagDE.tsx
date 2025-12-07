import React from "react";

type Props = {
  className?: string;
  title?: string;
  width?: number | string;
  height?: number | string;
};

export default function FlagDE({ className, title = "Deutsch", width = 24, height = 16 }: Props) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 3 2"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      focusable="false"
    >
      <title>{title}</title>
      <rect width="3" height="2" y="0" fill="#000" />
      <rect width="3" height="2" y="0.6667" fill="#DD0000" />
      <rect width="3" height="2" y="1.3333" fill="#FFCC00" />
    </svg>
  );
}