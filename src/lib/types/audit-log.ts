/**
 * Audit Log Types
 * Types for system audit logging and tracking user actions
 */

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'login'
  | 'logout'
  | 'validate';

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;

  // Joined data from accounts/profiles
  user_email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export interface AuditLogFilters {
  action?: AuditAction | 'all';
  entity_type?: string | 'all';
  user_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
