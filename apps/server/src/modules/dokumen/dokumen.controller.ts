// ============================================================================
// FILE: server/src/modules/dokumen/dokumen.controller.ts - WITH RBAC
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
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { DokumenService } from './dokumen.service';
import { CreateDokumenDto } from './dto/create-dokumen.dto';
import { UpdateDokumenDto } from './dto/update-dokumen.dto';
import { QueryDokumenDto } from './dto/query-dokumen.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { GoogleDriveService } from '../google-drive/google-drive.service';

@ApiTags('Dokumen Hukum')
@ApiBearerAuth()
@Controller('dokumen')
@UseGuards(RolesGuard)
export class DokumenController {
  constructor(
    private readonly dokumenService: DokumenService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  @Post()
  @Roles(UserRole.admin, UserRole.advokat, UserRole.paralegal, UserRole.staff)
  @ApiOperation({ summary: 'Upload dokumen baru' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Dokumen berhasil diupload' })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() dto: CreateDokumenDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    return this.dokumenService.create(dto, file, userId);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.advokat, UserRole.paralegal, UserRole.staff)
  @ApiOperation({ summary: 'Get semua dokumen dengan pagination' })
  @ApiResponse({ status: 200, description: 'Data dokumen berhasil diambil' })
  findAll(
    @Query() query: QueryDokumenDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole, // ✅ AMBIL ROLE
  ) {
    return this.dokumenService.findAll(query, userId, userRole);
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.advokat, UserRole.paralegal, UserRole.staff)
  @ApiOperation({ summary: 'Get detail dokumen by ID' })
  @ApiResponse({ status: 200, description: 'Detail dokumen berhasil diambil' })
  findOne(@Param('id') id: string) {
    return this.dokumenService.findOne(id);
  }

  @Get(':id/download')
  @Roles(UserRole.admin, UserRole.advokat, UserRole.paralegal, UserRole.staff)
  @ApiOperation({ summary: 'Download dokumen by ID' })
  @ApiResponse({ status: 200, description: 'Dokumen berhasil didownload' })
  download(@Param('id') id: string) {
    return this.dokumenService.download(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.advokat, UserRole.paralegal)
  @ApiOperation({ summary: 'Update dokumen by ID' })
  @ApiResponse({ status: 200, description: 'Dokumen berhasil diupdate' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDokumenDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.dokumenService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.advokat)
  @ApiOperation({ summary: 'Hapus dokumen by ID' })
  @ApiResponse({ status: 200, description: 'Dokumen berhasil dihapus' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.dokumenService.remove(id, userId);
  }

  @Get('test/google-drive-connection')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Test Google Drive API connection (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Google Drive connection test results',
  })
  testGoogleDriveConnection() {
    return this.googleDriveService.testConnection();
  }

  @Get('test/google-drive-folder')
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'Test Google Drive folder access and permissions (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Folder access test results',
  })
  testGoogleDriveFolder() {
    return this.googleDriveService.testFolderAccess();
  }
}
