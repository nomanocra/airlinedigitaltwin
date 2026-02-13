// Fleet sub-tab types
export type FleetTabType = 'fleet' | 'cost-operations' | 'cost-ownership' | 'crew';
export type FleetViewMode = 'table' | 'gantt';
export type RoutesViewMode = 'table' | 'map';
export type NetworkTabType = 'routes' | 'pricing' | 'fleet-plan' | 'frequencies' | 'summary';

// Load Factor tab types
export type LoadFactorTabType = 'general' | 'per-route' | 'summary';

// Operational Cost tab types
export type OperationalCostTabType = 'fuel-cost' | 'crew-costs' | 'catering-costs' | 'maintenance-costs' | 'selling-distribution';
export type CrewCostSubTabType = 'wages' | 'monthly-costs';

// Revenue tab types
export type RevenueTabType = 'ancillary' | 'cargo';

// Financial tab types
export type FinancialTabType = 'inflation' | 'taxes' | 'owned-ac' | 'leased-ac' | 'tooling' | 'working-capital';

// Fleet Cost Operations
export interface FleetCostOperationsEntry {
  id: string;
  groundHandlingCharge: number;
  fuelAgeingFactor: number;
}

// Fleet Cost Ownership
export interface FleetCostOwnershipEntry {
  id: string;
  monthlyLeaseRate: number;
  acValueUponAcquisition: number;
  sparesProvisioningPerFamily: number;
}

// Crew Configuration
export interface CrewConfigEntry {
  id: string;
  captainPerCrew: number;
  firstOfficerPerCrew: number;
  cabinManagerPerCrew: number;
  cabinAttendantPerCrew: number;
}

// Routes
export interface RouteEntry {
  id: string;
  origin: string;
  destination: string;
  startDate: Date;
  endDate: Date;
}

// Pricing
export interface RoutePricingEntry {
  routeId: string;
  classCode: string;
  marketYield: number;
  discountStrategy: string;
  yield: number;
  fare: number;
}

// Fleet Plan
export interface FleetPlanEntry {
  routeId: string;
  allocatedAircraftId: string | null;
}

// Frequencies
export interface RouteFrequencyEntry {
  routeId: string;
  frequencies: Record<string, number>;
}

// Gantt Row (expanded)
export interface GanttAircraftRow {
  id: string;
  fleetEntryId: string;
  aircraftIndex: number;
  aircraftType: string;
  engine: string;
  layout: string;
  enterInService: Date;
  retirement?: Date;
  ownership: 'Owned' | 'Leased';
}

export interface Scenario {
  id: number;
  name: string;
  isOpen: boolean;
  assumptionsOpen: boolean;
  outputsOpen: boolean;
}

// Persisted study data shape
export interface PersistedStudyData {
  studyName: string;
  workspaceName: string;
  studyStatus: string;
  periodType: 'dates' | 'duration';
  simulationYears: number;
  startDate: string | null;
  endDate: string | null;
  operatingDays: number;
  startupDuration: number;
  fleetEntries: Array<{
    id: string;
    aircraftType: string;
    engine: string;
    layout: string;
    numberOfAircraft: number;
    enterInService: string;
    retirement?: string;
    ownership: 'Owned' | 'Leased';
    cabinClasses?: Array<{ code: string; seats: number }>;
  }>;
  costOperationsData: Array<{ id: string; groundHandlingCharge: number; fuelAgeingFactor: number }>;
  costOwnershipData: Array<{ id: string; monthlyLeaseRate: number; acValueUponAcquisition: number; sparesProvisioningPerFamily: number }>;
  crewConfigData: Array<{ id: string; captainPerCrew: number; firstOfficerPerCrew: number; cabinManagerPerCrew: number; cabinAttendantPerCrew: number }>;
  routeEntries: Array<{ id: string; origin: string; destination: string; startDate: string; endDate: string }>;
  routePricingData: Array<{ routeId: string; classCode: string; marketYield: number; discountStrategy: string; yield: number; fare: number }>;
  fleetPlanData: Array<{ routeId: string; allocatedAircraftId: string | null }>;
  routeFrequencyData: Array<{ routeId: string; frequencies: Record<string, number> }>;
  discountForNormalFares: number;
}
