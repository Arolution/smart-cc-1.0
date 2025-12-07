import React, { useState } from "react";
import { useTranslate } from "../hooks/useTranslate";

/**
 * Simple visible Compound Calculator placeholder — so "unter Compound Calculator" nicht leer bleibt.
 * Replace calculation logic with your real implementation later.
 */

export default function CompoundCalculator() {
  const { t } = useTranslate();
  const [principal, setPrincipal] = useState<number>(1000);
  const [rate, setRate] = useState<number>(5);
  const [years, setYears] = useState<number>(10);

  const result = principal * Math.pow(1 + rate / 100, years);

  return (
    <section className="container" style={{ padding: 16 }}>
      <h2 className="text-2xl" style={{ marginBottom: 8 }}>{t("compoundTitle")}</h2>

      <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <label>
          Principal
          <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} style={{ width: "100%", padding: 6, marginTop: 4 }} />
        </label>

        <label>
          Rate (%)
          <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} style={{ width: "100%", padding: 6, marginTop: 4 }} />
        </label>

        <label>
          Years
          <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} style={{ width: "100%", padding: 6, marginTop: 4 }} />
        </label>

        <button className="btn-primary" style={{ marginTop: 8 }}>
          {t("calculate")}
        </button>

        <div style={{ marginTop: 12 }}>
          <strong>Result:</strong> {result.toFixed(2)}
        </div>
      </div>
    </section>
  );
}