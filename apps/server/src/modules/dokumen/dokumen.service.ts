// ============================================================================
// FILE: server/src/modules/dokumen/dokumen.service.ts - WITH GOOGLE DRIVE API
// ✅ FIXED: Invalidate perkara cache after create/update/delete
// ============================================================================
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PerkaraService } from '../perkara/perkara.service';
import { Prisma, UserRole } from '@prisma/client';
import { CreateDokumenDto } from './dto/create-dokumen.dto';
import { UpdateDokumenDto } from './dto/update-dokumen.dto';
import { QueryDokumenDto } from './dto/query-dokumen.dto';
import {
  PaginatedResult,
  DokumenWithRelations,
  DokumenDownloadResponse,
  CreateLogAktivitasData,
} from '../../common/interfaces';
import { GoogleDriveService } from '../google-drive/google-drive.service';

@Injectable()
export class DokumenService {
  private readonly logger = new Logger(DokumenService.name);

  constructor(
    private prisma: PrismaService,
    private googleDriveService: GoogleDriveService,
    private perkaraService: PerkaraService, // ✅ Inject for cache invalidation
  ) {}

  async create(
    dto: CreateDokumenDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<DokumenWithRelations> {
    if (!file) {
      throw new BadRequestException('File harus diupload');
    }

    const perkara = await this.prisma.perkara.findUnique({
      where: { id: dto.perkara_id },
      select: { id: true, nomor_perkara: true },
    });

    if (!perkara) {
      throw new BadRequestException('Perkara tidak ditemukan');
    }

    // ✅ UPLOAD TO GOOGLE DRIVE (instead of local storage)
    const driveFile = await this.googleDriveService.uploadFile({
      fileName: dto.nama_dokumen || file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer,
    });

    // ✅ VERIFY FILE ACCESSIBILITY (for debugging)
    try {
      const accessCheck = await this.googleDriveService.verifyFileAccess(
        driveFile.id,
      );
      this.logger.log(
        `📊 File accessibility: ${accessCheck.details}`,
      );
    } catch (verifyError) {
      this.logger.warn(
        `⚠️  Could not verify file access (non-critical): ${verifyError.message}`,
      );
    }

    // ✅ SAVE METADATA + GOOGLE DRIVE LINKS (not local file path)
    const dokumen = await this.prisma.dokumenHukum.create({
      data: {
        perkara_id: dto.perkara_id,
        nama_dokumen: dto.nama_dokumen || file.originalname,
        kategori: dto.kategori,
        nomor_bukti: dto.nomor_bukti,
        // Google Drive fields
        google_drive_id: driveFile.id,
        google_drive_link: driveFile.webViewLink,
        embed_link: driveFile.embedLink,
        // Metadata
        ukuran_file: file.size,
        tipe_file: file.mimetype,
        tanggal_dokumen: dto.tanggal_dokumen,
        catatan: dto.catatan,
        diunggah_oleh: userId,
        // Legacy field (null for Google Drive files)
        file_path: null,
      },
      include: {
        perkara: {
          select: {
            id: true,
            nomor_perkara: true,
            judul: true,
            klien: {
              select: {
                id: true,
                nama: true,
                email: true,
                telepon: true,
                jenis_klien: true,
              },
            },
          },
        },
        pengunggah: {
          select: {
            id: true,
            email: true,
            nama_lengkap: true,
            role: true,
            avatar_url: true,
          },
        },
      },
    });

    const logData: CreateLogAktivitasData = {
      user_id: userId,
      aksi: 'UPLOAD_DOKUMEN',
      jenis_entitas: 'dokumen',
      id_entitas: dokumen.id,
      detail: {
        nama_dokumen: dokumen.nama_dokumen,
        perkara_id: dto.perkara_id,
        google_drive_id: driveFile.id,
      },
    };

    await this.prisma.logAktivitas.create({
      data: logData,
    });

    // ✅ FIX: Invalidate perkara cache
    await this.perkaraService.invalidatePerkaraCache(dto.perkara_id);

    return dokumen;
  }

  // ============================================================================
  // ✅ RBAC FILTERING APPLIED HERE!
  // ============================================================================
  async findAll(
    query: QueryDokumenDto,
    userId: string,
    userRole: UserRole,
  ): Promise<PaginatedResult<DokumenWithRelations>> {
    const {
      page = 1,
      limit = 10,
      search,
      kategori,
      perkara_id,
      sortBy = 'tanggal_upload',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.DokumenHukumWhereInput = {};

    // 🔥 RBAC: DATA FILTERING BASED ON USER ROLE (OPSI A: SIMPLE MODEL)
    if (userRole === UserRole.klien) {
      // ✅ KLIEN: Hanya dokumen dari perkara mereka sendiri
      const perkaraIds = await this.prisma.perkara.findMany({
        where: { klien_id: userId },
        select: { id: true },
      });

      where.perkara_id = {
        in: perkaraIds.map((p) => p.id),
      };
    }
    // ✅ INTERNAL STAFF (admin, partner, advokat, paralegal, staff): FULL ACCESS
    // No additional filter needed - they can see ALL documents

    // Apply search & filters
    if (search) {
      const searchCondition: Prisma.DokumenHukumWhereInput = {
        OR: [
          { nama_dokumen: { contains: search, mode: 'insensitive' } },
          { nomor_bukti: { contains: search, mode: 'insensitive' } },
        ],
      };

      // Safe way to add to AND condition
      if (where.AND) {
        if (Array.isArray(where.AND)) {
          where.AND.push(searchCondition);
        } else {
          where.AND = [where.AND, searchCondition];
        }
      } else if (where.perkara || where.perkara_id) {
        where.AND = [searchCondition];
      } else {
        Object.assign(where, searchCondition);
      }
    }

    if (kategori) where.kategori = kategori;
    if (perkara_id) where.perkara_id = perkara_id;

    const orderBy: Prisma.DokumenHukumOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [data, total] = await Promise.all([
      this.prisma.dokumenHukum.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          perkara: {
            select: {
              id: true,
              nomor_perkara: true,
              judul: true,
              klien: {
                select: {
                  id: true,
                  nama: true,
                  email: true,
                  telepon: true,
                  jenis_klien: true,
                },
              },
            },
          },
          pengunggah: {
            select: {
              id: true,
              email: true,
              nama_lengkap: true,
              role: true,
              avatar_url: true,
            },
          },
        },
      }),
      this.prisma.dokumenHukum.count({ where }),
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

  async findOne(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<DokumenWithRelations> {
    const dokumen = await this.prisma.dokumenHukum.findUnique({
      where: { id },
      include: {
        perkara: {
          select: {
            id: true,
            nomor_perkara: true,
            judul: true,
            klien_id: true, // ✅ Need this for access check
            klien: {
              select: {
                id: true,
                nama: true,
                email: true,
                telepon: true,
                jenis_klien: true,
              },
            },
          },
        },
        pengunggah: {
          select: {
            id: true,
            email: true,
            nama_lengkap: true,
            role: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!dokumen) {
      throw new NotFoundException('Dokumen tidak ditemukan');
    }

    // 🔒 RBAC: ACCESS CONTROL (OPSI A: SIMPLE MODEL)
    if (userRole === UserRole.klien) {
      // ✅ KLIEN: Hanya bisa akses dokumen dari perkara mereka sendiri
      if (dokumen.perkara.klien_id !== userId) {
        this.logger.warn(
          `🚨 Unauthorized access attempt: User ${userId} (klien) tried to access document ${id} belonging to ${dokumen.perkara.klien_id}`,
        );
        throw new NotFoundException('Dokumen tidak ditemukan');
      }
    }
    // ✅ INTERNAL STAFF: Full access (no check needed)

    return dokumen;
  }

  async download(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<DokumenDownloadResponse> {
    const dokumen = await this.findOne(id, userId, userRole);

    // ✅ Return Google Drive download link (not local file)
    if (!dokumen.google_drive_link) {
      throw new NotFoundException(
        'File tidak tersedia. Google Drive link tidak ditemukan.',
      );
    }

    return {
      file_path: dokumen.google_drive_link, // Google Drive download URL
      nama_dokumen: dokumen.nama_dokumen,
    };
  }

  async update(
    id: string,
    dto: UpdateDokumenDto,
    userId: string,
    userRole: UserRole,
  ): Promise<DokumenWithRelations> {
    await this.findOne(id, userId, userRole);

    const updateData: Prisma.DokumenHukumUpdateInput = { ...dto };

    const dokumen = await this.prisma.dokumenHukum.update({
      where: { id },
      data: updateData,
      include: {
        perkara: {
          select: {
            id: true,
            nomor_perkara: true,
            judul: true,
            klien: {
              select: {
                id: true,
                nama: true,
                email: true,
                telepon: true,
                jenis_klien: true,
              },
            },
          },
        },
        pengunggah: {
          select: {
            id: true,
            email: true,
            nama_lengkap: true,
            role: true,
            avatar_url: true,
          },
        },
      },
    });

    const logData: CreateLogAktivitasData = {
      user_id: userId,
      aksi: 'UPDATE_DOKUMEN',
      jenis_entitas: 'dokumen',
      id_entitas: dokumen.id,
      detail: { nama_dokumen: dokumen.nama_dokumen },
    };

    await this.prisma.logAktivitas.create({
      data: logData,
    });

    // ✅ FIX: Invalidate perkara cache
    await this.perkaraService.invalidatePerkaraCache(dokumen.perkara.id);

    return dokumen;
  }

  async remove(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<{ message: string }> {
    const dokumen = await this.findOne(id, userId, userRole);

    // ✅ Delete from Google Drive if exists
    if (dokumen.google_drive_id) {
      try {
        await this.googleDriveService.deleteFile(dokumen.google_drive_id);
      } catch (error) {
        // Log error but continue with DB deletion
        console.error(
          `Failed to delete file from Google Drive: ${dokumen.google_drive_id}`,
          error,
        );
      }
    }

    await this.prisma.dokumenHukum.delete({
      where: { id },
    });

    const logData: CreateLogAktivitasData = {
      user_id: userId,
      aksi: 'DELETE_DOKUMEN',
      jenis_entitas: 'dokumen',
      id_entitas: id,
      detail: {
        nama_dokumen: dokumen.nama_dokumen,
        google_drive_id: dokumen.google_drive_id,
      },
    };

    await this.prisma.logAktivitas.create({
      data: logData,
    });

    // ✅ FIX: Invalidate perkara cache
    await this.perkaraService.invalidatePerkaraCache(dokumen.perkara.id);

    return { message: 'Dokumen berhasil dihapus' };
  }
}
