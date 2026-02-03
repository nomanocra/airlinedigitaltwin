import { useState, useEffect } from 'react';
import { Modal } from '@/design-system/composites/Modal';
import { Button } from '@/design-system/components/Button';
import {
  AircraftSelector,
  type AircraftSource,
  type AircraftSummary,
  type AircraftConfigData,
  type AircraftPerformanceData,
  type AircraftTreeNode,
  type PerformanceSource,
} from '@/design-system/composites/AircraftSelector';
import './AddAircraftModal.css';

// Sample aircraft data for RDM source
const SAMPLE_AIRCRAFT_DATA: AircraftSource[] = [
  {
    label: 'RDM',
    tree: [
      {
        id: 'airbus',
        label: 'Airbus',
        type: 'manufacturer',
        children: [
          {
            id: 'a320-family',
            label: 'A320 Family',
            type: 'family',
            children: [
              {
                id: 'a319',
                label: 'A319',
                type: 'type',
                children: [
                  {
                    id: 'a319-cfm56',
                    label: 'CFM56-5B',
                    type: 'engine',
                    children: [
                      { id: 'a319-cfm56-y140', label: 'Y140', type: 'layout', isDefault: true },
                      { id: 'a319-cfm56-c8y132', label: 'C8-Y132', type: 'layout' },
                    ],
                  },
                ],
              },
              {
                id: 'a320',
                label: 'A320',
                type: 'type',
                children: [
                  {
                    id: 'a320-cfm56-5a',
                    label: 'CFM56-5A',
                    type: 'engine',
                    children: [
                      { id: 'a320-cfm56-5a-y180', label: 'Y180', type: 'layout', isDefault: true },
                      { id: 'a320-cfm56-5a-f12y138', label: 'F12-Y138', type: 'layout' },
                    ],
                  },
                  {
                    id: 'a320-cfm56-5b',
                    label: 'CFM56-5B',
                    type: 'engine',
                    children: [
                      { id: 'a320-cfm56-5b-y180', label: 'Y180', type: 'layout', isDefault: true },
                      { id: 'a320-cfm56-5b-c12y150', label: 'C12-Y150', type: 'layout' },
                    ],
                  },
                ],
              },
              {
                id: 'a320neo',
                label: 'A320neo',
                type: 'type',
                children: [
                  {
                    id: 'a320neo-leap1a',
                    label: 'LEAP-1A',
                    type: 'engine',
                    children: [
                      { id: 'a320neo-leap1a-y194', label: 'Y194', type: 'layout', isDefault: true },
                      { id: 'a320neo-leap1a-j8y178', label: 'J8-Y178', type: 'layout' },
                    ],
                  },
                  {
                    id: 'a320neo-pw1100g',
                    label: 'PW1100G',
                    type: 'engine',
                    children: [
                      { id: 'a320neo-pw1100g-y194', label: 'Y194', type: 'layout', isDefault: true },
                    ],
                  },
                ],
              },
              {
                id: 'a321',
                label: 'A321',
                type: 'type',
                children: [
                  {
                    id: 'a321-cfm56-5b',
                    label: 'CFM56-5B',
                    type: 'engine',
                    children: [
                      { id: 'a321-cfm56-5b-y220', label: 'Y220', type: 'layout', isDefault: true },
                      { id: 'a321-cfm56-5b-c16y200', label: 'C16-Y200', type: 'layout' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'a330-family',
            label: 'A330 Family',
            type: 'family',
            children: [
              {
                id: 'a330-200',
                label: 'A330-200',
                type: 'type',
                children: [
                  {
                    id: 'a330-200-trent700',
                    label: 'Trent 700',
                    type: 'engine',
                    children: [
                      { id: 'a330-200-trent700-y293', label: 'Y293', type: 'layout', isDefault: true },
                      { id: 'a330-200-trent700-j30w21y222', label: 'J30-W21-Y222', type: 'layout' },
                    ],
                  },
                ],
              },
              {
                id: 'a330-300',
                label: 'A330-300',
                type: 'type',
                children: [
                  {
                    id: 'a330-300-trent700',
                    label: 'Trent 700',
                    type: 'engine',
                    children: [
                      { id: 'a330-300-trent700-y335', label: 'Y335', type: 'layout', isDefault: true },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'boeing',
        label: 'Boeing',
        type: 'manufacturer',
        children: [
          {
            id: 'b737-family',
            label: '737 Family',
            type: 'family',
            children: [
              {
                id: 'b737-800',
                label: '737-800',
                type: 'type',
                children: [
                  {
                    id: 'b737-800-cfm56-7b',
                    label: 'CFM56-7B',
                    type: 'engine',
                    children: [
                      { id: 'b737-800-cfm56-7b-y189', label: 'Y189', type: 'layout', isDefault: true },
                      { id: 'b737-800-cfm56-7b-c16y153', label: 'C16-Y153', type: 'layout' },
                    ],
                  },
                ],
              },
              {
                id: 'b737-max8',
                label: '737 MAX 8',
                type: 'type',
                children: [
                  {
                    id: 'b737-max8-leap1b',
                    label: 'LEAP-1B',
                    type: 'engine',
                    children: [
                      { id: 'b737-max8-leap1b-y189', label: 'Y189', type: 'layout', isDefault: true },
                      { id: 'b737-max8-leap1b-j16y163', label: 'J16-Y163', type: 'layout' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'b777-family',
            label: '777 Family',
            type: 'family',
            children: [
              {
                id: 'b777-200er',
                label: '777-200ER',
                type: 'type',
                children: [
                  {
                    id: 'b777-200er-ge90',
                    label: 'GE90-94B',
                    type: 'engine',
                    children: [
                      { id: 'b777-200er-ge90-y305', label: 'Y305', type: 'layout', isDefault: true },
                      { id: 'b777-200er-ge90-j42w24y227', label: 'J42-W24-Y227', type: 'layout' },
                    ],
                  },
                ],
              },
              {
                id: 'b777-300er',
                label: '777-300ER',
                type: 'type',
                children: [
                  {
                    id: 'b777-300er-ge90-115b',
                    label: 'GE90-115B',
                    type: 'engine',
                    children: [
                      { id: 'b777-300er-ge90-115b-y396', label: 'Y396', type: 'layout', isDefault: true },
                      { id: 'b777-300er-ge90-115b-j60w52y264', label: 'J60-W52-Y264', type: 'layout' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    label: 'Custom',
    tree: [],
  },
];

// Aircraft config data based on selected layout
const AIRCRAFT_CONFIGS: Record<string, { summary: AircraftSummary; config: AircraftConfigData; performance: AircraftPerformanceData }> = {
  'a320-cfm56-5a-f12y138': {
    summary: { family: 'A320-200', engine: 'CFM56-5A', layout: 'F12 - Y138' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 42600, mtw: 73500, mtow: 73500, mlw: 64500, mzfw: 61000, mfc: 24210 },
      cabin: { totalSeats: 150, firstSeats: 12, businessSeats: 0, premiumSeats: 0, ecoSeats: 138 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A320-214',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'a320-cfm56-5a-y180': {
    summary: { family: 'A320-200', engine: 'CFM56-5A', layout: 'Y180' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 42400, mtw: 73500, mtow: 73500, mlw: 64500, mzfw: 61000, mfc: 24210 },
      cabin: { totalSeats: 180, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 180 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A320-214',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'a320neo-leap1a-y194': {
    summary: { family: 'A320neo', engine: 'LEAP-1A', layout: 'Y194' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 44300, mtw: 79000, mtow: 79000, mlw: 67400, mzfw: 64300, mfc: 26730 },
      cabin: { totalSeats: 194, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 194 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A320-271N',
      globalDeterioration: 1.5,
      deteriorationPerPhase: { taxi: 0.5, takeOff: 1.5, climb: 1.5, cruise: 1.5, descent: 1.5, holding: 1.5, approachAndLanding: 1.5 },
    },
  },
  'b737-800-cfm56-7b-y189': {
    summary: { family: '737-800', engine: 'CFM56-7B', layout: 'Y189' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 41413, mtw: 79016, mtow: 79016, mlw: 66361, mzfw: 62732, mfc: 26020 },
      cabin: { totalSeats: 189, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 189 },
      cg: { centerOfGravity: 25 },
    },
    performance: {
      source: 'FMS',
      model: 'B737-8',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'b737-max8-leap1b-y189': {
    summary: { family: '737 MAX 8', engine: 'LEAP-1B', layout: 'Y189' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 45070, mtw: 82191, mtow: 82191, mlw: 69309, mzfw: 65952, mfc: 25816 },
      cabin: { totalSeats: 189, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 189 },
      cg: { centerOfGravity: 25 },
    },
    performance: {
      source: 'FMS',
      model: 'B737-8MAX',
      globalDeterioration: 1.5,
      deteriorationPerPhase: { taxi: 0.5, takeOff: 1.5, climb: 1.5, cruise: 1.5, descent: 1.5, holding: 1.5, approachAndLanding: 1.5 },
    },
  },
};

// Default config for aircraft not in the AIRCRAFT_CONFIGS map
const getDefaultConfig = (path: AircraftTreeNode[]): { summary: AircraftSummary; config: AircraftConfigData; performance: AircraftPerformanceData } => {
  const type = path.find(n => n.type === 'type')?.label || 'Unknown';
  const engine = path.find(n => n.type === 'engine')?.label || 'Unknown';
  const layout = path.find(n => n.type === 'layout')?.label || 'Unknown';

  return {
    summary: { family: type, engine, layout },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 40000, mtw: 70000, mtow: 70000, mlw: 60000, mzfw: 55000, mfc: 20000 },
      cabin: { totalSeats: 150, firstSeats: 0, businessSeats: 0, premiumSeats: 24, ecoSeats: 126 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: type,
      globalDeterioration: 2.0,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.0, cruise: 2.0, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  };
};

export interface FleetEntry {
  id: string;
  aircraftType: string;
  engine: string;
  layout: string;
  numberOfAircraft: number;
  enterInService: Date;
}

interface AddAircraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAircraft: (aircraft: FleetEntry) => void;
}

export function AddAircraftModal({ isOpen, onClose, onAddAircraft }: AddAircraftModalProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [selectedPath, setSelectedPath] = useState<AircraftTreeNode[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [perfSource, setPerfSource] = useState<PerformanceSource>('FMS');

  // Get aircraft data based on selection
  const aircraftData = selectedNodeId
    ? AIRCRAFT_CONFIGS[selectedNodeId] || getDefaultConfig(selectedPath)
    : null;

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedNodeId(undefined);
      setSelectedPath([]);
      setActiveTab(0);
      setPerfSource('FMS');
    }
  }, [isOpen]);

  const handleSelect = (nodeId: string, path: AircraftTreeNode[]) => {
    setSelectedNodeId(nodeId);
    setSelectedPath(path);
  };

  const handleAddAircraft = () => {
    if (!aircraftData || !selectedNodeId) return;

    const newEntry: FleetEntry = {
      id: `fleet-${Date.now()}`,
      aircraftType: aircraftData.summary.family,
      engine: aircraftData.summary.engine,
      layout: aircraftData.summary.layout,
      numberOfAircraft: 1,
      enterInService: new Date(),
    };

    onAddAircraft(newEntry);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Aircraft"
      className="add-aircraft-modal"
      footer={
        <>
          <Button label="CANCEL" variant="Ghost" size="M" onClick={onClose} />
          <Button
            label="ADD AIRCRAFT"
            variant="Default"
            size="M"
            onClick={handleAddAircraft}
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

export default AddAircraftModal;
