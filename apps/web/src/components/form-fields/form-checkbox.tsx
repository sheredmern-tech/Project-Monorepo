// ============================================================================
// FILE: components/form-fields/form-checkbox.tsx
// ============================================================================
// 🎯 REUSABLE Checkbox form field wrapper
// ============================================================================
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { FieldError, UseFormSetValue, UseFormWatch } from "react-hook-form";

interface FormCheckboxProps<T extends Record<string, any>> {
  name: keyof T & string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  error?: FieldError;
  className?: string;
}

export function FormCheckbox<T extends Record<string, any>>({
  name,
  label,
  description,
  required = false,
  disabled = false,
  watch,
  setValue,
  error,
  className,
}: FormCheckboxProps<T>) {
  const fieldValue = watch(name as any);
  const isChecked = Boolean(fieldValue);

  return (
    <div className={className}>
      <div className="flex items-start space-x-2">
        <Checkbox
          id={name}
          checked={isChecked}
          onCheckedChange={(checked) => {
            setValue(name as any, checked as any, { shouldValidate: true, shouldDirty: true });
          }}
          disabled={disabled}
        />
        <div className="grid gap-1.5 leading-none">
          <Label htmlFor={name} className="cursor-pointer">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-500 mt-2">{error.message}</p>}
    </div>
  );
}
