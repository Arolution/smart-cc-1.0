// Testskript: prüft requested vs effective Startdatum um den Jahreswechsel
// Import mit .ts-Extension ist absichtlich (ts-node im ESM-Mode benötigt das)
import { getSimulationStartInfo } from '../src/utils/calculatorEngine.ts';

const datesToCheck = [
  '2025-12-21',
  '2025-12-22',
  '2025-12-24',
  '2025-12-25',
  '2025-12-31',
  '2026-01-01',
  '2026-01-02',
  '2026-01-04',
  '2026-01-05'
];

function formatLocalISO(d?: Date | undefined | null): string {
  if (!d) return '-';
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

console.log('iso_requested -> effective (notice)');
for (const iso of datesToCheck) {
  const params = {
    initialStake: 1000,
    durationYears: 0,
    durationMonths: 0,
    partners: [],
    deposits: [],
    withdrawals: [],
    startDate: iso
  } as any;

  const info = getSimulationStartInfo(params);
  const req = formatLocalISO(info.requestedStartDate as any);
  const eff = formatLocalISO(info.effectiveStartDate as any);
  const notice = info.notice ? info.notice : '-';
  console.log(`${iso} -> ${eff} ${notice === '-' ? '' : ' | '}${notice}`);
}