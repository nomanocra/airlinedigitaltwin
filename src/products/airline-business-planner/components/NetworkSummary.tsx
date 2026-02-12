import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';
import { IconButton } from '@/design-system/components/IconButton';
import { Select } from '@/design-system/components/Select';
import { ChartCard } from '@/design-system/composites/ChartCard';
import './NetworkSummary.css';

// Color palette for A/C types
const AC_TYPE_COLORS = [
  'var(--primary-default, #063b9e)',
  'var(--sea-blue-50, #1a73e8)',
  'var(--cool-grey-50, #6b7280)',
  'var(--warm-grey-50, #78716c)',
  'var(--sea-blue-30, #64b5f6)',
  'var(--cool-grey-70, #374151)',
];

interface RouteEntry {
  id: string;
  origin: string;
  destination: string;
  startDate: Date;
  endDate: Date;
}

interface FleetEntry {
  id: string;
  aircraftType: string;
  numberOfAircraft: number;
}

interface NetworkSummaryProps {
  routeEntries: RouteEntry[];
  fleetEntries: FleetEntry[];
  startDate?: Date;
  endDate?: Date;
  periodType?: 'dates' | 'duration';
}

export function NetworkSummary({ routeEntries, fleetEntries, startDate, endDate, periodType = 'dates' }: NetworkSummaryProps) {
  const [flightsYearFilter, setFlightsYearFilter] = useState('all');

  // KPIs
  const numberOfRoutes = routeEntries.length;

  const airports = useMemo(() => {
    const set = new Set<string>();
    routeEntries.forEach(r => {
      set.add(r.origin);
      set.add(r.destination);
    });
    return set;
  }, [routeEntries]);

  const numberOfAirports = airports.size;

  const totalFlights = useMemo(() => {
    const totalAC = fleetEntries.reduce((sum, e) => sum + e.numberOfAircraft, 0);
    if (totalAC === 0) return 0;
    return Math.round((numberOfRoutes * 14 * 12) / totalAC);
  }, [numberOfRoutes, fleetEntries]);

  // Chart data - Average Flown Distance per Year
  const chartData = useMemo(() => {
    if (!startDate || !endDate) return [];
    const data = [];
    for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
      const yearIndex = y - startDate.getFullYear() + 1;
      data.push({
        year: periodType === 'duration' ? `Y${yearIndex}` : String(y),
        distance: Math.round(2000 + Math.random() * 2500),
      });
    }
    return data;
  }, [startDate, endDate, periodType]);

  // Year options for flights per A/C type filter
  const flightsYearOptions = useMemo(() => {
    const opts = [{ value: 'all', label: 'All' }];
    if (startDate && endDate) {
      for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
        opts.push({ value: String(y), label: String(y) });
      }
    }
    return opts;
  }, [startDate, endDate]);

  // Chart data - Flights per A/C Type
  const flightsPerAcTypeData = useMemo(() => {
    if (fleetEntries.length === 0) return [];

    // Generate mock flight data per A/C type
    // In a real app, this would come from actual flight data
    return fleetEntries.map((entry, index) => {
      // Base flights calculation with some randomness
      const baseFlights = entry.numberOfAircraft * (flightsYearFilter === 'all' ? 850 : 170);
      const variance = Math.round(baseFlights * 0.2 * (Math.random() - 0.5));
      return {
        aircraftType: entry.aircraftType,
        flights: baseFlights + variance,
        color: AC_TYPE_COLORS[index % AC_TYPE_COLORS.length],
      };
    });
  }, [fleetEntries, flightsYearFilter]);

  return (
    <>
      {/* KPI cards */}
      <div className="network-summary__kpis">
        <div className="network-summary__kpi-card">
          <span className="network-summary__kpi-label label-medium-s">Number of Routes</span>
          <span className="network-summary__kpi-value">{numberOfRoutes}</span>
        </div>
        <div className="network-summary__kpi-card">
          <span className="network-summary__kpi-label label-medium-s">Number of Airport</span>
          <span className="network-summary__kpi-value">{numberOfAirports}</span>
        </div>
        <div className="network-summary__kpi-card">
          <span className="network-summary__kpi-label label-medium-s">Av. Flights per A/C Type</span>
          <span className="network-summary__kpi-value">{totalFlights}</span>
        </div>
      </div>

      {/* Av. Flown Distance per Year chart */}
      <ChartCard
        title="Av. Flown Distance per Year"
        actions={
          <>
            <IconButton icon="download" size="XS" variant="Ghost" alt="Download" />
            <IconButton icon="open_in_full" size="XS" variant="Ghost" alt="Fullscreen" />
          </>
        }
        className="network-summary__chart-card"
        style={{ flex: 1 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default, #ccd4e0)" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 12, fill: 'var(--text-secondary, #6b7280)' } }}
            />
            <Tooltip cursor={false} />
            <Bar
              dataKey="distance"
              fill="var(--primary-default, #063b9e)"
              radius={[2, 2, 0, 0]}
            >
              <LabelList dataKey="distance" position="top" style={{ fontSize: 11, fontWeight: 700, fill: 'var(--primary-default, #063b9e)', stroke: '#ffffff', strokeWidth: 3, paintOrder: 'stroke fill' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Av. Flights per A/C Type chart */}
      <ChartCard
        title="Av. Flights per A/C Type"
        headerCenter={
          <span className="network-summary__filter-inline">
            <span className="network-summary__filter-label body-regular">Year</span>
            <Select
              options={flightsYearOptions}
              value={flightsYearFilter}
              onValueChange={setFlightsYearFilter}
              size="XS"
              showLabel={false}
            />
          </span>
        }
        actions={
          <>
            <IconButton icon="download" size="XS" variant="Ghost" alt="Download" />
            <IconButton icon="open_in_full" size="XS" variant="Ghost" alt="Fullscreen" />
          </>
        }
        className="network-summary__chart-card"
        style={{ flex: 1 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={flightsPerAcTypeData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default, #ccd4e0)" />
            <XAxis dataKey="aircraftType" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{ value: 'Flights', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 12, fill: 'var(--text-secondary, #6b7280)' } }}
            />
            <Tooltip cursor={false} />
            <Bar dataKey="flights" radius={[2, 2, 0, 0]}>
              {flightsPerAcTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList dataKey="flights" position="top" style={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-main, #1f2937)', stroke: '#ffffff', strokeWidth: 3, paintOrder: 'stroke fill' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
}

export default NetworkSummary;
