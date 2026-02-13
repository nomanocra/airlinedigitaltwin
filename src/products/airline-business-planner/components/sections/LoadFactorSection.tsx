import { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Tab } from '@/design-system/components/Tab';
import { NumberInput } from '@/design-system/components/NumberInput';
import { Icon } from '@/design-system/components/Icon';
import { TextInput } from '@/design-system/components/TextInput';
import { Button } from '@/design-system/components/Button';
import { SimpleTooltip } from '@/design-system/components/Tooltip';
import { LoadFactorSummary } from '../LoadFactorSummary';
import type { LoadFactorTabType, RouteEntry } from '../../pages/types';
import { CLASS_LABELS } from '../../utils/cabinClassUtils';
import { getMonthKeys, getMonthIndex, getSeasonalityMonthName } from '../../utils/periodUtils';

function LFCellRenderer({
  computedValue,
  overrideValue,
  onSetOverride,
  onClearOverride,
}: {
  computedValue: number;
  overrideValue: number | undefined;
  onSetOverride: (value: number) => void;
  onClearOverride: () => void;
}) {
  const isOverridden = overrideValue !== undefined;
  const displayValue = isOverridden ? overrideValue : computedValue;
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  return (
    <div
      className={isOverridden ? 'lf-cell--overridden' : ''}
      style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}
    >
      <TextInput
        size="S"
        showLabel={false}
        value={editing ? editValue : `${displayValue}%`}
        onChange={(e) => {
          if (editing) setEditValue(e.target.value);
        }}
        onFocus={() => {
          setEditing(true);
          setEditValue(String(displayValue));
        }}
        onBlur={() => {
          setEditing(false);
          const parsed = parseInt(editValue.replace('%', '').trim(), 10);
          if (!isNaN(parsed) && parsed !== computedValue) {
            onSetOverride(parsed);
          } else if (!isNaN(parsed) && parsed === computedValue && isOverridden) {
            onClearOverride();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        showRightIconButton={isOverridden}
        rightIconButton="close"
        onRightIconButtonClick={onClearOverride}
      />
    </div>
  );
}

export interface LoadFactorSectionProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  periodType: 'dates' | 'duration';
  yearKeys: string[];
  yearKeyToLabel: (key: string) => string;
  generateMonthColumns: (start: Date | undefined, end: Date | undefined) => ColDef[];
  routeEntries: RouteEntry[];
  targetedYearlyLF: Record<string, Record<string, number>>;
  setTargetedYearlyLF: React.Dispatch<React.SetStateAction<Record<string, Record<string, number>>>>;
  seasonalityCorrection: Record<string, number>;
  setSeasonalityCorrection: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  firstYearRampUp: Record<string, Record<string, number>>;
  setFirstYearRampUp: React.Dispatch<React.SetStateAction<Record<string, Record<string, number>>>>;
  maxLoadFactor: Record<string, number>;
  setMaxLoadFactor: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  routeLoadFactorData: Array<{ routeId: string; classType: string; [key: string]: number | string }>;
  setRouteLoadFactorData: React.Dispatch<React.SetStateAction<Array<{ routeId: string; classType: string; [key: string]: number | string }>>>;
  activeClasses: string[];
}

export function LoadFactorSection({
  startDate,
  endDate,
  periodType,
  yearKeys,
  yearKeyToLabel,
  generateMonthColumns,
  routeEntries,
  targetedYearlyLF,
  setTargetedYearlyLF,
  seasonalityCorrection,
  setSeasonalityCorrection,
  firstYearRampUp,
  setFirstYearRampUp,
  maxLoadFactor,
  setMaxLoadFactor,
  routeLoadFactorData,
  setRouteLoadFactorData,
  activeClasses,
}: LoadFactorSectionProps) {
  const [loadFactorTab, setLoadFactorTab] = useState<LoadFactorTabType>('general');
  const hasRoutes = routeEntries.length > 0;

  // Targeted Yearly LF columns
  const targetedYearlyLFColDefs = useMemo<ColDef[]>(() => {
    const lfYearKeys = yearKeys.filter(k => k !== 'Y1');
    const yearCols = lfYearKeys.map(y => ({
      field: y,
      headerName: yearKeyToLabel(y),
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
      { field: 'classType', headerName: '', width: 120, pinned: 'left' as const, valueGetter: (params: { data: { classType: string } }) => CLASS_LABELS[params.data?.classType] || params.data?.classType },
      ...yearCols,
    ];
  }, [yearKeys, yearKeyToLabel]);

  const targetedYearlyLFRowData = useMemo(() =>
    activeClasses.map(code => ({ classType: code, ...(targetedYearlyLF[code] || {}) })),
    [targetedYearlyLF, activeClasses]
  );

  // First Year Ramp Up columns
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
      { field: 'classType', headerName: '', width: 120, pinned: 'left' as const, valueGetter: (params: { data: { classType: string } }) => CLASS_LABELS[params.data?.classType] || params.data?.classType },
      ...editableCols,
    ];
  }, [startDate, endDate, generateMonthColumns]);

  const firstYearRampUpRowData = useMemo(() =>
    activeClasses.map(code => ({ classType: code, ...(firstYearRampUp[code] || {}) })),
    [firstYearRampUp, activeClasses]
  );

  // Computed LF values per class per month
  const allMonthKeys = useMemo(() => getMonthKeys(startDate, endDate), [startDate, endDate]);

  const computedLF = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    if (!startDate) return result;

    for (const cls of activeClasses) {
      result[cls] = {};
      for (const mk of allMonthKeys) {
        const monthIdx = getMonthIndex(mk, startDate);
        if (monthIdx <= 12) {
          // Y1: ramp-up direct
          result[cls][mk] = firstYearRampUp[cls]?.[mk] ?? 0;
        } else {
          // Y2+: targeted × seasonality, capped
          const yearKey = `Y${Math.ceil(monthIdx / 12)}`;
          const monthName = getSeasonalityMonthName(mk);
          const targeted = targetedYearlyLF[cls]?.[yearKey] ?? 0;
          const seasonality = seasonalityCorrection[monthName] ?? 100;
          const maxLF = maxLoadFactor[cls] ?? 100;
          result[cls][mk] = Math.min(Math.round(targeted * seasonality / 100), maxLF);
        }
      }
    }
    return result;
  }, [startDate, allMonthKeys, activeClasses, firstYearRampUp, targetedYearlyLF, seasonalityCorrection, maxLoadFactor]);

  // Load Factor per Route — rows are route × class combinations (no pre-filled values)
  const routeLoadFactorRowData = useMemo(() => {
    const rows: Array<{ routeId: string; classType: string; routeDisplay: string }> = [];
    routeEntries.forEach(route => {
      activeClasses.forEach(cls => {
        rows.push({
          routeId: route.id,
          classType: cls,
          routeDisplay: `${route.origin} - ${route.destination}`,
        });
      });
    });
    return rows;
  }, [routeEntries, activeClasses]);

  // O&D grouping — alternating colors + first row tracking
  const routeLFGroupIndex = useMemo(() => {
    const groups: Record<string, number> = {};
    let currentGroupIndex = 0;
    let lastRouteId = '';
    routeLoadFactorRowData.forEach(r => {
      if (r.routeId !== lastRouteId) {
        groups[r.routeId] = currentGroupIndex;
        currentGroupIndex++;
        lastRouteId = r.routeId;
      }
    });
    return groups;
  }, [routeLoadFactorRowData]);

  const routeLFFirstRow = useMemo(() => {
    const firstRows = new Set<string>();
    const seen = new Set<string>();
    routeLoadFactorRowData.forEach(r => {
      if (!seen.has(r.routeId)) {
        firstRows.add(`${r.routeId}-${r.classType}`);
        seen.add(r.routeId);
      }
    });
    return firstRows;
  }, [routeLoadFactorRowData]);

  const getRouteLFRowClass = useCallback((params: { data: { routeId: string; classType: string } }) => {
    if (!params.data) return '';
    const groupIndex = routeLFGroupIndex[params.data.routeId] || 0;
    const rowKey = `${params.data.routeId}-${params.data.classType}`;
    const isFirst = routeLFFirstRow.has(rowKey);
    const colorClass = groupIndex % 2 === 0 ? 'lf-row-group-even' : 'lf-row-group-odd';
    return isFirst ? `${colorClass} lf-row-group-first` : colorClass;
  }, [routeLFGroupIndex, routeLFFirstRow]);

  // Set an override value for a route/class/month
  const setOverride = useCallback((routeId: string, classType: string, monthKey: string, value: number) => {
    setRouteLoadFactorData(prev => {
      const existing = [...prev];
      const idx = existing.findIndex(r => r.routeId === routeId && r.classType === classType);
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], [monthKey]: value };
      } else {
        existing.push({ routeId, classType, [monthKey]: value });
      }
      return existing;
    });
  }, [setRouteLoadFactorData]);

  // Clear an override for a route/class/month
  const clearOverride = useCallback((routeId: string, classType: string, monthKey: string) => {
    setRouteLoadFactorData(prev => {
      const existing = [...prev];
      const idx = existing.findIndex(r => r.routeId === routeId && r.classType === classType);
      if (idx < 0) return prev;
      const entry = { ...existing[idx] };
      delete entry[monthKey];
      // If no more month overrides remain, remove the entry entirely
      const hasMonthKeys = Object.keys(entry).some(k => k.match(/^\d{4}-\d{2}$/));
      if (!hasMonthKeys) {
        existing.splice(idx, 1);
      } else {
        existing[idx] = entry;
      }
      return existing;
    });
  }, [setRouteLoadFactorData]);

  const routeLoadFactorColDefs = useMemo<ColDef[]>(() => {
    const monthCols = generateMonthColumns(startDate, endDate).map(col => ({
      ...col,
      cellRenderer: (props: ICellRendererParams) => {
        const monthKey = col.field as string;
        const { routeId, classType } = props.data;
        const overrideEntry = routeLoadFactorData.find(
          r => r.routeId === routeId && r.classType === classType
        );
        const overrideValue = overrideEntry?.[monthKey] as number | undefined;
        const computedValue = computedLF[classType]?.[monthKey] ?? 0;

        return (
          <LFCellRenderer
            computedValue={computedValue}
            overrideValue={overrideValue}
            onSetOverride={(v) => setOverride(routeId, classType, monthKey, v)}
            onClearOverride={() => clearOverride(routeId, classType, monthKey)}
          />
        );
      },
    }));
    return [
      {
        field: 'routeDisplay',
        headerName: 'O&D',
        width: 140,
        pinned: 'left' as const,
        cellClass: (params: { data: { routeId: string; classType: string } }) => {
          const rowKey = `${params.data?.routeId}-${params.data?.classType}`;
          const isFirst = routeLFFirstRow.has(rowKey);
          return isFirst ? 'lf-od-cell lf-od-cell--visible' : 'lf-od-cell lf-od-cell--hidden';
        },
      },
      { field: 'classType', headerName: 'Class', width: 120, pinned: 'left' as const, valueGetter: (params: { data: { classType: string } }) => CLASS_LABELS[params.data?.classType] || params.data?.classType },
      ...monthCols,
    ];
  }, [startDate, endDate, generateMonthColumns, routeLFFirstRow, routeLoadFactorData, computedLF, setOverride, clearOverride]);

  return (
    <div className="study-page__fleet">
      <div className="study-page__fleet-tabs">
        <Tab label="General Load Factor" size="M" status={loadFactorTab === 'general' ? 'Active' : 'Default'} onClick={() => setLoadFactorTab('general')} />
        <Tab label="Load Factor per Route" size="M" status={loadFactorTab === 'per-route' ? 'Active' : 'Default'} disabled={!hasRoutes} onClick={() => { if (hasRoutes) setLoadFactorTab('per-route'); }} />
        <Tab label="Summary" size="M" status={loadFactorTab === 'summary' ? 'Active' : 'Default'} onClick={() => setLoadFactorTab('summary')} />
      </div>

      {loadFactorTab === 'general' && (
        <div className="study-page__assumption-content">
          <h2 className="study-page__fleet-title">General Load Factor</h2>

          <div className="study-page__section">
            <div className="study-page__section-title-row">
              <h3 className="study-page__section-title">Targeted Yearly Load Factor</h3>
            </div>
            <div className="study-page__fleet-table" style={{ flex: 'none', height: 41 + targetedYearlyLFRowData.length * 40 }}>
              <AgGridReact className="as-ag-grid" rowData={targetedYearlyLFRowData} columnDefs={targetedYearlyLFColDefs} getRowId={(params) => params.data.classType} />
            </div>
          </div>

          <div className="study-page__section">
            <div className="study-page__section-title-row">
              <h3 className="study-page__section-title">Seasonality Load Factor Correction</h3>
              <SimpleTooltip label="Monthly, applicable from Y2 onwards" delayDuration={0}>
                <span className="study-page__section-info-icon"><Icon name="info" size={16} /></span>
              </SimpleTooltip>
            </div>
            <div className="study-page__form-grid">
              {Object.entries(seasonalityCorrection).map(([month, value]) => (
                <NumberInput key={month} label={month} value={value} onChange={(v) => setSeasonalityCorrection(prev => ({ ...prev, [month]: v }))} size="S" min={0} showLabel />
              ))}
            </div>
          </div>

          <div className="study-page__section">
            <div className="study-page__section-title-row">
              <h3 className="study-page__section-title">First Year Load Factor Ramp Up</h3>
            </div>
            <div className="study-page__fleet-table" style={{ flex: 'none', height: 41 + firstYearRampUpRowData.length * 40 }}>
              <AgGridReact className="as-ag-grid" rowData={firstYearRampUpRowData} columnDefs={firstYearRampUpColDefs} getRowId={(params) => params.data.classType} />
            </div>
          </div>

          <div className="study-page__section">
            <div className="study-page__section-title-row">
              <h3 className="study-page__section-title">Maximum Acceptable Load Factor</h3>
              <SimpleTooltip label="Value never exceeded, even in peak season" delayDuration={0}>
                <span className="study-page__section-info-icon"><Icon name="info" size={16} /></span>
              </SimpleTooltip>
            </div>
            <div className="study-page__form-grid">
              {activeClasses.map(code => (
                <NumberInput
                  key={code}
                  label={CLASS_LABELS[code] || code}
                  value={maxLoadFactor[code] ?? 90}
                  onChange={(v) => setMaxLoadFactor(prev => ({ ...prev, [code]: v }))}
                  size="S"
                  min={0}
                  max={100}
                  showLabel
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {loadFactorTab === 'per-route' && (
        <div className="study-page__tab-content">
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
            <AgGridReact className="as-ag-grid study-page__lf-route-grid" rowData={routeLoadFactorRowData} columnDefs={routeLoadFactorColDefs} getRowId={(params) => `${params.data.routeId}-${params.data.classType}`} getRowClass={getRouteLFRowClass} />
          </div>
        </div>
      )}

      {loadFactorTab === 'summary' && (
        <div className="study-page__tab-content">
          <LoadFactorSummary startDate={startDate} endDate={endDate} periodType={periodType} activeClasses={activeClasses} />
        </div>
      )}
    </div>
  );
}
