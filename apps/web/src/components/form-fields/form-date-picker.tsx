// ============================================================================
// FILE: components/form-fields/form-date-picker.tsx (CLEAN VERSION)
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { parseDateLocal, formatDateLocal } from "@/lib/utils/date";
import type { FieldError, UseFormSetValue, UseFormWatch } from "react-hook-form";

interface FormDatePickerProps<T extends Record<string, any>> {
  name: keyof T & string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  error?: FieldError;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function FormDatePicker<T extends Record<string, any>>({
  name,
  label,
  required = false,
  disabled = false,
  placeholder,
  watch,
  setValue,
  error,
  minDate,
  maxDate,
  className,
}: FormDatePickerProps<T>) {
  // ✅ LOCAL STATE
  const [displayDate, setDisplayDate] = useState<string | null>(null);
  const [parsedDate, setParsedDate] = useState<Date | undefined>(undefined);

  // ✅ Watch field value
  const fieldValue = watch(name as any);
  const dateValue = (fieldValue != null && typeof fieldValue === "string") ? fieldValue : "";

  // ✅ Sync state ketika field berubah
  useEffect(() => {
    if (dateValue) {
      const parsed = parseDateLocal(dateValue);
      if (parsed) {
        setParsedDate(parsed);
        setDisplayDate(
          parsed.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        );
      }
    } else {
      setParsedDate(undefined);
      setDisplayDate(null);
    }
  }, [dateValue]);

  // ✅ Dynamic placeholder
  const displayPlaceholder = displayDate
    ? displayDate
    : (placeholder || `Pilih ${label.toLowerCase()}`);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate = formatDateLocal(date);
      setValue(name as any, formattedDate as any);

      // ✅ Update local state IMMEDIATELY
      setParsedDate(date);
      setDisplayDate(
        date.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      );
    } else {
      setValue(name as any, "" as any);
      setParsedDate(undefined);
      setDisplayDate(null);
    }
  };

  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <DatePicker
        id={name}
        disabled={disabled}
        date={parsedDate}
        onDateChange={handleDateChange}
        placeholder={displayPlaceholder}
        minDate={minDate}
        maxDate={maxDate}
      />

      {error && <p className="text-sm text-red-500 mt-2">{error.message}</p>}
    </div>
  );
}