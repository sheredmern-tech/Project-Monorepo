// ============================================================================
// FILE: types/entities/tim-perkara.ts
// ============================================================================

import { StatusPerkara } from "../enums";
import { KlienBasic } from "./klien";
import { UserPublic } from "./user";

/**
 * Tim Perkara Entity - Complete data
 */
export interface TimPerkaraEntity {
  id: string;
  perkara_id: string;
  user_id: string;
  peran: string | null;
  tanggal_ditugaskan: string;
}

/**
 * Tim Perkara with Relations
 */
export interface TimPerkaraWithRelations extends TimPerkaraEntity {
  perkara: {
    id: string;
    nomor_perkara: string;
    judul: string;
    status: StatusPerkara;
    klien: KlienBasic | null;
  };
  user: UserPublic;
}