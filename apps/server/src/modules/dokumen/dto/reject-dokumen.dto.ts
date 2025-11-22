// ===== FILE: src/modules/dokumen/dto/reject-dokumen.dto.ts =====
import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RejectDokumenDto {
  @ApiProperty({
    description: 'Reason for rejection (required)',
    example: 'Dokumen tidak lengkap, perlu ditambahkan lampiran A dan B'
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Silakan perbaiki dan submit ulang sebelum tanggal 30 Desember'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkRejectDokumenDto {
  @ApiPropertyOptional({
    description: 'Array of document IDs to reject',
    example: ['uuid-1', 'uuid-2']
  })
  @IsArray()
  @IsUUID('4', { each: true })
  dokumen_ids: string[];

  @ApiProperty({
    description: 'Reason for rejection (required)',
    example: 'Format dokumen tidak sesuai standar'
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Gunakan template yang sudah disediakan'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
