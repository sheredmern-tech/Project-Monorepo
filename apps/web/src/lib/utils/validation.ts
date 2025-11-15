// ============================================================================
// FILE: lib/utils/validation.ts
// ============================================================================
/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indonesia format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message: string;
} {
  if (password.length < 8) {
    return { isValid: false, message: "Password minimal 8 karakter" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password harus mengandung huruf besar" };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password harus mengandung huruf kecil" };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password harus mengandung angka" };
  }
  return { isValid: true, message: "Password kuat" };
}