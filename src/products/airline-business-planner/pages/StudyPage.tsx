import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { useFavicon } from '@/hooks/useFavicon';
import { loadFromStorage, saveToStorage, useDebouncedCallback } from '../hooks/useStudyPersistence';
import type {
  FleetCostOperationsEntry, FleetCostOwnershipEntry, CrewConfigEntry,
  RouteEntry, RoutePricingEntry, FleetPlanEntry, RouteFrequencyEntry,
  Scenario, PersistedStudyData,
} from './types';
import { ASSUMPTION_ITEMS, OUTPUT_ITEMS } from './constants';
import {
  generateMonthColumns as genMonthCols,
  getMonthKeys, getYearKeys, getMonthLabels,
  yearKeyToLabel as yearKeyToLabelFn,
} from '../utils/periodUtils';
import { getActiveClasses, parseLayoutClasses, CLASS_LABELS } from '../utils/cabinClassUtils';
import { AppHeader } from '@/design-system/composites/AppHeader';
import { LeftPanel } from '@/design-system/composites/LeftPanel';
import { PanelHeader } from '@/design-system/composites/PanelHeader';
import { PanelGroup } from '@/design-system/components/PanelGroup';
import { PanelButton } from '@/design-system/components/PanelButton';
import { StudyStatusBar } from '@/design-system/composites/StudyStatusBar';
import { IconButton } from '@/design-system/components/IconButton';
import { Button } from '@/design-system/components/Button';
import { Icon } from '@/design-system/components/Icon';
import { AddAircraftModal, type FleetEntry } from '../components/AddAircraftModal';
import { EditFleetModal, type FleetEntryForEdit } from '../components/EditFleetModal';
import { EditRouteModal, type RouteEntryForEdit } from '../components/EditRouteModal';
import { ImportAirlineFleetModal } from '../components/ImportAirlineFleetModal';
import { ImportAirlineNetworkModal } from '../components/ImportAirlineNetworkModal';
import { AddRouteModal } from '../components/AddRouteModal';
import { PeriodSection } from '../components/sections/PeriodSection';
import { FleetSection } from '../components/sections/FleetSection';
import { NetworkSection } from '../components/sections/NetworkSection';
import { LoadFactorSection } from '../components/sections/LoadFactorSection';
import { OperationalCostSection } from '../components/sections/OperationalCostSection';
import { RevenueSection } from '../components/sections/RevenueSection';
import { FinancialSection } from '../components/sections/FinancialSection';
import '@/design-system/tokens/ag-grid-theme.css';
import './StudyPage.css';

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

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

  // Load persisted data from localStorage (fallback if no location.state)
  const persistedData = useMemo(() => {
    if (locationState?.studyData) return null; // Use location.state if available
    return loadFromStorage(studyId);
  }, [studyId, locationState]);

  const studyName = locationState?.studyName || persistedData?.studyName || 'Study Name';
  const workspaceName = locationState?.workspaceName || persistedData?.workspaceName || 'Workspace Name';
  const studyData = locationState?.studyData;

  // Helper to parse date strings
  const parseDate = (dateStr: string | undefined | null): Date | undefined => {
    if (!dateStr) return undefined;
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

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

  // Form state (Simulation Period) - pre-fill from studyData or persistedData
  const [periodType, setPeriodType] = useState<'dates' | 'duration'>(() => persistedData?.periodType || 'dates');
  const [simulationYears, setSimulationYears] = useState<number>(() => persistedData?.simulationYears || 4);
  const [startDate, setStartDate] = useState<Date | undefined>(() => parseDate(studyData?.startDate) || parseDate(persistedData?.startDate));
  const [endDate, setEndDate] = useState<Date | undefined>(() => parseDate(studyData?.endDate) || parseDate(persistedData?.endDate));
  // Saved dates for restoring when switching back from duration to dates mode
  const savedDatesRef = useRef<{ start?: Date; end?: Date }>({ start: parseDate(studyData?.startDate) || parseDate(persistedData?.startDate), end: parseDate(studyData?.endDate) || parseDate(persistedData?.endDate) });
  // Saved fleet/route entry dates per mode
  const savedFleetDatesRef = useRef<Record<string, { enterInService: Date; retirement?: Date }>>({});
  const savedRouteDatesRef = useRef<Record<string, { startDate: Date; endDate: Date }>>({});
  const savedFleetDatesDurationRef = useRef<Record<string, { enterInService: Date; retirement?: Date }>>({});
  const savedRouteDatesDurationRef = useRef<Record<string, { startDate: Date; endDate: Date }>>({});
  const [operatingDays, setOperatingDays] = useState<number>(() => persistedData?.operatingDays ?? (studyData ? 365 : 0));
  const [startupDuration, setStartupDuration] = useState<number>(() => persistedData?.startupDuration ?? (studyData ? 6 : 0));

  // Fleet cost and crew data
  const [costOperationsData, setCostOperationsData] = useState<FleetCostOperationsEntry[]>(() => persistedData?.costOperationsData || []);
  const [costOwnershipData, setCostOwnershipData] = useState<FleetCostOwnershipEntry[]>(() => persistedData?.costOwnershipData || []);
  const [crewConfigData, setCrewConfigData] = useState<CrewConfigEntry[]>(() => persistedData?.crewConfigData || []);

  // Network state
  const [routeEntries, setRouteEntries] = useState<RouteEntry[]>(() => {
    if (studyData?.routes) {
      return studyData.routes.map(r => ({
        id: r.id, origin: r.origin, destination: r.destination,
        startDate: new Date(r.startDate), endDate: new Date(r.endDate),
      }));
    }
    if (persistedData?.routeEntries) {
      return persistedData.routeEntries.map(r => ({
        id: r.id, origin: r.origin, destination: r.destination,
        startDate: new Date(r.startDate), endDate: new Date(r.endDate),
      }));
    }
    return [];
  });
  const [routePricingData, setRoutePricingData] = useState<RoutePricingEntry[]>(() => {
    if (!persistedData?.routePricingData) return [];
    // Migration: add classCode if missing (old data had one entry per route without classCode)
    return persistedData.routePricingData.map(p => ({
      ...p,
      classCode: p.classCode || 'Y',
    }));
  });
  const [fleetPlanData, setFleetPlanData] = useState<FleetPlanEntry[]>(() => persistedData?.fleetPlanData || []);
  const [routeFrequencyData, setRouteFrequencyData] = useState<RouteFrequencyEntry[]>(() => persistedData?.routeFrequencyData || []);
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
  const [isEditRouteModalOpen, setIsEditRouteModalOpen] = useState(false);
  const [isImportAirlineNetworkModalOpen, setIsImportAirlineNetworkModalOpen] = useState(false);
  const [discountForNormalFares, setDiscountForNormalFares] = useState<number>(() => persistedData?.discountForNormalFares ?? 0);

  // ========== LOAD FACTOR STATE ==========
  // Keys are class codes (F, J, C, W, Y)
  const [targetedYearlyLF, setTargetedYearlyLF] = useState<Record<string, Record<string, number>>>({
    Y: { Y2: 70, Y3: 75, Y4: 80, Y5: 82, Y6: 85 },
    J: { Y2: 60, Y3: 65, Y4: 70, Y5: 72, Y6: 75 },
    W: { Y2: 55, Y3: 60, Y4: 65, Y5: 68, Y6: 70 },
  });
  const [seasonalityCorrection, setSeasonalityCorrection] = useState<Record<string, number>>({
    Jan: 81, Feb: 77, Mar: 96, Apr: 99, May: 108, Jun: 117,
    Jul: 130, Aug: 136, Sep: 115, Oct: 83, Nov: 76, Dec: 83,
  });
  const [firstYearRampUp, setFirstYearRampUp] = useState<Record<string, Record<string, number>>>({
    Y: {},
    J: {},
    W: {},
  });
  const [maxLoadFactor, setMaxLoadFactor] = useState<Record<string, number>>({ Y: 98, J: 95, W: 93 });
  const [routeLoadFactorData, setRouteLoadFactorData] = useState<Array<{ routeId: string; classType: string; [key: string]: number | string }>>([]);

  // ========== OPERATIONAL COST STATE ==========
  const [fuelPricePerGallon, setFuelPricePerGallon] = useState(2.8);
  const [fuelDepositsMonths, setFuelDepositsMonths] = useState(3);
  const [crewRatioPerAircraft, setCrewRatioPerAircraft] = useState(2.8);
  const [cabinCrewAttrition, setCabinCrewAttrition] = useState(0.92);
  const [flightCrewAttrition, setFlightCrewAttrition] = useState(3);
  const [crewFixedWages, setCrewFixedWages] = useState({
    annualSalaryIncrease: 2.5,
    captainGrossWage: 100, companyChargesCaptain: 4,
    firstOfficerGrossWage: 100, companyChargesFirstOfficer: 100,
    flightCrewAdditionalSalary: 100,
    cabinCrewTeamLeaderWage: 100, companyChargesCabinCrewTeamLeader: 100,
    cabinAttendantWage: 100, companyChargesCabinAttendant: 100,
    cabinCrewAdditionalSalary: 100,
  });
  const [crewVariableWages, setCrewVariableWages] = useState({ flightCrewVariablePay: 50, cabinCrewVariablePay: 50 });
  const [crewTraining, setCrewTraining] = useState({
    operatorConversionCourse: 100, typeRatingCost: 100, pilotsAlreadyQualified: 100,
    flightCrewRecurrentTraining: 100, cabinCrewTrainingCost: 100,
  });
  const [cateringCostEconomy, setCateringCostEconomy] = useState(20);
  const [cateringCostBusiness, setCateringCostBusiness] = useState(40);
  const [cateringCostPremium, setCateringCostPremium] = useState(100);
  const [indirectMaintenanceCost, setIndirectMaintenanceCost] = useState(20);
  const [maintenanceOutsourcingCost, setMaintenanceOutsourcingCost] = useState(40);
  const [llpCostFactor, setLlpCostFactor] = useState(100);
  const [initialMarketingBudget, setInitialMarketingBudget] = useState(10000);
  const [sellingCostPerPax, setSellingCostPerPax] = useState<Record<string, number>>({});
  const [marketingBudget, setMarketingBudget] = useState<Record<string, number>>({});

  // ========== REVENUE STATE ==========
  // classType uses class codes (F, J, C, W, Y)
  const [ancillaryRevenueData, setAncillaryRevenueData] = useState<Array<{ classType: string; [key: string]: number | string }>>([
    { classType: 'Y' },
    { classType: 'J' },
    { classType: 'W' },
  ]);
  const [codeShareDeduction, setCodeShareDeduction] = useState(20);
  const [cargoMarketCAGR, setCargoMarketCAGR] = useState(20);
  const [cargoAddressableMarket, setCargoAddressableMarket] = useState(2000);
  const [cargoYearlyData, setCargoYearlyData] = useState<Array<{ metric: string; [key: string]: number | string }>>([]);

  // ========== FINANCIAL STATE ==========
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

  // Fleet data - pre-fill from studyData or persistedData
  const [fleetEntries, setFleetEntries] = useState<FleetEntry[]>(() => {
    if (studyData?.fleet) {
      return studyData.fleet.map((f, index) => ({
        id: f.id,
        aircraftType: f.aircraftType,
        engine: f.engine,
        layout: f.layout,
        numberOfAircraft: f.numberOfAircraft,
        enterInService: new Date(f.enterInService),
        retirement: undefined,
        ownership: (index % 2 === 0 ? 'Owned' : 'Leased') as const,
        cabinClasses: parseLayoutClasses(f.layout),
      }));
    }
    if (persistedData?.fleetEntries) {
      return persistedData.fleetEntries.map(f => ({
        id: f.id,
        aircraftType: f.aircraftType,
        engine: f.engine,
        layout: f.layout,
        numberOfAircraft: f.numberOfAircraft,
        enterInService: new Date(f.enterInService),
        retirement: f.retirement ? new Date(f.retirement) : undefined,
        ownership: f.ownership,
        cabinClasses: f.cabinClasses || parseLayoutClasses(f.layout),
      }));
    }
    return [];
  });

  // Compute active cabin classes from fleet
  const activeClasses = useMemo(() => getActiveClasses(fleetEntries), [fleetEntries]);

  // Handle period type switching — save/restore dates for period and entries
  const handlePeriodTypeChange = useCallback((newType: string) => {
    if (newType === 'duration' && periodType === 'dates') {
      savedDatesRef.current = { start: startDate, end: endDate };
      const fleetSnapshot: Record<string, { enterInService: Date; retirement?: Date }> = {};
      fleetEntries.forEach(e => { fleetSnapshot[e.id] = { enterInService: e.enterInService, retirement: e.retirement }; });
      savedFleetDatesRef.current = fleetSnapshot;
      const routeSnapshot: Record<string, { startDate: Date; endDate: Date }> = {};
      routeEntries.forEach(r => { routeSnapshot[r.id] = { startDate: r.startDate, endDate: r.endDate }; });
      savedRouteDatesRef.current = routeSnapshot;

      const newStart = new Date(2000, 0, 1);
      const newEnd = new Date(2000 + simulationYears - 1, 11, 1);
      setStartDate(newStart);
      setEndDate(newEnd);

      const savedDuration = savedFleetDatesDurationRef.current;
      setFleetEntries(prev => prev.map(e => ({
        ...e,
        enterInService: savedDuration[e.id]?.enterInService ?? newStart,
        retirement: savedDuration[e.id] ? savedDuration[e.id].retirement : (e.retirement ? newEnd : undefined),
      })));
      const savedRouteDuration = savedRouteDatesDurationRef.current;
      setRouteEntries(prev => prev.map(r => ({
        ...r,
        startDate: savedRouteDuration[r.id]?.startDate ?? newStart,
        endDate: savedRouteDuration[r.id]?.endDate ?? newEnd,
      })));
    } else if (newType === 'dates' && periodType === 'duration') {
      const fleetSnapshot: Record<string, { enterInService: Date; retirement?: Date }> = {};
      fleetEntries.forEach(e => { fleetSnapshot[e.id] = { enterInService: e.enterInService, retirement: e.retirement }; });
      savedFleetDatesDurationRef.current = fleetSnapshot;
      const routeSnapshot: Record<string, { startDate: Date; endDate: Date }> = {};
      routeEntries.forEach(r => { routeSnapshot[r.id] = { startDate: r.startDate, endDate: r.endDate }; });
      savedRouteDatesDurationRef.current = routeSnapshot;

      const restoredStart = savedDatesRef.current.start;
      const restoredEnd = savedDatesRef.current.end;
      setStartDate(restoredStart);
      setEndDate(restoredEnd);

      const savedFleet = savedFleetDatesRef.current;
      setFleetEntries(prev => prev.map(e => ({
        ...e,
        enterInService: savedFleet[e.id]?.enterInService ?? (restoredStart || e.enterInService),
        retirement: savedFleet[e.id] ? savedFleet[e.id].retirement : e.retirement,
      })));
      const savedRoute = savedRouteDatesRef.current;
      setRouteEntries(prev => prev.map(r => ({
        ...r,
        startDate: savedRoute[r.id]?.startDate ?? (restoredStart || r.startDate),
        endDate: savedRoute[r.id]?.endDate ?? (restoredEnd || r.endDate),
      })));
    }
    setPeriodType(newType as 'dates' | 'duration');
  }, [periodType, startDate, endDate, simulationYears, fleetEntries, routeEntries]);

  // When simulationYears changes in duration mode, update synthetic dates
  useEffect(() => {
    if (periodType === 'duration') {
      setStartDate(new Date(2000, 0, 1));
      setEndDate(new Date(2000 + simulationYears - 1, 11, 1));
    }
  }, [simulationYears]);

  // Modal state
  const [isAddAircraftModalOpen, setIsAddAircraftModalOpen] = useState(false);
  const [isEditFleetModalOpen, setIsEditFleetModalOpen] = useState(false);
  const [isImportAirlineFleetModalOpen, setIsImportAirlineFleetModalOpen] = useState(false);
  const [selectedAircraftIds, setSelectedAircraftIds] = useState<Set<string>>(new Set());
  const [selectedRouteIds, setSelectedRouteIds] = useState<Set<string>>(new Set());
  const hasAircraft = fleetEntries.length > 0;
  const hasRoutes = routeEntries.length > 0;

  // Grid API refs (shared with section components for modal coordination)
  const fleetGridApiRef = useRef<{ deselectAll: () => void } | null>(null);
  const routesGridApiRef = useRef<{ deselectAll: () => void } | null>(null);

  // Fleet handlers (used by modals)
  const handleAddAircraft = (aircraft: FleetEntry) => {
    setFleetEntries((prev) => [...prev, aircraft]);
  };

  const handleImportAirlineFleet = (entries: FleetEntry[]) => {
    setFleetEntries((prev) => [...prev, ...entries]);
  };

  const handleImportAirlineNetwork = (entries: RouteEntry[]) => {
    setRouteEntries((prev) => [...prev, ...entries]);
  };

  const handleEditFleet = (updates: Partial<Omit<FleetEntryForEdit, 'id'>>) => {
    setFleetEntries((prev) =>
      prev.map((e) => {
        if (selectedAircraftIds.has(e.id)) {
          return {
            ...e,
            ...(updates.numberOfAircraft !== undefined && { numberOfAircraft: updates.numberOfAircraft }),
            ...(updates.enterInService !== undefined && { enterInService: updates.enterInService }),
            ...(updates.retirement !== undefined && { retirement: updates.retirement }),
            ...(updates.ownership !== undefined && { ownership: updates.ownership }),
          };
        }
        return e;
      })
    );
    setSelectedAircraftIds(new Set());
    fleetGridApiRef.current?.deselectAll();
  };

  const handleAddRoute = (route: RouteEntry) => {
    setRouteEntries((prev) => [...prev, route]);
  };

  const handleEditRoutes = (updates: Partial<Omit<RouteEntryForEdit, 'id'>>) => {
    setRouteEntries((prev) =>
      prev.map((r) => {
        if (selectedRouteIds.has(r.id)) {
          return {
            ...r,
            ...(updates.startDate !== undefined && { startDate: updates.startDate }),
            ...(updates.endDate !== undefined && { endDate: updates.endDate }),
          };
        }
        return r;
      })
    );
    setSelectedRouteIds(new Set());
    routesGridApiRef.current?.deselectAll();
  };

  // Relative month options for duration mode (used by modals)
  const relativeMonthOptions = useMemo(() => {
    if (!startDate || !endDate) return [];
    const opts: { value: string; label: string }[] = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    let idx = 1;
    while (current <= end) {
      const yIdx = Math.ceil(idx / 12);
      const mIdx = ((idx - 1) % 12) + 1;
      opts.push({
        value: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
        label: `M${mIdx} Y${yIdx}`,
      });
      current.setMonth(current.getMonth() + 1);
      idx++;
    }
    return opts;
  }, [startDate, endDate]);

  const dateToRelativeKey = useCallback((d: Date | undefined) => {
    if (!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const relativeKeyToDate = useCallback((key: string) => {
    const [y, m] = key.split('-').map(Number);
    return new Date(y, m - 1, 1);
  }, []);

  // AG Grid context — passed to grids so cell renderers can react to periodType changes
  const gridContext = useMemo(() => ({
    periodType,
    relativeMonthOptions,
    dateToRelativeKey,
    relativeKeyToDate,
  }), [periodType, relativeMonthOptions, dateToRelativeKey, relativeKeyToDate]);

  // Utility: Generate month/year columns from start to end date
  const generateMonthColumns = useMemo(
    () => (start: Date | undefined, end: Date | undefined) => genMonthCols(start, end, periodType),
    [periodType]
  );
  const yearKeys = useMemo(() => getYearKeys(startDate, endDate), [startDate, endDate]);
  const yearKeyToLabel = useMemo(
    () => (key: string) => yearKeyToLabelFn(key, periodType, startDate),
    [periodType, startDate]
  );
  const monthKeys = useMemo(() => getMonthKeys(startDate, endDate), [startDate, endDate]);
  const monthLabels = useMemo(() => getMonthLabels(startDate, endDate, periodType), [startDate, endDate, periodType]);

  // Study lifecycle: draft → computing → computed
  const getInitialStatus = (): 'draft' | 'computing' | 'computed' => {
    const raw = studyData?.status || persistedData?.studyStatus;
    if (!raw) return 'draft';
    switch (raw.toLowerCase()) {
      case 'computed': return 'computed';
      case 'computing': return 'computing';
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

  // Initialize cost/crew data when fleet entries change
  const isComputedStudy = studyData?.status === 'Computed';
  useEffect(() => {
    setCostOperationsData(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const newEntries = fleetEntries
        .filter(e => !existingIds.has(e.id))
        .map(e => ({
          id: e.id,
          groundHandlingCharge: isComputedStudy ? 850 : 0,
          fuelAgeingFactor: isComputedStudy ? 2.5 : 0,
        }));
      return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
    });

    setCostOwnershipData(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const newEntries = fleetEntries
        .filter(e => !existingIds.has(e.id))
        .map(e => ({
          id: e.id,
          monthlyLeaseRate: isComputedStudy ? 380000 : 0,
          acValueUponAcquisition: isComputedStudy ? 110000000 : 0,
          sparesProvisioningPerFamily: isComputedStudy ? 2500000 : 0,
        }));
      return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
    });

    setCrewConfigData(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const newEntries = fleetEntries
        .filter(e => !existingIds.has(e.id))
        .map(e => ({
          id: e.id,
          captainPerCrew: isComputedStudy ? 2 : 1,
          firstOfficerPerCrew: isComputedStudy ? 2 : 1,
          cabinManagerPerCrew: isComputedStudy ? 2 : 1,
          cabinAttendantPerCrew: isComputedStudy ? 4 : 1,
        }));
      return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
    });
  }, [fleetEntries]);

  // Initialize pricing, fleet plan, and frequencies when routes or active classes change
  useEffect(() => {
    setRoutePricingData(prev => {
      const existingKeys = new Set(prev.map(p => `${p.routeId}-${p.classCode}`));
      const classes = activeClasses.length > 0 ? activeClasses : ['Y'];
      const newEntries: RoutePricingEntry[] = [];
      for (const r of routeEntries) {
        for (const cls of classes) {
          if (!existingKeys.has(`${r.id}-${cls}`)) {
            newEntries.push({
              routeId: r.id,
              classCode: cls,
              marketYield: isComputedStudy ? 0.08 : 0,
              discountStrategy: 'None',
              yield: isComputedStudy ? 0.07 : 0,
              fare: 0,
            });
          }
        }
      }
      return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
    });

    setFleetPlanData(prev => {
      const existingIds = new Set(prev.map(f => f.routeId));
      const newEntries = routeEntries
        .filter(r => !existingIds.has(r.id))
        .map((r, index) => ({
          routeId: r.id,
          allocatedAircraftId: isComputedStudy && fleetEntries.length > 0
            ? fleetEntries[index % fleetEntries.length].id
            : null,
        }));
      return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
    });

    setRouteFrequencyData(prev => {
      const existingIds = new Set(prev.map(f => f.routeId));
      const newEntries = routeEntries
        .filter(r => !existingIds.has(r.id))
        .map(r => {
          if (isComputedStudy && startDate && endDate) {
            const freqs: Record<string, number> = {};
            const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
            const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
            while (current <= end) {
              const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
              freqs[key] = 14;
              current.setMonth(current.getMonth() + 1);
            }
            return { routeId: r.id, frequencies: freqs };
          }
          return { routeId: r.id, frequencies: {} };
        });
      return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
    });
  }, [routeEntries, activeClasses]);

  // Clean up invalid allocatedAircraftId when fleet entries change
  useEffect(() => {
    const validAircraftIds = new Set(fleetEntries.map(e => e.id));
    setFleetPlanData(prev => {
      const updated = prev.map(f => {
        if (f.allocatedAircraftId && !validAircraftIds.has(f.allocatedAircraftId)) {
          return { ...f, allocatedAircraftId: null };
        }
        return f;
      });
      const hasChanges = updated.some((f, i) => f.allocatedAircraftId !== prev[i]?.allocatedAircraftId);
      return hasChanges ? updated : prev;
    });
  }, [fleetEntries]);

  // Ensure ancillaryRevenueData has entries for all active classes
  useEffect(() => {
    if (activeClasses.length === 0) return;
    setAncillaryRevenueData(prev => {
      const existingCodes = new Set(prev.map(r => r.classType));
      const newEntries = activeClasses
        .filter(code => !existingCodes.has(code))
        .map(code => ({ classType: code }));
      return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
    });
  }, [activeClasses]);

  const handleCompute = useCallback(() => {
    setStudyStatus('computing');
    computeTimerRef.current = setTimeout(() => {
      setStudyStatus('computed');
      computeTimerRef.current = null;
    }, 10000);
  }, []);

  // Scenario handlers
  const toggleScenario = (id: number) => {
    setScenarios((prev) => prev.map((s) => (s.id === id ? { ...s, isOpen: !s.isOpen } : s)));
  };

  const toggleAssumptions = (scenarioId: number) => {
    setScenarios((prev) => prev.map((s) => s.id === scenarioId ? { ...s, assumptionsOpen: !s.assumptionsOpen } : s));
  };

  const toggleOutputs = (scenarioId: number) => {
    setScenarios((prev) => prev.map((s) => s.id === scenarioId ? { ...s, outputsOpen: !s.outputsOpen } : s));
  };

  const addScenario = () => {
    const newId = Math.max(...scenarios.map((s) => s.id)) + 1;
    setScenarios((prev) => [...prev, { id: newId, name: `Scenario ${newId}`, isOpen: false, assumptionsOpen: true, outputsOpen: false }]);
  };

  const deleteScenario = (id: number) => {
    if (scenarios.length <= 1) return;
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const duplicateScenario = (id: number) => {
    const source = scenarios.find((s) => s.id === id);
    if (!source) return;
    const newId = Math.max(...scenarios.map((s) => s.id)) + 1;
    setScenarios((prev) => [...prev, { ...source, id: newId, name: `${source.name} (copy)`, isOpen: false }]);
  };

  // Error count per assumption item
  const costOpsErrors = useMemo(() => {
    if (!hasAircraft) return 0;
    return costOperationsData.filter(c => c.groundHandlingCharge === 0 || c.fuelAgeingFactor === 0).length;
  }, [costOperationsData, hasAircraft]);

  const costOwnershipErrors = useMemo(() => {
    if (!hasAircraft) return 0;
    return costOwnershipData.filter(c => c.monthlyLeaseRate === 0 || c.acValueUponAcquisition === 0 || c.sparesProvisioningPerFamily === 0).length;
  }, [costOwnershipData, hasAircraft]);

  const pricingErrors = useMemo(() => {
    if (!hasRoutes) return 0;
    // Only count errors for active classes
    const activeSet = new Set(activeClasses);
    return routePricingData.filter(p => activeSet.has(p.classCode) && (p.marketYield === 0 || p.yield === 0)).length;
  }, [routePricingData, hasRoutes, activeClasses]);

  const fleetPlanErrors = useMemo(() => {
    if (!hasRoutes) return 0;
    return fleetPlanData.filter(f => !f.allocatedAircraftId).length;
  }, [fleetPlanData, hasRoutes]);

  const frequencyErrors = useMemo(() => {
    if (!hasRoutes) return 0;
    return routeFrequencyData.filter(f => {
      const values = Object.values(f.frequencies);
      return values.length === 0 || values.every(v => v === 0);
    }).length;
  }, [routeFrequencyData, hasRoutes]);

  const networkAllInputsFilled = hasRoutes && pricingErrors === 0 && fleetPlanErrors === 0 && frequencyErrors === 0;

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

  // ========== PERSIST TO LOCALSTORAGE (debounced) ==========
  const debouncedSave = useDebouncedCallback(() => {
    const dataToSave: PersistedStudyData = {
      studyName,
      workspaceName,
      studyStatus,
      periodType,
      simulationYears,
      startDate: startDate?.toISOString() || null,
      endDate: endDate?.toISOString() || null,
      operatingDays,
      startupDuration,
      fleetEntries: fleetEntries.map(f => ({
        id: f.id, aircraftType: f.aircraftType, engine: f.engine, layout: f.layout,
        numberOfAircraft: f.numberOfAircraft,
        enterInService: f.enterInService.toISOString(),
        retirement: f.retirement?.toISOString(),
        ownership: f.ownership,
        cabinClasses: f.cabinClasses,
      })),
      costOperationsData,
      costOwnershipData,
      crewConfigData,
      routeEntries: routeEntries.map(r => ({
        id: r.id, origin: r.origin, destination: r.destination,
        startDate: r.startDate.toISOString(), endDate: r.endDate.toISOString(),
      })),
      routePricingData,
      fleetPlanData,
      routeFrequencyData,
      discountForNormalFares,
    };
    saveToStorage(studyId, dataToSave);
  }, 500);

  useEffect(() => {
    debouncedSave();
  }, [
    studyStatus, periodType, simulationYears, startDate, endDate, operatingDays, startupDuration,
    fleetEntries, costOperationsData, costOwnershipData, crewConfigData,
    routeEntries, routePricingData, fleetPlanData, routeFrequencyData, discountForNormalFares,
    debouncedSave
  ]);

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
            <Button label="Mark Thompson" rightIcon="account_circle" variant="Ghost" size="M" />
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
                    <IconButton icon="edit" size="XS" variant="Ghost" alt="Edit Name" onClick={() => console.log('Edit', scenario.name)} />
                    <IconButton icon="content_copy" size="XS" variant="Ghost" alt="Duplicate Scenario" onClick={() => duplicateScenario(scenario.id)} />
                    <IconButton
                      icon="delete" size="XS" variant="Ghost" alt="Delete Scenario"
                      state={scenarios.length <= 1 ? 'Disabled' : 'Default'}
                      style={{ color: scenarios.length > 1 ? 'var(--status-error, #da1e28)' : undefined }}
                      onClick={() => deleteScenario(scenario.id)}
                    />
                  </>
                }
              />

              {scenario.isOpen && (
                <div className="study-page__scenario-content">
                  <PanelGroup label="Assumptions" open={scenario.assumptionsOpen} size="XS" onClick={() => toggleAssumptions(scenario.id)} />
                  {scenario.assumptionsOpen &&
                    ASSUMPTION_ITEMS.map((item) => {
                      const errorCount = getErrorCount(item.id);
                      const periodErrors = getErrorCount('period');
                      const isSelected = selectedItem.scenarioId === scenario.id && selectedItem.itemId === item.id;
                      const isDisabled = item.id !== 'period' && periodErrors > 0;
                      return (
                        <PanelButton
                          key={item.id} label={item.label} icon={item.icon} size="XS"
                          variant={isDisabled ? 'Disabled' : isSelected ? 'Selected' : 'Default'}
                          showError={errorCount > 0} errorCount={errorCount}
                          onClick={() => { if (!isDisabled) setSelectedItem({ scenarioId: scenario.id, itemId: item.id }); }}
                        />
                      );
                    })}

                  <PanelGroup label="Outputs" open={scenario.outputsOpen} size="XS" onClick={() => toggleOutputs(scenario.id)} />
                  {scenario.outputsOpen &&
                    OUTPUT_ITEMS.map((item) => {
                      const isSelected = selectedItem.scenarioId === scenario.id && selectedItem.itemId === item.id;
                      const outputsDisabled = studyStatus !== 'computed';
                      return (
                        <PanelButton
                          key={item.id} label={item.label} icon={item.icon} size="XS"
                          variant={outputsDisabled ? 'Disabled' : isSelected ? 'Selected' : 'Default'}
                          onClick={() => { if (!outputsDisabled) setSelectedItem({ scenarioId: scenario.id, itemId: item.id }); }}
                        />
                      );
                    })}
                </div>
              )}
            </div>
          ))}

          <button type="button" className="study-page__add-scenario" onClick={addScenario}>
            <Icon name="add" size={16} color="#ffffff" />
            <span>ADD SCENARIO</span>
          </button>
        </LeftPanel>

        {/* Main Content */}
        <div className={`study-page__main${studyStatus === 'computed' ? ' study-page__main--computed' : ''}`}>
          {selectedItem.itemId === 'period' && (
            <PeriodSection
              periodType={periodType}
              startDate={startDate}
              endDate={endDate}
              simulationYears={simulationYears}
              operatingDays={operatingDays}
              startupDuration={startupDuration}
              onPeriodTypeChange={handlePeriodTypeChange}
              onStartDateChange={(v) => { setStartDate(v); savedDatesRef.current.start = v; }}
              onEndDateChange={(v) => { setEndDate(v); savedDatesRef.current.end = v; }}
              onSimulationYearsChange={(v) => setSimulationYears(Math.max(1, v))}
              onOperatingDaysChange={(v) => setOperatingDays(Math.max(0, v))}
              onStartupDurationChange={(v) => setStartupDuration(Math.max(0, v))}
            />
          )}

          {selectedItem.itemId === 'fleet' && (
            <FleetSection
              startDate={startDate}
              endDate={endDate}
              periodType={periodType}
              gridContext={gridContext}
              fleetEntries={fleetEntries}
              setFleetEntries={setFleetEntries}
              costOperationsData={costOperationsData}
              setCostOperationsData={setCostOperationsData}
              costOwnershipData={costOwnershipData}
              setCostOwnershipData={setCostOwnershipData}
              crewConfigData={crewConfigData}
              setCrewConfigData={setCrewConfigData}
              costOpsErrors={costOpsErrors}
              costOwnershipErrors={costOwnershipErrors}
              onOpenAddAircraft={() => setIsAddAircraftModalOpen(true)}
              onOpenEditFleet={() => setIsEditFleetModalOpen(true)}
              onOpenImportFleet={() => setIsImportAirlineFleetModalOpen(true)}
              selectedAircraftIds={selectedAircraftIds}
              setSelectedAircraftIds={setSelectedAircraftIds}
              fleetGridApiRef={fleetGridApiRef}
            />
          )}

          {selectedItem.itemId === 'network' && (
            <NetworkSection
              startDate={startDate}
              endDate={endDate}
              periodType={periodType}
              gridContext={gridContext}
              generateMonthColumns={generateMonthColumns}
              fleetEntries={fleetEntries}
              routeEntries={routeEntries}
              setRouteEntries={setRouteEntries}
              routePricingData={routePricingData}
              setRoutePricingData={setRoutePricingData}
              fleetPlanData={fleetPlanData}
              setFleetPlanData={setFleetPlanData}
              routeFrequencyData={routeFrequencyData}
              setRouteFrequencyData={setRouteFrequencyData}
              discountForNormalFares={discountForNormalFares}
              setDiscountForNormalFares={setDiscountForNormalFares}
              pricingErrors={pricingErrors}
              fleetPlanErrors={fleetPlanErrors}
              frequencyErrors={frequencyErrors}
              networkAllInputsFilled={networkAllInputsFilled}
              onOpenAddRoute={() => setIsAddRouteModalOpen(true)}
              onOpenEditRoute={() => setIsEditRouteModalOpen(true)}
              onOpenImportNetwork={() => setIsImportAirlineNetworkModalOpen(true)}
              selectedRouteIds={selectedRouteIds}
              setSelectedRouteIds={setSelectedRouteIds}
              routesGridApiRef={routesGridApiRef}
              activeClasses={activeClasses}
            />
          )}

          {selectedItem.itemId === 'load-factor' && (
            <LoadFactorSection
              startDate={startDate}
              endDate={endDate}
              periodType={periodType}
              yearKeys={yearKeys}
              yearKeyToLabel={yearKeyToLabel}
              generateMonthColumns={generateMonthColumns}
              routeEntries={routeEntries}
              targetedYearlyLF={targetedYearlyLF}
              setTargetedYearlyLF={setTargetedYearlyLF}
              seasonalityCorrection={seasonalityCorrection}
              setSeasonalityCorrection={setSeasonalityCorrection}
              firstYearRampUp={firstYearRampUp}
              setFirstYearRampUp={setFirstYearRampUp}
              maxLoadFactor={maxLoadFactor}
              setMaxLoadFactor={setMaxLoadFactor}
              routeLoadFactorData={routeLoadFactorData}
              setRouteLoadFactorData={setRouteLoadFactorData}
              activeClasses={activeClasses}
            />
          )}

          {selectedItem.itemId === 'operational-cost' && (
            <OperationalCostSection
              monthKeys={monthKeys}
              monthLabels={monthLabels}
              yearKeys={yearKeys}
              yearKeyToLabel={yearKeyToLabel}
              fuelPricePerGallon={fuelPricePerGallon} setFuelPricePerGallon={setFuelPricePerGallon}
              fuelDepositsMonths={fuelDepositsMonths} setFuelDepositsMonths={setFuelDepositsMonths}
              crewRatioPerAircraft={crewRatioPerAircraft} setCrewRatioPerAircraft={setCrewRatioPerAircraft}
              cabinCrewAttrition={cabinCrewAttrition} setCabinCrewAttrition={setCabinCrewAttrition}
              flightCrewAttrition={flightCrewAttrition} setFlightCrewAttrition={setFlightCrewAttrition}
              crewFixedWages={crewFixedWages} setCrewFixedWages={setCrewFixedWages}
              crewVariableWages={crewVariableWages} setCrewVariableWages={setCrewVariableWages}
              crewTraining={crewTraining} setCrewTraining={setCrewTraining}
              cateringCostEconomy={cateringCostEconomy} setCateringCostEconomy={setCateringCostEconomy}
              cateringCostBusiness={cateringCostBusiness} setCateringCostBusiness={setCateringCostBusiness}
              cateringCostPremium={cateringCostPremium} setCateringCostPremium={setCateringCostPremium}
              indirectMaintenanceCost={indirectMaintenanceCost} setIndirectMaintenanceCost={setIndirectMaintenanceCost}
              maintenanceOutsourcingCost={maintenanceOutsourcingCost} setMaintenanceOutsourcingCost={setMaintenanceOutsourcingCost}
              llpCostFactor={llpCostFactor} setLlpCostFactor={setLlpCostFactor}
              initialMarketingBudget={initialMarketingBudget} setInitialMarketingBudget={setInitialMarketingBudget}
              sellingCostPerPax={sellingCostPerPax} setSellingCostPerPax={setSellingCostPerPax}
              marketingBudget={marketingBudget} setMarketingBudget={setMarketingBudget}
            />
          )}

          {selectedItem.itemId === 'revenue' && (
            <RevenueSection
              startDate={startDate}
              endDate={endDate}
              yearKeys={yearKeys}
              yearKeyToLabel={yearKeyToLabel}
              generateMonthColumns={generateMonthColumns}
              ancillaryRevenueData={ancillaryRevenueData}
              setAncillaryRevenueData={setAncillaryRevenueData}
              codeShareDeduction={codeShareDeduction}
              setCodeShareDeduction={setCodeShareDeduction}
              cargoMarketCAGR={cargoMarketCAGR}
              setCargoMarketCAGR={setCargoMarketCAGR}
              cargoAddressableMarket={cargoAddressableMarket}
              setCargoAddressableMarket={setCargoAddressableMarket}
              cargoYearlyData={cargoYearlyData}
              setCargoYearlyData={setCargoYearlyData}
              activeClasses={activeClasses}
            />
          )}

          {selectedItem.itemId === 'financial' && (
            <FinancialSection
              yearKeys={yearKeys}
              yearKeyToLabel={yearKeyToLabel}
              inflationData={inflationData}
              setInflationData={setInflationData}
              effectiveTaxRate={effectiveTaxRate} setEffectiveTaxRate={setEffectiveTaxRate}
              lossCarryForward={lossCarryForward} setLossCarryForward={setLossCarryForward}
              lossCarryBack={lossCarryBack} setLossCarryBack={setLossCarryBack}
              depreciationRate={depreciationRate} setDepreciationRate={setDepreciationRate}
              residualValue={residualValue} setResidualValue={setResidualValue}
              interestRate={interestRate} setInterestRate={setInterestRate}
              loanDuration={loanDuration} setLoanDuration={setLoanDuration}
              costOfDebt={costOfDebt} setCostOfDebt={setCostOfDebt}
              avgLifeCapitalizedLease={avgLifeCapitalizedLease} setAvgLifeCapitalizedLease={setAvgLifeCapitalizedLease}
              securityDeposit={securityDeposit} setSecurityDeposit={setSecurityDeposit}
              toolingAmortRate={toolingAmortRate} setToolingAmortRate={setToolingAmortRate}
              toolingResidualValue={toolingResidualValue} setToolingResidualValue={setToolingResidualValue}
              spareUsageRate={spareUsageRate} setSpareUsageRate={setSpareUsageRate}
              sparesAmortRate={sparesAmortRate} setSparesAmortRate={setSparesAmortRate}
              acPreparationAmortRate={acPreparationAmortRate} setAcPreparationAmortRate={setAcPreparationAmortRate}
              workingCapitalData={workingCapitalData}
              setWorkingCapitalData={setWorkingCapitalData}
            />
          )}

          {/* Status Bar */}
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

      {/* Modals */}
      <AddAircraftModal
        isOpen={isAddAircraftModalOpen}
        onClose={() => setIsAddAircraftModalOpen(false)}
        onAddAircraft={handleAddAircraft}
        periodType={periodType}
        relativeMonthOptions={relativeMonthOptions}
      />

      <AddRouteModal
        isOpen={isAddRouteModalOpen}
        onClose={() => setIsAddRouteModalOpen(false)}
        onAddRoute={handleAddRoute}
        simulationStartDate={startDate}
        simulationEndDate={endDate}
        periodType={periodType}
        relativeMonthOptions={relativeMonthOptions}
      />

      <ImportAirlineFleetModal
        isOpen={isImportAirlineFleetModalOpen}
        onClose={() => setIsImportAirlineFleetModalOpen(false)}
        onImportFleet={handleImportAirlineFleet}
        periodStartDate={startDate}
        periodEndDate={endDate}
      />

      <ImportAirlineNetworkModal
        isOpen={isImportAirlineNetworkModalOpen}
        onClose={() => setIsImportAirlineNetworkModalOpen(false)}
        onImportNetwork={handleImportAirlineNetwork}
        periodStartDate={startDate}
        periodEndDate={endDate}
      />

      <EditFleetModal
        isOpen={isEditFleetModalOpen}
        onClose={() => setIsEditFleetModalOpen(false)}
        onSave={handleEditFleet}
        selectedEntries={fleetEntries.filter((e) => selectedAircraftIds.has(e.id))}
        simulationStartDate={startDate}
        simulationEndDate={endDate}
        periodType={periodType}
        relativeMonthOptions={relativeMonthOptions}
      />

      <EditRouteModal
        isOpen={isEditRouteModalOpen}
        onClose={() => setIsEditRouteModalOpen(false)}
        onSave={handleEditRoutes}
        selectedEntries={routeEntries.filter((r) => selectedRouteIds.has(r.id))}
        simulationStartDate={startDate}
        simulationEndDate={endDate}
        periodType={periodType}
        relativeMonthOptions={relativeMonthOptions}
      />
    </div>
  );
}
