import React from "react";
import type { Lang } from "../i18n/translations";

type Props = {
  lang: Lang;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  showEmojiFallback?: boolean;
};

export default function LanguageButton({ lang, onClick, className, ariaLabel, showEmojiFallback = true }: Props) {
  const emoji = lang === "de" ? "🇩🇪" : "🇺🇸";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`language-button ${className ?? ""}`}
    >
      {showEmojiFallback ? <span className="flag" aria-hidden>{emoji}</span> : <span className="flag-text">{lang.toUpperCase()}</span>}
    </button>
  );
}