// @ts-ignore - React import needed for JSX in non-TypeScript projects
import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import './Tooltip.css';

/* ============================================================================
   Tooltip Root (Provider)
   ============================================================================ */

export interface TooltipProps {
  children: React.ReactNode;
  /**
   * Delay in ms before showing tooltip
   * @default 300
   */
  delayDuration?: number;
  /**
   * Whether to skip the delay when moving between tooltips
   * @default true
   */
  skipDelayDuration?: number;
}

export function Tooltip({ children, delayDuration = 300, skipDelayDuration = 300 }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
      <TooltipPrimitive.Root>{children}</TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

/* ============================================================================
   TooltipTrigger
   ============================================================================ */

export interface TooltipTriggerProps {
  children: React.ReactNode;
  /**
   * Change the default rendered element to merge props onto
   * @default true
   */
  asChild?: boolean;
}

export function TooltipTrigger({ children, asChild = true }: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger asChild={asChild}>{children}</TooltipPrimitive.Trigger>;
}

/* ============================================================================
   TooltipContent
   ============================================================================ */

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
export type TooltipAlign = 'start' | 'center' | 'end';

export interface TooltipContentProps {
  children: React.ReactNode;
  /**
   * Side of the trigger to place the tooltip
   * @default 'top'
   */
  side?: TooltipSide;
  /**
   * Alignment relative to the trigger
   * @default 'center'
   */
  align?: TooltipAlign;
  /**
   * Offset from the trigger in pixels
   * @default 4
   */
  sideOffset?: number;
  /**
   * Whether to show arrow
   * @default true
   */
  arrow?: boolean;
  className?: string;
}

export function TooltipContent({
  children,
  side = 'top',
  align = 'center',
  sideOffset = 4,
  arrow = true,
  className = '',
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={`tooltip-content ${className}`}
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        {children}
        {arrow && <TooltipPrimitive.Arrow className="tooltip-arrow" />}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

/* ============================================================================
   Simplified Tooltip (all-in-one wrapper for simple cases)
   ============================================================================ */

export interface SimpleTooltipProps {
  /**
   * Tooltip text content
   */
  label: string;
  /**
   * Element that triggers the tooltip
   */
  children: React.ReactNode;
  /**
   * Side of the trigger to place the tooltip
   * @default 'top'
   */
  side?: TooltipSide;
  /**
   * Delay in ms before showing tooltip
   * @default 300
   */
  delayDuration?: number;
  /**
   * Whether to show arrow
   * @default true
   */
  arrow?: boolean;
}

/**
 * SimpleTooltip - All-in-one wrapper for easy tooltip usage
 *
 * @example
 * ```tsx
 * <SimpleTooltip label="Delete item">
 *   <button>Delete</button>
 * </SimpleTooltip>
 * ```
 */
export function SimpleTooltip({
  label,
  children,
  side = 'top',
  delayDuration = 300,
  arrow = true,
}: SimpleTooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className="tooltip-content" side={side} sideOffset={4}>
            {label}
            {arrow && <TooltipPrimitive.Arrow className="tooltip-arrow" />}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export default Tooltip;
