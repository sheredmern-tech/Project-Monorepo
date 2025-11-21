import { DocumentType } from '@/types';

/**
 * Auto-detect document type from filename
 */
export const detectDocumentType = (filename: string): DocumentType => {
  const lower = filename.toLowerCase();

  // Gugatan patterns
  if (
    lower.includes('gugat') ||
    lower.includes('permohonan') ||
    lower.includes('tuntutan') ||
    lower.includes('somasi')
  ) {
    return 'gugatan';
  }

  // Surat Kuasa patterns
  if (
    lower.includes('kuasa') ||
    lower.includes('power of attorney') ||
    lower.includes('poa')
  ) {
    return 'surat_kuasa';
  }

  // Putusan patterns
  if (
    lower.includes('putusan') ||
    lower.includes('verdict') ||
    lower.includes('keputusan') ||
    lower.includes('vonis')
  ) {
    return 'putusan';
  }

  // Bukti patterns
  if (
    lower.includes('bukti') ||
    lower.includes('evidence') ||
    lower.includes('lampiran') ||
    lower.includes('exhibit')
  ) {
    return 'bukti';
  }

  // Kontrak patterns
  if (
    lower.includes('kontrak') ||
    lower.includes('perjanjian') ||
    lower.includes('agreement') ||
    lower.includes('mou')
  ) {
    return 'kontrak';
  }

  // Surat Menyurat patterns
  if (
    lower.includes('surat') ||
    lower.includes('letter') ||
    lower.includes('korespondensi') ||
    lower.includes('email')
  ) {
    return 'surat_menyurat';
  }

  return 'lainnya';
};

/**
 * Extract metadata from filename
 */
export const extractMetadataFromFilename = (file: File) => {
  const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
  const tipe_dokumen = detectDocumentType(file.name);

  // Extract potential date (YYYY-MM-DD or DD-MM-YYYY)
  const dateMatch = file.name.match(/(\d{4}-\d{2}-\d{2})|(\d{2}-\d{2}-\d{4})/);
  const tanggal = dateMatch ? dateMatch[0] : null;

  // Extract potential nomor (e.g., 123/ABC/2024)
  const nomorMatch = file.name.match(/\d{2,}\/[A-Z]+\/\d{4}/);
  const nomor = nomorMatch ? nomorMatch[0] : null;

  return {
    nama_dokumen: nameWithoutExt,
    tipe_dokumen,
    deskripsi: `Auto-uploaded: ${file.name}`,
    kategori: 'Bulk Upload',
    metadata: {
      original_filename: file.name,
      file_size: file.size,
      file_type: file.type,
      detected_date: tanggal,
      detected_nomor: nomor,
    },
  };
};

/**
 * Get document type label (Indonesian)
 */
export const getDocumentTypeLabel = (type: DocumentType): string => {
  const labels: Record<DocumentType, string> = {
    surat_kuasa: 'Surat Kuasa',
    gugatan: 'Gugatan',
    putusan: 'Putusan',
    bukti: 'Bukti',
    kontrak: 'Kontrak',
    surat_menyurat: 'Surat Menyurat',
    lainnya: 'Lainnya',
  };

  return labels[type] || 'Lainnya';
};

/**
 * Get document type color for UI
 */
export const getDocumentTypeColor = (type: DocumentType): string => {
  const colors: Record<DocumentType, string> = {
    surat_kuasa: 'blue',
    gugatan: 'red',
    putusan: 'green',
    bukti: 'yellow',
    kontrak: 'purple',
    surat_menyurat: 'indigo',
    lainnya: 'gray',
  };

  return colors[type] || 'gray';
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Get file icon emoji based on type
 */
export const getFileIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('text')) return '📃';
  return '📎';
};