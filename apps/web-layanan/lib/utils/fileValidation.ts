export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateFile = (file: File): ValidationResult => {
  const maxSize = 10 * 1024 * 1024; // 10MB

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'text/plain',
  ];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File "${file.name}" terlalu besar. Maksimal 10MB.`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipe file "${file.name}" tidak didukung.`,
    };
  }

  return { valid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};