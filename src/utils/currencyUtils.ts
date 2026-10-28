/**
 * Civentral Mobile Apps - Central Currency Formatting Utility
 * Standard format: ₱1,234.56
 */

/**
 * Format numeric or string amount as Philippine Peso with two decimal places.
 * e.g., 5000 -> "₱5,000.00"
 */
export function formatCurrency(
  amount?: number | string | null,
  fallback = '—'
): string {
  if (amount === undefined || amount === null || amount === '') {
    return fallback;
  }

  const num =
    typeof amount === 'number'
      ? amount
      : Number(String(amount).replace(/[^0-9.-]/g, ''));

  if (isNaN(num)) {
    return fallback;
  }

  return `₱${num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Parse a currency string or number to a raw numeric value.
 */
export function parseCurrency(value?: string | number | null): number {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
