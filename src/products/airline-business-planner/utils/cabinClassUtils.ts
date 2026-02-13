import type { FleetEntry } from '../components/AddAircraftModal';

// Display order for cabin classes (First → Economy)
export const CLASS_ORDER = ['F', 'J', 'C', 'W', 'Y'] as const;

// Human-readable labels
export const CLASS_LABELS: Record<string, string> = {
  F: 'First (F)',
  J: 'Business (J)',
  C: 'Club (C)',
  W: 'Premium (W)',
  Y: 'Economy (Y)',
};

/**
 * Parse a layout string like "J30-W21-Y222" or "F12 Y138" into cabin class entries.
 * Supports both dash and space separators.
 */
export function parseLayoutClasses(layout: string): Array<{ code: string; seats: number }> {
  if (!layout) return [];
  // Split by dash or space
  const segments = layout.split(/[-\s]+/).filter(Boolean);
  const result: Array<{ code: string; seats: number }> = [];
  for (const segment of segments) {
    const match = segment.match(/^([A-Z])(\d+)$/);
    if (match) {
      result.push({ code: match[1], seats: parseInt(match[2], 10) });
    }
  }
  return result;
}

/**
 * Get the union of all cabin class codes from the fleet, sorted by CLASS_ORDER.
 */
export function getActiveClasses(fleetEntries: FleetEntry[]): string[] {
  const classSet = new Set<string>();
  for (const entry of fleetEntries) {
    const classes = entry.cabinClasses || parseLayoutClasses(entry.layout);
    for (const cls of classes) {
      classSet.add(cls.code);
    }
  }
  return CLASS_ORDER.filter(c => classSet.has(c));
}
