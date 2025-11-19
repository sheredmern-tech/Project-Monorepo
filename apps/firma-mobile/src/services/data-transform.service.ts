import type { 
  Perkara, 
  PerkaraDetail,
  Case, 
  CaseDocument,
  DokumenHukum,
  Klien,
  User,
  TimelineEvent 
} from '../types';

/**
 * Service to transform backend data format to mobile app format
 * This maintains compatibility with existing screens
 */
class DataTransformService {

  // ========================================
  // PERKARA → CASE TRANSFORMATIONS
  // ========================================

  /**
   * Transform Perkara from backend to Case format for mobile
   */
  perkaraToCase(perkara: Perkara | PerkaraDetail): Case {
    return {
      id: perkara.id,
      case_number: perkara.nomorPerkara,
      client: this.klienToClient(perkara.klien),
      service: {
        id: perkara.id, // Using perkara ID since service is not in backend
        name: perkara.judulPerkara,
        category: perkara.jenisPerkara,
      },
      assigned_to: perkara.advokatPenanggungjawab ? {
        id: perkara.advokatPenanggungjawab.id,
        name: perkara.advokatPenanggungjawab.fullName,
        email: perkara.advokatPenanggungjawab.email,
      } : null,
      current_phase: perkara.currentPhase,
      status: this.mapPerkaraStatusToPhaseStatus(perkara.statusPerkara, perkara.currentPhase),
      phase_2_skipped: perkara.phase2Skipped || false,
      skip_reason: perkara.skipReason || null,
      meeting_date: null, // Will be set from sidang data if exists
      meeting_location: null, // Will be set from sidang data if exists
      created_at: perkara.createdAt,
      updated_at: perkara.updatedAt,
      documents: this.dokumenToCaseDocuments(perkara.dokumen || [], perkara.id),
      timeline: this.buildTimeline(perkara),
    };
  }

  /**
   * Transform array of Perkara to Cases
   */
  perkaraListToCases(perkaraList: Perkara[]): Case[] {
    return perkaraList.map(perkara => this.perkaraToCase(perkara));
  }

  /**
   * Transform Klien to client format
   */
  private klienToClient(klien?: Klien): Case['client'] {
    if (!klien) {
      return {
        id: 'unknown',
        name: 'Unknown Client',
        phone: '',
        email: '',
      };
    }

    return {
      id: klien.id,
      name: klien.nama,
      phone: klien.noTelepon || '',
      email: klien.email || '',
    };
  }

  /**
   * Map backend status to phase-based status
   */
  private mapPerkaraStatusToPhaseStatus(statusPerkara: string, currentPhase: number): string {
    // If status is already phase-based, return it
    if (statusPerkara?.startsWith('phase_')) {
      return statusPerkara;
    }

    // Map current phase to phase status
    return `phase_${currentPhase}`;
  }

  // ========================================
  // DOKUMEN → CASE DOCUMENT TRANSFORMATIONS
  // ========================================

  /**
   * Transform DokumenHukum to CaseDocument format
   */
  dokumenToCaseDocument(dokumen: DokumenHukum, caseId: string): CaseDocument {
    return {
      id: dokumen.id,
      case_id: caseId,
      phase: dokumen.phase || 1,
      document_type: dokumen.jenisDokumen || dokumen.kategori || 'Document',
      is_required: dokumen.isRequired || false,
      is_optional: dokumen.isOptional || false,
      file_name: dokumen.namaDokumen || null,
      file_url: dokumen.fileUrl || null,
      file_size: dokumen.fileSize || null,
      uploaded_at: dokumen.uploadedAt || null,
      review_status: dokumen.reviewStatus || 'pending',
      review_notes: dokumen.reviewNotes || null,
    };
  }

  /**
   * Transform array of DokumenHukum to CaseDocuments
   */
  dokumenToCaseDocuments(dokumenList: DokumenHukum[], caseId: string): CaseDocument[] {
    return dokumenList.map(doc => this.dokumenToCaseDocument(doc, caseId));
  }

  // ========================================
  // CASE → PERKARA TRANSFORMATIONS (for uploads)
  // ========================================

  /**
   * Transform Case creation data to CreatePerkaraDto
   */
  caseToCreatePerkaraDto(caseData: Partial<Case>, klienId: string): any {
    return {
      nomorPerkara: caseData.case_number || this.generateCaseNumber(),
      judulPerkara: caseData.service?.name || 'New Case',
      jenisPerkara: caseData.service?.category || 'General',
      statusPerkara: 'active',
      tanggalRegistrasi: new Date().toISOString(),
      klienId: klienId,
      currentPhase: 0,
      deskripsi: `Case for ${caseData.client?.name || 'Client'}`,
    };
  }

  /**
   * Transform document upload data for backend
   */
  prepareDocumentUpload(
    document: Partial<CaseDocument>,
    perkaraId: string,
    userId: string
  ): any {
    return {
      perkaraId,
      namaDokumen: document.file_name || 'Document',
      jenisDokumen: document.document_type,
      kategori: document.document_type,
      phase: document.phase || 1,
      isRequired: document.is_required || false,
      isOptional: document.is_optional || false,
      uploadedById: userId,
    };
  }

  // ========================================
  // TIMELINE TRANSFORMATIONS
  // ========================================

  /**
   * Build timeline from Perkara data
   */
  private buildTimeline(perkara: PerkaraDetail | Perkara): TimelineEvent[] {
    const timeline: TimelineEvent[] = [];

    // If PerkaraDetail has timeline, use it
    if ('timeline' in perkara && perkara.timeline) {
      return perkara.timeline;
    }

    // Otherwise, build basic timeline
    timeline.push({
      id: `timeline-${perkara.id}-1`,
      phase: 0,
      event: 'Case Created',
      description: `Case ${perkara.nomorPerkara} created`,
      createdAt: perkara.createdAt,
    });

    // Add phase progression events
    if (perkara.currentPhase >= 1) {
      timeline.push({
        id: `timeline-${perkara.id}-2`,
        phase: 1,
        event: 'Phase 1 Started',
        description: 'Initial documents collection',
        createdAt: perkara.createdAt,
      });
    }

    if (perkara.currentPhase === 2 && !perkara.phase2Skipped) {
      timeline.push({
        id: `timeline-${perkara.id}-3`,
        phase: 2,
        event: 'Phase 2 Started',
        description: 'Additional documents requested',
        createdAt: perkara.updatedAt,
      });
    }

    if (perkara.phase2Skipped) {
      timeline.push({
        id: `timeline-${perkara.id}-skip`,
        phase: 2,
        event: 'Phase 2 Skipped',
        description: perkara.skipReason || 'All documents complete',
        createdAt: perkara.updatedAt,
        skipped: true,
      });
    }

    if (perkara.currentPhase >= 3) {
      timeline.push({
        id: `timeline-${perkara.id}-4`,
        phase: 3,
        event: 'Phase 3 Started',
        description: 'Case processing and meeting scheduled',
        createdAt: perkara.updatedAt,
      });
    }

    return timeline.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  /**
   * Generate case number
   */
  private generateCaseNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CS-${year}${month}${day}-${random}`;
  }

  /**
   * Check if Phase 2 should be skipped
   */
  shouldSkipPhase2(documents: DokumenHukum[]): boolean {
    // Get all Phase 1 required documents
    const phase1RequiredDocs = documents.filter(
      doc => doc.phase === 1 && doc.isRequired
    );

    // If no required docs defined, don't skip
    if (phase1RequiredDocs.length === 0) {
      return false;
    }

    // Check if all required Phase 1 docs are approved
    const allApproved = phase1RequiredDocs.every(
      doc => doc.reviewStatus === 'approved'
    );

    return allApproved;
  }

  /**
   * Get phase status label
   */
  getPhaseLabel(phase: number, skipped: boolean = false): string {
    if (phase === 2 && skipped) {
      return 'Phase 3 (Phase 2 Skipped)';
    }
    
    const phaseLabels: Record<number, string> = {
      0: 'Intake',
      1: 'Document Collection',
      2: 'Additional Documents',
      3: 'Processing',
    };

    return phaseLabels[phase] || `Phase ${phase}`;
  }

  /**
   * Get phase status color
   */
  getPhaseColor(phase: number): string {
    const phaseColors: Record<number, string> = {
      0: '#6b7280', // gray
      1: '#3b82f6', // blue
      2: '#f59e0b', // amber
      3: '#10b981', // green
    };

    return phaseColors[phase] || '#6b7280';
  }

  /**
   * Get document status badge color
   */
  getDocumentStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'pending': '#f59e0b',   // amber
      'approved': '#10b981',  // green
      'rejected': '#ef4444',  // red
      'synced': '#10b981',    // green
      'uploading': '#3b82f6', // blue
      'failed': '#ef4444',    // red
    };

    return statusColors[status] || '#6b7280';
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export default new DataTransformService();
