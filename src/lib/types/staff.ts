import type { Database } from '@/lib/supabase/database.types';

// Extract types from database
export type Account = Database['public']['Tables']['accounts']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type StaffDetails = Database['public']['Tables']['staff_details']['Row'];
export type AccountStatus = Database['public']['Enums']['account_status'];

// Company codes (kept for backwards compatibility)
export type CompanyCode = 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'HQ' | 'SIGNAL' | 'FAB';

/**
 * @deprecated Use the Company interface and fetch companies dynamically from the database via /api/admin/companies
 * This hardcoded array is maintained for backwards compatibility only.
 */
export const COMPANIES: { code: CompanyCode; name: string; color: string }[] = [
  { code: 'ALPHA', name: 'Alpha Company', color: 'blue' },
  { code: 'BRAVO', name: 'Bravo Company', color: 'green' },
  { code: 'CHARLIE', name: 'Charlie Company', color: 'purple' },
  { code: 'HQ', name: 'Headquarters', color: 'yellow' },
  { code: 'SIGNAL', name: 'Signal Company', color: 'orange' },
  { code: 'FAB', name: 'FAB Company', color: 'red' },
];

// Dynamic company types (fetched from database)
export interface Company {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyInput {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateCompanyInput {
  name?: string;
  description?: string;
}

// Combined staff member type with all details
export interface StaffMember {
  id: string;
  email: string;
  role: 'staff';
  status: AccountStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  last_login_at: string | null;
  profile: {
    first_name: string;
    last_name: string;
    phone: string | null;
    profile_photo_url: string | null;
  };
  staff_details: {
    employee_id: string | null;
    position: string | null;
    assigned_companies: string[];
  };
  creator?: {
    first_name: string;
    last_name: string;
  } | null;
}

// Form data for creating staff
export interface CreateStaffInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeId?: string;
  position?: string;
  assignedCompanies: string[];
  status?: AccountStatus;
  password: string;
}

// Form data for updating staff
export interface UpdateStaffInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  employeeId?: string;
  position?: string;
  assignedCompanies?: string[];
  status?: AccountStatus;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateStaffResponse {
  staff: StaffMember;
  temporaryPassword: string;
}

// Filter and pagination types
export interface StaffFilters {
  status?: AccountStatus | 'all';
  company?: string | 'all';
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'email' | 'last_login_at' | 'employee_id';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
