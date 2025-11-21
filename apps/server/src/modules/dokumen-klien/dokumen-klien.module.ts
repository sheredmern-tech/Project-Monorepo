// ===== FILE: src/modules/dokumen-klien/dokumen-klien.module.ts =====
import { Module } from '@nestjs/common';
import { DokumenKlienService } from './dokumen-klien.service';
import { DokumenKlienController } from './dokumen-klien.controller';
import { GoogleDriveModule } from '../google-drive/google-drive.module';

@Module({
  imports: [GoogleDriveModule], // ✅ Import for Google Drive integration
  controllers: [DokumenKlienController],
  providers: [DokumenKlienService],
  exports: [DokumenKlienService],
})
export class DokumenKlienModule {}
