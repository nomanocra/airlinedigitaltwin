// @ts-ignore - React import needed for JSX in non-TypeScript projects
import React, { forwardRef } from 'react';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { SimpleTooltip } from './Tooltip';
import './NumberInput.css';

export type NumberInputSize = 'XS' | 'S' | 'M' | 'L';
export type NumberInputState = 'Default' | 'Error' | 'Valid';
export type NumberInputVariant = 'Stepper';

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  /**
   * Label of the input
   */
  label?: string;
  /**
   * Helper text displayed below the input
   */
  legend?: string;
  /**
   * Size of the input
   * @default 'M'
   */
  size?: NumberInputSize;
  /**
   * Validation state of the input
   * @default 'Default'
   */
  state?: NumberInputState;
  /**
   * Visual variant - 'Stepper' puts up/down buttons on right side
   */
  variant?: NumberInputVariant;
  /**
   * Show the label
   * @default true
   */
  showLabel?: boolean;
  /**
   * Show the legend
   * @default false
   */
  showLegend?: boolean;
  /**
   * Show "(Optional)" after the label
   * @default false
   */
  showOptional?: boolean;
  /**
   * Show the info icon with tooltip
   * @default false
   */
  showInfo?: boolean;
  /**
   * Tooltip text for the info icon
   */
  infoText?: string;
  /**
   * Current numeric value
   */
  value?: number;
  /**
   * Minimum allowed value
   */
  min?: number;
  /**
   * Maximum allowed value
   */
  max?: number;
  /**
   * Step increment/decrement value
   * @default 1
   */
  step?: number;
  /**
   * Callback when the value changes
   */
  onChange?: (value: number) => void;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * NumberInput Component
 *
 * Numeric stepper input with increment/decrement buttons.
 *
 * @example
 * ```tsx
 * <NumberInput
 *   label="Quantity"
 *   value={5}
 *   min={0}
 *   max={100}
 *   onChange={(val) => setValue(val)}
 * />
 * ```
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      label = 'Label',
      legend = 'Legend',
      placeholder = '0',
      size = 'M',
      state = 'Default',
      variant,
      showLabel = true,
      showLegend = false,
      showOptional = false,
      showInfo = false,
      infoText = '',
      value,
      min,
      max,
      step = 1,
      onChange,
      disabled = false,
      readOnly = false,
      className = '',
      ...inputProps
    },
    ref
  ) => {
    // Derived states
    const isDisabled = disabled;
    const isReadOnly = readOnly;
    const isError = state === 'Error';
    const isValid = state === 'Valid';

    // Check if decrement/increment is possible
    const canDecrement = min === undefined || (value !== undefined && value > min);
    const canIncrement = max === undefined || (value !== undefined && value < max);

    const handleDecrement = () => {
      if (isDisabled || isReadOnly) return;
      if (value !== undefined) {
        const newValue = value - step;
        if (min !== undefined && newValue < min) return;
        onChange?.(newValue);
      }
    };

    const handleIncrement = () => {
      if (isDisabled || isReadOnly) return;
      if (value !== undefined) {
        const newValue = value + step;
        if (max !== undefined && newValue > max) return;
        onChange?.(newValue);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      if (rawValue === '') {
        onChange?.(min ?? 0);
        return;
      }
      const parsed = Number(rawValue);
      if (!isNaN(parsed)) {
        if (min !== undefined && parsed < min) return;
        if (max !== undefined && parsed > max) return;
        onChange?.(parsed);
      }
    };

    // CSS classes
    const containerClasses = [
      'number-input-container',
      isError && 'number-input-container--error',
      isValid && 'number-input-container--valid',
      isReadOnly && 'number-input-container--read-only',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputWrapperClasses = [
      'number-input-wrapper',
      `number-input-wrapper--${size.toLowerCase()}`,
      variant === 'Stepper' && 'number-input-wrapper--stepper',
      isError && 'number-input-wrapper--error',
      isValid && 'number-input-wrapper--valid',
      isDisabled && 'number-input-wrapper--disabled',
      isReadOnly && 'number-input-wrapper--read-only',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClasses}>
        {/* Label */}
        {showLabel && label && (
          <div className="number-input-label-container">
            <label className="number-input-label">
              {label}
              {showOptional && (
                <span className="number-input-optional"> (Optional)</span>
              )}
            </label>
            {showInfo && infoText ? (
              <SimpleTooltip label={infoText} delayDuration={0}>
                <span className="number-input-info-icon">
                  <Icon name="info" size={16} />
                </span>
              </SimpleTooltip>
            ) : showInfo ? (
              <span className="number-input-info-icon">
                <Icon name="info" size={16} />
              </span>
            ) : null}
          </div>
        )}

        {/* Input wrapper */}
        <div className={inputWrapperClasses}>
          {/* Decrement button (left side) - only for default variant */}
          {!isReadOnly && variant !== 'Stepper' && (
            <IconButton
              icon="remove"
              size={size}
              variant="Ghost"
              onClick={handleDecrement}
              disabled={isDisabled || !canDecrement}
              aria-label="Decrease value"
              tabIndex={-1}
              className="number-input-stepper"
            />
          )}

          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            className={`number-input-field${variant === 'Stepper' ? ' number-input-field--left' : ''}`}
            placeholder={placeholder}
            value={value !== undefined ? String(value) : ''}
            onChange={handleInputChange}
            disabled={isDisabled}
            readOnly={isReadOnly}
            aria-invalid={isError}
            aria-describedby={showLegend ? `${label}-legend` : undefined}
            {...inputProps}
          />

          {/* Stepper variant: stacked buttons on right (appear on hover) */}
          {!isReadOnly && variant === 'Stepper' && (
            <div className="number-input-stepper-group">
              <IconButton
                icon="keyboard_arrow_up"
                size={size}
                variant="Default"
                onClick={handleIncrement}
                disabled={isDisabled || !canIncrement}
                aria-label="Increase value"
                tabIndex={-1}
                className="number-input-stepper-btn"
              />
              <IconButton
                icon="keyboard_arrow_down"
                size={size}
                variant="Default"
                onClick={handleDecrement}
                disabled={isDisabled || !canDecrement}
                aria-label="Decrease value"
                tabIndex={-1}
                className="number-input-stepper-btn"
              />
            </div>
          )}

          {/* Increment button (right side) - only for default variant */}
          {!isReadOnly && variant !== 'Stepper' && (
            <IconButton
              icon="add"
              size={size}
              variant="Ghost"
              onClick={handleIncrement}
              disabled={isDisabled || !canIncrement}
              aria-label="Increase value"
              tabIndex={-1}
              className="number-input-stepper"
            />
          )}
        </div>

        {/* Legend */}
        {showLegend && legend && (
          <span className="number-input-legend" id={`${label}-legend`}>
            {legend}
          </span>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

export default NumberInput;
