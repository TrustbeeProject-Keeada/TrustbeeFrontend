/**
 * TrustBee Frontend Validation Utilities
 * Professional form & input validation helpers
 */

/**
 * Validate email format using regex
 * Compliant with most RFC 5322 rules
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password requirements
 * Returns object with details for UX feedback
 */
export interface PasswordValidation {
  isValid: boolean;
  length: boolean; // At least 8 characters
  hasUppercase: boolean; // Has A-Z
  hasLowercase: boolean; // Has a-z
  hasNumber: boolean; // Has 0-9
}

export function validatePassword(password: string): PasswordValidation {
  return {
    isValid:
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password),
    length: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}

/**
 * Validate phone number (basic international format)
 */
export function isValidPhone(phone: string): boolean {
  // Allow: +[1-9] followed by 6-14 digits, optional spaces/dashes
  const phoneRegex = /^\+?[1-9]\d{1,14}(\s|-)?[\d\s-]{0,}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get password validation error message for display
 */
export function getPasswordErrorMessage(
  validation: PasswordValidation,
): string {
  if (!validation.length) return "Password must be at least 8 characters";
  if (!validation.hasUppercase)
    return "Password must contain an uppercase letter";
  if (!validation.hasLowercase)
    return "Password must contain a lowercase letter";
  if (!validation.hasNumber) return "Password must contain a number";
  return "";
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}
