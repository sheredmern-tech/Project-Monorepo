// ============================================================================
// FILE: types/dto/users.dto.ts
// ============================================================================
import { QueryFilters } from "../api";
import { UserRole } from "../enums";

/**
 * Query Users DTO
 */
export interface QueryUsersDto extends QueryFilters {
  role?: UserRole;
}