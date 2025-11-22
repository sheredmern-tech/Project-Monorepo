// ===== FILE: src/modules/dokumen/dto/archive-dokumen.dto.ts =====
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ArchiveDokumenDto {
  @ApiPropertyOptional({
    description: 'Optional reason for archiving',
    example: 'Dokumen sudah tidak relevan dengan kasus terkini'
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Dokumen versi lama, sudah diganti dengan versi baru'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
