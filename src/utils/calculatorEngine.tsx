import React, { useMemo, useState } from 'react';
import DateInput from '../components/DateInput';
import CompactMonthlyView from '../components/CompactMonthlyView';
import ExportModal from '../components/ExportModal';
import DEFAULTS, { DEFAULTS as NAMED_DEFAULTS } from '../config';
import { calculateCompound } from '../utils/calculatorEngine';
import { computeLevelTotals } from '../utils'; // use utils index.ts re-export to avoid resolver issues

// Use DEFAULTS (default export) but keep compatibility if someone imports the named export.

export default function CalculatorPage() {
  const defaults = DEFAULTS || NAMED_DEFAULTS;

  const [startDate, setStartDate] = useState<string>(defaults.defaultStartDateIso);
  const [stake, setStake] = useState<number>(defaults.stakeDefault);
  const [showExportModal, setShowExportModal] = useState(false);

  const params = useMemo(() => ({
    initialStake: stake,
    durationYears: 0,
    durationMonths: 3, // demo: show 3 months
    partners: [], // populate as needed
    deposits: [],
    withdrawals: [],
    startDate,
  }), [stake, startDate]);

  const results = useMemo(() => {
    try {
      return calculateCompound(params);
    } catch (e) {
      console.error('calculateCompound failed', e);
      return [];
    }
  }, [params]);

  const levelTotals = useMemo(() => computeLevelTotals(results), [results]);

  const onExportChoose = (mode: 'einfach' | 'komplex') => {
    setShowExportModal(false);
    if (mode === 'einfach') {
      // prepare export of yearly summaries only
      const payload = results.map(y => ({
        year: y.year,
        startStake: y.summary.startStake,
        endStake: y.summary.endStake,
        totalProfit: y.summary.totalProfit,
        l1Total: levelTotals.yearly.find(z => z.year === y.year)?.l1Total ?? 0,
        l2Total: levelTotals.yearly.find(z => z.year === y.year)?.l2Total ?? 0,
      }));
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_einfach_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // complex: export full results (daily values)
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_komplex_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Calculator</h1>

      <section style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
        <div>
          <label>Startdatum</label>
          <div>
            <DateInput
              value={startDate}
              onChange={setStartDate}
              min={defaults.defaultStartDateIso}
              id="start-date"
              ariaLabel="Startdatum für Simulation"
            />
          </div>
        </div>

        <div>
          <label>Stake (Start) </label>
          <div>
            <input
              type="number"
              value={stake}
              min={0}
              onChange={(e) => setStake(Number(e.target.value))}
              style={{ padding: '6px', width: 120 }}
            />
            <div style={{ fontSize: 12, color: '#666' }}>Default: {defaults.stakeDefault} €</div>
          </div>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => setShowExportModal(true)} style={{ padding: '8px 12px' }}>Export</button>
        </div>
      </section>

      <section style={{ marginTop: 12 }}>
        <h2>Ergebnisse (kompakt)</h2>

        {/* Show L1 / L2 yearly totals */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          {levelTotals.yearly.map(y => (
            <div key={y.year} style={{ border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
              <div style={{ fontWeight: 600 }}>{y.year}</div>
              <div style={{ fontSize: 13 }}>L1 Provision: {y.l1Total.toFixed(2)} €</div>
              <div style={{ fontSize: 13 }}>L2 Provision: {y.l2Total.toFixed(2)} €</div>
            </div>
          ))}
        </div>

        {/* For demo show first month in results in compact form */}
        {results.length > 0 && results[0].months.length > 0 ? (
          <>
            <h3>{results[0].year} - Monat {results[0].months[0].month + 1}</h3>
            <CompactMonthlyView days={results[0].months[0].days} />
          </>
        ) : (
          <div>Keine Ergebnisse – passe Startdatum / Stake an und führe die Simulation aus.</div>
        )}
      </section>

      <ExportModal open={showExportModal} onClose={() => setShowExportModal(false)} onChoose={onExportChoose} />
    </div>
  );
}