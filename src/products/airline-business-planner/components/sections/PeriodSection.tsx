import { NumberInput } from '@/design-system/components/NumberInput';
import { Calendar } from '@/design-system/composites/Calendar';
import { ButtonGroup } from '@/design-system/components/ButtonGroup';

export interface PeriodSectionProps {
  periodType: 'dates' | 'duration';
  startDate: Date | undefined;
  endDate: Date | undefined;
  simulationYears: number;
  operatingDays: number;
  startupDuration: number;
  onPeriodTypeChange: (newType: string) => void;
  onStartDateChange: (v: Date | undefined) => void;
  onEndDateChange: (v: Date | undefined) => void;
  onSimulationYearsChange: (v: number) => void;
  onOperatingDaysChange: (v: number) => void;
  onStartupDurationChange: (v: number) => void;
}

export function PeriodSection({
  periodType,
  startDate,
  endDate,
  simulationYears,
  operatingDays,
  startupDuration,
  onPeriodTypeChange,
  onStartDateChange,
  onEndDateChange,
  onSimulationYearsChange,
  onOperatingDaysChange,
  onStartupDurationChange,
}: PeriodSectionProps) {
  return (
    <div className="study-page__content">
      <h1 className="study-page__title">General Settings</h1>

      <div className="study-page__section">
        <h2 className="study-page__section-title">Simulation Period</h2>
        <div className="study-page__form-row study-page__form-row--narrow">
          <div className="study-page__field">
            <span className="study-page__field-label">Period Type</span>
            <ButtonGroup
              options={[
                { label: 'Dates', value: 'dates' },
                { label: 'Duration', value: 'duration' },
              ]}
              value={periodType}
              onChange={onPeriodTypeChange}
            />
          </div>
          {periodType === 'dates' ? (
            <>
              <Calendar
                label="Start Date"
                placeholder="Select a month"
                mode="month"
                value={startDate}
                onChange={onStartDateChange}
                state={!startDate ? 'Error' : 'Default'}
                showLegend={!startDate}
                legend="Required"
              />
              <Calendar
                label="End Date"
                placeholder="Select a month"
                mode="month"
                value={endDate}
                onChange={onEndDateChange}
                state={!endDate ? 'Error' : 'Default'}
                showLegend={!endDate}
                legend="Required"
              />
            </>
          ) : (
            <NumberInput
              label="Number of Years Simulated"
              placeholder="Enter a value"
              value={simulationYears}
              onChange={(v) => onSimulationYearsChange(Math.max(1, v))}
              size="M"
              min={1}
            />
          )}
        </div>
      </div>

      <div className="study-page__section">
        <h2 className="study-page__section-title">Other</h2>
        <div className="study-page__form-row">
          <NumberInput
            label="Av. A/C Operating Days per Year"
            placeholder="Enter a value"
            value={operatingDays}
            onChange={(v) => onOperatingDaysChange(Math.max(0, v))}
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
            onChange={(v) => onStartupDurationChange(Math.max(0, v))}
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
    </div>
  );
}
