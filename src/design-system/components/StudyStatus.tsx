import { Icon } from './Icon';
import { Spinner } from './Spinner';
import './StudyStatus.css';

export type StudyStatusState = 'Computed' | 'Computing' | 'Failed' | 'Draft' | 'Warning';

export interface StudyStatusProps {
  /**
   * Status state
   */
  state: StudyStatusState;
  /**
   * Optional custom label (defaults to state name)
   */
  label?: string;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * StudyStatus Component
 *
 * Displays the computation status of a study with icon and label.
 * Used in study lists and study details.
 *
 * @example
 * ```tsx
 * <StudyStatus state="Computed" />
 * <StudyStatus state="Computing" />
 * <StudyStatus state="Failed" />
 * <StudyStatus state="Draft" />
 * <StudyStatus state="Warning" />
 * ```
 */
export function StudyStatus({
  state,
  label,
  className = '',
}: StudyStatusProps) {
  const displayLabel = label || state;

  const classes = [
    'study-status',
    `study-status--${state.toLowerCase()}`,
    className,
  ].filter(Boolean).join(' ');

  const renderIcon = () => {
    switch (state) {
      case 'Computed':
        return <Icon name="check" size={16} color="var(--primary-default, #063b9e)" />;
      case 'Computing':
        return <Spinner size={16} variant="arc" color="var(--text-secondary, #63728a)" />;
      case 'Failed':
        return <Icon name="close" size={16} color="var(--feedback-error-default, #e4002b)" />;
      case 'Draft':
        return <Icon name="edit" size={16} color="var(--text-secondary, #63728a)" />;
      case 'Warning':
        return <Icon name="warning" size={16} color="var(--feedback-warning-default, #ffc929)" />;
      default:
        return null;
    }
  };

  return (
    <div className={classes}>
      <span className="study-status__icon">
        {renderIcon()}
      </span>
      <span className="study-status__label">{displayLabel}</span>
    </div>
  );
}

export default StudyStatus;
