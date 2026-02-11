import { useState, useEffect } from 'react';
import { Modal } from '@/design-system/composites/Modal';
import { Button } from '@/design-system/components/Button';
import { Combobox } from '@/design-system/components/Combobox';
import { Select } from '@/design-system/components/Select';
import type { FleetEntry } from './AddAircraftModal';
import './ImportAirlineFleetModal.css';

// Sample airlines (ICAO - IATA - Name)
const AIRLINE_OPTIONS = [
  { value: 'AFR', label: 'AFR - AF - Air France' },
  { value: 'BAW', label: 'BAW - BA - British Airways' },
  { value: 'DLH', label: 'DLH - LH - Lufthansa' },
  { value: 'UAE', label: 'UAE - EK - Emirates' },
  { value: 'QTR', label: 'QTR - QR - Qatar Airways' },
  { value: 'SIA', label: 'SIA - SQ - Singapore Airlines' },
  { value: 'AAL', label: 'AAL - AA - American Airlines' },
  { value: 'DAL', label: 'DAL - DL - Delta Air Lines' },
  { value: 'UAL', label: 'UAL - UA - United Airlines' },
  { value: 'ETH', label: 'ETH - ET - Ethiopian Airlines' },
  { value: 'RAM', label: 'RAM - AT - Royal Air Maroc' },
  { value: 'THY', label: 'THY - TK - Turkish Airlines' },
  { value: 'KLM', label: 'KLM - KL - KLM Royal Dutch Airlines' },
  { value: 'EZY', label: 'EZY - U2 - easyJet' },
  { value: 'RYR', label: 'RYR - FR - Ryanair' },
  { value: 'CPA', label: 'CPA - CX - Cathay Pacific' },
  { value: 'ANA', label: 'ANA - NH - All Nippon Airways' },
  { value: 'JAL', label: 'JAL - JL - Japan Airlines' },
  { value: 'QFA', label: 'QFA - QF - Qantas' },
  { value: 'TAP', label: 'TAP - TP - TAP Air Portugal' },
];

// Year options (2005-2025)
const YEAR_OPTIONS = Array.from({ length: 21 }, (_, i) => {
  const year = 2005 + i;
  return { value: String(year), label: String(year) };
});

// Month options
const MONTH_OPTIONS = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
];

interface ImportAirlineFleetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFleet: (entries: FleetEntry[]) => void;
  periodStartDate?: Date;
  periodEndDate?: Date;
}

export function ImportAirlineFleetModal({ isOpen, onClose, onImportFleet, periodStartDate, periodEndDate }: ImportAirlineFleetModalProps) {
  const [airline, setAirline] = useState('');
  const [year, setYear] = useState('2024');
  const [month, setMonth] = useState('01');

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAirline('');
      setYear('2024');
      setMonth('01');
    }
  }, [isOpen]);

  const handleImport = () => {
    const periodStart = periodStartDate ? new Date(periodStartDate) : new Date();
    const periodEnd = periodEndDate ? new Date(periodEndDate) : undefined;

    const entries: FleetEntry[] = [
      {
        id: `import-${Date.now()}-1`,
        aircraftType: 'A321neo',
        engine: 'CFM LEAP-1A',
        layout: 'Y220',
        numberOfAircraft: 4,
        enterInService: new Date(periodStart),
        retirement: periodEnd ? new Date(periodEnd) : undefined,
        ownership: 'Leased',
      },
      {
        id: `import-${Date.now()}-2`,
        aircraftType: 'A320-200',
        engine: 'CFM56-5A',
        layout: 'F12 Y138',
        numberOfAircraft: 3,
        enterInService: new Date(periodStart),
        retirement: periodEnd ? new Date(periodEnd) : undefined,
        ownership: 'Owned',
      },
      {
        id: `import-${Date.now()}-3`,
        aircraftType: 'A319',
        engine: 'CFM56-5B',
        layout: 'Y144',
        numberOfAircraft: 4,
        enterInService: new Date(periodStart),
        retirement: periodEnd ? new Date(periodEnd) : undefined,
        ownership: 'Leased',
      },
      {
        id: `import-${Date.now()}-4`,
        aircraftType: 'B737-800',
        engine: 'CFM56-7B',
        layout: 'Y189',
        numberOfAircraft: 3,
        enterInService: new Date(periodStart),
        retirement: periodEnd ? new Date(periodEnd) : undefined,
        ownership: 'Owned',
      },
    ];

    onImportFleet(entries);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Airline Fleet"
      className="import-airline-fleet-modal"
      footer={
        <>
          <Button label="CANCEL" variant="Ghost" size="M" onClick={onClose} />
          <Button
            label="IMPORT FLEET"
            variant="Default"
            size="M"
            onClick={handleImport}
            disabled={!airline}
          />
        </>
      }
    >
      <div className="import-airline-fleet-modal__content">
        <Combobox
          label="Airline"
          placeholder="Search airline (ICAO, IATA, name)..."
          options={AIRLINE_OPTIONS}
          value={airline}
          onValueChange={setAirline}
          size="M"
          showLeftIcon
          leftIcon="search"
        />
        <div className="import-airline-fleet-modal__row">
          <Select
            label="Year"
            options={YEAR_OPTIONS}
            value={year}
            onValueChange={setYear}
            size="M"
          />
          <Select
            label="Month"
            options={MONTH_OPTIONS}
            value={month}
            onValueChange={setMonth}
            size="M"
          />
        </div>
      </div>
    </Modal>
  );
}

export default ImportAirlineFleetModal;
