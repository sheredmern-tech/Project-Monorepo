// ===== FILE: src/modules/users/users.module.ts (NO CIRCULAR DEPENDENCY) =====
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { LogAktivitasModule } from '../log-aktivitas/log-aktivitas.module';
import { GoogleDriveModule } from '../google-drive/google-drive.module';

@Module({
  imports: [
    LogAktivitasModule, // ✅ Import untuk inject LogAktivitasService
    GoogleDriveModule, // ✅ Import untuk inject GoogleDriveService
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // ✅ Export untuk digunakan module lain
})
export class UsersModule {}
