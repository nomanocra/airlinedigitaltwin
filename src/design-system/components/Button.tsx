import React from 'react';
import { Icon } from './Icon';
import './Button.css';

export type ButtonSize = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type ButtonState = 'Default' | 'Hover' | 'Active' | 'Disabled';
export type ButtonVariant = 'Default' | 'Outlined' | 'Ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Label du bouton
   */
  label?: string;
  /**
   * Taille du bouton
   * @default 'M'
   */
  size?: ButtonSize;
  /**
   * État du bouton
   * @default 'Default'
   */
  state?: ButtonState;
  /**
   * Variante du bouton
   * @default 'Default'
   */
  variant?: ButtonVariant;
  /**
   * Nom de l'icône à afficher à gauche
   */
  leftIcon?: string;
  /**
   * Nom de l'icône à afficher à droite
   */
  rightIcon?: string;
  /**
   * Composant React personnalisé pour l'icône de gauche
   */
  leftIconComponent?: React.ReactNode;
  /**
   * Composant React personnalisé pour l'icône de droite
   */
  rightIconComponent?: React.ReactNode;
  /**
   * Tooltip à afficher
   */
  tooltip?: string;
  /**
   * Afficher le tooltip
   * @default false
   */
  showTooltip?: boolean;
}

/**
 * Composant Button
 *
 * Bouton réutilisable avec support de différentes tailles, états et variantes.
 *
 * @example
 * ```tsx
 * <Button label="Click me" size="M" variant="Default" />
 * <Button label="With icon" leftIcon="add" size="L" />
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  label = 'BUTTON LABEL',
  size = 'M',
  state = 'Default',
  variant = 'Default',
  leftIcon,
  rightIcon,
  leftIconComponent,
  rightIconComponent,
  tooltip,
  showTooltip = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  // L'état Disabled écrase la prop disabled
  const isDisabled = state === 'Disabled' || disabled;
  
  // Tailles d'icônes selon la taille du bouton
  const iconSizes: Record<ButtonSize, number> = {
    XS: 12,
    S: 12,
    M: 16,
    L: 20,
    XL: 24,
  };
  
  const iconSize = iconSizes[size];
  
  // Classes CSS
  const buttonClasses = [
    'button',
    `button--${size.toLowerCase()}`,
    `button--${state.toLowerCase()}`,
    `button--${variant.toLowerCase()}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  
  // Couleur des icônes selon la variante et l'état
  const getIconColor = () => {
    if (variant === 'Default') {
      // Variante Default : icônes blanches
      return 'var(--text-negative, #ffffff)';
    } else {
      // Variantes Outlined et Ghost : icônes primary
      return 'var(--primary-default, #063b9e)';
    }
  };
  
  const iconColor = getIconColor();
  
  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={isDisabled}
      data-size={size}
      data-state={state}
      data-variant={variant}
      {...props}
    >
      {leftIcon && (
        <span className="button__icon button__icon--left">
          <Icon name={leftIcon} size={iconSize} color={iconColor} />
        </span>
      )}
      {leftIconComponent && (
        <span className="button__icon button__icon--left">
          {leftIconComponent}
        </span>
      )}
      
      {label && <span className="button__label">{label}</span>}
      
      {rightIcon && (
        <span className="button__icon button__icon--right">
          <Icon name={rightIcon} size={iconSize} color={iconColor} />
        </span>
      )}
      {rightIconComponent && (
        <span className="button__icon button__icon--right">
          {rightIconComponent}
        </span>
      )}
      
      {showTooltip && tooltip && (
        <span className="button__tooltip">{tooltip}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;


