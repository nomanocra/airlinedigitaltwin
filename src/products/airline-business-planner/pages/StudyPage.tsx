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
import { Tooltip, TooltipTrigger, TooltipContent, SimpleTooltip } from '@/design-system/components/Tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/design-system/components/DropdownMenu';
import { AddAircraftModal, type FleetEntry } from '../components/AddAircraftModal';
import { ImportAirlineFleetModal } from '../components/ImportAirlineFleetModal';
import { ImportAirlineNetworkModal } from '../components/ImportAirlineNetworkModal';
import { AddRouteModal } from '../components/AddRouteModal';
import '@/design-system/tokens/ag-grid-theme.css';
import './StudyPage.css';

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Fleet sub-tab types
type FleetTabType = 'fleet' | 'cost-operations' | 'cost-ownership' | 'crew';
type FleetViewMode = 'table' | 'gantt';
type NetworkTabType = 'routes' | 'pricing' | 'fleet-plan' | 'frequencies';

// Load Factor tab types
type LoadFactorTabType = 'general' | 'per-route';

// Operational Cost tab types
type OperationalCostTabType = 'fuel-cost' | 'crew-costs' | 'catering-costs' | 'maintenance-costs' | 'selling-distribution';
type CrewCostSubTabType = 'wages' | 'monthly-costs';

// Revenue tab types
type RevenueTabType = 'ancillary' | 'cargo';

// Financial tab types
type FinancialTabType = 'inflation' | 'taxes' | 'owned-ac' | 'leased-ac' | 'tooling' | 'working-capital';

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
  const [isImportAirlineNetworkModalOpen, setIsImportAirlineNetworkModalOpen] = useState(false);
  const [discountForNormalFares, setDiscountForNormalFares] = useState<number>(0);

  // ========== LOAD FACTOR STATE ==========
  const [loadFactorTab, setLoadFactorTab] = useState<LoadFactorTabType>('general');
  const [targetedYearlyLF, setTargetedYearlyLF] = useState<Record<string, Record<string, number>>>({
    'Economy (Y)': { Y2: 70, Y3: 75, Y4: 80, Y5: 82, Y6: 85 },
    'Business (C)': { Y2: 60, Y3: 65, Y4: 70, Y5: 72, Y6: 75 },
    'Premium (W)': { Y2: 55, Y3: 60, Y4: 65, Y5: 68, Y6: 70 },
  });
  const [seasonalityCorrection, setSeasonalityCorrection] = useState<Record<string, number>>({
    Jan: 81, Feb: 77, Mar: 96, Apr: 99, May: 108, Jun: 117,
    Jul: 130, Aug: 136, Sep: 115, Oct: 83, Nov: 76, Dec: 83,
  });
  const [firstYearRampUp, setFirstYearRampUp] = useState<Record<string, Record<string, number>>>({
    'Economy (Y)': {},
    'Business (C)': {},
    'Premium (W)': {},
  });
  const [maxLoadFactor, setMaxLoadFactor] = useState({ economy: 98, business: 95, premium: 93 });
  const [routeLoadFactorData, setRouteLoadFactorData] = useState<Array<{ routeId: string; classType: string; [key: string]: number | string }>>([]);

  // ========== OPERATIONAL COST STATE ==========
  const [operationalCostTab, setOperationalCostTab] = useState<OperationalCostTabType>('fuel-cost');
  // Fuel Cost
  const [fuelPricePerGallon, setFuelPricePerGallon] = useState(2.8);
  const [fuelDepositsMonths, setFuelDepositsMonths] = useState(3);
  // Crew Costs
  const [crewRatioPerAircraft, setCrewRatioPerAircraft] = useState(2.8);
  const [cabinCrewAttrition, setCabinCrewAttrition] = useState(0.92);
  const [flightCrewAttrition, setFlightCrewAttrition] = useState(3);
  const [crewFixedWagesSubTab, setCrewFixedWagesSubTab] = useState<CrewCostSubTabType>('wages');
  const [crewFixedWages, setCrewFixedWages] = useState({
    captainBaseSalary: 12000, firstOfficerBaseSalary: 8000, cabinManagerBaseSalary: 4000,
    cabinAttendantBaseSalary: 2500, captainHousingAllowance: 3000, firstOfficerHousingAllowance: 2000,
    cabinManagerHousingAllowance: 1500, cabinAttendantHousingAllowance: 1000,
    captainTransportAllowance: 500, firstOfficerTransportAllowance: 400, cabinManagerTransportAllowance: 300,
  });
  const [crewVariableWagesSubTab, setCrewVariableWagesSubTab] = useState<CrewCostSubTabType>('wages');
  const [crewVariableWages, setCrewVariableWages] = useState({ perDiem: 150, flightHourPay: 50 });
  const [crewTrainingSubTab, setCrewTrainingSubTab] = useState<CrewCostSubTabType>('wages');
  const [crewTraining, setCrewTraining] = useState({
    captainInitialTraining: 25000, firstOfficerInitialTraining: 20000, cabinCrewInitialTraining: 5000,
    recurrentTrainingPerCrew: 3000, simulatorCostPerSession: 8000,
  });
  // Catering
  const [cateringCostEconomy, setCateringCostEconomy] = useState(20);
  const [cateringCostBusiness, setCateringCostBusiness] = useState(40);
  const [cateringCostPremium, setCateringCostPremium] = useState(100);
  // Maintenance
  const [indirectMaintenanceCost, setIndirectMaintenanceCost] = useState(20);
  const [maintenanceOutsourcingCost, setMaintenanceOutsourcingCost] = useState(40);
  const [llpCostFactor, setLlpCostFactor] = useState(100);
  // Selling & Distribution
  const [initialMarketingBudget, setInitialMarketingBudget] = useState(10000);
  const [sellingCostPerPax, setSellingCostPerPax] = useState<Record<string, number>>({});
  const [marketingBudget, setMarketingBudget] = useState<Record<string, number>>({});

  // ========== REVENUE STATE ==========
  const [revenueTab, setRevenueTab] = useState<RevenueTabType>('ancillary');
  const [ancillaryRevenueData, setAncillaryRevenueData] = useState<Array<{ classType: string; [key: string]: number | string }>>([
    { classType: 'Y Pax' },
    { classType: 'C Pax' },
    { classType: 'W Pax' },
  ]);
  const [codeShareDeduction, setCodeShareDeduction] = useState(20);
  const [cargoMarketCAGR, setCargoMarketCAGR] = useState(20);
  const [cargoAddressableMarket, setCargoAddressableMarket] = useState(2000);
  const [cargoYearlyData, setCargoYearlyData] = useState<Array<{ metric: string; [key: string]: number | string }>>([]);

  // ========== FINANCIAL STATE ==========
  const [financialTab, setFinancialTab] = useState<FinancialTabType>('inflation');
  const [inflationData, setInflationData] = useState<Array<{ factor: string; [key: string]: number | string }>>([
    { factor: 'Price Inflation Factor' },
    { factor: 'Cost Inflation Factor' },
    { factor: 'Fuel Inflation Factor' },
    { factor: 'Salaries Inflation Factor' },
  ]);
  const [effectiveTaxRate, setEffectiveTaxRate] = useState(10);
  const [lossCarryForward, setLossCarryForward] = useState(1);
  const [lossCarryBack, setLossCarryBack] = useState(1);
  const [depreciationRate, setDepreciationRate] = useState(11);
  const [residualValue, setResidualValue] = useState(12);
  const [interestRate, setInterestRate] = useState(3);
  const [loanDuration, setLoanDuration] = useState(3);
  const [costOfDebt, setCostOfDebt] = useState(11);
  const [avgLifeCapitalizedLease, setAvgLifeCapitalizedLease] = useState(12);
  const [securityDeposit, setSecurityDeposit] = useState(3);
  const [toolingAmortRate, setToolingAmortRate] = useState(11);
  const [toolingResidualValue, setToolingResidualValue] = useState(12);
  const [spareUsageRate, setSpareUsageRate] = useState(3);
  const [sparesAmortRate, setSparesAmortRate] = useState(3);
  const [acPreparationAmortRate, setAcPreparationAmortRate] = useState(3);
  const [workingCapitalData, setWorkingCapitalData] = useState<Array<{ category: string; item: string; [key: string]: number | string }>>([]);

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
  const [isImportAirlineFleetModalOpen, setIsImportAirlineFleetModalOpen] = useState(false);
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

  // Import fleet from airline
  const handleImportAirlineFleet = (entries: FleetEntry[]) => {
    setFleetEntries((prev) => [...prev, ...entries]);
  };

  // Import network from airline
  const handleImportAirlineNetwork = (entries: RouteEntry[]) => {
    setRouteEntries((prev) => [...prev, ...entries]);
  };

  // Delete selected aircraft
  const handleDeleteSelected = () => {
    setFleetEntries((prev) => prev.filter((e) => !selectedAircraftIds.has(e.id)));
    setSelectedAircraftIds(new Set());
    fleetGridApiRef.current?.deselectAll();
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
    fleetGridApiRef.current?.deselectAll();
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

  // Utility: Generate year columns from start to end date
  const generateYearColumns = useCallback((start: Date | undefined, end: Date | undefined): ColDef[] => {
    if (!start || !end) return [];
    const columns: ColDef[] = [];
    for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
      const yearIndex = y - start.getFullYear() + 1;
      columns.push({
        field: `Y${yearIndex}`,
        headerName: `Y${yearIndex}`,
        flex: 1,
        minWidth: 90,
      });
    }
    return columns;
  }, []);

  // Utility: Generate year keys from period
  const yearKeys = useMemo(() => {
    if (!startDate || !endDate) return [];
    const keys: string[] = [];
    for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
      keys.push(`Y${y - startDate.getFullYear() + 1}`);
    }
    return keys;
  }, [startDate, endDate]);

  // Utility: Generate month keys from period
  const monthKeys = useMemo(() => {
    if (!startDate || !endDate) return [];
    const keys: string[] = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (current <= end) {
      keys.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
      current.setMonth(current.getMonth() + 1);
    }
    return keys;
  }, [startDate, endDate]);

  // Generic NumberInput cell renderer factory for AG Grid (for new assumption pages)
  const createGenericNumberCellRenderer = (
    fieldName: string,
    setData: React.Dispatch<React.SetStateAction<any[]>>,
    idField: string,
    options?: { min?: number; step?: number; suffix?: string }
  ) => {
    return (props: ICellRendererParams) => {
      const handleChange = (newValue: number) => {
        props.node.setDataValue(props.colDef?.field || '', newValue);
        setData((prev: any[]) =>
          prev.map((e: any) =>
            e[idField] === props.data[idField] ? { ...e, [props.colDef?.field || '']: newValue } : e
          )
        );
      };

      return (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
          <NumberInput
            value={props.value ?? 0}
            onChange={handleChange}
            size="S"
            min={options?.min ?? 0}
            step={options?.step}
            showLabel={false}
            variant="Stepper"
          />
        </div>
      );
    };
  };

  // ========== LOAD FACTOR: Column Definitions ==========
  const targetedYearlyLFColDefs = useMemo<ColDef[]>(() => {
    const yearCols = ['Y2', 'Y3', 'Y4', 'Y5', 'Y6'].map(y => ({
      field: y,
      headerName: y,
      flex: 1,
      minWidth: 90,
      cellRenderer: (props: ICellRendererParams) => {
        const handleChange = (newValue: number) => {
          setTargetedYearlyLF(prev => ({
            ...prev,
            [props.data.classType]: { ...prev[props.data.classType], [y]: newValue },
          }));
        };
        return (
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            <NumberInput value={props.value ?? 0} onChange={handleChange} size="S" min={0} max={100} showLabel={false} variant="Stepper" />
          </div>
        );
      },
    }));
    return [
      { field: 'classType', headerName: '', width: 120, pinned: 'left' as const },
      ...yearCols,
    ];
  }, []);

  const targetedYearlyLFRowData = useMemo(() =>
    Object.entries(targetedYearlyLF).map(([classType, values]) => ({ classType, ...values })),
    [targetedYearlyLF]
  );

  const firstYearRampUpColDefs = useMemo<ColDef[]>(() => {
    if (!startDate || !endDate) return [];
    const monthCols = generateMonthColumns(startDate, new Date(startDate.getFullYear(), startDate.getMonth() + 11, 1));
    const editableCols = monthCols.map(col => ({
      ...col,
      cellRenderer: (props: ICellRendererParams) => {
        const handleChange = (newValue: number) => {
          setFirstYearRampUp(prev => ({
            ...prev,
            [props.data.classType]: { ...prev[props.data.classType], [col.field as string]: newValue },
          }));
        };
        return (
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            <NumberInput value={props.value ?? 0} onChange={handleChange} size="S" min={0} showLabel={false} variant="Stepper" />
          </div>
        );
      },
    }));
    return [
      { field: 'classType', headerName: '', width: 120, pinned: 'left' as const },
      ...editableCols,
    ];
  }, [startDate, endDate, generateMonthColumns]);

  const firstYearRampUpRowData = useMemo(() =>
    Object.entries(firstYearRampUp).map(([classType, values]) => ({ classType, ...values })),
    [firstYearRampUp]
  );

  // Load Factor per Route data
  const routeLoadFactorRowData = useMemo(() => {
    if (routeLoadFactorData.length > 0) return routeLoadFactorData;
    const rows: Array<{ routeId: string; classType: string; routeDisplay: string; [key: string]: number | string }> = [];
    const classes = ['Economy (Y)', 'Business (C)', 'Premium (W)'];
    routeEntries.forEach(route => {
      classes.forEach(cls => {
        rows.push({
          routeId: route.id,
          classType: cls,
          routeDisplay: `${route.origin} - ${route.destination}`,
        });
      });
    });
    return rows;
  }, [routeEntries, routeLoadFactorData]);

  const routeLoadFactorColDefs = useMemo<ColDef[]>(() => {
    const monthCols = generateMonthColumns(startDate, endDate).map(col => ({
      ...col,
      cellRenderer: (props: ICellRendererParams) => {
        const handleChange = (newValue: number) => {
          setRouteLoadFactorData(prev => {
            const existing = [...prev];
            const idx = existing.findIndex(r => r.routeId === props.data.routeId && r.classType === props.data.classType);
            if (idx >= 0) {
              existing[idx] = { ...existing[idx], [col.field as string]: newValue };
            } else {
              existing.push({ ...props.data, [col.field as string]: newValue });
            }
            return existing;
          });
        };
        return (
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            <NumberInput value={props.value ?? 0} onChange={handleChange} size="S" min={0} showLabel={false} variant="Stepper" />
          </div>
        );
      },
    }));
    return [
      { field: 'routeDisplay', headerName: 'O&D', width: 140, pinned: 'left' as const },
      { field: 'classType', headerName: 'Class', width: 120, pinned: 'left' as const },
      ...monthCols,
    ];
  }, [startDate, endDate, generateMonthColumns]);

  // ========== REVENUE: Column Definitions ==========
  const ancillaryRevenueColDefs = useMemo<ColDef[]>(() => {
    const monthCols = generateMonthColumns(startDate, endDate).map(col => ({
      ...col,
      cellRenderer: (props: ICellRendererParams) => {
        const handleChange = (newValue: number) => {
          setAncillaryRevenueData(prev =>
            prev.map(r => r.classType === props.data.classType ? { ...r, [col.field as string]: newValue } : r)
          );
        };
        return (
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            <NumberInput value={props.value ?? 200} onChange={handleChange} size="S" min={0} showLabel={false} variant="Stepper" />
          </div>
        );
      },
    }));
    return [
      { field: 'classType', headerName: '', width: 100, pinned: 'left' as const },
      ...monthCols,
    ];
  }, [startDate, endDate, generateMonthColumns]);

  // Cargo yearly data row generation
  const cargoYearlyRowData = useMemo(() => {
    const metrics = [
      'Addressable Market', 'Market Share (%)', 'Volume carried', 'Price per kg',
      'Cargo Revenues', 'Number of Sectors', 'Avg Volume per Sector', 'Avg Volume per Inbound Sector',
    ];
    const editableMetrics = ['Market Share (%)', 'Price per kg', 'Number of Sectors'];
    if (cargoYearlyData.length > 0) return { rows: cargoYearlyData, editableMetrics };
    return {
      rows: metrics.map(metric => ({ metric })),
      editableMetrics,
    };
  }, [cargoYearlyData]);

  const cargoYearlyColDefs = useMemo<ColDef[]>(() => {
    const editableMetrics = ['Market Share (%)', 'Price per kg', 'Number of Sectors'];
    const yCols = yearKeys.map(y => ({
      field: y,
      headerName: y,
      flex: 1,
      minWidth: 100,
      cellRenderer: (props: ICellRendererParams) => {
        const isEditable = editableMetrics.includes(props.data.metric);
        if (!isEditable) {
          return <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}><span>{props.value ?? '-'}</span></div>;
        }
        const handleChange = (newValue: number) => {
          setCargoYearlyData(prev => {
            const existing = [...prev];
            const idx = existing.findIndex(r => r.metric === props.data.metric);
            if (idx >= 0) {
              existing[idx] = { ...existing[idx], [y]: newValue };
            } else {
              existing.push({ ...props.data, [y]: newValue });
            }
            return existing;
          });
        };
        return (
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            <NumberInput value={props.value ?? 0} onChange={handleChange} size="S" min={0} showLabel={false} variant="Stepper" />
          </div>
        );
      },
    }));
    return [
      { field: 'metric', headerName: '', width: 200, pinned: 'left' as const },
      ...yCols,
    ];
  }, [yearKeys]);

  // Cargo monthly data (read-only)
  const cargoMonthlyRowData = useMemo(() => [
    { metric: 'Volume carried' },
    { metric: 'Cargo Revenues (USD)' },
  ], []);

  const cargoMonthlyColDefs = useMemo<ColDef[]>(() => {
    const monthCols = generateMonthColumns(startDate, endDate).map(col => ({
      ...col,
      cellRenderer: (props: ICellRendererParams) => (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}><span>{props.value ?? '-'}</span></div>
      ),
    }));
    return [
      { field: 'metric', headerName: '', width: 180, pinned: 'left' as const },
      ...monthCols,
    ];
  }, [startDate, endDate, generateMonthColumns]);

  // ========== FINANCIAL: Column Definitions ==========
  const inflationColDefs = useMemo<ColDef[]>(() => {
    const yCols = yearKeys.map(y => ({
      field: y,
      headerName: y,
      flex: 1,
      minWidth: 90,
      cellRenderer: (props: ICellRendererParams) => {
        const handleChange = (newValue: number) => {
          setInflationData(prev =>
            prev.map(r => r.factor === props.data.factor ? { ...r, [y]: newValue } : r)
          );
        };
        return (
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            <NumberInput value={props.value ?? 0} onChange={handleChange} size="S" showLabel={false} variant="Stepper" />
          </div>
        );
      },
    }));
    return [
      { field: 'factor', headerName: '', width: 220, pinned: 'left' as const },
      ...yCols,
    ];
  }, [yearKeys]);

  // Working Capital data initialization
  const workingCapitalRowData = useMemo(() => {
    if (workingCapitalData.length > 0) return workingCapitalData;
    const revenueItems = ['Passenger Revenues', 'Ancillary Revenues', 'Subsidies', 'Cargo'];
    const costItems = ['ACMI', 'Aircraft Leasing', 'Fuel', 'Flight Crew', 'Cabin Crew', 'Crew Training', 'Navigation', 'Landing', 'Ground Handling', 'Catering', 'Maintenance', 'Insurance'];
    return [
      ...revenueItems.map(item => ({ category: 'REVENUES', item })),
      ...costItems.map(item => ({ category: 'COSTS', item })),
    ];
  }, [workingCapitalData]);

  const workingCapitalColDefs = useMemo<ColDef[]>(() => {
    const periodCols = ['M-6', 'M-5', 'M-4', 'M-3', 'M-2', 'M-1', 'M-0', 'M+1', 'M+2', 'M+3', 'Total'].map(period => ({
      field: period,
      headerName: period,
      flex: 1,
      minWidth: 80,
      cellRenderer: (props: ICellRendererParams) => {
        if (period === 'Total') {
          return <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}><span>{props.value ?? '-'}</span></div>;
        }
        const handleChange = (newValue: number) => {
          setWorkingCapitalData(prev => {
            const existing = prev.length > 0 ? [...prev] : workingCapitalRowData.map(r => ({ ...r }));
            const idx = existing.findIndex(r => r.item === props.data.item);
            if (idx >= 0) {
              existing[idx] = { ...existing[idx], [period]: newValue };
            }
            return existing;
          });
        };
        return (
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            <NumberInput value={props.value ?? 0} onChange={handleChange} size="S" showLabel={false} variant="Stepper" />
          </div>
        );
      },
    }));
    return [
      { field: 'category', headerName: '', width: 110, pinned: 'left' as const,
        cellStyle: (params: { value: string }) => params.value ? { fontWeight: 700, color: 'var(--text-corporate)', textTransform: 'uppercase' as const, fontSize: '12px' } : {},
        rowSpan: (params: { data: { category: string }; node: { rowIndex: number } }) => {
          if (params.data.category === 'REVENUES' && params.node.rowIndex === 0) return 4;
          if (params.data.category === 'COSTS' && params.node.rowIndex === 4) return 12;
          return 1;
        },
      },
      { field: 'item', headerName: 'Month Prior/After the flight', width: 200, pinned: 'left' as const },
      ...periodCols,
    ];
  }, [workingCapitalRowData]);

  // Selling & Distribution: yearly inputs
  const sellingCostYearlyInputs = useMemo(() => {
    return yearKeys.map(y => ({
      key: y,
      label: y,
      value: sellingCostPerPax[y] ?? 0,
    }));
  }, [yearKeys, sellingCostPerPax]);

  const marketingBudgetYearlyInputs = useMemo(() => {
    return yearKeys.map(y => ({
      key: y,
      label: y,
      value: marketingBudget[y] ?? 0,
    }));
  }, [yearKeys, marketingBudget]);

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
    min = 0,
    options?: { errorWhenZero?: boolean }
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

      const value = props.value ?? 0;
      const hasError = options?.errorWhenZero && value === 0;

      return (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
          <NumberInput
            value={value}
            onChange={handleChange}
            size="S"
            min={min}
            showLabel={false}
            variant="Stepper"
            state={hasError ? 'Error' : 'Default'}
          />
        </div>
      );
    };
  };

  // Cost Operations cell renderers
  const GroundHandlingCellRenderer = createNumberCellRenderer('groundHandlingCharge', setCostOperationsData, 0, { errorWhenZero: true });
  const FuelAgeingCellRenderer = createNumberCellRenderer('fuelAgeingFactor', setCostOperationsData, 0, { errorWhenZero: true });

  // Cost Ownership cell renderers
  const MonthlyLeaseCellRenderer = createNumberCellRenderer('monthlyLeaseRate', setCostOwnershipData, 0, { errorWhenZero: true });
  const AcValueCellRenderer = createNumberCellRenderer('acValueUponAcquisition', setCostOwnershipData, 0, { errorWhenZero: true });
  const SparesProvisioningCellRenderer = createNumberCellRenderer('sparesProvisioningPerFamily', setCostOwnershipData, 0, { errorWhenZero: true });

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
        cabinAttendantPerCrew: 1
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
        .map(e => ({ id: e.id, captainPerCrew: 1, firstOfficerPerCrew: 1, cabinManagerPerCrew: 1, cabinAttendantPerCrew: 1 }));
      return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
    });
  }, [fleetEntries]);

  // Network: Routes helper
  const hasRoutes = routeEntries.length > 0;

  // Routes selection state
  const [selectedRouteIds, setSelectedRouteIds] = useState<Set<string>>(new Set());

  // Routes selection handlers
  const onRouteSelectionChanged = useCallback((event: { api: { getSelectedRows: () => RouteEntry[]; deselectAll: () => void } }) => {
    routesGridApiRef.current = event.api;
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
    routesGridApiRef.current?.deselectAll();
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
    { headerCheckboxSelection: true, checkboxSelection: true, width: 48, maxWidth: 48, suppressMovable: true, resizable: false, cellClass: 'ag-checkbox-cell', headerClass: 'ag-checkbox-header' },
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

    const value = props.value ?? 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <NumberInput
          value={value}
          onChange={handleChange}
          size="S"
          min={0}
          showLabel={false}
          variant="Stepper"
          state={value === 0 ? 'Error' : 'Default'}
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

      const value = props.data?.yield ?? 0;
      return (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
          <NumberInput
            value={value}
            onChange={handleChange}
            size="S"
            min={0}
            step={0.1}
            showLabel={false}
            variant="Stepper"
            state={value === 0 ? 'Error' : 'Default'}
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
          state={displayValue === 'none' ? 'Error' : 'Default'}
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

  // Frequencies: Generate row data with month columns - flatten frequencies object for AG Grid
  const frequenciesRowData = useMemo(() => {
    return routeFrequencyData.map(entry => {
      const route = routeEntries.find(r => r.id === entry.routeId);
      return {
        ...entry,
        ...entry.frequencies, // Flatten frequencies so each month is a direct property
        routeDisplay: route ? `${route.origin} - ${route.destination}` : '',
        startDateDisplay: route?.startDate?.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) || '',
        endDateDisplay: route?.endDate?.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) || '',
      };
    });
  }, [routeFrequencyData, routeEntries]);

  // Frequency cell renderer - receives monthKey and allMonthKeys via cellRendererParams
  const FrequencyCellRenderer = (props: ICellRendererParams & { monthKey: string; allMonthKeys: string[] }) => {
    const { monthKey, allMonthKeys } = props;

    const handleChange = (newValue: number) => {
      // Find months to update (current and all following)
      const monthIndex = allMonthKeys.indexOf(monthKey);
      const monthsToUpdate = monthIndex >= 0 ? allMonthKeys.slice(monthIndex) : [monthKey];

      // Update AG Grid's internal data for all affected months
      monthsToUpdate.forEach(mk => {
        props.node.setDataValue(mk, newValue);
      });

      // Update React state - nested frequencies object
      setRouteFrequencyData((prev) =>
        prev.map((f) => {
          if (f.routeId === props.data.routeId) {
            const updatedFrequencies = { ...f.frequencies };
            monthsToUpdate.forEach(mk => {
              updatedFrequencies[mk] = newValue;
            });
            return { ...f, frequencies: updatedFrequencies };
          }
          return f;
        })
      );
    };

    // Check if any frequency in this row is > 0
    const hasAnyFrequency = allMonthKeys.some(mk => (props.data?.[mk] ?? 0) > 0);

    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <NumberInput
          value={props.value ?? 0}
          onChange={handleChange}
          size="XS"
          min={0}
          showLabel={false}
          variant="Stepper"
          state={!hasAnyFrequency ? 'Error' : 'Default'}
        />
      </div>
    );
  };

  // Frequencies column definitions
  const frequenciesColDefs = useMemo<ColDef[]>(() => {
    const fixedCols: ColDef[] = [
      {
        field: 'routeDisplay',
        headerName: 'Route',
        pinned: 'left',
        width: 100,
      },
      {
        field: 'startDateDisplay',
        headerName: 'Start',
        pinned: 'left',
        width: 72,
      },
      {
        field: 'endDateDisplay',
        headerName: 'End',
        pinned: 'left',
        width: 72,
      },
    ];

    const allMonthKeys = generateMonthColumns(startDate, endDate).map(c => c.field as string);

    const monthCols = generateMonthColumns(startDate, endDate).map(col => ({
      ...col,
      minWidth: 72,
      cellRenderer: FrequencyCellRenderer,
      cellRendererParams: {
        monthKey: col.field,
        allMonthKeys,
      },
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
    { headerCheckboxSelection: true, checkboxSelection: true, width: 48, maxWidth: 48, suppressMovable: true, resizable: false, cellClass: 'ag-checkbox-cell', headerClass: 'ag-checkbox-header' },
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
  const onSelectionChanged = useCallback((event: { api: { getSelectedRows: () => FleetEntry[]; deselectAll: () => void } }) => {
    fleetGridApiRef.current = event.api;
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
  const fleetGridApiRef = useRef<{ deselectAll: () => void } | null>(null);
  const routesGridApiRef = useRef<{ deselectAll: () => void } | null>(null);

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
  // Fleet sub-tab error counts
  const costOpsErrors = useMemo(() => {
    if (!hasAircraft) return 0;
    return costOperationsData.filter(c => c.groundHandlingCharge === 0 || c.fuelAgeingFactor === 0).length;
  }, [costOperationsData, hasAircraft]);

  const costOwnershipErrors = useMemo(() => {
    if (!hasAircraft) return 0;
    return costOwnershipData.filter(c => c.monthlyLeaseRate === 0 || c.acValueUponAcquisition === 0 || c.sparesProvisioningPerFamily === 0).length;
  }, [costOwnershipData, hasAircraft]);

  // Network sub-tab error counts
  const pricingErrors = useMemo(() => {
    if (!hasRoutes) return 0;
    return routePricingData.filter(p => p.marketYield === 0 || p.yield === 0).length;
  }, [routePricingData, hasRoutes]);

  const fleetPlanErrors = useMemo(() => {
    if (!hasRoutes || !hasAircraft) return 0;
    return fleetPlanData.filter(f => !f.allocatedAircraftId).length;
  }, [fleetPlanData, hasRoutes, hasAircraft]);

  const frequencyErrors = useMemo(() => {
    if (!hasRoutes) return 0;
    return routeFrequencyData.filter(f => {
      const values = Object.values(f.frequencies);
      return values.length === 0 || values.every(v => v === 0);
    }).length;
  }, [routeFrequencyData, hasRoutes]);

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
      if (fleetEntries.length === 0) return 1;
      return costOpsErrors + costOwnershipErrors;
    }
    if (itemId === 'network') {
      if (routeEntries.length === 0) return 1;
      return pricingErrors + fleetPlanErrors + frequencyErrors;
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
                <div className={`study-page__tab-wrapper${!hasAircraft ? ' study-page__tab-wrapper--error' : ''}`}>
                  <Tab
                    label="Fleet"
                    size="M"
                    status={fleetTab === 'fleet' ? 'Active' : 'Default'}
                    onClick={() => setFleetTab('fleet')}
                  />
                </div>
                <div className={`study-page__tab-wrapper${costOpsErrors > 0 ? ' study-page__tab-wrapper--error' : ''}`}>
                  <Tab
                    label="Cost Operations"
                    size="M"
                    status={hasAircraft && fleetTab === 'cost-operations' ? 'Active' : 'Default'}
                    disabled={!hasAircraft}
                    onClick={() => { if (hasAircraft) setFleetTab('cost-operations'); }}
                  />
                </div>
                <div className={`study-page__tab-wrapper${costOwnershipErrors > 0 ? ' study-page__tab-wrapper--error' : ''}`}>
                  <Tab
                    label="Cost Ownership"
                    size="M"
                    status={hasAircraft && fleetTab === 'cost-ownership' ? 'Active' : 'Default'}
                  disabled={!hasAircraft}
                  onClick={() => { if (hasAircraft) setFleetTab('cost-ownership'); }}
                  />
                </div>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            label=""
                            leftIcon="system_update_alt"
                            rightIcon="dropdown"
                            variant="Outlined"
                            size="S"
                            className="study-page__import-fleet-btn"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem icon="system_update_alt" onSelect={() => setIsImportAirlineFleetModalOpen(true)}>
                            Import from an Airline
                          </DropdownMenuItem>
                          <DropdownMenuItem icon="drive_file_move" disabled>
                            Load from an other Study
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem icon="upload" disabled>
                            Upload from CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem icon="download" disabled>
                            Download as CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem icon="download" disabled>
                            Download an empty CSV Template
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                                onClick={() => setIsImportAirlineFleetModalOpen(true)}
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
                <div className={`study-page__tab-wrapper${!hasRoutes ? ' study-page__tab-wrapper--error' : ''}`}>
                  <Tab
                    label="Routes"
                    size="M"
                    status={networkTab === 'routes' ? 'Active' : 'Default'}
                    onClick={() => setNetworkTab('routes')}
                  />
                </div>
                <div className={`study-page__tab-wrapper${pricingErrors > 0 ? ' study-page__tab-wrapper--error' : ''}`}>
                  <Tab
                    label="Pricing"
                    size="M"
                    status={hasRoutes && networkTab === 'pricing' ? 'Active' : 'Default'}
                    disabled={!hasRoutes}
                    onClick={() => { if (hasRoutes) setNetworkTab('pricing'); }}
                  />
                </div>
                <div className={`study-page__tab-wrapper${fleetPlanErrors > 0 ? ' study-page__tab-wrapper--error' : ''}`}>
                  <Tab
                    label="Fleet Plan"
                    size="M"
                    status={hasRoutes && hasAircraft && networkTab === 'fleet-plan' ? 'Active' : 'Default'}
                    disabled={!hasRoutes || !hasAircraft}
                    onClick={() => { if (hasRoutes && hasAircraft) setNetworkTab('fleet-plan'); }}
                  />
                </div>
                <div className={`study-page__tab-wrapper${frequencyErrors > 0 ? ' study-page__tab-wrapper--error' : ''}`}>
                  <Tab
                    label="Frequencies"
                    size="M"
                    status={hasRoutes && networkTab === 'frequencies' ? 'Active' : 'Default'}
                    disabled={!hasRoutes}
                    onClick={() => { if (hasRoutes) setNetworkTab('frequencies'); }}
                  />
                </div>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            label=""
                            leftIcon="system_update_alt"
                            rightIcon="dropdown"
                            variant="Outlined"
                            size="S"
                            className="study-page__import-fleet-btn"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem icon="system_update_alt" onSelect={() => setIsImportAirlineNetworkModalOpen(true)}>
                            Import from an Airline
                          </DropdownMenuItem>
                          <DropdownMenuItem icon="drive_file_move" disabled>
                            Load from an other Study
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem icon="upload" disabled>
                            Upload from CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem icon="download" disabled>
                            Download as CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem icon="download" disabled>
                            Download an empty CSV Template
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                            <>
                              <Button
                                label="ADD ROUTE"
                                leftIcon="add"
                                variant="Outlined"
                                size="M"
                                onClick={() => setIsAddRouteModalOpen(true)}
                              />
                              <Button
                                label="IMPORT NETWORK"
                                leftIcon="system_update_alt"
                                variant="Outlined"
                                size="M"
                                onClick={() => setIsImportAirlineNetworkModalOpen(true)}
                              />
                            </>
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
                      className="as-ag-grid study-page__frequencies-grid"
                      rowData={frequenciesRowData}
                      columnDefs={frequenciesColDefs}
                      getRowId={(params) => params.data.routeId}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========== LOAD FACTOR CONTENT ========== */}
          {selectedItem.itemId === 'load-factor' && (
            <div className="study-page__fleet">
              <div className="study-page__fleet-tabs">
                <Tab label="General Load Factor" size="M" status={loadFactorTab === 'general' ? 'Active' : 'Default'} onClick={() => setLoadFactorTab('general')} />
                <Tab label="Load Factor per Route" size="M" status={loadFactorTab === 'per-route' ? 'Active' : 'Default'} disabled={!hasRoutes} onClick={() => { if (hasRoutes) setLoadFactorTab('per-route'); }} />
              </div>

              {loadFactorTab === 'general' && (
                <div className="study-page__assumption-content">
                  <h2 className="study-page__fleet-title">General Load Factor</h2>

                  {/* Targeted Yearly Load Factor */}
                  <div className="study-page__section">
                    <div className="study-page__section-title-row">
                      <h3 className="study-page__section-title">Targeted Yearly Load Factor</h3>
                    </div>
                    <div className="study-page__fleet-table" style={{ maxHeight: 200 }}>
                      <AgGridReact
                        className="as-ag-grid"
                        rowData={targetedYearlyLFRowData}
                        columnDefs={targetedYearlyLFColDefs}
                        getRowId={(params) => params.data.classType}
                        domLayout="autoHeight"
                      />
                    </div>
                  </div>

                  {/* Seasonality Load Factor Correction */}
                  <div className="study-page__section">
                    <div className="study-page__section-title-row">
                      <h3 className="study-page__section-title">Seasonality Load Factor Correction</h3>
                      <SimpleTooltip label="Monthly, applicable from Y2 onwards" delayDuration={0}>
                        <span className="study-page__section-info-icon"><Icon name="info" size={16} /></span>
                      </SimpleTooltip>
                    </div>
                    <div className="study-page__form-grid">
                      {Object.entries(seasonalityCorrection).map(([month, value]) => (
                        <NumberInput
                          key={month}
                          label={month}
                          value={value}
                          onChange={(v) => setSeasonalityCorrection(prev => ({ ...prev, [month]: v }))}
                          size="S"
                          min={0}
                          showLabel
                        />
                      ))}
                    </div>
                  </div>

                  {/* First Year Load Factor Ramp Up */}
                  <div className="study-page__section">
                    <div className="study-page__section-title-row">
                      <h3 className="study-page__section-title">First Year Load Factor Ramp Up</h3>
                    </div>
                    <div className="study-page__fleet-table" style={{ maxHeight: 200 }}>
                      <AgGridReact
                        className="as-ag-grid"
                        rowData={firstYearRampUpRowData}
                        columnDefs={firstYearRampUpColDefs}
                        getRowId={(params) => params.data.classType}
                        domLayout="autoHeight"
                      />
                    </div>
                  </div>

                  {/* Maximum Acceptable Load Factor */}
                  <div className="study-page__section">
                    <div className="study-page__section-title-row">
                      <h3 className="study-page__section-title">Maximum Acceptable Load Factor</h3>
                      <SimpleTooltip label="Value never exceeded, even in peak season" delayDuration={0}>
                        <span className="study-page__section-info-icon"><Icon name="info" size={16} /></span>
                      </SimpleTooltip>
                    </div>
                    <div className="study-page__form-grid">
                      <NumberInput label="Economy (Y)" value={maxLoadFactor.economy} onChange={(v) => setMaxLoadFactor(prev => ({ ...prev, economy: v }))} size="S" min={0} max={100} showLabel />
                      <NumberInput label="Business (C)" value={maxLoadFactor.business} onChange={(v) => setMaxLoadFactor(prev => ({ ...prev, business: v }))} size="S" min={0} max={100} showLabel />
                      <NumberInput label="Premium (W)" value={maxLoadFactor.premium} onChange={(v) => setMaxLoadFactor(prev => ({ ...prev, premium: v }))} size="S" min={0} max={100} showLabel />
                    </div>
                  </div>
                </div>
              )}

              {loadFactorTab === 'per-route' && (
                <div className="study-page__fleet-content">
                  <div className="study-page__fleet-title-bar">
                    <h2 className="study-page__fleet-title">Load Factor</h2>
                    <div className="study-page__fleet-title-right">
                      <span className="label-regular-s study-page__fleet-entry-count">
                        {routeLoadFactorRowData.length} Entries
                      </span>
                      <TextInput placeholder="Search" size="S" showLeftIcon leftIcon="search" showLabel={false} className="study-page__fleet-search" />
                    </div>
                    <div className="study-page__fleet-actions">
                      <Button label="" leftIcon="download" rightIcon="arrow_drop_down" variant="Outlined" size="S" onClick={() => {}} />
                    </div>
                  </div>
                  <div className="study-page__fleet-table">
                    <AgGridReact
                      className="as-ag-grid"
                      rowData={routeLoadFactorRowData}
                      columnDefs={routeLoadFactorColDefs}
                      getRowId={(params) => `${params.data.routeId}-${params.data.classType}`}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========== OPERATIONAL COST CONTENT ========== */}
          {selectedItem.itemId === 'operational-cost' && (
            <div className="study-page__fleet">
              <div className="study-page__fleet-tabs">
                <Tab label="Fuel Cost" size="M" status={operationalCostTab === 'fuel-cost' ? 'Active' : 'Default'} onClick={() => setOperationalCostTab('fuel-cost')} />
                <Tab label="Crew Costs" size="M" status={operationalCostTab === 'crew-costs' ? 'Active' : 'Default'} onClick={() => setOperationalCostTab('crew-costs')} />
                <Tab label="Catering Costs" size="M" status={operationalCostTab === 'catering-costs' ? 'Active' : 'Default'} onClick={() => setOperationalCostTab('catering-costs')} />
                <Tab label="Maintenance Costs" size="M" status={operationalCostTab === 'maintenance-costs' ? 'Active' : 'Default'} onClick={() => setOperationalCostTab('maintenance-costs')} />
                <Tab label="Selling and Distribution Costs" size="M" status={operationalCostTab === 'selling-distribution' ? 'Active' : 'Default'} onClick={() => setOperationalCostTab('selling-distribution')} />
              </div>

              {/* Fuel Cost */}
              {operationalCostTab === 'fuel-cost' && (
                <div className="study-page__assumption-content">
                  <h2 className="study-page__fleet-title">Fuel Cost</h2>
                  <div className="study-page__form-grid--wide study-page__form-grid">
                    <NumberInput
                      label="Av. Fuel Price Including Distribution (USD/US Gallon)"
                      value={fuelPricePerGallon}
                      onChange={setFuelPricePerGallon}
                      size="S"
                      min={0}
                      step={0.1}
                      showLabel
                      showInfo
                      infoText="Average fuel price including distribution costs"
                    />
                    <div className="study-page__readonly-field">
                      <span className="study-page__readonly-label">Av. Fuel Price (USD/kg)</span>
                      <div className="study-page__readonly-value">{(fuelPricePerGallon * 0.264172).toFixed(2)}</div>
                    </div>
                    <NumberInput
                      label="Fuel Deposits in Advance (month)"
                      value={fuelDepositsMonths}
                      onChange={setFuelDepositsMonths}
                      size="S"
                      min={0}
                      showLabel
                    />
                  </div>
                </div>
              )}

              {/* Crew Costs */}
              {operationalCostTab === 'crew-costs' && (
                <div className="study-page__assumption-content">
                  <h2 className="study-page__fleet-title">Crew Cost</h2>

                  {/* General Crew Costs */}
                  <div className="study-page__section">
                    <div className="study-page__section-title-row">
                      <h3 className="study-page__section-title">General Crew Costs</h3>
                    </div>
                    <div className="study-page__form-grid--wide study-page__form-grid">
                      <NumberInput label="Crew Ratio per Aircraft" value={crewRatioPerAircraft} onChange={setCrewRatioPerAircraft} size="S" min={0} step={0.1} showLabel showInfo infoText="Number of crew sets per aircraft" />
                      <NumberInput label="Cabin Crew Attrition Rate per Month (%)" value={cabinCrewAttrition} onChange={setCabinCrewAttrition} size="S" min={0} step={0.01} showLabel showInfo infoText="Monthly cabin crew attrition rate" />
                      <NumberInput label="Flight Crew Attrition per Year" value={flightCrewAttrition} onChange={setFlightCrewAttrition} size="S" min={0} showLabel showInfo infoText="Yearly flight crew attrition count" />
                    </div>
                  </div>

                  {/* Crew Fixed Wages */}
                  <div className="study-page__section">
                    <div className="study-page__section-title-row">
                      <h3 className="study-page__section-title">Crew Fixed Wages</h3>
                    </div>
                    <div className="study-page__sub-tabs">
                      <ButtonGroup
                        options={[
                          { value: 'wages', label: 'Crew Fixed Wages' },
                          { value: 'monthly-costs', label: 'Monthly Costs per Workers' },
                        ]}
                        value={crewFixedWagesSubTab}
                        onChange={(v) => setCrewFixedWagesSubTab(v as CrewCostSubTabType)}
                        size="S"
                      />
                    </div>
                    {crewFixedWagesSubTab === 'wages' && (
                      <div className="study-page__form-grid--wide study-page__form-grid">
                        <NumberInput label="Captain Base Salary ($)" value={crewFixedWages.captainBaseSalary} onChange={(v) => setCrewFixedWages(p => ({ ...p, captainBaseSalary: v }))} size="S" min={0} showLabel />
                        <NumberInput label="First Officer Base Salary ($)" value={crewFixedWages.firstOfficerBaseSalary} onChange={(v) => setCrewFixedWages(p => ({ ...p, firstOfficerBaseSalary: v }))} size="S" min={0} showLabel />
                        <NumberInput label="Cabin Manager Base Salary ($)" value={crewFixedWages.cabinManagerBaseSalary} onChange={(v) => setCrewFixedWages(p => ({ ...p, cabinManagerBaseSalary: v }))} size="S" min={0} showLabel />
                        <NumberInput label="Cabin Attendant Base Salary ($)" value={crewFixedWages.cabinAttendantBaseSalary} onChange={(v) => setCrewFixedWages(p => ({ ...p, cabinAttendantBaseSalary: v }))} size="S" min={0} showLabel />
                        <NumberInput label="Captain Housing Allowance ($)" value={crewFixedWages.captainHousingAllowance} onChange={(v) => setCrewFixedWages(p => ({ ...p, captainHousingAllowance: v }))} size="S" min={0} showLabel />
                        <NumberInput label="First Officer Housing Allowance ($)" value={crewFixedWages.firstOfficerHousingAllowance} onChange={(v) => setCrewFixedWages(p => ({ ...p, firstOfficerHousingAllowance: v }))} size="S" min={0} showLabel />
                        <NumberInput label="Cabin Manager Housing Allowance ($)" value={crewFixedWages.cabinManagerHousingAllowance} onChange={(v) => setCrewFixedWages(p => ({ ...p, cabinManagerHousingAllowance: v }))} size="S" min={0} showLabel />
                        <NumberInput label="Cabin Attendant Housing Allowance ($)" value={crewFixedWages.cabinAttendantHousingAllowance} onChange={(v) => setCrewFixedWages(p => ({ ...p, cabinAttendantHousingAllowance: v }))} size="S" min={0} showLabel />
                        <NumberInput label="Captain Transport Allowance ($)" value={crewFixedWages.captainTransportAllowance} onChange={(v) => setCrewFixedWages(p => ({ ...p, captainTransportAllowance: v }))} size="S" min={0} showLabel />
                        <NumberInput label="First Officer Transport Allowance ($)" value={crewFixedWages.firstOfficerTransportAllowance} onChange={(v) => setCrewFixedWages(p => ({ ...p, firstOfficerTransportAllowance: v }))} size="S" min={0} showLabel />
                        <NumberInput label="Cabin Manager Transport Allowance ($)" value={crewFixedWages.cabinManagerTransportAllowance} onChange={(v) => setCrewFixedWages(p => ({ ...p, cabinManagerTransportAllowance: v }))} size="S" min={0} showLabel />
                      </div>
                    )}
                    {crewFixedWagesSubTab === 'monthly-costs' && (
                      <div className="study-page__readonly-field" style={{ width: '100%', maxWidth: '100%' }}>
                        <div className="study-page__readonly-value" style={{ width: '100%', minHeight: 80, justifyContent: 'center' }}>Calculated values will appear here</div>
                      </div>
                    )}
                  </div>

                  {/* Variable Wages */}
                  <div className="study-page__section">
                    <div className="study-page__section-title-row">
                      <h3 className="study-page__section-title">Variable Wages</h3>
                    </div>
                    <div className="study-page__sub-tabs">
                      <ButtonGroup
                        options={[
                          { value: 'wages', label: 'Variable Wages' },
                          { value: 'monthly-costs', label: 'Wages Costs per Month' },
                        ]}
                        value={crewVariableWagesSubTab}
                        onChange={(v) => setCrewVariableWagesSubTab(v as CrewCostSubTabType)}
                        size="S"
                      />
                    </div>
                    {crewVariableWagesSubTab === 'wages' && (
                      <div className="study-page__form-grid--wide study-page__form-grid">
                        <NumberInput label="Per Diem ($)" value={crewVariableWages.perDiem} onChange={(v) => setCrewVariableWages(p => ({ ...p, perDiem: v }))} size="S" min={0} showLabel />
                        <NumberInput label="Flight Hour Pay ($)" value={crewVariableWages.flightHourPay} onChange={(v) => setCrewVariableWages(p => ({ ...p, flightHourPay: v }))} size="S" min={0} showLabel />
                      </div>
                    )}
                    {crewVariableWagesSubTab === 'monthly-costs' && (
                      <div className="study-page__readonly-field" style={{ width: '100%', maxWidth: '100%' }}>
                        <div className="study-page__readonly-value" style={{ width: '100%', minHeight: 80, justifyContent: 'center' }}>Calculated values will appear here</div>
                      </div>
                    )}
                  </div>

                  {/* Training Costs */}
                  <div className="study-page__section">
                    <div className="study-page__section-title-row">
                      <h3 className="study-page__section-title">Training Costs</h3>
                    </div>
                    <div className="study-page__sub-tabs">
                      <ButtonGroup
                        options={[
                          { value: 'wages', label: 'Training Cost' },
                          { value: 'monthly-costs', label: 'Training Costs per Month' },
                        ]}
                        value={crewTrainingSubTab}
                        onChange={(v) => setCrewTrainingSubTab(v as CrewCostSubTabType)}
                        size="S"
                      />
                    </div>
                    {crewTrainingSubTab === 'wages' && (
                      <div className="study-page__form-grid--wide study-page__form-grid">
                        <NumberInput label="Captain Initial Training ($)" value={crewTraining.captainInitialTraining} onChange={(v) => setCrewTraining(p => ({ ...p, captainInitialTraining: v }))} size="S" min={0} showLabel />
                        <NumberInput label="First Officer Initial Training ($)" value={crewTraining.firstOfficerInitialTraining} onChange={(v) => setCrewTraining(p => ({ ...p, firstOfficerInitialTraining: v }))} size="S" min={0} showLabel />
                        <NumberInput label="Cabin Crew Initial Training ($)" value={crewTraining.cabinCrewInitialTraining} onChange={(v) => setCrewTraining(p => ({ ...p, cabinCrewInitialTraining: v }))} size="S" min={0} showLabel />
                        <NumberInput label="Recurrent Training per Crew ($)" value={crewTraining.recurrentTrainingPerCrew} onChange={(v) => setCrewTraining(p => ({ ...p, recurrentTrainingPerCrew: v }))} size="S" min={0} showLabel />
                        <NumberInput label="Simulator Cost per Session ($)" value={crewTraining.simulatorCostPerSession} onChange={(v) => setCrewTraining(p => ({ ...p, simulatorCostPerSession: v }))} size="S" min={0} showLabel />
                      </div>
                    )}
                    {crewTrainingSubTab === 'monthly-costs' && (
                      <div className="study-page__readonly-field" style={{ width: '100%', maxWidth: '100%' }}>
                        <div className="study-page__readonly-value" style={{ width: '100%', minHeight: 80, justifyContent: 'center' }}>Calculated values will appear here</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Catering Costs */}
              {operationalCostTab === 'catering-costs' && (
                <div className="study-page__assumption-content">
                  <h2 className="study-page__fleet-title">Catering Cost</h2>
                  <div className="study-page__form-grid">
                    <NumberInput label="Economy (Y) ($)" value={cateringCostEconomy} onChange={setCateringCostEconomy} size="S" min={0} showLabel />
                    <NumberInput label="Business (C) ($)" value={cateringCostBusiness} onChange={setCateringCostBusiness} size="S" min={0} showLabel />
                    <NumberInput label="Premium (W) ($)" value={cateringCostPremium} onChange={setCateringCostPremium} size="S" min={0} showLabel />
                  </div>
                </div>
              )}

              {/* Maintenance Costs */}
              {operationalCostTab === 'maintenance-costs' && (
                <div className="study-page__assumption-content">
                  <h2 className="study-page__fleet-title">Maintenance Costs</h2>
                  <div className="study-page__form-grid--wide study-page__form-grid">
                    <NumberInput label="Indirect Maintenance Cost (%)" value={indirectMaintenanceCost} onChange={setIndirectMaintenanceCost} size="S" min={0} showLabel showInfo infoText="Percentage of direct maintenance cost" />
                    <NumberInput label="Maintenance Outsourcing Cost ($)" value={maintenanceOutsourcingCost} onChange={setMaintenanceOutsourcingCost} size="S" min={0} showLabel showInfo infoText="Cost of outsourced maintenance" />
                    <NumberInput label="Cost factor on LLPs due to harsh environment" value={llpCostFactor} onChange={setLlpCostFactor} size="S" min={0} showLabel showInfo infoText="Life Limited Parts cost adjustment factor" />
                  </div>
                </div>
              )}

              {/* Selling and Distribution Costs */}
              {operationalCostTab === 'selling-distribution' && (
                <div className="study-page__assumption-content">
                  <h2 className="study-page__fleet-title">Selling and distribution costs</h2>

                  <div className="study-page__section">
                    <NumberInput label="Initial Marketing budget ($)" value={initialMarketingBudget} onChange={setInitialMarketingBudget} size="S" min={0} showLabel />
                  </div>

                  <div className="study-page__section">
                    <div className="study-page__section-title-row">
                      <h3 className="study-page__section-title">Selling and Distribution Cost per Pax ($/Pax)</h3>
                    </div>
                    <div className="study-page__form-grid">
                      {sellingCostYearlyInputs.map(({ key, label, value }) => (
                        <NumberInput
                          key={key}
                          label={label}
                          value={value}
                          onChange={(v) => setSellingCostPerPax(prev => ({ ...prev, [key]: v }))}
                          size="S"
                          min={0}
                          showLabel
                        />
                      ))}
                    </div>
                  </div>

                  <div className="study-page__section">
                    <div className="study-page__section-title-row">
                      <h3 className="study-page__section-title">Marketing and Communication Yearly Budget ($)</h3>
                    </div>
                    <div className="study-page__form-grid--wide study-page__form-grid">
                      {marketingBudgetYearlyInputs.map(({ key, label, value }) => (
                        <NumberInput
                          key={key}
                          label={label}
                          value={value}
                          onChange={(v) => setMarketingBudget(prev => ({ ...prev, [key]: v }))}
                          size="S"
                          min={0}
                          showLabel
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========== REVENUE CONTENT ========== */}
          {selectedItem.itemId === 'revenue' && (
            <div className="study-page__fleet">
              <div className="study-page__fleet-tabs">
                <Tab label="Ancillary Revenues" size="M" status={revenueTab === 'ancillary' ? 'Active' : 'Default'} onClick={() => setRevenueTab('ancillary')} />
                <Tab label="Cargo Revenues" size="M" status={revenueTab === 'cargo' ? 'Active' : 'Default'} onClick={() => setRevenueTab('cargo')} />
              </div>

              {/* Ancillary Revenues */}
              {revenueTab === 'ancillary' && (
                <div className="study-page__assumption-content">
                  <h2 className="study-page__fleet-title">Ancillary Revenues</h2>

                  <div className="study-page__section">
                    <div className="study-page__section-title-row">
                      <h3 className="study-page__section-title">Ancillary Revenues per passenger</h3>
                    </div>
                    <div className="study-page__fleet-table" style={{ maxHeight: 200 }}>
                      <AgGridReact
                        className="as-ag-grid"
                        rowData={ancillaryRevenueData}
                        columnDefs={ancillaryRevenueColDefs}
                        getRowId={(params) => params.data.classType}
                        domLayout="autoHeight"
                      />
                    </div>
                  </div>

                  <div className="study-page__section">
                    <div className="study-page__section-title-row">
                      <h3 className="study-page__section-title">Deduction for Code Share (%)</h3>
                      <SimpleTooltip label="Percentage deducted from ancillary revenues for code share agreements" delayDuration={0}>
                        <span className="study-page__section-info-icon"><Icon name="info" size={16} /></span>
                      </SimpleTooltip>
                    </div>
                    <NumberInput value={codeShareDeduction} onChange={setCodeShareDeduction} size="S" min={0} max={100} showLabel={false} />
                  </div>
                </div>
              )}

              {/* Cargo Revenues */}
              {revenueTab === 'cargo' && (
                <div className="study-page__assumption-content">
                  <h2 className="study-page__fleet-title">Cargo Revenues</h2>

                  <div className="study-page__form-grid--wide study-page__form-grid">
                    <NumberInput label="Market CAGR (%)" value={cargoMarketCAGR} onChange={setCargoMarketCAGR} size="S" min={0} showLabel showInfo infoText="Compound Annual Growth Rate of the cargo market" />
                    <NumberInput label="Addressable Market (t)" value={cargoAddressableMarket} onChange={setCargoAddressableMarket} size="S" min={0} showLabel showInfo infoText="Total addressable cargo market in tonnes" />
                  </div>

                  <div className="study-page__section">
                    <div className="study-page__fleet-table" style={{ maxHeight: 350 }}>
                      <AgGridReact
                        className="as-ag-grid"
                        rowData={cargoYearlyRowData.rows}
                        columnDefs={cargoYearlyColDefs}
                        getRowId={(params) => params.data.metric}
                        domLayout="autoHeight"
                      />
                    </div>
                  </div>

                  <div className="study-page__section">
                    <div className="study-page__section-title-row">
                      <h3 className="study-page__section-title">Monthly Cargo Calculations</h3>
                    </div>
                    <div className="study-page__fleet-table" style={{ maxHeight: 150 }}>
                      <AgGridReact
                        className="as-ag-grid"
                        rowData={cargoMonthlyRowData}
                        columnDefs={cargoMonthlyColDefs}
                        getRowId={(params) => params.data.metric}
                        domLayout="autoHeight"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========== FINANCIAL CONTENT ========== */}
          {selectedItem.itemId === 'financial' && (
            <div className="study-page__fleet">
              <div className="study-page__fleet-tabs">
                <Tab label="Inflation" size="M" status={financialTab === 'inflation' ? 'Active' : 'Default'} onClick={() => setFinancialTab('inflation')} />
                <Tab label="Taxes" size="M" status={financialTab === 'taxes' ? 'Active' : 'Default'} onClick={() => setFinancialTab('taxes')} />
                <Tab label="Owned AC" size="M" status={financialTab === 'owned-ac' ? 'Active' : 'Default'} onClick={() => setFinancialTab('owned-ac')} />
                <Tab label="Leased AC" size="M" status={financialTab === 'leased-ac' ? 'Active' : 'Default'} onClick={() => setFinancialTab('leased-ac')} />
                <Tab label="Tooling, Spares & Preparation" size="M" status={financialTab === 'tooling' ? 'Active' : 'Default'} onClick={() => setFinancialTab('tooling')} />
                <Tab label="Working Capital" size="M" status={financialTab === 'working-capital' ? 'Active' : 'Default'} onClick={() => setFinancialTab('working-capital')} />
              </div>

              {/* Inflation */}
              {financialTab === 'inflation' && (
                <div className="study-page__assumption-content">
                  <h2 className="study-page__fleet-title">Inflation</h2>
                  <div className="study-page__section">
                    <div className="study-page__section-title-row">
                      <h3 className="study-page__section-title">YoY Inflation</h3>
                    </div>
                    <div className="study-page__fleet-table" style={{ maxHeight: 250 }}>
                      <AgGridReact
                        className="as-ag-grid"
                        rowData={inflationData}
                        columnDefs={inflationColDefs}
                        getRowId={(params) => params.data.factor}
                        domLayout="autoHeight"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Taxes */}
              {financialTab === 'taxes' && (
                <div className="study-page__assumption-content">
                  <h2 className="study-page__fleet-title">Taxes</h2>
                  <div className="study-page__form-stack">
                    <NumberInput label="Effective Corporate Income Tax rate (%)" value={effectiveTaxRate} onChange={setEffectiveTaxRate} size="S" min={0} max={100} showLabel showInfo infoText="Corporate income tax rate applied to profits" />
                    <NumberInput label="Loss Carry Forward (years)" value={lossCarryForward} onChange={setLossCarryForward} size="S" min={0} showLabel showInfo infoText="Number of years losses can be carried forward" />
                    <NumberInput label="Loss Carry Back (years)" value={lossCarryBack} onChange={setLossCarryBack} size="S" min={0} showLabel showInfo infoText="Number of years losses can be carried back" />
                  </div>
                </div>
              )}

              {/* Owned AC */}
              {financialTab === 'owned-ac' && (
                <div className="study-page__assumption-content">
                  <h2 className="study-page__fleet-title">Owned AC</h2>
                  <div className="study-page__form-stack">
                    <NumberInput label="Depreciation rate (%/year)" value={depreciationRate} onChange={setDepreciationRate} size="S" min={0} showLabel showInfo infoText="Annual depreciation rate for owned aircraft" />
                    <NumberInput label="Residual value (%)" value={residualValue} onChange={setResidualValue} size="S" min={0} max={100} showLabel showInfo infoText="Residual value as percentage of acquisition cost" />
                    <NumberInput label="Interest rate (%)" value={interestRate} onChange={setInterestRate} size="S" min={0} showLabel showInfo infoText="Interest rate on aircraft financing" />
                    <NumberInput label="Loan duration (years)" value={loanDuration} onChange={setLoanDuration} size="S" min={0} showLabel showInfo infoText="Duration of the aircraft loan" />
                  </div>
                </div>
              )}

              {/* Leased AC */}
              {financialTab === 'leased-ac' && (
                <div className="study-page__assumption-content">
                  <h2 className="study-page__fleet-title">Leased AC</h2>
                  <div className="study-page__form-stack">
                    <NumberInput label="Cost of Debt (%)" value={costOfDebt} onChange={setCostOfDebt} size="S" min={0} showLabel showInfo infoText="Cost of debt for leased aircraft" />
                    <NumberInput label="Average Life of Capitalized Lease Asset (Years)" value={avgLifeCapitalizedLease} onChange={setAvgLifeCapitalizedLease} size="S" min={0} showLabel showInfo infoText="Average useful life of capitalized lease assets" />
                    <NumberInput label="Aircraft Security Deposit (Month)" value={securityDeposit} onChange={setSecurityDeposit} size="S" min={0} showLabel showInfo infoText="Security deposit in months of lease payments" />
                  </div>
                </div>
              )}

              {/* Tooling, Spares & Preparation */}
              {financialTab === 'tooling' && (
                <div className="study-page__assumption-content">
                  <h2 className="study-page__fleet-title">Tooling, Spares & Preparation</h2>
                  <div className="study-page__form-stack">
                    <NumberInput label="Tooling Amortization Rate (%)" value={toolingAmortRate} onChange={setToolingAmortRate} size="S" min={0} showLabel showInfo infoText="Annual amortization rate for tooling" />
                    <NumberInput label="Tooling Residual Value (%)" value={toolingResidualValue} onChange={setToolingResidualValue} size="S" min={0} max={100} showLabel showInfo infoText="Residual value of tooling as percentage" />
                    <NumberInput label="Spare Usage Rate (%)" value={spareUsageRate} onChange={setSpareUsageRate} size="S" min={0} showLabel />
                    <NumberInput label="Spares Amortization Rate (%)" value={sparesAmortRate} onChange={setSparesAmortRate} size="S" min={0} showLabel />
                    <NumberInput label="Aircraft Preparation Amortization Rate (%)" value={acPreparationAmortRate} onChange={setAcPreparationAmortRate} size="S" min={0} showLabel />
                  </div>
                </div>
              )}

              {/* Working Capital */}
              {financialTab === 'working-capital' && (
                <div className="study-page__fleet-content">
                  <div className="study-page__fleet-title-bar">
                    <h2 className="study-page__fleet-title">Working Capital</h2>
                    <div className="study-page__fleet-title-right">
                      <span className="label-regular-s study-page__fleet-entry-count">
                        {workingCapitalRowData.length} Entries
                      </span>
                      <TextInput placeholder="Search" size="S" showLeftIcon leftIcon="search" showLabel={false} className="study-page__fleet-search" />
                    </div>
                  </div>
                  <div className="study-page__fleet-table">
                    <AgGridReact
                      className="as-ag-grid"
                      rowData={workingCapitalRowData}
                      columnDefs={workingCapitalColDefs}
                      getRowId={(params) => params.data.item}
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

      {/* Import Airline Fleet Modal */}
      <ImportAirlineFleetModal
        isOpen={isImportAirlineFleetModalOpen}
        onClose={() => setIsImportAirlineFleetModalOpen(false)}
        onImportFleet={handleImportAirlineFleet}
        periodStartDate={startDate}
        periodEndDate={endDate}
      />

      {/* Import Airline Network Modal */}
      <ImportAirlineNetworkModal
        isOpen={isImportAirlineNetworkModalOpen}
        onClose={() => setIsImportAirlineNetworkModalOpen(false)}
        onImportNetwork={handleImportAirlineNetwork}
        periodStartDate={startDate}
        periodEndDate={endDate}
      />
    </div>
  );
}
