"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
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

  // Sync with external date prop
  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const handleSelect = (newDate: Date | undefined) => {
    console.log("📅 DatePicker: Date selected:", newDate);
    setSelectedDate(newDate);
    // Don't close yet - wait for user to click "Pilih" button
  };

  const handleConfirm = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    console.log("✅ DatePicker: Pilih clicked, selectedDate:", selectedDate);
    console.log("✅ DatePicker: onDateChange exists?", !!onDateChange);

    if (onDateChange && selectedDate) {
      console.log("✅ DatePicker: Calling onDateChange with:", selectedDate);
      onDateChange(selectedDate);
    } else {
      console.warn("⚠️ DatePicker: Cannot confirm - missing onDateChange or selectedDate");
    }

    setOpen(false);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    console.log("❌ DatePicker: Batal clicked");
    setSelectedDate(date); // Reset to original
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
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
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
            className="min-h-[280px]"
          />
          <div className="flex gap-2 p-3 border-t">
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
