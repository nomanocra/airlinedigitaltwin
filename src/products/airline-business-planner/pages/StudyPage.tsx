import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ICellRendererParams, type ColDef } from 'ag-grid-community';
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
import { TextInput } from '@/design-system/components/TextInput';
import { Select } from '@/design-system/components/Select';
import { EmptyState } from '@/design-system/composites/EmptyState';
import { ButtonGroup } from '@/design-system/components/ButtonGroup';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/design-system/components/Tooltip';
import { AddAircraftModal, type FleetEntry } from '../components/AddAircraftModal';
import { AddRouteModal } from '../components/AddRouteModal';
import '@/design-system/tokens/ag-grid-theme.css';
import './StudyPage.css';

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Fleet sub-tab types
type FleetTabType = 'fleet' | 'cost-operations' | 'cost-ownership' | 'crew';
type FleetViewMode = 'table' | 'gantt';
type NetworkTabType = 'routes' | 'pricing' | 'fleet-plan' | 'frequencies';

// Fleet Cost Operations
interface FleetCostOperationsEntry {
  id: string;
  groundHandlingCharge: number;  // USD/sector
  fuelAgeingFactor: number;      // %
}

// Fleet Cost Ownership
interface FleetCostOwnershipEntry {
  id: string;
  monthlyLeaseRate: number;
  acValueUponAcquisition: number;
  sparesProvisioningPerFamily: number;
  // monthlyInsurance = acValueUponAcquisition * 0.01 / 12 (calculated)
}

// Crew Configuration
interface CrewConfigEntry {
  id: string;
  captainPerCrew: number;
  firstOfficerPerCrew: number;
  cabinManagerPerCrew: number;
  cabinAttendantPerCrew: number;
}

// Routes
interface RouteEntry {
  id: string;
  origin: string;
  destination: string;
  startDate: Date;
  endDate: Date;
}

// Pricing
interface RoutePricingEntry {
  routeId: string;
  marketYield: number;
  discountStrategy: string;
  yield: number;
  fare: number;  // calculated
}

// Fleet Plan
interface FleetPlanEntry {
  routeId: string;
  allocatedAircraftId: string | null;
}

// Frequencies
interface RouteFrequencyEntry {
  routeId: string;
  frequencies: Record<string, number>;  // "YYYY-MM" -> count
}

// Gantt Row (expanded)
interface GanttAircraftRow {
  id: string;
  fleetEntryId: string;
  aircraftIndex: number;  // 1, 2, 3...
  aircraftType: string;
  engine: string;
  layout: string;
  enterInService: Date;
  retirement?: Date;
  ownership: 'Owned' | 'Leased';
}

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
  const location = useLocation();
  const locationState = location.state as {
    studyName?: string;
    workspaceName?: string;
    studyData?: {
      status: string;
      startDate: string;
      endDate: string;
      fleet?: Array<{
        id: string;
        aircraftType: string;
        engine: string;
        layout: string;
        numberOfAircraft: number;
        enterInService: string;
      }>;
      routes?: Array<{
        id: string;
        origin: string;
        destination: string;
        startDate: string;
        endDate: string;
      }>;
    };
  } | null;
  const studyName = locationState?.studyName || 'Study Name';
  const workspaceName = locationState?.workspaceName || 'Workspace Name';
  const studyData = locationState?.studyData;

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

  // Helper to parse date strings like "Jan 01, 2026"
  const parseDate = (dateStr: string | undefined): Date | undefined => {
    if (!dateStr) return undefined;
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

  // Form state (Simulation Period) - pre-fill if studyData exists
  const [startDate, setStartDate] = useState<Date | undefined>(() => parseDate(studyData?.startDate));
  const [endDate, setEndDate] = useState<Date | undefined>(() => parseDate(studyData?.endDate));
  const [operatingDays, setOperatingDays] = useState<number>(studyData ? 365 : 0);
  const [startupDuration, setStartupDuration] = useState<number>(studyData ? 6 : 0);

  // Fleet sub-tab state
  const [fleetTab, setFleetTab] = useState<FleetTabType>('fleet');
  const [fleetViewMode, setFleetViewMode] = useState<FleetViewMode>('table');
  const [fleetSearchValue, setFleetSearchValue] = useState('');

  // Fleet cost and crew data
  const [costOperationsData, setCostOperationsData] = useState<FleetCostOperationsEntry[]>([]);
  const [costOwnershipData, setCostOwnershipData] = useState<FleetCostOwnershipEntry[]>([]);
  const [crewConfigData, setCrewConfigData] = useState<CrewConfigEntry[]>([]);

  // Network tab state
  const [networkTab, setNetworkTab] = useState<NetworkTabType>('routes');
  const [routeEntries, setRouteEntries] = useState<RouteEntry[]>(() => {
    if (studyData?.routes) {
      return studyData.routes.map(r => ({
        id: r.id,
        origin: r.origin,
        destination: r.destination,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate),
      }));
    }
    return [];
  });
  const [routePricingData, setRoutePricingData] = useState<RoutePricingEntry[]>([]);
  const [fleetPlanData, setFleetPlanData] = useState<FleetPlanEntry[]>([]);
  const [routeFrequencyData, setRouteFrequencyData] = useState<RouteFrequencyEntry[]>([]);
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
  const [discountForNormalFares, setDiscountForNormalFares] = useState<number>(0);

  // Fleet data - pre-fill if studyData exists
  const [fleetEntries, setFleetEntries] = useState<FleetEntry[]>(() => {
    if (studyData?.fleet) {
      return studyData.fleet.map((f, index) => ({
        id: f.id,
        aircraftType: f.aircraftType,
        engine: f.engine,
        layout: f.layout,
        numberOfAircraft: f.numberOfAircraft,
        enterInService: new Date(f.enterInService),
        retirement: f.retirement ? new Date(f.retirement) : undefined,
        ownership: (index % 2 === 0 ? 'Owned' : 'Leased') as const,
      }));
    }
    return [];
  });
  const [isAddAircraftModalOpen, setIsAddAircraftModalOpen] = useState(false);
  const [selectedAircraftIds, setSelectedAircraftIds] = useState<Set<string>>(new Set());
  const hasAircraft = fleetEntries.length > 0;

  // Filter fleet entries by search
  const filteredFleetEntries = fleetSearchValue.trim()
    ? fleetEntries.filter((entry) =>
        [entry.aircraftType, entry.engine, entry.layout]
          .some((field) => field.toLowerCase().includes(fleetSearchValue.toLowerCase()))
      )
    : fleetEntries;

  // Selection helpers
  const allSelected = hasAircraft && selectedAircraftIds.size === filteredFleetEntries.length && filteredFleetEntries.every(e => selectedAircraftIds.has(e.id));
  const someSelected = selectedAircraftIds.size > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedAircraftIds(new Set());
    } else {
      setSelectedAircraftIds(new Set(filteredFleetEntries.map(e => e.id)));
    }
  };

  const toggleSelectAircraft = (id: string) => {
    setSelectedAircraftIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Add aircraft handler
  const handleAddAircraft = (aircraft: FleetEntry) => {
    setFleetEntries((prev) => [...prev, aircraft]);
  };

  // Delete selected aircraft
  const handleDeleteSelected = () => {
    setFleetEntries((prev) => prev.filter((e) => !selectedAircraftIds.has(e.id)));
    setSelectedAircraftIds(new Set());
  };

  // Duplicate selected aircraft
  const handleDuplicateSelected = () => {
    const selectedEntries = fleetEntries.filter((e) => selectedAircraftIds.has(e.id));
    const duplicates = selectedEntries.map((entry) => ({
      ...entry,
      id: `${entry.id}-copy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
    setFleetEntries((prev) => [...prev, ...duplicates]);
    setSelectedAircraftIds(new Set());
  };

  // AG Grid: Custom cell renderer for NumberInput
  const NumberInputCellRenderer = (props: ICellRendererParams) => {
    const handleChange = (newValue: number) => {
      props.node.setDataValue(props.colDef?.field || '', newValue);
      setFleetEntries((prev) =>
        prev.map((e) =>
          e.id === props.data.id ? { ...e, numberOfAircraft: Math.max(1, newValue) } : e
        )
      );
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <NumberInput
          value={props.value}
          onChange={handleChange}
          size="S"
          min={1}
          showLabel={false}
          variant="Stepper"
        />
      </div>
    );
  };

  // AG Grid: Custom cell renderer for Enter in Service (Calendar)
  const EnterInServiceCellRenderer = (props: ICellRendererParams) => {
    const handleChange = (newValue: Date | undefined) => {
      if (newValue) {
        props.node.setDataValue(props.colDef?.field || '', newValue);
        setFleetEntries((prev) =>
          prev.map((e) =>
            e.id === props.data.id ? { ...e, enterInService: newValue } : e
          )
        );
      }
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <Calendar
          value={props.value instanceof Date ? props.value : undefined}
          onChange={handleChange}
          mode="month"
          size="S"
          showLabel={false}
          placeholder="Select"
        />
      </div>
    );
  };

  // AG Grid: Custom cell renderer for Retirement (Calendar, optional)
  const RetirementCellRenderer = (props: ICellRendererParams) => {
    const handleChange = (newValue: Date | undefined) => {
      props.node.setDataValue(props.colDef?.field || '', newValue);
      setFleetEntries((prev) =>
        prev.map((e) =>
          e.id === props.data.id ? { ...e, retirement: newValue } : e
        )
      );
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <Calendar
          value={props.value instanceof Date ? props.value : undefined}
          onChange={handleChange}
          mode="month"
          size="S"
          showLabel={false}
          placeholder="None"
        />
      </div>
    );
  };

  // AG Grid: Custom cell renderer for Ownership (Select)
  const OwnershipCellRenderer = (props: ICellRendererParams) => {
    const handleChange = (newValue: string) => {
      props.node.setDataValue(props.colDef?.field || '', newValue);
      setFleetEntries((prev) =>
        prev.map((e) =>
          e.id === props.data.id ? { ...e, ownership: newValue as 'Owned' | 'Leased' } : e
        )
      );
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <Select
          value={props.value}
          onValueChange={handleChange}
          options={[
            { value: 'Owned', label: 'Owned' },
            { value: 'Leased', label: 'Leased' },
          ]}
          size="S"
          showLabel={false}
        />
      </div>
    );
  };

  // Utility: Generate month columns from start to end date
  const generateMonthColumns = useCallback((start: Date | undefined, end: Date | undefined): ColDef[] => {
    if (!start || !end) return [];
    const columns: ColDef[] = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endDate = new Date(end.getFullYear(), end.getMonth(), 1);
    while (current <= endDate) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      columns.push({
        field: key,
        headerName: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        flex: 1,
        minWidth: 100,
      });
      current.setMonth(current.getMonth() + 1);
    }
    return columns;
  }, []);

  // Gantt rows: expand fleet entries by numberOfAircraft
  const ganttRows = useMemo<GanttAircraftRow[]>(() =>
    fleetEntries.flatMap(entry =>
      Array.from({ length: entry.numberOfAircraft }, (_, i) => ({
        id: `${entry.id}-${i + 1}`,
        fleetEntryId: entry.id,
        aircraftIndex: i + 1,
        aircraftType: entry.aircraftType,
        engine: entry.engine,
        layout: entry.layout,
        enterInService: entry.enterInService,
        retirement: entry.retirement,
        ownership: entry.ownership,
      }))
    ), [fleetEntries]
  );

  // Gantt timeline cell renderer — single column with positioned bar + tooltip
  const GanttTimelineCellRenderer = (props: ICellRendererParams<GanttAircraftRow>) => {
    const { data } = props;
    if (!data || !startDate || !endDate) return null;

    const timelineStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1).getTime();
    const timelineEnd = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getTime();
    const totalDuration = timelineEnd - timelineStart;
    if (totalDuration <= 0) return null;

    const enter = data.enterInService instanceof Date ? data.enterInService : new Date(data.enterInService);
    const enterTime = Math.max(new Date(enter.getFullYear(), enter.getMonth(), 1).getTime(), timelineStart);

    let retireTime: number;
    let retireLabel: string;
    if (data.retirement) {
      const ret = data.retirement instanceof Date ? data.retirement : new Date(data.retirement);
      retireTime = Math.min(new Date(ret.getFullYear(), ret.getMonth() + 1, 0).getTime(), timelineEnd);
      retireLabel = ret.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else {
      retireTime = timelineEnd;
      retireLabel = 'No retirement';
    }

    const leftPct = ((enterTime - timelineStart) / totalDuration) * 100;
    const widthPct = ((retireTime - enterTime) / totalDuration) * 100;

    if (widthPct <= 0) return null;

    const enterLabel = enter.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return (
      <div className="gantt-timeline-cell">
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <div
              className="gantt-bar"
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                opacity: data.ownership === 'Leased' ? 0.5 : undefined,
              }}
            />
          </TooltipTrigger>
          <TooltipContent side="top" arrow>
            <div className="gantt-tooltip">
              <span className="gantt-tooltip__type">{data.aircraftType}</span>
              <div className="gantt-tooltip__row">
                <Icon name="event" size={14} color="var(--text-secondary)" />
                <span>{enterLabel} → {retireLabel}</span>
              </div>
              <div className="gantt-tooltip__row">
                <Icon name="description" size={14} color="var(--text-secondary)" />
                <span>{data.ownership}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  };

  // Gantt: build timeline header from period
  const ganttTimelineHeader = useMemo(() => {
    if (!startDate || !endDate) return '';
    const s = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const e = endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${s} — ${e}`;
  }, [startDate, endDate]);

  // Gantt column definitions
  const ganttColDefs = useMemo<ColDef[]>(() => [
    { field: 'aircraftType', headerName: 'A/C Type', width: 120 },
    { field: 'engine', headerName: 'Engine', width: 100 },
    { field: 'layout', headerName: 'Layout', width: 80 },
    {
      field: 'timeline',
      headerName: ganttTimelineHeader,
      flex: 1,
      minWidth: 300,
      cellRenderer: GanttTimelineCellRenderer,
      cellStyle: { padding: '0', overflow: 'visible' },
    },
  ], [ganttTimelineHeader]);

  // Generic NumberInput cell renderer for cost/crew tabs
  const createNumberCellRenderer = (
    dataKey: string,
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    min = 0
  ) => {
    return (props: ICellRendererParams) => {
      const handleChange = (newValue: number) => {
        props.node.setDataValue(props.colDef?.field || '', newValue);
        setter((prev: any[]) =>
          prev.map((e: any) =>
            e.id === props.data.id ? { ...e, [dataKey]: Math.max(min, newValue) } : e
          )
        );
      };

      return (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
          <NumberInput
            value={props.value ?? 0}
            onChange={handleChange}
            size="S"
            min={min}
            showLabel={false}
            variant="Stepper"
          />
        </div>
      );
    };
  };

  // Cost Operations cell renderers
  const GroundHandlingCellRenderer = createNumberCellRenderer('groundHandlingCharge', setCostOperationsData);
  const FuelAgeingCellRenderer = createNumberCellRenderer('fuelAgeingFactor', setCostOperationsData);

  // Cost Ownership cell renderers
  const MonthlyLeaseCellRenderer = createNumberCellRenderer('monthlyLeaseRate', setCostOwnershipData);
  const AcValueCellRenderer = createNumberCellRenderer('acValueUponAcquisition', setCostOwnershipData);
  const SparesProvisioningCellRenderer = createNumberCellRenderer('sparesProvisioningPerFamily', setCostOwnershipData);

  // Monthly Insurance is calculated: acValueUponAcquisition * 0.01 / 12
  const MonthlyInsuranceCellRenderer = (props: ICellRendererParams) => {
    const ownershipEntry = costOwnershipData.find(e => e.id === props.data.id);
    const acValue = ownershipEntry?.acValueUponAcquisition ?? 0;
    const insurance = (acValue * 0.01 / 12).toFixed(2);
    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <span>${Number(insurance).toLocaleString()}</span>
      </div>
    );
  };

  // Crew Configuration cell renderers
  const CaptainCellRenderer = createNumberCellRenderer('captainPerCrew', setCrewConfigData, 1);
  const FirstOfficerCellRenderer = createNumberCellRenderer('firstOfficerPerCrew', setCrewConfigData);
  const CabinManagerCellRenderer = createNumberCellRenderer('cabinManagerPerCrew', setCrewConfigData);
  const CabinAttendantCellRenderer = createNumberCellRenderer('cabinAttendantPerCrew', setCrewConfigData);

  // Cost Operations column definitions
  const costOperationsColDefs = useMemo<ColDef[]>(() => [
    { field: 'aircraftType', headerName: 'A/C Type', flex: 1, minWidth: 100 },
    { field: 'engine', headerName: 'Engine', flex: 1, minWidth: 90 },
    { field: 'layout', headerName: 'Layout', flex: 1, minWidth: 80 },
    { field: 'numberOfAircraft', headerName: 'Nb of AC', flex: 0.7, minWidth: 70 },
    { field: 'ownership', headerName: 'Ownership', flex: 1, minWidth: 90 },
    { field: 'enterInService', headerName: 'Enter in Service', flex: 1, minWidth: 110, valueFormatter: (params: { value: Date }) => params.value?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) || '' },
    { field: 'retirement', headerName: 'Retirement', flex: 1, minWidth: 100, valueFormatter: (params: { value: Date }) => params.value?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) || '-' },
    { field: 'groundHandlingCharge', headerName: 'Ground Handling (USD/sector)', flex: 1.2, minWidth: 130, cellRenderer: GroundHandlingCellRenderer },
    { field: 'fuelAgeingFactor', headerName: 'Fuel Ageing (%)', flex: 1, minWidth: 100, cellRenderer: FuelAgeingCellRenderer },
  ], []);

  // Cost Ownership column definitions
  const costOwnershipColDefs = useMemo<ColDef[]>(() => [
    { field: 'aircraftType', headerName: 'A/C Type', flex: 1, minWidth: 100 },
    { field: 'engine', headerName: 'Engine', flex: 1, minWidth: 90 },
    { field: 'layout', headerName: 'Layout', flex: 1, minWidth: 80 },
    { field: 'numberOfAircraft', headerName: 'Nb of AC', flex: 0.7, minWidth: 70 },
    { field: 'ownership', headerName: 'Ownership', flex: 1, minWidth: 90 },
    { field: 'enterInService', headerName: 'Enter in Service', flex: 1, minWidth: 110, valueFormatter: (params: { value: Date }) => params.value?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) || '' },
    { field: 'retirement', headerName: 'Retirement', flex: 1, minWidth: 100, valueFormatter: (params: { value: Date }) => params.value?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) || '-' },
    { field: 'monthlyLeaseRate', headerName: 'Monthly Lease ($)', flex: 1.2, minWidth: 120, cellRenderer: MonthlyLeaseCellRenderer },
    { field: 'acValueUponAcquisition', headerName: 'AC Value ($)', flex: 1.2, minWidth: 120, cellRenderer: AcValueCellRenderer },
    { field: 'sparesProvisioningPerFamily', headerName: 'Spares ($)', flex: 1, minWidth: 100, cellRenderer: SparesProvisioningCellRenderer },
    { field: 'monthlyInsurance', headerName: 'Monthly Insurance ($)', flex: 1.2, minWidth: 120, cellRenderer: MonthlyInsuranceCellRenderer },
  ], [costOwnershipData]);

  // Crew Configuration column definitions
  const crewConfigColDefs = useMemo<ColDef[]>(() => [
    { field: 'aircraftType', headerName: 'A/C Type', flex: 1, minWidth: 100 },
    { field: 'engine', headerName: 'Engine', flex: 1, minWidth: 90 },
    { field: 'layout', headerName: 'Layout', flex: 1, minWidth: 80 },
    { field: 'numberOfAircraft', headerName: 'Nb of AC', flex: 0.7, minWidth: 70 },
    { field: 'ownership', headerName: 'Ownership', flex: 1, minWidth: 90 },
    { field: 'enterInService', headerName: 'Enter in Service', flex: 1, minWidth: 110, valueFormatter: (params: { value: Date }) => params.value?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) || '' },
    { field: 'retirement', headerName: 'Retirement', flex: 1, minWidth: 100, valueFormatter: (params: { value: Date }) => params.value?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) || '-' },
    { field: 'captainPerCrew', headerName: 'Captain/Crew', flex: 1, minWidth: 100, cellRenderer: CaptainCellRenderer },
    { field: 'firstOfficerPerCrew', headerName: 'First Officer/Crew', flex: 1, minWidth: 110, cellRenderer: FirstOfficerCellRenderer },
    { field: 'cabinManagerPerCrew', headerName: 'Cabin Manager/Crew', flex: 1, minWidth: 110, cellRenderer: CabinManagerCellRenderer },
    { field: 'cabinAttendantPerCrew', headerName: 'Cabin Attendant/Crew', flex: 1.2, minWidth: 120, cellRenderer: CabinAttendantCellRenderer },
  ], []);

  // Merged fleet data for cost/crew tabs
  const fleetWithCostOps = useMemo(() =>
    fleetEntries.map(entry => ({
      ...entry,
      ...(costOperationsData.find(c => c.id === entry.id) || { groundHandlingCharge: 0, fuelAgeingFactor: 0 }),
    })), [fleetEntries, costOperationsData]
  );

  const fleetWithCostOwnership = useMemo(() =>
    fleetEntries.map(entry => ({
      ...entry,
      ...(costOwnershipData.find(c => c.id === entry.id) || {
        monthlyLeaseRate: 0,
        acValueUponAcquisition: 0,
        sparesProvisioningPerFamily: 0
      }),
    })), [fleetEntries, costOwnershipData]
  );

  const fleetWithCrewConfig = useMemo(() =>
    fleetEntries.map(entry => ({
      ...entry,
      ...(crewConfigData.find(c => c.id === entry.id) || {
        captainPerCrew: 1,
        firstOfficerPerCrew: 1,
        cabinManagerPerCrew: 1,
        cabinAttendantPerCrew: 2
      }),
    })), [fleetEntries, crewConfigData]
  );

  // Initialize cost/crew data when fleet entries change
  // Using functional updates to avoid stale closures in React strict mode
  useEffect(() => {
    setCostOperationsData(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const newEntries = fleetEntries
        .filter(e => !existingIds.has(e.id))
        .map(e => ({ id: e.id, groundHandlingCharge: 0, fuelAgeingFactor: 0 }));
      return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
    });

    setCostOwnershipData(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const newEntries = fleetEntries
        .filter(e => !existingIds.has(e.id))
        .map(e => ({ id: e.id, monthlyLeaseRate: 0, acValueUponAcquisition: 0, sparesProvisioningPerFamily: 0 }));
      return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
    });

    setCrewConfigData(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const newEntries = fleetEntries
        .filter(e => !existingIds.has(e.id))
        .map(e => ({ id: e.id, captainPerCrew: 1, firstOfficerPerCrew: 1, cabinManagerPerCrew: 1, cabinAttendantPerCrew: 2 }));
      return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
    });
  }, [fleetEntries]);

  // Network: Routes helper
  const hasRoutes = routeEntries.length > 0;

  // Routes selection state
  const [selectedRouteIds, setSelectedRouteIds] = useState<Set<string>>(new Set());

  // Routes selection handlers
  const onRouteSelectionChanged = useCallback((event: { api: { getSelectedRows: () => RouteEntry[] } }) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedRouteIds(new Set(selectedRows.map((row) => row.id)));
  }, []);

  // Delete selected routes
  const handleDeleteSelectedRoutes = () => {
    setRouteEntries((prev) => prev.filter((r) => !selectedRouteIds.has(r.id)));
    // Also clean up related data
    setRoutePricingData((prev) => prev.filter((p) => !selectedRouteIds.has(p.routeId)));
    setFleetPlanData((prev) => prev.filter((f) => !selectedRouteIds.has(f.routeId)));
    setRouteFrequencyData((prev) => prev.filter((f) => !selectedRouteIds.has(f.routeId)));
    setSelectedRouteIds(new Set());
  };

  // Duplicate selected routes
  const handleDuplicateSelectedRoutes = () => {
    const selectedEntries = routeEntries.filter((r) => selectedRouteIds.has(r.id));
    const duplicates = selectedEntries.map((entry) => ({
      ...entry,
      id: `${entry.id}-copy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
    setRouteEntries((prev) => [...prev, ...duplicates]);
    setSelectedRouteIds(new Set());
  };

  // Route cell renderers (only for dates now)
  const RouteStartDateCellRenderer = (props: ICellRendererParams) => {
    const handleChange = (newValue: Date | undefined) => {
      if (newValue) {
        props.node.setDataValue(props.colDef?.field || '', newValue);
        setRouteEntries((prev) =>
          prev.map((r) => r.id === props.data.id ? { ...r, startDate: newValue } : r)
        );
      }
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <Calendar
          value={props.value instanceof Date ? props.value : undefined}
          onChange={handleChange}
          mode="month"
          size="S"
          showLabel={false}
          placeholder="Select"
        />
      </div>
    );
  };

  const RouteEndDateCellRenderer = (props: ICellRendererParams) => {
    const handleChange = (newValue: Date | undefined) => {
      if (newValue) {
        props.node.setDataValue(props.colDef?.field || '', newValue);
        setRouteEntries((prev) =>
          prev.map((r) => r.id === props.data.id ? { ...r, endDate: newValue } : r)
        );
      }
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <Calendar
          value={props.value instanceof Date ? props.value : undefined}
          onChange={handleChange}
          mode="month"
          size="S"
          showLabel={false}
          placeholder="Select"
        />
      </div>
    );
  };

  // Routes column definitions
  const routesColDefs = useMemo<ColDef[]>(() => [
    { headerCheckboxSelection: true, checkboxSelection: true, width: 48, maxWidth: 48, suppressMovable: true, resizable: false },
    { field: 'origin', headerName: 'Origin', flex: 1, minWidth: 100 },
    { field: 'destination', headerName: 'Destination', flex: 1, minWidth: 100 },
    { field: 'startDate', headerName: 'Start Date', flex: 1, minWidth: 130, cellRenderer: RouteStartDateCellRenderer },
    { field: 'endDate', headerName: 'End Date', flex: 1, minWidth: 130, cellRenderer: RouteEndDateCellRenderer },
  ], []);

  // Pricing cell renderers
  const DiscountStrategyCellRenderer = (props: ICellRendererParams) => {
    const handleChange = (newValue: string) => {
      props.node.setDataValue(props.colDef?.field || '', newValue);
      setRoutePricingData((prev) =>
        prev.map((p) => p.routeId === props.data.routeId ? { ...p, discountStrategy: newValue } : p)
      );
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <Select
          value={props.value || 'None'}
          onValueChange={handleChange}
          options={[
            { value: 'None', label: 'None' },
            { value: 'Early Bird', label: 'Early Bird' },
            { value: 'Promotional', label: 'Promotional' },
          ]}
          size="S"
          showLabel={false}
        />
      </div>
    );
  };

  const MarketYieldCellRenderer = (props: ICellRendererParams) => {
    const handleChange = (newValue: number) => {
      props.node.setDataValue(props.colDef?.field || '', newValue);
      setRoutePricingData((prev) =>
        prev.map((p) => p.routeId === props.data.routeId ? { ...p, marketYield: newValue } : p)
      );
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <NumberInput
          value={props.value ?? 0}
          onChange={handleChange}
          size="S"
          min={0}
          showLabel={false}
          variant="Stepper"
        />
      </div>
    );
  };

  // Pricing column definitions
  const pricingColDefs = useMemo<ColDef[]>(() => [
    { field: 'route', headerName: 'Origin Destination', flex: 1.2, minWidth: 120, valueGetter: (params: { data: { routeId: string } }) => {
      const route = routeEntries.find(r => r.id === params.data?.routeId);
      return route ? `${route.origin} - ${route.destination}` : '';
    }},
    { field: 'period', headerName: 'Period', flex: 1.2, minWidth: 140, valueGetter: (params: { data: { routeId: string } }) => {
      const route = routeEntries.find(r => r.id === params.data?.routeId);
      if (!route) return '';
      const start = route.startDate?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase() || '';
      const end = route.endDate?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase() || '';
      return `${start} - ${end}`;
    }},
    { field: 'marketYield', headerName: 'Market Yield ($/pax km)', flex: 1.2, minWidth: 120, cellRenderer: MarketYieldCellRenderer },
    { field: 'discountStrategy', headerName: 'Discount Strategy', flex: 1.2, minWidth: 130, cellRenderer: DiscountStrategyCellRenderer },
    { field: 'yield', headerName: 'Yield', flex: 1, minWidth: 100, cellRenderer: (props: ICellRendererParams) => {
      const handleChange = (newValue: number) => {
        // Round to 3 decimal places to avoid JS floating point errors
        const rounded = Math.round(newValue * 1000) / 1000;
        props.node.setDataValue('yield', rounded);
        setRoutePricingData((prev) =>
          prev.map((p) => p.routeId === props.data.routeId ? { ...p, yield: rounded } : p)
        );
      };

      return (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
          <NumberInput
            value={props.data?.yield ?? 0}
            onChange={handleChange}
            size="S"
            min={0}
            step={0.1}
            showLabel={false}
            variant="Stepper"
          />
        </div>
      );
    }},
    { field: 'fare', headerName: 'Fare (yield*distance)', flex: 1.2, minWidth: 120, valueGetter: (params: { data: RoutePricingEntry }) => {
      const marketYield = params.data?.marketYield || 0;
      const discount = discountForNormalFares || 0;
      const yieldValue = marketYield * (1 - discount / 100);
      return (yieldValue * 100).toFixed(2);
    }},
  ], [routeEntries, discountForNormalFares]);

  // Fleet Plan cell renderer - receives options via cellRendererParams to avoid stale closure
  const AllocatedAircraftCellRenderer = (props: ICellRendererParams & { aircraftOptions?: { value: string; label: string }[] }) => {
    const handleChange = (newValue: string) => {
      // Convert 'none' back to null when saving
      const actualValue = newValue === 'none' ? null : newValue;
      props.node.setDataValue(props.colDef?.field || '', actualValue);
      setFleetPlanData((prev) =>
        prev.map((f) => f.routeId === props.data.routeId ? { ...f, allocatedAircraftId: actualValue } : f)
      );
    };

    const options = props.aircraftOptions || [{ value: 'none', label: 'Not Allocated' }];
    // Convert null to 'none' for display
    const displayValue = props.value || 'none';

    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <Select
          value={displayValue}
          onValueChange={handleChange}
          options={options}
          size="S"
          showLabel={false}
        />
      </div>
    );
  };

  // Fleet Plan column definitions - pass aircraft options via cellRendererParams
  const fleetPlanColDefs = useMemo<ColDef[]>(() => {
    const aircraftOptions = [
      { value: 'none', label: 'Not Allocated' },
      ...fleetEntries.map(e => ({
        value: e.id,
        label: `${e.aircraftType} - ${e.engine} (${e.layout})`,
      })),
    ];

    return [
      { field: 'route', headerName: 'Route', flex: 1.2, minWidth: 120, valueGetter: (params: { data: { routeId: string } }) => {
        const route = routeEntries.find(r => r.id === params.data?.routeId);
        return route ? `${route.origin} - ${route.destination}` : '';
      }},
      { field: 'startDate', headerName: 'Start Date', flex: 1, minWidth: 100, valueGetter: (params: { data: { routeId: string } }) => {
        const route = routeEntries.find(r => r.id === params.data?.routeId);
        return route?.startDate?.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) || '';
      }},
      { field: 'endDate', headerName: 'End Date', flex: 1, minWidth: 100, valueGetter: (params: { data: { routeId: string } }) => {
        const route = routeEntries.find(r => r.id === params.data?.routeId);
        return route?.endDate?.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) || '';
      }},
      {
        field: 'allocatedAircraftId',
        headerName: 'Aircraft Allocated',
        flex: 2,
        minWidth: 200,
        cellRenderer: AllocatedAircraftCellRenderer,
        cellRendererParams: { aircraftOptions },
      },
    ];
  }, [routeEntries, fleetEntries]);

  // Frequencies: Generate row data with month columns
  const frequenciesRowData = useMemo(() => {
    return routeFrequencyData.map(entry => {
      const route = routeEntries.find(r => r.id === entry.routeId);
      return {
        ...entry,
        routeDisplay: route ? `${route.origin} - ${route.destination}` : '',
        startDateDisplay: route?.startDate?.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) || '',
        endDateDisplay: route?.endDate?.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) || '',
      };
    });
  }, [routeFrequencyData, routeEntries]);

  // Frequency cell renderer for month columns
  const createFrequencyCellRenderer = (monthKey: string) => {
    return (props: ICellRendererParams) => {
      const handleChange = (newValue: number) => {
        setRouteFrequencyData((prev) =>
          prev.map((f) => {
            if (f.routeId === props.data.routeId) {
              return { ...f, frequencies: { ...f.frequencies, [monthKey]: newValue } };
            }
            return f;
          })
        );
      };

      const value = props.data.frequencies?.[monthKey] ?? 0;
      return (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
          <NumberInput
            value={value}
            onChange={handleChange}
            size="S"
            min={0}
            showLabel={false}
            variant="Stepper"
          />
        </div>
      );
    };
  };

  // Frequencies column definitions
  const frequenciesColDefs = useMemo<ColDef[]>(() => {
    const fixedCols: ColDef[] = [
      {
        field: 'routeDisplay',
        headerName: 'Route',
        pinned: 'left',
        width: 140,
      },
      {
        field: 'startDateDisplay',
        headerName: 'Start Date',
        pinned: 'left',
        width: 100,
      },
      {
        field: 'endDateDisplay',
        headerName: 'End Date',
        pinned: 'left',
        width: 100,
      },
    ];

    const monthCols = generateMonthColumns(startDate, endDate).map(col => ({
      ...col,
      cellRenderer: createFrequencyCellRenderer(col.field as string),
    }));

    return [...fixedCols, ...monthCols];
  }, [startDate, endDate, generateMonthColumns]);

  // Initialize pricing, fleet plan, and frequencies when routes change
  // Using functional updates to avoid stale closures in React strict mode
  useEffect(() => {
    setRoutePricingData(prev => {
      const existingIds = new Set(prev.map(p => p.routeId));
      const newEntries = routeEntries
        .filter(r => !existingIds.has(r.id))
        .map(r => ({ routeId: r.id, marketYield: 0, discountStrategy: 'None', yield: 0, fare: 0 }));
      return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
    });

    setFleetPlanData(prev => {
      const existingIds = new Set(prev.map(f => f.routeId));
      const newEntries = routeEntries
        .filter(r => !existingIds.has(r.id))
        .map(r => ({ routeId: r.id, allocatedAircraftId: null }));
      return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
    });

    setRouteFrequencyData(prev => {
      const existingIds = new Set(prev.map(f => f.routeId));
      const newEntries = routeEntries
        .filter(r => !existingIds.has(r.id))
        .map(r => ({ routeId: r.id, frequencies: {} }));
      return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
    });
  }, [routeEntries]);

  // Add route handler
  const handleAddRoute = (route: RouteEntry) => {
    setRouteEntries((prev) => [...prev, route]);
  };

  // AG Grid: Column definitions
  const fleetColDefs = useMemo<ColDef[]>(() => [
    { headerCheckboxSelection: true, checkboxSelection: true, width: 48, maxWidth: 48, suppressMovable: true, resizable: false },
    { field: 'aircraftType', headerName: 'A/C Type', flex: 1, minWidth: 100 },
    { field: 'engine', headerName: 'Engine', flex: 1, minWidth: 90 },
    { field: 'layout', headerName: 'Layout', flex: 1, minWidth: 80 },
    { field: 'numberOfAircraft', headerName: 'Number of AC', flex: 1, minWidth: 100, cellRenderer: NumberInputCellRenderer },
    {
      field: 'enterInService',
      headerName: 'Enter in Service',
      flex: 1,
      minWidth: 130,
      cellRenderer: EnterInServiceCellRenderer,
    },
    {
      field: 'retirement',
      headerName: 'Retirement',
      flex: 1,
      minWidth: 130,
      cellRenderer: RetirementCellRenderer,
    },
    {
      field: 'ownership',
      headerName: 'Ownership',
      flex: 1,
      minWidth: 100,
      resizable: false,
      cellRenderer: OwnershipCellRenderer,
    },
  ], []);

  // AG Grid: Handle selection change
  const onSelectionChanged = useCallback((event: { api: { getSelectedRows: () => FleetEntry[] } }) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedAircraftIds(new Set(selectedRows.map((row) => row.id)));
  }, []);

  // Study lifecycle: draft → computing → computed
  // Map incoming status to local status
  const getInitialStatus = (): 'draft' | 'computing' | 'computed' => {
    if (!studyData?.status) return 'draft';
    switch (studyData.status) {
      case 'Computed': return 'computed';
      case 'Computing': return 'computing';
      default: return 'draft';
    }
  };
  const [studyStatus, setStudyStatus] = useState<'draft' | 'computing' | 'computed'>(getInitialStatus);
  const computeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track if it's the first render (to avoid resetting status on mount)
  const isFirstRender = useRef(true);

  // Reset to draft when inputs change after computed (but not on initial render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
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
    if (itemId === 'network') {
      return routeEntries.length === 0 ? 1 : 0;
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
              workspaceName={workspaceName}
              studyName={studyName}
              onBackHome={() => navigate('/airline-business-planner')}
              onStudyNameClick={() => console.log('Edit study name')}
              showDuplicateButton={false}
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
                      state={scenarios.length <= 1 ? 'Disabled' : 'Default'}
                      style={{ color: scenarios.length > 1 ? 'var(--status-error, #da1e28)' : undefined }}
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
        <div className={`study-page__main${studyStatus === 'computed' ? ' study-page__main--computed' : ''}`}>
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
                  label="Cost Operations"
                  size="M"
                  status={hasAircraft && fleetTab === 'cost-operations' ? 'Active' : 'Default'}
                  disabled={!hasAircraft}
                  onClick={() => { if (hasAircraft) setFleetTab('cost-operations'); }}
                />
                <Tab
                  label="Cost Ownership"
                  size="M"
                  status={hasAircraft && fleetTab === 'cost-ownership' ? 'Active' : 'Default'}
                  disabled={!hasAircraft}
                  onClick={() => { if (hasAircraft) setFleetTab('cost-ownership'); }}
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
                    <div className="study-page__fleet-title-left">
                      <h2 className="study-page__fleet-title">Fleet</h2>
                      <ButtonGroup
                        options={[
                          { value: 'table', iconName: 'table_chart' },
                          { value: 'gantt', iconName: 'event_note' },
                        ]}
                        value={fleetViewMode}
                        onChange={(v) => setFleetViewMode(v as FleetViewMode)}
                        size="S"
                      />
                    </div>
                    <div className="study-page__fleet-title-right">
                      <span className="label-regular-s study-page__fleet-entry-count">
                        {filteredFleetEntries.length} Entries
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
                      {selectedAircraftIds.size > 0 && (
                        <>
                          <span className="label-regular-s study-page__fleet-selection-count">
                            {selectedAircraftIds.size} {selectedAircraftIds.size === 1 ? 'Entry' : 'Entries'} Selected
                          </span>
                          <IconButton
                            icon="edit"
                            size="S"
                            variant="Outlined"
                            alt="Edit"
                            onClick={() => console.log('Edit selected')}
                          />
                          <IconButton
                            icon="content_copy"
                            size="S"
                            variant="Outlined"
                            alt="Duplicate"
                            onClick={handleDuplicateSelected}
                          />
                          <IconButton
                            icon="delete"
                            size="S"
                            variant="Outlined"
                            alt="Delete"
                            onClick={handleDeleteSelected}
                            className="study-page__fleet-delete-btn"
                          />
                          <span className="study-page__fleet-action-divider" />
                        </>
                      )}
                      <IconButton
                        icon="add"
                        size="S"
                        variant="Outlined"
                        alt="Add Aircraft"
                        onClick={() => setIsAddAircraftModalOpen(true)}
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

                  {/* Table or Gantt View */}
                  <div className="study-page__fleet-table">
                    {fleetEntries.length === 0 ? (
                      <div className="study-page__fleet-table-body">
                        <EmptyState
                          illustration="Box"
                          title="Your Fleet is empty"
                          description="Please add flights or import a fleet"
                          actions={
                            <>
                              <Button
                                label="ADD AIRCRAFT"
                                leftIcon="add"
                                variant="Outlined"
                                size="M"
                                onClick={() => setIsAddAircraftModalOpen(true)}
                              />
                              <Button
                                label="IMPORT FLEET"
                                leftIcon="download"
                                variant="Default"
                                size="M"
                                onClick={() => console.log('Import fleet')}
                              />
                            </>
                          }
                          className="study-page__fleet-empty"
                        />
                      </div>
                    ) : fleetViewMode === 'table' ? (
                      <AgGridReact
                        key="fleet-table"
                        className="as-ag-grid"
                        rowData={filteredFleetEntries}
                        columnDefs={fleetColDefs}
                        rowSelection="multiple"
                        suppressRowClickSelection={true}
                        onSelectionChanged={onSelectionChanged}
                        getRowId={(params) => params.data.id}

                        noRowsOverlayComponent={() => (
                          <div className="study-page__fleet-no-results">
                            No results found for "{fleetSearchValue}"
                          </div>
                        )}
                      />
                    ) : (
                      <AgGridReact
                        key="fleet-gantt"
                        className="as-ag-grid study-page__gantt-grid"
                        rowData={ganttRows}
                        columnDefs={ganttColDefs}
                        getRowId={(params) => params.data.id}
                        suppressRowClickSelection={true}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Cost Operations tab content */}
              {fleetTab === 'cost-operations' && (
                <div className="study-page__fleet-content">
                  <div className="study-page__fleet-title-bar">
                    <h2 className="study-page__fleet-title">Cost Operations</h2>
                    <div className="study-page__fleet-title-right">
                      <span className="label-regular-s study-page__fleet-entry-count">
                        {fleetEntries.length} Entries
                      </span>
                    </div>
                  </div>
                  <div className="study-page__fleet-table">
                    <AgGridReact
                      className="as-ag-grid"
                      rowData={fleetWithCostOps}
                      columnDefs={costOperationsColDefs}
                      getRowId={(params) => params.data.id}

                    />
                  </div>
                </div>
              )}

              {/* Cost Ownership tab content */}
              {fleetTab === 'cost-ownership' && (
                <div className="study-page__fleet-content">
                  <div className="study-page__fleet-title-bar">
                    <h2 className="study-page__fleet-title">Cost Ownership</h2>
                    <div className="study-page__fleet-title-right">
                      <span className="label-regular-s study-page__fleet-entry-count">
                        {fleetEntries.length} Entries
                      </span>
                    </div>
                  </div>
                  <div className="study-page__fleet-table">
                    <AgGridReact
                      className="as-ag-grid"
                      rowData={fleetWithCostOwnership}
                      columnDefs={costOwnershipColDefs}
                      getRowId={(params) => params.data.id}

                    />
                  </div>
                </div>
              )}

              {/* Crew Configuration tab content */}
              {fleetTab === 'crew' && (
                <div className="study-page__fleet-content">
                  <div className="study-page__fleet-title-bar">
                    <h2 className="study-page__fleet-title">Crew Configuration</h2>
                    <div className="study-page__fleet-title-right">
                      <span className="label-regular-s study-page__fleet-entry-count">
                        {fleetEntries.length} Entries
                      </span>
                    </div>
                  </div>
                  <div className="study-page__fleet-table">
                    <AgGridReact
                      className="as-ag-grid"
                      rowData={fleetWithCrewConfig}
                      columnDefs={crewConfigColDefs}
                      getRowId={(params) => params.data.id}

                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Network content */}
          {selectedItem.itemId === 'network' && (
            <div className="study-page__network">
              {/* Network sub-tabs */}
              <div className="study-page__fleet-tabs">
                <Tab
                  label="Routes"
                  size="M"
                  status={networkTab === 'routes' ? 'Active' : 'Default'}
                  onClick={() => setNetworkTab('routes')}
                />
                <Tab
                  label="Pricing"
                  size="M"
                  status={hasRoutes && networkTab === 'pricing' ? 'Active' : 'Default'}
                  disabled={!hasRoutes}
                  onClick={() => { if (hasRoutes) setNetworkTab('pricing'); }}
                />
                <Tab
                  label="Fleet Plan"
                  size="M"
                  status={hasRoutes && hasAircraft && networkTab === 'fleet-plan' ? 'Active' : 'Default'}
                  disabled={!hasRoutes || !hasAircraft}
                  onClick={() => { if (hasRoutes && hasAircraft) setNetworkTab('fleet-plan'); }}
                />
                <Tab
                  label="Frequencies"
                  size="M"
                  status={hasRoutes && networkTab === 'frequencies' ? 'Active' : 'Default'}
                  disabled={!hasRoutes}
                  onClick={() => { if (hasRoutes) setNetworkTab('frequencies'); }}
                />
              </div>

              {/* Routes tab content */}
              {networkTab === 'routes' && (
                <div className="study-page__fleet-content">
                  <div className="study-page__fleet-title-bar">
                    <h2 className="study-page__fleet-title">Routes</h2>
                    <div className="study-page__fleet-title-right">
                      <span className="label-regular-s study-page__fleet-entry-count">
                        {routeEntries.length} Routes
                      </span>
                    </div>
                    <div className="study-page__fleet-actions">
                      {selectedRouteIds.size > 0 && (
                        <>
                          <span className="label-regular-s study-page__fleet-selection-count">
                            {selectedRouteIds.size} {selectedRouteIds.size === 1 ? 'Route' : 'Routes'} Selected
                          </span>
                          <IconButton
                            icon="edit"
                            size="S"
                            variant="Outlined"
                            alt="Edit"
                            onClick={() => console.log('Edit selected routes')}
                          />
                          <IconButton
                            icon="content_copy"
                            size="S"
                            variant="Outlined"
                            alt="Duplicate"
                            onClick={handleDuplicateSelectedRoutes}
                          />
                          <IconButton
                            icon="delete"
                            size="S"
                            variant="Outlined"
                            alt="Delete"
                            onClick={handleDeleteSelectedRoutes}
                            className="study-page__fleet-delete-btn"
                          />
                          <span className="study-page__fleet-action-divider" />
                        </>
                      )}
                      <IconButton
                        icon="add"
                        size="S"
                        variant="Outlined"
                        alt="Add Route"
                        onClick={() => setIsAddRouteModalOpen(true)}
                      />
                    </div>
                  </div>
                  <div className="study-page__fleet-table">
                    {routeEntries.length === 0 ? (
                      <div className="study-page__fleet-table-body">
                        <EmptyState
                          illustration="Folder"
                          title="No routes defined"
                          description="Add routes to define your network"
                          actions={
                            <Button
                              label="ADD ROUTE"
                              leftIcon="add"
                              variant="Outlined"
                              size="M"
                              onClick={() => setIsAddRouteModalOpen(true)}
                            />
                          }
                          className="study-page__fleet-empty"
                        />
                      </div>
                    ) : (
                      <AgGridReact
                        className="as-ag-grid"
                        rowData={routeEntries}
                        columnDefs={routesColDefs}
                        rowSelection="multiple"
                        suppressRowClickSelection={true}
                        onSelectionChanged={onRouteSelectionChanged}
                        getRowId={(params) => params.data.id}

                      />
                    )}
                  </div>
                </div>
              )}

              {/* Pricing tab content */}
              {networkTab === 'pricing' && (
                <div className="study-page__fleet-content">
                  {/* Discount input row - separate from title bar */}
                  <div className="study-page__pricing-discount-row">
                    <NumberInput
                      label="Discount for Normal Fares (%)"
                      value={discountForNormalFares}
                      onChange={(v) => setDiscountForNormalFares(Math.max(0, Math.min(100, v)))}
                      size="S"
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="study-page__fleet-title-bar">
                    <h2 className="study-page__fleet-title">Pricing</h2>
                    <div className="study-page__fleet-title-right">
                      <span className="label-regular-s study-page__fleet-entry-count">
                        {routeEntries.length} Entries
                      </span>
                      <TextInput
                        placeholder="Search"
                        size="S"
                        showLeftIcon
                        leftIcon="search"
                        showLabel={false}
                        className="study-page__fleet-search"
                      />
                    </div>
                    <div className="study-page__fleet-actions">
                      <Button
                        label=""
                        leftIcon="download"
                        rightIcon="arrow_drop_down"
                        variant="Outlined"
                        size="S"
                        onClick={() => console.log('Export pricing')}
                      />
                    </div>
                  </div>
                  <div className="study-page__fleet-table">
                    <AgGridReact
                      className="as-ag-grid"
                      rowData={routePricingData}
                      columnDefs={pricingColDefs}
                      getRowId={(params) => params.data.routeId}

                    />
                  </div>
                </div>
              )}

              {/* Fleet Plan tab content */}
              {networkTab === 'fleet-plan' && (
                <div className="study-page__fleet-content">
                  <div className="study-page__fleet-title-bar">
                    <h2 className="study-page__fleet-title">Fleet Plan</h2>
                    <div className="study-page__fleet-title-right">
                      <span className="label-regular-s study-page__fleet-entry-count">
                        {routeEntries.length} Routes
                      </span>
                    </div>
                  </div>
                  <div className="study-page__fleet-table">
                    <AgGridReact
                      className="as-ag-grid"
                      rowData={fleetPlanData}
                      columnDefs={fleetPlanColDefs}
                      getRowId={(params) => params.data.routeId}

                    />
                  </div>
                </div>
              )}

              {/* Frequencies tab content */}
              {networkTab === 'frequencies' && (
                <div className="study-page__fleet-content">
                  <div className="study-page__fleet-title-bar">
                    <h2 className="study-page__fleet-title">Frequencies</h2>
                    <div className="study-page__fleet-title-right">
                      <span className="label-regular-s study-page__fleet-entry-count">
                        {routeEntries.length} Routes
                      </span>
                    </div>
                  </div>
                  <div className="study-page__fleet-table">
                    <AgGridReact
                      className="as-ag-grid"
                      rowData={frequenciesRowData}
                      columnDefs={frequenciesColDefs}
                      getRowId={(params) => params.data.routeId}

                    />
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

      {/* Add Aircraft Modal */}
      <AddAircraftModal
        isOpen={isAddAircraftModalOpen}
        onClose={() => setIsAddAircraftModalOpen(false)}
        onAddAircraft={handleAddAircraft}
      />

      {/* Add Route Modal */}
      <AddRouteModal
        isOpen={isAddRouteModalOpen}
        onClose={() => setIsAddRouteModalOpen(false)}
        onAddRoute={handleAddRoute}
        simulationStartDate={startDate}
        simulationEndDate={endDate}
      />
    </div>
  );
}
