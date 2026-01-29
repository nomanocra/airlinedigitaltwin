import React from 'react';
import { Icon } from './Icon';
import './Chip.css';

export type ChipSize = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type ChipType = 'Selectable' | 'ReadOnly' | 'Removable';

export interface ChipProps {
  /**
   * Text label displayed in the chip
   */
  label: string;
  /**
   * Size of the chip
   * @default 'M'
   */
  size?: ChipSize;
  /**
   * Type of chip behavior
   * @default 'Selectable'
   */
  type?: ChipType;
  /**
   * Whether the chip is in active/selected state
   * @default false
   */
  active?: boolean;
  /**
   * Whether the chip is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Icon name to display before the label
   */
  icon?: string;
  /**
   * Click handler for the chip (Selectable type)
   */
  onClick?: () => void;
  /**
   * Click handler for the remove button (Removable type)
   */
  onRemove?: (e: React.MouseEvent) => void;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * Chip Component
 *
 * A pill-shaped badge used for selections, filters, or tags.
 * Supports Selectable, ReadOnly, and Removable types.
 *
 * @example
 * ```tsx
 * <Chip label="Filter" size="M" type="Selectable" onClick={() => {}} />
 * <Chip label="Tag" type="ReadOnly" icon="AIR_fleet" />
 * <Chip label="Item" type="Removable" onRemove={(e) => {}} />
 * ```
 */
export function Chip({
  label,
  size = 'M',
  type = 'Selectable',
  active = false,
  disabled = false,
  icon,
  onClick,
  onRemove,
  className = '',
}: ChipProps) {
  const iconSizes: Record<ChipSize, number> = {
    XS: 12,
    S: 16,
    M: 20,
    L: 24,
    XL: 32,
  };

  const removeIconSizes: Record<ChipSize, number> = {
    XS: 8,
    S: 10,
    M: 12,
    L: 16,
    XL: 20,
  };

  const iconSize = iconSizes[size];
  const removeIconSize = removeIconSizes[size];

  const chipClasses = [
    'chip',
    `chip--${size.toLowerCase()}`,
    `chip--${type.toLowerCase()}`,
    active ? 'chip--active' : '',
    disabled ? 'chip--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconColor = active
    ? 'var(--text-negative, #ffffff)'
    : type === 'ReadOnly'
      ? 'var(--text-main, #14171d)'
      : 'var(--primary-default, #063b9e)';

  const handleClick = () => {
    if (disabled || type === 'ReadOnly') return;
    onClick?.();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onRemove?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || type === 'ReadOnly') return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const isInteractive = type !== 'ReadOnly' && !disabled;

  return (
    <div
      className={chipClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={type === 'ReadOnly' ? undefined : 'button'}
      tabIndex={isInteractive ? 0 : undefined}
      aria-disabled={disabled || undefined}
      aria-pressed={type === 'Selectable' ? active : undefined}
    >
      {icon && (
        <span className="chip__icon">
          <Icon name={icon} size={iconSize} color={iconColor} />
        </span>
      )}
      <span className="chip__label">{label}</span>
      {type === 'Removable' && (
        <button
          className="chip__remove"
          onClick={handleRemove}
          disabled={disabled}
          aria-label={`Remove ${label}`}
          tabIndex={disabled ? -1 : 0}
          type="button"
        >
          <Icon name="close" size={removeIconSize} color="var(--text-negative, #ffffff)" />
        </button>
      )}
    </div>
  );
}

export default Chip;
