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
  UploadedFiles,
  Header,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { DokumenService } from './dokumen.service';
import { DokumenStatusService } from './dokumen-status.service';
import { CreateDokumenDto } from './dto/create-dokumen.dto';
import { UpdateDokumenDto } from './dto/update-dokumen.dto';
import { QueryDokumenDto } from './dto/query-dokumen.dto';
import { SubmitDokumenDto, BulkSubmitDokumenDto } from './dto/submit-dokumen.dto';
import { ReviewDokumenDto } from './dto/review-dokumen.dto';
import { ApproveDokumenDto, BulkApproveDokumenDto } from './dto/approve-dokumen.dto';
import { RejectDokumenDto, BulkRejectDokumenDto } from './dto/reject-dokumen.dto';
import { ArchiveDokumenDto } from './dto/archive-dokumen.dto';
import { QueryWorkflowDto } from './dto/query-workflow.dto';
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
    private readonly dokumenStatusService: DokumenStatusService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  @Post()
  @Roles(UserRole.admin, UserRole.partner, UserRole.advokat, UserRole.paralegal, UserRole.staff, UserRole.klien)
  @ApiOperation({ summary: 'Upload dokumen baru' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Dokumen berhasil diupload' })
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false, // ✅ Allow file field in multipart form
    transform: true
  }))
  create(
    @Body() dto: CreateDokumenDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenService.create(dto, file, userId, userRole);
  }

  @Post('bulk')
  @Roles(UserRole.admin, UserRole.partner, UserRole.advokat, UserRole.paralegal, UserRole.staff, UserRole.klien)
  @ApiOperation({ summary: 'Upload multiple dokumen sekaligus' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Dokumen berhasil diupload' })
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true
  }))
  createBulk(
    @Body() dto: CreateDokumenDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenService.createBulk(dto, files, userId, userRole);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.partner, UserRole.advokat, UserRole.paralegal, UserRole.staff, UserRole.klien)
  @ApiOperation({ summary: 'Get semua dokumen dengan pagination' })
  @ApiResponse({ status: 200, description: 'Data dokumen berhasil diambil' })
  findAll(
    @Query() query: QueryDokumenDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenService.findAll(query, userId, userRole);
  }

  @Get('stats')
  @Roles(UserRole.admin, UserRole.partner, UserRole.advokat, UserRole.paralegal, UserRole.staff, UserRole.klien)
  @ApiOperation({ summary: 'Get statistik dokumen' })
  @ApiResponse({ status: 200, description: 'Statistik dokumen berhasil diambil' })
  getStats(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenService.getStats(userId, userRole);
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.partner, UserRole.advokat, UserRole.paralegal, UserRole.staff, UserRole.klien)
  @ApiOperation({ summary: 'Get detail dokumen by ID' })
  @ApiResponse({ status: 200, description: 'Detail dokumen berhasil diambil' })
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenService.findOne(id, userId, userRole);
  }

  @Get(':id/download')
  @Roles(UserRole.admin, UserRole.partner, UserRole.advokat, UserRole.paralegal, UserRole.staff, UserRole.klien)
  @ApiOperation({ summary: 'Download dokumen by ID' })
  @ApiResponse({ status: 200, description: 'Dokumen berhasil didownload' })
  download(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenService.download(id, userId, userRole);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.partner, UserRole.advokat, UserRole.paralegal)
  @ApiOperation({ summary: 'Update dokumen by ID' })
  @ApiResponse({ status: 200, description: 'Dokumen berhasil diupdate' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDokumenDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenService.update(id, dto, userId, userRole);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.partner, UserRole.advokat)
  @ApiOperation({ summary: 'Hapus dokumen by ID' })
  @ApiResponse({ status: 200, description: 'Dokumen berhasil dihapus' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenService.remove(id, userId, userRole);
  }

  @Patch(':id/move')
  @Roles(UserRole.admin, UserRole.partner, UserRole.advokat, UserRole.paralegal, UserRole.staff, UserRole.klien)
  @ApiOperation({ summary: 'Pindahkan dokumen ke folder lain' })
  @ApiResponse({ status: 200, description: 'Dokumen berhasil dipindahkan' })
  move(
    @Param('id') id: string,
    @Body() body: { folder_id: string | null },
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenService.moveToFolder(id, body.folder_id, userId, userRole);
  }

  @Post(':id/copy')
  @Roles(UserRole.admin, UserRole.partner, UserRole.advokat, UserRole.paralegal, UserRole.staff)
  @ApiOperation({ summary: 'Copy dokumen' })
  @ApiResponse({ status: 201, description: 'Dokumen berhasil dicopy' })
  copy(
    @Param('id') id: string,
    @Body() body: { folder_id?: string | null; nama_dokumen?: string },
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenService.copyDocument(id, body.folder_id, body.nama_dokumen, userId, userRole);
  }

  // ============================================================================
  // WORKFLOW ENDPOINTS
  // ============================================================================

  @Post(':id/submit')
  @Roles(UserRole.advokat, UserRole.paralegal, UserRole.staff)
  @ApiOperation({ summary: 'Submit document for review (DRAFT -> SUBMITTED)' })
  @ApiResponse({ status: 200, description: 'Document submitted for review' })
  submitDocument(
    @Param('id') id: string,
    @Body() dto: SubmitDokumenDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenStatusService.submitDocument(id, userId, userRole, dto);
  }

  @Post('workflow/bulk-submit')
  @Roles(UserRole.advokat, UserRole.paralegal, UserRole.staff)
  @ApiOperation({ summary: 'Bulk submit documents for review' })
  @ApiResponse({ status: 200, description: 'Bulk submission completed' })
  bulkSubmitDocuments(
    @Body() dto: BulkSubmitDokumenDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenStatusService.bulkSubmitDocuments(userId, userRole, dto);
  }

  @Post(':id/review')
  @Roles(UserRole.admin, UserRole.partner)
  @ApiOperation({ summary: 'Start reviewing document (SUBMITTED -> IN_REVIEW)' })
  @ApiResponse({ status: 200, description: 'Document review started' })
  reviewDocument(
    @Param('id') id: string,
    @Body() dto: ReviewDokumenDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenStatusService.reviewDocument(id, userId, userRole, dto);
  }

  @Post(':id/approve')
  @Roles(UserRole.admin, UserRole.partner)
  @ApiOperation({ summary: 'Approve document (IN_REVIEW -> APPROVED)' })
  @ApiResponse({ status: 200, description: 'Document approved' })
  approveDocument(
    @Param('id') id: string,
    @Body() dto: ApproveDokumenDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenStatusService.approveDocument(id, userId, userRole, dto);
  }

  @Post('workflow/bulk-approve')
  @Roles(UserRole.admin, UserRole.partner)
  @ApiOperation({ summary: 'Bulk approve documents' })
  @ApiResponse({ status: 200, description: 'Bulk approval completed' })
  bulkApproveDocuments(
    @Body() dto: BulkApproveDokumenDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenStatusService.bulkApproveDocuments(userId, userRole, dto);
  }

  @Post(':id/reject')
  @Roles(UserRole.admin, UserRole.partner)
  @ApiOperation({ summary: 'Reject document (IN_REVIEW -> REJECTED)' })
  @ApiResponse({ status: 200, description: 'Document rejected' })
  rejectDocument(
    @Param('id') id: string,
    @Body() dto: RejectDokumenDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenStatusService.rejectDocument(id, userId, userRole, dto);
  }

  @Post('workflow/bulk-reject')
  @Roles(UserRole.admin, UserRole.partner)
  @ApiOperation({ summary: 'Bulk reject documents' })
  @ApiResponse({ status: 200, description: 'Bulk rejection completed' })
  bulkRejectDocuments(
    @Body() dto: BulkRejectDokumenDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenStatusService.bulkRejectDocuments(userId, userRole, dto);
  }

  @Post(':id/archive')
  @Roles(UserRole.admin, UserRole.partner)
  @ApiOperation({ summary: 'Archive document (ANY -> ARCHIVED)' })
  @ApiResponse({ status: 200, description: 'Document archived' })
  archiveDocument(
    @Param('id') id: string,
    @Body() dto: ArchiveDokumenDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.dokumenStatusService.archiveDocument(id, userId, userRole, dto);
  }

  @Get(':id/history')
  @Roles(UserRole.admin, UserRole.partner, UserRole.advokat, UserRole.paralegal, UserRole.staff)
  @ApiOperation({ summary: 'Get document status change history' })
  @ApiResponse({ status: 200, description: 'Document history retrieved' })
  getDocumentHistory(@Param('id') id: string) {
    return this.dokumenStatusService.getDocumentHistory(id);
  }

  @Get('workflow/queue')
  @Roles(UserRole.admin, UserRole.partner, UserRole.advokat, UserRole.paralegal, UserRole.staff)
  @ApiOperation({ summary: 'Get documents by workflow status (review queue)' })
  @ApiResponse({ status: 200, description: 'Documents retrieved' })
  getWorkflowQueue(@Query() query: QueryWorkflowDto) {
    return this.dokumenStatusService.getDocumentsByStatus(query);
  }

  @Get('workflow/stats')
  @Roles(UserRole.admin, UserRole.partner, UserRole.advokat, UserRole.paralegal, UserRole.staff)
  @ApiOperation({ summary: 'Get workflow statistics' })
  @ApiResponse({ status: 200, description: 'Workflow statistics retrieved' })
  getWorkflowStats(@Query('perkara_id') perkaraId?: string) {
    return this.dokumenStatusService.getWorkflowStats(perkaraId);
  }

  // ============================================================================
  // TEST ENDPOINTS
  // ============================================================================

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
