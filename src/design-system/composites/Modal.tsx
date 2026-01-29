import React, { useEffect, useCallback } from 'react';
import { IconButton } from '../components/IconButton';
import './Modal.css';

export interface ModalProps {
  /**
   * Controls the visibility of the modal
   */
  isOpen: boolean;
  /**
   * Callback when the modal is closed (via close button, overlay click, or Escape key)
   */
  onClose: () => void;
  /**
   * Title displayed in the modal header
   */
  title: string;
  /**
   * Content to display inside the modal
   */
  children: React.ReactNode;
  /**
   * Custom footer content (buttons, etc.)
   * If not provided, no footer is displayed
   */
  footer?: React.ReactNode;
  /**
   * Whether clicking the overlay closes the modal
   * @default true
   */
  closeOnOverlayClick?: boolean;
  /**
   * Whether pressing Escape closes the modal
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * Additional class name for the modal container.
   * Use this to customize the modal size (width, height).
   */
  className?: string;
}

/**
 * Modal Component
 *
 * A dialog component that displays content in a layer above the page.
 * Supports customizable header, content, and footer sections.
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmation"
 *   footer={
 *     <>
 *       <Button variant="Ghost" label="CANCEL" onClick={() => setIsOpen(false)} />
 *       <Button variant="Default" label="CONTINUE" onClick={handleConfirm} />
 *     </>
 *   }
 * >
 *   <p>Are you sure you want to continue?</p>
 * </Modal>
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
}: ModalProps) {
  // Handle Escape key press
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [onClose, closeOnEscape]
  );

  // Add/remove event listener for Escape key
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscapeKey]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  const modalClasses = ['modal', className].filter(Boolean).join(' ');

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">
            {title}
          </h2>
          <IconButton
            icon="close"
            size="S"
            variant="Ghost"
            onClick={onClose}
            alt="Close modal"
            className="modal__close-button"
          />
        </div>

        {/* Content */}
        <div className="modal__content">
          {children}
        </div>

        {/* Footer (optional) */}
        {footer && (
          <div className="modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
