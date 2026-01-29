import React from 'react';
import { ToolIcons, type ToolName } from '../components/ToolIcons';
import { Icon, type IconName } from '../components/Icon';
import './ProductBanner.css';

export interface ProductBannerLink {
  /**
   * Label displayed on the link button
   */
  label: string;
  /**
   * URL the link points to
   */
  href: string;
  /**
   * Icon displayed after the label
   */
  icon?: IconName;
  /**
   * Click handler (optional, for SPA navigation)
   */
  onClick?: (e: React.MouseEvent) => void;
}

export interface ProductBannerProps {
  /**
   * Product/tool name displayed as title
   */
  productName: string;
  /**
   * Description text
   */
  productDescription: string;
  /**
   * Tool icon to display (from ToolIcons component)
   */
  tool: ToolName;
  /**
   * Array of link buttons to display
   */
  links?: ProductBannerLink[];
  /**
   * Background image URL (optional)
   * If not provided, a solid dark blue background is used
   */
  backgroundImage?: string;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * ProductBanner Component
 *
 * A banner component for displaying product/tool information with
 * a dark overlay, icon, title, description, and action links.
 *
 * @example
 * ```tsx
 * <ProductBanner
 *   productName="Maintenance"
 *   productDescription="Tool for aircraft maintenance management..."
 *   tool="maintenance"
 *   links={[
 *     { label: 'DOCUMENTATION', href: '/docs', icon: 'open_in_new' },
 *     { label: 'APIs', href: '/api', icon: 'open_in_new' },
 *     { label: 'CONTACT & SUPPORT', href: '/support', icon: 'mail' },
 *   ]}
 * />
 * ```
 */
export function ProductBanner({
  productName,
  productDescription,
  tool,
  links = [],
  backgroundImage,
  className = '',
}: ProductBannerProps) {
  const containerClasses = [
    'product-banner',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* Background with overlay */}
      <div className="product-banner__background">
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            className="product-banner__background-image"
          />
        )}
        <div className="product-banner__overlay" />
      </div>

      {/* Content */}
      <div className="product-banner__content">
        {/* Header with icon and title */}
        <div className="product-banner__header">
          <ToolIcons tool={tool} size={40} mode="dark" />
          <h2 className="product-banner__title">{productName}</h2>
        </div>

        {/* Description */}
        <p className="product-banner__description">{productDescription}</p>

        {/* Links */}
        {links.length > 0 && (
          <div className="product-banner__links">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="product-banner__link"
                onClick={link.onClick}
              >
                <span className="product-banner__link-label">{link.label}</span>
                {link.icon && (
                  <Icon
                    name={link.icon}
                    size={12}
                    color="currentColor"
                  />
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductBanner;
