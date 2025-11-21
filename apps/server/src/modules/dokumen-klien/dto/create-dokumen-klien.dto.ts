// ===== FILE: src/modules/dokumen-klien/dto/create-dokumen-klien.dto.ts =====
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';

export class CreateDokumenKlienDto {
  @ApiProperty({
    description: 'Nama dokumen',
    example: 'Surat_Kuasa_2024.pdf',
  })
  @IsString()
  nama_dokumen: string;

  @ApiPropertyOptional({
    description: 'Tipe dokumen',
    example: 'surat_kuasa',
    enum: [
      'surat_kuasa',
      'gugatan',
      'putusan',
      'bukti',
      'kontrak',
      'surat_menyurat',
      'lainnya',
    ],
  })
  @IsString()
  @IsOptional()
  tipe_dokumen?: string;

  @ApiPropertyOptional({
    description: 'Deskripsi dokumen',
    example: 'Surat kuasa untuk perkara ABC',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  deskripsi?: string;

  @ApiPropertyOptional({
    description: 'Kategori dokumen',
    example: 'Legal',
  })
  @IsString()
  @IsOptional()
  kategori?: string;

  @ApiPropertyOptional({
    description: 'Tags untuk pencarian',
    example: ['urgent', 'perkara-abc'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
