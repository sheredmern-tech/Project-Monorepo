// ============================================================================
// FILE 3: lib/utils/error-handler.ts
// ============================================================================

import { toast } from "sonner";
import { ApiError } from "./errors";

/**
 * Handle API errors with user-friendly messages
 */
export function handleApiError(error: unknown, context?: string): void {
  if (error instanceof ApiError) {
    const message = error.getUserMessage();
    const description = context ? `${context}: ${message}` : message;
    
    toast.error(error.isServerError() ? 'Server Error' : 'Error', {
      description,
      duration: error.isValidationError() ? 5000 : 3000,
    });
    
    return;
  }

  // Fallback for unknown errors
  toast.error('Error', {
    description: error instanceof Error 
      ? error.message 
      : 'Terjadi kesalahan yang tidak terduga',
    duration: 3000,
  });
}

/**
 * Get error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.getUserMessage();
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Terjadi kesalahan yang tidak terduga';
}

/**
 * Check if error is specific type
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.isNetworkError();
}

export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && 
    (error.isUnauthorized() || error.isForbidden());
}

export function isValidationError(error: unknown): boolean {
  return error instanceof ApiError && error.isValidationError();
}

/**
 * Format validation errors for form display
 */
export function formatValidationErrors(
  error: unknown
): Record<string, string> | null {
  if (!(error instanceof ApiError && error.isValidationError())) {
    return null;
  }

  const details = error.details;
  if (!details || typeof details !== 'object') {
    return null;
  }

  const formatted: Record<string, string> = {};
  Object.entries(details).forEach(([field, messages]) => {
    if (Array.isArray(messages)) {
      formatted[field] = messages[0];
    }
  });

  return formatted;
}