// Calculator engine for compound interest with complex rules

export interface Partner {
  id: string;
  name: string;
  initialStake: number;
  level: 'L1' | 'L2';
  parentL1Id?: string; // For L2 partners: which L1 recruited them
}

export interface RealProfitData {
  date: string; // YYYY-MM-DD format
  grossProfitRate: number; // Daily gross profit rate (e.g., 0.008 for 0.8%)
}

export interface CalculationParams {
  initialStake: number;
  durationYears: number;
  durationMonths: number;
  partners: Partner[];
  deposits: TransactionPlan[];
  withdrawals: TransactionPlan[];
  realProfitData?: RealProfitData[];
  startDate?: Date;
  restakingDays?: number[]; // 1=Monday, 2=Tuesday, etc.
}

export interface TransactionPlan {
  frequency: 'monthly' | 'quarterly' | 'yearly';
  amount?: number;
  percentage?: number;
}

export interface PartnerCommission {
  partnerId: string;
  partnerName: string;
  commission: number;
  level: 'L1' | 'L2';
  fromPartnerId?: string; // For L1 commissions from L2 partners
}

export interface DailyResult {
  date: Date;
  stake: number;
  profit: number;
  partnerCommissions: PartnerCommission[];
  deposit: number;
  withdrawal: number;
  withdrawalFee: number;
  newStake: number;
  isWeekend: boolean;
  isVacation: boolean;
}

export interface PartnerSummary {
  partnerId: string;
  partnerName: string;
  level: 'L1' | 'L2';
  totalCommission: number;
}

export interface MonthlyResult {
  year: number;
  month: number;
  days: DailyResult[];
  summary: {
    startStake: number;
    endStake: number;
    totalProfit: number;
    partnerSummaries: PartnerSummary[];
    totalDeposits: number;
    totalWithdrawals: number;
  };
}

export interface YearlyResult {
  year: number;
  months: MonthlyResult[];
  summary: {
    startStake: number;
    endStake: number;
    totalProfit: number;
    partnerSummaries: PartnerSummary[];
    totalDeposits: number;
    totalWithdrawals: number;
  };
}

const DEFAULT_MONTHLY_GROSS_PROFIT_RATE = 0.16; // 16% per month
const WORKING_DAYS_PER_MONTH = 20; // Average

// Get daily profit rate - use real data if available, otherwise default
function getDailyProfitRate(date: Date, realProfitData?: RealProfitData[]): number {
  if (realProfitData && realProfitData.length > 0) {
    const dateStr = date.toISOString().split('T')[0];
    const realData = realProfitData.find(d => d.date === dateStr);
    if (realData) {
      return realData.grossProfitRate;
    }
  }
  // Default: 16% monthly / 20 working days
  return DEFAULT_MONTHLY_GROSS_PROFIT_RATE / WORKING_DAYS_PER_MONTH;
}

// Profit share tiers - CORRECTED thresholds
function getProfitShare(stake: number): number {
  if (stake < 200) return 0;
  if (stake < 1000) return 0.20;      // $200.00 - $999.99
  if (stake < 10000) return 0.30;     // $1,000.00 - $9,999.99
  if (stake < 20000) return 0.40;     // $10,000.00 - $19,999.99
  if (stake < 50000) return 0.50;     // $20,000.00 - $49,999.99
  return 0.60;                         // $50,000.00+
}

// Commission rates for referrals - paid by the bank, not from partner's profit
function getCommissionRates(stake: number): { l1: number; l2: number } {
  if (stake < 1000) return { l1: 1.00, l2: 0.50 };      // up to $999.99
  if (stake < 10000) return { l1: 0.50, l2: 0.25 };     // $1,000.00 - $9,999.99
  if (stake < 20000) return { l1: 0.25, l2: 0.125 };    // $10,000.00 - $19,999.99
  if (stake < 50000) return { l1: 0.10, l2: 0.05 };     // $20,000.00 - $49,999.99
  return { l1: 0.05, l2: 0.025 };                       // $50,000.00+
}

// Check if date is a weekend
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// Check if date is a working day (Monday-Friday, not during vacation)
function isWorkingDay(date: Date, restakingDays?: number[]): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false; // Weekend
  
  if (isVacationPeriod(date)) return false;
  
  // If restaking days specified, check if today is a restaking day
  if (restakingDays && restakingDays.length > 0) {
    return restakingDays.includes(day);
  }
  
  return true;
}

// Check if date is in vacation period
function isVacationPeriod(date: Date): boolean {
  const year = date.getFullYear();
  
  // Summer vacation: 2 weeks starting Monday of week containing July 15
  const summerStart = getMondayOfWeekContaining(new Date(year, 6, 15));
  const summerEnd = new Date(summerStart);
  summerEnd.setDate(summerEnd.getDate() + 13);
  
  // Christmas vacation: 2 weeks starting Monday before Dec 25
  // Check both current year and previous year (for early January dates)
  const christmasYears = [year, year - 1];
  
  for (const y of christmasYears) {
    const christmas = new Date(y, 11, 25);
    const christmasStart = getMondayBeforeDate(christmas);
    const christmasEnd = new Date(christmasStart);
    christmasEnd.setDate(christmasEnd.getDate() + 13);
    
    if (date >= christmasStart && date <= christmasEnd) {
      return true;
    }
  }
  
  return date >= summerStart && date <= summerEnd;
}
// Check if date is in backoffice vacation (vacation + 1 week after)
function isBackofficeVacation(date: Date): boolean {
  const year = date.getFullYear();
  
  const summerStart = getMondayOfWeekContaining(new Date(year, 6, 15));
  const summerEnd = new Date(summerStart);
  summerEnd.setDate(summerEnd.getDate() + 20); // 3 weeks total
  
  const christmas = new Date(year, 11, 25);
  const christmasStart = getMondayBeforeDate(christmas);
  const christmasEnd = new Date(christmasStart);
  christmasEnd.setDate(christmasEnd.getDate() + 20); // 3 weeks total
  
  return (date >= summerStart && date <= summerEnd) || 
         (date >= christmasStart && date <= christmasEnd);
}

function getMondayOfWeekContaining(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Adjust to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMondayBeforeDate(date: Date): Date {
  const d = new Date(date);
  while (d.getDay() !== 1) {
    d.setDate(d.getDate() - 1);
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

// Calculate withdrawal fee
function getWithdrawalFee(amount: number, withdrawalCountThisMonth: number): number {
  const rate = withdrawalCountThisMonth < 2 ? 0.0125 : 0.025;
  return amount * rate;
}

// Check if transaction should occur on this date
function shouldExecuteTransaction(
  date: Date,
  plan: TransactionPlan,
  startDate: Date
): boolean {
  if (isBackofficeVacation(date)) return false;
  
  const monthsDiff = (date.getFullYear() - startDate.getFullYear()) * 12 + 
                     (date.getMonth() - startDate.getMonth());
  
  if (plan.frequency === 'monthly') {
    return date.getDate() === startDate.getDate() && monthsDiff > 0;
  } else if (plan.frequency === 'quarterly') {
    return date.getDate() === startDate.getDate() && monthsDiff > 0 && monthsDiff % 3 === 0;
  } else if (plan.frequency === 'yearly') {
    return date.getDate() === startDate.getDate() && 
           date.getMonth() === startDate.getMonth() && 
           date.getFullYear() > startDate.getFullYear();
  }
  
  return false;
}

export function calculateCompound(params: CalculationParams): YearlyResult[] {
  const startDate = params.startDate || new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + params.durationYears);
  endDate.setMonth(endDate.getMonth() + params.durationMonths);
  
  // Default restaking days: all weekdays
  const restakingDays = params.restakingDays && params.restakingDays.length > 0 
    ? params.restakingDays 
    : [1, 2, 3, 4, 5];
  
  let currentStake = params.initialStake;
  const yearlyResults: YearlyResult[] = [];
  
  // Track each partner's stake (they also restake daily)
  const partnerStakes = new Map<string, number>();
  params.partners.forEach(partner => {
    partnerStakes.set(partner.id, partner.initialStake);
  });
  
  // Create a map for L1 -> L2 relationships
  const l2ByL1 = new Map<string, Partner[]>();
  const l1Partners = params.partners.filter(p => p.level === 'L1');
  const l2Partners = params.partners.filter(p => p.level === 'L2');
  
  l1Partners.forEach(l1 => {
    l2ByL1.set(l1.id, l2Partners.filter(l2 => l2.parentL1Id === l1.id));
  });
  
  let currentDate = new Date(startDate);
  let withdrawalCountThisMonth = 0;
  let lastMonth = currentDate.getMonth();
  
  const dailyResults: DailyResult[] = [];
  
  while (currentDate <= endDate) {
    // Reset withdrawal count at month change
    if (currentDate.getMonth() !== lastMonth) {
      withdrawalCountThisMonth = 0;
      lastMonth = currentDate.getMonth();
    }
    
    const isWeekendDay = isWeekend(currentDate);
    const isVacationDay = isVacationPeriod(currentDate);
    
    let dayProfit = 0;
    const dayPartnerCommissions: PartnerCommission[] = [];
    let dayDeposit = 0;
    let dayWithdrawal = 0;
    let dayWithdrawalFee = 0;
    
    // Calculate daily profit if working day and restaking day
    if (isWorkingDay(currentDate, restakingDays)) {
      const dailyProfitRate = getDailyProfitRate(currentDate, params.realProfitData);
      const dailyGrossProfit = currentStake * dailyProfitRate;
      const profitShare = getProfitShare(currentStake);
      dayProfit = dailyGrossProfit * profitShare;
      
      // Process L1 partners and their L2 referrals
      for (const l1Partner of l1Partners) {
        const l1Stake = partnerStakes.get(l1Partner.id) || 0;
        
        if (l1Stake > 0) {
          // Calculate L1 partner's own daily profit
          const l1DailyProfitRate = getDailyProfitRate(currentDate, params.realProfitData);
          const l1DailyGrossProfit = l1Stake * l1DailyProfitRate;
          const l1ProfitShare = getProfitShare(l1Stake);
          const l1NetProfit = l1DailyGrossProfit * l1ProfitShare;
          
          // L1 partner restakes their own profit
          partnerStakes.set(l1Partner.id, l1Stake + l1NetProfit);
          
          // Commission for investor from L1 partner (paid by bank)
          const l1CommissionRates = getCommissionRates(l1Stake);
          const l1Commission = l1NetProfit * l1CommissionRates.l1;
          
          dayPartnerCommissions.push({
            partnerId: l1Partner.id,
            partnerName: l1Partner.name,
            commission: l1Commission,
            level: 'L1',
          });
          
          // Add L1 commission to investor's stake
          currentStake += l1Commission;
          
          // Process L2 partners under this L1
          const l2PartnersUnderL1 = l2ByL1.get(l1Partner.id) || [];
          for (const l2Partner of l2PartnersUnderL1) {
            const l2Stake = partnerStakes.get(l2Partner.id) || 0;
            
            if (l2Stake > 0) {
              // Calculate L2 partner's own daily profit
              const l2DailyProfitRate = getDailyProfitRate(currentDate, params.realProfitData);
              const l2DailyGrossProfit = l2Stake * l2DailyProfitRate;
              const l2ProfitShare = getProfitShare(l2Stake);
              const l2NetProfit = l2DailyGrossProfit * l2ProfitShare;
              
              // L2 partner restakes their own profit
              partnerStakes.set(l2Partner.id, l2Stake + l2NetProfit);
              
              // Commission rates based on L2 stake
              const l2CommissionRates = getCommissionRates(l2Stake);
              
              // Commission for investor from L2 partner (paid by bank)
              const l2CommissionForInvestor = l2NetProfit * l2CommissionRates.l2;
              
              dayPartnerCommissions.push({
                partnerId: l2Partner.id,
                partnerName: l2Partner.name,
                commission: l2CommissionForInvestor,
                level: 'L2',
              });
              
              // Add L2 commission to investor's stake
              currentStake += l2CommissionForInvestor;
              
              // L1 also receives commission from their L2 referrals (paid by bank)
              const l1CommissionFromL2 = l2NetProfit * l2CommissionRates.l1;
              
              dayPartnerCommissions.push({
                partnerId: l1Partner.id,
                partnerName: l1Partner.name,
                commission: l1CommissionFromL2,
                level: 'L1',
                fromPartnerId: l2Partner.id,
              });
              
              // This L1 commission from L2 is added to L1's stake (they receive it)
              const currentL1Stake = partnerStakes.get(l1Partner.id) || 0;
              partnerStakes.set(l1Partner.id, currentL1Stake + l1CommissionFromL2);
            }
          }
        }
      }
      
      // Process orphan L2 partners (not assigned to any L1)
      const orphanL2s = l2Partners.filter(p => !p.parentL1Id);
      for (const l2Partner of orphanL2s) {
        const l2Stake = partnerStakes.get(l2Partner.id) || 0;
        
        if (l2Stake > 0) {
          const l2DailyProfitRate = getDailyProfitRate(currentDate, params.realProfitData);
          const l2DailyGrossProfit = l2Stake * l2DailyProfitRate;
          const l2ProfitShare = getProfitShare(l2Stake);
          const l2NetProfit = l2DailyGrossProfit * l2ProfitShare;
          
          partnerStakes.set(l2Partner.id, l2Stake + l2NetProfit);
          
          const l2CommissionRates = getCommissionRates(l2Stake);
          const l2Commission = l2NetProfit * l2CommissionRates.l2;
          
          dayPartnerCommissions.push({
            partnerId: l2Partner.id,
            partnerName: l2Partner.name,
            commission: l2Commission,
            level: 'L2',
          });
          
          currentStake += l2Commission;
        }
      }
      
      // Add investor's own profit to stake
      currentStake += dayProfit;
    }
    
    // Process deposits
    for (const deposit of params.deposits) {
      if (shouldExecuteTransaction(currentDate, deposit, startDate)) {
        dayDeposit = deposit.amount || 0;
        currentStake += dayDeposit;
      }
    }
    
    // Process withdrawals
    for (const withdrawal of params.withdrawals) {
      if (shouldExecuteTransaction(currentDate, withdrawal, startDate)) {
        let withdrawalAmount = withdrawal.amount || 0;
        if (withdrawal.percentage) {
          // Calculate based on monthly profit (use default rate for estimation)
          const monthlyProfit = (currentStake * DEFAULT_MONTHLY_GROSS_PROFIT_RATE) * getProfitShare(currentStake);
          withdrawalAmount = monthlyProfit * (withdrawal.percentage / 100);
        }
        
        dayWithdrawalFee = getWithdrawalFee(withdrawalAmount, withdrawalCountThisMonth);
        dayWithdrawal = withdrawalAmount;
        currentStake -= (withdrawalAmount + dayWithdrawalFee);
        withdrawalCountThisMonth++;
      }
    }
    
    // Calculate stake before today's transactions
    const totalCommissions = dayPartnerCommissions.reduce((sum, pc) => sum + pc.commission, 0);
    const stakeBeforeDay = currentStake - dayProfit - totalCommissions - dayDeposit + dayWithdrawal + dayWithdrawalFee;
    
    dailyResults.push({
      date: new Date(currentDate),
      stake: stakeBeforeDay,
      profit: dayProfit,
      partnerCommissions: dayPartnerCommissions,
      deposit: dayDeposit,
      withdrawal: dayWithdrawal,
      withdrawalFee: dayWithdrawalFee,
      newStake: currentStake,
      isWeekend: isWeekendDay,
      isVacation: isVacationDay,
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Group by year and month
  const groupedByYear = new Map<number, Map<number, DailyResult[]>>();
  
  for (const day of dailyResults) {
    const year = day.date.getFullYear();
    const month = day.date.getMonth();
    
    if (!groupedByYear.has(year)) {
      groupedByYear.set(year, new Map());
    }
    
    const yearMap = groupedByYear.get(year)!;
    if (!yearMap.has(month)) {
      yearMap.set(month, []);
    }
    
    yearMap.get(month)!.push(day);
  }
  
  // Create yearly results
  for (const [year, monthsMap] of groupedByYear) {
    const months: MonthlyResult[] = [];
    let yearStartStake = 0;
    let yearEndStake = 0;
    let yearTotalProfit = 0;
    const yearPartnerTotals = new Map<string, { name: string; level: 'L1' | 'L2'; total: number }>();
    let yearTotalDeposits = 0;
    let yearTotalWithdrawals = 0;
    
    for (const [month, days] of monthsMap) {
      const monthStartStake = days[0].stake;
      const monthEndStake = days[days.length - 1].newStake;
      const monthTotalProfit = days.reduce((sum, d) => sum + d.profit, 0);
      const monthTotalDeposits = days.reduce((sum, d) => sum + d.deposit, 0);
      const monthTotalWithdrawals = days.reduce((sum, d) => sum + d.withdrawal, 0);
      
      // Aggregate partner commissions
      const monthPartnerTotals = new Map<string, { name: string; level: 'L1' | 'L2'; total: number }>();
      days.forEach(day => {
        day.partnerCommissions.forEach(pc => {
          const existing = monthPartnerTotals.get(pc.partnerId) || { name: pc.partnerName, level: pc.level, total: 0 };
          existing.total += pc.commission;
          monthPartnerTotals.set(pc.partnerId, existing);
          
          const yearExisting = yearPartnerTotals.get(pc.partnerId) || { name: pc.partnerName, level: pc.level, total: 0 };
          yearExisting.total += pc.commission;
          yearPartnerTotals.set(pc.partnerId, yearExisting);
        });
      });
      
      const monthPartnerSummaries: PartnerSummary[] = Array.from(monthPartnerTotals.entries()).map(([id, data]) => ({
        partnerId: id,
        partnerName: data.name,
        level: data.level,
        totalCommission: data.total,
      }));
      
      if (months.length === 0) yearStartStake = monthStartStake;
      yearEndStake = monthEndStake;
      yearTotalProfit += monthTotalProfit;
      yearTotalDeposits += monthTotalDeposits;
      yearTotalWithdrawals += monthTotalWithdrawals;
      
      months.push({
        year,
        month,
        days,
        summary: {
          startStake: monthStartStake,
          endStake: monthEndStake,
          totalProfit: monthTotalProfit,
          partnerSummaries: monthPartnerSummaries,
          totalDeposits: monthTotalDeposits,
          totalWithdrawals: monthTotalWithdrawals,
        },
      });
    }
    
    const yearPartnerSummaries: PartnerSummary[] = Array.from(yearPartnerTotals.entries()).map(([id, data]) => ({
      partnerId: id,
      partnerName: data.name,
      level: data.level,
      totalCommission: data.total,
    }));
    
    yearlyResults.push({
      year,
      months,
      summary: {
        startStake: yearStartStake,
        endStake: yearEndStake,
        totalProfit: yearTotalProfit,
        partnerSummaries: yearPartnerSummaries,
        totalDeposits: yearTotalDeposits,
        totalWithdrawals: yearTotalWithdrawals,
      },
    });
  }
  
  return yearlyResults;
}