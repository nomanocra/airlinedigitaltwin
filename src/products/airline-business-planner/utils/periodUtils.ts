import type { ColDef } from 'ag-grid-community';

export function generateMonthColumns(
  start: Date | undefined,
  end: Date | undefined,
  periodType: 'dates' | 'duration'
): ColDef[] {
  if (!start || !end) return [];
  const columns: ColDef[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endD = new Date(end.getFullYear(), end.getMonth(), 1);
  let monthIndex = 1;
  while (current <= endD) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    const yearIndex = Math.ceil(monthIndex / 12);
    const monthInYear = ((monthIndex - 1) % 12) + 1;
    columns.push({
      field: key,
      headerName: periodType === 'duration'
        ? `M${monthInYear} Y${yearIndex}`
        : current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      flex: 1,
      minWidth: 100,
    });
    current.setMonth(current.getMonth() + 1);
    monthIndex++;
  }
  return columns;
}

export function generateYearColumns(
  start: Date | undefined,
  end: Date | undefined,
  periodType: 'dates' | 'duration'
): ColDef[] {
  if (!start || !end) return [];
  const columns: ColDef[] = [];
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
    const yearIndex = y - start.getFullYear() + 1;
    columns.push({
      field: `Y${yearIndex}`,
      headerName: periodType === 'duration' ? `Y${yearIndex}` : String(y),
      flex: 1,
      minWidth: 90,
    });
  }
  return columns;
}

export function getMonthKeys(start: Date | undefined, end: Date | undefined): string[] {
  if (!start || !end) return [];
  const keys: string[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endD = new Date(end.getFullYear(), end.getMonth(), 1);
  while (current <= endD) {
    keys.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
    current.setMonth(current.getMonth() + 1);
  }
  return keys;
}

export function getYearKeys(start: Date | undefined, end: Date | undefined): string[] {
  if (!start || !end) return [];
  const keys: string[] = [];
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
    keys.push(`Y${y - start.getFullYear() + 1}`);
  }
  return keys;
}

export function getMonthLabels(
  start: Date | undefined,
  end: Date | undefined,
  periodType: 'dates' | 'duration'
): string[] {
  if (!start || !end) return [];
  const labels: string[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endD = new Date(end.getFullYear(), end.getMonth(), 1);
  let idx = 1;
  while (current <= endD) {
    if (periodType === 'duration') {
      const yIdx = Math.ceil(idx / 12);
      const mIdx = ((idx - 1) % 12) + 1;
      labels.push(`M${mIdx} Y${yIdx}`);
    } else {
      labels.push(current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }
    current.setMonth(current.getMonth() + 1);
    idx++;
  }
  return labels;
}

export function yearKeyToLabel(key: string, periodType: 'dates' | 'duration', startDate: Date | undefined): string {
  if (periodType === 'duration' || !startDate) return key;
  const idx = parseInt(key.replace('Y', ''), 10);
  return String(startDate.getFullYear() + idx - 1);
}

export function formatCurrency(v: number): string {
  return `$${v.toLocaleString('en-US')}`;
}
