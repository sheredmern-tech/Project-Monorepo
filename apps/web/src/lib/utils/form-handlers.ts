// ============================================================================
// FILE 3: lib/utils/form-handlers.ts
// ============================================================================
import { toast } from "sonner";

interface FormSubmitOptions<T> {
  submitFn: (data: T) => Promise<void>;
  data: T;
  successMessage: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export async function handleFormSubmit<T>({
  submitFn,
  data,
  successMessage,
  errorMessage = "Terjadi kesalahan",
  onSuccess,
  onError,
}: FormSubmitOptions<T>) {
  try {
    await submitFn(data);
    toast.success(successMessage);
    onSuccess?.();
  } catch (error) {
    const message = error instanceof Error ? error.message : errorMessage;
    toast.error(message);
    onError?.(error as Error);
    throw error;
  }
}