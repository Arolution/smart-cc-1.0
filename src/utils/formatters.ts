/**
 * Utility functions for formatting numbers in premium visualizations
 */

/**
 * Format a number as currency with commas and 2 decimal places
 * @param value - The number to format
 * @returns Formatted string like "$1,234.56"
 */
export const formatCurrency = (value: number): string => {
  return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * Format a number as currency with commas but no decimal places
 * @param value - The number to format
 * @returns Formatted string like "$1,234"
 */
export const formatCurrencyWhole = (value: number): string => {
  return `$${Math.round(value).toLocaleString()}`;
};

/**
 * Format a number in thousands with 'k' suffix
 * @param value - The number to format
 * @returns Formatted string like "$123k"
 */
export const formatCurrencyShort = (value: number): string => {
  return `$${(value / 1000).toFixed(0)}k`;
};
