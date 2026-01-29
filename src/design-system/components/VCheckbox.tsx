import React, { useState, useEffect, useId } from 'react';
import { Icon } from './Icon';
import './VCheckbox.css';

export type VCheckboxSize = 'S' | 'M' | 'L';
export type VCheckboxState = 'Default' | 'Hover' | 'Disabled' | 'Read-only';
export type VCheckboxStatus = 'Default' | 'Checked' | 'Indeterminate';

export interface VCheckboxProps {
  /**
   * Label of the checkbox
   */
  label?: string;
  /**
   * Size of the checkbox
   * @default 'M'
   */
  size?: VCheckboxSize;
  /**
   * State of the checkbox
   * @default 'Default'
   */
  state?: VCheckboxState;
  /**
   * Status of the checkbox (checked state)
   * @default 'Default'
   */
  status?: VCheckboxStatus;
  /**
   * Show label next to checkbox
   * @default true
   */
  showLabel?: boolean;
  /**
   * Controlled checked state
   */
  checked?: boolean;
  /**
   * Indeterminate state (takes priority over checked)
   */
  indeterminate?: boolean;
  /**
   * Callback when checked state changes
   */
  onChange?: (checked: boolean) => void;
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
 * VCheckbox component (Vanilla Checkbox)
 *
 * Vanilla checkbox without Radix UI, with support for different sizes and states.
 *
 * @example
 * ```tsx
 * <VCheckbox
 *   label="Accept terms"
 *   size="M"
 *   checked={isChecked}
 *   onChange={setIsChecked}
 * />
 * ```
 */
export function VCheckbox({
  label = 'Label',
  size = 'M',
  state = 'Default',
  status = 'Default',
  showLabel = true,
  checked,
  indeterminate,
  onChange,
  className = '',
  name,
  value,
  required,
}: VCheckboxProps) {
  const uniqueId = useId();
  const checkboxId = `vcheckbox-${uniqueId}`;

  // Derived states
  const isDisabled = state === 'Disabled';
  const isReadOnly = state === 'Read-only';

  // Internal state for uncontrolled mode
  const [internalChecked, setInternalChecked] = useState(() => {
    if (checked !== undefined) return checked;
    if (status === 'Checked') return true;
    return false;
  });

  const [isIndeterminate, setIsIndeterminate] = useState(() => {
    if (indeterminate !== undefined) return indeterminate;
    if (status === 'Indeterminate') return true;
    return false;
  });

  // Sync with controlled props
  useEffect(() => {
    if (checked !== undefined) {
      setInternalChecked(checked);
    }
  }, [checked]);

  useEffect(() => {
    if (indeterminate !== undefined) {
      setIsIndeterminate(indeterminate);
    }
  }, [indeterminate]);

  // Determine current state
  const isChecked = checked !== undefined ? checked : internalChecked;
  const currentIndeterminate = indeterminate !== undefined ? indeterminate : isIndeterminate;

  // Icon sizes based on checkbox size (same as checkbox container)
  const iconSizes: Record<VCheckboxSize, number> = {
    S: 16,
    M: 20,
    L: 24,
  };

  const iconSize = iconSizes[size];

  // Handle click
  const handleClick = () => {
    if (isDisabled || isReadOnly) return;

    const newChecked = !isChecked;
    setInternalChecked(newChecked);
    setIsIndeterminate(false);

    if (onChange) {
      onChange(newChecked);
    }
  };

  // Handle keyboard
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isDisabled || isReadOnly) return;

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleClick();
    }
  };

  // CSS classes
  const containerClasses = [
    'vcheckbox-container',
    `vcheckbox-container--${size.toLowerCase()}`,
    isDisabled && 'vcheckbox-container--disabled',
    isReadOnly && 'vcheckbox-container--read-only',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const checkboxClasses = [
    'vcheckbox',
    `vcheckbox--${size.toLowerCase()}`,
    (isChecked || currentIndeterminate) && 'vcheckbox--checked',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <div
        className={checkboxClasses}
        role="checkbox"
        aria-checked={currentIndeterminate ? 'mixed' : isChecked}
        aria-disabled={isDisabled}
        aria-readonly={isReadOnly}
        tabIndex={isDisabled || isReadOnly ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {(isChecked || currentIndeterminate) && (
          <span className="vcheckbox-indicator">
            {currentIndeterminate ? (
              <Icon name="remove" size={iconSize} color="currentColor" />
            ) : (
              <Icon name="check" size={iconSize} color="currentColor" />
            )}
          </span>
        )}
      </div>

      {/* Hidden native input for form submission */}
      <input
        type="checkbox"
        id={checkboxId}
        name={name}
        value={value}
        checked={isChecked}
        required={required}
        disabled={isDisabled}
        readOnly={isReadOnly}
        className="vcheckbox-native"
        tabIndex={-1}
        onChange={() => {}} // Handled by custom checkbox
        aria-hidden="true"
      />

      {showLabel && label && (
        <label htmlFor={checkboxId} className="vcheckbox-label" onClick={handleClick}>
          {label}
        </label>
      )}
    </div>
  );
}

export default VCheckbox;
