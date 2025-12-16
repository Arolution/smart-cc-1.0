import { createContext, useContext, useState, ReactNode } from "react";

type Language = "de" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  de: {
    // Landing
    "landing.title": "Smart Stake Calculator",
    "landing.subtitle": "Berechne Deine Renditen mit dem Zinseszins-Effekt",
    "landing.selectTheme": "Wähle Dein Theme",
    "landing.selectLanguage": "Wähle Deine Sprache",
    "landing.day": "Tag",
    "landing.night": "Nacht",
    "landing.continue": "Weiter",
    
    // Welcome
    "welcome.title": "Willkommen zum Smart Stake Calculator",
    "welcome.subtitle": "Dein Werkzeug für präzise Investitionsberechnungen",
    "welcome.description": "Entdecke die Kraft des Zinseszins-Effekts und berechne Deine potentiellen Renditen mit unserem fortschrittlichen Calculator. Verwalte Partner, plane Ein- und Auszahlungen und visualisiere Dein Wachstum.",
    "welcome.feature1.title": "Zinseszins-Visualisierung",
    "welcome.feature1.desc": "Sieh den exponentiellen Effekt Deiner Investitionen",
    "welcome.feature2.title": "Partner-Management",
    "welcome.feature2.desc": "Verwalte L1 und L2 Partner-Provisionen",
    "welcome.feature3.title": "Flexible Pläne",
    "welcome.feature3.desc": "Plane Ein- und Auszahlungen nach Deinen Wünschen",
    "welcome.feature4.title": "PDF Export",
    "welcome.feature4.desc": "Exportiere Deine Simulationen als professionelle Berichte",
    "welcome.cta": "Calculator starten",
    
    // Disclaimer
    "disclaimer.title": "Haftungsausschluss",
    "disclaimer.text1": "Dieser Calculator dient ausschließlich zu Informations- und Bildungszwecken. Die berechneten Ergebnisse basieren auf mathematischen Modellen und stellen keine Garantie für tatsächliche Renditen dar.",
    "disclaimer.text2": "Vergangene Ergebnisse sind keine Garantie für zukünftige Erträge. Investitionen sind immer mit Risiken verbunden, einschließlich des möglichen Verlusts des eingesetzten Kapitals.",
    "disclaimer.text3": "Wir empfehlen Dir, vor jeder Investitionsentscheidung professionelle Finanzberatung einzuholen und Deine persönliche finanzielle Situation sorgfältig zu bewerten.",
    "disclaimer.text4": "Mit der Nutzung dieses Calculators bestätigst Du, dass Du die Risiken verstehst und die volle Verantwortung für Deine Entscheidungen übernimmst.",
    "disclaimer.checkbox": "Ich habe den Haftungsausschluss gelesen und verstanden",
    "disclaimer.accept": "Akzeptieren und Calculator starten",
    
    // Calculator
    "calculator.title": "Calculator",
    "calculator.initialStake": "Startkapital",
    "calculator.duration": "Laufzeit",
    "calculator.years": "Jahre",
    "calculator.months": "Monate",
    "calculator.calculate": "Berechnen",
    "calculator.results": "Ergebnisse",
    
    // Common
    "common.back": "Zurück",
    "common.next": "Weiter",
    "common.loading": "Laden...",
  },
  en: {
    // Landing
    "landing.title": "Smart Stake Calculator",
    "landing.subtitle": "Calculate Your Returns with Compound Interest",
    "landing.selectTheme": "Select Your Theme",
    "landing.selectLanguage": "Select Your Language",
    "landing.day": "Day",
    "landing.night": "Night",
    "landing.continue": "Continue",
    
    // Welcome
    "welcome.title": "Welcome to Smart Stake Calculator",
    "welcome.subtitle": "Your Tool for Precise Investment Calculations",
    "welcome.description": "Discover the power of compound interest and calculate your potential returns with our advanced calculator. Manage partners, plan deposits and withdrawals, and visualize your growth.",
    "welcome.feature1.title": "Compound Interest Visualization",
    "welcome.feature1.desc": "See the exponential effect of your investments",
    "welcome.feature2.title": "Partner Management",
    "welcome.feature2.desc": "Manage L1 and L2 partner commissions",
    "welcome.feature3.title": "Flexible Plans",
    "welcome.feature3.desc": "Plan deposits and withdrawals as you wish",
    "welcome.feature4.title": "PDF Export",
    "welcome.feature4.desc": "Export your simulations as professional reports",
    "welcome.cta": "Start Calculator",
    
    // Disclaimer
    "disclaimer.title": "Disclaimer",
    "disclaimer.text1": "This calculator is for informational and educational purposes only. The calculated results are based on mathematical models and do not guarantee actual returns.",
    "disclaimer.text2": "Past results are not a guarantee of future returns. Investments always involve risks, including the possible loss of invested capital.",
    "disclaimer.text3": "We recommend seeking professional financial advice before making any investment decisions and carefully evaluating your personal financial situation.",
    "disclaimer.text4": "By using this calculator, you confirm that you understand the risks and take full responsibility for your decisions.",
    "disclaimer.checkbox": "I have read and understood the disclaimer",
    "disclaimer.accept": "Accept and Start Calculator",
    
    // Calculator
    "calculator.title": "Calculator",
    "calculator.initialStake": "Initial Stake",
    "calculator.duration": "Duration",
    "calculator.years": "Years",
    "calculator.months": "Months",
    "calculator.calculate": "Calculate",
    "calculator.results": "Results",
    
    // Common
    "common.back": "Back",
    "common.next": "Next",
    "common.loading": "Loading...",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "de";
  });

  const handleSetLanguage = (lang: Language) => {
    localStorage.setItem("language", lang);
    setLanguage(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
