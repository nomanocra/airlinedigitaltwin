import { ReactNode } from 'react';
import { Icon } from '../components/Icon';
import { Spinner } from '../components/Spinner';
import './StudyStatusBar.css';

export type StudyStatusBarStatus = 'Ready' | 'NotReady' | 'Computing' | 'Modified' | 'Failed';

export interface StudyStatusBarProps {
  /**
   * Current status of the study
   */
  status: StudyStatusBarStatus;
  /**
   * Title text displayed in the bar
   */
  title: string;
  /**
   * Description text displayed below the title
   */
  description: string;
  /**
   * Action elements displayed on the right side (Button, IconButton, etc.)
   */
  actions?: ReactNode;
  /**
   * Additional CSS class
   */
  className?: string;
}

const statusIconMap: Record<Exclude<StudyStatusBarStatus, 'Computing'>, { name: string; color: string }> = {
  Ready: { name: 'check', color: 'var(--primary-default, #063b9e)' },
  NotReady: { name: 'error', color: 'var(--feedback-error-default, #e4002b)' },
  Modified: { name: 'warning', color: 'var(--feedback-warning-default, #ffc929)' },
  Failed: { name: 'broken_image', color: 'var(--feedback-error-default, #e4002b)' },
};

/**
 * StudyStatusBar Composite
 *
 * A horizontal status bar that indicates the current state of a study computation.
 * Displays a colored left border, status icon, title/description, and customizable actions.
 *
 * @example
 * ```tsx
 * <StudyStatusBar
 *   status="Ready"
 *   title="Inputs ready"
 *   description="You can compute the study."
 *   actions={<Button label="COMPUTE STUDY" size="M" onClick={() => computeStudy()} />}
 * />
 * ```
 */
export function StudyStatusBar({
  status,
  title,
  description,
  actions,
  className = '',
}: StudyStatusBarProps) {
  const containerClasses = [
    'study-status-bar',
    `study-status-bar--${status.toLowerCase()}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} role="status">
      {/* Status icon */}
      <div className="study-status-bar__icon">
        {status === 'Computing' ? (
          <Spinner variant="arc" size={24} color="var(--text-secondary, #63728a)" />
        ) : (
          <Icon name={statusIconMap[status].name} size={24} color={statusIconMap[status].color} />
        )}
      </div>

      {/* Content */}
      <div className="study-status-bar__content">
        <span className="study-status-bar__title">{title}</span>
        <span className="study-status-bar__description">{description}</span>
      </div>

      {/* Actions */}
      {actions && (
        <div className="study-status-bar__actions">
          {actions}
        </div>
      )}
    </div>
  );
}

export default StudyStatusBar;
