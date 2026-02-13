import { useState, useEffect } from 'react';
import { Modal } from '@/design-system/composites/Modal';
import { TextInput } from '@/design-system/components/TextInput';
import { Button } from '@/design-system/components/Button';
import './CreateStudyModal.css';

export interface EditStudyInfoData {
  name: string;
  description: string;
}

interface EditStudyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditStudyInfoData) => void;
  initialName: string;
  initialDescription: string;
}

export function EditStudyInfoModal({
  isOpen,
  onClose,
  onSave,
  initialName,
  initialDescription,
}: EditStudyInfoModalProps) {
  const [studyName, setStudyName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [submitted, setSubmitted] = useState(false);

  // Reset form when modal opens with new values
  useEffect(() => {
    if (isOpen) {
      setStudyName(initialName);
      setDescription(initialDescription);
      setSubmitted(false);
    }
  }, [isOpen, initialName, initialDescription]);

  const handleSave = () => {
    setSubmitted(true);
    if (!studyName.trim()) return;

    onSave({
      name: studyName.trim(),
      description: description.trim(),
    });
  };

  const isValid = studyName.trim().length > 0;
  const showStudyNameError = submitted && !studyName.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Study Info"
      className="create-study-modal"
      footer={
        <>
          <Button label="CANCEL" variant="Ghost" size="M" onClick={onClose} />
          <Button
            label="SAVE"
            variant="Default"
            size="M"
            onClick={handleSave}
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

export default EditStudyInfoModal;
