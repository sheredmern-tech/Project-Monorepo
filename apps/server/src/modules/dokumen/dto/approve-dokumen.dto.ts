// ===== FILE: src/modules/dokumen/dto/approve-dokumen.dto.ts =====
import { IsOptional, IsString, IsArray, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveDokumenDto {
  @ApiPropertyOptional({
    description: 'Optional notes when approving document',
    example: 'Dokumen telah disetujui dan siap dipublikasi ke klien'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkApproveDokumenDto {
  @ApiPropertyOptional({
    description: 'Array of document IDs to approve',
    example: ['uuid-1', 'uuid-2']
  })
  @IsArray()
  @IsUUID('4', { each: true })
  dokumen_ids: string[];

  @ApiPropertyOptional({
    description: 'Optional notes for bulk approval',
    example: 'Batch approval for monthly documents'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
