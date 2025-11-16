// ============================================================================
// FILE: src/modules/google-drive/google-drive.module.ts
// Google Drive Module
// ============================================================================
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleDriveService } from './google-drive.service';

@Module({
  imports: [ConfigModule],
  providers: [GoogleDriveService],
  exports: [GoogleDriveService],
})
export class GoogleDriveModule {}
