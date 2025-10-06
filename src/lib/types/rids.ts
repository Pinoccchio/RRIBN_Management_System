/**
 * RIDS (Reservist Information Data Sheet) Type Definitions
 *
 * Official Philippine Army form for comprehensive reservist personnel records
 * 12 sections covering personnel info, service records, and biometrics
 *
 * Based on: Philippine Army RIDS Form (s2019)
 * Database: Supabase PostgreSQL (rids_forms table + related tables)
 */

/**
 * RIDS submission and approval status
 */
export type RIDSStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

/**
 * Marital status options
 */
export type MaritalStatus = 'Single' | 'Married' | 'Widow' | 'Separated';

/**
 * Sex/Gender
 */
export type Sex = 'Male' | 'Female';

/**
 * AFPOS/MOS (Armed Forces Position / Military Occupational Specialty)
 */
export type AFPOSCategory =
  | 'INF'     // Infantry
  | 'CAV'     // Cavalry
  | 'FA'      // Field Artillery
  | 'SC'      // Signal Corps
  | 'QMS'     // Quartermaster Service
  | 'MI'      // Military Intelligence
  | 'AGS'     // Adjutant General Service
  | 'FS'      // Finance Service
  | 'RES'     // Reserve
  | 'GSC'     // General Staff Corps
  | 'MNSA';   // Military Non-Scholarship Agreement

/**
 * Source of Commission/Enlistment
 */
export type SourceOfCommission =
  | 'MNSA'           // Military Non-Scholarship Agreement
  | 'ELECTED'
  | 'PRES_APPOINTEE' // Presidential Appointee
  | 'DEGREE_HOLDER'
  | 'MS-43'
  | 'POTC'           // Pre-Officer Training Course
  | 'CBT_COMMISSION' // Combat Commission
  | 'EX-AFP'         // Ex-Armed Forces Philippines
  | 'ROTC'           // Reserve Officers' Training Corps
  | 'CMT'            // Citizen Military Training
  | 'BCMT'           // Basic Citizen Military Training
  | 'SBCMT'          // Short Basic Citizen Military Training
  | 'CAA_CAFGU'      // Civilian Armed Forces Geographical Unit
  | 'MOT_PAARU';     // Military Observers Training

/**
 * Reservist Classification
 */
export type ReservistClassification = 'READY' | 'STANDBY' | 'RETIRED';

/**
 * Blood type options
 */
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

/**
 * Company/Unit options
 */
export type Company = 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA' | 'HQ' | 'SIGNAL' | 'FAB';

/**
 * Relation for dependents
 */
export type DependentRelation = 'Spouse' | 'Son' | 'Daughter' | 'Father' | 'Mother' | 'Sibling';

/**
 * Education level
 */
export type EducationLevel =
  | 'High School'
  | 'Vocational'
  | 'College'
  | 'Graduate - Masters'
  | 'Graduate - Doctorate';

/**
 * Promotion action type
 */
export type PromotionActionType = 'Promotion' | 'Demotion' | 'Initial Commission';

// ============================================================================
// SECTION 1: PERSONNEL INFORMATION
// ============================================================================

export interface PersonnelInformation {
  rank: string;
  afpsn: string; // Armed Forces Philippines Service Number
  br_svc: string; // Branch of Service
  afpos_mos: AFPOSCategory;
  source_of_commission: SourceOfCommission;
  initial_rank: string;
  date_of_commission: string; // ISO date string
  commission_authority: string;
  reservist_classification: ReservistClassification;
  mobilization_center: string;
  designation: string;
  squad_team_section?: string | null;
  platoon?: string | null;
  company: Company;
  battalion_brigade_division: string;
  combat_shoes_size: string;
  cap_size_cm: number;
  bda_size: string; // Battle Dress Attire (S, M, L, XL, etc.)
}

// ============================================================================
// SECTION 2: PERSONAL INFORMATION
// ============================================================================

export interface EmploymentInfo {
  present_occupation?: string | null;
  company_name?: string | null;
  company_address?: string | null;
  office_tel_nr?: string | null;
}

export interface ResidentialInfo {
  home_address_street: string;
  home_address_city: string;
  home_address_province: string;
  home_address_zip: string;
  res_tel_nr?: string | null;
  mobile_tel_nr: string; // Required
}

export interface PersonalDetails {
  birthdate: string; // ISO date string
  birth_place: string;
  age: number; // Auto-calculated
  religion: string;
  blood_type: BloodType;
}

export interface GovernmentIDs {
  tin: string; // Tax Identification Number (XXX-XXX-XXX-XXX)
  sss_number: string; // Social Security System (XX-XXXXXXX-X)
  philhealth_number: string; // Philippine Health Insurance (12 digits)
}

export interface PhysicalInfo {
  height_cm: number;
  weight_kg: number;
}

export interface DigitalPresence {
  fb_account?: string | null;
  email_address: string; // Required
}

export interface AdditionalInfo {
  special_skills?: string | null;
  languages_spoken?: string | null;
}

export interface PersonalInformation {
  employment: EmploymentInfo;
  residential: ResidentialInfo;
  personal_details: PersonalDetails;
  government_ids: GovernmentIDs;
  physical_info: PhysicalInfo;
  marital_status: MaritalStatus;
  sex: Sex;
  digital_presence: DigitalPresence;
  additional_info: AdditionalInfo;
}

// ============================================================================
// SECTION 3: PROMOTION/DEMOTION HISTORY
// ============================================================================

export interface PromotionHistoryEntry {
  id?: string;
  entry_number: number;
  rank: string;
  date_of_rank: string; // ISO date string
  authority: string;
  action_type: PromotionActionType;
  notes?: string | null;
}

// ============================================================================
// SECTION 4: MILITARY TRAINING/SEMINAR/SCHOOLING
// ============================================================================

export interface MilitaryTrainingEntry {
  id?: string;
  training_name: string;
  school: string; // Institution/Training center
  date_graduated: string; // ISO date string
  certificate_number?: string | null;
  training_category?: string | null; // Basic, Advanced, Specialized
  duration_days?: number | null;
  verification_status?: 'verified' | 'pending' | 'rejected';
}

// ============================================================================
// SECTION 5: AWARDS AND DECORATION
// ============================================================================

export interface AwardEntry {
  id?: string;
  award_name: string;
  authority: string;
  date_awarded: string; // ISO date string
  citation?: string | null;
  award_category?: string | null; // Medal, Ribbon, Certificate
}

// ============================================================================
// SECTION 6: DEPENDENTS
// ============================================================================

export interface DependentEntry {
  id?: string;
  relation: DependentRelation;
  full_name: string;
  birthdate?: string | null; // ISO date string
  contact_info?: string | null;
}

// ============================================================================
// SECTION 7: HIGHEST EDUCATIONAL ATTAINMENT
// ============================================================================

export interface EducationEntry {
  id?: string;
  course: string; // Degree/Program name
  school: string;
  date_graduated: string; // ISO date string
  level: EducationLevel;
  honors?: string | null;
}

// ============================================================================
// SECTION 8: CAD/OJT/ADT (Call to Active Duty / On-the-Job Training / Active Duty Training)
// ============================================================================

export interface EfficiencyReport {
  report_number: string;
  rating: string; // Excellent, Satisfactory, Unsatisfactory
  evaluator: string;
  remarks?: string | null;
}

export interface ActiveDutyEntry {
  id?: string;
  unit: string;
  purpose: string;
  authority: string;
  date_start: string; // ISO date string
  date_end: string; // ISO date string
  days_served?: number; // Auto-calculated: (date_end - date_start) + 1
  efficiency_report?: EfficiencyReport | null;
  verification_status?: 'verified' | 'pending' | 'rejected';
}

// ============================================================================
// SECTION 9: UNIT ASSIGNMENT HISTORY
// ============================================================================

export interface UnitAssignmentEntry {
  id?: string;
  unit: string;
  authority: string;
  date_from: string; // ISO date string
  date_to?: string | null; // ISO date string (NULL if current assignment)
  is_current: boolean;
  assignment_reason?: string | null;
}

// ============================================================================
// SECTION 10: DESIGNATION HISTORY
// ============================================================================

export interface DesignationEntry {
  id?: string;
  position: string;
  authority: string;
  date_from: string; // ISO date string
  date_to?: string | null; // ISO date string (NULL if current position)
  is_current: boolean;
  responsibilities?: string[] | null;
}

// ============================================================================
// SECTION 11: BIOMETRICS & CERTIFICATION
// ============================================================================

export interface Biometrics {
  photo_url?: string | null; // Supabase Storage path (2x2 photo)
  thumbmark_url?: string | null; // Right thumbmark
  signature_url?: string | null; // Reservist signature
}

export interface Certification {
  is_certified: boolean;
  certification_date?: string | null; // ISO date string
  certification_text: string; // "I HEREBY CERTIFY that all entries in this document are correct."
}

// ============================================================================
// SECTION 12: ATTESTATION
// ============================================================================

export interface AttestingPersonnel {
  name: string;
  rank: string;
  position: string;
  user_id: string;
}

export interface Attestation {
  attesting_personnel?: AttestingPersonnel | null;
  attestation_date?: string | null; // ISO date string
  attestation_signature?: string | null;
  verification_notes?: string | null;
}

// ============================================================================
// MAIN RIDS RECORD
// ============================================================================

/**
 * Complete RIDS Form (All 12 Sections)
 */
export interface RIDSForm {
  // Metadata
  id: string;
  reservist_id: string;
  version: number;
  status: RIDSStatus;
  created_at: string;
  updated_at: string;
  submitted_at?: string | null;
  submitted_by?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;

  // Section 2 Fields (stored directly in rids_forms table)
  present_occupation?: string | null;
  company_name?: string | null;
  company_address?: string | null;
  office_tel_nr?: string | null;
  home_address_street?: string | null;
  home_address_city?: string | null;
  home_address_province?: string | null;
  home_address_zip?: string | null;
  res_tel_nr?: string | null;
  mobile_tel_nr?: string | null;
  birth_place?: string | null;
  religion?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  marital_status?: MaritalStatus | null;
  sex?: Sex | null;
  fb_account?: string | null;
  special_skills?: string | null;
  languages_spoken?: string | null;

  // Section 11: Biometrics
  photo_url?: string | null;
  thumbmark_url?: string | null;
  signature_url?: string | null;
}

/**
 * RIDS Form with all related data (for full view)
 */
export interface RIDSFormComplete extends RIDSForm {
  // Nested from other tables
  promotion_history?: PromotionHistoryEntry[];
  military_training?: MilitaryTrainingEntry[];
  awards?: AwardEntry[];
  dependents?: DependentEntry[];
  education?: EducationEntry[];
  active_duty?: ActiveDutyEntry[];
  unit_assignments?: UnitAssignmentEntry[];
  designations?: DesignationEntry[];

  // Reservist info (from join)
  reservist?: {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    email: string;
    service_number: string;
    rank?: string | null;
    company?: string | null;
  };

  // Approver info (from join)
  approver?: {
    first_name: string;
    last_name: string;
  } | null;
}

// ============================================================================
// INPUT TYPES FOR API
// ============================================================================

/**
 * Input for creating a new RIDS (staff-initiated)
 */
export interface CreateRIDSInput {
  reservist_id: string;
  // Section 2 fields
  present_occupation?: string;
  company_name?: string;
  company_address?: string;
  office_tel_nr?: string;
  home_address_street?: string;
  home_address_city?: string;
  home_address_province?: string;
  home_address_zip?: string;
  res_tel_nr?: string;
  mobile_tel_nr?: string;
  birth_place?: string;
  religion?: string;
  height_cm?: number;
  weight_kg?: number;
  marital_status?: MaritalStatus;
  sex?: Sex;
  fb_account?: string;
  special_skills?: string;
  languages_spoken?: string;
}

/**
 * Input for updating RIDS
 */
export interface UpdateRIDSInput extends Partial<CreateRIDSInput> {
  // Can update any field
}

/**
 * Input for submitting RIDS (changes status to submitted)
 */
export interface SubmitRIDSInput {
  submitted_by: string;
  certification_confirmed: boolean; // User must confirm certification
}

/**
 * Input for approving RIDS (staff/admin only)
 */
export interface ApproveRIDSInput {
  verification_notes?: string;
}

/**
 * Input for rejecting RIDS
 */
export interface RejectRIDSInput {
  rejection_reason: string;
}

/**
 * Input for changing RIDS status (staff/admin only)
 */
export interface ChangeRIDSStatusInput {
  new_status: RIDSStatus;
  reason: string;
  notes?: string;
}

/**
 * Filters for RIDS queries
 */
export interface RIDSFilters {
  status?: 'all' | RIDSStatus;
  company?: string;
  reservist_classification?: ReservistClassification;
  search?: string; // Search by name, service number, AFPSN
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated RIDS response
 */
export interface PaginatedRIDSResponse {
  data: RIDSFormComplete[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// FILE UPLOAD TYPES
// ============================================================================

/**
 * Biometric file upload input
 */
export interface BiometricUploadInput {
  rids_id: string;
  file_type: 'photo' | 'thumbmark' | 'signature';
  file: File;
}

/**
 * Supporting document upload
 */
export interface SupportingDocumentUpload {
  rids_id: string;
  document_type: string;
  file: File;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * RIDS validation result
 */
export interface RIDSValidationResult {
  is_valid: boolean;
  missing_required_fields: string[];
  invalid_fields: { field: string; reason: string }[];
  warnings: string[];
}

/**
 * Required fields by section for validation
 */
export const RIDS_REQUIRED_FIELDS = {
  section_1: [
    'rank',
    'afpsn',
    'br_svc',
    'afpos_mos',
    'source_of_commission',
    'initial_rank',
    'date_of_commission',
    'commission_authority',
    'reservist_classification',
    'mobilization_center',
    'designation',
    'company',
    'battalion_brigade_division',
    'combat_shoes_size',
    'cap_size_cm',
    'bda_size',
  ],
  section_2: [
    'mobile_tel_nr',
    'birthdate',
    'birth_place',
    'religion',
    'blood_type',
    'tin',
    'sss_number',
    'philhealth_number',
    'height_cm',
    'weight_kg',
    'marital_status',
    'sex',
    'email_address',
  ],
  section_11: ['photo_url', 'thumbmark_url', 'signature_url'],
};
