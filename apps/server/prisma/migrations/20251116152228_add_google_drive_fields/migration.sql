-- ============================================================================
-- Migration: Add Google Drive API Fields to DokumenHukum
-- ============================================================================
-- This migration adds Google Drive integration fields to store files in
-- Google Drive instead of local server storage.
-- ============================================================================

-- AlterTable: Make file_path nullable (for backward compatibility with local files)
ALTER TABLE "dokumen_hukum" ALTER COLUMN "file_path" DROP NOT NULL;

-- AlterTable: Add Google Drive fields
ALTER TABLE "dokumen_hukum" ADD COLUMN "google_drive_id" TEXT;
ALTER TABLE "dokumen_hukum" ADD COLUMN "google_drive_link" TEXT;
ALTER TABLE "dokumen_hukum" ADD COLUMN "embed_link" TEXT;

-- Add comments for documentation
COMMENT ON COLUMN "dokumen_hukum"."file_path" IS 'Legacy local file path (nullable for Google Drive files)';
COMMENT ON COLUMN "dokumen_hukum"."google_drive_id" IS 'Google Drive file ID';
COMMENT ON COLUMN "dokumen_hukum"."google_drive_link" IS 'Google Drive shareable/download link';
COMMENT ON COLUMN "dokumen_hukum"."embed_link" IS 'Google Drive embed preview link';
