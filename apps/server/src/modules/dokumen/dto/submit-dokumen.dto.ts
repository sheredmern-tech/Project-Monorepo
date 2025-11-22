// ===== FILE: src/modules/dokumen/dto/submit-dokumen.dto.ts =====
import { IsOptional, IsString, IsArray, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitDokumenDto {
  @ApiPropertyOptional({
    description: 'Optional notes when submitting document for review',
    example: 'Dokumen telah siap untuk direview'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkSubmitDokumenDto {
  @ApiPropertyOptional({
    description: 'Array of document IDs to submit',
    example: ['uuid-1', 'uuid-2']
  })
  @IsArray()
  @IsUUID('4', { each: true })
  dokumen_ids: string[];

  @ApiPropertyOptional({
    description: 'Optional notes for bulk submission',
    example: 'Batch submission for case XYZ'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
