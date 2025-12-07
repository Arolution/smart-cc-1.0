import React from "react";
import Header from "../src/components/Header";
import { LanguageProvider } from "../src/contexts/LanguageContext";
import "../src/styles/globals.css";
import "../src/styles/branding.css";

/**
 * Minimal typing to avoid build errors when @types/next is not installed.
 * If you prefer full typing, install @types/next and restore:
 *   import type { AppProps } from "next/app";
 *   export default function MyApp({ Component, pageProps }: AppProps) { ... }
 */

export default function MyApp({ Component, pageProps }: any) {
  return (
    <LanguageProvider>
      <Header />
      <main>
        <Component {...pageProps} />
      </main>
    </LanguageProvider>
  );
}