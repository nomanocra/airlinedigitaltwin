import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFavicon } from '@/hooks/useFavicon';
import { AppHeader } from '@/design-system/composites/AppHeader';
import { LeftPanel } from '@/design-system/composites/LeftPanel';
import { PanelHeader } from '@/design-system/composites/PanelHeader';
import { PanelGroup } from '@/design-system/components/PanelGroup';
import { PanelButton } from '@/design-system/components/PanelButton';
import { StudyStatusBar } from '@/design-system/composites/StudyStatusBar';
import { IconButton } from '@/design-system/components/IconButton';
import { Button } from '@/design-system/components/Button';
import { NumberInput } from '@/design-system/components/NumberInput';
import { Icon } from '@/design-system/components/Icon';
import { Calendar } from '@/design-system/composites/Calendar';
import { Tab } from '@/design-system/components/Tab';
import { Checkbox } from '@/design-system/components/Checkbox';
import { TextInput } from '@/design-system/components/TextInput';
import './StudyPage.css';

// Assumption items configuration
const ASSUMPTION_ITEMS = [
  { id: 'period', label: 'Period', icon: 'calendar_month' },
  { id: 'fleet', label: 'Fleet', icon: 'AIR_fleet' },
  { id: 'network', label: 'Network', icon: 'share' },
  { id: 'load-factor', label: 'Load factor', icon: 'airline_seat_recline_extra' },
  { id: 'operational-cost', label: 'Operational Cost', icon: 'trending_down' },
  { id: 'revenue', label: 'Revenue', icon: 'trending_up' },
  { id: 'financial', label: 'Financial', icon: 'account_balance' },
  { id: 'investment', label: 'Investment & Capitalisation', icon: 'monetization_on' },
];

// Output items configuration
const OUTPUT_ITEMS = [
  { id: 'crew-cost', label: 'Crew Cost', icon: 'group' },
  { id: 'economics', label: 'Economics Performance', icon: 'show_chart' },
  { id: 'pnl', label: 'Profit & Loss', icon: 'bar_chart' },
];

interface Scenario {
  id: number;
  name: string;
  isOpen: boolean;
  assumptionsOpen: boolean;
  outputsOpen: boolean;
}

export default function StudyPage() {
  const navigate = useNavigate();
  const { studyId } = useParams();

  useFavicon('airline-business-planner');

  useEffect(() => {
    document.title = 'Study - Airline Business Planner';
  }, []);

  // Scenarios state — start with 1 scenario
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: 1, name: 'Scenario 1', isOpen: true, assumptionsOpen: true, outputsOpen: false },
  ]);

  // Selected panel button
  const [selectedItem, setSelectedItem] = useState<{ scenarioId: number; itemId: string }>({
    scenarioId: 1,
    itemId: 'period',
  });

  // Form state (Simulation Period)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [operatingDays, setOperatingDays] = useState<number>(0);
  const [startupDuration, setStartupDuration] = useState<number>(0);

  // Fleet sub-tab state
  const [fleetTab, setFleetTab] = useState<'fleet' | 'ownership' | 'crew'>('fleet');
  const [fleetSearchValue, setFleetSearchValue] = useState('');

  // Fleet data (empty for now)
  const fleetEntries: never[] = [];
  const hasAircraft = fleetEntries.length > 0;

  // Study lifecycle: draft → computing → computed
  const [studyStatus, setStudyStatus] = useState<'draft' | 'computing' | 'computed'>('draft');
  const computeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset to draft when inputs change after computed
  useEffect(() => {
    if (studyStatus === 'computed') {
      setStudyStatus('draft');
    }
  }, [startDate, endDate, operatingDays, startupDuration]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (computeTimerRef.current) clearTimeout(computeTimerRef.current);
    };
  }, []);

  const handleCompute = useCallback(() => {
    setStudyStatus('computing');
    computeTimerRef.current = setTimeout(() => {
      setStudyStatus('computed');
      computeTimerRef.current = null;
    }, 10000);
  }, []);

  // Toggle scenario open/closed
  const toggleScenario = (id: number) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isOpen: !s.isOpen } : s))
    );
  };

  // Toggle assumptions open/closed
  const toggleAssumptions = (scenarioId: number) => {
    setScenarios((prev) =>
      prev.map((s) =>
        s.id === scenarioId ? { ...s, assumptionsOpen: !s.assumptionsOpen } : s
      )
    );
  };

  // Toggle outputs open/closed
  const toggleOutputs = (scenarioId: number) => {
    setScenarios((prev) =>
      prev.map((s) =>
        s.id === scenarioId ? { ...s, outputsOpen: !s.outputsOpen } : s
      )
    );
  };

  // Add scenario
  const addScenario = () => {
    const newId = Math.max(...scenarios.map((s) => s.id)) + 1;
    setScenarios((prev) => [
      ...prev,
      {
        id: newId,
        name: `Scenario ${newId}`,
        isOpen: false,
        assumptionsOpen: true,
        outputsOpen: false,
      },
    ]);
  };

  // Delete scenario
  const deleteScenario = (id: number) => {
    if (scenarios.length <= 1) return;
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  // Duplicate scenario
  const duplicateScenario = (id: number) => {
    const source = scenarios.find((s) => s.id === id);
    if (!source) return;
    const newId = Math.max(...scenarios.map((s) => s.id)) + 1;
    setScenarios((prev) => [
      ...prev,
      { ...source, id: newId, name: `${source.name} (copy)`, isOpen: false },
    ]);
  };

  // Error count per assumption item
  const getErrorCount = (itemId: string) => {
    if (itemId === 'period') {
      let errors = 0;
      if (!startDate) errors++;
      if (!endDate) errors++;
      if (operatingDays <= 0) errors++;
      if (startupDuration <= 0) errors++;
      return errors;
    }
    if (itemId === 'fleet') {
      return fleetEntries.length === 0 ? 1 : 0;
    }
    return 0;
  };

  const totalErrors = ASSUMPTION_ITEMS.reduce(
    (sum, item) => sum + getErrorCount(item.id),
    0
  );

  return (
    <div className="study-page">
      <AppHeader
        appName="Airline Business Planner"
        logoHref="/"
        actions={
          <>
            <IconButton icon="notifications" size="M" variant="Ghost" alt="Notifications" />
            <IconButton icon="settings" size="M" variant="Ghost" alt="Settings" />
            <IconButton icon="apps" size="M" variant="Ghost" alt="Apps" />
            <Button
              label="Mark Thompson"
              rightIcon="account_circle"
              variant="Ghost"
              size="M"
            />
          </>
        }
      />

      <div className="study-page__layout">
        {/* Left Panel */}
        <LeftPanel
          header={
            <PanelHeader
              workspaceName="Workspace Name"
              studyName="Study Name"
              onBackHome={() => navigate('/')}
              onStudyNameClick={() => console.log('Edit study name')}
              onDuplicate={() => console.log('Duplicate study')}
            />
          }
        >
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="study-page__scenario">
              <PanelGroup
                label={scenario.name}
                open={scenario.isOpen}
                size="S"
                onClick={() => toggleScenario(scenario.id)}
                actions={
                  <>
                    <IconButton
                      icon="edit"
                      size="XS"
                      variant="Ghost"
                      alt="Edit Name"
                      onClick={() => console.log('Edit', scenario.name)}
                    />
                    <IconButton
                      icon="content_copy"
                      size="XS"
                      variant="Ghost"
                      alt="Duplicate Scenario"
                      onClick={() => duplicateScenario(scenario.id)}
                    />
                    <IconButton
                      icon="delete"
                      size="XS"
                      variant="Ghost"
                      alt="Delete Scenario"
                      onClick={() => deleteScenario(scenario.id)}
                    />
                  </>
                }
              />

              {scenario.isOpen && (
                <div className="study-page__scenario-content">
                  {/* Assumptions */}
                  <PanelGroup
                    label="Assumptions"
                    open={scenario.assumptionsOpen}
                    size="XS"
                    onClick={() => toggleAssumptions(scenario.id)}
                  />
                  {scenario.assumptionsOpen &&
                    ASSUMPTION_ITEMS.map((item) => {
                      const errorCount = getErrorCount(item.id);
                      const periodErrors = getErrorCount('period');
                      const isSelected =
                        selectedItem.scenarioId === scenario.id &&
                        selectedItem.itemId === item.id;
                      const isDisabled = item.id !== 'period' && periodErrors > 0;
                      return (
                        <PanelButton
                          key={item.id}
                          label={item.label}
                          icon={item.icon}
                          size="XS"
                          variant={isDisabled ? 'Disabled' : isSelected ? 'Selected' : 'Default'}
                          showError={errorCount > 0}
                          errorCount={errorCount}
                          onClick={() => {
                            if (!isDisabled) {
                              setSelectedItem({
                                scenarioId: scenario.id,
                                itemId: item.id,
                              });
                            }
                          }}
                        />
                      );
                    })}

                  {/* Outputs */}
                  <PanelGroup
                    label="Outputs"
                    open={scenario.outputsOpen}
                    size="XS"
                    onClick={() => toggleOutputs(scenario.id)}
                  />
                  {scenario.outputsOpen &&
                    OUTPUT_ITEMS.map((item) => {
                      const isSelected =
                        selectedItem.scenarioId === scenario.id &&
                        selectedItem.itemId === item.id;
                      const outputsDisabled = studyStatus !== 'computed';
                      return (
                        <PanelButton
                          key={item.id}
                          label={item.label}
                          icon={item.icon}
                          size="XS"
                          variant={outputsDisabled ? 'Disabled' : isSelected ? 'Selected' : 'Default'}
                          onClick={() => {
                            if (!outputsDisabled) {
                              setSelectedItem({
                                scenarioId: scenario.id,
                                itemId: item.id,
                              });
                            }
                          }}
                        />
                      );
                    })}
                </div>
              )}
            </div>
          ))}

          {/* Add Scenario Button */}
          <button
            type="button"
            className="study-page__add-scenario"
            onClick={addScenario}
          >
            <Icon name="add" size={16} color="#ffffff" />
            <span>ADD SCENARIO</span>
          </button>
        </LeftPanel>

        {/* Main Content */}
        <div className="study-page__main">
          {/* Period content */}
          {selectedItem.itemId === 'period' && (
            <div className="study-page__content">
              <h1 className="study-page__title">Simulation Period</h1>

              <div className="study-page__form-row">
                <Calendar
                  label="Start Date"
                  placeholder="Select a month"
                  mode="month"
                  value={startDate}
                  onChange={setStartDate}
                  state={!startDate ? 'Error' : 'Default'}
                  showLegend={!startDate}
                  legend="Required"
                />
                <Calendar
                  label="End Date"
                  placeholder="Select a month"
                  mode="month"
                  value={endDate}
                  onChange={setEndDate}
                  state={!endDate ? 'Error' : 'Default'}
                  showLegend={!endDate}
                  legend="Required"
                />
                <NumberInput
                  label="Av. A/C Operating Days per Year"
                  placeholder="Enter a value"
                  value={operatingDays}
                  onChange={(v) => setOperatingDays(Math.max(0, v))}
                  size="M"
                  min={0}
                  state={operatingDays <= 0 ? 'Error' : 'Default'}
                  showLegend={operatingDays <= 0}
                  legend="Value must be greater than 0"
                />
                <NumberInput
                  label="Startup Period Duration (months)"
                  placeholder="Enter a value"
                  value={startupDuration}
                  onChange={(v) => setStartupDuration(Math.max(0, v))}
                  size="M"
                  min={0}
                  state={startupDuration <= 0 ? 'Error' : 'Default'}
                  showLegend={startupDuration <= 0}
                  legend="Value must be greater than 0"
                  showInfo
                  infoText="Period from company inception down to 1st commercial flight"
                />
              </div>
            </div>
          )}

          {/* Fleet content */}
          {selectedItem.itemId === 'fleet' && (
            <div className="study-page__fleet">
              {/* Fleet sub-tabs */}
              <div className="study-page__fleet-tabs">
                <Tab
                  label="Fleet"
                  size="M"
                  status={fleetTab === 'fleet' ? 'Active' : 'Default'}
                  onClick={() => setFleetTab('fleet')}
                />
                <Tab
                  label="Ownership"
                  size="M"
                  status={hasAircraft && fleetTab === 'ownership' ? 'Active' : 'Default'}
                  disabled={!hasAircraft}
                  onClick={() => { if (hasAircraft) setFleetTab('ownership'); }}
                />
                <Tab
                  label="Crew Configuration"
                  size="M"
                  status={hasAircraft && fleetTab === 'crew' ? 'Active' : 'Default'}
                  disabled={!hasAircraft}
                  onClick={() => { if (hasAircraft) setFleetTab('crew'); }}
                />
              </div>

              {/* Fleet tab content */}
              {fleetTab === 'fleet' && (
                <div className="study-page__fleet-content">
                  {/* Title bar */}
                  <div className="study-page__fleet-title-bar">
                    <h2 className="study-page__fleet-title">Fleet</h2>
                    <div className="study-page__fleet-title-right">
                      <span className="study-page__fleet-entry-count">
                        {fleetEntries.length} Entries
                      </span>
                      <TextInput
                        placeholder="Search"
                        size="S"
                        showLeftIcon
                        leftIcon="search"
                        showLabel={false}
                        value={fleetSearchValue}
                        onChange={(e) => setFleetSearchValue(e.target.value)}
                        className="study-page__fleet-search"
                      />
                    </div>
                    <div className="study-page__fleet-actions">
                      <IconButton
                        icon="add"
                        size="S"
                        variant="Outlined"
                        alt="Add Aircraft"
                        onClick={() => console.log('Add aircraft')}
                      />
                      <Button
                        label=""
                        leftIcon="download"
                        rightIcon="arrow_drop_down"
                        variant="Outlined"
                        size="S"
                        onClick={() => console.log('Import fleet')}
                      />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="study-page__fleet-table">
                    {/* Table header */}
                    <div className="study-page__fleet-table-header">
                      <div className="study-page__fleet-col study-page__fleet-col--checkbox">
                        <Checkbox size="S" showLabel={false} state="Disabled" />
                      </div>
                      <div className="study-page__fleet-col study-page__fleet-col--flex">
                        <span className="study-page__fleet-col-label">A/C Type</span>
                      </div>
                      <div className="study-page__fleet-col study-page__fleet-col--flex">
                        <span className="study-page__fleet-col-label">Engine</span>
                      </div>
                      <div className="study-page__fleet-col study-page__fleet-col--flex">
                        <span className="study-page__fleet-col-label">Layout</span>
                      </div>
                      <div className="study-page__fleet-col study-page__fleet-col--fixed">
                        <span className="study-page__fleet-col-label">Number of AC</span>
                      </div>
                      <div className="study-page__fleet-col study-page__fleet-col--fixed">
                        <span className="study-page__fleet-col-label">Enter in Service</span>
                      </div>
                    </div>

                    {/* Table body — empty state */}
                    <div className="study-page__fleet-table-body">
                      {fleetEntries.length === 0 && (
                        <div className="study-page__fleet-empty">
                          <div className="study-page__fleet-empty-icon">
                            <Icon name="inventory_2" size={96} color="var(--text-secondary, #919cb0)" />
                          </div>
                          <div className="study-page__fleet-empty-text">
                            <h3 className="study-page__fleet-empty-title">Your Fleet is empty</h3>
                            <p className="study-page__fleet-empty-description">
                              Please add flights or import a fleet
                            </p>
                          </div>
                          <div className="study-page__fleet-empty-actions">
                            <Button
                              label="ADD AIRCRAFT"
                              leftIcon="add"
                              variant="Outlined"
                              size="M"
                              onClick={() => console.log('Add aircraft')}
                            />
                            <Button
                              label="IMPORT FLEET"
                              leftIcon="download"
                              variant="Default"
                              size="M"
                              onClick={() => console.log('Import fleet')}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Floating Status Bar — hidden when computed */}
          {studyStatus !== 'computed' && (
            <StudyStatusBar
              status={
                studyStatus === 'computing'
                  ? 'Computing'
                  : totalErrors > 0
                    ? 'NotReady'
                    : 'Ready'
              }
              title={
                studyStatus === 'computing'
                  ? 'Computing study…'
                  : totalErrors > 0
                    ? `${totalErrors} Input${totalErrors > 1 ? 's' : ''} missing`
                    : 'All inputs filled'
              }
              description={
                studyStatus === 'computing'
                  ? 'Please wait while the study is being computed.'
                  : totalErrors > 0
                    ? 'Please fill missing inputs to compute the study.'
                    : 'Ready to compute the study.'
              }
              actions={
                studyStatus !== 'computing' ? (
                  <Button
                    label="COMPUTE STUDY"
                    variant="Default"
                    size="M"
                    disabled={totalErrors > 0}
                    onClick={handleCompute}
                  />
                ) : undefined
              }
              className="study-page__floating-status"
            />
          )}
        </div>
      </div>
    </div>
  );
}
