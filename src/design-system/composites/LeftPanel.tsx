import React from 'react';
import './LeftPanel.css';

export interface LeftPanelProps {
  /**
   * Header content, typically a PanelHeader composite
   */
  header?: React.ReactNode;
  /**
   * Main content area (scrollable)
   */
  children?: React.ReactNode;
  /**
   * Optional footer content, rendered at the bottom with a top border separator
   */
  footer?: React.ReactNode;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * LeftPanel Composite
 *
 * A full-height side panel with a dark corporate background.
 * Composed of three sections: header (typically PanelHeader), scrollable content body,
 * and an optional footer separated by a subtle border.
 *
 * @example
 * ```tsx
 * <LeftPanel
 *   header={
 *     <PanelHeader
 *       studyName="My Study"
 *       onBackHome={() => navigate('/')}
 *     />
 *   }
 *   footer={
 *     <>
 *       <PanelButton icon="help" label="Need Help?" />
 *       <PanelButton icon="menu_book" label="Glossary" />
 *     </>
 *   }
 * >
 *   <p>Panel content here</p>
 * </LeftPanel>
 * ```
 */
export function LeftPanel({
  header,
  children,
  footer,
  className = '',
}: LeftPanelProps) {
  const containerClasses = ['left-panel', className].filter(Boolean).join(' ');

  return (
    <aside className={containerClasses}>
      {header && <div className="left-panel__header">{header}</div>}

      <div className="left-panel__body">{children}</div>

      {footer && <div className="left-panel__footer">{footer}</div>}
    </aside>
  );
}

export default LeftPanel;
