// @ts-ignore - React import needed for JSX in non-TypeScript projects
import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { TextInput, type TextInputSize, type TextInputState } from '../components/TextInput';
import { IconButton } from '../components/IconButton';
import './Calendar.css';

export type CalendarMode = 'date' | 'month';

type CalendarView = 'days' | 'months' | 'years';

export interface CalendarProps {
  /**
   * Label of the input
   */
  label?: string;
  /**
   * Helper text displayed below the input
   */
  legend?: string;
  /**
   * Size of the input
   * @default 'M'
   */
  size?: TextInputSize;
  /**
   * Validation state
   * @default 'Default'
   */
  state?: TextInputState;
  /**
   * Show the label
   * @default true
   */
  showLabel?: boolean;
  /**
   * Show the legend
   * @default false
   */
  showLegend?: boolean;
  /**
   * Show "(Optional)" after the label
   * @default false
   */
  showOptional?: boolean;
  /**
   * Show the info icon with tooltip
   * @default false
   */
  showInfo?: boolean;
  /**
   * Tooltip text for the info icon
   */
  infoText?: string;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether the input is read-only
   * @default false
   */
  readOnly?: boolean;
  /**
   * Picker mode: 'date' for day selection, 'month' for month+year selection
   * @default 'date'
   */
  mode?: CalendarMode;
  /**
   * Selected date value
   */
  value?: Date;
  /**
   * Callback when the value changes
   */
  onChange?: (date: Date) => void;
  /**
   * Minimum selectable date
   */
  minDate?: Date;
  /**
   * Maximum selectable date
   */
  maxDate?: Date;
  /**
   * Default date to display when the calendar opens with no value selected.
   * Defaults to today.
   */
  defaultDate?: Date;
  /**
   * Controlled open state
   */
  open?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Additional CSS class
   */
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const YEAR_MIN = 1990;
const YEAR_MAX = 2040;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatMonth(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${year}`;
}

function formatHeaderDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = days[date.getDay()];
  const monthName = MONTH_NAMES_SHORT[date.getMonth()];
  return `${dayName}, ${monthName} ${date.getDate()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function parseDate(text: string): Date | null {
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > getDaysInMonth(year, month - 1)) return null;
  return new Date(year, month - 1, day);
}

function parseMonth(text: string): Date | null {
  const match = text.match(/^(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);
  if (month < 1 || month > 12) return null;
  return new Date(year, month - 1, 1);
}

/**
 * Calendar Component
 *
 * Date and month picker with TextInput trigger and calendar dropdown.
 *
 * @example
 * ```tsx
 * // Date picker
 * <Calendar
 *   label="Start date"
 *   mode="date"
 *   value={date}
 *   onChange={setDate}
 * />
 *
 * // Month picker
 * <Calendar
 *   label="Period"
 *   mode="month"
 *   value={month}
 *   onChange={setMonth}
 * />
 * ```
 */
export function Calendar({
  label = 'Label',
  legend = 'Legend',
  size = 'M',
  state = 'Default',
  showLabel = true,
  showLegend = false,
  showOptional = false,
  showInfo = false,
  infoText = '',
  placeholder,
  disabled = false,
  readOnly = false,
  mode = 'date',
  value,
  onChange,
  minDate,
  maxDate,
  defaultDate,
  open: controlledOpen,
  onOpenChange,
  className = '',
}: CalendarProps) {
  // Popover state
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  // Calendar navigation state
  const today = new Date();
  const initialDate = value || defaultDate || today;
  const [displayMonth, setDisplayMonth] = useState(initialDate.getMonth());
  const [displayYear, setDisplayYear] = useState(initialDate.getFullYear());
  const [currentView, setCurrentView] = useState<CalendarView>(mode === 'month' ? 'months' : 'days');
  const [previousView, setPreviousView] = useState<CalendarView>(mode === 'month' ? 'months' : 'days');

  // Manual input state
  const [inputText, setInputText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const yearListRef = useRef<HTMLDivElement>(null);

  // Reset view when popover opens
  useEffect(() => {
    if (isOpen) {
      setCurrentView(mode === 'month' ? 'months' : 'days');
      const target = value || defaultDate || today;
      setDisplayMonth(target.getMonth());
      setDisplayYear(target.getFullYear());
    }
  }, [isOpen, mode, value, defaultDate]);

  // Auto-scroll year list to selected year
  useEffect(() => {
    if (currentView === 'years' && yearListRef.current) {
      const selectedYearEl = yearListRef.current.querySelector('.calendar-year--selected');
      if (selectedYearEl) {
        selectedYearEl.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
    }
  }, [currentView]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const handlePrevYear = () => {
    setDisplayYear(displayYear - 1);
  };

  const handleNextYear = () => {
    setDisplayYear(displayYear + 1);
  };

  // Selection handlers
  const handleDaySelect = (day: number) => {
    const selected = new Date(displayYear, displayMonth, day);
    onChange?.(selected);
    handleOpenChange(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    if (mode === 'month') {
      const selected = new Date(displayYear, monthIndex, 1);
      onChange?.(selected);
      handleOpenChange(false);
    } else {
      setDisplayMonth(monthIndex);
      setCurrentView('days');
    }
  };

  const handleYearSelect = (year: number) => {
    setDisplayYear(year);
    setCurrentView(previousView);
  };

  const handleYearClick = () => {
    setPreviousView(currentView);
    setCurrentView('years');
  };

  // Date validation
  const isDayDisabled = useCallback((day: number): boolean => {
    const date = new Date(displayYear, displayMonth, day);
    if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
    return false;
  }, [displayYear, displayMonth, minDate, maxDate]);

  const isMonthDisabled = useCallback((monthIndex: number): boolean => {
    if (minDate && (displayYear < minDate.getFullYear() || (displayYear === minDate.getFullYear() && monthIndex < minDate.getMonth()))) return true;
    if (maxDate && (displayYear > maxDate.getFullYear() || (displayYear === maxDate.getFullYear() && monthIndex > maxDate.getMonth()))) return true;
    return false;
  }, [displayYear, minDate, maxDate]);

  // Display value
  const formattedValue = value
    ? (mode === 'date' ? formatDate(value) : formatMonth(value))
    : '';

  const displayValue = isEditing ? inputText : formattedValue;

  const defaultPlaceholder = placeholder || (mode === 'date' ? 'dd/mm/yyyy' : 'mm/yyyy');

  // Manual input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const raw = e.target.value;
    setIsEditing(true);
    setInputText(raw);
  };

  const commitInput = () => {
    if (!isEditing) return;
    setIsEditing(false);
    if (inputText === '') return;
    const parsed = mode === 'date' ? parseDate(inputText) : parseMonth(inputText);
    if (parsed) {
      if (minDate && parsed < minDate) { setInputText(''); return; }
      if (maxDate && parsed > maxDate) { setInputText(''); return; }
      onChange?.(parsed);
    } else {
      setInputText('');
    }
  };

  const handleInputBlur = () => {
    commitInput();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitInput();
    }
  };

  // Build day grid
  const renderDaysGrid = () => {
    const daysInMonth = getDaysInMonth(displayYear, displayMonth);
    const firstDay = getFirstDayOfMonth(displayYear, displayMonth);
    const rows: React.ReactNode[] = [];
    let cells: React.ReactNode[] = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(
        <div key={`empty-${i}`} className="calendar-day calendar-day--empty" />
      );
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(displayYear, displayMonth, day);
      const isSelected = value && isSameDay(date, value);
      const isDisabled = isDayDisabled(day);

      const dayClasses = [
        'calendar-day',
        isSelected && 'calendar-day--selected',
        isDisabled && 'calendar-day--disabled',
      ].filter(Boolean).join(' ');

      cells.push(
        <button
          key={day}
          type="button"
          className={dayClasses}
          onClick={() => !isDisabled && handleDaySelect(day)}
          disabled={isDisabled}
          tabIndex={-1}
        >
          {day}
        </button>
      );

      if ((firstDay + day) % 7 === 0 || day === daysInMonth) {
        rows.push(
          <div key={`row-${rows.length}`} className="calendar-day-row">
            {cells}
          </div>
        );
        cells = [];
      }
    }

    return rows;
  };

  // Build month grid
  const renderMonthsGrid = () => {
    const rows: React.ReactNode[] = [];
    for (let row = 0; row < 4; row++) {
      const cells: React.ReactNode[] = [];
      for (let col = 0; col < 3; col++) {
        const monthIndex = row * 3 + col;
        const isSelected = value && value.getFullYear() === displayYear && value.getMonth() === monthIndex;
        const isDisabled = isMonthDisabled(monthIndex);

        const monthClasses = [
          'calendar-month-cell',
          isSelected && 'calendar-month-cell--selected',
          isDisabled && 'calendar-month-cell--disabled',
        ].filter(Boolean).join(' ');

        cells.push(
          <button
            key={monthIndex}
            type="button"
            className={monthClasses}
            onClick={() => !isDisabled && handleMonthSelect(monthIndex)}
            disabled={isDisabled}
            tabIndex={-1}
          >
            {MONTH_NAMES_SHORT[monthIndex]}
          </button>
        );
      }
      rows.push(
        <div key={`month-row-${row}`} className="calendar-month-row">
          {cells}
        </div>
      );
    }
    return rows;
  };

  // Navigation boundary checks
  const yearMin = minDate ? minDate.getFullYear() : YEAR_MIN;
  const yearMax = maxDate ? maxDate.getFullYear() : YEAR_MAX;

  const canGoPrevMonth = !(minDate && displayYear === yearMin && displayMonth <= minDate.getMonth());
  const canGoNextMonth = !(maxDate && displayYear === yearMax && displayMonth >= maxDate.getMonth());
  const canGoPrevYear = displayYear > yearMin;
  const canGoNextYear = displayYear < yearMax;

  // Build year list
  const renderYearList = () => {
    const years: React.ReactNode[] = [];
    for (let year = yearMin; year <= yearMax; year++) {
      const isSelected = year === displayYear;
      const yearClasses = [
        'calendar-year',
        isSelected && 'calendar-year--selected',
      ].filter(Boolean).join(' ');

      years.push(
        <button
          key={year}
          type="button"
          className={yearClasses}
          onClick={() => handleYearSelect(year)}
          tabIndex={-1}
        >
          {year}
        </button>
      );
    }
    return years;
  };

  // Header date display
  const headerFallback = defaultDate || today;
  const headerYear = value ? value.getFullYear() : displayYear;
  const headerDate = value
    ? (mode === 'date' ? formatHeaderDate(value) : `${MONTH_NAMES_SHORT[value.getMonth()]} ${value.getFullYear()}`)
    : (mode === 'date' ? formatHeaderDate(headerFallback) : `${MONTH_NAMES_SHORT[headerFallback.getMonth()]} ${headerFallback.getFullYear()}`);

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <div className={`calendar-container ${className}`}>
        <Popover.Anchor asChild>
          <div
            className="calendar-trigger-wrapper"
            onClick={() => {
              if (readOnly && !disabled) {
                handleOpenChange(!isOpen);
              }
            }}
            style={readOnly && !disabled ? { cursor: 'pointer' } : undefined}
          >
            <TextInput
              label={label}
              legend={legend}
              size={size}
              state={state}
              showLabel={showLabel}
              showLegend={showLegend}
              showOptional={showOptional}
              showInfo={showInfo}
              infoText={infoText}
              placeholder={defaultPlaceholder}
              value={displayValue}
              readOnly={readOnly}
              disabled={disabled}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              showRightIconButton
              rightIconButton="event"
              onRightIconButtonClick={(e) => {
                e.preventDefault();
                if (!disabled) {
                  handleOpenChange(!isOpen);
                }
              }}
            />
          </div>
        </Popover.Anchor>

        <Popover.Portal>
          <Popover.Content
            className="calendar-popover"
            side="bottom"
            sideOffset={4}
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* Header */}
            <div className="calendar-header">
              <button
                type="button"
                className="calendar-header-year"
                onClick={handleYearClick}
                tabIndex={-1}
              >
                {headerYear}
              </button>
              <div className="calendar-header-date">
                {headerDate}
              </div>
            </div>

            {/* Days view */}
            {currentView === 'days' && (
              <div className="calendar-body">
                {/* Navigation */}
                <div className="calendar-nav">
                  <IconButton
                    icon="navigate_before"
                    size="XS"
                    variant="Ghost"
                    onClick={handlePrevMonth}
                    disabled={!canGoPrevMonth}
                    aria-label="Previous month"
                    tabIndex={-1}
                  />
                  <span className="calendar-nav-label">
                    {MONTH_NAMES[displayMonth]} {displayYear}
                  </span>
                  <IconButton
                    icon="navigate_next"
                    size="XS"
                    variant="Ghost"
                    onClick={handleNextMonth}
                    disabled={!canGoNextMonth}
                    aria-label="Next month"
                    tabIndex={-1}
                  />
                </div>

                {/* Day headers */}
                <div className="calendar-day-headers">
                  {DAY_NAMES.map((day) => (
                    <span key={day} className="calendar-day-header">{day}</span>
                  ))}
                </div>

                {/* Day grid */}
                <div className="calendar-day-grid">
                  {renderDaysGrid()}
                </div>
              </div>
            )}

            {/* Months view */}
            {currentView === 'months' && (
              <div className="calendar-body">
                {/* Navigation */}
                <div className="calendar-nav">
                  <IconButton
                    icon="navigate_before"
                    size="XS"
                    variant="Ghost"
                    onClick={handlePrevYear}
                    disabled={!canGoPrevYear}
                    aria-label="Previous year"
                    tabIndex={-1}
                  />
                  <span className="calendar-nav-label">
                    {displayYear}
                  </span>
                  <IconButton
                    icon="navigate_next"
                    size="XS"
                    variant="Ghost"
                    disabled={!canGoNextYear}
                    onClick={handleNextYear}
                    aria-label="Next year"
                    tabIndex={-1}
                  />
                </div>

                {/* Month grid */}
                <div className="calendar-month-grid">
                  {renderMonthsGrid()}
                </div>
              </div>
            )}

            {/* Years view */}
            {currentView === 'years' && (
              <div className="calendar-years-body" ref={yearListRef}>
                {renderYearList()}
              </div>
            )}
          </Popover.Content>
        </Popover.Portal>
      </div>
    </Popover.Root>
  );
}

export default Calendar;
