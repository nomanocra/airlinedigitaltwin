import './PanelSectionTitle.css';

export type PanelSectionTitleSize = 'XS' | 'S' | 'M';

export interface PanelSectionTitleProps {
  /**
   * Section title text
   */
  label: string;
  /**
   * Size of the title
   * @default 'S'
   */
  size?: PanelSectionTitleSize;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * PanelSectionTitle Component
 *
 * A section title label for dark corporate panels. Used to group
 * panel content into named sections (e.g., "Inputs", "Results").
 * Includes top spacing to visually separate from the previous section.
 *
 * @example
 * ```tsx
 * <PanelSectionTitle label="Inputs" />
 * <PanelSectionTitle label="Results" size="M" />
 * <PanelSectionTitle label="Options" size="XS" />
 * ```
 */
export function PanelSectionTitle({
  label,
  size = 'S',
  className = '',
}: PanelSectionTitleProps) {
  const classes = [
    'panel-section-title',
    `panel-section-title--${size.toLowerCase()}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{label}</span>;
}

export default PanelSectionTitle;
