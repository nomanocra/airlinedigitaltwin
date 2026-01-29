import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import './VSelect.css';

export type VSelectSize = 'XS' | 'S' | 'M' | 'L';
export type VSelectState = 'Default' | 'Hover' | 'Active' | 'Disabled' | 'Error' | 'Valid' | 'Read-only';

export interface VSelectOption {
  value: string;
  label: string;
}

export interface VSelectProps {
  /**
   * Label du select
   */
  label?: string;
  /**
   * Texte d'aide affiché sous le select
   */
  legend?: string;
  /**
   * Placeholder affiché quand aucune option n'est sélectionnée
   * @default 'Select an option'
   */
  placeholder?: string;
  /**
   * Taille du select
   * @default 'M'
   */
  size?: VSelectSize;
  /**
   * État du select
   * @default 'Default'
   */
  state?: VSelectState;
  /**
   * Afficher le label
   * @default true
   */
  showLabel?: boolean;
  /**
   * Afficher la légende
   * @default false
   */
  showLegend?: boolean;
  /**
   * Afficher "(Optional)" après le label
   * @default false
   */
  showOptional?: boolean;
  /**
   * Afficher l'icône d'information
   * @default false
   */
  showInfo?: boolean;
  /**
   * Texte d'information affiché dans le tooltip
   */
  infoText?: string;
  /**
   * Afficher l'icône à gauche du select
   * @default false
   */
  showLeftIcon?: boolean;
  /**
   * Nom de l'icône à afficher à gauche
   */
  leftIcon?: string;
  /**
   * Options du select
   */
  options: VSelectOption[];
  /**
   * Valeur sélectionnée
   */
  value?: string;
  /**
   * Callback appelé quand la valeur change
   */
  onChange?: (value: string) => void;
  /**
   * Classe CSS additionnelle
   */
  className?: string;
}

/**
 * Composant VSelect (Vanilla Select)
 *
 * Select personnalisé vanilla (sans Radix UI) avec support de différentes tailles et états.
 *
 * @example
 * ```tsx
 * <VSelect
 *   label="Country"
 *   options={[
 *     { value: 'fr', label: 'France' },
 *     { value: 'us', label: 'United States' },
 *   ]}
 *   size="M"
 *   placeholder="Select a country"
 * />
 * ```
 */
export function VSelect({
  label = 'Label',
  legend = 'Legend',
  placeholder = 'Select an option',
  size = 'M',
  state = 'Default',
  showLabel = true,
  showLegend = false,
  showOptional = false,
  showInfo = false,
  infoText = '',
  showLeftIcon = false,
  leftIcon = 'AIR_fleet',
  options = [],
  value,
  onChange,
  className = '',
}: VSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // États dérivés
  const isDisabled = state === 'Disabled';
  const isReadOnly = state === 'Read-only';
  const isError = state === 'Error';
  const isValid = state === 'Valid';

  // Tailles d'icônes selon la taille du select
  const iconSizes: Record<VSelectSize, number> = {
    XS: 12,
    S: 12,
    M: 16,
    L: 20,
  };

  const iconSize = iconSizes[size];

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    if (isDisabled || isReadOnly) return;

    setSelectedValue(optionValue);
    setIsOpen(false);

    if (onChange) {
      onChange(optionValue);
    }
  };

  // Handle trigger click
  const handleTriggerClick = () => {
    if (isDisabled || isReadOnly) return;
    setIsOpen(!isOpen);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isDisabled || isReadOnly) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Classes CSS
  const containerClasses = [
    'vselect-container',
    `vselect-container--${size.toLowerCase()}`,
    `vselect-container--${state.toLowerCase()}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const triggerClasses = [
    'vselect-trigger',
    `vselect-trigger--${size.toLowerCase()}`,
    isOpen && 'vselect-trigger--open',
    isError && 'vselect-trigger--error',
    isValid && 'vselect-trigger--valid',
    !selectedOption && 'vselect-trigger--placeholder',
  ]
    .filter(Boolean)
    .join(' ');

  const dropdownClasses = [
    'vselect-dropdown',
    `vselect-dropdown--${size.toLowerCase()}`,
    isOpen && 'vselect-dropdown--open',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} ref={containerRef}>
      {/* Label */}
      {showLabel && label && (
        <div className="vselect-label-container">
          <label className="vselect-label">
            {label}
            {showOptional && <span className="vselect-optional"> (Optional)</span>}
          </label>
          {showInfo && (
            <span className="vselect-info-icon" data-tooltip={infoText || undefined}>
              <Icon name="info" size={16} />
              {infoText && <span className="vselect-tooltip">{infoText}</span>}
            </span>
          )}
        </div>
      )}

      {/* Select Trigger */}
      <div className="vselect-wrapper">
        <div
          className={triggerClasses}
          onClick={handleTriggerClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={isDisabled || isReadOnly ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={label}
        >
          {showLeftIcon && leftIcon && (
            <span className="vselect-icon vselect-icon--left">
              <Icon name={leftIcon} size={iconSize} />
            </span>
          )}

          <span className="vselect-value">{displayValue}</span>

          <span className="vselect-icon vselect-icon--chevron">
            <Icon name="keyboard_arrow_down" size={iconSize} />
          </span>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className={dropdownClasses} role="listbox">
            {options.map((option) => (
              <div
                key={option.value}
                className={`vselect-item vselect-item--${size.toLowerCase()} ${
                  option.value === selectedValue ? 'vselect-item--selected' : ''
                }`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={option.value === selectedValue}
                tabIndex={0}
              >
                <span className="vselect-item-text">{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && legend && (
        <span className="vselect-legend">{legend}</span>
      )}
    </div>
  );
}

export default VSelect;
