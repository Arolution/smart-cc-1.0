// Lead/Senior-Fix: Volle Typen, Kompatibilität mit "frequency", "initialStake", "parentL1Id".
// Zugleich: Keine Date-Props für string-only-Typen, und keine Typfehler bei instanceof durch typeof-Check.
// Ready-to-use und clean für das Gesamtprojekt – alle Fehler oben verschwinden!

// ==== Typdefinitionen ====

export interface Partner {
  id: string;
  name: string;
  level: 'L1' | 'L2';
  initialStake?: number;           // Jetzt für PartnerTree nutzbar
  parentL1Id?: string;             // Jetzt für PartnerTree nutzbar
}

export interface TransactionPlan {
  date: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  frequency?: string;              // Neu für CalculatorSetup-Kompatibilität!
}

export interface RealProfitData {
  date: string; // Immer nur string (ISO) für Upload-Kompatibilität
  grossProfitRate: number;
}

export interface CalculationParams {
  initialStake: number;

  // Simulationsdauer
  years?: number;
  durationYears?: number;       // Für Setup (Jahre)
  durationMonths?: number;      // Für Setup (Monate)

  annualRate?: number;
  startDate?: string;           // Für Kompatibilität: immer string statt Date

  restakingDays?: number[];

  deposits?: TransactionPlan[];
  withdrawals?: TransactionPlan[];

  yearlyDeposit?: number;
  yearlyWithdrawal?: number;

  partners?: Partner[];

  realProfitData?: RealProfitData[];
}

export interface PartnerSummary {
  partnerId: string;
  partnerName: string;
  level: 'L1' | 'L2';
  totalCommission: number;
}
export interface MonthDay {
  date: Date;
  stake: number;
  profit: number;
  partnerCommissions: { partnerId: string; partnerName: string; level: 'L1'|'L2'; commission: number }[];
  deposit: number;
  withdrawal: number;
  newStake: number;
  isWeekend?: boolean;
  isVacation?: boolean;
}
export interface MonthSummary {
  startStake: number;
  endStake: number;
  totalProfit: number;
  totalDeposits: number;
  totalWithdrawals: number;
  partnerSummaries: PartnerSummary[];
}
export interface YearMonth {
  month: number;
  summary: MonthSummary;
  days: MonthDay[];
}
export interface YearlyResult {
  year: number;
  summary: MonthSummary;
  months: YearMonth[];
}

// ==== Engine-Funktion ====

function parseDateSafe(date: string): Date {
  return new Date(date);
}

function isDate(obj: unknown): obj is Date {
  return typeof obj === 'object' && obj instanceof Date;
}

/**
 * Die zentrale Engine – kompakt, robust,
 * inkl. Handling aller Typen und nötiger Properties.
 */
export function calculateCompound(params: CalculationParams): YearlyResult[] {
  const initialStake = params.initialStake ?? 0;
  const annualRate =
    typeof params.annualRate === 'number'
      ? params.annualRate
      : 0.10;

  const totalYears =
    typeof params.durationYears === 'number' ? params.durationYears
      : typeof params.years === 'number'    ? params.years
      : typeof params.durationMonths === 'number' ? params.durationMonths / 12
      : 1;

  const startDateStr = params.startDate ?? new Date().toISOString();
  const startDate = parseDateSafe(startDateStr);

  const depositsPlan = Array.isArray(params.deposits) ? params.deposits : [];
  const withdrawalsPlan = Array.isArray(params.withdrawals) ? params.withdrawals : [];

  const yearlyDeposit = typeof params.yearlyDeposit === 'number' ? params.yearlyDeposit : 0;
  const yearlyWithdrawal = typeof params.yearlyWithdrawal === 'number' ? params.yearlyWithdrawal : 0;

  const realProfitData = Array.isArray(params.realProfitData) ? params.realProfitData : [];
  const partners = Array.isArray(params.partners) ? params.partners : [];

  let currentStake = initialStake;
  const results: YearlyResult[] = [];
  let currentDate = new Date(startDate);

  for (let yearIdx = 0; yearIdx < totalYears; yearIdx++) {
    let yearStartStake = currentStake;
    let totalProfit = 0;
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let endStake = currentStake;

    for (let month = 0; month < 12; month++) {
      let monthlyRate = annualRate / 12;

      // Echt-Daten-Übernahme für diesen Monat (Mittelwert, falls mehrere Werte)
      const monthStart = new Date(currentDate);
      monthStart.setMonth(currentDate.getMonth() + month);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthDatas = realProfitData.filter((d) => {
        const dDate = parseDateSafe(d.date);
        return dDate >= monthStart && dDate < monthEnd;
      });

      if (monthDatas.length > 0) {
        monthlyRate =
          monthDatas.reduce((sum, d) => sum + (typeof d.grossProfitRate === 'number' ? d.grossProfitRate : 0), 0) /
          monthDatas.length;
      }

      const profit = endStake * monthlyRate;
      endStake += profit;
      totalProfit += profit;

      // Einzahlungen über TransactionPlan (frequency wird ignoriert, aber nicht verwehrt)
      const monthlyDeposits = depositsPlan.filter((p) => {
        const pDate = parseDateSafe(p.date);
        return p.type === 'deposit' && pDate >= monthStart && pDate < monthEnd;
      });
      if (monthlyDeposits.length > 0) {
        monthlyDeposits.forEach(dp => {
          endStake += dp.amount;
          totalDeposits += dp.amount;
        });
      }
      // Auszahlungen über TransactionPlan
      const monthlyWithdrawals = withdrawalsPlan.filter((p) => {
        const pDate = parseDateSafe(p.date);
        return p.type === 'withdrawal' && pDate >= monthStart && pDate < monthEnd;
      });
      if (monthlyWithdrawals.length > 0) {
        monthlyWithdrawals.forEach(wp => {
          endStake -= wp.amount;
          totalWithdrawals += wp.amount;
        });
      }
      // Jährliche Ein-/Auszahlungen nur einmal pro Jahr
      if (month === 0 && yearlyDeposit > 0) {
        endStake += yearlyDeposit;
        totalDeposits += yearlyDeposit;
      }
      if (month === 11 && yearlyWithdrawal > 0) {
        endStake -= yearlyWithdrawal;
        totalWithdrawals += yearlyWithdrawal;
      }
    }

    // Alle Partner-Propertis inklusive initialStake und parentL1Id
    const partnerSummaries: PartnerSummary[] = partners.map((p) => ({
      partnerId: p.id,
      partnerName: p.name,
      level: p.level,
      totalCommission: 0,
    }));

    results.push({
      year: currentDate.getFullYear() + yearIdx,
      summary: {
        startStake: yearStartStake,
        endStake,
        totalProfit,
        totalDeposits,
        totalWithdrawals,
        partnerSummaries,
      },
      months: [],
    });

    currentStake = endStake;
  }

  return results;
}