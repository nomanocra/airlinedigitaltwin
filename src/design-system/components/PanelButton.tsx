import React from 'react';
import './PanelButton.css';
import { Icon } from './Icon';
import { SimpleTooltip } from './Tooltip';

export type PanelButtonSize = 'XS' | 'S' | 'M';
export type PanelButtonVariant = 'Default' | 'Selected' | 'Disabled';

export interface PanelButtonProps {
  /**
   * Button label text
   */
  label: string;
  /**
   * Icon name to display
   */
  icon?: string;
  /**
   * Custom icon component (overrides icon prop)
   */
  iconComponent?: React.ReactNode;
  /**
   * Whether the parent panel is expanded (shows label) or collapsed (icon-only)
   * @default true
   */
  panelOpen?: boolean;
  /**
   * Button size
   * @default 'M'
   */
  size?: PanelButtonSize;
  /**
   * Button variant
   * @default 'Default'
   */
  variant?: PanelButtonVariant;
  /**
   * Show error badge (red dot in collapsed mode, chip with count in expanded)
   * @default false
   */
  showError?: boolean;
  /**
   * Error count to display in the chip when panel is open
   * @default 0
   */
  errorCount?: number;
  /**
   * Show warning indicator
   * @default false
   */
  showWarning?: boolean;
  /**
   * Tooltip text shown on hover over the error badge
   */
  errorTooltip?: string;
  /**
   * Tooltip text shown on hover over the warning indicator
   */
  warningTooltip?: string;
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
 * PanelButton Component
 *
 * Navigation button used in dark side panels. Supports expanded (with label)
 * and collapsed (icon-only with tooltip) modes.
 *
 * @example
 * ```tsx
 * <PanelButton label="Dashboard" icon="apps" panelOpen={true} />
 * <PanelButton label="Settings" icon="settings" variant="Selected" />
 * <PanelButton label="Admin" icon="account_circle" panelOpen={false} />
 * ```
 */
export function PanelButton({
  label,
  icon,
  iconComponent,
  panelOpen = true,
  size = 'M',
  variant = 'Default',
  showError = false,
  errorCount = 0,
  showWarning = false,
  errorTooltip,
  warningTooltip,
  onClick,
  className = '',
}: PanelButtonProps) {
  const isDisabled = variant === 'Disabled';
  const isSelected = variant === 'Selected';

  const iconSizes: Record<PanelButtonSize, number> = {
    XS: 16,
    S: 16,
    M: 16,
  };

  const iconSize = iconSizes[size];

  const classes = [
    'panel-button',
    `panel-button--${size.toLowerCase()}`,
    `panel-button--${variant.toLowerCase()}`,
    panelOpen ? 'panel-button--open' : 'panel-button--collapsed',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const buttonContent = (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={isDisabled}
      aria-current={isSelected ? 'page' : undefined}
    >
      {/* Left border indicator for selected state */}
      {isSelected && <span className="panel-button__indicator" />}

      {/* Icon */}
      {(icon || iconComponent) && (
        <span className="panel-button__icon">
          {iconComponent || (
            <Icon name={icon!} size={iconSize} color="#ffffff" />
          )}
        </span>
      )}

      {/* Label (only in open mode) */}
      {panelOpen && (
        <span className="panel-button__label">{label}</span>
      )}

      {/* Error chip (expanded mode) */}
      {panelOpen && showError && errorCount > 0 && (
        errorTooltip ? (
          <SimpleTooltip label={errorTooltip} side="bottom" delayDuration={0}>
            <span className="panel-button__badge-wrapper">
              <span className="panel-button__error-chip">
                {errorCount}
              </span>
            </span>
          </SimpleTooltip>
        ) : (
          <span className="panel-button__badge-wrapper">
            <span className="panel-button__error-chip">
              {errorCount}
            </span>
          </span>
        )
      )}

      {/* Warning icon (expanded mode) */}
      {panelOpen && showWarning && (
        warningTooltip ? (
          <SimpleTooltip label={warningTooltip} side="bottom" delayDuration={0}>
            <span className="panel-button__badge-wrapper">
              <Icon name="warning" size={size === 'XS' ? 16 : 24} color="var(--feedback-warning-default, #ffc929)" />
            </span>
          </SimpleTooltip>
        ) : (
          <span className="panel-button__badge-wrapper">
            <Icon name="warning" size={size === 'XS' ? 16 : 24} color="var(--feedback-warning-default, #ffc929)" />
          </span>
        )
      )}

      {/* Error dot (collapsed mode) */}
      {!panelOpen && showError && (
        <span className="panel-button__error-dot" />
      )}

      {/* Warning dot (collapsed mode) */}
      {!panelOpen && showWarning && (
        <span className="panel-button__warning-dot">
          <Icon name="warning" size={12} color="var(--feedback-warning-default, #ffc929)" />
        </span>
      )}
    </button>
  );

  // Wrap with tooltip in collapsed mode
  if (!panelOpen) {
    const tooltipLabel = [label, errorTooltip, warningTooltip].filter(Boolean).join(' · ');
    return (
      <SimpleTooltip label={tooltipLabel} side="right" delayDuration={0}>
        {buttonContent}
      </SimpleTooltip>
    );
  }

  return buttonContent;
}

export default PanelButton;
