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

interface EditFleetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Omit<FleetEntryForEdit, 'id'>>) => void;
  selectedEntries: FleetEntryForEdit[];
  simulationStartDate?: Date;
  simulationEndDate?: Date;
}

function getUniformValue<T>(entries: FleetEntryForEdit[], getter: (e: FleetEntryForEdit) => T): T | undefined {
  if (entries.length === 0) return undefined;
  const firstValue = getter(entries[0]);
  const allSame = entries.every((entry) => {
    const val = getter(entry);
    if (val instanceof Date && firstValue instanceof Date) {
      return val.getTime() === firstValue.getTime();
    }
    return val === firstValue;
  });
  return allSame ? firstValue : undefined;
}

export function EditFleetModal({
  isOpen,
  onClose,
  onSave,
  selectedEntries,
  simulationStartDate,
  simulationEndDate,
}: EditFleetModalProps) {
  // Determine if values are uniform across selection
  const uniformNumberOfAircraft = useMemo(
    () => getUniformValue(selectedEntries, (e) => e.numberOfAircraft),
    [selectedEntries]
  );
  const uniformEnterInService = useMemo(
    () => getUniformValue(selectedEntries, (e) => e.enterInService),
    [selectedEntries]
  );
  const uniformRetirement = useMemo(
    () => getUniformValue(selectedEntries, (e) => e.retirement),
    [selectedEntries]
  );
  const uniformOwnership = useMemo(
    () => getUniformValue(selectedEntries, (e) => e.ownership),
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
      setNumberOfAircraft(uniformNumberOfAircraft);
      setEnterInService(uniformEnterInService);
      setRetirement(uniformRetirement);
      setOwnership(uniformOwnership ?? '');
      setNumberOfAircraftModified(false);
      setEnterInServiceModified(false);
      setRetirementModified(false);
      setOwnershipModified(false);
    }
  }, [isOpen, uniformNumberOfAircraft, uniformEnterInService, uniformRetirement, uniformOwnership]);

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
            placeholder={uniformNumberOfAircraft === undefined ? 'Multiple values' : '1'}
          />
          <Calendar
            label="Enter in Service"
            placeholder={uniformEnterInService === undefined ? 'Multiple values' : 'Select a month'}
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
          <Calendar
            label="Retirement"
            placeholder={uniformRetirement === undefined ? 'Multiple values' : 'Select a month'}
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
          <Select
            label="Ownership"
            placeholder={uniformOwnership === undefined ? 'Multiple values' : 'Select...'}
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
