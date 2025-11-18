"use client";

import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  id?: string;
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

// Nama hari dan bulan dalam bahasa Indonesia
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function DatePicker({
  id,
  date,
  onDateChange,
  placeholder = "Pilih tanggal",
  disabled = false,
  className,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [viewDate, setViewDate] = React.useState<Date>(date || new Date());

  // Sync dengan external date prop
  React.useEffect(() => {
    setSelectedDate(date);
    if (date) {
      setViewDate(date);
    }
  }, [date]);

  // Generate calendar grid
  const generateCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // First day of month (0 = Sunday, 1 = Monday, etc)
    const firstDay = new Date(year, month, 1).getDay();

    // Total days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Days from previous month to show
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendar: (Date | null)[] = [];

    // Previous month days (grayed out)
    for (let i = firstDay - 1; i >= 0; i--) {
      calendar.push(new Date(year, month - 1, daysInPrevMonth - i));
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      calendar.push(new Date(year, month, i));
    }

    // Next month days to complete the grid (6 rows x 7 days = 42)
    const remainingDays = 42 - calendar.length;
    for (let i = 1; i <= remainingDays; i++) {
      calendar.push(new Date(year, month + 1, i));
    }

    return calendar;
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSameDay = (date1: Date | undefined, date2: Date): boolean => {
    if (!date1) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return isSameDay(today, date);
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === viewDate.getMonth();
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (onDateChange && selectedDate) {
      onDateChange(selectedDate);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setSelectedDate(date); // Reset to original
    setOpen(false);
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const formatDisplayDate = (date: Date | undefined): string => {
    if (!date) return placeholder;

    const day = date.getDate();
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const calendar = generateCalendar();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{formatDisplayDate(date)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Header with month/year navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-sm font-semibold">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-xs font-medium text-muted-foreground text-center h-8 flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendar.map((date, index) => {
              if (!date) return null;

              const isSelected = isSameDay(selectedDate, date);
              const isTodayDate = isToday(date);
              const isInCurrentMonth = isCurrentMonth(date);
              const isDisabled = isDateDisabled(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  disabled={isDisabled}
                  className={cn(
                    "h-8 w-8 text-sm rounded-md transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    isTodayDate && !isSelected && "border border-primary",
                    !isInCurrentMonth && "text-muted-foreground opacity-50",
                    isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={!selectedDate}
              className="flex-1"
            >
              Pilih
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
