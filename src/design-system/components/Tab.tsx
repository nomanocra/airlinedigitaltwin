// @ts-ignore - React import needed for JSX in non-TypeScript projects
import React from 'react';
import './Tab.css';
import { Icon } from './Icon';

export type TabSize = 'S' | 'M' | 'L' | 'XL';
export type TabStatus = 'Default' | 'Active';
export type TabState = 'Default' | 'Hover' | 'Disabled';
export type TabVariant = 'Default' | 'Container';

export interface TabProps {
  /**
   * Tab label text
   * @required
   */
  label: string;
  /**
   * Tab size
   * @default 'M'
   */
  size?: TabSize;
  /**
   * Tab status (controlled by parent)
   * @default 'Default'
   */
  status?: TabStatus;
  /**
   * Tab state
   * @default 'Default'
   */
  state?: TabState;
  /**
   * Tab variant
   * @default 'Default'
   */
  variant?: TabVariant;
  /**
   * Left icon name
   */
  leftIcon?: string;
  /**
   * Right icon name
   */
  rightIcon?: string;
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * Tab Component
 *
 * A tab component with various sizes, states, and variants.
 *
 * @example
 * ```tsx
 * <Tab label="Tab Label" size="M" status="Active" />
 * <Tab label="With Icon" leftIcon="home" size="L" />
 * <Tab label="Container" variant="Container" status="Active" />
 * ```
 */
export function Tab({
  label,
  size = 'M',
  status = 'Default',
  state = 'Default',
  variant = 'Default',
  leftIcon,
  rightIcon,
  disabled = false,
  onClick,
  className = '',
}: TabProps) {
  // Icon sizes based on tab size
  const iconSizeMap: Record<TabSize, number> = {
    S: 12,
    M: 16,
    L: 20,
    XL: 24,
  };

  const iconSize = iconSizeMap[size];

  // Build CSS classes
  const tabClasses = [
    'tab',
    `tab--${size.toLowerCase()}`,
    `tab--${status.toLowerCase()}`,
    `tab--${state.toLowerCase()}`,
    `tab--${variant.toLowerCase()}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      role="tab"
      aria-selected={status === 'Active'}
      disabled={disabled || state === 'Disabled'}
      onClick={onClick}
      className={tabClasses}
    >
      {leftIcon && (
        <Icon name={leftIcon} size={iconSize} className="tab__icon tab__icon--left" />
      )}
      <span className="tab__label">{label}</span>
      {rightIcon && (
        <Icon name={rightIcon} size={iconSize} className="tab__icon tab__icon--right" />
      )}
    </button>
  );
}

export default Tab;
