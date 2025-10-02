// User role types
export type UserRole = 'super-admin' | 'admin' | 'staff' | 'reservist';

// User profile interface
export interface DashboardUser {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  company?: string; // For staff/admin
}

// Stat card data interface
export interface StatCardData {
  label: string;
  value: string | number;
  change?: number; // Percentage change
  changeLabel?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

// Chart data interface
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

// Table column interface
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

// Pagination interface
export interface PaginationData {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

// Filter interface
export interface FilterOption {
  label: string;
  value: string | number;
}

export interface TableFilter {
  key: string;
  label: string;
  type: 'select' | 'search' | 'date' | 'dateRange';
  options?: FilterOption[];
}

// Notification interface
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Activity log interface
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  target?: string;
  timestamp: Date;
  ipAddress?: string;
  details?: Record<string, any>;
}

// Company type
export type CompanyType = 'Alpha' | 'Bravo' | 'Charlie' | 'HQ' | 'Signal' | 'FAB';

// Reservist status
export type ReservistStatus = 'Ready' | 'Standby' | 'Retired';

// Document status
export type DocumentStatus = 'Pending' | 'Verified' | 'Rejected';

// Training status
export type TrainingStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
