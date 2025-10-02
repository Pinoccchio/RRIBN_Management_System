/**
 * Validation utilities for form inputs and data validation
 */

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format (Philippine format)
 * Accepts: +639XXXXXXXXX, 09XXXXXXXXX, 9XXXXXXXXX
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+639|09|9)\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validates name (first name or last name)
 * Must be at least 2 characters, letters only
 */
export function isValidName(name: string): boolean {
  const nameRegex = /^[A-Za-z\s]{2,}$/;
  return nameRegex.test(name.trim());
}

/**
 * Validates password strength
 * Must be at least 8 characters, contain uppercase, lowercase, number, and special character
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

  return hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

/**
 * Sanitizes user input by trimming whitespace
 */
export function sanitizeInput(input: string): string {
  return input.trim();
}

/**
 * Validates UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Formats phone number to Philippine format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Convert to +639XXXXXXXXX format
  if (cleaned.startsWith('63')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('9')) {
    return `+63${cleaned}`;
  } else if (cleaned.startsWith('09')) {
    return `+63${cleaned.substring(1)}`;
  }

  return phone;
}

/**
 * Validates employee ID format
 * Must be at least 3 characters
 */
export function isValidEmployeeId(employeeId: string): boolean {
  return employeeId.trim().length >= 3;
}
