import { Checkbox } from './Checkbox';
import { StudyStatus, StudyStatusState } from './StudyStatus';
import { IconButton } from './IconButton';
import './StudyRow.css';

export interface StudyRowColumn {
  key: string;
  value: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  /** Fixed width (e.g. '200px', '30%') */
  width?: string;
  /** Flex grow factor (default: 1) */
  flex?: number;
}

export interface StudyRowProps {
  /**
   * Study status
   */
  status: StudyStatusState;
  /**
   * Column data
   */
  columns: StudyRowColumn[];
  /**
   * Show checkbox for selection
   * @default false
   */
  selectable?: boolean;
  /**
   * Checkbox selected state
   * @default false
   */
  selected?: boolean;
  /**
   * Callback when selection changes
   */
  onSelectionChange?: (selected: boolean) => void;
  /**
   * Show more options button on hover
   * @default false
   */
  showMoreOptions?: boolean;
  /**
   * Callback when more options button is clicked
   */
  onMoreOptionsClick?: (e: React.MouseEvent) => void;
  /**
   * Click handler for the row
   */
  onClick?: () => void;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * StudyRow Component
 *
 * Table row for displaying study information with status, configurable columns,
 * optional checkbox, and hover-revealed actions.
 *
 * @example
 * ```tsx
 * <StudyRow
 *   status="Computed"
 *   columns={[
 *     { key: 'name', value: 'My Study' },
 *     { key: 'description', value: 'Study description' },
 *   ]}
 *   selectable
 *   showMoreOptions
 * />
 * ```
 */
export function StudyRow({
  status,
  columns,
  selectable = false,
  selected = false,
  onSelectionChange,
  showMoreOptions = false,
  onMoreOptionsClick,
  onClick,
  className = '',
}: StudyRowProps) {
  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    if (checked !== 'indeterminate') {
      onSelectionChange?.(checked);
    }
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoreOptionsClick?.(e);
  };

  const classes = [
    'study-row',
    selected ? 'study-row--selected' : '',
    status === 'Failed' ? 'study-row--failed' : '',
    status === 'Warning' ? 'study-row--warning' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Checkbox column */}
      {selectable && (
        <div className="study-row__cell study-row__cell--checkbox">
          <Checkbox
            checked={selected}
            onCheckedChange={handleCheckboxChange}
            size="S"
            showLabel={false}
          />
        </div>
      )}

      {/* Status column */}
      <div className="study-row__cell study-row__cell--status">
        <StudyStatus state={status} />
      </div>

      {/* Data columns */}
      {columns.map((column) => {
        const style: React.CSSProperties = column.width
          ? { width: column.width, flexShrink: 0, flex: 'none' }
          : { flex: column.flex ?? 1 };

        return (
          <div
            key={column.key}
            className={`study-row__cell study-row__cell--${column.align || 'left'}`}
            style={style}
          >
            {column.value}
          </div>
        );
      })}

      {/* More options button */}
      {showMoreOptions && (
        <div className="study-row__cell study-row__cell--actions">
          <IconButton
            icon="more_horiz"
            size="XS"
            variant="Ghost"
            onClick={handleMoreClick}
            className="study-row__more-button"
          />
        </div>
      )}
    </div>
  );
}

export default StudyRow;
