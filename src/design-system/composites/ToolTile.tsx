import React from 'react';
import { ToolIcons, type ToolName } from '../components/ToolIcons';
import { IconButton } from '../components/IconButton';
import './ToolTile.css';

// Platform SVG imports
import platformWebSvg from '../assets/svg/platforms/platform-web.svg?raw';
import platformAndroidSvg from '../assets/svg/platforms/platform-android.svg?raw';
import platformIosSvg from '../assets/svg/platforms/platform-ios.svg?raw';
import platformWindowsSvg from '../assets/svg/platforms/platform-windows.svg?raw';
import platformSkywiseSvg from '../assets/svg/platforms/platform-skywise.svg?raw';

export type PlatformName = 'web' | 'android' | 'ios' | 'windows' | 'skywise';

const platformSvgMap: Record<PlatformName, string> = {
  web: platformWebSvg,
  android: platformAndroidSvg,
  ios: platformIosSvg,
  windows: platformWindowsSvg,
  skywise: platformSkywiseSvg,
};

const platformLabels: Record<PlatformName, string> = {
  web: 'Web',
  android: 'Android',
  ios: 'iOS',
  windows: 'Windows',
  skywise: 'Skywise',
};

export interface ToolTileProps {
  /**
   * Tool icon to display (from ToolIcons component)
   */
  tool: ToolName;
  /**
   * Product display name
   */
  title: string;
  /**
   * Short description text (max 2 lines)
   */
  description?: string;
  /**
   * Platform badges to display
   */
  platforms?: PlatformName[];
  /**
   * Click handler for the entire tile
   */
  onClick?: () => void;
  /**
   * Click handler for the three-dots more options button
   */
  onMoreOptions?: (e: React.MouseEvent) => void;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * ToolTile Composite
 *
 * A card component displaying a product/tool with its icon, name,
 * supported platform badges, description, and a hover-revealed "more options" button.
 *
 * @example
 * ```tsx
 * <ToolTile
 *   tool="maintenance"
 *   title="Maintenance"
 *   description="Aircraft maintenance management and forecasting tool"
 *   platforms={['web', 'ios', 'android']}
 *   onClick={() => console.log('clicked')}
 *   onMoreOptions={(e) => console.log('more options')}
 * />
 * ```
 */
export function ToolTile({
  tool,
  title,
  description,
  platforms = [],
  onClick,
  onMoreOptions,
  className = '',
}: ToolTileProps) {
  const containerClasses = [
    'tool-tile',
    className,
  ].filter(Boolean).join(' ');

  const handleMoreOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoreOptions?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={containerClasses}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {/* Header row */}
      <div className="tool-tile__header">
        <ToolIcons tool={tool} size={40} />
        <div className="tool-tile__title-column">
          <span className="tool-tile__title">{title}</span>
          {platforms.length > 0 && (
            <div className="tool-tile__platforms">
              {platforms.map((platform) => (
                <span
                  key={platform}
                  className="tool-tile__platform-icon"
                  title={platformLabels[platform]}
                  dangerouslySetInnerHTML={{ __html: platformSvgMap[platform] }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* More options button */}
      {onMoreOptions && (
        <div className="tool-tile__more-options">
          <IconButton
            icon="more_horiz"
            size="XS"
            variant="Ghost"
            onClick={handleMoreOptions}
            alt="More options"
          />
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="tool-tile__description">
          <span className="tool-tile__description-text">{description}</span>
        </div>
      )}
    </div>
  );
}

export default ToolTile;
