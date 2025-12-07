// BEGIN summaryHelpers.ts — DO NOT EDIT THE MARKERS BELOW IF YOU PASTE
// Helper utilities to prepare UI summaries from calculation results.
// - computeLevelTotals: aggregates L1 / L2 totals per month/year
// - compactDailyList: collapses consecutive non-working day ranges (weekends + vacations)
//   into a single "gap" entry for compact display in the UI.
//
// Exports:
// - computeLevelTotals(yearly: YearlyResult[]) => { yearly: ..., monthly: Map }
// - compactDailyList(days: DailyResult[]) => CompactEntry[]
// - types: CompactEntry

import type {
  YearlyResult,
  DailyResult,
  PartnerCommission,
} from './calculatorEngine';

// Aggregated totals by level for the whole result set (yearly and monthly granularity)
export function computeLevelTotals(yearly: YearlyResult[]) {
  const totals = {
    yearly: [] as Array<{
      year: number;
      l1Total: number;
      l2Total: number;
    }>,
    monthly: new Map<string, { year: number; month: number; l1Total: number; l2Total: number }>(),
  };

  for (const y of yearly) {
    let yearL1 = 0;
    let yearL2 = 0;

    for (const m of y.months) {
      let monthL1 = 0;
      let monthL2 = 0;

      for (const d of m.days) {
        // Safe handling:
        // - If partnerCommissions is an array, iterate it.
        // - Otherwise, fall back to legacy daily l1/l2 fields if present (demo/stub compatibility).
        const pcs = Array.isArray((d as any).partnerCommissions) ? (d as any).partnerCommissions as PartnerCommission[] : null;
        if (pcs) {
          for (const pc of pcs) {
            // defensive checks for fields
            const lvl = (pc as any).level;
            const comm = Number((pc as any).commission || 0);
            if (lvl === 'L1' || lvl === 'l1') monthL1 += comm;
            else monthL2 += comm;
          }
        } else {
          // fallback: support demo/stub that provides aggregate l1/l2 numbers per day
          monthL1 += Number((d as any).l1 || 0);
          monthL2 += Number((d as any).l2 || 0);
        }
      }

      // use year from parent 'y' (month objects may not contain year)
      totals.monthly.set(`${y.year}-${m.month}`, {
        year: y.year,
        month: m.month,
        l1Total: monthL1,
        l2Total: monthL2,
      });

      yearL1 += monthL1;
      yearL2 += monthL2;
    }

    totals.yearly.push({
      year: y.year,
      l1Total: yearL1,
      l2Total: yearL2,
    });
  }

  return totals;
}

// Compact representation of daily list where consecutive "non-active" days are collapsed into a single gap.
// Non-active heuristic: day.profit === 0 && no partner commissions && no deposit/withdrawal.
// The original DailyResult entries are preserved for 'day' entries.
export type CompactEntry =
  | { type: 'day'; day: DailyResult }
  | { type: 'gap'; start: Date; end: Date; label: string }; // label like 'Wochenende / Urlaub (3 Tage)'

export function compactDailyList(days: DailyResult[]): CompactEntry[] {
  const entries: CompactEntry[] = [];

  const isInactive = (d: DailyResult) => {
    const noProfit = Math.abs((d as any).profit || 0) < 1e-12;
    const noPartner = !((d as any).partnerCommissions && Array.isArray((d as any).partnerCommissions) && (d as any).partnerCommissions.length > 0);
    const noTx = ((d as any).deposit === 0 || (d as any).deposit === undefined) && ((d as any).withdrawal === 0 || (d as any).withdrawal === undefined);
    return noProfit && noPartner && noTx;
  };

  let i = 0;
  while (i < days.length) {
    const current = days[i];
    if (!isInactive(current)) {
      entries.push({ type: 'day', day: current });
      i++;
      continue;
    }

    // Start a gap
    let j = i;
    while (j + 1 < days.length && isInactive(days[j + 1])) j++;
    // days i..j inclusive are inactive
    entries.push({
      type: 'gap',
      start: (days[i] as any).date,
      end: (days[j] as any).date,
      label: `Wochenende / Urlaub (${j - i + 1} Tage)`,
    });
    i = j + 1;
  }

  return entries;
}
// END summaryHelpers.ts
