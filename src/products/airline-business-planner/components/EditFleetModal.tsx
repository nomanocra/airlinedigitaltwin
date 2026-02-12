import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/design-system/composites/Modal';
import { Button } from '@/design-system/components/Button';
import { NumberInput } from '@/design-system/components/NumberInput';
import { Calendar } from '@/design-system/composites/Calendar';
import { Select, SelectOption } from '@/design-system/components/Select';
import './EditFleetModal.css';

const OWNERSHIP_OPTIONS: SelectOption[] = [
  { value: 'Owned', label: 'Owned' },
  { value: 'Leased', label: 'Leased' },
];

export interface FleetEntryForEdit {
  id: string;
  numberOfAircraft: number;
  enterInService: Date;
  retirement?: Date;
  ownership: 'Owned' | 'Leased';
}

interface RelativeMonthOption {
  value: string;
  label: string;
}

interface EditFleetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Omit<FleetEntryForEdit, 'id'>>) => void;
  selectedEntries: FleetEntryForEdit[];
  simulationStartDate?: Date;
  simulationEndDate?: Date;
  periodType?: 'dates' | 'duration';
  relativeMonthOptions?: RelativeMonthOption[];
}

function checkUniformValue<T>(entries: FleetEntryForEdit[], getter: (e: FleetEntryForEdit) => T): { isUniform: boolean; value: T | undefined } {
  if (entries.length === 0) return { isUniform: false, value: undefined };
  const firstValue = getter(entries[0]);
  const allSame = entries.every((entry) => {
    const val = getter(entry);
    if (val instanceof Date && firstValue instanceof Date) {
      return val.getTime() === firstValue.getTime();
    }
    return val === firstValue;
  });
  return { isUniform: allSame, value: allSame ? firstValue : undefined };
}

export function EditFleetModal({
  isOpen,
  onClose,
  onSave,
  selectedEntries,
  simulationStartDate,
  simulationEndDate,
  periodType = 'dates',
  relativeMonthOptions = [],
}: EditFleetModalProps) {
  // Determine if values are uniform across selection
  const numberOfAircraftCheck = useMemo(
    () => checkUniformValue(selectedEntries, (e) => e.numberOfAircraft),
    [selectedEntries]
  );
  const enterInServiceCheck = useMemo(
    () => checkUniformValue(selectedEntries, (e) => e.enterInService),
    [selectedEntries]
  );
  const retirementCheck = useMemo(
    () => checkUniformValue(selectedEntries, (e) => e.retirement),
    [selectedEntries]
  );
  const ownershipCheck = useMemo(
    () => checkUniformValue(selectedEntries, (e) => e.ownership),
    [selectedEntries]
  );

  // Form state - undefined means "multiple values" / no change
  const [numberOfAircraft, setNumberOfAircraft] = useState<number | undefined>(undefined);
  const [enterInService, setEnterInService] = useState<Date | undefined>(undefined);
  const [retirement, setRetirement] = useState<Date | undefined>(undefined);
  const [ownership, setOwnership] = useState<string>('');

  // Track if user has modified each field
  const [numberOfAircraftModified, setNumberOfAircraftModified] = useState(false);
  const [enterInServiceModified, setEnterInServiceModified] = useState(false);
  const [retirementModified, setRetirementModified] = useState(false);
  const [ownershipModified, setOwnershipModified] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setNumberOfAircraft(numberOfAircraftCheck.value);
      setEnterInService(enterInServiceCheck.value);
      setRetirement(retirementCheck.value);
      setOwnership(ownershipCheck.value ?? '');
      setNumberOfAircraftModified(false);
      setEnterInServiceModified(false);
      setRetirementModified(false);
      setOwnershipModified(false);
    }
  }, [isOpen, numberOfAircraftCheck, enterInServiceCheck, retirementCheck, ownershipCheck]);

  const handleSave = () => {
    const updates: Partial<Omit<FleetEntryForEdit, 'id'>> = {};

    if (numberOfAircraftModified && numberOfAircraft !== undefined) {
      updates.numberOfAircraft = numberOfAircraft;
    }
    if (enterInServiceModified && enterInService !== undefined) {
      updates.enterInService = enterInService;
    }
    if (retirementModified) {
      updates.retirement = retirement;
    }
    if (ownershipModified && ownership !== '') {
      updates.ownership = ownership as 'Owned' | 'Leased';
    }

    onSave(updates);
    onClose();
  };

  // Check if at least one field has been modified with a valid value
  const hasValidChanges =
    (numberOfAircraftModified && numberOfAircraft !== undefined && numberOfAircraft > 0) ||
    (enterInServiceModified && enterInService !== undefined) ||
    retirementModified ||
    (ownershipModified && ownership !== '');

  const count = selectedEntries.length;
  const title = `Edit ${count} Aircraft`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="edit-fleet-modal"
      footer={
        <>
          <Button label="CANCEL" variant="Ghost" size="M" onClick={onClose} />
          <Button
            label="SAVE CHANGES"
            variant="Default"
            size="M"
            onClick={handleSave}
            disabled={!hasValidChanges}
          />
        </>
      }
    >
      <div className="edit-fleet-content">
        <div className="edit-fleet-form">
          <NumberInput
            label="Number of Aircraft"
            value={numberOfAircraft}
            onChange={(val) => {
              setNumberOfAircraft(val);
              setNumberOfAircraftModified(true);
            }}
            min={1}
            size="M"
            placeholder={!numberOfAircraftCheck.isUniform ? 'Multiple values' : '1'}
          />
          {periodType === 'duration' ? (
            <Select
              label="Enter in Service"
              placeholder={!enterInServiceCheck.isUniform ? 'Multiple values' : 'Select'}
              options={relativeMonthOptions}
              value={enterInService ? `${enterInService.getFullYear()}-${String(enterInService.getMonth() + 1).padStart(2, '0')}` : ''}
              onValueChange={(key) => {
                const [y, m] = key.split('-').map(Number);
                setEnterInService(new Date(y, m - 1, 1));
                setEnterInServiceModified(true);
              }}
              size="M"
            />
          ) : (
            <Calendar
              label="Enter in Service"
              placeholder={!enterInServiceCheck.isUniform ? 'Multiple values' : 'Select a month'}
              mode="month"
              value={enterInService}
              onChange={(val) => {
                setEnterInService(val);
                setEnterInServiceModified(true);
              }}
              size="M"
              minDate={simulationStartDate}
              maxDate={simulationEndDate}
            />
          )}
          {periodType === 'duration' ? (
            <Select
              label="Retirement"
              placeholder={!retirementCheck.isUniform ? 'Multiple values' : (retirementCheck.value === undefined ? 'None' : 'Select')}
              options={relativeMonthOptions}
              value={retirement ? `${retirement.getFullYear()}-${String(retirement.getMonth() + 1).padStart(2, '0')}` : ''}
              onValueChange={(key) => {
                if (key) {
                  const [y, m] = key.split('-').map(Number);
                  setRetirement(new Date(y, m - 1, 1));
                } else {
                  setRetirement(undefined);
                }
                setRetirementModified(true);
              }}
              size="M"
              showOptional
            />
          ) : (
            <Calendar
              label="Retirement"
              placeholder={!retirementCheck.isUniform ? 'Multiple values' : (retirementCheck.value === undefined ? 'None' : 'Select a month')}
              mode="month"
              value={retirement}
              onChange={(val) => {
                setRetirement(val);
                setRetirementModified(true);
              }}
              size="M"
              minDate={enterInService || simulationStartDate}
              maxDate={simulationEndDate}
              showOptional
            />
          )}
          <Select
            label="Ownership"
            placeholder={!ownershipCheck.isUniform ? 'Multiple values' : 'Select...'}
            options={OWNERSHIP_OPTIONS}
            value={ownership}
            onValueChange={(val) => {
              setOwnership(val);
              setOwnershipModified(true);
            }}
            size="M"
          />
        </div>
      </div>
    </Modal>
  );
}

export default EditFleetModal;
