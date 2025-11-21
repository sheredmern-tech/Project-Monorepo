// ===== FILE: src/modules/dokumen-klien/dto/query-dokumen-klien.dto.ts =====
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class QueryDokumenKlienDto {
  @ApiPropertyOptional({ description: 'Search by nama_dokumen' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by tipe_dokumen' })
  @IsOptional()
  @IsString()
  tipe_dokumen?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort by field',
    default: 'uploaded_at',
    enum: ['uploaded_at', 'nama_dokumen'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'uploaded_at';

  @ApiPropertyOptional({
    description: 'Sort order',
    default: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
