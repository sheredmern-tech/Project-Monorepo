// ===== FILE: src/modules/users/users.controller.ts (100% TYPE-SAFE) =====
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
  HttpCode,
  HttpStatus,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { ToggleStatusDto } from './dto/toggle-status.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkChangeRoleDto } from './dto/bulk-change-role.dto';
import { ExportUsersDto } from './dto/export-users.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { LogAktivitasService } from '../log-aktivitas/log-aktivitas.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logAktivitasService: LogAktivitasService,
  ) {}

  @Post()
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Buat user baru' })
  @ApiResponse({ status: 201, description: 'User berhasil dibuat' })
  create(@Body() dto: CreateUserDto, @CurrentUser('id') userId: string) {
    return this.usersService.create(dto, userId);
  }

  @Get()
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get semua users dengan pagination' })
  @ApiResponse({ status: 200, description: 'Data users berhasil diambil' })
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get('statistics')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get team statistics' })
  @ApiResponse({ status: 200, description: 'Team statistics retrieved' })
  getStatistics() {
    return this.usersService.getTeamStatistics();
  }

  @Get('workload-distribution')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get workload distribution across team' })
  @ApiResponse({ status: 200, description: 'Workload distribution retrieved' })
  getWorkloadDistribution() {
    return this.usersService.getWorkloadDistribution();
  }

  @Get('import-template')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Download CSV template for bulk import' })
  @ApiResponse({ status: 200, description: 'CSV template downloaded' })
  downloadTemplate(@Res() res: Response): void {
    const csv = [
      'email,nama_lengkap,role,jabatan,telepon',
      'john.doe@example.com,John Doe,advokat,Senior Partner,081234567890',
      'jane.smith@example.com,Jane Smith,paralegal,Paralegal,081298765432',
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=user-import-template.csv',
    );
    res.send(csv);
  }

  @Get('import-template-excel')
  @Roles(UserRole.admin)
  @ApiOperation({
    summary:
      'Download Excel template for bulk import with professional styling, borders, and data validation',
  })
  @ApiResponse({ status: 200, description: 'Excel template downloaded' })
  async downloadExcelTemplate(@Res() res: Response): Promise<void> {
    // ✅ Use ExcelJS for professional styling with borders, colors, and formatting
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();

    // ===== SHEET 1: Instructions =====
    const instructionsSheet = workbook.addWorksheet('Instructions', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    });

    // Instructions header
    instructionsSheet.columns = [
      { header: 'Field', key: 'field', width: 18 },
      { header: 'Required', key: 'required', width: 12 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Example', key: 'example', width: 30 },
    ];

    // Add instruction rows
    const instructions = [
      {
        field: 'email',
        required: 'YES',
        description: 'Email user (harus unik, format email valid)',
        example: 'john.doe@example.com',
      },
      {
        field: 'nama_lengkap',
        required: 'YES',
        description: 'Nama lengkap user',
        example: 'John Doe',
      },
      {
        field: 'role',
        required: 'YES',
        description: 'Role user: admin, advokat, paralegal, staff, atau klien',
        example: 'advokat',
      },
      {
        field: 'jabatan',
        required: 'NO',
        description: 'Jabatan atau posisi user (opsional)',
        example: 'Senior Partner',
      },
      {
        field: 'telepon',
        required: 'NO',
        description: 'Nomor telepon user (opsional)',
        example: '081234567890',
      },
    ];

    instructions.forEach((instruction) => {
      instructionsSheet.addRow(instruction);
    });

    // Style instructions header (row 1)
    instructionsSheet.getRow(1).font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    instructionsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    instructionsSheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    instructionsSheet.getRow(1).height = 25;

    // Add borders to all cells in instructions
    instructionsSheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        };
        if (rowNumber > 1) {
          cell.alignment = { vertical: 'middle', wrapText: true };
        }
      });
    });

    // Highlight required fields
    for (let i = 2; i <= instructions.length + 1; i++) {
      const requiredCell = instructionsSheet.getCell(`B${i}`);
      if (requiredCell.value === 'YES') {
        requiredCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFE699' },
        };
        requiredCell.font = { bold: true, color: { argb: 'FFD97706' } };
      } else {
        requiredCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' },
        };
        requiredCell.font = { color: { argb: 'FF70AD47' } };
      }
    }

    // ===== SHEET 2: Users (Template Data) =====
    const usersSheet = workbook.addWorksheet('Users', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    });

    // Users header
    usersSheet.columns = [
      { header: 'email', key: 'email', width: 35 },
      { header: 'nama_lengkap', key: 'nama_lengkap', width: 30 },
      { header: 'role', key: 'role', width: 18 },
      { header: 'jabatan', key: 'jabatan', width: 28 },
      { header: 'telepon', key: 'telepon', width: 20 },
    ];

    // Sample data
    const sampleUsers = [
      {
        email: 'john.doe@example.com',
        nama_lengkap: 'John Doe',
        role: 'advokat',
        jabatan: 'Senior Partner',
        telepon: '081234567890',
      },
      {
        email: 'jane.smith@example.com',
        nama_lengkap: 'Jane Smith',
        role: 'paralegal',
        jabatan: 'Paralegal',
        telepon: '081298765432',
      },
      {
        email: 'client@example.com',
        nama_lengkap: 'Client Name',
        role: 'klien',
        jabatan: 'CEO',
        telepon: '081234567891',
      },
    ];

    sampleUsers.forEach((user) => {
      usersSheet.addRow(user);
    });

    // Style users header
    usersSheet.getRow(1).font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    usersSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };
    usersSheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    usersSheet.getRow(1).height = 25;

    // Add borders and styling to all cells
    usersSheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        };

        // Alternate row colors for sample data
        if (rowNumber > 1) {
          cell.alignment = { vertical: 'middle' };
          if (rowNumber % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF2F2F2' },
            };
          }
        }
      });
    });

    // Add note row
    const noteRow = usersSheet.addRow([
      '← Delete sample rows above and add your data here',
      '',
      '',
      '',
      '',
    ]);
    noteRow.font = { italic: true, color: { argb: 'FF666666' } };
    noteRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF2CC' },
    };
    noteRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      };
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=user-import-template.xlsx',
    );
    res.send(Buffer.from(buffer));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detail user by ID' })
  @ApiResponse({ status: 200, description: 'Detail user berhasil diambil' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get user activity logs' })
  @ApiResponse({ status: 200, description: 'Activity logs retrieved' })
  getUserActivity(
    @Param('id') userId: string,
    @Query() query: { page?: number; limit?: number },
  ) {
    return this.logAktivitasService.findByUser(userId, query);
  }

  @Patch(':id')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User berhasil diupdate' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Hapus user by ID' })
  @ApiResponse({ status: 200, description: 'User berhasil dihapus' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.usersService.remove(id, userId);
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'Reset user password (generate temporary password)',
  })
  @ApiResponse({
    status: 200,
    description: 'Password berhasil direset',
    schema: {
      type: 'object',
      properties: {
        temporary_password: { type: 'string', example: 'a3f8b2c9d1' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  resetPassword(@Param('id') id: string) {
    return this.usersService.resetUserPassword(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Toggle user active status' })
  @ApiResponse({ status: 200, description: 'Status berhasil diubah' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  toggleStatus(@Param('id') id: string, @Body() dto: ToggleStatusDto) {
    return this.usersService.toggleUserStatus(id, dto.active);
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Avatar berhasil diupload',
    schema: {
      type: 'object',
      properties: {
        avatar_url: {
          type: 'string',
          example: '/uploads/avatars/user-123_1234567890.jpg',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'File tidak valid' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(id, file);
  }

  @Delete(':id/avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user avatar' })
  @ApiResponse({ status: 204, description: 'Avatar berhasil dihapus' })
  @ApiResponse({ status: 400, description: 'User tidak memiliki avatar' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  async deleteAvatar(@Param('id') id: string) {
    await this.usersService.deleteAvatar(id);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Bulk delete users' })
  @ApiResponse({
    status: 200,
    description: 'Bulk delete operation completed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'number', example: 3 },
        failed: { type: 'number', example: 1 },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              user_id: { type: 'string' },
              email: { type: 'string' },
              reason: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid user IDs' })
  bulkDelete(
    @Body() dto: BulkDeleteDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.usersService.bulkDeleteUsers(dto.user_ids, currentUserId);
  }

  @Post('bulk-change-role')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Bulk change user roles' })
  @ApiResponse({ status: 200, description: 'Bulk role change completed' })
  @ApiResponse({ status: 400, description: 'Invalid user IDs or role' })
  bulkChangeRole(
    @Body() dto: BulkChangeRoleDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.usersService.bulkChangeRole(
      dto.user_ids,
      dto.role,
      currentUserId,
    );
  }

  @Post(':id/send-invitation')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Send invitation email to user' })
  @ApiResponse({
    status: 200,
    description: 'Invitation email sent',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Invitation email sent successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  sendInvitation(@Param('id') id: string) {
    return this.usersService.sendInvitationEmail(id);
  }

  @Post(':id/resend-invitation')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Resend invitation email to user' })
  @ApiResponse({ status: 200, description: 'Invitation email resent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  resendInvitation(@Param('id') id: string) {
    return this.usersService.resendInvitationEmail(id);
  }

  @Post('bulk-import')
  @Roles(UserRole.admin)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Bulk import users from CSV' })
  @ApiResponse({
    status: 201,
    description: 'Bulk import completed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'number', example: 5 },
        failed: { type: 'number', example: 1 },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              row: { type: 'number' },
              email: { type: 'string' },
              reason: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async bulkImport(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.usersService.bulkImportUsers(file, userId);
  }

  @Post('export')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Export users to CSV/Excel (local download)' })
  @ApiResponse({ status: 200, description: 'Users exported successfully' })
  async exportUsers(
    @Body() dto: ExportUsersDto,
    @Res() res: Response,
  ): Promise<void> {
    const { format, filters } = dto;

    // ✅ Type-safe: filters sudah QueryUserDto | undefined dari DTO
    const queryFilters: QueryUserDto = filters || {};
    const result = await this.usersService.findAll(queryFilters);
    const users = result.data;

    if (format === 'csv') {
      const csv = Papa.unparse(users);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=users-export-${Date.now()}.csv`,
      );
      res.send(csv);
      return;
    }

    // Excel export
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // ✅ Type-safe: Cast result to Buffer explicitly
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=users-export-${Date.now()}.xlsx`,
    );
    res.send(buffer);
  }

  @Post('export-to-drive')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Export users to Google Drive' })
  @ApiResponse({
    status: 200,
    description: 'Users exported to Google Drive successfully',
    schema: {
      type: 'object',
      properties: {
        fileId: { type: 'string', example: '1a2b3c4d5e6f7g8h9i0j' },
        fileName: { type: 'string', example: 'users-export-1234567890.xlsx' },
        webViewLink: {
          type: 'string',
          example: 'https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/view',
        },
        webContentLink: {
          type: 'string',
          example:
            'https://drive.google.com/uc?id=1a2b3c4d5e6f7g8h9i0j&export=download',
        },
        embedLink: {
          type: 'string',
          example: 'https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/preview',
        },
      },
    },
  })
  async exportToGoogleDrive(@Body() dto: ExportUsersDto) {
    const { format, filters } = dto;
    return this.usersService.exportUsersToGoogleDrive(format, filters);
  }

  @Get('drive-files')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'List import files from Google Drive' })
  @ApiResponse({
    status: 200,
    description: 'List of CSV/Excel files in Google Drive',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          mimeType: { type: 'string' },
          size: { type: 'string' },
          createdTime: { type: 'string' },
          modifiedTime: { type: 'string' },
          webViewLink: { type: 'string' },
        },
      },
    },
  })
  listGoogleDriveFiles() {
    return this.usersService.listGoogleDriveImportFiles();
  }

  @Post('import-from-drive/:fileId')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Import users from Google Drive file' })
  @ApiResponse({
    status: 200,
    description: 'Import completed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'number', example: 5 },
        failed: { type: 'number', example: 1 },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              row: { type: 'number' },
              email: { type: 'string' },
              reason: { type: 'string' },
            },
          },
        },
      },
    },
  })
  importFromGoogleDrive(
    @Param('fileId') fileId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.importUsersFromGoogleDrive(fileId, userId);
  }
}
