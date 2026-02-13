import { useState, useEffect } from 'react';
import { Modal } from '@/design-system/composites/Modal';
import { Button } from '@/design-system/components/Button';
import { NumberInput } from '@/design-system/components/NumberInput';
import { Calendar } from '@/design-system/composites/Calendar';
import { Select } from '@/design-system/components/Select';
import { Icon } from '@/design-system/components/Icon';
import {
  AircraftSelector,
  type AircraftTreeNode,
  type PerformanceSource,
} from '@/design-system/composites/AircraftSelector';
import { SAMPLE_AIRCRAFT_DATA, AIRCRAFT_CONFIGS, getSummaryFromPath, getDefaultTechnicalConfig } from '../data/aircraftDatabase';
import './AddAircraftModal.css';

export interface FleetEntry {
  id: string;
  aircraftType: string;
  engine: string;
  layout: string;
  numberOfAircraft: number;
  enterInService: Date;
  retirement?: Date;
  ownership: 'Owned' | 'Leased';
}

interface RelativeMonthOption {
  value: string;
  label: string;
}

interface AddAircraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAircraft: (aircraft: FleetEntry) => void;
  periodType?: 'dates' | 'duration';
  relativeMonthOptions?: RelativeMonthOption[];
}

// Ownership options
const OWNERSHIP_OPTIONS = [
  { value: 'Owned', label: 'Owned' },
  { value: 'Leased', label: 'Leased' },
];

export function AddAircraftModal({ isOpen, onClose, onAddAircraft, periodType = 'dates', relativeMonthOptions = [] }: AddAircraftModalProps) {
  // Step 1: Aircraft selection state
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [selectedPath, setSelectedPath] = useState<AircraftTreeNode[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [perfSource, setPerfSource] = useState<PerformanceSource>('FMS');

  // Step state
  const [step, setStep] = useState<1 | 2>(1);

  // Step 2: Fleet details state
  const [numberOfAircraft, setNumberOfAircraft] = useState(1);
  const [entryIntoService, setEntryIntoService] = useState<Date | undefined>(undefined);
  const [retirement, setRetirement] = useState<Date | undefined>(undefined);
  const [ownership, setOwnership] = useState<'Owned' | 'Leased'>('Leased');

  // Get aircraft data based on selection
  // Summary always comes from tree path (single source of truth)
  const summary = selectedPath.length > 0 ? getSummaryFromPath(selectedPath) : null;
  const technicalData = selectedNodeId
    ? AIRCRAFT_CONFIGS[selectedNodeId] || getDefaultTechnicalConfig()
    : null;
  const aircraftData = summary && technicalData
    ? { summary, config: technicalData.config, performance: technicalData.performance }
    : null;

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedNodeId(undefined);
      setSelectedPath([]);
      setActiveTab(0);
      setPerfSource('FMS');
      setStep(1);
      setNumberOfAircraft(1);
      setEntryIntoService(undefined);
      setRetirement(undefined);
      setOwnership('Leased');
    }
  }, [isOpen]);

  const handleSelect = (nodeId: string, path: AircraftTreeNode[]) => {
    setSelectedNodeId(nodeId);
    setSelectedPath(path);
  };

  const handleNext = () => {
    if (selectedNodeId) {
      setStep(2);
    }
  };

  const handlePrevious = () => {
    setStep(1);
  };

  const handleAddAircraft = () => {
    if (!aircraftData || !selectedNodeId || !entryIntoService) return;

    const newEntry: FleetEntry = {
      id: `fleet-${Date.now()}`,
      aircraftType: aircraftData.summary.family,
      engine: aircraftData.summary.engine,
      layout: aircraftData.summary.layout,
      numberOfAircraft,
      enterInService: entryIntoService,
      retirement: retirement,
      ownership,
    };

    onAddAircraft(newEntry);
    onClose();
  };

  // Step 1: Select Aircraft
  if (step === 1) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Select Aircraft"
        className="add-aircraft-modal"
        footer={
          <>
            <Button label="CANCEL" variant="Ghost" size="M" onClick={onClose} />
            <Button
              label="NEXT"
              variant="Default"
              size="M"
              onClick={handleNext}
              disabled={!selectedNodeId}
            />
          </>
        }
      >
        <AircraftSelector
          sources={SAMPLE_AIRCRAFT_DATA}
          selectedNodeId={selectedNodeId}
          onSelect={handleSelect}
          summary={aircraftData?.summary}
          configData={aircraftData?.config}
          performanceData={aircraftData?.performance}
          onSourceChange={setPerfSource}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </Modal>
    );
  }

  // Step 2: Enter In Service
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enter In Service"
      className="add-aircraft-modal add-aircraft-modal--step2"
      footer={
        <>
          <Button label="PREVIOUS" variant="Ghost" size="M" onClick={handlePrevious} />
          <Button
            label="ADD AIRCRAFT"
            variant="Default"
            size="M"
            onClick={handleAddAircraft}
            disabled={!entryIntoService || numberOfAircraft < 1}
          />
        </>
      }
    >
      <div className="enter-service-content">
        {/* Selected Aircraft Summary */}
        <div className="enter-service-section">
          <span className="enter-service-label">Selected AC</span>
          <div className="enter-service-selected-ac">
            <div className="enter-service-ac-item">
              <Icon name="AIR_side" size={24} />
              <span>{aircraftData?.summary.family}</span>
            </div>
            <div className="enter-service-ac-item">
              <Icon name="AIR_engine" size={20} />
              <span>{aircraftData?.summary.engine}</span>
            </div>
            <div className="enter-service-ac-item">
              <Icon name="flight_class" size={20} />
              <span>{aircraftData?.summary.layout}</span>
            </div>
          </div>
        </div>

        {/* Form Fields - all 4 in one row */}
        <div className="enter-service-form">
          <NumberInput
            label="Number of AC"
            value={numberOfAircraft}
            onChange={(v) => setNumberOfAircraft(Math.max(1, v))}
            size="S"
            min={1}
            state={numberOfAircraft < 1 ? 'Error' : 'Default'}
          />
          {periodType === 'duration' ? (
            <Select
              label="Entry into Service"
              placeholder="Select"
              options={relativeMonthOptions}
              value={entryIntoService ? `${entryIntoService.getFullYear()}-${String(entryIntoService.getMonth() + 1).padStart(2, '0')}` : ''}
              onValueChange={(key) => {
                const [y, m] = key.split('-').map(Number);
                setEntryIntoService(new Date(y, m - 1, 1));
              }}
              size="S"
            />
          ) : (
            <Calendar
              label="Entry into Service"
              placeholder="Select a month"
              mode="month"
              value={entryIntoService}
              onChange={setEntryIntoService}
              size="S"
            />
          )}
          {periodType === 'duration' ? (
            <Select
              label="Retirement"
              placeholder="None"
              options={relativeMonthOptions}
              value={retirement ? `${retirement.getFullYear()}-${String(retirement.getMonth() + 1).padStart(2, '0')}` : ''}
              onValueChange={(key) => {
                if (key) {
                  const [y, m] = key.split('-').map(Number);
                  setRetirement(new Date(y, m - 1, 1));
                } else {
                  setRetirement(undefined);
                }
              }}
              size="S"
              showOptional
            />
          ) : (
            <Calendar
              label="Retirement"
              placeholder="None"
              mode="month"
              value={retirement}
              onChange={setRetirement}
              size="S"
              showOptional
            />
          )}
          <Select
            label="Ownership"
            options={OWNERSHIP_OPTIONS}
            value={ownership}
            onValueChange={(v) => setOwnership(v as 'Owned' | 'Leased')}
            size="S"
          />
        </div>
      </div>
    </Modal>
  );
}

export default AddAircraftModal;
