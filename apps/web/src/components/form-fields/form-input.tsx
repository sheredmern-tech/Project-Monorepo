// ============================================================================
// FILE: components/form-fields/form-input.tsx
// ============================================================================
// 🎯 REUSABLE Input form field wrapper
// ============================================================================
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldError, UseFormRegister } from "react-hook-form";

interface FormInputProps {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  className?: string;
  step?: string | number;
  min?: string | number;
  max?: string | number;
  registerOptions?: Record<string, any>;
}

export function FormInput({
  name,
  label,
  type = "text",
  required = false,
  disabled = false,
  placeholder,
  register,
  error,
  className,
  step,
  min,
  max,
  registerOptions = {},
}: FormInputProps) {
  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        step={step}
        min={min}
        max={max}
        {...register(name, registerOptions)}
      />
      {error && <p className="text-sm text-red-500 mt-2">{error.message}</p>}
    </div>
  );
}
