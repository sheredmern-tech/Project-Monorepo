// ===== FILE: src/modules/dokumen/dokumen.module.ts =====
import { Module } from '@nestjs/common';
import { DokumenService } from './dokumen.service';
import { DokumenStatusService } from './dokumen-status.service';
import { DokumenController } from './dokumen.controller';
import { GoogleDriveModule } from '../google-drive/google-drive.module';
import { PerkaraModule } from '../perkara/perkara.module';

@Module({
  imports: [GoogleDriveModule, PerkaraModule], // ✅ Import for cache invalidation
  controllers: [DokumenController],
  providers: [DokumenService, DokumenStatusService],
  exports: [DokumenService, DokumenStatusService],
})
export class DokumenModule {}
