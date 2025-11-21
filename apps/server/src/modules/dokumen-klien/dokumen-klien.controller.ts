// ============================================================================
// FILE: src/modules/dokumen-klien/dokumen-klien.controller.ts
// Dokumen Klien Controller - WITH RBAC (klien role ONLY)
// ============================================================================
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { DokumenKlienService } from './dokumen-klien.service';
import { CreateDokumenKlienDto } from './dto/create-dokumen-klien.dto';
import { UpdateDokumenKlienDto } from './dto/update-dokumen-klien.dto';
import { QueryDokumenKlienDto } from './dto/query-dokumen-klien.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Dokumen Klien (Client Self-Service)')
@ApiBearerAuth()
@Controller('dokumen-klien')
@UseGuards(RolesGuard)
@Roles(UserRole.klien) // ✅ CRITICAL: Only klien role can access
export class DokumenKlienController {
  constructor(private readonly dokumenKlienService: DokumenKlienService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload dokumen (bulk upload support)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Dokumen berhasil diupload' })
  @UseInterceptors(FilesInterceptor('files', 20)) // Max 20 files per upload
  upload(
    @Body() dto: CreateDokumenKlienDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser('id') userId: string,
  ) {
    return this.dokumenKlienService.upload(files, dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents (filtered by user)' })
  @ApiResponse({ status: 200, description: 'Data dokumen berhasil diambil' })
  findAll(
    @Query() query: QueryDokumenKlienDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.dokumenKlienService.findAll(query, userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistik dashboard berhasil diambil',
  })
  getStats(@CurrentUser('id') userId: string) {
    return this.dokumenKlienService.getStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single document by ID' })
  @ApiResponse({ status: 200, description: 'Detail dokumen berhasil diambil' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.dokumenKlienService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document metadata (not the file)' })
  @ApiResponse({ status: 200, description: 'Dokumen berhasil diupdate' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDokumenKlienDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.dokumenKlienService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document (soft delete)' })
  @ApiResponse({ status: 200, description: 'Dokumen berhasil dihapus' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.dokumenKlienService.remove(id, userId);
  }
}
