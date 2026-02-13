import type { PersistedStudyData } from '../pages/types';

// Helper to generate complete mock data for computed studies
function createComputedStudy(config: {
  studyName: string;
  workspaceName: string;
  startDate: string;
  endDate: string;
  fleet: Array<{
    id: string;
    aircraftType: string;
    engine: string;
    layout: string;
    numberOfAircraft: number;
    ownership: 'Owned' | 'Leased';
    cabinClasses: Array<{ code: string; seats: number }>;
  }>;
  routes: Array<{
    id: string;
    origin: string;
    destination: string;
  }>;
}): PersistedStudyData {
  const { studyName, workspaceName, startDate, endDate, fleet, routes } = config;

  // Get all unique cabin classes from fleet
  const allClasses = new Set<string>();
  fleet.forEach(f => f.cabinClasses.forEach(c => allClasses.add(c.code)));
  const classArray = Array.from(allClasses);

  return {
    studyName,
    workspaceName,
    studyStatus: 'computed',
    periodType: 'dates',
    simulationYears: 4,
    startDate,
    endDate,
    operatingDays: 365,
    startupDuration: 6,
    fleetEntries: fleet.map((f, idx) => ({
      ...f,
      enterInService: idx === 0 ? startDate : new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 6)).toISOString(),
      retirement: undefined,
    })),
    costOperationsData: fleet.map(f => ({
      id: f.id,
      groundHandlingCharge: 2500 + Math.floor(Math.random() * 1000),
      fuelAgeingFactor: 1.01 + Math.random() * 0.02,
    })),
    costOwnershipData: fleet.map(f => ({
      id: f.id,
      monthlyLeaseRate: 280000 + Math.floor(Math.random() * 150000),
      acValueUponAcquisition: 45000000 + Math.floor(Math.random() * 30000000),
      sparesProvisioningPerFamily: 1500000 + Math.floor(Math.random() * 1000000),
    })),
    crewConfigData: fleet.map(f => ({
      id: f.id,
      captainPerCrew: 1,
      firstOfficerPerCrew: 1,
      cabinManagerPerCrew: 1,
      cabinAttendantPerCrew: 3 + Math.floor(f.cabinClasses.reduce((sum, c) => sum + c.seats, 0) / 50),
    })),
    routeEntries: routes.map(r => ({
      ...r,
      startDate,
      endDate,
    })),
    routePricingData: routes.flatMap(r =>
      classArray.map(classCode => ({
        routeId: r.id,
        classCode,
        marketYield: classCode === 'F' ? 0.35 : classCode === 'J' ? 0.22 : classCode === 'W' ? 0.14 : 0.08,
        discountStrategy: 'None',
        yield: classCode === 'F' ? 0.30 : classCode === 'J' ? 0.18 : classCode === 'W' ? 0.12 : 0.07,
        fare: classCode === 'F' ? 500 : classCode === 'J' ? 280 : classCode === 'W' ? 180 : 95,
      }))
    ),
    fleetPlanData: routes.map((r, idx) => ({
      routeId: r.id,
      allocatedAircraftId: fleet[idx % fleet.length].id,
    })),
    routeFrequencyData: routes.map(r => ({
      routeId: r.id,
      frequencies: {
        '2026-01': 14, '2026-02': 14, '2026-03': 21, '2026-04': 21,
        '2026-05': 28, '2026-06': 28, '2026-07': 35, '2026-08': 35,
        '2026-09': 28, '2026-10': 21, '2026-11': 21, '2026-12': 28,
      },
    })),
    discountForNormalFares: 15,
  };
}

// Default mock data for demo studies
export const MOCK_STUDIES: Record<string, PersistedStudyData> = {
  // NovAir - Launch Revenue Forecast (Computed)
  '1-1': createComputedStudy({
    studyName: 'Launch Revenue Forecast',
    workspaceName: 'NovAir',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2030-12-31T00:00:00.000Z',
    fleet: [
      { id: 'fleet-1', aircraftType: 'A320neo', engine: 'LEAP-1A', layout: '180Y', numberOfAircraft: 5, ownership: 'Owned', cabinClasses: [{ code: 'Y', seats: 180 }] },
      { id: 'fleet-2', aircraftType: 'A321neo', engine: 'LEAP-1A', layout: '12J/190Y', numberOfAircraft: 3, ownership: 'Leased', cabinClasses: [{ code: 'J', seats: 12 }, { code: 'Y', seats: 190 }] },
    ],
    routes: [
      { id: 'route-1', origin: 'CDG', destination: 'BCN' },
      { id: 'route-2', origin: 'CDG', destination: 'FCO' },
      { id: 'route-3', origin: 'CDG', destination: 'AMS' },
      { id: 'route-4', origin: 'CDG', destination: 'BER' },
      { id: 'route-5', origin: 'CDG', destination: 'VIE' },
      { id: 'route-6', origin: 'CDG', destination: 'LIS' },
    ],
  }),

  // Zephyr Airlines - Transatlantic Network (Computed)
  '2-1': createComputedStudy({
    studyName: 'Transatlantic Network',
    workspaceName: 'Zephyr Airlines',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2030-12-31T00:00:00.000Z',
    fleet: [
      { id: 'fleet-1', aircraftType: 'A350-900', engine: 'Trent XWB-84', layout: '32J/24W/262Y', numberOfAircraft: 4, ownership: 'Owned', cabinClasses: [{ code: 'J', seats: 32 }, { code: 'W', seats: 24 }, { code: 'Y', seats: 262 }] },
      { id: 'fleet-2', aircraftType: 'A330-900', engine: 'Trent 7000', layout: '28J/21W/235Y', numberOfAircraft: 2, ownership: 'Leased', cabinClasses: [{ code: 'J', seats: 28 }, { code: 'W', seats: 21 }, { code: 'Y', seats: 235 }] },
    ],
    routes: [
      { id: 'route-1', origin: 'LHR', destination: 'JFK' },
      { id: 'route-2', origin: 'LHR', destination: 'LAX' },
      { id: 'route-3', origin: 'LHR', destination: 'ORD' },
      { id: 'route-4', origin: 'LHR', destination: 'MIA' },
      { id: 'route-5', origin: 'LHR', destination: 'SFO' },
      { id: 'route-6', origin: 'LHR', destination: 'BOS' },
      { id: 'route-7', origin: 'LHR', destination: 'IAD' },
      { id: 'route-8', origin: 'LHR', destination: 'ATL' },
    ],
  }),

  // SkyBridge Regional - Regional Route Map (Computed)
  '3-1': createComputedStudy({
    studyName: 'Regional Route Map',
    workspaceName: 'SkyBridge Regional',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2030-12-31T00:00:00.000Z',
    fleet: [
      { id: 'fleet-1', aircraftType: 'ATR 72-600', engine: 'PW127M', layout: '70Y', numberOfAircraft: 6, ownership: 'Owned', cabinClasses: [{ code: 'Y', seats: 70 }] },
      { id: 'fleet-2', aircraftType: 'E195-E2', engine: 'PW1900G', layout: '120Y', numberOfAircraft: 4, ownership: 'Leased', cabinClasses: [{ code: 'Y', seats: 120 }] },
    ],
    routes: [
      { id: 'route-1', origin: 'ARN', destination: 'GOT' },
      { id: 'route-2', origin: 'ARN', destination: 'OSL' },
      { id: 'route-3', origin: 'ARN', destination: 'CPH' },
      { id: 'route-4', origin: 'ARN', destination: 'HEL' },
      { id: 'route-5', origin: 'OSL', destination: 'BGO' },
      { id: 'route-6', origin: 'OSL', destination: 'TRD' },
      { id: 'route-7', origin: 'CPH', destination: 'AAL' },
      { id: 'route-8', origin: 'CPH', destination: 'BLL' },
    ],
  }),

  // AeroVerde - SAF Supply Chain Plan (Computed)
  '4-1': createComputedStudy({
    studyName: 'SAF Supply Chain Plan',
    workspaceName: 'AeroVerde',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2030-12-31T00:00:00.000Z',
    fleet: [
      { id: 'fleet-1', aircraftType: 'A320neo', engine: 'LEAP-1A', layout: '150Y', numberOfAircraft: 8, ownership: 'Owned', cabinClasses: [{ code: 'Y', seats: 150 }] },
      { id: 'fleet-2', aircraftType: 'A321XLR', engine: 'LEAP-1A', layout: '12J/168Y', numberOfAircraft: 3, ownership: 'Leased', cabinClasses: [{ code: 'J', seats: 12 }, { code: 'Y', seats: 168 }] },
    ],
    routes: [
      { id: 'route-1', origin: 'AMS', destination: 'BCN' },
      { id: 'route-2', origin: 'AMS', destination: 'FCO' },
      { id: 'route-3', origin: 'AMS', destination: 'LIS' },
      { id: 'route-4', origin: 'AMS', destination: 'ATH' },
      { id: 'route-5', origin: 'AMS', destination: 'IST' },
    ],
  }),

  // Solaris Airways - Mediterranean Route Plan (Computed)
  '5-1': createComputedStudy({
    studyName: 'Mediterranean Route Plan',
    workspaceName: 'Solaris Airways',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2030-12-31T00:00:00.000Z',
    fleet: [
      { id: 'fleet-1', aircraftType: 'A320ceo', engine: 'CFM56-5B', layout: '174Y', numberOfAircraft: 6, ownership: 'Leased', cabinClasses: [{ code: 'Y', seats: 174 }] },
      { id: 'fleet-2', aircraftType: 'A321ceo', engine: 'CFM56-5B', layout: '212Y', numberOfAircraft: 4, ownership: 'Leased', cabinClasses: [{ code: 'Y', seats: 212 }] },
    ],
    routes: [
      { id: 'route-1', origin: 'FRA', destination: 'PMI' },
      { id: 'route-2', origin: 'FRA', destination: 'IBZ' },
      { id: 'route-3', origin: 'FRA', destination: 'HER' },
      { id: 'route-4', origin: 'FRA', destination: 'CFU' },
      { id: 'route-5', origin: 'FRA', destination: 'SPU' },
      { id: 'route-6', origin: 'FRA', destination: 'DBV' },
      { id: 'route-7', origin: 'FRA', destination: 'OLB' },
      { id: 'route-8', origin: 'FRA', destination: 'NAP' },
    ],
  }),
};

/**
 * Get mock data for a study, or null if no mock exists
 */
export function getMockStudyData(studyId: string | undefined): PersistedStudyData | null {
  if (!studyId) return null;
  return MOCK_STUDIES[studyId] || null;
}
