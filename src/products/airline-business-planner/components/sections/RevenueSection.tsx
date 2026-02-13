import { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Tab } from '@/design-system/components/Tab';
import { NumberInput } from '@/design-system/components/NumberInput';
import { Icon } from '@/design-system/components/Icon';
import { SimpleTooltip } from '@/design-system/components/Tooltip';
import type { RevenueTabType } from '../../pages/types';
import { CLASS_LABELS } from '../../utils/cabinClassUtils';

export interface RevenueSectionProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  yearKeys: string[];
  yearKeyToLabel: (key: string) => string;
  generateMonthColumns: (start: Date | undefined, end: Date | undefined) => ColDef[];
  ancillaryRevenueData: Array<{ classType: string; [key: string]: number | string }>;
  setAncillaryRevenueData: React.Dispatch<React.SetStateAction<Array<{ classType: string; [key: string]: number | string }>>>;
  codeShareDeduction: number;
  setCodeShareDeduction: (v: number) => void;
  cargoMarketCAGR: number;
  setCargoMarketCAGR: (v: number) => void;
  cargoAddressableMarket: number;
  setCargoAddressableMarket: (v: number) => void;
  cargoYearlyData: Array<{ metric: string; [key: string]: number | string }>;
  setCargoYearlyData: React.Dispatch<React.SetStateAction<Array<{ metric: string; [key: string]: number | string }>>>;
  activeClasses: string[];
}

export function RevenueSection({
  startDate,
  endDate,
  yearKeys,
  yearKeyToLabel,
  generateMonthColumns,
  ancillaryRevenueData,
  setAncillaryRevenueData,
  codeShareDeduction,
  setCodeShareDeduction,
  cargoMarketCAGR,
  setCargoMarketCAGR,
  cargoAddressableMarket,
  setCargoAddressableMarket,
  cargoYearlyData,
  setCargoYearlyData,
  activeClasses,
}: RevenueSectionProps) {
  const [revenueTab, setRevenueTab] = useState<RevenueTabType>('ancillary');

  // Ancillary revenue — show only active classes, preserve data for inactive ones
  const ancillaryRowData = useMemo(() => {
    const activeSet = new Set(activeClasses);
    return ancillaryRevenueData.filter(r => activeSet.has(r.classType));
  }, [ancillaryRevenueData, activeClasses]);

  // Ancillary revenue column definitions
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
      { field: 'classType', headerName: '', width: 150, pinned: 'left' as const, valueGetter: (params: { data: { classType: string } }) => { const code = params.data?.classType; return CLASS_LABELS[code] ? `${CLASS_LABELS[code]} Pax` : `${code} Pax`; } },
      ...monthCols,
    ];
  }, [startDate, endDate, generateMonthColumns]);

  // Cargo yearly data
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
      headerName: yearKeyToLabel(y),
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
  }, [yearKeys, yearKeyToLabel]);

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

  return (
    <div className="study-page__fleet">
      <div className="study-page__fleet-tabs">
        <Tab label="Ancillary Revenues" size="M" status={revenueTab === 'ancillary' ? 'Active' : 'Default'} onClick={() => setRevenueTab('ancillary')} />
        <Tab label="Cargo Revenues" size="M" status={revenueTab === 'cargo' ? 'Active' : 'Default'} onClick={() => setRevenueTab('cargo')} />
      </div>

      {/* Ancillary Revenues */}
      {revenueTab === 'ancillary' && (
        <div className="study-page__assumption-content" style={{ flex: 'none' }}>
          <h2 className="study-page__fleet-title">Ancillary Revenues</h2>

          <div className="study-page__section">
            <div className="study-page__section-title-row">
              <h3 className="study-page__section-title">Ancillary Revenues per passenger</h3>
            </div>
            <div className="study-page__fleet-table" style={{ flex: 'none', height: 41 + ancillaryRowData.length * 40 }}>
              <AgGridReact
                className="as-ag-grid"
                rowData={ancillaryRowData}
                columnDefs={ancillaryRevenueColDefs}
                getRowId={(params) => params.data.classType}
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
            <div className="study-page__form-grid--wide study-page__form-grid">
              <NumberInput value={codeShareDeduction} onChange={setCodeShareDeduction} size="S" min={0} max={100} showLabel={false} />
            </div>
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
  );
}
