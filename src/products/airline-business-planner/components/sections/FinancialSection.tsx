import { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Tab } from '@/design-system/components/Tab';
import { NumberInput } from '@/design-system/components/NumberInput';
import { TextInput } from '@/design-system/components/TextInput';
import type { FinancialTabType } from '../../pages/types';

export interface FinancialSectionProps {
  yearKeys: string[];
  yearKeyToLabel: (key: string) => string;
  inflationData: Array<{ factor: string; [key: string]: number | string }>;
  setInflationData: React.Dispatch<React.SetStateAction<Array<{ factor: string; [key: string]: number | string }>>>;
  effectiveTaxRate: number; setEffectiveTaxRate: (v: number) => void;
  lossCarryForward: number; setLossCarryForward: (v: number) => void;
  lossCarryBack: number; setLossCarryBack: (v: number) => void;
  depreciationRate: number; setDepreciationRate: (v: number) => void;
  residualValue: number; setResidualValue: (v: number) => void;
  interestRate: number; setInterestRate: (v: number) => void;
  loanDuration: number; setLoanDuration: (v: number) => void;
  costOfDebt: number; setCostOfDebt: (v: number) => void;
  avgLifeCapitalizedLease: number; setAvgLifeCapitalizedLease: (v: number) => void;
  securityDeposit: number; setSecurityDeposit: (v: number) => void;
  toolingAmortRate: number; setToolingAmortRate: (v: number) => void;
  toolingResidualValue: number; setToolingResidualValue: (v: number) => void;
  spareUsageRate: number; setSpareUsageRate: (v: number) => void;
  sparesAmortRate: number; setSparesAmortRate: (v: number) => void;
  acPreparationAmortRate: number; setAcPreparationAmortRate: (v: number) => void;
  workingCapitalData: Array<{ category: string; item: string; [key: string]: number | string }>;
  setWorkingCapitalData: React.Dispatch<React.SetStateAction<Array<{ category: string; item: string; [key: string]: number | string }>>>;
}

export function FinancialSection({
  yearKeys,
  yearKeyToLabel,
  inflationData,
  setInflationData,
  effectiveTaxRate, setEffectiveTaxRate,
  lossCarryForward, setLossCarryForward,
  lossCarryBack, setLossCarryBack,
  depreciationRate, setDepreciationRate,
  residualValue, setResidualValue,
  interestRate, setInterestRate,
  loanDuration, setLoanDuration,
  costOfDebt, setCostOfDebt,
  avgLifeCapitalizedLease, setAvgLifeCapitalizedLease,
  securityDeposit, setSecurityDeposit,
  toolingAmortRate, setToolingAmortRate,
  toolingResidualValue, setToolingResidualValue,
  spareUsageRate, setSpareUsageRate,
  sparesAmortRate, setSparesAmortRate,
  acPreparationAmortRate, setAcPreparationAmortRate,
  workingCapitalData, setWorkingCapitalData,
}: FinancialSectionProps) {
  const [financialTab, setFinancialTab] = useState<FinancialTabType>('inflation');

  const inflationColDefs = useMemo<ColDef[]>(() => {
    const yCols = yearKeys.map(y => ({
      field: y,
      headerName: yearKeyToLabel(y),
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
  }, [yearKeys, yearKeyToLabel]);

  // Working Capital
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

  return (
    <div className="study-page__fleet">
      <div className="study-page__fleet-tabs">
        <Tab label="Inflation" size="M" status={financialTab === 'inflation' ? 'Active' : 'Default'} onClick={() => setFinancialTab('inflation')} />
        <Tab label="Taxes" size="M" status={financialTab === 'taxes' ? 'Active' : 'Default'} onClick={() => setFinancialTab('taxes')} />
        <Tab label="Owned AC" size="M" status={financialTab === 'owned-ac' ? 'Active' : 'Default'} onClick={() => setFinancialTab('owned-ac')} />
        <Tab label="Leased AC" size="M" status={financialTab === 'leased-ac' ? 'Active' : 'Default'} onClick={() => setFinancialTab('leased-ac')} />
        <Tab label="Tooling, Spares & Preparation" size="M" status={financialTab === 'tooling' ? 'Active' : 'Default'} onClick={() => setFinancialTab('tooling')} />
        <Tab label="Working Capital" size="M" status={financialTab === 'working-capital' ? 'Active' : 'Default'} onClick={() => setFinancialTab('working-capital')} />
      </div>

      {financialTab === 'inflation' && (
        <div className="study-page__assumption-content">
          <h2 className="study-page__fleet-title">Inflation</h2>
          <div className="study-page__section">
            <div className="study-page__section-title-row">
              <h3 className="study-page__section-title">YoY Inflation</h3>
            </div>
            <div className="study-page__fleet-table" style={{ maxHeight: 250 }}>
              <AgGridReact className="as-ag-grid" rowData={inflationData} columnDefs={inflationColDefs} getRowId={(params) => params.data.factor} domLayout="autoHeight" />
            </div>
          </div>
        </div>
      )}

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

      {financialTab === 'working-capital' && (
        <div className="study-page__tab-content">
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
            <AgGridReact className="as-ag-grid" rowData={workingCapitalRowData} columnDefs={workingCapitalColDefs} getRowId={(params) => params.data.item} />
          </div>
        </div>
      )}
    </div>
  );
}
