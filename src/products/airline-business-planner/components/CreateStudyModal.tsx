import { useState, useRef, useEffect } from 'react';
import { Modal } from '@/design-system/composites/Modal';
import { TextInput } from '@/design-system/components/TextInput';
import { Button } from '@/design-system/components/Button';
import { Icon } from '@/design-system/components/Icon';
import { SimpleTooltip } from '@/design-system/components/Tooltip';
import './CreateStudyModal.css';

export interface CreateStudyData {
  name: string;
  workspaceName: string;
  description: string;
  isNewWorkspace: boolean;
}

interface CreateStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStudy: (data: CreateStudyData) => void;
  workspaceNames: string[];
}

export function CreateStudyModal({
  isOpen,
  onClose,
  onCreateStudy,
  workspaceNames,
}: CreateStudyModalProps) {
  const [studyName, setStudyName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [description, setDescription] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const comboboxRef = useRef<HTMLDivElement>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStudyName('');
      setWorkspaceName('');
      setDescription('');
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

  // Filtered workspaces
  const filteredWorkspaces = workspaceName.trim()
    ? workspaceNames.filter((name) =>
        name.toLowerCase().includes(workspaceName.toLowerCase())
      )
    : workspaceNames;

  const exactMatch = workspaceNames.some(
    (name) => name.toLowerCase() === workspaceName.trim().toLowerCase()
  );
  const showAddOption = workspaceName.trim().length > 0 && !exactMatch;

  const handleSelectWorkspace = (name: string) => {
    setWorkspaceName(name);
    setShowDropdown(false);
  };

  const handleCreateStudy = () => {
    setSubmitted(true);
    if (!studyName.trim() || !workspaceName.trim()) return;

    onCreateStudy({
      name: studyName.trim(),
      workspaceName: workspaceName.trim(),
      description: description.trim(),
      isNewWorkspace: !exactMatch,
    });
  };

  const isValid = studyName.trim().length > 0 && workspaceName.trim().length > 0;
  const showStudyNameError = submitted && !studyName.trim();
  const showWorkspaceError = submitted && !workspaceName.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Study"
      className="create-study-modal"
      footer={
        <>
          <Button label="CANCEL" variant="Ghost" size="M" onClick={onClose} />
          <Button
            label="CREATE STUDY"
            variant="Default"
            size="M"
            onClick={handleCreateStudy}
            disabled={!isValid}
          />
        </>
      }
    >
      <div className="create-study-modal__form">
        {/* Study Name */}
        <TextInput
          label="Study Name"
          placeholder="Add study name here"
          value={studyName}
          onChange={(e) => setStudyName(e.target.value)}
          size="M"
          state={showStudyNameError ? 'Error' : 'Default'}
          showLegend={showStudyNameError}
          legend="Field required"
        />

        {/* Workspace Name (combobox) */}
        <div className="create-study-modal__combobox" ref={comboboxRef}>
          <div className="create-study-modal__combobox-label">
            <span className="text-input-label">Workspace Name</span>
            <SimpleTooltip label="Use workspaces to group your studies by topic">
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
                  name={showDropdown ? 'expand_less' : 'expand_more'}
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

        {/* Study Description (optional textarea) */}
        <div className="create-study-modal__textarea-field">
          <div className="text-input-label-container">
            <label className="text-input-label">
              Study Description
              <span className="text-input-optional"> (Optional)</span>
            </label>
          </div>
          <div className="text-input-wrapper text-input-wrapper--m create-study-modal__textarea-wrapper">
            <textarea
              className="create-study-modal__textarea"
              placeholder="Add description here"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default CreateStudyModal;
