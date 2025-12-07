import { translations } from "../i18n/translation";
import { useLanguage } from "../contexts/LanguageContext";

/**
 * Simple in-app translate hook. 
 * Components re-render on language change because useLanguage() provides reactive state.
 */
export function useTranslate() {
  const { lang } = useLanguage();

  const t = (key: string, vars?: Record<string, string | number>) => {
    const dict = translations[lang as keyof typeof translations] as Record<string, string>;
    let str = dict? .[key] ??  String(key);
    if (vars) {
      Object.keys(vars).forEach((k) => {
        str = str.replace(new RegExp(`{${k}}`, "g"), String(vars[k]));
      });
    }
    return str;
  };

  return { t, lang };
}