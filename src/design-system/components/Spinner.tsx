import { Icon } from './Icon';
import './Spinner.css';

export type SpinnerVariant = 'default' | 'dots' | 'arc' | 'progress';

export interface SpinnerProps {
  /**
   * Size of the spinner in pixels
   * @default 24
   */
  size?: number;
  /**
   * Color of the spinner
   * @default 'var(--primary-default, #063b9e)'
   */
  color?: string;
  /**
   * Animation variant
   * - `default`: Rotating arc icon (AIR_spinner)
   * - `dots`: 8 dots that light up in sequence
   * - `arc`: Growing/shrinking arc (Material Design style)
   * - `progress`: Determinate arc that fills from 0% to 100%
   * @default 'default'
   */
  variant?: SpinnerVariant;
  /**
   * Progress value (0–100). Only used with variant="progress".
   * @default 0
   */
  value?: number;
  /**
   * Additional CSS class
   */
  className?: string;
}

const DOT_COUNT = 8;

/**
 * Spinner Component
 *
 * A loading indicator with multiple animation styles.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner variant="dots" />
 * <Spinner variant="arc" size={32} />
 * <Spinner variant="progress" value={65} />
 * ```
 */
export function Spinner({
  size = 24,
  color = 'var(--primary-default, #063b9e)',
  variant = 'default',
  value = 0,
  className = '',
}: SpinnerProps) {
  if (variant === 'dots') {
    const dotSize = Math.max(2, Math.round(size * 0.12));
    const radius = (size - dotSize) / 2;

    return (
      <span
        className={`spinner spinner--dots ${className}`}
        role="status"
        aria-label="Loading"
        style={{ width: size, height: size }}
      >
        {Array.from({ length: DOT_COUNT }, (_, i) => {
          const angle = (i * 360) / DOT_COUNT - 90;
          const rad = (angle * Math.PI) / 180;
          const x = size / 2 + radius * Math.cos(rad) - dotSize / 2;
          const y = size / 2 + radius * Math.sin(rad) - dotSize / 2;

          return (
            <span
              key={i}
              className="spinner__dot"
              style={{
                width: dotSize,
                height: dotSize,
                backgroundColor: color,
                left: x,
                top: y,
                animationDelay: `${(i * 1) / DOT_COUNT}s`,
              }}
            />
          );
        })}
      </span>
    );
  }

  if (variant === 'arc') {
    return (
      <span
        className={`spinner spinner--arc ${className}`}
        role="status"
        aria-label="Loading"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 50 50"
          fill="none"
          className="spinner__arc-svg"
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            className="spinner__arc-circle"
          />
        </svg>
      </span>
    );
  }

  if (variant === 'progress') {
    const strokeWidth = Math.max(2, Math.round(size * 0.1));
    const r = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;
    const clampedValue = Math.min(100, Math.max(0, value));
    const offset = circumference - (clampedValue / 100) * circumference;

    return (
      <span
        className={`spinner spinner--progress ${className}`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${clampedValue}% loaded`}
        style={{ width: size, height: size }}
      >
        {/* Track */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          className="spinner__progress-svg"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            className="spinner__progress-track"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            className="spinner__progress-fill"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>
      </span>
    );
  }

  // Default: rotating icon
  return (
    <span className={`spinner spinner--default ${className}`} role="status" aria-label="Loading">
      <Icon name="AIR_spinner" size={size} color={color} />
    </span>
  );
}

export default Spinner;
