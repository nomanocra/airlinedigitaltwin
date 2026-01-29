import { useState, useEffect } from 'react';
import { AppHeader } from '@/design-system/composites/AppHeader';
import { ProductBanner } from '@/design-system/composites/ProductBanner';
import { HomePageActionBar } from '@/design-system/composites/HomePageActionBar';
import { Button } from '@/design-system/components/Button';
import { IconButton } from '@/design-system/components/IconButton';
import { TextInput } from '@/design-system/components/TextInput';
import type { HomePageTab } from '@/design-system/composites/HomePageActionBar';
// Background image import - change this to use a different background
import maintenanceBackground from '@/design-system/assets/backgrounds/Maintenance.png';
import './HomePage.css';

/**
 * HomePage Template
 *
 * A complete home page layout with:
 * - AppHeader with dark/light mode toggle and user button
 * - ProductBanner hero section
 * - HomePageActionBar with tabs and search
 * - Content area for study/item list
 *
 * Customize this template by:
 * 1. Updating the appName, toolName, and descriptions
 * 2. Replacing the placeholder rows with your actual data
 * 3. Adjusting styles as needed
 */
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<HomePageTab>('my-studies');
  const [searchValue, setSearchValue] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync with document dark mode state
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleNewStudy = () => {
    // TODO: Implement new study creation
    console.log('Create new study');
  };

  const handleTabChange = (tab: HomePageTab) => {
    setActiveTab(tab);
    // TODO: Load different data based on tab
    console.log('Tab changed to:', tab);
  };

  return (
    <div className="home-page">
      {/* Application Header */}
      <AppHeader
        appName="Tool name here"
        actions={
          <>
            <IconButton
              icon={isDarkMode ? 'light_mode' : 'dark_mode'}
              size="M"
              variant="Ghost"
              onClick={toggleDarkMode}
              alt={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            />
            <Button
              label="Mark Thompson"
              rightIcon="account_circle"
              variant="Ghost"
              size="M"
              onClick={() => console.log('User clicked')}
            />
          </>
        }
      />

      {/* Product Panel - Hero section */}
      <ProductBanner
        tool="maintenance"
        productName="Product Name"
        productDescription="Here need to add a long description of the tool to make it understandable by the user. You can put the goal of the tool, the target users and the business. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo"
        backgroundImage={maintenanceBackground}
        links={[
          { label: 'DOCUMENTATION', href: '#documentation', icon: 'info' },
          { label: 'APIs', href: '#apis', icon: 'code' },
          { label: 'CONTACT & SUPPORT', href: '#support', icon: 'notifications' },
        ]}
      />

      {/* Main Content Area */}
      <main className="home-page__content">
        {/* Action Bar with Tabs and Actions */}
        <HomePageActionBar activeTab={activeTab} onTabChange={handleTabChange}>
          <Button
            label="SORT BY"
            leftIcon="filter_row"
            rightIcon="dropdown"
            variant="Ghost"
            size="M"
          />
          <TextInput
            placeholder="Search for study"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            showLabel={false}
            showLeftIcon
            leftIcon="search"
            showRightIconButton={searchValue.length > 0}
            rightIconButton="close"
            onRightIconButtonClick={() => setSearchValue('')}
            size="M"
            className="home-page__search"
          />
          <Button
            label="NEW STUDY"
            leftIcon="add"
            size="M"
            onClick={handleNewStudy}
          />
        </HomePageActionBar>

        {/* Tab Content - List of items */}
        <section className="home-page__tab-content">
          {/*
            Replace these placeholder rows with your actual content.
            Each row represents a study/item in the list.

            Example:
            {studies.map((study) => (
              <StudyRow key={study.id} study={study} />
            ))}
          */}
          <div className="home-page__row home-page__row--placeholder" />
          <div className="home-page__row home-page__row--placeholder" />
          <div className="home-page__row home-page__row--placeholder" />
          <div className="home-page__row home-page__row--placeholder" />
          <div className="home-page__row home-page__row--placeholder" />
          <div className="home-page__row home-page__row--placeholder" />
          <div className="home-page__row home-page__row--placeholder" />
          <div className="home-page__row home-page__row--placeholder" />
        </section>
      </main>
    </div>
  );
}
