import { useState, useRef, useEffect } from 'react';
import { Modal } from '@/design-system/composites/Modal';
import { Button } from '@/design-system/components/Button';
import { Icon } from '@/design-system/components/Icon';
import { SimpleTooltip } from '@/design-system/components/Tooltip';
import './CreateStudyModal.css';

export interface MoveStudyData {
  workspaceName: string;
  isNewWorkspace: boolean;
}

interface MoveStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (data: MoveStudyData) => void;
  workspaceNames: string[];
  currentWorkspace: string;
  studyName: string;
}

export function MoveStudyModal({
  isOpen,
  onClose,
  onMove,
  workspaceNames,
  currentWorkspace,
  studyName,
}: MoveStudyModalProps) {
  const [workspaceName, setWorkspaceName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const comboboxRef = useRef<HTMLDivElement>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setWorkspaceName('');
      setShowDropdown(false);
      setSubmitted(false);
    }
  }, [isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter out current workspace from options
  const availableWorkspaces = workspaceNames.filter(
    (name) => name.toLowerCase() !== currentWorkspace.toLowerCase()
  );

  // Filtered workspaces based on input
  const filteredWorkspaces = workspaceName.trim()
    ? availableWorkspaces.filter((name) =>
        name.toLowerCase().includes(workspaceName.toLowerCase())
      )
    : availableWorkspaces;

  const exactMatch = workspaceNames.some(
    (name) => name.toLowerCase() === workspaceName.trim().toLowerCase()
  );
  const showAddOption = workspaceName.trim().length > 0 && !exactMatch;

  const handleSelectWorkspace = (name: string) => {
    setWorkspaceName(name);
    setShowDropdown(false);
  };

  const handleMove = () => {
    setSubmitted(true);
    if (!workspaceName.trim()) return;

    onMove({
      workspaceName: workspaceName.trim(),
      isNewWorkspace: !exactMatch,
    });
  };

  const isValid = workspaceName.trim().length > 0;
  const showWorkspaceError = submitted && !workspaceName.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Move Study"
      className="create-study-modal"
      footer={
        <>
          <Button label="CANCEL" variant="Ghost" size="M" onClick={onClose} />
          <Button
            label="MOVE"
            variant="Default"
            size="M"
            onClick={handleMove}
            disabled={!isValid}
          />
        </>
      }
    >
      <div className="create-study-modal__form">
        <p className="create-study-modal__info-text">
          Move "<strong>{studyName}</strong>" to another workspace.
        </p>

        {/* Workspace Name (combobox) */}
        <div className="create-study-modal__combobox" ref={comboboxRef}>
          <div className="create-study-modal__combobox-label">
            <span className="text-input-label">Destination Workspace</span>
            <SimpleTooltip label="Select an existing workspace or create a new one">
              <span className="create-study-modal__info-icon">
                <Icon name="info" size={16} />
              </span>
            </SimpleTooltip>
          </div>

          <div className="create-study-modal__combobox-input">
            <div
              className={`text-input-wrapper text-input-wrapper--m${
                showWorkspaceError ? ' text-input-wrapper--error' : ''
              }`}
            >
              <input
                type="text"
                className="text-input-field"
                placeholder="Search for a workspace"
                value={workspaceName}
                onChange={(e) => {
                  setWorkspaceName(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              <button
                type="button"
                className="create-study-modal__dropdown-toggle"
                onClick={() => setShowDropdown(!showDropdown)}
                tabIndex={-1}
              >
                <Icon
                  name={showDropdown ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                  size={16}
                  color="var(--text-secondary, #63728a)"
                />
              </button>
            </div>

            {/* Dropdown */}
            {showDropdown && (filteredWorkspaces.length > 0 || showAddOption) && (
              <div className="create-study-modal__dropdown">
                {filteredWorkspaces.map((name) => (
                  <div
                    key={name}
                    className="create-study-modal__dropdown-item"
                    onClick={() => handleSelectWorkspace(name)}
                  >
                    {name}
                  </div>
                ))}
                {showAddOption && (
                  <div
                    className="create-study-modal__dropdown-item create-study-modal__dropdown-item--add"
                    onClick={() => handleSelectWorkspace(workspaceName.trim())}
                  >
                    + ADD "{workspaceName.trim()}"
                  </div>
                )}
              </div>
            )}
          </div>

          {showWorkspaceError && (
            <span className="create-study-modal__combobox-legend">
              Field required
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default MoveStudyModal;
