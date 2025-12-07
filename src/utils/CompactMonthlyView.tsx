import React from 'react';
import type { DailyResult } from '../utils/calculatorEngine';
import { compactDailyList, CompactEntry } from '../utils/summaryHelpers';

type Props = {
  days: DailyResult[]; // all days for a specific month (sorted ascending)
};

/**
 * CompactMonthlyView
 * - shows day rows for active payout days
 * - groups consecutive inactive ranges (weekends + vacations) into a single compact row
 * - minimal styling for readability
 */
export default function CompactMonthlyView({ days }: Props) {
  const entries: CompactEntry[] = compactDailyList(days);

  return (
    <div className="compact-monthly-view" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px', borderBottom: '1px solid #ddd' }}>Datum</th>
            <th style={{ textAlign: 'right', padding: '6px', borderBottom: '1px solid #ddd' }}>Stake (Start)</th>
            <th style={{ textAlign: 'right', padding: '6px', borderBottom: '1px solid #ddd' }}>Profit</th>
            <th style={{ textAlign: 'right', padding: '6px', borderBottom: '1px solid #ddd' }}>Stake (Ende)</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, idx) => {
            if (e.type === 'day') {
              const day = e.day;
              return (
                <tr key={idx}>
                  <td style={{ padding: '6px', borderBottom: '1px solid #f3f3f3' }}>{day.date.toISOString().slice(0, 10)}</td>
                  <td style={{ textAlign: 'right', padding: '6px', borderBottom: '1px solid #f3f3f3' }}>{day.stake.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '6px', borderBottom: '1px solid #f3f3f3' }}>{day.profit.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '6px', borderBottom: '1px solid #f3f3f3' }}>{day.newStake.toFixed(2)}</td>
                </tr>
              );
            } else {
              // gap
              const label = e.label;
              const start = e.start.toISOString().slice(0, 10);
              const end = e.end.toISOString().slice(0, 10);
              return (
                <tr key={idx} style={{ background: '#fafafa', color: '#666' }}>
                  <td style={{ padding: '6px' }}>{`${start} — ${end}`}</td>
                  <td colSpan={3} style={{ padding: '6px' }}>{label}</td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    </div>
  );
}