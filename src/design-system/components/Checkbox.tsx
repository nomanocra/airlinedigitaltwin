// @ts-ignore - React import needed for JSX in non-TypeScript projects
import React, { useId } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Icon } from './Icon';
import './Checkbox.css';

export type CheckboxSize = 'S' | 'M' | 'L';
export type CheckboxState = 'Default' | 'Hover' | 'Disabled' | 'Read-only';
export type CheckboxStatus = 'Default' | 'Checked' | 'Indeterminate';

export interface CheckboxProps {
  /**
   * Label of the checkbox
   */
  label?: string;
  /**
   * Size of the checkbox
   * @default 'M'
   */
  size?: CheckboxSize;
  /**
   * State of the checkbox
   * @default 'Default'
   */
  state?: CheckboxState;
  /**
   * Status of the checkbox (checked state)
   * @default 'Default'
   */
  status?: CheckboxStatus;
  /**
   * Show label next to checkbox
   * @default true
   */
  showLabel?: boolean;
  /**
   * Controlled checked state
   */
  checked?: boolean | 'indeterminate';
  /**
   * Callback when checked state changes
   */
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
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
 * Checkbox component (based on Radix UI)
 *
 * Accessible checkbox with support for different sizes and states.
 *
 * @example
 * ```tsx
 * <Checkbox
 *   label="Accept terms"
 *   size="M"
 *   checked={isChecked}
 *   onCheckedChange={setIsChecked}
 * />
 * ```
 */
export function Checkbox({
  label = 'Label',
  size = 'M',
  state = 'Default',
  status = 'Default',
  showLabel = true,
  checked,
  onCheckedChange,
  className = '',
  name,
  value,
  required,
}: CheckboxProps) {
  const uniqueId = useId();
  const checkboxId = `checkbox-${uniqueId}`;

  // Derived states
  const isDisabled = state === 'Disabled';
  const isReadOnly = state === 'Read-only';

  // Determine checked state from status prop if not controlled
  const getCheckedState = (): boolean | 'indeterminate' => {
    if (checked !== undefined) return checked;
    if (status === 'Checked') return true;
    if (status === 'Indeterminate') return 'indeterminate';
    return false;
  };

  // Icon sizes based on checkbox size (same as checkbox container)
  const iconSizes: Record<CheckboxSize, number> = {
    S: 16,
    M: 20,
    L: 24,
  };

  const iconSize = iconSizes[size];

  // CSS classes
  const containerClasses = [
    'checkbox-container',
    `checkbox-container--${size.toLowerCase()}`,
    isDisabled && 'checkbox-container--disabled',
    isReadOnly && 'checkbox-container--read-only',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const checkboxClasses = [
    'checkbox',
    `checkbox--${size.toLowerCase()}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <CheckboxPrimitive.Root
        id={checkboxId}
        className={checkboxClasses}
        checked={getCheckedState()}
        onCheckedChange={isReadOnly ? undefined : onCheckedChange}
        disabled={isDisabled}
        name={name}
        value={value}
        required={required}
      >
        <CheckboxPrimitive.Indicator className="checkbox-indicator">
          {getCheckedState() === 'indeterminate' ? (
            <Icon name="remove" size={iconSize} color="currentColor" />
          ) : (
            <Icon name="check" size={iconSize} color="currentColor" />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      {showLabel && label && (
        <label htmlFor={checkboxId} className="checkbox-label">{label}</label>
      )}
    </div>
  );
}

export default Checkbox;
