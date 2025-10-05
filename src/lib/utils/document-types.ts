/**
 * Document Type Utilities
 *
 * Maps database document type values to user-friendly display names.
 * Mirrors the DocumentType enum from the Flutter app for consistency.
 */

/**
 * Document type mapping
 * Database stores camelCase values, display shows proper names with spacing/apostrophes
 */
const DOCUMENT_TYPE_DISPLAY_NAMES: Record<string, string> = {
  governmentId: 'Government ID',
  birthCertificate: 'Birth Certificate',
  diploma: 'Diploma/Certificate',
  medicalCertificate: 'Medical Certificate',
  clearance: 'Clearance',
  nbiClearance: 'NBI Clearance',
  policeClearance: 'Police Clearance',
  militaryId: 'Military ID',
  passport: 'Passport',
  driversLicense: "Driver's License",
  sss: 'SSS ID',
  philhealth: 'PhilHealth ID',
  tinId: 'TIN ID',
  votersId: "Voter's ID",
  postalId: 'Postal ID',
  other: 'Other',
};

/**
 * Get user-friendly display name for a document type
 *
 * @param documentType - Database document type value (e.g., "driversLicense")
 * @returns Display name (e.g., "Driver's License")
 *
 * @example
 * getDocumentTypeDisplayName("driversLicense") // "Driver's License"
 * getDocumentTypeDisplayName("nbiClearance") // "NBI Clearance"
 */
export function getDocumentTypeDisplayName(documentType: string): string {
  return DOCUMENT_TYPE_DISPLAY_NAMES[documentType] || documentType;
}

/**
 * Get all available document types
 *
 * @returns Array of {value, label} pairs for use in dropdowns/filters
 */
export function getAllDocumentTypes(): Array<{ value: string; label: string }> {
  return Object.entries(DOCUMENT_TYPE_DISPLAY_NAMES).map(([value, label]) => ({
    value,
    label,
  }));
}
