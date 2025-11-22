// ===== FILE: src/modules/dokumen/dto/review-dokumen.dto.ts =====
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewDokumenDto {
  @ApiPropertyOptional({
    description: 'Optional notes when starting review',
    example: 'Memulai review dokumen untuk kelengkapan'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
