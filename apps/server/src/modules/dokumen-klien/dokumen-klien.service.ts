// ============================================================================
// FILE: src/modules/dokumen-klien/dokumen-klien.service.ts
// Dokumen Klien Service - Client Self-Service Document Management
// ✅ CRITICAL: Data isolation by klien_id (req.user.id)
// ============================================================================
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateDokumenKlienDto } from './dto/create-dokumen-klien.dto';
import { UpdateDokumenKlienDto } from './dto/update-dokumen-klien.dto';
import { QueryDokumenKlienDto } from './dto/query-dokumen-klien.dto';
import { GoogleDriveService } from '../google-drive/google-drive.service';

@Injectable()
export class DokumenKlienService {
  private readonly logger = new Logger(DokumenKlienService.name);

  constructor(
    private prisma: PrismaService,
    private googleDriveService: GoogleDriveService,
  ) {}

  /**
   * Upload dokumen klien (bulk upload support)
   * ✅ CRITICAL: Automatically sets klien_id from authenticated user
   */
  async upload(
    files: Express.Multer.File[],
    dto: CreateDokumenKlienDto,
    userId: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Minimal 1 file harus diupload');
    }

    const uploaded: any[] = [];
    const failed: any[] = [];

    // ✅ Get user info for better folder naming
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { nama_lengkap: true, email: true },
    });

    // ✅ Create/get folder for this klien with name + hash
    // Format: Klien_NamaUser_{first8charsOfUserId}
    let klienFolderId: string | undefined;
    try {
      const userNameSlug = user?.nama_lengkap
        ? user.nama_lengkap
            .replace(/[^a-zA-Z0-9]/g, '_') // Replace non-alphanumeric with underscore
            .replace(/_+/g, '_') // Replace multiple underscores with single
            .replace(/^_|_$/g, '') // Remove leading/trailing underscores
        : 'Unknown';

      const userIdHash = userId.substring(0, 8); // First 8 chars as identifier
      const folderName = `Klien_${userNameSlug}_${userIdHash}`;

      klienFolderId =
        await this.googleDriveService.getOrCreatePerkaraFolder(folderName);
      this.logger.log(
        `📁 Using folder for klien ${user?.nama_lengkap || userId}: ${folderName} (${klienFolderId})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create/get klien folder: ${error.message}`,
      );
      // Continue without folder - will upload to root
    }

    // Upload each file
    for (const file of files) {
      try {
        // ✅ Upload to Google Drive (in klien's isolated folder)
        const driveFile = await this.googleDriveService.uploadFile({
          fileName: dto.nama_dokumen || file.originalname,
          mimeType: file.mimetype,
          buffer: file.buffer,
          folderId: klienFolderId,
        });

        // ✅ Save metadata to database with klien_id (CRITICAL!)
        const dokumen = await this.prisma.dokumenKlien.create({
          data: {
            klien_id: userId, // ✅ CRITICAL: Data isolation
            nama_dokumen: dto.nama_dokumen || file.originalname,
            tipe_dokumen: dto.tipe_dokumen,
            deskripsi: dto.deskripsi,
            kategori: dto.kategori,
            tags: dto.tags || [],
            // Google Drive fields
            google_drive_id: driveFile.id,
            google_drive_link: driveFile.webViewLink,
            embed_link: driveFile.embedLink,
            // File metadata
            file_size: BigInt(file.size),
            mime_type: file.mimetype,
          },
        });

        uploaded.push({
          ...dokumen,
          file_size: Number(dokumen.file_size), // Convert BigInt to number for JSON
        });

        this.logger.log(
          `✅ File uploaded: ${dokumen.nama_dokumen} (${dokumen.id})`,
        );
      } catch (error) {
        this.logger.error(`Failed to upload file: ${file.originalname}`, error);
        failed.push({
          file: file.originalname,
          error: error.message,
        });
      }
    }

    // Log activity
    await this.prisma.logAktivitas.create({
      data: {
        user_id: userId,
        aksi: 'UPLOAD_DOKUMEN_KLIEN',
        jenis_entitas: 'dokumen_klien',
        detail: {
          total_files: files.length,
          success: uploaded.length,
          failed: failed.length,
        },
      },
    });

    return {
      success: true,
      data: {
        uploaded,
        failed,
        summary: {
          total: files.length,
          success: uploaded.length,
          failed: failed.length,
        },
      },
    };
  }

  /**
   * Get all documents for klien
   * ✅ CRITICAL: Filtered by klien_id (req.user.id)
   */
  async findAll(query: QueryDokumenKlienDto, userId: string) {
    const {
      page = 1,
      limit = 20,
      search,
      tipe_dokumen,
      sortBy = 'uploaded_at',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // ✅ CRITICAL: ALWAYS filter by user ID
    const where: Prisma.DokumenKlienWhereInput = {
      klien_id: userId, // ✅ Data isolation
      deleted_at: null, // Exclude soft-deleted docs
    };

    // Apply search
    if (search) {
      where.nama_dokumen = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Apply filter
    if (tipe_dokumen) {
      where.tipe_dokumen = tipe_dokumen;
    }

    const orderBy: Prisma.DokumenKlienOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [data, total] = await Promise.all([
      this.prisma.dokumenKlien.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.dokumenKlien.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: data.map((doc) => ({
        ...doc,
        file_size: doc.file_size ? Number(doc.file_size) : null, // Convert BigInt
      })),
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

  /**
   * Get dashboard stats for klien
   * ✅ CRITICAL: Filtered by klien_id
   */
  async getStats(userId: string) {
    // ✅ All queries filtered by klien_id
    const where = {
      klien_id: userId,
      deleted_at: null,
    };

    const [total, bulanIni, mingguIni, byType] = await Promise.all([
      // Total dokumen
      this.prisma.dokumenKlien.count({ where }),

      // Dokumen bulan ini
      this.prisma.dokumenKlien.count({
        where: {
          ...where,
          uploaded_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Dokumen minggu ini
      this.prisma.dokumenKlien.count({
        where: {
          ...where,
          uploaded_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Group by type
      this.prisma.dokumenKlien.groupBy({
        by: ['tipe_dokumen'],
        where,
        _count: true,
      }),
    ]);

    return {
      success: true,
      data: {
        total_dokumen: total,
        dokumen_bulan_ini: bulanIni,
        dokumen_minggu_ini: mingguIni,
        by_type: byType.reduce(
          (acc, item) => {
            acc[item.tipe_dokumen || 'lainnya'] = item._count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
    };
  }

  /**
   * Get single document by ID
   * ✅ CRITICAL: Ownership check (klien_id === userId)
   */
  async findOne(id: string, userId: string) {
    const dokumen = await this.prisma.dokumenKlien.findFirst({
      where: {
        id,
        klien_id: userId, // ✅ CRITICAL: Ownership check
        deleted_at: null,
      },
    });

    if (!dokumen) {
      throw new NotFoundException(
        'Dokumen tidak ditemukan atau Anda tidak memiliki akses',
      );
    }

    return {
      success: true,
      data: {
        ...dokumen,
        file_size: dokumen.file_size ? Number(dokumen.file_size) : null,
      },
    };
  }

  /**
   * Update document metadata (NOT the file itself)
   * ✅ CRITICAL: Ownership check
   */
  async update(id: string, dto: UpdateDokumenKlienDto, userId: string) {
    // Verify ownership
    await this.findOne(id, userId);

    const updated = await this.prisma.dokumenKlien.update({
      where: { id },
      data: {
        nama_dokumen: dto.nama_dokumen,
        tipe_dokumen: dto.tipe_dokumen,
        deskripsi: dto.deskripsi,
        kategori: dto.kategori,
        tags: dto.tags,
        updated_at: new Date(),
      },
    });

    // Log activity
    await this.prisma.logAktivitas.create({
      data: {
        user_id: userId,
        aksi: 'UPDATE_DOKUMEN_KLIEN',
        jenis_entitas: 'dokumen_klien',
        id_entitas: id,
        detail: { nama_dokumen: updated.nama_dokumen },
      },
    });

    return {
      success: true,
      data: {
        ...updated,
        file_size: updated.file_size ? Number(updated.file_size) : null,
      },
    };
  }

  /**
   * Delete document (soft delete)
   * ✅ CRITICAL: Ownership check
   */
  async remove(id: string, userId: string) {
    // Verify ownership
    const dokumen = await this.findOne(id, userId);

    // Soft delete in database
    await this.prisma.dokumenKlien.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    // Try to delete from Google Drive (non-blocking)
    if (dokumen.data.google_drive_id) {
      try {
        await this.googleDriveService.deleteFile(dokumen.data.google_drive_id);
        this.logger.log(
          `✅ File deleted from Google Drive: ${dokumen.data.google_drive_id}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to delete from Google Drive: ${dokumen.data.google_drive_id}`,
          error,
        );
        // Continue - soft delete in DB is more important
      }
    }

    // Log activity
    await this.prisma.logAktivitas.create({
      data: {
        user_id: userId,
        aksi: 'DELETE_DOKUMEN_KLIEN',
        jenis_entitas: 'dokumen_klien',
        id_entitas: id,
        detail: {
          nama_dokumen: dokumen.data.nama_dokumen,
          google_drive_id: dokumen.data.google_drive_id,
        },
      },
    });

    return {
      success: true,
      message: 'Dokumen berhasil dihapus',
    };
  }
}
