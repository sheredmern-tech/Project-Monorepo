// ============================================================================
// FILE: components/forms/form-field-wrapper.tsx
// ============================================================================
import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

interface FormFieldWrapperProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function FormFieldWrapper({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: FormFieldWrapperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}