import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { Spinner } from '../components/Spinner';
import { Avatar, AvatarStack } from '../components/Avatar';
import { SimpleTooltip } from '../components/Tooltip';
import './Workspace.css';

export interface WorkspaceUser {
  initials: string;
  name?: string;
  color?: string;
}

export interface WorkspaceProps {
  /**
   * Workspace title
   */
  title: string;
  /**
   * Number of studies — renders "N Studies" chip
   */
  studyCount?: number;
  /**
   * Computing label (e.g. "3 Computing")
   */
  computingText?: string;
  /**
   * Whether to show the spinner next to computingText
   * @default false
   */
  isComputing?: boolean;
  /**
   * Last modified date/time string
   */
  lastModified?: string;
  /**
   * Users to display as avatar stack
   */
  users?: WorkspaceUser[];
  /**
   * Maximum visible avatars
   * @default 3
   */
  maxAvatars?: number;
  /**
   * Collapsible content (folder items)
   */
  children: React.ReactNode;
  /**
   * Whether the workspace is initially open
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Controlled open state
   */
  open?: boolean;
  /**
   * Callback when toggled
   */
  onToggle?: (open: boolean) => void;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * Workspace Composite
 *
 * A collapsible card for workspace folders. Displays title, study count,
 * computing state, last modified date, and user avatars.
 *
 * @example
 * ```tsx
 * <Workspace
 *   title="My Workspace"
 *   studyCount={12}
 *   lastModified="Jan 15, 2025"
 *   users={[{ initials: 'MT' }, { initials: 'JD' }]}
 *   defaultOpen
 * >
 *   <div>Folder content here...</div>
 * </Workspace>
 * ```
 */
export function Workspace({
  title,
  studyCount,
  computingText,
  isComputing = false,
  lastModified,
  users,
  maxAvatars = 3,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onToggle,
  className = '',
}: WorkspaceProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleToggle = () => {
    const nextOpen = !isOpen;
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen);
    }
    onToggle?.(nextOpen);
  };

  const containerClasses = [
    'workspace',
    isOpen ? 'workspace--open' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <button
        className="workspace__header"
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <span className="workspace__toggle-icon">
          <Icon
            name="dropdown"
            size={20}
            color="var(--text-secondary, #63728a)"
          />
        </span>
        {isComputing ? (
          <Spinner size={24} variant="arc" />
        ) : (
          <Icon
            name={isOpen ? 'folder_open' : 'folder'}
            size={24}
            color="var(--primary-default, #063b9e)"
          />
        )}
        <div className="workspace__title-block">
          <span className="workspace__title">{title}</span>
          <div className="workspace__title-row">
            {studyCount !== undefined && (
              <span className="workspace__study-chip">
                {studyCount} {studyCount === 1 ? 'Study' : 'Studies'}
              </span>
            )}
            {isComputing && computingText && (
              <span className="workspace__computing-text">{computingText}</span>
            )}
          </div>
        </div>
        <span className="workspace__spacer" />
        {lastModified && (
          <div className="workspace__last-modified">
            <span className="workspace__last-modified-label">Last Modification</span>
            <span className="workspace__last-modified-date">{lastModified}</span>
          </div>
        )}
        {users && users.length > 0 && (
          <SimpleTooltip
            label={users.map(u => u.name || u.initials).join(', ')}
            side="top"
            delayDuration={0}
          >
            <div>
              <AvatarStack max={maxAvatars} size="M">
                {users.map((user, i) => (
                  <Avatar
                    key={i}
                    initials={user.initials}
                    size="M"
                    color={user.color || '#ced5dd'}
                    textColor="#00205b"
                  />
                ))}
              </AvatarStack>
            </div>
          </SimpleTooltip>
        )}
      </button>
      <div className="workspace__body">
        <div className="workspace__content">
          <div className="workspace__table-wrapper">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workspace;
