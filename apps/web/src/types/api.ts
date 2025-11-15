// ============================================================================
// FILE: types/api.ts
// ============================================================================

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Standard API Success Response
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  timestamp: string;
  message?: string;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  timestamp: string;
}

/**
 * Error Response
 */
export interface ErrorResponse {
  success: false;
  statusCode: number;
  timestamp: string;
  message: string;
  error?: string;
  errors?: ValidationError[];
}

/**
 * Validation Error Detail
 */
export interface ValidationError {
  property: string;
  constraints: Record<string, string>;
}

/**
 * Query Filters Base
 */
export interface QueryFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Date Range Filter
 */
export interface DateRangeFilter {
  tanggal_dari?: string;
  tanggal_sampai?: string;
}