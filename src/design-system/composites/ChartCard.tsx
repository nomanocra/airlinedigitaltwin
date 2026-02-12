import React from 'react';
import './ChartCard.css';

export interface ChartCardProps {
  /**
   * Title displayed in the card header.
   * Can be a string or any React node for custom rendering.
   */
  title: React.ReactNode;
  /**
   * Content displayed in the center of the header, between title and actions.
   * Useful for inline filters, labels, or other controls.
   */
  headerCenter?: React.ReactNode;
  /**
   * Action buttons/icons displayed on the right side of the header.
   * Typically IconButton or Button components.
   */
  actions?: React.ReactNode;
  /**
   * Filter section displayed below the header.
   * Can contain Select, DatePicker, or any other filter components.
   */
  filters?: React.ReactNode;
  /**
   * Main content of the card (chart, map, table, etc.)
   */
  children: React.ReactNode;
  /**
   * Footer content displayed at the bottom of the card.
   * Typically used for legends or additional actions.
   */
  footer?: React.ReactNode;
  /**
   * Additional CSS class for the card container.
   */
  className?: string;
  /**
   * Inline styles for the card container.
   * Use this to set custom width/height.
   */
  style?: React.CSSProperties;
}

/**
 * ChartCard Component
 *
 * A flexible card container for displaying charts, maps, tables, or any data visualization.
 * Features customizable header with title and actions, optional filter section, and optional footer.
 *
 * @example
 * ```tsx
 * <ChartCard
 *   title="Revenue Overview"
 *   actions={
 *     <>
 *       <IconButton icon="download" size="S" variant="Ghost" />
 *       <IconButton icon="open_in_full" size="S" variant="Ghost" />
 *     </>
 *   }
 *   filters={
 *     <Select options={periodOptions} value={period} onChange={setPeriod} />
 *   }
 *   footer={
 *     <div className="legend">
 *       <span className="legend-item">Total Revenues</span>
 *     </div>
 *   }
 * >
 *   <MyChart data={chartData} />
 * </ChartCard>
 * ```
 */
export function ChartCard({
  title,
  headerCenter,
  actions,
  filters,
  children,
  footer,
  className = '',
  style,
}: ChartCardProps) {
  const cardClasses = ['chart-card', className].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} style={style}>
      {/* Header */}
      <div className="chart-card__header">
        <div className="chart-card__title">{title}</div>
        {headerCenter && <div className="chart-card__header-center">{headerCenter}</div>}
        {actions && <div className="chart-card__actions">{actions}</div>}
      </div>

      {/* Filters (optional) */}
      {filters && <div className="chart-card__filters">{filters}</div>}

      {/* Content */}
      <div className="chart-card__content">{children}</div>

      {/* Footer (optional) */}
      {footer && <div className="chart-card__footer">{footer}</div>}
    </div>
  );
}

export default ChartCard;
