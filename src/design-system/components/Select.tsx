// @ts-ignore - React import needed for JSX in non-TypeScript projects
import React, { useRef, useEffect } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Icon } from './Icon';
import { SimpleTooltip } from './Tooltip';
import './Select.css';

export type SelectSize = 'XS' | 'S' | 'M' | 'L';
export type SelectState = 'Default' | 'Hover' | 'Active' | 'Disabled' | 'Error' | 'Valid' | 'Read-only';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
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
  size?: SelectSize;
  /**
   * État du select
   * @default 'Default'
   */
  state?: SelectState;
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
  options: SelectOption[];
  /**
   * Valeur sélectionnée
   */
  value?: string;
  /**
   * Callback appelé quand la valeur change
   */
  onValueChange?: (value: string) => void;
  /**
   * Classe CSS additionnelle
   */
  className?: string;
}

/**
 * Composant Select (basé sur Radix UI)
 *
 * Select accessible avec support de différentes tailles et états.
 *
 * @example
 * ```tsx
 * <Select
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
export function Select({
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
  onValueChange,
  className = '',
}: SelectProps) {
  // États dérivés
  const isDisabled = state === 'Disabled';
  const isReadOnly = state === 'Read-only';
  const isError = state === 'Error';
  const isValid = state === 'Valid';

  // Tailles d'icônes selon la taille du select
  const iconSizes: Record<SelectSize, number> = {
    XS: 12,
    S: 12,
    M: 16,
    L: 20,
  };

  const iconSize = iconSizes[size];

  // Ref pour le trigger (pour gérer le blur à la fermeture)
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Track si la dernière interaction était souris ou clavier
  const wasMouseInteraction = useRef(false);

  // Écouter les événements pour détecter le type d'interaction
  useEffect(() => {
    const handlePointerDown = () => {
      wasMouseInteraction.current = true;
    };
    const handleKeyDown = () => {
      wasMouseInteraction.current = false;
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Gestion de l'ouverture/fermeture - blur uniquement si interaction souris
  const handleOpenChange = (open: boolean) => {
    if (!open && wasMouseInteraction.current) {
      // setTimeout pour s'assurer que le blur s'exécute après le focus interne de Radix
      setTimeout(() => {
        triggerRef.current?.blur();
      }, 0);
    }
  };

  // Classes CSS
  const containerClasses = [
    'select-container',
    `select-container--${size.toLowerCase()}`,
    `select-container--${state.toLowerCase()}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const triggerClasses = [
    'select-trigger',
    `select-trigger--${size.toLowerCase()}`,
    isError && 'select-trigger--error',
    isValid && 'select-trigger--valid',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {/* Label */}
      {showLabel && label && (
        <div className="select-label-container">
          <label className="select-label">
            {label}
            {showOptional && <span className="select-optional"> (Optional)</span>}
          </label>
          {showInfo && infoText ? (
            <SimpleTooltip label={infoText} delayDuration={0}>
              <span className="select-info-icon">
                <Icon name="info" size={16} />
              </span>
            </SimpleTooltip>
          ) : showInfo ? (
            <span className="select-info-icon">
              <Icon name="info" size={16} />
            </span>
          ) : null}
        </div>
      )}

      {/* Select */}
      <SelectPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        onOpenChange={handleOpenChange}
        disabled={isDisabled || isReadOnly}
      >
        <SelectPrimitive.Trigger ref={triggerRef} className={triggerClasses} aria-label={label}>
          {showLeftIcon && leftIcon && (
            <span className="select-icon select-icon--left">
              <Icon name={leftIcon} size={iconSize} />
            </span>
          )}

          <SelectPrimitive.Value placeholder={placeholder} />

          <SelectPrimitive.Icon className="select-icon select-icon--chevron">
            <Icon name="keyboard_arrow_down" size={iconSize} />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={`select-content select-content--${size.toLowerCase()}`}
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="select-viewport">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className={`select-item select-item--${size.toLowerCase()}`}
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {/* Legend */}
      {showLegend && legend && (
        <span className="select-legend">{legend}</span>
      )}
    </div>
  );
}

export default Select;
