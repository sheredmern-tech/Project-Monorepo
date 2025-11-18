// ============================================================================
// FILE: components/form-fields/form-radio-group.tsx
// ============================================================================
// 🎯 REUSABLE RadioGroup form field wrapper
// ============================================================================
"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { FieldError, UseFormSetValue, UseFormWatch } from "react-hook-form";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface FormRadioGroupProps<T extends Record<string, any>> {
  name: keyof T & string;
  label: string;
  options: RadioOption[];
  required?: boolean;
  disabled?: boolean;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  error?: FieldError;
  className?: string;
  orientation?: "vertical" | "horizontal";
}

export function FormRadioGroup<T extends Record<string, any>>({
  name,
  label,
  options,
  required = false,
  disabled = false,
  watch,
  setValue,
  error,
  className,
  orientation = "vertical",
}: FormRadioGroupProps<T>) {
  const fieldValue = watch(name as any);
  const selectedValue = String(fieldValue || "");

  return (
    <div className={className}>
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <RadioGroup
        value={selectedValue}
        onValueChange={(value) => {
          setValue(name as any, value as any);
        }}
        disabled={disabled}
        className={orientation === "horizontal" ? "flex flex-row space-x-4" : ""}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-start space-x-2">
            <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor={`${name}-${option.value}`}
                className="cursor-pointer font-normal"
              >
                {option.label}
              </Label>
              {option.description && (
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
      {error && <p className="text-sm text-red-500 mt-2">{error.message}</p>}
    </div>
  );
}
