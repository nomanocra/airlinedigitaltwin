// @ts-ignore - React import needed for JSX in non-TypeScript projects
import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Icon } from './Icon';
import { SimpleTooltip } from './Tooltip';
import './Combobox.css';

export type ComboboxSize = 'XS' | 'S' | 'M' | 'L';
export type ComboboxState = 'Default' | 'Error' | 'Valid' | 'Disabled' | 'Read-only';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  /**
   * Label of the combobox
   */
  label?: string;
  /**
   * Helper text displayed below the combobox
   */
  legend?: string;
  /**
   * Placeholder text
   * @default 'Search...'
   */
  placeholder?: string;
  /**
   * Size of the combobox
   * @default 'M'
   */
  size?: ComboboxSize;
  /**
   * Validation state
   * @default 'Default'
   */
  state?: ComboboxState;
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
   * @default 'search'
   */
  leftIcon?: string;
  /**
   * Options for the combobox
   */
  options: ComboboxOption[];
  /**
   * Selected value
   */
  value?: string;
  /**
   * Callback when value changes
   */
  onValueChange?: (value: string) => void;
  /**
   * Callback when input text changes (for async filtering)
   */
  onInputChange?: (inputValue: string) => void;
  /**
   * Text to show when no options match
   * @default 'No results found'
   */
  emptyText?: string;
  /**
   * Allow custom values (not in options list)
   * @default false
   */
  allowCustomValue?: boolean;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * Combobox Component
 *
 * An autocomplete input with dropdown suggestions, combining TextInput and Select functionality.
 *
 * @example
 * ```tsx
 * <Combobox
 *   label="Country"
 *   options={[
 *     { value: 'fr', label: 'France' },
 *     { value: 'us', label: 'United States' },
 *   ]}
 *   placeholder="Search country..."
 *   onValueChange={(value) => console.log(value)}
 * />
 * ```
 */
export function Combobox({
  label = 'Label',
  legend = 'Legend',
  placeholder = 'Search...',
  size = 'M',
  state = 'Default',
  showLabel = true,
  showLegend = false,
  showOptional = false,
  showInfo = false,
  infoText = '',
  showLeftIcon = false,
  leftIcon = 'search',
  options = [],
  value,
  onValueChange,
  onInputChange,
  emptyText = 'No results found',
  allowCustomValue = false,
  className = '',
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isFiltering, setIsFiltering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Derived states
  const isDisabled = state === 'Disabled';
  const isReadOnly = state === 'Read-only';
  const isError = state === 'Error';
  const isValid = state === 'Valid';

  // Icon sizes based on input size
  const iconSizes: Record<ComboboxSize, number> = {
    XS: 12,
    S: 12,
    M: 16,
    L: 20,
  };

  const iconSize = iconSizes[size];

  // Sync input value with selected value
  useEffect(() => {
    if (value) {
      const selectedOption = options.find((opt) => opt.value === value);
      if (selectedOption) {
        setInputValue(selectedOption.label);
      }
    }
  }, [value, options]);

  // Filter options based on input (only when user is actively typing)
  const filteredOptions = useMemo(() => {
    if (!isFiltering || !inputValue.trim()) return options;
    const search = inputValue.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(search));
  }, [inputValue, options, isFiltering]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && listRef.current) {
      const highlightedItem = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedItem) {
        highlightedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsFiltering(true);
    setOpen(true);
    onInputChange?.(newValue);
  };

  const handleSelectOption = (option: ComboboxOption) => {
    setInputValue(option.label);
    setIsFiltering(false);
    onValueChange?.(option.value);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        } else if (allowCustomValue && inputValue.trim()) {
          onValueChange?.(inputValue.trim());
          setOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  const handleFocus = () => {
    if (!isDisabled && !isReadOnly) {
      setIsFiltering(false);
      setOpen(true);
    }
  };

  const handleBlur = () => {
    // Small delay to allow click on option to register
    setTimeout(() => {
      setOpen(false);
      setIsFiltering(false);
      if (!allowCustomValue && inputValue) {
        // Revert to selected value if custom values not allowed
        const selectedOption = options.find((opt) => opt.value === value);
        if (selectedOption) {
          setInputValue(selectedOption.label);
        } else {
          setInputValue('');
        }
      }
    }, 150);
  };

  // CSS classes
  const containerClasses = [
    'combobox-container',
    isError && 'combobox-container--error',
    isValid && 'combobox-container--valid',
    isReadOnly && 'combobox-container--read-only',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inputWrapperClasses = [
    'combobox-input-wrapper',
    `combobox-input-wrapper--${size.toLowerCase()}`,
    isError && 'combobox-input-wrapper--error',
    isValid && 'combobox-input-wrapper--valid',
    isDisabled && 'combobox-input-wrapper--disabled',
    isReadOnly && 'combobox-input-wrapper--read-only',
    open && 'combobox-input-wrapper--open',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {/* Label */}
      {showLabel && label && (
        <div className="combobox-label-container">
          <label className="combobox-label">
            {label}
            {showOptional && <span className="combobox-optional"> (Optional)</span>}
          </label>
          {showInfo && infoText ? (
            <SimpleTooltip label={infoText} delayDuration={0}>
              <span className="combobox-info-icon">
                <Icon name="info" size={16} />
              </span>
            </SimpleTooltip>
          ) : showInfo ? (
            <span className="combobox-info-icon">
              <Icon name="info" size={16} />
            </span>
          ) : null}
        </div>
      )}

      {/* Combobox */}
      <Popover.Root open={open} modal={false}>
        <Popover.Anchor asChild>
          <div className={inputWrapperClasses}>
            {showLeftIcon && leftIcon && (
              <span className="combobox-icon combobox-icon--left">
                <Icon
                  name={leftIcon}
                  size={iconSize}
                  color="var(--text-secondary, #63728a)"
                />
              </span>
            )}

            <input
              ref={inputRef}
              type="text"
              className="combobox-input"
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={isDisabled}
              readOnly={isReadOnly}
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              role="combobox"
            />

            <span className="combobox-icon combobox-icon--chevron">
              <Icon
                name="keyboard_arrow_down"
                size={iconSize}
                color="var(--primary-default, #063b9e)"
              />
            </span>
          </div>
        </Popover.Anchor>

        <Popover.Portal>
          <Popover.Content
            className={`combobox-content combobox-content--${size.toLowerCase()}`}
            sideOffset={4}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div ref={listRef} className="combobox-list" role="listbox">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className={[
                      'combobox-item',
                      `combobox-item--${size.toLowerCase()}`,
                      index === highlightedIndex && 'combobox-item--highlighted',
                      option.value === value && 'combobox-item--selected',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    role="option"
                    aria-selected={option.value === value}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectOption(option);
                    }}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="combobox-empty">{emptyText}</div>
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Legend */}
      {showLegend && legend && (
        <span className="combobox-legend">{legend}</span>
      )}
    </div>
  );
}

export default Combobox;
