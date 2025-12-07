import React, { createContext, useContext, useEffect, useState } from "react";

type Lang = "de" | "en";
/** setLang als Dispatch so dass sowohl setLang('en') als auch setLang(prev => ...) erlaubt sind */
type ContextShape = { lang: Lang; setLang: React.Dispatch<React.SetStateAction<Lang>> };

const LanguageContext = createContext<ContextShape | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem("app.lang");
      if (stored === "de" || stored === "en") return stored;
    } catch {
      /* ignore */
    }
    return typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("de") ? "de" : "en";
  });

  useEffect(() => {
    try {
      localStorage.setItem("app.lang", lang);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): ContextShape => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};