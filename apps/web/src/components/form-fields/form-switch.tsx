// ============================================================================
// FILE: components/form-fields/form-switch.tsx
// ============================================================================
// 🎯 REUSABLE Switch form field wrapper
// ============================================================================
"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { FieldError, UseFormSetValue, UseFormWatch } from "react-hook-form";

interface FormSwitchProps<T extends Record<string, any>> {
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

export function FormSwitch<T extends Record<string, any>>({
  name,
  label,
  description,
  required = false,
  disabled = false,
  watch,
  setValue,
  error,
  className,
}: FormSwitchProps<T>) {
  const fieldValue = watch(name as any);
  const isChecked = Boolean(fieldValue);

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        <Switch
          id={name}
          checked={isChecked}
          onCheckedChange={(checked) => {
            setValue(name as any, checked as any);
          }}
          disabled={disabled}
        />
        <Label htmlFor={name} className="cursor-pointer">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      )}
      {error && <p className="text-sm text-red-500 mt-2">{error.message}</p>}
    </div>
  );
}
