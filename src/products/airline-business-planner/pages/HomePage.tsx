import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavicon } from '@/hooks/useFavicon';
import { AppHeader } from '@/design-system/composites/AppHeader';
import { ProductBanner } from '@/design-system/composites/ProductBanner';
import { HomePageActionBar } from '@/design-system/composites/HomePageActionBar';
import { Workspace } from '@/design-system/composites/Workspace';
import { StudyTableHeader } from '@/design-system/components/StudyTableHeader';
import { StudyRow } from '@/design-system/components/StudyRow';
import type { StudyStatusState } from '@/design-system/components/StudyStatus';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/design-system/components/DropdownMenu';
import { Button } from '@/design-system/components/Button';
import { IconButton } from '@/design-system/components/IconButton';
import { TextInput } from '@/design-system/components/TextInput';
import type { HomePageTab } from '@/design-system/composites/HomePageActionBar';
import { CreateStudyModal } from '../components/CreateStudyModal';
import type { CreateStudyData } from '../components/CreateStudyModal';
import economicsBackground from '@/design-system/assets/backgrounds/Economics.png';
import '@/pages/HomePage.css';

// Current user
const CURRENT_USER = 'Mark Thompson';

// Study columns configuration
const STUDY_COLUMNS = [
  { key: 'name', label: 'Name', width: '200px' },
  { key: 'description', label: 'Description', flex: 1 },
  { key: 'simulationPeriod', label: 'Simulation Period', width: '160px' },
  { key: 'createdBy', label: 'Created By', width: '140px' },
  { key: 'lastModification', label: 'Last Modification', width: '140px' },
];

// Study data type
interface Study {
  id: number;
  status: StudyStatusState;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  lastModification: string;
}

// Workspace data type
interface WorkspaceData {
  id: number;
  title: string;
  studyCount: number;
  lastModified: string;
  isComputing: boolean;
  computingText?: string;
  users: { initials: string; name: string }[];
  studies: Study[];
}

// All workspaces data — each workspace is a startup airline company
const INITIAL_WORKSPACES: WorkspaceData[] = [
  {
    id: 1,
    title: 'NovAir',
    studyCount: 8,
    lastModified: 'Jan 27, 2025',
    isComputing: true,
    computingText: '2 Computing',
    users: [
      { initials: 'MT', name: 'Mark Thompson' },
      { initials: 'JD', name: 'Jane Doe' },
      { initials: 'AB', name: 'Alice Brown' },
    ],
    studies: [
      { id: 1, status: 'Computed', name: 'Launch Revenue Forecast', description: 'Year 1 ticket revenue projection for 12 European routes', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Mark Thompson', lastModification: 'Jan 27, 2025' },
      { id: 2, status: 'Computing', name: 'A320neo Fleet Acquisition', description: 'Lease vs buy scenario for 6 A320neo aircraft', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2036', createdBy: 'Jane Doe', lastModification: 'Jan 26, 2025' },
      { id: 3, status: 'Computing', name: 'CDG Hub Slot Strategy', description: 'Paris CDG slot allocation and gate planning', startDate: 'Mar 01, 2026', endDate: 'Feb 28, 2036', createdBy: 'Alice Brown', lastModification: 'Jan 25, 2025' },
      { id: 4, status: 'Computed', name: 'Low-Cost Pricing Model', description: 'Dynamic fare structure with ancillary revenue bundles', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Mark Thompson', lastModification: 'Jan 22, 2025' },
      { id: 5, status: 'Draft', name: 'Crew Base Setup Plan', description: 'Pilot and cabin crew recruitment for Paris and Lisbon bases', startDate: 'Jun 01, 2025', endDate: 'May 31, 2035', createdBy: 'Jane Doe', lastModification: 'Jan 20, 2025' },
      { id: 6, status: 'Computed', name: 'Break-Even Analysis', description: 'Load factor threshold per route for profitability', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Mark Thompson', lastModification: 'Jan 18, 2025' },
      { id: 7, status: 'Failed', name: 'Summer Peak Capacity', description: 'High-season frequency increase on Mediterranean routes', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2034', createdBy: 'Alice Brown', lastModification: 'Jan 15, 2025' },
      { id: 8, status: 'Computed', name: 'Ground Ops Cost Model', description: 'Airport handling and turnaround cost estimation', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2036', createdBy: 'Mark Thompson', lastModification: 'Jan 10, 2025' },
    ],
  },
  {
    id: 2,
    title: 'Zephyr Airlines',
    studyCount: 12,
    lastModified: 'Jan 25, 2025',
    isComputing: false,
    users: [
      { initials: 'MT', name: 'Mark Thompson' },
      { initials: 'PL', name: 'Paul Lee' },
    ],
    studies: [
      { id: 1, status: 'Computed', name: 'Transatlantic Network', description: 'Route viability for 8 US gateway cities from London', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Mark Thompson', lastModification: 'Jan 25, 2025' },
      { id: 2, status: 'Computed', name: 'Premium Cabin Revenue', description: 'Business class yield and load factor projections', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2036', createdBy: 'Paul Lee', lastModification: 'Jan 24, 2025' },
      { id: 3, status: 'Computed', name: 'A350-900 Fleet Plan', description: 'Delivery schedule and financing for 10 widebody aircraft', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2037', createdBy: 'Mark Thompson', lastModification: 'Jan 23, 2025' },
      { id: 4, status: 'Draft', name: 'Lounge & Ground Product', description: 'Departure lounge investment and passenger experience cost', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Paul Lee', lastModification: 'Jan 22, 2025' },
      { id: 5, status: 'Computed', name: 'Fuel Hedging Strategy', description: 'Jet fuel price scenarios and hedging impact on CASK', startDate: 'Apr 01, 2026', endDate: 'Mar 31, 2036', createdBy: 'Mark Thompson', lastModification: 'Jan 20, 2025' },
      { id: 6, status: 'Computed', name: 'Codeshare Partnerships', description: 'Revenue sharing model with legacy carrier partners', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Paul Lee', lastModification: 'Jan 18, 2025' },
      { id: 7, status: 'Computed', name: 'LHR Slot Acquisition', description: 'Heathrow slot cost and scheduling constraints analysis', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2036', createdBy: 'Mark Thompson', lastModification: 'Jan 15, 2025' },
      { id: 8, status: 'Draft', name: 'Loyalty Program Design', description: 'Frequent flyer economics and tier structure modeling', startDate: 'Jan 01, 2027', endDate: 'Dec 31, 2036', createdBy: 'Paul Lee', lastModification: 'Jan 12, 2025' },
      { id: 9, status: 'Computed', name: '10-Year P&L Projection', description: 'Full income statement forecast with growth scenarios', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Mark Thompson', lastModification: 'Jan 10, 2025' },
      { id: 10, status: 'Computed', name: 'Crew Scheduling Model', description: 'Long-haul pilot rostering and rest requirements', startDate: 'Apr 01, 2026', endDate: 'Mar 31, 2036', createdBy: 'Paul Lee', lastModification: 'Jan 8, 2025' },
      { id: 11, status: 'Computed', name: 'Currency Risk Assessment', description: 'Multi-currency revenue exposure on transatlantic ops', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Mark Thompson', lastModification: 'Jan 5, 2025' },
      { id: 12, status: 'Warning', name: 'MRO Contract Evaluation', description: 'Engine and airframe maintenance outsourcing cost', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2037', createdBy: 'Paul Lee', lastModification: 'Jan 3, 2025' },
    ],
  },
  {
    id: 3,
    title: 'SkyBridge Regional',
    studyCount: 5,
    lastModified: 'Jan 20, 2025',
    isComputing: false,
    users: [
      { initials: 'JD', name: 'Jane Doe' },
    ],
    studies: [
      { id: 1, status: 'Computed', name: 'Regional Route Map', description: 'Feasibility of 20 short-haul routes in Scandinavia', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Jane Doe', lastModification: 'Jan 20, 2025' },
      { id: 2, status: 'Computed', name: 'ATR 72-600 Fleet Plan', description: 'Turboprop acquisition for 8 aircraft over 3 years', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2036', createdBy: 'Jane Doe', lastModification: 'Jan 18, 2025' },
      { id: 3, status: 'Draft', name: 'PSO Route Subsidies', description: 'Public service obligation funding eligibility analysis', startDate: 'Jun 01, 2026', endDate: 'May 31, 2036', createdBy: 'Jane Doe', lastModification: 'Jan 15, 2025' },
      { id: 4, status: 'Computed', name: 'Hub Feed Strategy', description: 'Connecting traffic model with SAS and Finnair hubs', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Jane Doe', lastModification: 'Jan 12, 2025' },
      { id: 5, status: 'Computed', name: 'Operating Cost Benchmark', description: 'CASK comparison vs Nordic regional competitors', startDate: 'Jan 01, 2027', endDate: 'Dec 31, 2036', createdBy: 'Jane Doe', lastModification: 'Jan 8, 2025' },
    ],
  },
  {
    id: 4,
    title: 'AeroVerde',
    studyCount: 3,
    lastModified: 'Jan 15, 2025',
    isComputing: true,
    computingText: '1 Computing',
    users: [
      { initials: 'AB', name: 'Alice Brown' },
      { initials: 'MT', name: 'Mark Thompson' },
      { initials: 'JD', name: 'Jane Doe' },
      { initials: 'PL', name: 'Paul Lee' },
      { initials: 'SC', name: 'Sarah Connor' },
      { initials: 'RW', name: 'Robert Williams' },
      { initials: 'EG', name: 'Emma Garcia' },
      { initials: 'DM', name: 'David Martinez' },
      { initials: 'LJ', name: 'Lisa Johnson' },
      { initials: 'KC', name: 'Kevin Chen' },
    ],
    studies: [
      { id: 1, status: 'Computed', name: 'SAF Supply Chain Plan', description: 'Sustainable aviation fuel sourcing and cost projection', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Alice Brown', lastModification: 'Jan 15, 2025' },
      { id: 2, status: 'Computing', name: 'Carbon Offset Revenue', description: 'Green premium pricing and carbon credit integration', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2036', createdBy: 'Mark Thompson', lastModification: 'Jan 14, 2025' },
      { id: 3, status: 'Draft', name: 'Electric Aircraft Roadmap', description: 'Hybrid-electric fleet introduction for short-haul by 2035', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2037', createdBy: 'Jane Doe', lastModification: 'Jan 10, 2025' },
    ],
  },
  {
    id: 5,
    title: 'Solaris Airways',
    studyCount: 15,
    lastModified: 'Jan 10, 2025',
    isComputing: false,
    users: [
      { initials: 'PL', name: 'Paul Lee' },
      { initials: 'AB', name: 'Alice Brown' },
    ],
    studies: [
      { id: 1, status: 'Computed', name: 'Mediterranean Route Plan', description: 'Seasonal routes to 15 leisure destinations from Frankfurt', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Paul Lee', lastModification: 'Jan 10, 2025' },
      { id: 2, status: 'Computed', name: 'Charter Revenue Model', description: 'Tour operator partnership and block seat agreements', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2036', createdBy: 'Alice Brown', lastModification: 'Jan 9, 2025' },
      { id: 3, status: 'Computed', name: 'B737 MAX 8 Fleet Plan', description: 'Lease terms and delivery timeline for 12 aircraft', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2037', createdBy: 'Paul Lee', lastModification: 'Jan 8, 2025' },
      { id: 4, status: 'Computed', name: 'Ancillary Revenue Bundle', description: 'Baggage, seat selection and onboard sales projection', startDate: 'Apr 01, 2026', endDate: 'Mar 31, 2036', createdBy: 'Alice Brown', lastModification: 'Jan 7, 2025' },
      { id: 5, status: 'Draft', name: 'Winter Sun Expansion', description: 'Canary Islands and North Africa winter program', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Paul Lee', lastModification: 'Jan 6, 2025' },
      { id: 6, status: 'Computed', name: 'Airport Fees Benchmark', description: 'Landing fees and ground handling costs at 15 airports', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2036', createdBy: 'Alice Brown', lastModification: 'Jan 5, 2025' },
      { id: 7, status: 'Computed', name: 'Seasonal Crew Planning', description: 'Cabin crew and pilot hiring for peak summer operations', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2034', createdBy: 'Paul Lee', lastModification: 'Jan 4, 2025' },
      { id: 8, status: 'Computed', name: 'Competitor Fare Analysis', description: 'Pricing gap study vs Ryanair, easyJet and Condor', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Alice Brown', lastModification: 'Jan 3, 2025' },
      { id: 9, status: 'Draft', name: 'GDS vs Direct Sales Mix', description: 'Distribution channel cost and conversion rate modeling', startDate: 'Apr 01, 2026', endDate: 'Mar 31, 2036', createdBy: 'Paul Lee', lastModification: 'Jan 2, 2025' },
      { id: 10, status: 'Computed', name: 'Load Factor Sensitivity', description: 'Break-even load factor per route under 3 fare scenarios', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Alice Brown', lastModification: 'Dec 30, 2024' },
      { id: 11, status: 'Computed', name: 'Night Stop Cost Analysis', description: 'Outstation parking and crew hotel cost optimization', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2036', createdBy: 'Paul Lee', lastModification: 'Dec 28, 2024' },
      { id: 12, status: 'Computed', name: 'Turnaround Efficiency', description: '25-minute turnaround feasibility and delay risk model', startDate: 'Jan 01, 2027', endDate: 'Dec 31, 2036', createdBy: 'Alice Brown', lastModification: 'Dec 25, 2024' },
      { id: 13, status: 'Computed', name: 'Insurance & Liability Cost', description: 'Hull and liability insurance quotes for startup phase', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Paul Lee', lastModification: 'Dec 22, 2024' },
      { id: 14, status: 'Warning', name: 'Disruption Recovery Plan', description: 'IROPS cost model and passenger re-accommodation budget', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2036', createdBy: 'Alice Brown', lastModification: 'Dec 20, 2024' },
      { id: 15, status: 'Computed', name: '10-Year Cash Flow Plan', description: 'Monthly cash flow projection with funding milestones', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Paul Lee', lastModification: 'Dec 18, 2024' },
    ],
  },
  {
    id: 6,
    title: 'CargoLift Express',
    studyCount: 7,
    lastModified: 'Jan 8, 2025',
    isComputing: false,
    users: [
      { initials: 'JD', name: 'Jane Doe' },
      { initials: 'PL', name: 'Paul Lee' },
    ],
    studies: [
      { id: 1, status: 'Computed', name: 'B767F Fleet Acquisition', description: 'Converted freighter lease plan for 4 aircraft', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2036', createdBy: 'Jane Doe', lastModification: 'Jan 8, 2025' },
      { id: 2, status: 'Computed', name: 'E-Commerce Demand Model', description: 'Parcel volume forecast from European online retailers', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Paul Lee', lastModification: 'Jan 6, 2025' },
      { id: 3, status: 'Computed', name: 'Hub Network Design', description: 'Overnight hub-and-spoke model from Leipzig/Halle', startDate: 'Jun 01, 2026', endDate: 'May 31, 2036', createdBy: 'Jane Doe', lastModification: 'Jan 4, 2025' },
      { id: 4, status: 'Draft', name: 'ACMI Revenue Scenario', description: 'Wet lease revenue from peak season capacity sales', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Paul Lee', lastModification: 'Jan 2, 2025' },
      { id: 5, status: 'Computed', name: 'Ground Infra Investment', description: 'Warehouse and ULD handling equipment CAPEX plan', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2036', createdBy: 'Jane Doe', lastModification: 'Dec 30, 2024' },
      { id: 6, status: 'Computed', name: 'Fuel & Maintenance CASK', description: 'Operating cost per ATK for B767F operations', startDate: 'Jan 01, 2027', endDate: 'Dec 31, 2036', createdBy: 'Paul Lee', lastModification: 'Dec 28, 2024' },
      { id: 7, status: 'Computed', name: 'Integrator Partnership', description: 'Feeder contract model with DHL and UPS networks', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2037', createdBy: 'Jane Doe', lastModification: 'Dec 25, 2024' },
    ],
  },
  {
    id: 7,
    title: 'AltaJet',
    studyCount: 4,
    lastModified: 'Jan 5, 2025',
    isComputing: false,
    users: [
      { initials: 'MT', name: 'Mark Thompson' },
    ],
    studies: [
      { id: 1, status: 'Computed', name: 'All-Business Route Plan', description: 'Single-class A321LR service on 6 transatlantic routes', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Mark Thompson', lastModification: 'Jan 5, 2025' },
      { id: 2, status: 'Computed', name: 'Yield & Demand Forecast', description: 'Premium fare elasticity on NYC, London, Dubai routes', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2036', createdBy: 'Mark Thompson', lastModification: 'Jan 3, 2025' },
      { id: 3, status: 'Draft', name: 'FBO Lounge Strategy', description: 'Private terminal partnership at JFK, LHR, and DXB', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Mark Thompson', lastModification: 'Dec 30, 2024' },
      { id: 4, status: 'Computed', name: 'Investor Pitch Financials', description: 'Series B funding model with 10-year EBITDA projection', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Mark Thompson', lastModification: 'Dec 28, 2024' },
    ],
  },
  {
    id: 8,
    title: 'Pacific Wings',
    studyCount: 9,
    lastModified: 'Dec 28, 2024',
    isComputing: false,
    users: [
      { initials: 'AB', name: 'Alice Brown' },
    ],
    studies: [
      { id: 1, status: 'Computed', name: 'Island Hopper Network', description: 'Inter-island routes across 12 Pacific island nations', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Alice Brown', lastModification: 'Dec 28, 2024' },
      { id: 2, status: 'Computed', name: 'DHC-6 Twin Otter Fleet', description: 'STOL aircraft acquisition for short runway operations', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2036', createdBy: 'Alice Brown', lastModification: 'Dec 25, 2024' },
      { id: 3, status: 'Computed', name: 'Tourism Revenue Model', description: 'Passenger demand linked to resort occupancy forecasts', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Alice Brown', lastModification: 'Dec 22, 2024' },
      { id: 4, status: 'Computed', name: 'Regulatory Certification', description: 'AOC application timeline and compliance cost for Fiji', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2036', createdBy: 'Alice Brown', lastModification: 'Dec 20, 2024' },
      { id: 5, status: 'Draft', name: 'Medical Evacuation Ops', description: 'Medevac charter revenue as secondary business line', startDate: 'Jul 01, 2026', endDate: 'Jun 30, 2036', createdBy: 'Alice Brown', lastModification: 'Dec 18, 2024' },
      { id: 6, status: 'Computed', name: 'Fuel Logistics Plan', description: 'Avgas supply chain and storage at remote airstrips', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Alice Brown', lastModification: 'Dec 15, 2024' },
      { id: 7, status: 'Computed', name: 'Government Subsidy Model', description: 'Essential air service funding from island governments', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2037', createdBy: 'Alice Brown', lastModification: 'Dec 12, 2024' },
      { id: 8, status: 'Computed', name: 'Maintenance Base Setup', description: 'MRO facility investment at Nadi International Airport', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2035', createdBy: 'Alice Brown', lastModification: 'Dec 10, 2024' },
      { id: 9, status: 'Failed', name: 'Seaplane Operations', description: 'Water aerodrome feasibility for lagoon destinations', startDate: 'Jan 01, 2027', endDate: 'Dec 31, 2036', createdBy: 'Alice Brown', lastModification: 'Dec 8, 2024' },
    ],
  },
];

// (MY_WORKSPACES derived inside component from state)

// Dropdown menu items by study status
function StudyDropdownContent({ status }: { status: StudyStatusState }) {
  switch (status) {
    case 'Computed':
      return (
        <>
          <DropdownMenuItem icon="open_in_new" onSelect={() => console.log('Open Results')}>
            Open Results
          </DropdownMenuItem>
          <DropdownMenuItem icon="download" onSelect={() => console.log('Download Results')}>
            Download Results
          </DropdownMenuItem>
          <DropdownMenuItem icon="content_copy" onSelect={() => console.log('Duplicate Study')}>
            Duplicate Study
          </DropdownMenuItem>
          <DropdownMenuItem icon="delete" destructive onSelect={() => console.log('Delete Study')}>
            Delete Study
          </DropdownMenuItem>
        </>
      );
    case 'Draft':
      return (
        <>
          <DropdownMenuItem icon="edit" onSelect={() => console.log('Edit Inputs')}>
            Edit Inputs
          </DropdownMenuItem>
          <DropdownMenuItem icon="content_copy" onSelect={() => console.log('Duplicate Study')}>
            Duplicate Study
          </DropdownMenuItem>
          <DropdownMenuItem icon="delete" destructive onSelect={() => console.log('Delete Study')}>
            Delete Study
          </DropdownMenuItem>
        </>
      );
    case 'Failed':
    case 'Warning':
      return (
        <>
          <DropdownMenuItem icon="edit" onSelect={() => console.log('Edit Inputs')}>
            Edit Inputs
          </DropdownMenuItem>
          <DropdownMenuItem icon="content_copy" onSelect={() => console.log('Duplicate Study')}>
            Duplicate Study
          </DropdownMenuItem>
          <DropdownMenuItem icon="delete" destructive onSelect={() => console.log('Delete Study')}>
            Delete Study
          </DropdownMenuItem>
        </>
      );
    case 'Computing':
      return (
        <>
          <DropdownMenuItem icon="visibility" onSelect={() => console.log('View Inputs')}>
            View Inputs
          </DropdownMenuItem>
          <DropdownMenuItem icon="content_copy" onSelect={() => console.log('Duplicate Study')}>
            Duplicate Study
          </DropdownMenuItem>
          <DropdownMenuItem icon="cancel" onSelect={() => console.log('Cancel Computation')}>
            Cancel Computation
          </DropdownMenuItem>
          <DropdownMenuItem icon="delete" destructive onSelect={() => console.log('Delete Study')}>
            Delete Study
          </DropdownMenuItem>
        </>
      );
    default:
      return null;
  }
}

/**
 * Airline Business Planner - HomePage
 *
 * Home page for the Airline Business Planner tool using the HomePage template.
 */
export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<HomePageTab>('my-studies');
  const [searchValue, setSearchValue] = useState('');
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>(INITIAL_WORKSPACES);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Derived data
  const workspaceNames = workspaces.map((ws) => ws.title);

  // Filter studies by search value across all properties (including workspace name)
  const filterStudies = (ws: WorkspaceData): WorkspaceData & { filteredStudies: Study[] } => {
    const query = searchValue.toLowerCase().trim();
    if (!query) return { ...ws, filteredStudies: ws.studies };

    const filteredStudies = ws.studies.filter((study) => {
      const fields = [
        study.name,
        study.description,
        study.status,
        study.startDate,
        study.endDate,
        study.createdBy,
        study.lastModification,
        ws.title, // workspace name is a property of the study
      ];
      return fields.some((field) => field.toLowerCase().includes(query));
    });

    return { ...ws, filteredStudies };
  };

  // Apply tab filter then search filter, remove empty workspaces
  const tabWorkspaces = (activeTab === 'my-studies'
    ? workspaces.filter((ws) => ws.users.some((user) => user.name === CURRENT_USER))
    : workspaces
  );
  const displayedWorkspaces = tabWorkspaces
    .map(filterStudies)
    .filter((ws) => ws.filteredStudies.length > 0);

  // Set favicon for Airline Business Planner
  useFavicon('airline-business-planner');

  // Set page title
  useEffect(() => {
    document.title = 'Airline Business Planner';
  }, []);

  const handleNewStudy = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateStudy = (data: CreateStudyData) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const studyId = Date.now();

    const newStudy: Study = {
      id: studyId,
      status: 'Draft',
      name: data.name,
      description: data.description,
      startDate: dateStr,
      endDate: new Date(now.getFullYear() + 10, now.getMonth(), now.getDate())
        .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      createdBy: CURRENT_USER,
      lastModification: dateStr,
    };

    if (data.isNewWorkspace) {
      // Create new workspace with this study
      const newWorkspace: WorkspaceData = {
        id: Date.now(),
        title: data.workspaceName,
        studyCount: 1,
        lastModified: dateStr,
        isComputing: false,
        users: [{ initials: CURRENT_USER.split(' ').map((n) => n[0]).join(''), name: CURRENT_USER }],
        studies: [newStudy],
      };
      setWorkspaces((prev) => [newWorkspace, ...prev]);
    } else {
      // Add study to existing workspace
      setWorkspaces((prev) =>
        prev.map((ws) => {
          if (ws.title.toLowerCase() === data.workspaceName.toLowerCase()) {
            return {
              ...ws,
              studies: [newStudy, ...ws.studies],
              studyCount: ws.studyCount + 1,
              lastModified: dateStr,
            };
          }
          return ws;
        })
      );
    }

    setIsCreateModalOpen(false);
    navigate(`study/${studyId}`, {
      state: { studyName: data.name, workspaceName: data.workspaceName },
    });
  };

  const handleTabChange = (tab: HomePageTab) => {
    setActiveTab(tab);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="home-page">
      {/* Application Header */}
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
              onClick={() => console.log('User clicked')}
            />
          </>
        }
      />

      {/* Product Panel - Hero section */}
      <ProductBanner
        tool="airline-business-planner"
        productName="Airline Business Planner"
        productDescription="A tool that models an airline's future performance to project economic and business outcomes. Analyze market scenarios, optimize fleet allocation, and forecast revenue to make data-driven strategic decisions."
        backgroundImage={economicsBackground}
        links={[
          { label: 'DOCUMENTATION', href: '#documentation', icon: 'info' },
          { label: 'APIs', href: '#apis', icon: 'code' },
          { label: 'CONTACT & SUPPORT', href: '#support', icon: 'forum' },
        ]}
      />

      {/* Main Content Area */}
      <main className="home-page__content">
        {/* Action Bar with Tabs and Actions */}
        <HomePageActionBar activeTab={activeTab} onTabChange={handleTabChange}>
          <Button
            label="SORT BY"
            leftIcon="filter_row"
            rightIcon="dropdown"
            variant="Ghost"
            size="M"
          />
          <TextInput
            placeholder="Search for study"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            showLabel={false}
            showLeftIcon
            leftIcon="search"
            showRightIconButton={searchValue.length > 0}
            rightIconButton="close"
            onRightIconButtonClick={() => setSearchValue('')}
            size="M"
            className="home-page__search"
          />
          <Button
            label="NEW STUDY"
            leftIcon="add"
            size="M"
            onClick={handleNewStudy}
          />
        </HomePageActionBar>

        {/* Tab Content - List of workspaces */}
        <section className="home-page__tab-content">
          {displayedWorkspaces.map((workspace) => (
            <Workspace
              key={workspace.id}
              title={workspace.title}
              studyCount={workspace.studyCount}
              lastModified={workspace.lastModified}
              isComputing={workspace.isComputing}
              computingText={workspace.computingText}
              users={
                activeTab === 'my-studies'
                  ? workspace.users.filter((user) => user.name === CURRENT_USER)
                  : workspace.users
              }
              defaultOpen={workspace.id === 1 || searchValue.trim().length > 0}
            >
              <StudyTableHeader
                columns={STUDY_COLUMNS}
              />
              {workspace.filteredStudies.map((study) => (
                <div key={study.id} className="home-page__study-row-wrapper">
                  <StudyRow
                    status={study.status}
                    columns={[
                      { key: 'name', value: study.name, width: '200px' },
                      { key: 'description', value: <span className="home-page__study-description">{study.description}</span>, flex: 1 },
                      {
                        key: 'simulationPeriod',
                        width: '160px',
                        value: (
                          <div className="home-page__simulation-period">
                            <span>{study.startDate}</span>
                            <span>{study.endDate}</span>
                          </div>
                        ),
                      },
                      { key: 'createdBy', value: study.createdBy, width: '140px' },
                      { key: 'lastModification', value: study.lastModification, width: '140px' },
                    ]}
                  />
                  <div className="home-page__study-menu">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <IconButton
                          icon="more_horiz"
                          size="XS"
                          variant="Ghost"
                          alt="More options"
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <StudyDropdownContent status={study.status} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </Workspace>
          ))}
        </section>
      </main>

      {/* Create New Study Modal */}
      <CreateStudyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateStudy={handleCreateStudy}
        workspaceNames={workspaceNames}
      />
    </div>
  );
}
