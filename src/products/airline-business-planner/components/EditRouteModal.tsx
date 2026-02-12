import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/design-system/composites/Modal';
import { Button } from '@/design-system/components/Button';
import { Calendar } from '@/design-system/composites/Calendar';
import { Select } from '@/design-system/components/Select';
import './EditRouteModal.css';

export interface RouteEntryForEdit {
  id: string;
  startDate: Date;
  endDate: Date;
}

interface RelativeMonthOption {
  value: string;
  label: string;
}

interface EditRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Omit<RouteEntryForEdit, 'id'>>) => void;
  selectedEntries: RouteEntryForEdit[];
  simulationStartDate?: Date;
  simulationEndDate?: Date;
  periodType?: 'dates' | 'duration';
  relativeMonthOptions?: RelativeMonthOption[];
}

function getUniformDateValue(entries: RouteEntryForEdit[], getter: (e: RouteEntryForEdit) => Date): Date | undefined {
  if (entries.length === 0) return undefined;
  const firstValue = getter(entries[0]);
  const allSame = entries.every((entry) => {
    const val = getter(entry);
    return val.getTime() === firstValue.getTime();
  });
  return allSame ? firstValue : undefined;
}

export function EditRouteModal({
  isOpen,
  onClose,
  onSave,
  selectedEntries,
  simulationStartDate,
  simulationEndDate,
  periodType = 'dates',
  relativeMonthOptions = [],
}: EditRouteModalProps) {
  // Determine if values are uniform across selection
  const uniformStartDate = useMemo(
    () => getUniformDateValue(selectedEntries, (e) => e.startDate),
    [selectedEntries]
  );
  const uniformEndDate = useMemo(
    () => getUniformDateValue(selectedEntries, (e) => e.endDate),
    [selectedEntries]
  );

  // Form state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Track if user has modified each field
  const [startDateModified, setStartDateModified] = useState(false);
  const [endDateModified, setEndDateModified] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStartDate(uniformStartDate);
      setEndDate(uniformEndDate);
      setStartDateModified(false);
      setEndDateModified(false);
    }
  }, [isOpen, uniformStartDate, uniformEndDate]);

  const handleSave = () => {
    const updates: Partial<Omit<RouteEntryForEdit, 'id'>> = {};

    if (startDateModified && startDate !== undefined) {
      updates.startDate = startDate;
    }
    if (endDateModified && endDate !== undefined) {
      updates.endDate = endDate;
    }

    onSave(updates);
    onClose();
  };

  // Check if at least one field has been modified with a valid value
  const hasValidChanges =
    (startDateModified && startDate !== undefined) ||
    (endDateModified && endDate !== undefined);

  const count = selectedEntries.length;
  const title = `Edit ${count} Route${count > 1 ? 's' : ''}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="edit-route-modal"
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
      <div className="edit-route-content">
        <div className="edit-route-form">
          {periodType === 'duration' ? (
            <Select
              label="Start Date"
              placeholder={uniformStartDate === undefined ? 'Multiple values' : 'Select'}
              options={relativeMonthOptions}
              value={startDate ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}` : ''}
              onValueChange={(key) => {
                const [y, m] = key.split('-').map(Number);
                setStartDate(new Date(y, m - 1, 1));
                setStartDateModified(true);
              }}
              size="M"
            />
          ) : (
            <Calendar
              label="Start Date"
              placeholder={uniformStartDate === undefined ? 'Multiple values' : 'Select a month'}
              mode="month"
              value={startDate}
              onChange={(val) => {
                setStartDate(val);
                setStartDateModified(true);
              }}
              size="M"
              minDate={simulationStartDate}
              maxDate={simulationEndDate}
            />
          )}
          {periodType === 'duration' ? (
            <Select
              label="End Date"
              placeholder={uniformEndDate === undefined ? 'Multiple values' : 'Select'}
              options={relativeMonthOptions}
              value={endDate ? `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}` : ''}
              onValueChange={(key) => {
                const [y, m] = key.split('-').map(Number);
                setEndDate(new Date(y, m - 1, 1));
                setEndDateModified(true);
              }}
              size="M"
            />
          ) : (
            <Calendar
              label="End Date"
              placeholder={uniformEndDate === undefined ? 'Multiple values' : 'Select a month'}
              mode="month"
              value={endDate}
              onChange={(val) => {
                setEndDate(val);
                setEndDateModified(true);
              }}
              size="M"
              minDate={startDate || simulationStartDate}
              maxDate={simulationEndDate}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default EditRouteModal;
