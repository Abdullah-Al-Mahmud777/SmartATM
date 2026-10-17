const escape = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

export const toCsv = (
  rows: Array<Record<string, unknown>>,
  columns?: string[]
): string => {
  if (!rows.length) return '';
  const keys = columns ?? Object.keys(rows[0]);
  const header = keys.join(',');
  const body = rows
    .map((row) => keys.map((key) => escape(row[key])).join(','))
    .join('\n');
  return `${header}\n${body}`;
};
