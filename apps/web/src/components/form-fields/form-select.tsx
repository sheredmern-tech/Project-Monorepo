// ============================================================================
// FILE: components/form-fields/form-select.tsx
// ============================================================================
// 🎯 REUSABLE Select form field wrapper
// ============================================================================
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { FieldError, UseFormSetValue, UseFormWatch } from "react-hook-form";

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps<T extends Record<string, any>> {
  name: keyof T & string;
  label: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  error?: FieldError;
  className?: string;
}

export function FormSelect<T extends Record<string, any>>({
  name,
  label,
  options,
  required = false,
  disabled = false,
  placeholder = "Pilih...",
  watch,
  setValue,
  error,
  className,
}: FormSelectProps<T>) {
  // Cast name to any for watch() to avoid Path<T> type issues
  const value = watch(name as any) as string;

  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={(val) => setValue(name as any, val as any, { shouldValidate: true, shouldDirty: true })}
        disabled={disabled}
      >
        <SelectTrigger id={name}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500 mt-2">{error.message}</p>}
    </div>
  );
}
