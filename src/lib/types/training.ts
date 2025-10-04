/**
 * Training System Types
 *
 * Defines TypeScript interfaces for the training management system.
 * Training hours are the PRIMARY METRIC for NCO promotion eligibility.
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Training session status
 */
export type TrainingStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

/**
 * Registration status for a reservist in a training session
 */
export type RegistrationStatus = 'registered' | 'attended' | 'completed' | 'cancelled' | 'no_show';

/**
 * Training completion status (pass/fail)
 */
export type CompletionStatus = 'passed' | 'failed' | 'pending';

/**
 * Training category for classification
 */
export type TrainingCategory = 'Leadership' | 'Combat' | 'Technical' | 'Seminar' | 'Other';

// ============================================================================
// TRAINING SESSION INTERFACES
// ============================================================================

/**
 * Training Session - Represents a training event
 */
export interface TrainingSession {
  id: string;
  title: string;
  description: string | null;
  company: string | null; // Company code (ALPHA, BRAVO, etc.) or null for system-wide
  scheduled_date: string; // ISO timestamp
  end_date: string | null; // ISO timestamp
  location: string | null;
  capacity: number | null; // Max participants (null = unlimited)
  prerequisites: string | null;
  training_category: TrainingCategory | null; // Category set at creation, auto-fills when awarding hours
  created_by: string; // Staff/Admin/Super Admin ID
  status: TrainingStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Training Session with Statistics
 * Includes registration counts and completion stats
 */
export interface TrainingWithStats extends TrainingSession {
  registration_count: number;
  attended_count: number;
  completed_count: number;
  passed_count: number;
  failed_count: number;
  pending_count: number;
}

/**
 * Training Session with Creator Info
 */
export interface TrainingWithCreator extends TrainingSession {
  creator: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

// ============================================================================
// REGISTRATION INTERFACES
// ============================================================================

/**
 * Training Registration - Reservist enrollment in a training session
 */
export interface TrainingRegistration {
  id: string;
  training_session_id: string;
  reservist_id: string;
  status: RegistrationStatus;
  attended_at: string | null; // ISO timestamp
  completion_status: CompletionStatus | null;
  certificate_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Training Registration with Reservist Details
 */
export interface RegistrationWithReservist extends TrainingRegistration {
  reservist: {
    first_name: string;
    last_name: string;
    middle_name: string | null;
    email: string;
    service_number: string;
    rank: string | null;
    company: string | null;
  };
}

/**
 * Training Registration with Full Details
 * Includes both training and reservist info
 */
export interface RegistrationWithDetails extends TrainingRegistration {
  training: TrainingSession;
  reservist: {
    first_name: string;
    last_name: string;
    middle_name: string | null;
    email: string;
    service_number: string;
    rank: string | null;
    company: string | null;
  };
}

// ============================================================================
// TRAINING HOURS INTERFACES (DATA FOR PROMOTION ANALYTICS)
// ============================================================================

/**
 * Training Hours Record
 *
 * IMPORTANT: This is DATA COLLECTION, not automatic promotion.
 * - Staff: Records training hours (data collection only)
 * - Administrator: Uses this data in Prescriptive Analytics to suggest promotions
 * - System: Calculates eligibility based on these records
 *
 * Training hours are ONE OF MANY metrics for promotion eligibility analysis.
 */
export interface TrainingHours {
  id: string;
  reservist_id: string;
  training_session_id: string | null;
  training_name: string;
  training_category: TrainingCategory | null;
  hours_completed: number; // Decimal value (e.g., 8.5 hours)
  completion_date: string; // Date string (YYYY-MM-DD)
  certificate_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Training Hours with Reservist Details
 */
export interface TrainingHoursWithReservist extends TrainingHours {
  reservist: {
    first_name: string;
    last_name: string;
    middle_name: string | null;
    email: string;
    service_number: string;
    rank: string | null;
    company: string | null;
  };
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

/**
 * Input for creating a new training session
 */
export interface CreateTrainingInput {
  title: string;
  description?: string;
  company?: string; // Company code
  training_category?: TrainingCategory; // Category for the training
  scheduled_date: string; // ISO timestamp
  end_date?: string; // ISO timestamp
  location?: string;
  capacity?: number;
  prerequisites?: string;
}

/**
 * Input for updating an existing training session
 */
export interface UpdateTrainingInput {
  title?: string;
  description?: string;
  company?: string;
  training_category?: TrainingCategory;
  scheduled_date?: string;
  end_date?: string;
  location?: string;
  capacity?: number;
  prerequisites?: string;
  status?: TrainingStatus;
}

/**
 * Input for marking attendance
 */
export interface MarkAttendanceInput {
  reservist_ids: string[]; // Array of reservist IDs who attended
}

/**
 * Input for awarding training hours to a single reservist
 */
export interface AwardHoursInput {
  reservist_id: string;
  hours_completed: number;
  completion_status: CompletionStatus;
  certificate_url?: string;
  notes?: string;
}

/**
 * Input for bulk awarding training hours (completing a training)
 */
export interface CompleteTrainingInput {
  awards: AwardHoursInput[]; // Array of hour awards for each reservist
  training_category?: TrainingCategory;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * API Response for training session list
 */
export interface TrainingListResponse {
  success: boolean;
  data?: TrainingWithStats[];
  total?: number;
  error?: string;
}

/**
 * API Response for single training session
 */
export interface TrainingDetailResponse {
  success: boolean;
  data?: TrainingWithStats & {
    registrations: RegistrationWithReservist[];
  };
  error?: string;
}

/**
 * API Response for training creation/update
 */
export interface TrainingMutationResponse {
  success: boolean;
  data?: TrainingSession;
  error?: string;
}

/**
 * API Response for attendance marking
 */
export interface AttendanceResponse {
  success: boolean;
  data?: {
    marked_count: number;
    registrations: TrainingRegistration[];
  };
  error?: string;
}

/**
 * API Response for training hours completion
 */
export interface CompleteTrainingResponse {
  success: boolean;
  data?: {
    training_session: TrainingSession;
    hours_awarded: TrainingHours[];
    notifications_sent: number;
  };
  error?: string;
}
