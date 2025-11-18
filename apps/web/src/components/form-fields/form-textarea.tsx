// ============================================================================
// FILE: components/form-fields/form-textarea.tsx
// ============================================================================
// 🎯 REUSABLE Textarea form field wrapper
// ============================================================================
"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { FieldError, UseFormRegister } from "react-hook-form";

interface FormTextareaProps {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  className?: string;
  rows?: number;
  registerOptions?: Record<string, any>;
}

export function FormTextarea({
  name,
  label,
  required = false,
  disabled = false,
  placeholder,
  register,
  error,
  className,
  rows,
  registerOptions = {},
}: FormTextareaProps) {
  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        {...register(name, registerOptions)}
      />
      {error && <p className="text-sm text-red-500 mt-2">{error.message}</p>}
    </div>
  );
}
