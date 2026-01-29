import React from 'react';
import { Icon } from './Icon';
import { SimpleTooltip } from './Tooltip';
import './IconButton.css';

export type IconButtonSize = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type IconButtonState = 'Default' | 'Hover' | 'Active' | 'Disabled';
export type IconButtonVariant = 'Default' | 'Outlined' | 'Ghost';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Icon name to display
   */
  icon: string;
  /**
   * Size of the button
   * @default 'M'
   */
  size?: IconButtonSize;
  /**
   * State of the button
   * @default 'Default'
   */
  state?: IconButtonState;
  /**
   * Variant of the button
   * @default 'Default'
   */
  variant?: IconButtonVariant;
  /**
   * Alternative text for accessibility
   */
  alt?: string;
  /**
   * Tooltip text shown on hover
   */
  tooltip?: string;
}

/**
 * IconButton Component
 *
 * A button that displays only an icon, with support for different sizes, states, and variants.
 *
 * @example
 * ```tsx
 * <IconButton icon="settings" size="M" variant="Default" />
 * <IconButton icon="delete" size="S" variant="Outlined" />
 * ```
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  size = 'M',
  state = 'Default',
  variant = 'Default',
  alt,
  tooltip,
  className = '',
  disabled,
  ...props
}, ref) => {
  const isDisabled = state === 'Disabled' || disabled;

  // Icon sizes according to button size
  const iconSizes: Record<IconButtonSize, number> = {
    XS: 16,
    S: 20,
    M: 24,
    L: 32,
    XL: 40,
  };

  const iconSize = iconSizes[size];

  // CSS classes
  const buttonClasses = [
    'icon-button',
    `icon-button--${size.toLowerCase()}`,
    `icon-button--${state.toLowerCase()}`,
    `icon-button--${variant.toLowerCase()}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Icon color based on variant
  const getIconColor = () => {
    if (variant === 'Default') {
      return 'var(--text-negative, #ffffff)';
    } else {
      return 'currentColor';
    }
  };

  const iconColor = getIconColor();

  const button = (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={isDisabled}
      aria-label={alt || tooltip || icon}
      data-size={size}
      data-state={state}
      data-variant={variant}
      {...props}
    >
      <Icon name={icon} size={iconSize} color={iconColor} />
    </button>
  );

  if (tooltip) {
    return (
      <SimpleTooltip label={tooltip} side="top" delayDuration={0}>
        {button}
      </SimpleTooltip>
    );
  }

  return button;
});

IconButton.displayName = 'IconButton';

export default IconButton;
