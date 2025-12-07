// Default configuration values used across the app
// - stakeDefault: default stake value for new simulations (minimum investor)
// - defaultStartDateIso: default start date (today + 1 day) in local 'YYYY-MM-DD' format
//
// Exportiert sowohl named export DEFAULTS als auch default export.

function localIsoDatePlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const DEFAULTS = {
  stakeDefault: 200,                 // Mindestinvest (default stake)
  defaultStartDateIso: localIsoDatePlusDays(1), // today + 1 day
};

export default DEFAULTS;