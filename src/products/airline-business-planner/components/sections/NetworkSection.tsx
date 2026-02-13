import { useState, useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Tab } from '@/design-system/components/Tab';
import { NumberInput } from '@/design-system/components/NumberInput';
import { TextInput } from '@/design-system/components/TextInput';
import { Button } from '@/design-system/components/Button';
import { IconButton } from '@/design-system/components/IconButton';
import { ButtonGroup } from '@/design-system/components/ButtonGroup';
import { Calendar } from '@/design-system/composites/Calendar';
import { Select } from '@/design-system/components/Select';
import { EmptyState } from '@/design-system/composites/EmptyState';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '@/design-system/components/DropdownMenu';
import { NetworkSummary } from '../NetworkSummary';
import { NetworkMapView } from '../NetworkMapView';
import type { FleetEntry } from '../AddAircraftModal';
import type {
  NetworkTabType, RoutesViewMode,
  RouteEntry, RoutePricingEntry, FleetPlanEntry, RouteFrequencyEntry,
} from '../../pages/types';
import { CLASS_LABELS } from '../../utils/cabinClassUtils';

export interface NetworkSectionProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  periodType: 'dates' | 'duration';
  gridContext: Record<string, unknown>;
  generateMonthColumns: (start: Date | undefined, end: Date | undefined) => ColDef[];
  fleetEntries: FleetEntry[];
  routeEntries: RouteEntry[];
  setRouteEntries: React.Dispatch<React.SetStateAction<RouteEntry[]>>;
  routePricingData: RoutePricingEntry[];
  setRoutePricingData: React.Dispatch<React.SetStateAction<RoutePricingEntry[]>>;
  fleetPlanData: FleetPlanEntry[];
  setFleetPlanData: React.Dispatch<React.SetStateAction<FleetPlanEntry[]>>;
  routeFrequencyData: RouteFrequencyEntry[];
  setRouteFrequencyData: React.Dispatch<React.SetStateAction<RouteFrequencyEntry[]>>;
  discountForNormalFares: number;
  setDiscountForNormalFares: (v: number) => void;
  pricingErrors: number;
  fleetPlanErrors: number;
  frequencyErrors: number;
  networkAllInputsFilled: boolean;
  onOpenAddRoute: () => void;
  onOpenEditRoute: () => void;
  onOpenImportNetwork: () => void;
  selectedRouteIds: Set<string>;
  setSelectedRouteIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  routesGridApiRef: React.MutableRefObject<{ deselectAll: () => void } | null>;
  activeClasses: string[];
}

export function NetworkSection({
  startDate,
  endDate,
  periodType,
  gridContext,
  generateMonthColumns,
  fleetEntries,
  routeEntries,
  setRouteEntries,
  routePricingData,
  setRoutePricingData,
  fleetPlanData,
  setFleetPlanData,
  routeFrequencyData,
  setRouteFrequencyData,
  discountForNormalFares,
  setDiscountForNormalFares,
  pricingErrors,
  fleetPlanErrors,
  frequencyErrors,
  networkAllInputsFilled,
  onOpenAddRoute,
  onOpenEditRoute,
  onOpenImportNetwork,
  selectedRouteIds,
  setSelectedRouteIds,
  routesGridApiRef,
  activeClasses,
}: NetworkSectionProps) {
  const [networkTab, setNetworkTab] = useState<NetworkTabType>('routes');
  const [routesViewMode, setRoutesViewMode] = useState<RoutesViewMode>('table');
  const hasRoutes = routeEntries.length > 0;

  const onRouteSelectionChanged = useCallback((event: { api: { getSelectedRows: () => RouteEntry[]; deselectAll: () => void } }) => {
    routesGridApiRef.current = event.api;
    const selectedRows = event.api.getSelectedRows();
    setSelectedRouteIds(new Set(selectedRows.map((row) => row.id)));
  }, []);

  const handleDeleteSelectedRoutes = () => {
    setRouteEntries((prev) => prev.filter((r) => !selectedRouteIds.has(r.id)));
    setRoutePricingData((prev) => prev.filter((p) => !selectedRouteIds.has(p.routeId)));
    setFleetPlanData((prev) => prev.filter((f) => !selectedRouteIds.has(f.routeId)));
    setRouteFrequencyData((prev) => prev.filter((f) => !selectedRouteIds.has(f.routeId)));
    setSelectedRouteIds(new Set());
    routesGridApiRef.current?.deselectAll();
  };

  // Route cell renderers
  const RouteStartDateCellRenderer = (props: ICellRendererParams) => {
    const ctx = props.context || {};
    const handleChange = (newValue: Date | undefined) => {
      if (newValue) {
        props.node.setDataValue(props.colDef?.field || '', newValue);
        setRouteEntries((prev) => prev.map((r) => r.id === props.data.id ? { ...r, startDate: newValue } : r));
      }
    };
    if (ctx.periodType === 'duration') {
      return (<div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}><Select value={ctx.dateToRelativeKey(props.value instanceof Date ? props.value : undefined)} onValueChange={(key: string) => handleChange(ctx.relativeKeyToDate(key))} options={ctx.relativeMonthOptions} size="S" showLabel={false} placeholder="Select" /></div>);
    }
    return (<div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}><Calendar value={props.value instanceof Date ? props.value : undefined} onChange={handleChange} mode="month" size="S" showLabel={false} placeholder="Select" /></div>);
  };

  const RouteEndDateCellRenderer = (props: ICellRendererParams) => {
    const ctx = props.context || {};
    const handleChange = (newValue: Date | undefined) => {
      if (newValue) {
        props.node.setDataValue(props.colDef?.field || '', newValue);
        setRouteEntries((prev) => prev.map((r) => r.id === props.data.id ? { ...r, endDate: newValue } : r));
      }
    };
    if (ctx.periodType === 'duration') {
      return (<div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}><Select value={ctx.dateToRelativeKey(props.value instanceof Date ? props.value : undefined)} onValueChange={(key: string) => handleChange(ctx.relativeKeyToDate(key))} options={ctx.relativeMonthOptions} size="S" showLabel={false} placeholder="Select" /></div>);
    }
    return (<div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}><Calendar value={props.value instanceof Date ? props.value : undefined} onChange={handleChange} mode="month" size="S" showLabel={false} placeholder="Select" /></div>);
  };

  const routesColDefs = useMemo<ColDef[]>(() => [
    { headerCheckboxSelection: true, checkboxSelection: true, width: 48, maxWidth: 48, suppressMovable: true, resizable: false, cellClass: 'ag-checkbox-cell', headerClass: 'ag-checkbox-header' },
    { field: 'origin', headerName: 'Origin', flex: 1, minWidth: 100 },
    { field: 'destination', headerName: 'Destination', flex: 1, minWidth: 100 },
    { field: 'startDate', headerName: 'Start Date', flex: 1, minWidth: 130, cellRenderer: RouteStartDateCellRenderer },
    { field: 'endDate', headerName: 'End Date', flex: 1, minWidth: 130, cellRenderer: RouteEndDateCellRenderer },
  ], []);

  // Pricing — filter to show only active classes, sorted by routeId for grouping
  const pricingRowData = useMemo(() => {
    const activeSet = new Set(activeClasses);
    const filtered = routePricingData.filter(p => activeSet.has(p.classCode));
    // Sort by routeId to ensure grouping
    return filtered.sort((a, b) => a.routeId.localeCompare(b.routeId));
  }, [routePricingData, activeClasses]);

  // Build a map of routeId -> group index for alternating colors
  const pricingRouteGroupIndex = useMemo(() => {
    const groups: Record<string, number> = {};
    let currentGroupIndex = 0;
    let lastRouteId = '';
    pricingRowData.forEach(p => {
      if (p.routeId !== lastRouteId) {
        groups[p.routeId] = currentGroupIndex;
        currentGroupIndex++;
        lastRouteId = p.routeId;
      }
    });
    return groups;
  }, [pricingRowData]);

  // Track which routeIds have already shown their O&D (for row spanning)
  const pricingFirstRowOfRoute = useMemo(() => {
    const firstRows: Set<string> = new Set();
    const seen: Set<string> = new Set();
    pricingRowData.forEach((p, idx) => {
      if (!seen.has(p.routeId)) {
        firstRows.add(`${p.routeId}-${p.classCode}`);
        seen.add(p.routeId);
      }
    });
    return firstRows;
  }, [pricingRowData]);

  // Row class for alternating colors by O&D group + first row border
  const getPricingRowClass = useCallback((params: { data: RoutePricingEntry }) => {
    if (!params.data) return '';
    const groupIndex = pricingRouteGroupIndex[params.data.routeId] || 0;
    const rowKey = `${params.data.routeId}-${params.data.classCode}`;
    const isFirstRowOfGroup = pricingFirstRowOfRoute.has(rowKey);
    const colorClass = groupIndex % 2 === 0 ? 'pricing-row-group-even' : 'pricing-row-group-odd';
    return isFirstRowOfGroup ? `${colorClass} pricing-row-group-first` : colorClass;
  }, [pricingRouteGroupIndex, pricingFirstRowOfRoute]);

  const DiscountStrategyCellRenderer = (props: ICellRendererParams) => {
    const handleChange = (newValue: string) => {
      props.node.setDataValue(props.colDef?.field || '', newValue);
      setRoutePricingData((prev) => prev.map((p) => p.routeId === props.data.routeId && p.classCode === props.data.classCode ? { ...p, discountStrategy: newValue } : p));
    };
    return (<div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}><Select value={props.value || 'None'} onValueChange={handleChange} options={[{ value: 'None', label: 'None' }, { value: 'Early Bird', label: 'Early Bird' }, { value: 'Promotional', label: 'Promotional' }]} size="S" showLabel={false} /></div>);
  };

  const MarketYieldCellRenderer = (props: ICellRendererParams) => {
    const handleChange = (newValue: number) => {
      props.node.setDataValue(props.colDef?.field || '', newValue);
      setRoutePricingData((prev) => prev.map((p) => p.routeId === props.data.routeId && p.classCode === props.data.classCode ? { ...p, marketYield: newValue } : p));
    };
    const value = props.value ?? 0;
    return (<div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}><NumberInput value={value} onChange={handleChange} size="S" min={0} showLabel={false} variant="Stepper" state={value === 0 ? 'Error' : 'Default'} /></div>);
  };

  const pricingColDefs = useMemo<ColDef[]>(() => [
    {
      field: 'route',
      headerName: 'Origin Destination',
      width: 140,
      pinned: 'left' as const,
      cellClass: (params) => {
        const rowKey = `${params.data?.routeId}-${params.data?.classCode}`;
        const isFirst = pricingFirstRowOfRoute.has(rowKey);
        return isFirst ? 'pricing-od-cell pricing-od-cell--visible' : 'pricing-od-cell pricing-od-cell--hidden';
      },
      valueGetter: (params: { data: { routeId: string } }) => {
        const route = routeEntries.find(r => r.id === params.data?.routeId);
        return route ? `${route.origin} - ${route.destination}` : '';
      },
    },
    { field: 'classCode', headerName: 'Class', width: 110, pinned: 'left' as const, valueGetter: (params: { data: { classCode: string } }) => CLASS_LABELS[params.data?.classCode] || params.data?.classCode },
    { field: 'period', headerName: 'Period', width: 170, pinned: 'left' as const, valueGetter: (params: { data: { routeId: string } }) => { const route = routeEntries.find(r => r.id === params.data?.routeId); if (!route) return ''; const start = route.startDate?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase() || ''; const end = route.endDate?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase() || ''; return `${start} - ${end}`; }},
    { field: 'marketYield', headerName: 'Market Yield ($/pax km)', flex: 1.2, minWidth: 120, cellRenderer: MarketYieldCellRenderer },
    { field: 'discountStrategy', headerName: 'Discount Strategy', flex: 1.2, minWidth: 130, cellRenderer: DiscountStrategyCellRenderer },
    { field: 'yield', headerName: 'Yield', flex: 1, minWidth: 100, cellRenderer: (props: ICellRendererParams) => {
      const handleChange = (newValue: number) => { const rounded = Math.round(newValue * 1000) / 1000; props.node.setDataValue('yield', rounded); setRoutePricingData((prev) => prev.map((p) => p.routeId === props.data.routeId && p.classCode === props.data.classCode ? { ...p, yield: rounded } : p)); };
      const value = props.data?.yield ?? 0;
      return (<div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}><NumberInput value={value} onChange={handleChange} size="S" min={0} step={0.1} showLabel={false} variant="Stepper" state={value === 0 ? 'Error' : 'Default'} /></div>);
    }},
    { field: 'fare', headerName: 'Fare (yield*distance)', flex: 1.2, minWidth: 120, cellClass: 'pricing-fare-cell', valueGetter: (params: { data: RoutePricingEntry }) => { const marketYield = params.data?.marketYield || 0; const discount = discountForNormalFares || 0; const yieldValue = marketYield * (1 - discount / 100); return (yieldValue * 100).toFixed(2); }},
  ], [routeEntries, discountForNormalFares, pricingFirstRowOfRoute]);

  // Fleet Plan
  const AllocatedAircraftCellRenderer = (props: ICellRendererParams & { aircraftOptions?: { value: string; label: string }[] }) => {
    const handleChange = (newValue: string) => {
      const actualValue = newValue === 'none' ? null : newValue;
      props.node.setDataValue(props.colDef?.field || '', actualValue);
      setFleetPlanData((prev) => prev.map((f) => f.routeId === props.data.routeId ? { ...f, allocatedAircraftId: actualValue } : f));
    };
    const options = props.aircraftOptions || [{ value: 'none', label: 'Not Allocated' }];
    const displayValue = props.value || 'none';
    return (<div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}><Select value={displayValue} onValueChange={handleChange} options={options} size="S" showLabel={false} state={displayValue === 'none' ? 'Error' : 'Default'} /></div>);
  };

  const fleetPlanColDefs = useMemo<ColDef[]>(() => {
    const aircraftOptions = [{ value: 'none', label: 'Not Allocated' }, ...fleetEntries.map(e => ({ value: e.id, label: `${e.aircraftType} - ${e.engine} (${e.layout})` }))];
    return [
      { field: 'route', headerName: 'Route', flex: 1.2, minWidth: 120, valueGetter: (params: { data: { routeId: string } }) => { const route = routeEntries.find(r => r.id === params.data?.routeId); return route ? `${route.origin} - ${route.destination}` : ''; }},
      { field: 'startDate', headerName: 'Start Date', flex: 1, minWidth: 100, valueGetter: (params: { data: { routeId: string } }) => { const route = routeEntries.find(r => r.id === params.data?.routeId); return route?.startDate?.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) || ''; }},
      { field: 'endDate', headerName: 'End Date', flex: 1, minWidth: 100, valueGetter: (params: { data: { routeId: string } }) => { const route = routeEntries.find(r => r.id === params.data?.routeId); return route?.endDate?.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) || ''; }},
      { field: 'allocatedAircraftId', headerName: 'Aircraft Allocated', flex: 2, minWidth: 200, cellRenderer: AllocatedAircraftCellRenderer, cellRendererParams: { aircraftOptions } },
    ];
  }, [routeEntries, fleetEntries]);

  // Frequencies
  const frequenciesRowData = useMemo(() => {
    return routeFrequencyData.map(entry => {
      const route = routeEntries.find(r => r.id === entry.routeId);
      return { ...entry, ...entry.frequencies, routeDisplay: route ? `${route.origin} - ${route.destination}` : '', startDateDisplay: route?.startDate?.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) || '', endDateDisplay: route?.endDate?.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) || '' };
    });
  }, [routeFrequencyData, routeEntries]);

  const FrequencyCellRenderer = (props: ICellRendererParams & { monthKey: string; allMonthKeys: string[] }) => {
    const { monthKey, allMonthKeys } = props;
    const handleChange = (newValue: number) => {
      const monthIndex = allMonthKeys.indexOf(monthKey);
      const monthsToUpdate = monthIndex >= 0 ? allMonthKeys.slice(monthIndex) : [monthKey];
      monthsToUpdate.forEach(mk => { props.node.setDataValue(mk, newValue); });
      setRouteFrequencyData((prev) => prev.map((f) => {
        if (f.routeId === props.data.routeId) {
          const updatedFrequencies = { ...f.frequencies };
          monthsToUpdate.forEach(mk => { updatedFrequencies[mk] = newValue; });
          return { ...f, frequencies: updatedFrequencies };
        }
        return f;
      }));
    };
    const hasAnyFrequency = Object.values(props.data?.frequencies || {}).some((v: number) => v > 0);
    return (<div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}><NumberInput value={props.value ?? 0} onChange={handleChange} size="XS" min={0} showLabel={false} variant="Stepper" state={!hasAnyFrequency ? 'Error' : 'Default'} /></div>);
  };

  const frequenciesColDefs = useMemo<ColDef[]>(() => {
    const fixedCols: ColDef[] = [
      { field: 'routeDisplay', headerName: 'Route', pinned: 'left', width: 100 },
      { field: 'startDateDisplay', headerName: 'Start', pinned: 'left', width: 72 },
      { field: 'endDateDisplay', headerName: 'End', pinned: 'left', width: 72 },
    ];
    const allMonthKeys = generateMonthColumns(startDate, endDate).map(c => c.field as string);
    const monthCols = generateMonthColumns(startDate, endDate).map(col => ({
      ...col, minWidth: 72, cellRenderer: FrequencyCellRenderer, cellRendererParams: { monthKey: col.field, allMonthKeys },
    }));
    return [...fixedCols, ...monthCols];
  }, [startDate, endDate, generateMonthColumns]);

  return (
    <div className="study-page__network">
      <div className="study-page__fleet-tabs">
        <div className={`study-page__tab-wrapper${!hasRoutes ? ' study-page__tab-wrapper--error' : ''}`}>
          <Tab label="Routes" size="M" status={networkTab === 'routes' ? 'Active' : 'Default'} onClick={() => setNetworkTab('routes')} />
        </div>
        <div className={`study-page__tab-wrapper${pricingErrors > 0 ? ' study-page__tab-wrapper--error' : ''}`}>
          <Tab label="Pricing" size="M" status={hasRoutes && networkTab === 'pricing' ? 'Active' : 'Default'} disabled={!hasRoutes} onClick={() => { if (hasRoutes) setNetworkTab('pricing'); }} />
        </div>
        <div className={`study-page__tab-wrapper${fleetPlanErrors > 0 ? ' study-page__tab-wrapper--error' : ''}`}>
          <Tab label="Fleet Plan" size="M" status={hasRoutes && networkTab === 'fleet-plan' ? 'Active' : 'Default'} disabled={!hasRoutes} onClick={() => { if (hasRoutes) setNetworkTab('fleet-plan'); }} />
        </div>
        <div className={`study-page__tab-wrapper${frequencyErrors > 0 ? ' study-page__tab-wrapper--error' : ''}`}>
          <Tab label="Frequencies" size="M" status={hasRoutes && networkTab === 'frequencies' ? 'Active' : 'Default'} disabled={!hasRoutes} onClick={() => { if (hasRoutes) setNetworkTab('frequencies'); }} />
        </div>
        <Tab label="Summary" size="M" status={networkTab === 'summary' ? 'Active' : 'Default'} disabled={!networkAllInputsFilled} onClick={() => { if (networkAllInputsFilled) setNetworkTab('summary'); }} />
      </div>

      {networkTab === 'routes' && (
        <div className="study-page__tab-content">
          <div className="study-page__fleet-title-bar">
            <div className="study-page__fleet-title-left">
              <h2 className="study-page__fleet-title">Routes</h2>
              <ButtonGroup options={[{ value: 'table', iconName: 'table_chart' }, { value: 'map', iconName: 'map' }]} value={routesViewMode} onChange={(v) => setRoutesViewMode(v as RoutesViewMode)} size="S" />
            </div>
            <div className="study-page__fleet-title-right">
              <span className="label-regular-s study-page__fleet-entry-count">{routeEntries.length} Routes</span>
            </div>
            <div className="study-page__fleet-actions">
              {selectedRouteIds.size > 0 && routesViewMode === 'table' && (
                <>
                  <span className="label-regular-s study-page__fleet-selection-count">{selectedRouteIds.size} {selectedRouteIds.size === 1 ? 'Route' : 'Routes'} Selected</span>
                  <IconButton icon="edit" size="S" variant="Outlined" alt="Edit" onClick={onOpenEditRoute} />
                  <IconButton icon="delete" size="S" variant="Outlined" alt="Delete" onClick={handleDeleteSelectedRoutes} className="study-page__fleet-delete-btn" />
                  <span className="study-page__fleet-action-divider" />
                </>
              )}
              <IconButton icon="add" size="S" variant="Outlined" alt="Add Route" onClick={onOpenAddRoute} />
              <DropdownMenu>
                <DropdownMenuTrigger><Button label="" leftIcon="system_update_alt" rightIcon="dropdown" variant="Outlined" size="S" className="study-page__import-fleet-btn" /></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem icon="system_update_alt" onSelect={onOpenImportNetwork}>Import from an Airline</DropdownMenuItem>
                  <DropdownMenuItem icon="drive_file_move" disabled>Load from an other Study</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem icon="upload" disabled>Upload from CSV</DropdownMenuItem>
                  <DropdownMenuItem icon="download" disabled>Download as CSV</DropdownMenuItem>
                  <DropdownMenuItem icon="download" disabled>Download an empty CSV Template</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {routesViewMode === 'table' && (
            <div className="study-page__fleet-table">
              {routeEntries.length === 0 ? (
                <div className="study-page__fleet-table-body">
                  <EmptyState illustration="Folder" title="No routes defined" description="Add routes to define your network" actions={<><Button label="ADD ROUTE" leftIcon="add" variant="Outlined" size="M" onClick={onOpenAddRoute} /><Button label="IMPORT NETWORK" leftIcon="system_update_alt" variant="Outlined" size="M" onClick={onOpenImportNetwork} /></>} className="study-page__fleet-empty" />
                </div>
              ) : (
                <AgGridReact className="as-ag-grid" rowData={routeEntries} columnDefs={routesColDefs} context={gridContext} rowSelection="multiple" suppressRowClickSelection={true} onSelectionChanged={onRouteSelectionChanged} getRowId={(params) => params.data.id} />
              )}
            </div>
          )}
          {routesViewMode === 'map' && (<NetworkMapView routeEntries={routeEntries} startDate={startDate} endDate={endDate} />)}
        </div>
      )}

      {networkTab === 'pricing' && (
        <div className="study-page__tab-content">
          <div className="study-page__pricing-discount-row">
            <NumberInput label="Discount for Normal Fares (%)" value={discountForNormalFares} onChange={(v) => setDiscountForNormalFares(Math.max(0, Math.min(100, v)))} size="S" min={0} max={100} />
          </div>
          <div className="study-page__fleet-title-bar">
            <h2 className="study-page__fleet-title">Pricing</h2>
            <div className="study-page__fleet-title-right">
              <span className="label-regular-s study-page__fleet-entry-count">{pricingRowData.length} Entries</span>
              <TextInput placeholder="Search" size="S" showLeftIcon leftIcon="search" showLabel={false} className="study-page__fleet-search" />
            </div>
            <div className="study-page__fleet-actions">
              <Button label="" leftIcon="download" rightIcon="arrow_drop_down" variant="Outlined" size="S" onClick={() => console.log('Export pricing')} />
            </div>
          </div>
          <div className="study-page__fleet-table"><AgGridReact className="as-ag-grid study-page__pricing-grid" rowData={pricingRowData} columnDefs={pricingColDefs} getRowId={(params) => `${params.data.routeId}-${params.data.classCode}`} getRowClass={getPricingRowClass} /></div>
        </div>
      )}

      {networkTab === 'fleet-plan' && (
        <div className="study-page__tab-content">
          <div className="study-page__fleet-title-bar">
            <h2 className="study-page__fleet-title">Fleet Plan</h2>
            <div className="study-page__fleet-title-right"><span className="label-regular-s study-page__fleet-entry-count">{routeEntries.length} Routes</span></div>
          </div>
          <div className="study-page__fleet-table"><AgGridReact className="as-ag-grid" rowData={fleetPlanData} columnDefs={fleetPlanColDefs} getRowId={(params) => params.data.routeId} /></div>
        </div>
      )}

      {networkTab === 'frequencies' && (
        <div className="study-page__tab-content">
          <div className="study-page__fleet-title-bar">
            <h2 className="study-page__fleet-title">Frequencies</h2>
            <div className="study-page__fleet-title-right"><span className="label-regular-s study-page__fleet-entry-count">{routeEntries.length} Routes</span></div>
          </div>
          <div className="study-page__fleet-table"><AgGridReact className="as-ag-grid study-page__frequencies-grid" rowData={frequenciesRowData} columnDefs={frequenciesColDefs} getRowId={(params) => params.data.routeId} /></div>
        </div>
      )}

      {networkTab === 'summary' && (
        <div className="study-page__tab-content">
          <NetworkSummary routeEntries={routeEntries} fleetEntries={fleetEntries} startDate={startDate} endDate={endDate} periodType={periodType} />
        </div>
      )}
    </div>
  );
}
