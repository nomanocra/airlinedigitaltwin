import { useState, useEffect } from 'react';
import { Modal } from '@/design-system/composites/Modal';
import { Button } from '@/design-system/components/Button';
import { Combobox, ComboboxOption } from '@/design-system/components/Combobox';
import { Calendar } from '@/design-system/composites/Calendar';
import { Select } from '@/design-system/components/Select';
import './AddRouteModal.css';

const AIRPORT_OPTIONS: ComboboxOption[] = [
  { value: 'AMS', label: 'AMS - Amsterdam Schiphol' },
  { value: 'ATL', label: 'ATL - Atlanta Hartsfield-Jackson' },
  { value: 'BCN', label: 'BCN - Barcelona El Prat' },
  { value: 'BKK', label: 'BKK - Bangkok Suvarnabhumi' },
  { value: 'BOM', label: 'BOM - Mumbai Chhatrapati Shivaji' },
  { value: 'BOS', label: 'BOS - Boston Logan' },
  { value: 'CDG', label: 'CDG - Paris Charles de Gaulle' },
  { value: 'DEL', label: 'DEL - Delhi Indira Gandhi' },
  { value: 'DEN', label: 'DEN - Denver International' },
  { value: 'DFW', label: 'DFW - Dallas Fort Worth' },
  { value: 'DOH', label: 'DOH - Doha Hamad' },
  { value: 'DUB', label: 'DUB - Dublin Airport' },
  { value: 'DXB', label: 'DXB - Dubai International' },
  { value: 'EWR', label: 'EWR - Newark Liberty' },
  { value: 'FCO', label: 'FCO - Rome Fiumicino' },
  { value: 'FRA', label: 'FRA - Frankfurt am Main' },
  { value: 'GRU', label: 'GRU - São Paulo Guarulhos' },
  { value: 'HKG', label: 'HKG - Hong Kong International' },
  { value: 'HND', label: 'HND - Tokyo Haneda' },
  { value: 'IAD', label: 'IAD - Washington Dulles' },
  { value: 'IAH', label: 'IAH - Houston George Bush' },
  { value: 'ICN', label: 'ICN - Seoul Incheon' },
  { value: 'IST', label: 'IST - Istanbul Airport' },
  { value: 'JFK', label: 'JFK - New York John F. Kennedy' },
  { value: 'JNB', label: 'JNB - Johannesburg O.R. Tambo' },
  { value: 'KUL', label: 'KUL - Kuala Lumpur International' },
  { value: 'LAX', label: 'LAX - Los Angeles International' },
  { value: 'LGA', label: 'LGA - New York LaGuardia' },
  { value: 'LHR', label: 'LHR - London Heathrow' },
  { value: 'LIS', label: 'LIS - Lisbon Humberto Delgado' },
  { value: 'MAD', label: 'MAD - Madrid Barajas' },
  { value: 'MEX', label: 'MEX - Mexico City Benito Juárez' },
  { value: 'MIA', label: 'MIA - Miami International' },
  { value: 'MRS', label: 'MRS - Marseille Provence' },
  { value: 'MUC', label: 'MUC - Munich Franz Josef Strauss' },
  { value: 'NCE', label: 'NCE - Nice Côte d\'Azur' },
  { value: 'NRT', label: 'NRT - Tokyo Narita' },
  { value: 'ORD', label: 'ORD - Chicago O\'Hare' },
  { value: 'ORY', label: 'ORY - Paris Orly' },
  { value: 'PEK', label: 'PEK - Beijing Capital' },
  { value: 'PVG', label: 'PVG - Shanghai Pudong' },
  { value: 'SFO', label: 'SFO - San Francisco International' },
  { value: 'SIN', label: 'SIN - Singapore Changi' },
  { value: 'SYD', label: 'SYD - Sydney Kingsford Smith' },
  { value: 'TLS', label: 'TLS - Toulouse Blagnac' },
  { value: 'YUL', label: 'YUL - Montréal Trudeau' },
  { value: 'YYZ', label: 'YYZ - Toronto Pearson' },
  { value: 'ZRH', label: 'ZRH - Zurich Airport' },
];

export interface RouteEntry {
  id: string;
  origin: string;
  destination: string;
  startDate: Date;
  endDate: Date;
}

interface RelativeMonthOption {
  value: string;
  label: string;
}

interface AddRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRoute: (route: RouteEntry) => void;
  simulationStartDate?: Date;
  simulationEndDate?: Date;
  periodType?: 'dates' | 'duration';
  relativeMonthOptions?: RelativeMonthOption[];
}

export function AddRouteModal({
  isOpen,
  onClose,
  onAddRoute,
  simulationStartDate,
  simulationEndDate,
  periodType = 'dates',
  relativeMonthOptions = [],
}: AddRouteModalProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(simulationStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(simulationEndDate);

  // Reset state when modal closes, pre-fill dates when it opens
  useEffect(() => {
    if (isOpen) {
      setStartDate(simulationStartDate);
      setEndDate(simulationEndDate);
    } else {
      setOrigin('');
      setDestination('');
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, [isOpen, simulationStartDate, simulationEndDate]);

  const isValid = origin !== '' && destination !== '' && startDate && endDate;

  const handleAddRoute = () => {
    if (!isValid || !startDate || !endDate) return;

    const newRoute: RouteEntry = {
      id: `route-${Date.now()}`,
      origin,
      destination,
      startDate,
      endDate,
    };

    onAddRoute(newRoute);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Route"
      className="add-route-modal"
      footer={
        <>
          <Button label="CANCEL" variant="Ghost" size="M" onClick={onClose} />
          <Button
            label="ADD ROUTE"
            variant="Default"
            size="M"
            onClick={handleAddRoute}
            disabled={!isValid}
          />
        </>
      }
    >
      <div className="add-route-content">
        <div className="add-route-form">
          <Combobox
            label="Origin"
            placeholder="Search airport..."
            options={AIRPORT_OPTIONS}
            value={origin}
            onValueChange={setOrigin}
            size="M"
            showLeftIcon
            leftIcon="AIR_airport"
            state={origin === '' ? 'Error' : 'Default'}
            showLegend={origin === ''}
            legend="Required"
          />
          <Combobox
            label="Destination"
            placeholder="Search airport..."
            options={AIRPORT_OPTIONS}
            value={destination}
            onValueChange={setDestination}
            size="M"
            showLeftIcon
            leftIcon="AIR_airport"
            state={destination === '' ? 'Error' : 'Default'}
            showLegend={destination === ''}
            legend="Required"
          />
          {periodType === 'duration' ? (
            <Select
              label="Start Date"
              placeholder="Select"
              options={relativeMonthOptions}
              value={startDate ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}` : ''}
              onValueChange={(key) => {
                const [y, m] = key.split('-').map(Number);
                setStartDate(new Date(y, m - 1, 1));
              }}
              size="M"
              state={!startDate ? 'Error' : 'Default'}
              showLegend={!startDate}
              legend="Required"
            />
          ) : (
            <Calendar
              label="Start Date"
              placeholder="Select a month"
              mode="month"
              value={startDate}
              onChange={setStartDate}
              size="M"
              state={!startDate ? 'Error' : 'Default'}
              showLegend={!startDate}
              legend="Required"
              minDate={simulationStartDate}
              maxDate={simulationEndDate}
            />
          )}
          {periodType === 'duration' ? (
            <Select
              label="End Date"
              placeholder="Select"
              options={relativeMonthOptions}
              value={endDate ? `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}` : ''}
              onValueChange={(key) => {
                const [y, m] = key.split('-').map(Number);
                setEndDate(new Date(y, m - 1, 1));
              }}
              size="M"
              state={!endDate ? 'Error' : 'Default'}
              showLegend={!endDate}
              legend="Required"
            />
          ) : (
            <Calendar
              label="End Date"
              placeholder="Select a month"
              mode="month"
              value={endDate}
              onChange={setEndDate}
              size="M"
              state={!endDate ? 'Error' : 'Default'}
              showLegend={!endDate}
              legend="Required"
              minDate={startDate || simulationStartDate}
              maxDate={simulationEndDate}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default AddRouteModal;
