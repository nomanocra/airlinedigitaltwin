// @ts-ignore - React import needed for JSX in non-TypeScript projects
import React, { useId } from 'react';
import * as Switch from '@radix-ui/react-switch';
import './Toggle.css';

export type ToggleSize = 'S' | 'M' | 'L';
export type ToggleState = 'Default' | 'Hover' | 'Disabled';

export interface ToggleProps {
  /**
   * Whether the toggle is selected (on)
   * @default false
   */
  checked?: boolean;
  /**
   * Callback when checked state changes
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Toggle size
   * @default 'M'
   */
  size?: ToggleSize;
  /**
   * Toggle state
   * @default 'Default'
   */
  state?: ToggleState;
  /**
   * Label text
   * @default 'Label'
   */
  label?: string;
  /**
   * Show label
   * @default true
   */
  showLabel?: boolean;
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;
  /**
   * Additional CSS class
   */
  className?: string;
  /**
   * Name attribute for form submission
   */
  name?: string;
  /**
   * Value attribute for form submission
   */
  value?: string;
  /**
   * Required attribute
   */
  required?: boolean;
}

/**
 * Toggle Component (based on Radix UI Switch)
 *
 * Accessible toggle switch with support for different sizes and states.
 *
 * @example
 * ```tsx
 * <Toggle
 *   label="Enable notifications"
 *   checked={isEnabled}
 *   onCheckedChange={setIsEnabled}
 * />
 * <Toggle label="Dark mode" size="L" />
 * ```
 */
export function Toggle({
  checked = false,
  onCheckedChange,
  size = 'M',
  state = 'Default',
  label = 'Label',
  showLabel = true,
  disabled,
  className = '',
  name,
  value,
  required,
}: ToggleProps) {
  const uniqueId = useId();
  const toggleId = `toggle-${uniqueId}`;

  const isDisabled = state === 'Disabled' || disabled;

  const containerClasses = [
    'toggle',
    `toggle--${size.toLowerCase()}`,
    checked ? 'toggle--checked' : '',
    isDisabled ? 'toggle--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <Switch.Root
        id={toggleId}
        className="toggle__track"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={isDisabled}
        name={name}
        value={value}
        required={required}
      >
        <Switch.Thumb className="toggle__thumb" />
      </Switch.Root>

      {showLabel && label && (
        <label htmlFor={toggleId} className="toggle__label">{label}</label>
      )}
    </div>
  );
}

export default Toggle;
