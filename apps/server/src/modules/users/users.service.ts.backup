// ===== FILE: src/modules/users/users.service.ts (COMPLETE FIXED) =====
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { StorageService } from '../storage/storage.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import {
  PaginatedResult,
  UserEntity,
  UserWithStats,
  CreateLogAktivitasData,
} from '../../common/interfaces';
import {
  TeamStatistics,
  WorkloadDistribution,
  BulkOperationResult,
} from '../../common/interfaces/statistics.interface';
import { Readable } from 'stream';

type UserWithoutPassword = Omit<UserEntity, 'password'>;

const userSelectWithoutPassword = {
  id: true,
  email: true,
  nama_lengkap: true,
  role: true,
  jabatan: true,
  nomor_kta: true,
  nomor_berita_acara: true,
  spesialisasi: true,
  avatar_url: true,
  telepon: true,
  alamat: true,
  is_active: true,
  tanggal_bergabung: true,
  created_at: true,
  updated_at: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private email: EmailService,
    private config: ConfigService,
    private googleDrive: GoogleDriveService,
  ) { }

  async create(
    dto: CreateUserDto,
    creatorId: string,
  ): Promise<UserWithoutPassword> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        nama_lengkap: dto.nama_lengkap,
        role: dto.role,
        jabatan: dto.jabatan || null,
        nomor_kta: dto.nomor_kta || null,
        nomor_berita_acara: dto.nomor_berita_acara || null,
        spesialisasi: dto.spesialisasi || null,
        telepon: dto.telepon || null,
        alamat: dto.alamat || null,
      },
      select: userSelectWithoutPassword,
    });

    const logData: CreateLogAktivitasData = {
      user_id: creatorId,
      aksi: 'CREATE_USER',
      jenis_entitas: 'user',
      id_entitas: user.id,
      detail: {
        email: user.email,
        nama: user.nama_lengkap,
      },
    };

    await this.prisma.logAktivitas.create({
      data: logData,
    });

    return user;
  }

  async findAll(
    query: QueryUserDto,
  ): Promise<PaginatedResult<UserWithoutPassword>> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { nama_lengkap: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { jabatan: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: userSelectWithoutPassword,
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<UserWithStats> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nama_lengkap: true,
        role: true,
        jabatan: true,
        nomor_kta: true,
        nomor_berita_acara: true,
        spesialisasi: true,
        avatar_url: true,
        telepon: true,
        alamat: true,
        is_active: true,
        tanggal_bergabung: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            perkara_dibuat: true,
            tugas_ditugaskan: true,
            tim_perkara: true,
            klien_dibuat: true,
            dokumen_diunggah: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    updaterId: string,
  ): Promise<UserWithoutPassword> {
    await this.findOne(id);

    if (dto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
          NOT: { id },
        },
      });

      if (existingUser) {
        throw new BadRequestException('Email sudah digunakan user lain');
      }
    }

    const updateData: Prisma.UserUpdateInput = { ...dto };

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelectWithoutPassword,
    });

    const logData: CreateLogAktivitasData = {
      user_id: updaterId,
      aksi: 'UPDATE_USER',
      jenis_entitas: 'user',
      id_entitas: user.id,
      detail: { email: user.email },
    };

    await this.prisma.logAktivitas.create({
      data: logData,
    });

    return user;
  }

  async remove(id: string, deleterId: string): Promise<{ message: string }> {
    const user = await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    const logData: CreateLogAktivitasData = {
      user_id: deleterId,
      aksi: 'DELETE_USER',
      jenis_entitas: 'user',
      id_entitas: id,
      detail: { email: user.email },
    };

    await this.prisma.logAktivitas.create({
      data: logData,
    });

    return { message: 'User berhasil dihapus' };
  }

  async resetUserPassword(id: string): Promise<{ temporary_password: string }> {
    const user = await this.findOne(id);

    const temporaryPassword = crypto.randomBytes(5).toString('hex');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    await this.prisma.logAktivitas.create({
      data: {
        user_id: id,
        aksi: 'RESET_PASSWORD',
        jenis_entitas: 'user',
        id_entitas: id,
        detail: {
          email: user.email,
          reset_by: 'admin',
        },
      },
    });

    console.log('✅ Password reset for user:', user.email);

    return { temporary_password: temporaryPassword };
  }

  async toggleUserStatus(
    id: string,
    active: boolean,
  ): Promise<UserWithoutPassword> {
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { is_active: active },
      select: userSelectWithoutPassword,
    });

    await this.prisma.logAktivitas.create({
      data: {
        user_id: id,
        aksi: active ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        jenis_entitas: 'user',
        id_entitas: id,
        detail: {
          email: user.email,
          status: active ? 'active' : 'inactive',
        },
      },
    });

    console.log(`✅ User ${active ? 'activated' : 'deactivated'}:`, user.email);

    return user;
  }

  async uploadAvatar(
    id: string,
    file: Express.Multer.File,
  ): Promise<{ avatar_url: string }> {
    const user = await this.findOne(id);

    if (user.avatar_url) {
      await this.storage.deleteFile(user.avatar_url);
    }

    const filepath = await this.storage.uploadFile(file, 'avatars', id);

    await this.prisma.user.update({
      where: { id },
      data: { avatar_url: filepath },
    });

    await this.prisma.logAktivitas.create({
      data: {
        user_id: id,
        aksi: 'UPLOAD_AVATAR',
        jenis_entitas: 'user',
        id_entitas: id,
        detail: {
          email: user.email,
          avatar_url: filepath,
        },
      },
    });

    console.log('✅ Avatar uploaded for user:', user.email);

    return { avatar_url: this.storage.getFileUrl(filepath) };
  }

  async deleteAvatar(id: string): Promise<void> {
    const user = await this.findOne(id);

    if (!user.avatar_url) {
      throw new BadRequestException('User tidak memiliki avatar');
    }

    await this.storage.deleteFile(user.avatar_url);

    await this.prisma.user.update({
      where: { id },
      data: { avatar_url: null },
    });

    await this.prisma.logAktivitas.create({
      data: {
        user_id: id,
        aksi: 'DELETE_AVATAR',
        jenis_entitas: 'user',
        id_entitas: id,
        detail: { email: user.email },
      },
    });

    console.log('✅ Avatar deleted for user:', user.email);
  }

  async getTeamStatistics(): Promise<TeamStatistics> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      total_users,
      adminCount,
      advokatCount,
      paralegalCount,
      staffCount,
      klienCount,
      active_users,
      inactive_users,
      recent_additions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'admin' } }),
      this.prisma.user.count({ where: { role: 'advokat' } }),
      this.prisma.user.count({ where: { role: 'paralegal' } }),
      this.prisma.user.count({ where: { role: 'staff' } }),
      this.prisma.user.count({ where: { role: 'klien' } }),
      this.prisma.user.count({ where: { is_active: true } }),
      this.prisma.user.count({ where: { is_active: false } }),
      this.prisma.user.count({
        where: { created_at: { gte: thirtyDaysAgo } },
      }),
    ]);

    return {
      total_users,
      by_role: {
        admin: adminCount,
        advokat: advokatCount,
        paralegal: paralegalCount,
        staff: staffCount,
        klien: klienCount,
      },
      active_users,
      inactive_users,
      recent_additions,
      last_30_days: recent_additions,
    };
  }

  async getWorkloadDistribution(): Promise<WorkloadDistribution[]> {
    const users = await this.prisma.user.findMany({
      where: {
        role: { in: ['advokat', 'paralegal', 'staff'] },
        is_active: true,
      },
      select: {
        id: true,
        email: true,
        nama_lengkap: true,
        role: true,
        _count: {
          select: {
            perkara_dibuat: true,
            tugas_ditugaskan: true,
            dokumen_diunggah: true,
            tim_perkara: true,
          },
        },
      },
    });

    const distribution: WorkloadDistribution[] = await Promise.all(
      users.map(async (user) => {
        const pendingTugas = await this.prisma.tugas.count({
          where: {
            ditugaskan_ke: user.id,
            status: { in: ['belum_mulai', 'sedang_berjalan'] },
          },
        });

        const completedTugas = await this.prisma.tugas.count({
          where: {
            ditugaskan_ke: user.id,
            status: 'selesai',
          },
        });

        const activePerkara = await this.prisma.timPerkara.count({
          where: {
            user_id: user.id,
            perkara: {
              status: { in: ['aktif', 'pending'] },
            },
          },
        });

        const workload_score =
          activePerkara * 3 +
          pendingTugas * 2 +
          user._count.dokumen_diunggah * 0.5;

        return {
          user_id: user.id,
          user_name: user.nama_lengkap || user.email,
          email: user.email,
          role: user.role,
          active_perkara: activePerkara,
          pending_tugas: pendingTugas,
          completed_tugas: completedTugas,
          total_dokumen: user._count.dokumen_diunggah,
          workload_score: Math.round(workload_score * 10) / 10,
        };
      }),
    );

    return distribution.sort((a, b) => b.workload_score - a.workload_score);
  }

  async bulkDeleteUsers(
    userIds: string[],
    currentUserId: string,
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const userId of userIds) {
      try {
        if (userId === currentUserId) {
          result.failed++;
          result.errors.push({
            user_id: userId,
            email: 'self',
            reason: 'Cannot delete your own account',
          });
          continue;
        }

        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, role: true },
        });

        if (!user) {
          result.failed++;
          result.errors.push({
            user_id: userId,
            email: 'unknown',
            reason: 'User not found',
          });
          continue;
        }

        if (user.role === 'admin') {
          const adminCount = await this.prisma.user.count({
            where: { role: 'admin' },
          });
          if (adminCount <= 1) {
            result.failed++;
            result.errors.push({
              user_id: userId,
              email: user.email,
              reason: 'Cannot delete the last admin user',
            });
            continue;
          }
        }

        await this.prisma.user.delete({ where: { id: userId } });

        await this.prisma.logAktivitas.create({
          data: {
            user_id: currentUserId,
            aksi: 'BULK_DELETE_USER',
            jenis_entitas: 'user',
            id_entitas: userId,
            detail: { email: user.email },
          },
        });

        result.success++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        result.failed++;
        result.errors.push({
          user_id: userId,
          email: 'unknown',
          reason: errorMessage,
        });
      }
    }

    console.log(
      `✅ Bulk delete completed: ${result.success} success, ${result.failed} failed`,
    );
    return result;
  }

  async bulkChangeRole(
    userIds: string[],
    role: UserRole,
    currentUserId: string,
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const userId of userIds) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, role: true },
        });

        if (!user) {
          result.failed++;
          result.errors.push({
            user_id: userId,
            email: 'unknown',
            reason: 'User not found',
          });
          continue;
        }

        if (user.role === 'admin' && role !== 'admin') {
          const adminCount = await this.prisma.user.count({
            where: { role: 'admin' },
          });
          if (adminCount <= 1) {
            result.failed++;
            result.errors.push({
              user_id: userId,
              email: user.email,
              reason: 'Cannot change role of the last admin',
            });
            continue;
          }
        }

        await this.prisma.user.update({
          where: { id: userId },
          data: { role },
        });

        await this.prisma.logAktivitas.create({
          data: {
            user_id: currentUserId,
            aksi: 'BULK_CHANGE_ROLE',
            jenis_entitas: 'user',
            id_entitas: userId,
            detail: {
              email: user.email,
              old_role: user.role,
              new_role: role,
            },
          },
        });

        result.success++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        result.failed++;
        result.errors.push({
          user_id: userId,
          email: 'unknown',
          reason: errorMessage,
        });
      }
    }

    console.log(
      `✅ Bulk role change completed: ${result.success} success, ${result.failed} failed`,
    );
    return result;
  }

  async sendInvitationEmail(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.findOne(id);

    const temporaryPassword = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    const loginUrl =
      this.config.get<string>('app.frontendUrl', 'http://localhost:3001') +
      '/login';

    const emailResult = await this.email.sendInvitationEmail({
      to: user.email,
      nama_lengkap: user.nama_lengkap,
      email: user.email,
      temporaryPassword,
      loginUrl,
    });

    await this.prisma.logAktivitas.create({
      data: {
        user_id: id,
        aksi: 'SEND_INVITATION',
        jenis_entitas: 'user',
        id_entitas: id,
        detail: {
          email: user.email,
          success: emailResult.success,
        },
      },
    });

    if (emailResult.success) {
      console.log('✅ Invitation email sent to:', user.email);
      return {
        success: true,
        message: 'Invitation email sent successfully',
      };
    } else {
      return {
        success: false,
        message: 'Failed to send invitation email',
      };
    }
  }

  async resendInvitationEmail(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.sendInvitationEmail(id);
  }

  async bulkImportUsers(
    file: Express.Multer.File,
    currentUserId: string,
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Detect file type based on extension or mimetype
      const isExcel =
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls') ||
        file.mimetype.includes('spreadsheet') ||
        file.mimetype.includes('excel');

      let rows: Array<{
        email: string;
        nama_lengkap: string;
        role: UserRole;
        jabatan?: string;
        telepon?: string;
      }> = [];

      if (isExcel) {
        // Parse Excel file
        console.log('📊 Parsing Excel file...');
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });

        // Get first sheet or 'Users' sheet
        let sheetName = workbook.SheetNames[0];
        if (workbook.SheetNames.includes('Users')) {
          sheetName = 'Users';
        }

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: '',
        });

        rows = jsonData as Array<{
          email: string;
          nama_lengkap: string;
          role: UserRole;
          jabatan?: string;
          telepon?: string;
        }>;

        console.log(`✅ Parsed ${rows.length} rows from Excel`);
      } else {
        // Parse CSV file
        console.log('📄 Parsing CSV file...');
        const csvData = file.buffer.toString('utf-8');
        const parsed = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
        });

        rows = parsed.data as Array<{
          email: string;
          nama_lengkap: string;
          role: UserRole;
          jabatan?: string;
          telepon?: string;
        }>;

        console.log(`✅ Parsed ${rows.length} rows from CSV`);
      }

      // Process rows
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          // Validate required fields
          if (!row.email || !row.nama_lengkap || !row.role) {
            result.failed++;
            result.errors.push({
              row: i + 2,
              email: row.email || 'N/A',
              reason: 'Missing required fields (email, nama_lengkap, or role)',
            });
            continue;
          }

          // Validate role
          const validRoles = ['admin', 'advokat', 'paralegal', 'staff', 'klien'];
          if (!validRoles.includes(row.role)) {
            result.failed++;
            result.errors.push({
              row: i + 2,
              email: row.email,
              reason: `Invalid role: ${row.role}. Must be one of: ${validRoles.join(', ')}`,
            });
            continue;
          }

          // Check if email already exists
          const existing = await this.prisma.user.findUnique({
            where: { email: row.email },
          });

          if (existing) {
            result.failed++;
            result.errors.push({
              row: i + 2,
              email: row.email,
              reason: 'Email already exists',
            });
            continue;
          }

          // Generate temporary password
          const tempPassword = crypto.randomBytes(4).toString('hex');
          const hashedPassword = await bcrypt.hash(tempPassword, 10);

          // Create user
          await this.prisma.user.create({
            data: {
              email: row.email,
              password: hashedPassword,
              nama_lengkap: row.nama_lengkap,
              role: row.role as UserRole,
              jabatan: row.jabatan || null,
              telepon: row.telepon || null,
            },
          });

          // Log activity
          await this.prisma.logAktivitas.create({
            data: {
              user_id: currentUserId,
              aksi: 'BULK_IMPORT_USER',
              jenis_entitas: 'user',
              detail: { email: row.email },
            },
          });

          result.success++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            row: i + 2,
            email: row.email,
            reason: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      console.log(
        `✅ Bulk import completed: ${result.success} success, ${result.failed} failed`,
      );

      return result;
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Export users to Google Drive
   */
  async exportUsersToGoogleDrive(
    format: 'csv' | 'excel',
    filters?: QueryUserDto,
  ): Promise<{
    fileId: string;
    fileName: string;
    webViewLink: string;
    webContentLink: string;
    embedLink: string;
  }> {
    try {
      // Get users data
      const result = await this.findAll(filters || {});
      const users = result.data;

      let buffer: Buffer;
      let fileName: string;
      let mimeType: string;

      if (format === 'csv') {
        // Generate CSV
        const csv = Papa.unparse(users);
        buffer = Buffer.from(csv, 'utf-8');
        fileName = `users-export-${Date.now()}.csv`;
        mimeType = 'text/csv';
      } else {
        // Generate Excel
        const worksheet = XLSX.utils.json_to_sheet(users);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

        buffer = XLSX.write(workbook, {
          type: 'buffer',
          bookType: 'xlsx',
        }) as Buffer;

        fileName = `users-export-${Date.now()}.xlsx`;
        mimeType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }

      // Upload to Google Drive
      const driveFile = await this.googleDrive.uploadFile({
        fileName,
        mimeType,
        buffer,
      });

      console.log(
        `✅ Users exported to Google Drive: ${driveFile.name} (${driveFile.id})`,
      );

      return {
        fileId: driveFile.id,
        fileName: driveFile.name,
        webViewLink: driveFile.webViewLink,
        webContentLink: driveFile.webContentLink,
        embedLink: driveFile.embedLink,
      };
    } catch (error) {
      console.error('Export to Google Drive failed:', error);
      throw new BadRequestException(
        `Failed to export users to Google Drive: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * List import files from Google Drive (CSV & Excel only)
   */
  async listGoogleDriveImportFiles(): Promise<
    Array<{
      id: string;
      name: string;
      mimeType: string;
      size: string;
      createdTime: string;
      modifiedTime: string;
      webViewLink: string;
    }>
  > {
    try {
      // Get CSV files
      const csvFiles = await this.googleDrive.listFiles({
        mimeType: 'text/csv',
        nameContains: 'user',
        pageSize: 50,
      });

      // Get Excel files
      const excelFiles = await this.googleDrive.listFiles({
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        nameContains: 'user',
        pageSize: 50,
      });

      // Combine and sort by modified time
      const allFiles = [...csvFiles, ...excelFiles].sort(
        (a, b) =>
          new Date(b.modifiedTime).getTime() -
          new Date(a.modifiedTime).getTime(),
      );

      console.log(
        `✅ Found ${allFiles.length} import files in Google Drive`,
      );

      return allFiles;
    } catch (error) {
      console.error('List Google Drive files failed:', error);
      throw new BadRequestException(
        'Failed to list files from Google Drive',
      );
    }
  }

  /**
   * Import users from Google Drive file
   */
  async importUsersFromGoogleDrive(
    fileId: string,
    currentUserId: string,
  ): Promise<BulkOperationResult> {
    try {
      console.log(`📥 Importing users from Google Drive file: ${fileId}`);

      // Download file from Google Drive
      const buffer = await this.googleDrive.downloadFile(fileId);

      // Get file metadata to determine type
      const fileMetadata = await this.googleDrive.getFile(fileId);
      const fileName = fileMetadata.name;

      // Create a mock file object for bulkImportUsers
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: fileName,
        encoding: '7bit',
        mimetype: fileName.endsWith('.xlsx')
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv',
        buffer,
        size: buffer.length,

        stream: Readable.from(buffer),
        destination: '',
        filename: fileName,
        path: '',
      };

      // Reuse existing bulk import logic
      const result = await this.bulkImportUsers(mockFile, currentUserId);

      console.log(
        `✅ Import from Google Drive completed: ${result.success} success, ${result.failed} failed`,
      );

      return result;
    } catch (error) {
      console.error('Import from Google Drive failed:', error);
      throw new BadRequestException(
        `Failed to import users from Google Drive: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Export Kinerja (Performance) Report to Google Drive
   */
  async exportKinerjaReportToGoogleDrive(
    format: 'csv' | 'excel',
  ): Promise<{
    fileId: string;
    fileName: string;
    webViewLink: string;
    webContentLink: string;
    embedLink: string;
  }> {
    try {
      // Get performance data
      const statistics = await this.getTeamStatistics();
      const workloadData = await this.getWorkloadDistribution();

      let buffer: Buffer;
      let fileName: string;
      let mimeType: string;

      if (format === 'csv') {
        // Generate CSV with workload data
        const csv = Papa.unparse(workloadData);
        buffer = Buffer.from(csv, 'utf-8');
        fileName = `laporan-kinerja-${Date.now()}.csv`;
        mimeType = 'text/csv';
      } else {
        // Generate Excel with ExcelJS for professional formatting
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();

        // Sheet 1: Statistics
        const statsSheet = workbook.addWorksheet('Ringkasan Statistik', {
          views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
        });

        statsSheet.columns = [
          { header: 'Metrik', key: 'metric', width: 30 },
          { header: 'Nilai', key: 'value', width: 20 },
        ];

        statsSheet.addRow({ metric: 'Total User', value: statistics.total_users });
        statsSheet.addRow({ metric: 'User Aktif', value: statistics.active_users });
        statsSheet.addRow({ metric: 'User Tidak Aktif', value: statistics.inactive_users });
        statsSheet.addRow({ metric: 'Penambahan Terbaru', value: statistics.recent_additions });
        statsSheet.addRow({ metric: '', value: '' });
        statsSheet.addRow({ metric: 'Distribusi Berdasarkan Role', value: '' });
        Object.entries(statistics.by_role).forEach(([role, count]) => {
          statsSheet.addRow({ metric: `  ${role}`, value: count });
        });

        // Style statistics sheet
        statsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        statsSheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        };
        statsSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        statsSheet.getRow(1).height = 25;

        statsSheet.eachRow((row, rowNumber) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
              left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
              bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
              right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            };
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

        // Sheet 2: Workload Distribution
        const workloadSheet = workbook.addWorksheet('Distribusi Beban Kerja', {
          views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
        });

        workloadSheet.columns = [
          { header: 'Nama User', key: 'user_name', width: 30 },
          { header: 'Email', key: 'email', width: 35 },
          { header: 'Role', key: 'role', width: 18 },
          { header: 'Perkara Aktif', key: 'active_perkara', width: 18 },
          { header: 'Tugas Pending', key: 'pending_tugas', width: 18 },
          { header: 'Tugas Selesai', key: 'completed_tugas', width: 18 },
          { header: 'Total Dokumen', key: 'total_dokumen', width: 18 },
          { header: 'Skor Beban Kerja', key: 'workload_score', width: 20 },
        ];

        workloadData.forEach((user) => {
          workloadSheet.addRow(user);
        });

        workloadSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        workloadSheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF70AD47' },
        };
        workloadSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        workloadSheet.getRow(1).height = 25;

        workloadSheet.eachRow((row, rowNumber) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
              left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
              bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
              right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            };
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

        buffer = Buffer.from(await workbook.xlsx.writeBuffer());
        fileName = `laporan-kinerja-${Date.now()}.xlsx`;
        mimeType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }

      // Upload to Google Drive
      const driveFile = await this.googleDrive.uploadFile({
        fileName,
        mimeType,
        buffer,
      });

      console.log(
        `✅ Kinerja report exported to Google Drive: ${driveFile.name} (${driveFile.id})`,
      );

      return {
        fileId: driveFile.id,
        fileName: driveFile.name,
        webViewLink: driveFile.webViewLink,
        webContentLink: driveFile.webContentLink,
        embedLink: driveFile.embedLink,
      };
    } catch (error) {
      console.error('Export Kinerja report to Google Drive failed:', error);
      throw new BadRequestException(
        `Failed to export Kinerja report to Google Drive: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
