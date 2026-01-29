import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Icon } from '@/design-system/components/Icon';
import './DateInput.css';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface DateInputProps {
  label: string;
  placeholder?: string;
  value?: string; // "MMM YYYY" format, e.g. "Jan 2026"
  onChange?: (value: string) => void;
  size?: 'M' | 'S';
}

export function DateInput({
  label,
  placeholder = 'Select a month',
  value,
  onChange,
  size = 'M',
}: DateInputProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    if (value) {
      const parts = value.split(' ');
      return parseInt(parts[1]) || new Date().getFullYear();
    }
    return new Date().getFullYear();
  });

  // Parse selected month/year from value
  const selectedMonth = value ? MONTHS.indexOf(value.split(' ')[0]) : -1;
  const selectedYear = value ? parseInt(value.split(' ')[1]) : -1;

  const handleSelectMonth = (monthIndex: number) => {
    const formatted = `${MONTHS[monthIndex]} ${viewYear}`;
    onChange?.(formatted);
    setOpen(false);
  };

  return (
    <div className="text-input-container">
      {/* Label */}
      <div className="text-input-label-container">
        <label className="text-input-label">{label}</label>
      </div>

      {/* Input with Popover */}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button type="button" className={`text-input-wrapper text-input-wrapper--${size.toLowerCase()} date-input-trigger`}>
            <span className={`text-input-field${!value ? ' text-input-field--placeholder' : ''}`}
              style={{
                textAlign: 'left',
                color: value ? 'var(--text-main, #14171d)' : 'var(--text-secondary, #63728a)',
              }}
            >
              {value || placeholder}
            </span>
            <span className="text-input-icon">
              <Icon name="calendar_today" size={16} color="var(--text-secondary, #63728a)" />
            </span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content className="date-input-popover" sideOffset={4} align="start">
            {/* Year navigation */}
            <div className="date-input-popover__nav">
              <button
                type="button"
                className="date-input-popover__nav-btn"
                onClick={() => setViewYear((y) => y - 1)}
              >
                <Icon name="chevron_left" size={20} color="var(--text-secondary, #63728a)" />
              </button>
              <span className="date-input-popover__year">{viewYear}</span>
              <button
                type="button"
                className="date-input-popover__nav-btn"
                onClick={() => setViewYear((y) => y + 1)}
              >
                <Icon name="chevron_right" size={20} color="var(--text-secondary, #63728a)" />
              </button>
            </div>

            {/* Month grid */}
            <div className="date-input-popover__grid">
              {MONTH_FULL.map((monthName, idx) => {
                const isSelected = idx === selectedMonth && viewYear === selectedYear;
                return (
                  <button
                    key={monthName}
                    type="button"
                    className={`date-input-popover__month${isSelected ? ' date-input-popover__month--selected' : ''}`}
                    onClick={() => handleSelectMonth(idx)}
                  >
                    {monthName}
                  </button>
                );
              })}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

export default DateInput;
