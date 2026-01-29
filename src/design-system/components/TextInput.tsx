// @ts-ignore - React import needed for JSX in non-TypeScript projects
import React, { forwardRef } from 'react';
import { Icon } from './Icon';
import { SimpleTooltip } from './Tooltip';
import './TextInput.css';

export type TextInputSize = 'XS' | 'S' | 'M' | 'L';
export type TextInputState = 'Default' | 'Error' | 'Valid';

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
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
  size?: TextInputSize;
  /**
   * Validation state of the input
   * @default 'Default'
   */
  state?: TextInputState;
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
   * Show the left icon
   * @default false
   */
  showLeftIcon?: boolean;
  /**
   * Name of the icon to show on the left
   */
  leftIcon?: string;
  /**
   * Show the right icon
   * @default false
   */
  showRightIcon?: boolean;
  /**
   * Name of the icon to show on the right
   */
  rightIcon?: string;
  /**
   * Show the right icon button (clickable)
   * @default false
   */
  showRightIconButton?: boolean;
  /**
   * Name of the icon for the right icon button
   */
  rightIconButton?: string;
  /**
   * Callback when the right icon button is clicked
   */
  onRightIconButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * TextInput Component
 *
 * Accessible text input with support for different sizes and states.
 *
 * @example
 * ```tsx
 * <TextInput
 *   label="Email"
 *   placeholder="Enter your email"
 *   size="M"
 *   showLeftIcon
 *   leftIcon="mail"
 * />
 * ```
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label = 'Label',
      legend = 'Legend',
      placeholder = 'Placeholder',
      size = 'M',
      state = 'Default',
      showLabel = true,
      showLegend = false,
      showOptional = false,
      showInfo = false,
      infoText = '',
      showLeftIcon = false,
      leftIcon = 'search',
      showRightIcon = false,
      rightIcon = 'saving',
      showRightIconButton = false,
      rightIconButton = 'close',
      onRightIconButtonClick,
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

    // Icon sizes based on input size (per Figma specs)
    const iconSizes: Record<TextInputSize, number> = {
      XS: 16,
      S: 16,
      M: 16,
      L: 20,
    };

    const iconSize = iconSizes[size];

    // Right icon button sizes based on input size (per Figma specs)
    // Container sizes: XS=20, S=20, M=32, L=40
    // Icon sizes: XS=16, S=16, M=20, L=24
    const iconButtonSizes: Record<TextInputSize, { container: number; icon: number }> = {
      XS: { container: 20, icon: 16 },
      S: { container: 20, icon: 16 },
      M: { container: 32, icon: 20 },
      L: { container: 40, icon: 24 },
    };

    const iconButtonSize = iconButtonSizes[size];

    // CSS classes
    const containerClasses = [
      'text-input-container',
      isError && 'text-input-container--error',
      isValid && 'text-input-container--valid',
      isReadOnly && 'text-input-container--read-only',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputWrapperClasses = [
      'text-input-wrapper',
      `text-input-wrapper--${size.toLowerCase()}`,
      isError && 'text-input-wrapper--error',
      isValid && 'text-input-wrapper--valid',
      isDisabled && 'text-input-wrapper--disabled',
      isReadOnly && 'text-input-wrapper--read-only',
      showRightIconButton && 'text-input-wrapper--has-icon-button',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClasses}>
        {/* Label */}
        {showLabel && label && (
          <div className="text-input-label-container">
            <label className="text-input-label">
              {label}
              {showOptional && (
                <span className="text-input-optional"> (Optional)</span>
              )}
            </label>
            {showInfo && infoText ? (
              <SimpleTooltip label={infoText} delayDuration={0}>
                <span className="text-input-info-icon">
                  <Icon name="info" size={16} />
                </span>
              </SimpleTooltip>
            ) : showInfo ? (
              <span className="text-input-info-icon">
                <Icon name="info" size={16} />
              </span>
            ) : null}
          </div>
        )}

        {/* Input wrapper */}
        <div className={inputWrapperClasses}>
          {showLeftIcon && leftIcon && (
            <span className="text-input-icon text-input-icon--left">
              <Icon
                name={leftIcon}
                size={iconSize}
                color="var(--text-secondary, #63728a)"
              />
            </span>
          )}

          <input
            ref={ref}
            type="text"
            className="text-input-field"
            placeholder={placeholder}
            disabled={isDisabled}
            readOnly={isReadOnly}
            aria-invalid={isError}
            aria-describedby={showLegend ? `${label}-legend` : undefined}
            {...inputProps}
          />

          {showRightIcon && rightIcon && (
            <span className="text-input-icon text-input-icon--right">
              <Icon
                name={rightIcon}
                size={iconSize}
                color="var(--primary-default, #063b9e)"
              />
            </span>
          )}

          {showRightIconButton && rightIconButton && (
            <button
              type="button"
              className="text-input-icon-button"
              onClick={onRightIconButtonClick}
              disabled={isDisabled}
              aria-label={rightIconButton}
              style={{
                width: iconButtonSize.container,
                height: iconButtonSize.container,
              }}
            >
              <Icon
                name={rightIconButton}
                size={iconButtonSize.icon}
                color="var(--primary-default, #063b9e)"
              />
            </button>
          )}
        </div>

        {/* Legend */}
        {showLegend && legend && (
          <span className="text-input-legend" id={`${label}-legend`}>
            {legend}
          </span>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
