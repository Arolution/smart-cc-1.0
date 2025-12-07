export const translations = {
  de: {
    heroTitle: "Willkommen bei unserem Produkt",
    heroSubtitle: "Dies ist die Startseite. Ändere die Sprache oben, um die Texte sofort zu sehen.",
    cta: "Loslegen",
    investmentTitle: "Professionelles Investment-Management",
    compoundTitle: "Compound Calculator",
    calculate: "Berechnen",
  },
  en: {
    heroTitle: "Welcome to our product",
    heroSubtitle: "This is the homepage. Change the language in the header to see the texts update immediately.",
    cta: "Get started",
    investmentTitle: "Professional investment management",
    compoundTitle: "Compound Calculator",
    calculate: "Calculate",
  },
} as const;

export type TranslationKey = keyof typeof translations["de"];
export type Lang = keyof typeof translations;