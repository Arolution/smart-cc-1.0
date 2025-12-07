import React, { useEffect, useState } from "react";
import LanguageButton from "./LanguageButton";
import ThemeToggle from "./ThemeToggle";
import { useLanguage } from "../contexts/LanguageContext";

/**
 * Lightweight header: logo, language, theme toggle, title center.
 * Uses emoji flags for guaranteed visibility (no external assets required).
 */

export default function Header() {
  const { lang, setLang } = useLanguage();

  const toggleLang = () => setLang((prev) => (prev === "de" ? "en" : "de"));

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("app.theme");
      if (stored === "dark") return true;
      if (stored === "light") return false;
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem("app.theme", isDark ? "dark" : "light");
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((d) => !d);

  return (
    <header className="flex items-center justify-between gap-2 px-3 py-2" style={{ alignItems: "center" }}>
      <div className="flex items-center gap-2">
        <div className="header-logo" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Prefer your existing /public/logo.svg — fallback to text */}
          <img src="/logo.svg" alt="Logo" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} style={{ maxHeight: 56, maxWidth: 200 }} />
          <div style={{ fontWeight: 600 }}>{/* optional product name */}</div>
        </div>
      </div>

      <div style={{ textAlign: "center", flex: 1, fontSize: 14, fontWeight: 600 }}>Compound Calculator</div>

      <div className="flex items-center gap-2">
        <LanguageButton lang={lang} onClick={toggleLang} ariaLabel={lang === "de" ? "Sprache: Deutsch" : "Language: English"} />
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} ariaLabel={isDark ? "Schalte auf hell" : "Schalte auf dunkel"} />
      </div>
    </header>
  );
}