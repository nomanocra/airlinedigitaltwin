import { useState, ReactNode } from 'react';
import { Tab } from '../components/Tab';
import './HomePageActionBar.css';

export type HomePageTab = 'my-studies' | 'all-studies';

export interface HomePageActionBarProps {
  /**
   * Currently active tab
   * @default 'my-studies'
   */
  activeTab?: HomePageTab;
  /**
   * Callback when tab changes
   */
  onTabChange?: (tab: HomePageTab) => void;
  /**
   * Actions to display on the right side (buttons, inputs, selects, etc.)
   */
  children?: ReactNode;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * HomePageActionBar Composite Component
 *
 * A navigation bar with tabs on the left and customizable actions on the right.
 * The actions section accepts any React children (buttons, inputs, selects, etc.)
 *
 * @example
 * ```tsx
 * <HomePageActionBar
 *   activeTab="my-studies"
 *   onTabChange={(tab) => console.log(tab)}
 * >
 *   <Button label="SORT BY" leftIcon="filter_list" rightIcon="keyboard_arrow_down" variant="Ghost" size="M" />
 *   <TextInput placeholder="Search for study" showLeftIcon leftIcon="search" size="M" />
 *   <Button label="NEW STUDY" leftIcon="add" size="M" />
 * </HomePageActionBar>
 * ```
 */
export function HomePageActionBar({
  activeTab: controlledActiveTab,
  onTabChange,
  children,
  className = '',
}: HomePageActionBarProps) {
  // Internal state for uncontrolled mode
  const [internalActiveTab, setInternalActiveTab] = useState<HomePageTab>('my-studies');

  // Use controlled or uncontrolled values
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = (tab: HomePageTab) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tab);
    }
    onTabChange?.(tab);
  };

  const containerClasses = ['home-page-action-bar', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {/* Left side - Tabs */}
      <div className="home-page-action-bar__tabs">
        <Tab
          label="My Studies"
          size="M"
          status={activeTab === 'my-studies' ? 'Active' : 'Default'}
          onClick={() => handleTabChange('my-studies')}
        />
        <Tab
          label="All studies"
          size="M"
          status={activeTab === 'all-studies' ? 'Active' : 'Default'}
          onClick={() => handleTabChange('all-studies')}
        />
      </div>

      {/* Right side - Actions (user-provided children) */}
      {children && (
        <div className="home-page-action-bar__actions">
          {children}
        </div>
      )}
    </div>
  );
}

export default HomePageActionBar;
