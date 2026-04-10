/**
 * Parses a comma-formatted string back to a number
 * @param formatted - The formatted string (e.g., "1,000,000.50")
 * @returns The numeric value or null if invalid
 */
export function parseFormattedNumber(formatted: string | null | undefined): number | null {
  if (!formatted || formatted.trim() === '') {
    return null;
  }

  // Remove commas and parse
  const cleanValue = formatted.replace(/,/g, '');
  const numValue = parseFloat(cleanValue);

  return isNaN(numValue) ? null : numValue;
}
