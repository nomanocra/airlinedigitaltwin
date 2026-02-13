import { Modal } from '@/design-system/composites/Modal';
import { Button } from '@/design-system/components/Button';
import './DeleteStudyModal.css';

interface DeleteStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  studyName: string;
}

export function DeleteStudyModal({
  isOpen,
  onClose,
  onConfirm,
  studyName,
}: DeleteStudyModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Study"
      className="delete-study-modal"
      footer={
        <>
          <Button label="CANCEL" variant="Ghost" size="M" onClick={onClose} />
          <Button
            label="DELETE"
            variant="Default"
            size="M"
            onClick={onConfirm}
            className="delete-study-modal__delete-btn"
          />
        </>
      }
    >
      <p className="delete-study-modal__message">
        Are you sure you want to delete "<strong>{studyName}</strong>"?
        <br />
        This action cannot be undone.
      </p>
    </Modal>
  );
}

export default DeleteStudyModal;
