import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { IconButton } from '@/design-system/components/IconButton';
import { ChartCard } from '@/design-system/composites/ChartCard';
import './NetworkSummary.css';

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

      {/* Average Flown Distance per Year chart */}
      <ChartCard
        title="Average Flown Distance per Year"
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
              onMouseOver={(_, index) => {
                const bars = document.querySelectorAll('.study-page__tab-content .recharts-bar-rectangle path');
                if (bars[index]) (bars[index] as HTMLElement).style.fill = 'var(--primary-hover, #255fcc)';
              }}
              onMouseOut={(_, index) => {
                const bars = document.querySelectorAll('.study-page__tab-content .recharts-bar-rectangle path');
                if (bars[index]) (bars[index] as HTMLElement).style.fill = 'var(--primary-default, #063b9e)';
              }}
            >
              <LabelList dataKey="distance" position="top" style={{ fontSize: 11, fontWeight: 700, fill: 'var(--primary-default, #063b9e)', stroke: '#ffffff', strokeWidth: 3, paintOrder: 'stroke fill' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
}

export default NetworkSummary;
