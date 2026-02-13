import { useMemo, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts';
import { IconButton } from '@/design-system/components/IconButton';
import { Select } from '@/design-system/components/Select';
import { ChartCard } from '@/design-system/composites/ChartCard';
import { useContainerSize } from '../hooks/useContainerSize';
import { CLASS_LABELS } from '../utils/cabinClassUtils';
import './LoadFactorSummary.css';

interface LoadFactorSummaryProps {
  startDate?: Date;
  endDate?: Date;
  periodType?: 'dates' | 'duration';
  activeClasses?: string[];
}

const TICK_STYLE = { fontSize: 11, fill: 'var(--text-secondary, #63728a)' };
const AXIS_LABEL_STYLE = { fontSize: 12, fontWeight: 700, fill: 'var(--text-secondary, #63728a)' };

export function LoadFactorSummary({ startDate, endDate, periodType = 'dates', activeClasses = [] }: LoadFactorSummaryProps) {
  const [chartRef, chartSize] = useContainerSize<HTMLDivElement>();
  const [selectedClass, setSelectedClass] = useState('all');

  const classFilterOptions = useMemo(() => [
    { value: 'all', label: 'All Classes' },
    ...activeClasses.map(code => ({ value: code, label: CLASS_LABELS[code] || code })),
  ], [activeClasses]);

  const classLabel = selectedClass === 'all'
    ? 'All booking classes'
    : CLASS_LABELS[selectedClass] || selectedClass;

  const chartData = useMemo(() => {
    if (!startDate || !endDate) return [];
    const data = [];
    for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
      const yearIndex = y - startDate.getFullYear() + 1;
      const label = periodType === 'duration' ? `Y${yearIndex}` : String(y);
      const baseSeats = 800 + yearIndex * 500 + Math.round(Math.random() * 200);
      const loadFactor = Math.min(85, 55 + yearIndex * 4 + Math.round(Math.random() * 3));
      const pax = Math.round(baseSeats * (loadFactor / 100));
      data.push({
        year: label,
        seats: baseSeats,
        pax,
        loadFactor,
      });
    }
    return data;
  }, [startDate, endDate, periodType]);

  const legend = (
    <div className="load-factor-summary__legend">
      <div className="load-factor-summary__legend-item">
        <span className="load-factor-summary__legend-swatch" style={{ backgroundColor: 'var(--primary-hover, #255fcc)' }} />
        <span className="load-factor-summary__legend-label">Seats, {classLabel}</span>
      </div>
      <div className="load-factor-summary__legend-item">
        <span className="load-factor-summary__legend-swatch" style={{ backgroundColor: 'var(--sea-blue-40, #86a8e9)' }} />
        <span className="load-factor-summary__legend-label">PAX, {classLabel}</span>
      </div>
      <div className="load-factor-summary__legend-item">
        <span className="load-factor-summary__legend-line" style={{ backgroundColor: 'var(--sky-blue-50, #5fc3ff)' }} />
        <span className="load-factor-summary__legend-label">Av. Load Factor</span>
      </div>
    </div>
  );

  return (
    <ChartCard
      title="Load Factor Evolution Summary"
      actions={
        <>
          <IconButton icon="download" size="XS" variant="Ghost" alt="Download" />
          <IconButton icon="open_in_full" size="XS" variant="Ghost" alt="Fullscreen" />
        </>
      }
      filters={
        activeClasses.length > 0 ? (
          <div style={{ width: 140 }}>
            <Select
              options={classFilterOptions}
              value={selectedClass}
              onValueChange={setSelectedClass}
              size="S"
              showLabel={false}
            />
          </div>
        ) : undefined
      }
      footer={legend}
      className="load-factor-summary__chart-card"
      style={{ flex: 1 }}
    >
      <div ref={chartRef} style={{ width: '100%', height: '100%' }}>
        {chartSize.width > 0 && chartSize.height > 0 && (
          <ComposedChart
            width={chartSize.width}
            height={chartSize.height}
            data={chartData}
            margin={{ top: 16, right: 8, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default, #ccd4e0)" />
            <XAxis dataKey="year" tick={TICK_STYLE} />
            <YAxis
              yAxisId="left"
              tick={TICK_STYLE}
              label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft', offset: 0, style: AXIS_LABEL_STYLE }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={TICK_STYLE}
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              label={{ value: 'Load Factor', angle: 90, position: 'insideRight', offset: 0, style: AXIS_LABEL_STYLE }}
            />
            <Tooltip
              cursor={false}
              formatter={(value: number, name: string) => {
                if (name === 'loadFactor') return [`${value}%`, 'Av. Load Factor'];
                return [value, name === 'seats' ? `Seats, ${classLabel}` : `PAX, ${classLabel}`];
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="seats"
              fill="var(--primary-hover, #255fcc)"
              radius={[2, 2, 0, 0]}
              activeBar={{ fill: 'var(--primary-default, #063b9e)' }}
            >
              <LabelList dataKey="seats" position="top" style={{ fontSize: 10, fontWeight: 700, fill: 'var(--primary-hover, #255fcc)', stroke: '#ffffff', strokeWidth: 3, paintOrder: 'stroke fill' }} />
            </Bar>
            <Bar
              yAxisId="left"
              dataKey="pax"
              fill="var(--sea-blue-40, #86a8e9)"
              radius={[2, 2, 0, 0]}
              activeBar={{ fill: 'var(--sea-blue-50, #638ee0)' }}
            >
              <LabelList dataKey="pax" position="top" style={{ fontSize: 10, fontWeight: 700, fill: 'var(--sea-blue-40, #86a8e9)', stroke: '#ffffff', strokeWidth: 3, paintOrder: 'stroke fill' }} />
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="loadFactor"
              stroke="var(--sky-blue-50, #5fc3ff)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--sky-blue-50, #5fc3ff)', stroke: 'var(--sky-blue-50, #5fc3ff)', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#ffffff', stroke: 'var(--sky-blue-50, #5fc3ff)', strokeWidth: 2 }}
            >
              <LabelList
                dataKey="loadFactor"
                position="top"
                offset={12}
                formatter={(v: number) => `${v}%`}
                style={{ fontSize: 10, fontWeight: 700, fill: 'var(--sky-blue-50, #5fc3ff)', stroke: '#ffffff', strokeWidth: 3, paintOrder: 'stroke fill' }}
              />
            </Line>
          </ComposedChart>
        )}
      </div>
    </ChartCard>
  );
}

export default LoadFactorSummary;
