import { ReactNode } from 'react';
import { Icon } from './Icon';
import './PanelGroup.css';

export type PanelGroupSize = 'XS' | 'S' | 'M';

export interface PanelGroupProps {
  /**
   * Group label text
   */
  label: string;
  /**
   * Whether the group is expanded
   * @default true
   */
  open?: boolean;
  /**
   * Size of the header row
   * @default 'S'
   */
  size?: PanelGroupSize;
  /**
   * Action elements shown on hover (IconButton, etc.)
   */
  actions?: ReactNode;
  /**
   * Click handler for toggling open/close
   */
  onClick?: () => void;
  /**
   * Additional CSS class
   */
  className?: string;
}

const iconSizes: Record<PanelGroupSize, number> = {
  M: 24,
  S: 20,
  XS: 16,
};

/**
 * PanelGroup Component
 *
 * A collapsible group header for dark corporate panels. Displays an
 * arrow indicator, a label, and optional action buttons on hover.
 *
 * @example
 * ```tsx
 * <PanelGroup label="Inputs" open={true} onClick={() => toggle()} />
 * <PanelGroup
 *   label="Scenario 1"
 *   open={isOpen}
 *   onClick={() => setIsOpen(!isOpen)}
 *   actions={
 *     <>
 *       <IconButton icon="edit" size="XS" variant="Ghost" />
 *       <IconButton icon="content_copy" size="XS" variant="Ghost" />
 *       <IconButton icon="delete" size="XS" variant="Ghost" />
 *     </>
 *   }
 * />
 * ```
 */
export function PanelGroup({
  label,
  open = true,
  size = 'S',
  actions,
  onClick,
  className = '',
}: PanelGroupProps) {
  const classes = [
    'panel-group',
    `panel-group--${size.toLowerCase()}`,
    open ? 'panel-group--open' : 'panel-group--closed',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconSize = iconSizes[size];

  return (
    <div className={classes}>
      <button type="button" className="panel-group__header" onClick={onClick}>
        <span className="panel-group__arrow">
          <Icon
            name="keyboard_arrow_down"
            size={iconSize}
            color={open ? '#ffffff' : 'var(--cool-grey-40, #b3bbc8)'}
          />
        </span>
        <span className="panel-group__label">{label}</span>
      </button>
      {actions && <span className="panel-group__actions">{actions}</span>}
    </div>
  );
}

export default PanelGroup;
