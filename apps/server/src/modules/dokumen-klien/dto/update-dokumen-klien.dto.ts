// ===== FILE: src/modules/dokumen-klien/dto/update-dokumen-klien.dto.ts =====
import { PartialType } from '@nestjs/swagger';
import { CreateDokumenKlienDto } from './create-dokumen-klien.dto';

export class UpdateDokumenKlienDto extends PartialType(CreateDokumenKlienDto) {}
