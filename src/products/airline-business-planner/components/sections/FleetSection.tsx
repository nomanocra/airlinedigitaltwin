import { useState, useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Tab } from '@/design-system/components/Tab';
import { NumberInput } from '@/design-system/components/NumberInput';
import { TextInput } from '@/design-system/components/TextInput';
import { Button } from '@/design-system/components/Button';
import { IconButton } from '@/design-system/components/IconButton';
import { ButtonGroup } from '@/design-system/components/ButtonGroup';
import { Icon } from '@/design-system/components/Icon';
import { Calendar } from '@/design-system/composites/Calendar';
import { Select } from '@/design-system/components/Select';
import { EmptyState } from '@/design-system/composites/EmptyState';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/design-system/components/Tooltip';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '@/design-system/components/DropdownMenu';
import type { FleetEntry } from '../AddAircraftModal';
import type {
  FleetTabType, FleetViewMode,
  FleetCostOperationsEntry, FleetCostOwnershipEntry, CrewConfigEntry, GanttAircraftRow,
} from '../../pages/types';

export interface FleetSectionProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  periodType: 'dates' | 'duration';
  gridContext: Record<string, unknown>;
  fleetEntries: FleetEntry[];
  setFleetEntries: React.Dispatch<React.SetStateAction<FleetEntry[]>>;
  costOperationsData: FleetCostOperationsEntry[];
  setCostOperationsData: React.Dispatch<React.SetStateAction<FleetCostOperationsEntry[]>>;
  costOwnershipData: FleetCostOwnershipEntry[];
  setCostOwnershipData: React.Dispatch<React.SetStateAction<FleetCostOwnershipEntry[]>>;
  crewConfigData: CrewConfigEntry[];
  setCrewConfigData: React.Dispatch<React.SetStateAction<CrewConfigEntry[]>>;
  costOpsErrors: number;
  costOwnershipErrors: number;
  onOpenAddAircraft: () => void;
  onOpenEditFleet: () => void;
  onOpenImportFleet: () => void;
  selectedAircraftIds: Set<string>;
  setSelectedAircraftIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  fleetGridApiRef: React.MutableRefObject<{ deselectAll: () => void } | null>;
}

export function FleetSection({
  startDate,
  endDate,
  gridContext,
  fleetEntries,
  setFleetEntries,
  costOperationsData,
  setCostOperationsData,
  costOwnershipData,
  setCostOwnershipData,
  crewConfigData,
  setCrewConfigData,
  costOpsErrors,
  costOwnershipErrors,
  onOpenAddAircraft,
  onOpenEditFleet,
  onOpenImportFleet,
  selectedAircraftIds,
  setSelectedAircraftIds,
  fleetGridApiRef,
}: FleetSectionProps) {
  const [fleetTab, setFleetTab] = useState<FleetTabType>('fleet');
  const [fleetViewMode, setFleetViewMode] = useState<FleetViewMode>('table');
  const [fleetSearchValue, setFleetSearchValue] = useState('');

  const hasAircraft = fleetEntries.length > 0;

  const filteredFleetEntries = fleetSearchValue.trim()
    ? fleetEntries.filter((entry) =>
        [entry.aircraftType, entry.engine, entry.layout]
          .some((field) => field.toLowerCase().includes(fleetSearchValue.toLowerCase()))
      )
    : fleetEntries;

  // Selection helpers
  const allSelected = hasAircraft && selectedAircraftIds.size === filteredFleetEntries.length && filteredFleetEntries.every(e => selectedAircraftIds.has(e.id));

  const handleDeleteSelected = () => {
    setFleetEntries((prev) => prev.filter((e) => !selectedAircraftIds.has(e.id)));
    setSelectedAircraftIds(new Set());
    fleetGridApiRef.current?.deselectAll();
  };

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

  const onSelectionChanged = useCallback((event: { api: { getSelectedRows: () => FleetEntry[]; deselectAll: () => void } }) => {
    fleetGridApiRef.current = event.api;
    const selectedRows = event.api.getSelectedRows();
    setSelectedAircraftIds(new Set(selectedRows.map((row) => row.id)));
  }, []);

  // Cell renderers
  const NumberInputCellRenderer = (props: ICellRendererParams) => {
    const handleChange = (newValue: number) => {
      props.node.setDataValue(props.colDef?.field || '', newValue);
      setFleetEntries((prev) =>
        prev.map((e) => e.id === props.data.id ? { ...e, numberOfAircraft: Math.max(1, newValue) } : e)
      );
    };
    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <NumberInput value={props.value} onChange={handleChange} size="S" min={1} showLabel={false} variant="Stepper" />
      </div>
    );
  };

  const EnterInServiceCellRenderer = (props: ICellRendererParams) => {
    const ctx = props.context || {};
    const handleChange = (newValue: Date | undefined) => {
      if (newValue) {
        props.node.setDataValue(props.colDef?.field || '', newValue);
        setFleetEntries((prev) => prev.map((e) => e.id === props.data.id ? { ...e, enterInService: newValue } : e));
      }
    };
    if (ctx.periodType === 'duration') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
          <Select value={ctx.dateToRelativeKey(props.value instanceof Date ? props.value : undefined)} onValueChange={(key: string) => handleChange(ctx.relativeKeyToDate(key))} options={ctx.relativeMonthOptions} size="S" showLabel={false} placeholder="Select" />
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <Calendar value={props.value instanceof Date ? props.value : undefined} onChange={handleChange} mode="month" size="S" showLabel={false} placeholder="Select" />
      </div>
    );
  };

  const RetirementCellRenderer = (props: ICellRendererParams) => {
    const ctx = props.context || {};
    const handleChange = (newValue: Date | undefined) => {
      props.node.setDataValue(props.colDef?.field || '', newValue);
      setFleetEntries((prev) => prev.map((e) => e.id === props.data.id ? { ...e, retirement: newValue } : e));
    };
    if (ctx.periodType === 'duration') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
          <Select value={ctx.dateToRelativeKey(props.value instanceof Date ? props.value : undefined)} onValueChange={(key: string) => { if (key) handleChange(ctx.relativeKeyToDate(key)); else handleChange(undefined); }} options={ctx.relativeMonthOptions} size="S" showLabel={false} placeholder="None" />
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <Calendar value={props.value instanceof Date ? props.value : undefined} onChange={handleChange} mode="month" size="S" showLabel={false} placeholder="None" />
      </div>
    );
  };

  const OwnershipCellRenderer = (props: ICellRendererParams) => {
    const handleChange = (newValue: string) => {
      props.node.setDataValue(props.colDef?.field || '', newValue);
      setFleetEntries((prev) => prev.map((e) => e.id === props.data.id ? { ...e, ownership: newValue as 'Owned' | 'Leased' } : e));
    };
    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <Select value={props.value} onValueChange={handleChange} options={[{ value: 'Owned', label: 'Owned' }, { value: 'Leased', label: 'Leased' }]} size="S" showLabel={false} />
      </div>
    );
  };

  // Generic cost/crew cell renderer factory
  const createNumberCellRenderer = (dataKey: string, setter: React.Dispatch<React.SetStateAction<any[]>>, min = 0, options?: { errorWhenZero?: boolean }) => {
    return (props: ICellRendererParams) => {
      const handleChange = (newValue: number) => {
        props.node.setDataValue(props.colDef?.field || '', newValue);
        setter((prev: any[]) => prev.map((e: any) => e.id === props.data.id ? { ...e, [dataKey]: Math.max(min, newValue) } : e));
      };
      const value = props.value ?? 0;
      const hasError = options?.errorWhenZero && value === 0;
      return (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
          <NumberInput value={value} onChange={handleChange} size="S" min={min} showLabel={false} variant="Stepper" state={hasError ? 'Error' : 'Default'} />
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

  const costOwnershipMap = useMemo(() => {
    const map = new Map<string, typeof costOwnershipData[number]>();
    for (const entry of costOwnershipData) map.set(entry.id, entry);
    return map;
  }, [costOwnershipData]);

  const MonthlyInsuranceCellRenderer = (props: ICellRendererParams) => {
    const ownershipEntry = costOwnershipMap.get(props.data.id);
    const acValue = ownershipEntry?.acValueUponAcquisition ?? 0;
    const insurance = (acValue * 0.01 / 12).toFixed(2);
    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        <span>${Number(insurance).toLocaleString()}</span>
      </div>
    );
  };

  // Crew cell renderers
  const CaptainCellRenderer = createNumberCellRenderer('captainPerCrew', setCrewConfigData, 1);
  const FirstOfficerCellRenderer = createNumberCellRenderer('firstOfficerPerCrew', setCrewConfigData);
  const CabinManagerCellRenderer = createNumberCellRenderer('cabinManagerPerCrew', setCrewConfigData);
  const CabinAttendantCellRenderer = createNumberCellRenderer('cabinAttendantPerCrew', setCrewConfigData);

  // Column definitions
  const fleetColDefs = useMemo<ColDef[]>(() => [
    { headerCheckboxSelection: true, checkboxSelection: true, width: 48, maxWidth: 48, suppressMovable: true, resizable: false, cellClass: 'ag-checkbox-cell', headerClass: 'ag-checkbox-header' },
    { field: 'aircraftType', headerName: 'A/C Type', flex: 1, minWidth: 100 },
    { field: 'engine', headerName: 'Engine', flex: 1, minWidth: 90 },
    { field: 'layout', headerName: 'Layout', flex: 1, minWidth: 80 },
    { field: 'numberOfAircraft', headerName: 'Number of AC', flex: 1, minWidth: 100, cellRenderer: NumberInputCellRenderer },
    { field: 'enterInService', headerName: 'Enter in Service', flex: 1, minWidth: 130, cellRenderer: EnterInServiceCellRenderer },
    { field: 'retirement', headerName: 'Retirement', flex: 1, minWidth: 130, cellRenderer: RetirementCellRenderer },
    { field: 'ownership', headerName: 'Ownership', flex: 1, minWidth: 100, resizable: false, cellRenderer: OwnershipCellRenderer },
  ], []);

  const dateFormatter = (params: { value: Date }) => params.value?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) || '';
  const retirementFormatter = (params: { value: Date }) => params.value?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) || '-';

  const costOperationsColDefs = useMemo<ColDef[]>(() => [
    { field: 'aircraftType', headerName: 'A/C Type', flex: 1, minWidth: 100 },
    { field: 'engine', headerName: 'Engine', flex: 1, minWidth: 90 },
    { field: 'layout', headerName: 'Layout', flex: 1, minWidth: 80 },
    { field: 'numberOfAircraft', headerName: 'Nb of AC', flex: 0.7, minWidth: 70 },
    { field: 'ownership', headerName: 'Ownership', flex: 1, minWidth: 90 },
    { field: 'enterInService', headerName: 'Enter in Service', flex: 1, minWidth: 110, valueFormatter: dateFormatter },
    { field: 'retirement', headerName: 'Retirement', flex: 1, minWidth: 100, valueFormatter: retirementFormatter },
    { field: 'groundHandlingCharge', headerName: 'Ground Handling (USD/sector)', flex: 1.2, minWidth: 130, cellRenderer: GroundHandlingCellRenderer },
    { field: 'fuelAgeingFactor', headerName: 'Fuel Ageing (%)', flex: 1, minWidth: 100, cellRenderer: FuelAgeingCellRenderer },
  ], []);

  const costOwnershipColDefs = useMemo<ColDef[]>(() => [
    { field: 'aircraftType', headerName: 'A/C Type', flex: 1, minWidth: 100 },
    { field: 'engine', headerName: 'Engine', flex: 1, minWidth: 90 },
    { field: 'layout', headerName: 'Layout', flex: 1, minWidth: 80 },
    { field: 'numberOfAircraft', headerName: 'Nb of AC', flex: 0.7, minWidth: 70 },
    { field: 'ownership', headerName: 'Ownership', flex: 1, minWidth: 90 },
    { field: 'enterInService', headerName: 'Enter in Service', flex: 1, minWidth: 110, valueFormatter: dateFormatter },
    { field: 'retirement', headerName: 'Retirement', flex: 1, minWidth: 100, valueFormatter: retirementFormatter },
    { field: 'monthlyLeaseRate', headerName: 'Monthly Lease ($)', flex: 1.2, minWidth: 120, cellRenderer: MonthlyLeaseCellRenderer },
    { field: 'acValueUponAcquisition', headerName: 'AC Value ($)', flex: 1.2, minWidth: 120, cellRenderer: AcValueCellRenderer },
    { field: 'sparesProvisioningPerFamily', headerName: 'Spares ($)', flex: 1, minWidth: 100, cellRenderer: SparesProvisioningCellRenderer },
    { field: 'monthlyInsurance', headerName: 'Monthly Insurance ($)', flex: 1.2, minWidth: 120, cellRenderer: MonthlyInsuranceCellRenderer },
  ], [costOwnershipData]);

  const crewConfigColDefs = useMemo<ColDef[]>(() => [
    { field: 'aircraftType', headerName: 'A/C Type', flex: 1, minWidth: 100 },
    { field: 'engine', headerName: 'Engine', flex: 1, minWidth: 90 },
    { field: 'layout', headerName: 'Layout', flex: 1, minWidth: 80 },
    { field: 'numberOfAircraft', headerName: 'Nb of AC', flex: 0.7, minWidth: 70 },
    { field: 'ownership', headerName: 'Ownership', flex: 1, minWidth: 90 },
    { field: 'enterInService', headerName: 'Enter in Service', flex: 1, minWidth: 110, valueFormatter: dateFormatter },
    { field: 'retirement', headerName: 'Retirement', flex: 1, minWidth: 100, valueFormatter: retirementFormatter },
    { field: 'captainPerCrew', headerName: 'Captain/Crew', flex: 1, minWidth: 100, cellRenderer: CaptainCellRenderer },
    { field: 'firstOfficerPerCrew', headerName: 'First Officer/Crew', flex: 1, minWidth: 110, cellRenderer: FirstOfficerCellRenderer },
    { field: 'cabinManagerPerCrew', headerName: 'Cabin Manager/Crew', flex: 1, minWidth: 110, cellRenderer: CabinManagerCellRenderer },
    { field: 'cabinAttendantPerCrew', headerName: 'Cabin Attendant/Crew', flex: 1.2, minWidth: 120, cellRenderer: CabinAttendantCellRenderer },
  ], []);

  // Merged fleet data for cost/crew tabs
  const fleetWithCostOps = useMemo(() => {
    const map = new Map<string, typeof costOperationsData[number]>();
    for (const c of costOperationsData) map.set(c.id, c);
    return fleetEntries.map(entry => ({ ...entry, ...(map.get(entry.id) || { groundHandlingCharge: 0, fuelAgeingFactor: 0 }) }));
  }, [fleetEntries, costOperationsData]);

  const fleetWithCostOwnership = useMemo(() => {
    const map = new Map<string, typeof costOwnershipData[number]>();
    for (const c of costOwnershipData) map.set(c.id, c);
    return fleetEntries.map(entry => ({ ...entry, ...(map.get(entry.id) || { monthlyLeaseRate: 0, acValueUponAcquisition: 0, sparesProvisioningPerFamily: 0 }) }));
  }, [fleetEntries, costOwnershipData]);

  const fleetWithCrewConfig = useMemo(() => {
    const map = new Map<string, typeof crewConfigData[number]>();
    for (const c of crewConfigData) map.set(c.id, c);
    return fleetEntries.map(entry => ({ ...entry, ...(map.get(entry.id) || { captainPerCrew: 1, firstOfficerPerCrew: 1, cabinManagerPerCrew: 1, cabinAttendantPerCrew: 1 }) }));
  }, [fleetEntries, crewConfigData]);

  // Gantt
  const ganttRows = useMemo<GanttAircraftRow[]>(() =>
    fleetEntries.flatMap(entry =>
      Array.from({ length: entry.numberOfAircraft }, (_, i) => ({
        id: `${entry.id}-${i + 1}`, fleetEntryId: entry.id, aircraftIndex: i + 1,
        aircraftType: entry.aircraftType, engine: entry.engine, layout: entry.layout,
        enterInService: entry.enterInService, retirement: entry.retirement, ownership: entry.ownership,
      }))
    ), [fleetEntries]
  );

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
            <div className="gantt-bar" style={{ left: `${leftPct}%`, width: `${widthPct}%`, opacity: data.ownership === 'Leased' ? 0.5 : undefined }} />
          </TooltipTrigger>
          <TooltipContent side="top" arrow>
            <div className="gantt-tooltip">
              <span className="gantt-tooltip__type">{data.aircraftType}</span>
              <div className="gantt-tooltip__row"><Icon name="event" size={14} color="var(--text-secondary)" /><span>{enterLabel} → {retireLabel}</span></div>
              <div className="gantt-tooltip__row"><Icon name="description" size={14} color="var(--text-secondary)" /><span>{data.ownership}</span></div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  };

  const ganttTimelineHeader = useMemo(() => {
    if (!startDate || !endDate) return '';
    const s = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const e = endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${s} — ${e}`;
  }, [startDate, endDate]);

  const ganttColDefs = useMemo<ColDef[]>(() => [
    { field: 'aircraftType', headerName: 'A/C Type', width: 120 },
    { field: 'engine', headerName: 'Engine', width: 100 },
    { field: 'layout', headerName: 'Layout', width: 80 },
    { field: 'timeline', headerName: ganttTimelineHeader, flex: 1, minWidth: 300, cellRenderer: GanttTimelineCellRenderer, cellStyle: { padding: '0', overflow: 'visible' } },
  ], [ganttTimelineHeader]);

  return (
    <div className="study-page__fleet">
      <div className="study-page__fleet-tabs">
        <div className={`study-page__tab-wrapper${!hasAircraft ? ' study-page__tab-wrapper--error' : ''}`}>
          <Tab label="Fleet" size="M" status={fleetTab === 'fleet' ? 'Active' : 'Default'} onClick={() => setFleetTab('fleet')} />
        </div>
        <div className={`study-page__tab-wrapper${costOpsErrors > 0 ? ' study-page__tab-wrapper--error' : ''}`}>
          <Tab label="Cost Operations" size="M" status={hasAircraft && fleetTab === 'cost-operations' ? 'Active' : 'Default'} disabled={!hasAircraft} onClick={() => { if (hasAircraft) setFleetTab('cost-operations'); }} />
        </div>
        <div className={`study-page__tab-wrapper${costOwnershipErrors > 0 ? ' study-page__tab-wrapper--error' : ''}`}>
          <Tab label="Cost Ownership" size="M" status={hasAircraft && fleetTab === 'cost-ownership' ? 'Active' : 'Default'} disabled={!hasAircraft} onClick={() => { if (hasAircraft) setFleetTab('cost-ownership'); }} />
        </div>
        <Tab label="Crew Configuration" size="M" status={hasAircraft && fleetTab === 'crew' ? 'Active' : 'Default'} disabled={!hasAircraft} onClick={() => { if (hasAircraft) setFleetTab('crew'); }} />
      </div>

      {fleetTab === 'fleet' && (
        <div className="study-page__tab-content">
          <div className="study-page__fleet-title-bar">
            <div className="study-page__fleet-title-left">
              <h2 className="study-page__fleet-title">Fleet</h2>
              <ButtonGroup options={[{ value: 'table', iconName: 'table_chart' }, { value: 'gantt', iconName: 'event_note' }]} value={fleetViewMode} onChange={(v) => setFleetViewMode(v as FleetViewMode)} size="S" />
            </div>
            <div className="study-page__fleet-title-right">
              <span className="label-regular-s study-page__fleet-entry-count">{filteredFleetEntries.length} Entries</span>
              <TextInput placeholder="Search" size="S" showLeftIcon leftIcon="search" showLabel={false} value={fleetSearchValue} onChange={(e) => setFleetSearchValue(e.target.value)} className="study-page__fleet-search" />
            </div>
            <div className="study-page__fleet-actions">
              {selectedAircraftIds.size > 0 && (
                <>
                  <span className="label-regular-s study-page__fleet-selection-count">{selectedAircraftIds.size} {selectedAircraftIds.size === 1 ? 'Entry' : 'Entries'} Selected</span>
                  <IconButton icon="edit" size="S" variant="Outlined" alt="Edit" onClick={onOpenEditFleet} />
                  <IconButton icon="content_copy" size="S" variant="Outlined" alt="Duplicate" onClick={handleDuplicateSelected} />
                  <IconButton icon="delete" size="S" variant="Outlined" alt="Delete" onClick={handleDeleteSelected} className="study-page__fleet-delete-btn" />
                  <span className="study-page__fleet-action-divider" />
                </>
              )}
              <IconButton icon="add" size="S" variant="Outlined" alt="Add Aircraft" onClick={onOpenAddAircraft} />
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button label="" leftIcon="system_update_alt" rightIcon="dropdown" variant="Outlined" size="S" className="study-page__import-fleet-btn" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem icon="system_update_alt" onSelect={onOpenImportFleet}>Import from an Airline</DropdownMenuItem>
                  <DropdownMenuItem icon="drive_file_move" disabled>Load from an other Study</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem icon="upload" disabled>Upload from CSV</DropdownMenuItem>
                  <DropdownMenuItem icon="download" disabled>Download as CSV</DropdownMenuItem>
                  <DropdownMenuItem icon="download" disabled>Download an empty CSV Template</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="study-page__fleet-table">
            {fleetEntries.length === 0 ? (
              <div className="study-page__fleet-table-body">
                <EmptyState illustration="Box" title="Your Fleet is empty" description="Please add flights or import a fleet" actions={<><Button label="ADD AIRCRAFT" leftIcon="add" variant="Outlined" size="M" onClick={onOpenAddAircraft} /><Button label="IMPORT FLEET" leftIcon="download" variant="Default" size="M" onClick={onOpenImportFleet} /></>} className="study-page__fleet-empty" />
              </div>
            ) : fleetViewMode === 'table' ? (
              <AgGridReact key="fleet-table" className="as-ag-grid" rowData={filteredFleetEntries} columnDefs={fleetColDefs} context={gridContext} rowSelection="multiple" suppressRowClickSelection={true} onSelectionChanged={onSelectionChanged} getRowId={(params) => params.data.id} noRowsOverlayComponent={() => (<div className="study-page__fleet-no-results">No results found for "{fleetSearchValue}"</div>)} />
            ) : (
              <AgGridReact key="fleet-gantt" className="as-ag-grid study-page__gantt-grid" rowData={ganttRows} columnDefs={ganttColDefs} getRowId={(params) => params.data.id} suppressRowClickSelection={true} />
            )}
          </div>
        </div>
      )}

      {fleetTab === 'cost-operations' && (
        <div className="study-page__tab-content">
          <div className="study-page__fleet-title-bar">
            <h2 className="study-page__fleet-title">Cost Operations</h2>
            <div className="study-page__fleet-title-right"><span className="label-regular-s study-page__fleet-entry-count">{fleetEntries.length} Entries</span></div>
          </div>
          <div className="study-page__fleet-table"><AgGridReact className="as-ag-grid" rowData={fleetWithCostOps} columnDefs={costOperationsColDefs} getRowId={(params) => params.data.id} /></div>
        </div>
      )}

      {fleetTab === 'cost-ownership' && (
        <div className="study-page__tab-content">
          <div className="study-page__fleet-title-bar">
            <h2 className="study-page__fleet-title">Cost Ownership</h2>
            <div className="study-page__fleet-title-right"><span className="label-regular-s study-page__fleet-entry-count">{fleetEntries.length} Entries</span></div>
          </div>
          <div className="study-page__fleet-table"><AgGridReact className="as-ag-grid" rowData={fleetWithCostOwnership} columnDefs={costOwnershipColDefs} getRowId={(params) => params.data.id} /></div>
        </div>
      )}

      {fleetTab === 'crew' && (
        <div className="study-page__tab-content">
          <div className="study-page__fleet-title-bar">
            <h2 className="study-page__fleet-title">Crew Configuration</h2>
            <div className="study-page__fleet-title-right"><span className="label-regular-s study-page__fleet-entry-count">{fleetEntries.length} Entries</span></div>
          </div>
          <div className="study-page__fleet-table"><AgGridReact className="as-ag-grid" rowData={fleetWithCrewConfig} columnDefs={crewConfigColDefs} getRowId={(params) => params.data.id} /></div>
        </div>
      )}
    </div>
  );
}
