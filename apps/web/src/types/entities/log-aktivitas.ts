// ============================================================================
// FILE: types/entities/log-aktivitas.ts
// ============================================================================

import { UserBasic } from "./user";

/**
 * Log Aktivitas Entity - Complete data
 */
export interface LogAktivitasEntity {
  id: string;
  user_id: string | null;
  aksi: string;
  jenis_entitas: string | null;
  id_entitas: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Log Aktivitas with User
 */
export interface LogAktivitasWithUser extends LogAktivitasEntity {
  user: UserBasic | null;
}