import type { Database } from '@/lib/supabase/database.types';

// Extract types from database
export type Account = Database['public']['Tables']['accounts']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserRole = Database['public']['Enums']['user_role'];
export type AccountStatus = Database['public']['Enums']['account_status'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

// Combined administrator type with profile information
export interface Administrator {
  id: string;
  email: string;
  role: UserRole;
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
  creator?: {
    first_name: string;
    last_name: string;
  } | null;
}

// Form data for creating administrator
export interface CreateAdministratorInput {
  email: string;
  role: 'admin' | 'super_admin';
  firstName: string;
  lastName: string;
  phone?: string;
  status?: AccountStatus;
  password: string;
}

// Form data for updating administrator
export interface UpdateAdministratorInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'admin' | 'super_admin';
  status?: AccountStatus;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateAdministratorResponse {
  administrator: Administrator;
}

// Filter and pagination types
export interface AdministratorFilters {
  role?: 'admin' | 'super_admin' | 'all';
  status?: AccountStatus | 'all';
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'email' | 'last_login_at';
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
