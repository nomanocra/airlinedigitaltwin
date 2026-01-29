import { useState, useEffect } from 'react';
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
import './StudyPage.css';

// Assumption items configuration
const ASSUMPTION_ITEMS = [
  { id: 'period', label: 'Period', icon: 'calendar_month' },
  { id: 'fleet', label: 'Fleet', icon: 'flight' },
  { id: 'network', label: 'Network', icon: 'share' },
  { id: 'load-factor', label: 'Load factor', icon: 'hail' },
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
                      const outputsDisabled = totalErrors > 0;
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

          {/* Floating Status Bar */}
          <StudyStatusBar
            status={totalErrors > 0 ? 'NotReady' : 'Ready'}
            title={
              totalErrors > 0
                ? `${totalErrors} Input${totalErrors > 1 ? 's' : ''} missing`
                : 'All inputs filled'
            }
            description={
              totalErrors > 0
                ? 'Please fill missing inputs to compute the study.'
                : 'Ready to compute the study.'
            }
            actions={
              <Button
                label="COMPUTE STUDY"
                variant="Default"
                size="M"
                disabled={totalErrors > 0}
              />
            }
            className="study-page__floating-status"
          />
        </div>
      </div>
    </div>
  );
}
