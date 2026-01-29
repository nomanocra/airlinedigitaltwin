import { useRef, useState, useCallback } from 'react';
import './PanelStudyName.css';
import { Icon } from './Icon';

export interface PanelStudyNameProps {
  /** The study name to display */
  name: string;
  /** Number of visible lines before truncation with ellipsis
   * @default 1
   */
  lines?: number;
  /** Click handler (e.g., to open rename dialog) */
  onClick?: () => void;
  /** Additional CSS class */
  className?: string;
}

/**
 * PanelStudyName Component
 *
 * Displays a study name with an edit icon, typically used inside a dark corporate panel.
 * On hover, the background subtly lights up and the edit icon becomes fully visible.
 * When the text is truncated, a tooltip shows the full name on prolonged hover.
 *
 * @example
 * ```tsx
 * <PanelStudyName name="My Study" onClick={() => console.log('Edit')} />
 * ```
 */
export function PanelStudyName({ name, lines = 1, onClick, className = '' }: PanelStudyNameProps) {
  const classes = ['panel-study-name', className].filter(Boolean).join(' ');
  const labelRef = useRef<HTMLSpanElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isTruncated = useCallback((el: HTMLElement) => {
    if (lines === 1) return el.scrollWidth > el.clientWidth;
    return el.scrollHeight > el.clientHeight;
  }, [lines]);

  const handleMouseEnter = useCallback(() => {
    const el = labelRef.current;
    if (el && isTruncated(el)) {
      timerRef.current = setTimeout(() => setShowTooltip(true), 600);
    }
  }, [isTruncated]);

  const handleMouseLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowTooltip(false);
  }, []);

  const labelStyle: React.CSSProperties =
    lines === 1
      ? { whiteSpace: 'nowrap', textOverflow: 'ellipsis' }
      : { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: lines };

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span ref={labelRef} className="panel-study-name__label" style={labelStyle}>{name}</span>
      <Icon name="edit" size={16} color="var(--white, #ffffff)" className="panel-study-name__icon" />
      {showTooltip && (
        <span className="panel-study-name__tooltip" role="tooltip">{name}</span>
      )}
    </button>
  );
}

export default PanelStudyName;
