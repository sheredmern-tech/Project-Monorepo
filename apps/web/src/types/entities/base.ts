// ============================================================================
// FILE: types/entities/base.ts
// ============================================================================

/**
 * Base Entity with timestamps
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}