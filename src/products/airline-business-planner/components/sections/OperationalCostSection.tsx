import { useState, useMemo } from 'react';
import { Tab } from '@/design-system/components/Tab';
import { NumberInput } from '@/design-system/components/NumberInput';
import type { OperationalCostTabType, CrewCostSubTabType } from '../../pages/types';
import { formatCurrency } from '../../utils/periodUtils';

export interface OperationalCostSectionProps {
  monthKeys: string[];
  monthLabels: string[];
  yearKeys: string[];
  yearKeyToLabel: (key: string) => string;
  fuelPricePerGallon: number; setFuelPricePerGallon: (v: number) => void;
  fuelDepositsMonths: number; setFuelDepositsMonths: (v: number) => void;
  crewRatioPerAircraft: number; setCrewRatioPerAircraft: (v: number) => void;
  cabinCrewAttrition: number; setCabinCrewAttrition: (v: number) => void;
  flightCrewAttrition: number; setFlightCrewAttrition: (v: number) => void;
  crewFixedWages: {
    annualSalaryIncrease: number;
    captainGrossWage: number; companyChargesCaptain: number;
    firstOfficerGrossWage: number; companyChargesFirstOfficer: number;
    flightCrewAdditionalSalary: number;
    cabinCrewTeamLeaderWage: number; companyChargesCabinCrewTeamLeader: number;
    cabinAttendantWage: number; companyChargesCabinAttendant: number;
    cabinCrewAdditionalSalary: number;
  };
  setCrewFixedWages: React.Dispatch<React.SetStateAction<OperationalCostSectionProps['crewFixedWages']>>;
  crewVariableWages: { flightCrewVariablePay: number; cabinCrewVariablePay: number };
  setCrewVariableWages: React.Dispatch<React.SetStateAction<{ flightCrewVariablePay: number; cabinCrewVariablePay: number }>>;
  crewTraining: {
    operatorConversionCourse: number; typeRatingCost: number; pilotsAlreadyQualified: number;
    flightCrewRecurrentTraining: number; cabinCrewTrainingCost: number;
  };
  setCrewTraining: React.Dispatch<React.SetStateAction<OperationalCostSectionProps['crewTraining']>>;
  cateringCostEconomy: number; setCateringCostEconomy: (v: number) => void;
  cateringCostBusiness: number; setCateringCostBusiness: (v: number) => void;
  cateringCostPremium: number; setCateringCostPremium: (v: number) => void;
  indirectMaintenanceCost: number; setIndirectMaintenanceCost: (v: number) => void;
  maintenanceOutsourcingCost: number; setMaintenanceOutsourcingCost: (v: number) => void;
  llpCostFactor: number; setLlpCostFactor: (v: number) => void;
  initialMarketingBudget: number; setInitialMarketingBudget: (v: number) => void;
  sellingCostPerPax: Record<string, number>;
  setSellingCostPerPax: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  marketingBudget: Record<string, number>;
  setMarketingBudget: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export function OperationalCostSection({
  monthKeys,
  monthLabels,
  yearKeys,
  yearKeyToLabel,
  fuelPricePerGallon, setFuelPricePerGallon,
  fuelDepositsMonths, setFuelDepositsMonths,
  crewRatioPerAircraft, setCrewRatioPerAircraft,
  cabinCrewAttrition, setCabinCrewAttrition,
  flightCrewAttrition, setFlightCrewAttrition,
  crewFixedWages, setCrewFixedWages,
  crewVariableWages, setCrewVariableWages,
  crewTraining, setCrewTraining,
  cateringCostEconomy, setCateringCostEconomy,
  cateringCostBusiness, setCateringCostBusiness,
  cateringCostPremium, setCateringCostPremium,
  indirectMaintenanceCost, setIndirectMaintenanceCost,
  maintenanceOutsourcingCost, setMaintenanceOutsourcingCost,
  llpCostFactor, setLlpCostFactor,
  initialMarketingBudget, setInitialMarketingBudget,
  sellingCostPerPax, setSellingCostPerPax,
  marketingBudget, setMarketingBudget,
}: OperationalCostSectionProps) {
  const [operationalCostTab, setOperationalCostTab] = useState<OperationalCostTabType>('fuel-cost');
  const [crewFixedWagesSubTab, setCrewFixedWagesSubTab] = useState<CrewCostSubTabType>('wages');
  const [crewVariableWagesSubTab, setCrewVariableWagesSubTab] = useState<CrewCostSubTabType>('wages');
  const [crewTrainingSubTab, setCrewTrainingSubTab] = useState<CrewCostSubTabType>('wages');

  // Computed crew cost tables
  const crewFixedWagesTableData = useMemo(() => {
    const w = crewFixedWages;
    const captainTotal = Math.round(w.captainGrossWage * (1 + w.companyChargesCaptain / 100));
    const foTotal = Math.round(w.firstOfficerGrossWage * (1 + w.companyChargesFirstOfficer / 100));
    const ccLeaderTotal = Math.round(w.cabinCrewTeamLeaderWage * (1 + w.companyChargesCabinCrewTeamLeader / 100));
    const caTotal = Math.round(w.cabinAttendantWage * (1 + w.companyChargesCabinAttendant / 100));
    return [
      { label: 'Captain Total Cost (incl. Company charges) per month', values: monthKeys.map(() => captainTotal) },
      { label: 'F/O Total Cost (incl. Company charges) per month', values: monthKeys.map(() => foTotal) },
      { label: 'Cabin Crew Team Leader Total Cost (incl. Company charges) per month', values: monthKeys.map(() => ccLeaderTotal) },
      { label: 'Cabin Crew Std Total Cost (incl. Company charges) per month', values: monthKeys.map(() => caTotal) },
    ];
  }, [crewFixedWages, monthKeys]);

  const variableWagesTableData = useMemo(() => {
    const v = crewVariableWages;
    return [
      { label: 'Flight Crew Variable scheme per BH', perSector: v.flightCrewVariablePay, values: monthKeys.map(() => Math.round(v.flightCrewVariablePay * 720)) },
      { label: 'Cabin Crew Variable scheme per BH', perSector: v.cabinCrewVariablePay, values: monthKeys.map(() => Math.round(v.cabinCrewVariablePay * 720)) },
    ];
  }, [crewVariableWages, monthKeys]);

  const trainingCostsTableData = useMemo(() => {
    const t = crewTraining;
    return [
      { label: 'Operator Conversion course per flight crew', values: monthKeys.map(() => Math.round(t.operatorConversionCourse * 300)) },
      { label: 'Type rating Cost for non A/C type qualified pilots', values: monthKeys.map(() => Math.round(t.typeRatingCost * 640)) },
      { label: 'Flight Crew Recurrent Training Cost per FC team (Captain + F/O + Instructor) incl. Accommodation', values: monthKeys.map(() => Math.round(t.flightCrewRecurrentTraining * 70)) },
      { label: 'Cabin Crew Training Cost per Cabin Crew Member, incl. Accommodation', values: monthKeys.map(() => Math.round(t.cabinCrewTrainingCost * 10)) },
    ];
  }, [crewTraining, monthKeys]);

  // Selling & Distribution yearly inputs
  const sellingCostYearlyInputs = useMemo(() => {
    return yearKeys.map(y => ({ key: y, label: yearKeyToLabel(y), value: sellingCostPerPax[y] ?? 0 }));
  }, [yearKeys, yearKeyToLabel, sellingCostPerPax]);

  const marketingBudgetYearlyInputs = useMemo(() => {
    return yearKeys.map(y => ({ key: y, label: yearKeyToLabel(y), value: marketingBudget[y] ?? 0 }));
  }, [yearKeys, yearKeyToLabel, marketingBudget]);

  return (
    <div className="study-page__fleet">
      <div className="study-page__fleet-tabs">
        <Tab label="Fuel Cost" size="M" status={operationalCostTab === 'fuel-cost' ? 'Active' : 'Default'} onClick={() => setOperationalCostTab('fuel-cost')} />
        <Tab label="Crew Costs" size="M" status={operationalCostTab === 'crew-costs' ? 'Active' : 'Default'} onClick={() => setOperationalCostTab('crew-costs')} />
        <Tab label="Catering Costs" size="M" status={operationalCostTab === 'catering-costs' ? 'Active' : 'Default'} onClick={() => setOperationalCostTab('catering-costs')} />
        <Tab label="Maintenance Costs" size="M" status={operationalCostTab === 'maintenance-costs' ? 'Active' : 'Default'} onClick={() => setOperationalCostTab('maintenance-costs')} />
        <Tab label="Selling and Distribution Costs" size="M" status={operationalCostTab === 'selling-distribution' ? 'Active' : 'Default'} onClick={() => setOperationalCostTab('selling-distribution')} />
      </div>

      {operationalCostTab === 'fuel-cost' && (
        <div className="study-page__assumption-content">
          <h2 className="study-page__fleet-title">Fuel Cost</h2>
          <div className="study-page__form-grid--wide study-page__form-grid">
            <NumberInput label="Av. Fuel Price Including Distribution (USD/US Gallon)" value={fuelPricePerGallon} onChange={setFuelPricePerGallon} size="S" min={0} step={0.1} showLabel showInfo infoText="Average fuel price including distribution costs" />
            <NumberInput label="Av. Fuel Price (USD/kg)" value={Number((fuelPricePerGallon * 0.264172).toFixed(2))} onChange={() => {}} size="S" showLabel disabled />
            <NumberInput label="Fuel Deposits in Advance (month)" value={fuelDepositsMonths} onChange={setFuelDepositsMonths} size="S" min={0} showLabel />
          </div>
        </div>
      )}

      {operationalCostTab === 'crew-costs' && (
        <div className="study-page__assumption-content">
          <h2 className="study-page__fleet-title">Crew Cost</h2>

          <div className="study-page__section">
            <div className="study-page__section-title-row">
              <h3 className="study-page__section-title">General Crew Costs</h3>
            </div>
            <div className="study-page__form-grid--wide study-page__form-grid">
              <NumberInput label="Crew Ratio per Aircraft" value={crewRatioPerAircraft} onChange={setCrewRatioPerAircraft} size="S" min={0} step={0.1} showLabel showInfo infoText="Number of crews needed to operate an A/C for a full month" />
              <NumberInput label="Cabin Crew Attrition Rate per Month (%)" value={cabinCrewAttrition} onChange={setCabinCrewAttrition} size="S" min={0} step={0.01} showLabel showInfo infoText="Percentage of crew members that could quit or retire each month" />
              <NumberInput label="Flight Crew Attrition per Year" value={flightCrewAttrition} onChange={setFlightCrewAttrition} size="S" min={0} showLabel showInfo infoText="Number of pilots that could quit or retire each year." />
            </div>
          </div>

          {/* Crew Fixed Wages */}
          <div className="study-page__section">
            <div className="study-page__section-title-row">
              <h3 className="study-page__section-title">Crew Fixed Wages</h3>
            </div>
            <div className="study-page__container-tabs">
              <Tab label="Crew Fixed Wages" variant="Container" size="S" status={crewFixedWagesSubTab === 'wages' ? 'Active' : 'Default'} onClick={() => setCrewFixedWagesSubTab('wages')} />
              <Tab label="Monthly Costs per Workers" variant="Container" size="S" status={crewFixedWagesSubTab === 'monthly-costs' ? 'Active' : 'Default'} onClick={() => setCrewFixedWagesSubTab('monthly-costs')} />
            </div>
            {crewFixedWagesSubTab === 'wages' && (
              <div className="study-page__container-tab-content">
                <NumberInput label="Annual Salary Increse (%)" value={crewFixedWages.annualSalaryIncrease} onChange={(v) => setCrewFixedWages(p => ({ ...p, annualSalaryIncrease: v }))} size="S" min={0} step={0.1} showLabel />
                <NumberInput label="Captain Gross Wage per Month ($)" value={crewFixedWages.captainGrossWage} onChange={(v) => setCrewFixedWages(p => ({ ...p, captainGrossWage: v }))} size="S" min={0} showLabel showInfo infoText="Exclude company charges" />
                <NumberInput label="Company Charges per Captain (%)" value={crewFixedWages.companyChargesCaptain} onChange={(v) => setCrewFixedWages(p => ({ ...p, companyChargesCaptain: v }))} size="S" min={0} showLabel showInfo infoText="Depends on the local taxation system" />
                <NumberInput label="First Officer Gross Wage per Month ($)" value={crewFixedWages.firstOfficerGrossWage} onChange={(v) => setCrewFixedWages(p => ({ ...p, firstOfficerGrossWage: v }))} size="S" min={0} showLabel showInfo infoText="Wage at the beginning of the project." />
                <NumberInput label="Company Charges per First Officer (%)" value={crewFixedWages.companyChargesFirstOfficer} onChange={(v) => setCrewFixedWages(p => ({ ...p, companyChargesFirstOfficer: v }))} size="S" min={0} showLabel showInfo infoText="As a percentage of the gross wage. Depends on the local taxation system" />
                <NumberInput label="Flight Crew Additional Salary If More Than 60h ($/H)" value={crewFixedWages.flightCrewAdditionalSalary} onChange={(v) => setCrewFixedWages(p => ({ ...p, flightCrewAdditionalSalary: v }))} size="S" min={0} showLabel />
                <NumberInput label="Cabin Crew Team Leader Wage Per Month ($)" value={crewFixedWages.cabinCrewTeamLeaderWage} onChange={(v) => setCrewFixedWages(p => ({ ...p, cabinCrewTeamLeaderWage: v }))} size="S" min={0} showLabel showInfo infoText="Wage at the beginning of the project." />
                <NumberInput label="Company Charges Per Cabin Crew Team Leader (%)" value={crewFixedWages.companyChargesCabinCrewTeamLeader} onChange={(v) => setCrewFixedWages(p => ({ ...p, companyChargesCabinCrewTeamLeader: v }))} size="S" min={0} showLabel showInfo infoText="As a percentage of the gross wage. Depends on the local taxation system" />
                <NumberInput label="Cabin Attendant Wage per Month ($)" value={crewFixedWages.cabinAttendantWage} onChange={(v) => setCrewFixedWages(p => ({ ...p, cabinAttendantWage: v }))} size="S" min={0} showLabel showInfo infoText="Wage at the beginning of the project." />
                <NumberInput label="Company Charges per Cabin Attendant (%)" value={crewFixedWages.companyChargesCabinAttendant} onChange={(v) => setCrewFixedWages(p => ({ ...p, companyChargesCabinAttendant: v }))} size="S" min={0} showLabel showInfo infoText="As a percentage of the gross wage. Depends on the local taxation system" />
                <NumberInput label="Cabin Crew Additional Salary If More Than 60h ($/H)" value={crewFixedWages.cabinCrewAdditionalSalary} onChange={(v) => setCrewFixedWages(p => ({ ...p, cabinCrewAdditionalSalary: v }))} size="S" min={0} showLabel />
              </div>
            )}
            {crewFixedWagesSubTab === 'monthly-costs' && (
              <div className="study-page__container-tab-content">
                <div className="study-page__table-scroll-wrapper">
                  <table className="study-page__computed-table">
                    <thead><tr><th></th>{monthLabels.map((label, i) => <th key={i}>{label}</th>)}</tr></thead>
                    <tbody>
                      {crewFixedWagesTableData.map((row, i) => (
                        <tr key={i}><td>{row.label}</td>{row.values.map((v, j) => <td key={j}>{formatCurrency(v)}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Variable Wages */}
          <div className="study-page__section">
            <div className="study-page__section-title-row">
              <h3 className="study-page__section-title">Variable Wages</h3>
            </div>
            <div className="study-page__container-tabs">
              <Tab label="Variable Wages" variant="Container" size="S" status={crewVariableWagesSubTab === 'wages' ? 'Active' : 'Default'} onClick={() => setCrewVariableWagesSubTab('wages')} />
              <Tab label="Wages Costs per Month" variant="Container" size="S" status={crewVariableWagesSubTab === 'monthly-costs' ? 'Active' : 'Default'} onClick={() => setCrewVariableWagesSubTab('monthly-costs')} />
            </div>
            {crewVariableWagesSubTab === 'wages' && (
              <div className="study-page__container-tab-content">
                <NumberInput label="Flight Crew Variable Pay per BH ($/H)" value={crewVariableWages.flightCrewVariablePay} onChange={(v) => setCrewVariableWages(p => ({ ...p, flightCrewVariablePay: v }))} size="S" min={0} showLabel />
                <NumberInput label="Cabin Crew Variable Pay per BH ($/H)" value={crewVariableWages.cabinCrewVariablePay} onChange={(v) => setCrewVariableWages(p => ({ ...p, cabinCrewVariablePay: v }))} size="S" min={0} showLabel />
              </div>
            )}
            {crewVariableWagesSubTab === 'monthly-costs' && (
              <div className="study-page__container-tab-content">
                <div className="study-page__table-scroll-wrapper">
                  <table className="study-page__computed-table">
                    <thead><tr><th></th><th>USD per Sector, excl. Company Charges</th>{monthLabels.map((label, i) => <th key={i}>{label}</th>)}</tr></thead>
                    <tbody>
                      {variableWagesTableData.map((row, i) => (
                        <tr key={i}><td>{row.label}</td><td>{formatCurrency(row.perSector)}</td>{row.values.map((v, j) => <td key={j}>{formatCurrency(v)}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Training Costs */}
          <div className="study-page__section">
            <div className="study-page__section-title-row">
              <h3 className="study-page__section-title">Training Costs</h3>
            </div>
            <div className="study-page__container-tabs">
              <Tab label="Training Cost" variant="Container" size="S" status={crewTrainingSubTab === 'wages' ? 'Active' : 'Default'} onClick={() => setCrewTrainingSubTab('wages')} />
              <Tab label="Training Costs per Month" variant="Container" size="S" status={crewTrainingSubTab === 'monthly-costs' ? 'Active' : 'Default'} onClick={() => setCrewTrainingSubTab('monthly-costs')} />
            </div>
            {crewTrainingSubTab === 'wages' && (
              <div className="study-page__container-tab-content">
                <NumberInput label="Operator Conversion course per flight crew ($)" value={crewTraining.operatorConversionCourse} onChange={(v) => setCrewTraining(p => ({ ...p, operatorConversionCourse: v }))} size="S" min={0} showLabel showInfo infoText="Pilot training for the airline. To be performed by each pilot crew once they join the airline" />
                <NumberInput label="Type rating Cost for non A/C type qualified pilots ($)" value={crewTraining.typeRatingCost} onChange={(v) => setCrewTraining(p => ({ ...p, typeRatingCost: v }))} size="S" min={0} showLabel showInfo infoText="Pilot training for pilots not qualified to fly a given A/C type." />
                <NumberInput label="Pilots already qualified for the A/C type (%)" value={crewTraining.pilotsAlreadyQualified} onChange={(v) => setCrewTraining(p => ({ ...p, pilotsAlreadyQualified: v }))} size="S" min={0} showLabel />
                <NumberInput label="Flight Crew Recurrent Training Cost per FC team ($/year)" value={crewTraining.flightCrewRecurrentTraining} onChange={(v) => setCrewTraining(p => ({ ...p, flightCrewRecurrentTraining: v }))} size="S" min={0} showLabel showInfo infoText="Captain + F/O + Instructor. Includes accommodation." />
                <NumberInput label="Cabin Crew Training Cost per Cabin Crew Member ($/year)" value={crewTraining.cabinCrewTrainingCost} onChange={(v) => setCrewTraining(p => ({ ...p, cabinCrewTrainingCost: v }))} size="S" min={0} showLabel showInfo infoText="Captain + F/O + Instructor. Includes accommodation." />
              </div>
            )}
            {crewTrainingSubTab === 'monthly-costs' && (
              <div className="study-page__container-tab-content">
                <div className="study-page__table-scroll-wrapper">
                  <table className="study-page__computed-table">
                    <thead><tr><th></th>{monthLabels.map((label, i) => <th key={i}>{label}</th>)}</tr></thead>
                    <tbody>
                      {trainingCostsTableData.map((row, i) => (
                        <tr key={i}><td>{row.label}</td>{row.values.map((v, j) => <td key={j}>{formatCurrency(v)}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {operationalCostTab === 'catering-costs' && (
        <div className="study-page__assumption-content">
          <h2 className="study-page__fleet-title">Catering Cost</h2>
          <div className="study-page__form-grid">
            <NumberInput label="Economy (Y) ($)" value={cateringCostEconomy} onChange={setCateringCostEconomy} size="S" min={0} showLabel />
            <NumberInput label="Business (C) ($)" value={cateringCostBusiness} onChange={setCateringCostBusiness} size="S" min={0} showLabel />
            <NumberInput label="Premium (W) ($)" value={cateringCostPremium} onChange={setCateringCostPremium} size="S" min={0} showLabel />
          </div>
        </div>
      )}

      {operationalCostTab === 'maintenance-costs' && (
        <div className="study-page__assumption-content">
          <h2 className="study-page__fleet-title">Maintenance Costs</h2>
          <div className="study-page__form-grid--wide study-page__form-grid">
            <NumberInput label="Indirect Maintenance Cost (%)" value={indirectMaintenanceCost} onChange={setIndirectMaintenanceCost} size="S" min={0} showLabel showInfo infoText="Percentage of direct maintenance cost" />
            <NumberInput label="Maintenance Outsourcing Cost ($)" value={maintenanceOutsourcingCost} onChange={setMaintenanceOutsourcingCost} size="S" min={0} showLabel showInfo infoText="Cost of outsourced maintenance" />
            <NumberInput label="Cost factor on LLPs due to harsh environment" value={llpCostFactor} onChange={setLlpCostFactor} size="S" min={0} showLabel showInfo infoText="Life Limited Parts cost adjustment factor" />
          </div>
        </div>
      )}

      {operationalCostTab === 'selling-distribution' && (
        <div className="study-page__assumption-content">
          <h2 className="study-page__fleet-title">Selling and distribution costs</h2>

          <div className="study-page__section">
            <div className="study-page__form-grid--wide study-page__form-grid">
              <NumberInput label="Initial Marketing budget ($)" value={initialMarketingBudget} onChange={setInitialMarketingBudget} size="S" min={0} showLabel />
            </div>
          </div>

          <div className="study-page__section">
            <div className="study-page__section-title-row">
              <h3 className="study-page__section-title">Selling and Distribution Cost per Pax ($/Pax)</h3>
            </div>
            <div className="study-page__form-grid">
              {sellingCostYearlyInputs.map(({ key, label, value }) => (
                <NumberInput key={key} label={label} value={value} onChange={(v) => setSellingCostPerPax(prev => ({ ...prev, [key]: v }))} size="S" min={0} showLabel />
              ))}
            </div>
          </div>

          <div className="study-page__section">
            <div className="study-page__section-title-row">
              <h3 className="study-page__section-title">Marketing and Communication Yearly Budget ($)</h3>
            </div>
            <div className="study-page__form-grid--wide study-page__form-grid">
              {marketingBudgetYearlyInputs.map(({ key, label, value }) => (
                <NumberInput key={key} label={label} value={value} onChange={(v) => setMarketingBudget(prev => ({ ...prev, [key]: v }))} size="S" min={0} showLabel />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
