import React from 'react';
import './VToggle.css';

export type VToggleSize = 'S' | 'M' | 'L';
export type VToggleState = 'Default' | 'Hover' | 'Disabled';

export interface VToggleProps {
  /**
   * Whether the toggle is selected (on)
   * @default false
   */
  selected?: boolean;
  /**
   * Callback when selected state changes
   */
  onChange?: (selected: boolean) => void;
  /**
   * Toggle size
   * @default 'M'
   */
  size?: VToggleSize;
  /**
   * Toggle state
   * @default 'Default'
   */
  state?: VToggleState;
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
   * ID attribute
   */
  id?: string;
}

/**
 * VToggle Component (Vanilla - pure React)
 *
 * A toggle switch for boolean selections without external dependencies.
 *
 * @example
 * ```tsx
 * <VToggle label="Enable notifications" selected={true} onChange={(v) => console.log(v)} />
 * <VToggle label="Dark mode" size="L" />
 * ```
 */
export function VToggle({
  selected = false,
  onChange,
  size = 'M',
  state = 'Default',
  label = 'Label',
  showLabel = true,
  disabled,
  className = '',
  name,
  id,
}: VToggleProps) {
  const isDisabled = state === 'Disabled' || disabled;

  const handleClick = () => {
    if (!isDisabled && onChange) {
      onChange(!selected);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onChange?.(!selected);
    }
  };

  const toggleClasses = [
    'vtoggle',
    `vtoggle--${size.toLowerCase()}`,
    `vtoggle--${state.toLowerCase()}`,
    selected ? 'vtoggle--selected' : '',
    isDisabled ? 'vtoggle--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={toggleClasses}>
      <button
        type="button"
        role="switch"
        aria-checked={selected}
        aria-label={!showLabel ? label : undefined}
        disabled={isDisabled}
        className="vtoggle__track"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        name={name}
        id={id}
      >
        <span className="vtoggle__thumb" />
      </button>
      {showLabel && (
        <span className="vtoggle__label">{label}</span>
      )}
    </label>
  );
}

export default VToggle;
