/**
 * Document-related type definitions
 */

export type DocumentStatus = 'pending' | 'verified' | 'rejected';

export interface Document {
  id: string;
  reservist_id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  status: DocumentStatus;
  validated_by: string | null;
  validated_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  version: number;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Extended document with reservist information
 */
export interface DocumentWithReservist extends Document {
  reservist: {
    first_name: string;
    middle_name: string | null;
    last_name: string;
    email: string;
    company: string | null;
    rank: string | null;
    service_number: string;
  };
  validator: {
    first_name: string;
    last_name: string;
  } | null;
}

/**
 * Input for validating a document
 */
export interface ValidateDocumentInput {
  notes?: string;
}

/**
 * Input for rejecting a document
 */
export interface RejectDocumentInput {
  rejection_reason: string;
  notes?: string;
}

/**
 * Filters for document queries
 */
export interface DocumentFilters {
  status?: 'all' | DocumentStatus;
  document_type?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response for documents
 */
export interface PaginatedDocumentsResponse {
  data: DocumentWithReservist[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
