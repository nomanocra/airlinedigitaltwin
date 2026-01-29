import React from 'react';
import './AppHeader.css';

// Airbus logo SVG inline for proper color control
const AirbusLogo = () => (
  <svg width="86" height="16" viewBox="0 0 86 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M39.637 5.45725C39.637 2.54223 37.7305 0.32666 33.8017 0.32666H25.8975V15.6484H29.6172V3.63801H33.825C35.3827 3.63801 35.9403 4.5245 35.9403 5.55044C35.9403 6.59996 35.3592 7.46288 33.8015 7.46288H30.1981L35.3126 15.6484H39.5439C39.5439 15.6484 36.0565 10.1446 36.0799 10.1446C38.2422 9.63174 39.637 8.11585 39.637 5.45725" fill="currentColor"/>
    <rect x="19.668" y="0.32666" width="3.71977" height="15.3219" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M7.78806 0.32666L0 15.6484H4.18447L5.44602 13.0832H11.7167L10.1592 9.86482H7.02894L9.34533 5.15412H9.39211L14.5995 15.6484H18.8771L11.089 0.32666H7.78806Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M53.2145 7.69617C54.4004 7.04298 55.0281 5.99369 55.0281 4.45444C55.0281 1.98244 53.1915 0.32666 50.0996 0.32666H41.4043V15.6484H50.4483C53.6098 15.6484 55.679 13.9459 55.679 11.3574C55.6788 9.5619 54.6793 8.20925 53.2145 7.69617V7.69617ZM45.1245 3.56817H50.0996C50.8436 3.56817 51.4247 4.15109 51.4247 4.92082C51.4247 5.69055 50.8436 6.27347 50.0761 6.27347H45.1243V3.56817H45.1245ZM50.1922 12.43H45.1243V9.30504H50.1922C51.099 9.30504 51.7965 9.95823 51.7965 10.8443C51.7967 11.7537 51.099 12.43 50.1922 12.43V12.43Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M67.4197 8.88536C67.4197 11.211 66.3502 12.5001 64.2349 12.5001C62.1427 12.5001 61.0732 11.211 61.0732 8.88536V0.32666H57.2607V8.60558C57.2607 13.3398 59.7483 15.9751 64.2349 15.9751C68.7216 15.9751 71.2324 13.3398 71.2324 8.60558V0.32666H67.4197V8.88536Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M81.1589 6.41341C77.6277 5.55092 76.8582 5.46854 76.8582 4.45427C76.8582 3.66962 77.7415 3.28822 79.2294 3.28822C81.2054 3.28822 83.3097 3.78551 84.5066 4.52432L85.6923 1.39935C84.1581 0.583135 81.9029 0 79.2759 0C75.3469 0 73.1382 1.95914 73.1382 4.59416C73.1382 7.42962 74.788 8.58162 78.5782 9.39827C81.5289 10.0508 82.1581 10.4579 82.1581 11.2871C82.1581 12.1879 81.3447 12.5933 79.7406 12.5933C77.4158 12.5933 75.3117 12.0268 73.6264 11.1008L72.4873 14.3656C74.3239 15.3451 77.0671 15.9749 79.8335 15.9749C83.6927 15.9749 85.994 14.179 85.994 11.1706C85.9945 8.75697 84.4379 7.20649 81.1589 6.41341" fill="currentColor"/>
  </svg>
);

export interface AppHeaderProps {
  /**
   * Application name displayed in the header
   */
  appName: string;
  /**
   * URL to navigate when clicking the logo
   */
  logoHref?: string;
  /**
   * Action buttons displayed on the right side.
   * Pass IconButtons, Buttons, or any custom components.
   * @example
   * ```tsx
   * actions={
   *   <>
   *     <IconButton icon="notifications" variant="Ghost" />
   *     <IconButton icon="settings" variant="Ghost" />
   *     <Button label="Mark Thompson" rightIcon="account_circle" variant="Ghost" />
   *   </>
   * }
   * ```
   */
  actions?: React.ReactNode;
  /**
   * Additional class name for the header
   */
  className?: string;
}

/**
 * AppHeader Component
 *
 * A header component for Airbus applications with fixed logo, app name, and action buttons.
 * The header is always in dark mode regardless of the application theme.
 *
 * @example
 * ```tsx
 * <AppHeader
 *   appName="Maintenance Scheduler"
 *   actions={
 *     <>
 *       <IconButton icon="dark_mode" variant="Ghost" onClick={toggleTheme} />
 *       <Button label="Mark Thompson" rightIcon="account_circle" variant="Ghost" />
 *     </>
 *   }
 * />
 * ```
 */
export function AppHeader({
  appName,
  logoHref,
  actions,
  className = '',
}: AppHeaderProps) {
  const headerClasses = ['app-header', className].filter(Boolean).join(' ');

  const logo = (
    <div className="app-header__logo">
      <AirbusLogo />
    </div>
  );

  return (
    <header className={headerClasses}>
      {/* Left Section: Logo & Label - all items same level with gap 16px */}
      <div className="app-header__left">
        {logoHref ? (
          <a href={logoHref} className="app-header__logo-link">
            {logo}
          </a>
        ) : (
          logo
        )}
        <div className="app-header__separator" />
        <div className="app-header__titles">
          <span className="app-header__app-name">{appName}</span>
          <span className="app-header__app-subtitle">By Airline Sciences</span>
        </div>
      </div>

      {/* Right Section: Actions */}
      {actions && (
        <div className="app-header__right">
          <div className="app-header__actions">{actions}</div>
        </div>
      )}
    </header>
  );
}

export default AppHeader;
