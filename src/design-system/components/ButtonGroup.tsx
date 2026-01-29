import './ButtonGroup.css';
import { Button, type ButtonSize } from './Button';
import { IconButton } from './IconButton';
import type { IconName } from './Icon';

export type ButtonGroupLayout = 'horizontal' | 'vertical';
export type ButtonGroupSize = 'S' | 'M' | 'L' | 'XL';

// Map ButtonGroup size to internal Button size (one level smaller)
// This ensures ButtonGroup height matches Button height of the same size
const sizeToButtonSize: Record<ButtonGroupSize, ButtonSize> = {
  S: 'XS',
  M: 'S',
  L: 'M',
  XL: 'L',
};

export interface ButtonGroupOption {
  /**
   * Unique identifier for the option
   */
  value: string;
  /**
   * Display label for the button (optional if iconName is provided)
   */
  label?: string;
  /**
   * Icon name to display (optional, can be used alone or with label)
   */
  iconName?: IconName;
  /**
   * Whether the option is disabled
   */
  disabled?: boolean;
}

export interface ButtonGroupProps {
  /**
   * Array of options to display
   */
  options: ButtonGroupOption[];
  /**
   * Currently selected value
   */
  value: string;
  /**
   * Callback when selection changes
   */
  onChange: (value: string) => void;
  /**
   * Layout direction: horizontal (default) or vertical
   */
  layout?: ButtonGroupLayout;
  /**
   * Size of the ButtonGroup (S, M, L, XL)
   * The ButtonGroup height matches a Button of the same size
   * @default 'M'
   */
  size?: ButtonGroupSize;
  /**
   * Additional CSS class
   */
  className?: string;
  /**
   * Disable all buttons
   */
  disabled?: boolean;
}

/**
 * ButtonGroup Component
 *
 * A group of toggle buttons where one option can be selected at a time.
 * Uses Button and IconButton components internally.
 *
 * @example
 * ```tsx
 * const [selected, setSelected] = useState('option1');
 *
 * <ButtonGroup
 *   options={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' },
 *     { value: 'option3', label: 'Option 3' },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 *   size="M"
 *   layout="horizontal"
 * />
 * ```
 */
export function ButtonGroup({
  options,
  value,
  onChange,
  layout = 'horizontal',
  size = 'M',
  className = '',
  disabled = false,
}: ButtonGroupProps) {
  const containerClasses = [
    'button-group',
    `button-group--${layout}`,
    disabled ? 'button-group--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Get the internal button size (one level smaller)
  const buttonSize = sizeToButtonSize[size];

  return (
    <div className={containerClasses} role="group">
      {options.map((option) => {
        const isActive = option.value === value;
        const isDisabled = disabled || option.disabled;
        const hasIconOnly = option.iconName && !option.label;

        if (hasIconOnly) {
          // Icon-only button: use IconButton
          return (
            <IconButton
              key={option.value}
              icon={option.iconName as string}
              size={buttonSize}
              variant={isActive ? 'Default' : 'Ghost'}
              state={isDisabled ? 'Disabled' : 'Default'}
              onClick={() => !isDisabled && onChange(option.value)}
              aria-pressed={isActive}
              className="button-group__item button-group__item--icon-only"
            />
          );
        }

        // Button with label (and optional icon)
        return (
          <Button
            key={option.value}
            label={option.label}
            leftIcon={option.iconName}
            size={buttonSize}
            variant={isActive ? 'Default' : 'Ghost'}
            state={isDisabled ? 'Disabled' : 'Default'}
            onClick={() => !isDisabled && onChange(option.value)}
            aria-pressed={isActive}
            className="button-group__item"
          />
        );
      })}
    </div>
  );
}

export default ButtonGroup;
