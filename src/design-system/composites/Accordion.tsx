import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import './Accordion.css';

export type AccordionSize = 'S' | 'M' | 'L';

export interface AccordionProps {
  /**
   * Title displayed in the accordion header
   */
  title: string;
  /**
   * Content displayed when the accordion is open
   */
  children: React.ReactNode;
  /**
   * Size variant
   * @default 'M'
   */
  size?: AccordionSize;
  /**
   * Whether the accordion is initially open
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Controlled open state (overrides internal state)
   */
  open?: boolean;
  /**
   * Callback when the accordion is toggled
   */
  onToggle?: (open: boolean) => void;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * Accordion Composite
 *
 * A collapsible panel with a corporate-styled header and expandable content area.
 * Features a left accent border, title, and chevron toggle icon.
 *
 * @example
 * ```tsx
 * <Accordion title="Filters">
 *   <p>Filter content here...</p>
 * </Accordion>
 *
 * <Accordion title="Filters" defaultOpen>
 *   <Checkbox label="Calendar" status="Checked" />
 *   <Select options={aircraftTypes} />
 * </Accordion>
 * ```
 */
export function Accordion({
  title,
  children,
  size = 'M',
  defaultOpen = false,
  open: controlledOpen,
  onToggle,
  className = '',
}: AccordionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleToggle = () => {
    const nextOpen = !isOpen;
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen);
    }
    onToggle?.(nextOpen);
  };

  const iconSize = size === 'S' ? 16 : size === 'M' ? 20 : 24;

  const containerClasses = [
    'accordion',
    `accordion--${size.toLowerCase()}`,
    isOpen ? 'accordion--open' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <button
        className="accordion__header"
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <span className="accordion__title">{title}</span>
        <Icon
          name={isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
          size={iconSize}
          color="var(--text-corporate, #00205b)"
        />
      </button>
      <div className="accordion__body">
        <div className="accordion__content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Accordion;
