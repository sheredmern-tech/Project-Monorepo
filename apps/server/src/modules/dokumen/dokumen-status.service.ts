// ============================================================================
// FILE: server/src/modules/dokumen/dokumen-status.service.ts
// Service for managing document workflow status and transitions
// ============================================================================
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowStatus, UserRole, Prisma } from '@prisma/client';
import {
  SubmitDokumenDto,
  BulkSubmitDokumenDto,
} from './dto/submit-dokumen.dto';
import { ReviewDokumenDto } from './dto/review-dokumen.dto';
import {
  ApproveDokumenDto,
  BulkApproveDokumenDto,
} from './dto/approve-dokumen.dto';
import {
  RejectDokumenDto,
  BulkRejectDokumenDto,
} from './dto/reject-dokumen.dto';
import { ArchiveDokumenDto } from './dto/archive-dokumen.dto';
import { QueryWorkflowDto } from './dto/query-workflow.dto';

@Injectable()
export class DokumenStatusService {
  private readonly logger = new Logger(DokumenStatusService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Submit document for review
   * Transition: DRAFT -> SUBMITTED
   * Allowed roles: advokat, staff
   */
  async submitDocument(
    dokumenId: string,
    userId: string,
    userRole: UserRole,
    dto: SubmitDokumenDto,
  ) {
    // Check permission
    const allowedRoles: UserRole[] = [UserRole.advokat, UserRole.staff, UserRole.paralegal];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException(
        'Only advokat, paralegal, or staff can submit documents',
      );
    }

    // Get document
    const dokumen = await this.prisma.dokumenHukum.findUnique({
      where: { id: dokumenId },
      include: { status: true },
    });

    if (!dokumen) {
      throw new NotFoundException('Document not found');
    }

    // Check current status
    const currentStatus = dokumen.status?.current_status || WorkflowStatus.DRAFT;
    if (currentStatus !== WorkflowStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot submit document with status ${currentStatus}. Only DRAFT documents can be submitted.`,
      );
    }

    // Update or create status
    const now = new Date();
    const status = await this.prisma.dokumenStatus.upsert({
      where: { dokumen_id: dokumenId },
      create: {
        dokumen_id: dokumenId,
        current_status: WorkflowStatus.SUBMITTED,
        submitted_at: now,
        submitted_by: userId,
        notes: dto.notes,
      },
      update: {
        current_status: WorkflowStatus.SUBMITTED,
        submitted_at: now,
        submitted_by: userId,
        notes: dto.notes,
      },
      include: {
        dokumen: {
          include: {
            pengunggah: {
              select: { id: true, nama_lengkap: true, email: true },
            },
            perkara: {
              select: { id: true, nomor_perkara: true, judul: true },
            },
          },
        },
        submitter: {
          select: { id: true, nama_lengkap: true, email: true },
        },
      },
    });

    // Create audit log
    await this.createAuditLog(
      dokumenId,
      currentStatus,
      WorkflowStatus.SUBMITTED,
      userId,
      null,
      dto.notes,
    );

    this.logger.log(
      `Document ${dokumenId} submitted for review by user ${userId}`,
    );

    return status;
  }

  /**
   * Bulk submit documents
   */
  async bulkSubmitDocuments(
    userId: string,
    userRole: UserRole,
    dto: BulkSubmitDokumenDto,
  ) {
    const results = await Promise.allSettled(
      dto.dokumen_ids.map((id) =>
        this.submitDocument(id, userId, userRole, {
          notes: dto.notes,
        }),
      ),
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failCount = results.filter((r) => r.status === 'rejected').length;

    return {
      success: successCount,
      failed: failCount,
      total: dto.dokumen_ids.length,
      results,
    };
  }

  /**
   * Start review process
   * Transition: SUBMITTED -> IN_REVIEW
   * Allowed roles: admin, partner
   */
  async reviewDocument(
    dokumenId: string,
    userId: string,
    userRole: UserRole,
    dto: ReviewDokumenDto,
  ) {
    // Check permission
    const allowedRoles: UserRole[] = [UserRole.admin, UserRole.partner];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('Only admin or partner can review documents');
    }

    const dokumen = await this.prisma.dokumenHukum.findUnique({
      where: { id: dokumenId },
      include: { status: true },
    });

    if (!dokumen) {
      throw new NotFoundException('Document not found');
    }

    const currentStatus = dokumen.status?.current_status;
    if (currentStatus !== WorkflowStatus.SUBMITTED) {
      throw new BadRequestException(
        `Cannot review document with status ${currentStatus}. Only SUBMITTED documents can be reviewed.`,
      );
    }

    const now = new Date();
    const status = await this.prisma.dokumenStatus.update({
      where: { dokumen_id: dokumenId },
      data: {
        current_status: WorkflowStatus.IN_REVIEW,
        reviewed_at: now,
        reviewed_by: userId,
        notes: dto.notes,
      },
      include: {
        dokumen: {
          include: {
            pengunggah: {
              select: { id: true, nama_lengkap: true, email: true },
            },
            perkara: {
              select: { id: true, nomor_perkara: true, judul: true },
            },
          },
        },
        reviewer: {
          select: { id: true, nama_lengkap: true, email: true },
        },
      },
    });

    await this.createAuditLog(
      dokumenId,
      currentStatus,
      WorkflowStatus.IN_REVIEW,
      userId,
      null,
      dto.notes,
    );

    this.logger.log(
      `Document ${dokumenId} moved to IN_REVIEW by user ${userId}`,
    );

    return status;
  }

  /**
   * Approve document
   * Transition: IN_REVIEW -> APPROVED
   * Allowed roles: admin, partner
   */
  async approveDocument(
    dokumenId: string,
    userId: string,
    userRole: UserRole,
    dto: ApproveDokumenDto,
  ) {
    const allowedRoles: UserRole[] = [UserRole.admin, UserRole.partner];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('Only admin or partner can approve documents');
    }

    const dokumen = await this.prisma.dokumenHukum.findUnique({
      where: { id: dokumenId },
      include: { status: true },
    });

    if (!dokumen) {
      throw new NotFoundException('Document not found');
    }

    const currentStatus = dokumen.status?.current_status;
    if (currentStatus !== WorkflowStatus.IN_REVIEW) {
      throw new BadRequestException(
        `Cannot approve document with status ${currentStatus}. Only IN_REVIEW documents can be approved.`,
      );
    }

    const now = new Date();
    const status = await this.prisma.dokumenStatus.update({
      where: { dokumen_id: dokumenId },
      data: {
        current_status: WorkflowStatus.APPROVED,
        approved_at: now,
        approved_by: userId,
        notes: dto.notes,
      },
      include: {
        dokumen: {
          include: {
            pengunggah: {
              select: { id: true, nama_lengkap: true, email: true },
            },
            perkara: {
              select: { id: true, nomor_perkara: true, judul: true },
            },
          },
        },
        approver: {
          select: { id: true, nama_lengkap: true, email: true },
        },
      },
    });

    await this.createAuditLog(
      dokumenId,
      currentStatus,
      WorkflowStatus.APPROVED,
      userId,
      null,
      dto.notes,
    );

    this.logger.log(`Document ${dokumenId} approved by user ${userId}`);

    return status;
  }

  /**
   * Bulk approve documents
   */
  async bulkApproveDocuments(
    userId: string,
    userRole: UserRole,
    dto: BulkApproveDokumenDto,
  ) {
    const results = await Promise.allSettled(
      dto.dokumen_ids.map((id) =>
        this.approveDocument(id, userId, userRole, {
          notes: dto.notes,
        }),
      ),
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failCount = results.filter((r) => r.status === 'rejected').length;

    return {
      success: successCount,
      failed: failCount,
      total: dto.dokumen_ids.length,
      results,
    };
  }

  /**
   * Reject document
   * Transition: IN_REVIEW -> REJECTED
   * Allowed roles: admin, partner
   */
  async rejectDocument(
    dokumenId: string,
    userId: string,
    userRole: UserRole,
    dto: RejectDokumenDto,
  ) {
    const allowedRoles: UserRole[] = [UserRole.admin, UserRole.partner];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('Only admin or partner can reject documents');
    }

    const dokumen = await this.prisma.dokumenHukum.findUnique({
      where: { id: dokumenId },
      include: { status: true },
    });

    if (!dokumen) {
      throw new NotFoundException('Document not found');
    }

    const currentStatus = dokumen.status?.current_status;
    if (currentStatus !== WorkflowStatus.IN_REVIEW) {
      throw new BadRequestException(
        `Cannot reject document with status ${currentStatus}. Only IN_REVIEW documents can be rejected.`,
      );
    }

    const now = new Date();
    const status = await this.prisma.dokumenStatus.update({
      where: { dokumen_id: dokumenId },
      data: {
        current_status: WorkflowStatus.REJECTED,
        rejected_at: now,
        rejected_by: userId,
        rejection_reason: dto.reason,
        notes: dto.notes,
      },
      include: {
        dokumen: {
          include: {
            pengunggah: {
              select: { id: true, nama_lengkap: true, email: true },
            },
            perkara: {
              select: { id: true, nomor_perkara: true, judul: true },
            },
          },
        },
        rejector: {
          select: { id: true, nama_lengkap: true, email: true },
        },
      },
    });

    await this.createAuditLog(
      dokumenId,
      currentStatus,
      WorkflowStatus.REJECTED,
      userId,
      dto.reason,
      dto.notes,
    );

    this.logger.log(
      `Document ${dokumenId} rejected by user ${userId}: ${dto.reason}`,
    );

    return status;
  }

  /**
   * Bulk reject documents
   */
  async bulkRejectDocuments(
    userId: string,
    userRole: UserRole,
    dto: BulkRejectDokumenDto,
  ) {
    const results = await Promise.allSettled(
      dto.dokumen_ids.map((id) =>
        this.rejectDocument(id, userId, userRole, {
          reason: dto.reason,
          notes: dto.notes,
        }),
      ),
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failCount = results.filter((r) => r.status === 'rejected').length;

    return {
      success: successCount,
      failed: failCount,
      total: dto.dokumen_ids.length,
      results,
    };
  }

  /**
   * Archive document
   * Transition: ANY -> ARCHIVED
   * Allowed roles: admin, partner
   */
  async archiveDocument(
    dokumenId: string,
    userId: string,
    userRole: UserRole,
    dto: ArchiveDokumenDto,
  ) {
    const allowedRoles: UserRole[] = [UserRole.admin, UserRole.partner];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('Only admin or partner can archive documents');
    }

    const dokumen = await this.prisma.dokumenHukum.findUnique({
      where: { id: dokumenId },
      include: { status: true },
    });

    if (!dokumen) {
      throw new NotFoundException('Document not found');
    }

    const currentStatus =
      dokumen.status?.current_status || WorkflowStatus.DRAFT;

    const now = new Date();
    const status = await this.prisma.dokumenStatus.upsert({
      where: { dokumen_id: dokumenId },
      create: {
        dokumen_id: dokumenId,
        current_status: WorkflowStatus.ARCHIVED,
        archived_at: now,
        notes: dto.notes,
      },
      update: {
        current_status: WorkflowStatus.ARCHIVED,
        archived_at: now,
        notes: dto.notes,
      },
      include: {
        dokumen: {
          include: {
            pengunggah: {
              select: { id: true, nama_lengkap: true, email: true },
            },
            perkara: {
              select: { id: true, nomor_perkara: true, judul: true },
            },
          },
        },
      },
    });

    await this.createAuditLog(
      dokumenId,
      currentStatus,
      WorkflowStatus.ARCHIVED,
      userId,
      dto.reason,
      dto.notes,
    );

    this.logger.log(`Document ${dokumenId} archived by user ${userId}`);

    return status;
  }

  /**
   * Get document status history (audit log)
   */
  async getDocumentHistory(dokumenId: string) {
    const dokumen = await this.prisma.dokumenHukum.findUnique({
      where: { id: dokumenId },
    });

    if (!dokumen) {
      throw new NotFoundException('Document not found');
    }

    const history = await this.prisma.dokumenAuditLog.findMany({
      where: { dokumen_id: dokumenId },
      include: {
        user: {
          select: { id: true, nama_lengkap: true, email: true, role: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return history;
  }

  /**
   * Get documents by workflow status (for review queue)
   */
  async getDocumentsByStatus(query: QueryWorkflowDto) {
    const { page = 1, limit = 10, status, perkara_id, submitted_by, reviewed_by } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.DokumenStatusWhereInput = {};

    if (status) {
      where.current_status = status;
    }

    if (perkara_id) {
      where.dokumen = {
        perkara_id,
      };
    }

    if (submitted_by) {
      where.submitted_by = submitted_by;
    }

    if (reviewed_by) {
      where.reviewed_by = reviewed_by;
    }

    if (query.submitted_after || query.submitted_before) {
      where.submitted_at = {};
      if (query.submitted_after) {
        where.submitted_at.gte = new Date(query.submitted_after);
      }
      if (query.submitted_before) {
        where.submitted_at.lte = new Date(query.submitted_before);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.dokumenStatus.findMany({
        where,
        skip,
        take: limit,
        include: {
          dokumen: {
            include: {
              pengunggah: {
                select: { id: true, nama_lengkap: true, email: true },
              },
              perkara: {
                select: { id: true, nomor_perkara: true, judul: true },
              },
            },
          },
          submitter: {
            select: { id: true, nama_lengkap: true, email: true },
          },
          reviewer: {
            select: { id: true, nama_lengkap: true, email: true },
          },
          approver: {
            select: { id: true, nama_lengkap: true, email: true },
          },
          rejector: {
            select: { id: true, nama_lengkap: true, email: true },
          },
        },
        orderBy: { updated_at: 'desc' },
      }),
      this.prisma.dokumenStatus.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(perkaraId?: string) {
    const where: Prisma.DokumenStatusWhereInput = perkaraId
      ? { dokumen: { perkara_id: perkaraId } }
      : {};

    const stats = await this.prisma.dokumenStatus.groupBy({
      by: ['current_status'],
      where,
      _count: {
        id: true,
      },
    });

    return stats.reduce((acc, stat) => {
      acc[stat.current_status] = stat._count.id;
      return acc;
    }, {} as Record<WorkflowStatus, number>);
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(
    dokumenId: string,
    fromStatus: WorkflowStatus | null,
    toStatus: WorkflowStatus,
    userId: string,
    reason?: string | null,
    notes?: string | null,
  ) {
    return this.prisma.dokumenAuditLog.create({
      data: {
        dokumen_id: dokumenId,
        from_status: fromStatus,
        to_status: toStatus,
        changed_by: userId,
        reason,
        notes,
      },
    });
  }
}
