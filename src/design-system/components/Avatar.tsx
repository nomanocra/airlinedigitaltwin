import React from 'react';
import { SimpleTooltip } from './Tooltip';
import './Avatar.css';

export type AvatarSize = 'XS' | 'S' | 'M' | 'L';

export interface AvatarProps {
  /**
   * 1-2 character initials (e.g. "MT", "JD")
   */
  initials: string;
  /**
   * Size variant
   * @default 'M'
   */
  size?: AvatarSize;
  /**
   * Override the auto-generated background color
   */
  color?: string;
  /**
   * Override the default text color (white)
   */
  textColor?: string;
  /**
   * Additional CSS class
   */
  className?: string;
  /**
   * Accessible label
   */
  ariaLabel?: string;
  /**
   * Tooltip text shown on hover (e.g. full name)
   */
  tooltip?: string;
}

export interface AvatarStackProps {
  /**
   * Avatar children
   */
  children: React.ReactNode;
  /**
   * Maximum visible avatars before showing "+N" overflow
   */
  max?: number;
  /**
   * Size used for the overflow indicator
   * @default 'M'
   */
  size?: AvatarSize;
  /**
   * Additional CSS class
   */
  className?: string;
}

const AVATAR_PALETTE = [
  '#063b9e',
  '#08875b',
  '#e4002b',
  '#bb8e09',
  '#0b78b8',
  '#505d74',
  '#00205b',
  '#a27900',
];

function getAutoColor(initials: string): string {
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash += initials.charCodeAt(i);
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

/**
 * Avatar Component
 *
 * Circular user initials indicator with deterministic auto-colored background.
 *
 * @example
 * ```tsx
 * <Avatar initials="MT" size="M" />
 * <Avatar initials="JD" size="L" color="#e4002b" />
 * ```
 */
export function Avatar({
  initials,
  size = 'M',
  color,
  textColor,
  className = '',
  ariaLabel,
  tooltip,
}: AvatarProps) {
  const bgColor = color || getAutoColor(initials);

  const classes = [
    'avatar',
    `avatar--${size.toLowerCase()}`,
    className,
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = { backgroundColor: bgColor };
  if (textColor) {
    style.color = textColor;
  }

  const avatar = (
    <span
      className={classes}
      style={style}
      aria-label={ariaLabel || tooltip || initials}
      role="img"
    >
      {initials.slice(0, 2).toUpperCase()}
    </span>
  );

  if (tooltip) {
    return (
      <SimpleTooltip label={tooltip} side="bottom" delayDuration={0}>
        {avatar}
      </SimpleTooltip>
    );
  }

  return avatar;
}

/**
 * AvatarStack Component
 *
 * Overlapping row of Avatars with optional "+N" overflow indicator.
 *
 * @example
 * ```tsx
 * <AvatarStack max={3} size="M">
 *   <Avatar initials="MT" />
 *   <Avatar initials="JD" />
 *   <Avatar initials="AB" />
 *   <Avatar initials="CD" />
 * </AvatarStack>
 * ```
 */
export function AvatarStack({
  children,
  max,
  size = 'M',
  className = '',
}: AvatarStackProps) {
  const childArray = React.Children.toArray(children);
  const visibleCount = max !== undefined ? Math.min(max, childArray.length) : childArray.length;
  const overflowCount = childArray.length - visibleCount;

  const classes = [
    'avatar-stack',
    `avatar-stack--${size.toLowerCase()}`,
    className,
  ].filter(Boolean).join(' ');

  const totalItems = visibleCount + (overflowCount > 0 ? 1 : 0);

  return (
    <div className={classes} role="group" aria-label="User avatars">
      {overflowCount > 0 && (
        <span
          className={`avatar-stack__item avatar-stack__overflow avatar avatar--${size.toLowerCase()}`}
          style={{ zIndex: totalItems }}
        >
          +{overflowCount}
        </span>
      )}
      {childArray.slice(0, visibleCount).map((child, index) => (
        <span className="avatar-stack__item" key={index} style={{ zIndex: visibleCount - index }}>
          {child}
        </span>
      ))}
    </div>
  );
}

export default Avatar;
