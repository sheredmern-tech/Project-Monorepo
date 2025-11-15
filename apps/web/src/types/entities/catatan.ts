// ============================================================================
// FILE: types/entities/catatan.ts
// ============================================================================

import { BaseEntity } from "./base";
import { UserBasic } from "./user";

/**
 * Catatan Perkara Entity - Complete data
 */
export interface CatatanPerkaraEntity extends BaseEntity {
  perkara_id: string;
  user_id: string | null;
  catatan: string;
  dapat_ditagih: boolean;
  jam_kerja: number | null;
}

/**
 * Catatan with Relations
 */
export interface CatatanWithRelations extends CatatanPerkaraEntity {
  perkara: {
    id: string;
    nomor_perkara: string;
    judul: string;
  };
  user: UserBasic | null;
}
