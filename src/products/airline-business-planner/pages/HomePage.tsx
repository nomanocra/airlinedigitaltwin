import { useState, useEffect, useRef, useCallback } from 'react';
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
import { EditStudyInfoModal } from '../components/EditStudyInfoModal';
import type { EditStudyInfoData } from '../components/EditStudyInfoModal';
import { MoveStudyModal } from '../components/MoveStudyModal';
import type { MoveStudyData } from '../components/MoveStudyModal';
import { DeleteStudyModal } from '../components/DeleteStudyModal';
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

// ========== LOCAL STORAGE PERSISTENCE FOR WORKSPACES ==========
const WORKSPACES_STORAGE_KEY = 'abp_workspaces';

function loadWorkspacesFromStorage(): WorkspaceData[] | null {
  try {
    const data = localStorage.getItem(WORKSPACES_STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as WorkspaceData[];
    }
  } catch (e) {
    console.warn('Failed to load workspaces from localStorage:', e);
  }
  return null;
}

function saveWorkspacesToStorage(workspaces: WorkspaceData[]): void {
  try {
    localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(workspaces));
  } catch (e) {
    console.warn('Failed to save workspaces to localStorage:', e);
  }
}

// All workspaces data — each workspace is a startup airline company
// My Studies (Mark Thompson): NovAir, Zephyr Airlines
// All Studies: 5 workspaces with 2-3 studies each
const INITIAL_WORKSPACES: WorkspaceData[] = [
  {
    id: 1,
    title: 'NovAir',
    studyCount: 3,
    lastModified: 'Jan 27, 2025',
    isComputing: false,
    users: [
      { initials: 'MT', name: 'Mark Thompson' },
      { initials: 'JD', name: 'Jane Doe' },
    ],
    studies: [
      { id: 1, status: 'Computed', name: 'Launch Revenue Forecast', description: 'Year 1 ticket revenue projection for 12 European routes', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2030', createdBy: 'Mark Thompson', lastModification: 'Jan 27, 2025' },
      { id: 2, status: 'Draft', name: 'A320neo Fleet Acquisition', description: 'Lease vs buy scenario for 6 A320neo aircraft', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2030', createdBy: 'Jane Doe', lastModification: 'Jan 26, 2025' },
      { id: 3, status: 'Computing', name: 'CDG Hub Slot Strategy', description: 'Paris CDG slot allocation and gate planning', startDate: 'Mar 01, 2026', endDate: 'Feb 28, 2030', createdBy: 'Mark Thompson', lastModification: 'Jan 25, 2025' },
    ],
  },
  {
    id: 2,
    title: 'Zephyr Airlines',
    studyCount: 2,
    lastModified: 'Jan 25, 2025',
    isComputing: false,
    users: [
      { initials: 'MT', name: 'Mark Thompson' },
      { initials: 'PL', name: 'Paul Lee' },
    ],
    studies: [
      { id: 1, status: 'Computed', name: 'Transatlantic Network', description: 'Route viability for 8 US gateway cities from London', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2030', createdBy: 'Mark Thompson', lastModification: 'Jan 25, 2025' },
      { id: 2, status: 'Draft', name: 'Premium Cabin Revenue', description: 'Business class yield and load factor projections', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2030', createdBy: 'Paul Lee', lastModification: 'Jan 24, 2025' },
    ],
  },
  {
    id: 3,
    title: 'SkyBridge Regional',
    studyCount: 2,
    lastModified: 'Jan 20, 2025',
    isComputing: false,
    users: [
      { initials: 'JD', name: 'Jane Doe' },
    ],
    studies: [
      { id: 1, status: 'Computed', name: 'Regional Route Map', description: 'Feasibility of 20 short-haul routes in Scandinavia', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2030', createdBy: 'Jane Doe', lastModification: 'Jan 20, 2025' },
      { id: 2, status: 'Draft', name: 'ATR 72-600 Fleet Plan', description: 'Turboprop acquisition for 8 aircraft over 3 years', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2030', createdBy: 'Jane Doe', lastModification: 'Jan 18, 2025' },
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
      { initials: 'JD', name: 'Jane Doe' },
    ],
    studies: [
      { id: 1, status: 'Computed', name: 'SAF Supply Chain Plan', description: 'Sustainable aviation fuel sourcing and cost projection', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2030', createdBy: 'Alice Brown', lastModification: 'Jan 15, 2025' },
      { id: 2, status: 'Computing', name: 'Carbon Offset Revenue', description: 'Green premium pricing and carbon credit integration', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2030', createdBy: 'Alice Brown', lastModification: 'Jan 14, 2025' },
      { id: 3, status: 'Draft', name: 'Electric Aircraft Roadmap', description: 'Hybrid-electric fleet introduction for short-haul by 2035', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2030', createdBy: 'Jane Doe', lastModification: 'Jan 10, 2025' },
    ],
  },
  {
    id: 5,
    title: 'Solaris Airways',
    studyCount: 2,
    lastModified: 'Jan 10, 2025',
    isComputing: false,
    users: [
      { initials: 'PL', name: 'Paul Lee' },
      { initials: 'AB', name: 'Alice Brown' },
    ],
    studies: [
      { id: 1, status: 'Computed', name: 'Mediterranean Route Plan', description: 'Seasonal routes to 15 leisure destinations from Frankfurt', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2030', createdBy: 'Paul Lee', lastModification: 'Jan 10, 2025' },
      { id: 2, status: 'Warning', name: 'Charter Revenue Model', description: 'Tour operator partnership and block seat agreements', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2030', createdBy: 'Alice Brown', lastModification: 'Jan 9, 2025' },
    ],
  },
];

// (MY_WORKSPACES derived inside component from state)

/**
 * Airline Business Planner - HomePage
 *
 * Home page for the Airline Business Planner tool using the HomePage template.
 */
export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<HomePageTab>('my-studies');
  const [searchValue, setSearchValue] = useState('');
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>(() => {
    // Load from localStorage on initial mount, fallback to INITIAL_WORKSPACES
    return loadWorkspacesFromStorage() || INITIAL_WORKSPACES;
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Edit/Move/Delete modals state
  const [isEditInfoModalOpen, setIsEditInfoModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<{ study: Study; workspaceId: number; workspaceName: string } | null>(null);

  // Persist workspaces to localStorage whenever they change
  const isInitialMount = useRef(true);
  useEffect(() => {
    // Skip saving on initial mount (we just loaded from storage)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveWorkspacesToStorage(workspaces);
  }, [workspaces]);

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

  // ========== STUDY DROPDOWN ACTIONS ==========

  const handleOpenInNew = (studyId: number) => {
    window.open(`/airline-business-planner/study/${studyId}`, '_blank');
  };

  const handleEditInfo = (study: Study, workspaceId: number, workspaceName: string) => {
    setSelectedStudy({ study, workspaceId, workspaceName });
    setIsEditInfoModalOpen(true);
  };

  const handleSaveStudyInfo = (data: EditStudyInfoData) => {
    if (!selectedStudy) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === selectedStudy.workspaceId) {
          return {
            ...ws,
            lastModified: dateStr,
            studies: ws.studies.map((s) =>
              s.id === selectedStudy.study.id
                ? { ...s, name: data.name, description: data.description, lastModification: dateStr }
                : s
            ),
          };
        }
        return ws;
      })
    );

    setIsEditInfoModalOpen(false);
    setSelectedStudy(null);
  };

  const handleMoveStudy = (study: Study, workspaceId: number, workspaceName: string) => {
    setSelectedStudy({ study, workspaceId, workspaceName });
    setIsMoveModalOpen(true);
  };

  const handleConfirmMove = (data: MoveStudyData) => {
    if (!selectedStudy) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    // Update the study with new lastModification
    const movedStudy = { ...selectedStudy.study, lastModification: dateStr };

    if (data.isNewWorkspace) {
      // Create new workspace and move study there
      const newWorkspace: WorkspaceData = {
        id: Date.now(),
        title: data.workspaceName,
        studyCount: 1,
        lastModified: dateStr,
        isComputing: false,
        users: [{ initials: CURRENT_USER.split(' ').map((n) => n[0]).join(''), name: CURRENT_USER }],
        studies: [movedStudy],
      };

      setWorkspaces((prev) => [
        newWorkspace,
        ...prev.map((ws) => {
          if (ws.id === selectedStudy.workspaceId) {
            const newStudies = ws.studies.filter((s) => s.id !== selectedStudy.study.id);
            return {
              ...ws,
              studies: newStudies,
              studyCount: newStudies.length,
              lastModified: dateStr,
            };
          }
          return ws;
        }).filter((ws) => ws.studies.length > 0), // Remove empty workspaces
      ]);
    } else {
      // Move to existing workspace
      setWorkspaces((prev) =>
        prev.map((ws) => {
          if (ws.id === selectedStudy.workspaceId) {
            // Remove from source workspace
            const newStudies = ws.studies.filter((s) => s.id !== selectedStudy.study.id);
            return {
              ...ws,
              studies: newStudies,
              studyCount: newStudies.length,
              lastModified: dateStr,
            };
          }
          if (ws.title.toLowerCase() === data.workspaceName.toLowerCase()) {
            // Add to destination workspace
            return {
              ...ws,
              studies: [movedStudy, ...ws.studies],
              studyCount: ws.studyCount + 1,
              lastModified: dateStr,
            };
          }
          return ws;
        }).filter((ws) => ws.studies.length > 0) // Remove empty workspaces
      );
    }

    setIsMoveModalOpen(false);
    setSelectedStudy(null);
  };

  const handleDuplicateStudy = (study: Study, workspaceId: number) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const duplicatedStudy: Study = {
      ...study,
      id: Date.now(),
      name: `${study.name} (Copy)`,
      status: 'Draft',
      createdBy: CURRENT_USER,
      lastModification: dateStr,
    };

    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === workspaceId) {
          const studyIndex = ws.studies.findIndex((s) => s.id === study.id);
          const newStudies = [...ws.studies];
          newStudies.splice(studyIndex + 1, 0, duplicatedStudy);
          return {
            ...ws,
            studies: newStudies,
            studyCount: ws.studyCount + 1,
            lastModified: dateStr,
          };
        }
        return ws;
      })
    );
  };

  const handleDeleteStudy = (study: Study, workspaceId: number, workspaceName: string) => {
    setSelectedStudy({ study, workspaceId, workspaceName });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedStudy) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === selectedStudy.workspaceId) {
          const newStudies = ws.studies.filter((s) => s.id !== selectedStudy.study.id);
          return {
            ...ws,
            studies: newStudies,
            studyCount: newStudies.length,
            lastModified: dateStr,
          };
        }
        return ws;
      }).filter((ws) => ws.studies.length > 0) // Remove empty workspaces
    );

    // Also remove from localStorage
    localStorage.removeItem(`abp_study_${selectedStudy.study.id}`);

    setIsDeleteModalOpen(false);
    setSelectedStudy(null);
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
                    onClick={() => navigate(`study/${workspace.id}-${study.id}`, {
                      state: {
                        studyName: study.name,
                        workspaceName: workspace.title,
                        studyData: {
                          status: study.status,
                          startDate: study.startDate,
                          endDate: study.endDate,
                          fleet: (() => {
                            const baseDate = new Date(study.startDate);
                            const addMonths = (date: Date, months: number) => {
                              const d = new Date(date);
                              d.setMonth(d.getMonth() + months);
                              return d.toISOString();
                            };
                            const addYear = (date: Date) => {
                              const d = new Date(date);
                              d.setFullYear(d.getFullYear() + 1);
                              return d.toISOString();
                            };
                            return [
                              // A321neo - 4 aircraft, staggered entry
                              { id: `${study.id}-1`, aircraftType: 'A321neo', engine: 'CFM LEAP-1A', layout: 'Y220', numberOfAircraft: 4, enterInService: addMonths(baseDate, 0) },
                              // A320-200 - 3 aircraft, entry at month 2
                              { id: `${study.id}-2`, aircraftType: 'A320-200', engine: 'CFM56-5A', layout: 'F12 Y138', numberOfAircraft: 3, enterInService: addMonths(baseDate, 2) },
                              // A319 - 4 aircraft, entry at month 5
                              { id: `${study.id}-3`, aircraftType: 'A319', engine: 'CFM56-5B', layout: 'Y144', numberOfAircraft: 4, enterInService: addMonths(baseDate, 5) },
                              // B737-800 - 3 aircraft, entry at month 8, retirement 1 year later
                              { id: `${study.id}-4`, aircraftType: 'B737-800', engine: 'CFM56-7B', layout: 'Y189', numberOfAircraft: 3, enterInService: addMonths(baseDate, 8), retirement: addYear(new Date(addMonths(baseDate, 8))) },
                            ];
                          })(),
                          routes: (() => {
                            const baseStart = new Date(study.startDate);
                            const baseEnd = new Date(study.endDate);
                            const addMonthsToDate = (date: Date, months: number) => {
                              const d = new Date(date);
                              d.setMonth(d.getMonth() + months);
                              return d.toISOString();
                            };
                            return [
                              // Routes starting from day 1
                              { id: `${study.id}-r1`, origin: 'CDG', destination: 'LHR', startDate: baseStart.toISOString(), endDate: baseEnd.toISOString() },
                              { id: `${study.id}-r2`, origin: 'CDG', destination: 'BCN', startDate: baseStart.toISOString(), endDate: baseEnd.toISOString() },
                              // Routes with staggered start dates
                              { id: `${study.id}-r3`, origin: 'LHR', destination: 'JFK', startDate: addMonthsToDate(baseStart, 6), endDate: baseEnd.toISOString() },
                              { id: `${study.id}-r4`, origin: 'CDG', destination: 'DXB', startDate: addMonthsToDate(baseStart, 12), endDate: baseEnd.toISOString() },
                              { id: `${study.id}-r5`, origin: 'LHR', destination: 'SIN', startDate: addMonthsToDate(baseStart, 18), endDate: baseEnd.toISOString() },
                            ];
                          })(),
                        },
                      },
                    })}
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
                        <DropdownMenuItem icon="open_in_new" onSelect={() => handleOpenInNew(study.id)}>
                          Open in New Tab
                        </DropdownMenuItem>
                        <DropdownMenuItem icon="edit" onSelect={() => handleEditInfo(study, workspace.id, workspace.title)}>
                          Edit Info
                        </DropdownMenuItem>
                        <DropdownMenuItem icon="drive_file_move" onSelect={() => handleMoveStudy(study, workspace.id, workspace.title)}>
                          Move
                        </DropdownMenuItem>
                        <DropdownMenuItem icon="content_copy" onSelect={() => handleDuplicateStudy(study, workspace.id)}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem icon="delete" destructive onSelect={() => handleDeleteStudy(study, workspace.id, workspace.title)}>
                          Delete
                        </DropdownMenuItem>
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

      {/* Edit Study Info Modal */}
      <EditStudyInfoModal
        isOpen={isEditInfoModalOpen}
        onClose={() => {
          setIsEditInfoModalOpen(false);
          setSelectedStudy(null);
        }}
        onSave={handleSaveStudyInfo}
        initialName={selectedStudy?.study.name || ''}
        initialDescription={selectedStudy?.study.description || ''}
      />

      {/* Move Study Modal */}
      <MoveStudyModal
        isOpen={isMoveModalOpen}
        onClose={() => {
          setIsMoveModalOpen(false);
          setSelectedStudy(null);
        }}
        onMove={handleConfirmMove}
        workspaceNames={workspaceNames}
        currentWorkspace={selectedStudy?.workspaceName || ''}
        studyName={selectedStudy?.study.name || ''}
      />

      {/* Delete Study Modal */}
      <DeleteStudyModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedStudy(null);
        }}
        onConfirm={handleConfirmDelete}
        studyName={selectedStudy?.study.name || ''}
      />
    </div>
  );
}
