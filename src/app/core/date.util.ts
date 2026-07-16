/** Formats a Date as a strict "YYYY-MM-DD" string — the only date shape sent to/from the API. */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parses a strict "YYYY-MM-DD" string into a local Date, avoiding the UTC off-by-one that `new Date(str)` can introduce. */
export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year || 1970, (month || 1) - 1, day || 1);
}

/** Renders a "YYYY-MM-DD" value as a friendly display date, e.g. "12 Aug 2026". */
export function formatDisplayDate(value: string): string {
  return parseIsoDate(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
