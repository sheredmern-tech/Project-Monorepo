// ============================================================================
// FILE 1: lib/utils/errors.ts - Custom Error Classes
// ============================================================================

/**
 * Base API Error class with comprehensive properties
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  // Error type checkers
  isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  isForbidden(): boolean {
    return this.statusCode === 403;
  }

  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  isValidationError(): boolean {
    return this.statusCode === 400 || this.statusCode === 422;
  }

  isConflict(): boolean {
    return this.statusCode === 409;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  isRateLimited(): boolean {
    return this.statusCode === 429;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.isNetworkError()) {
      return 'Tidak dapat terhubung ke server. Pastikan koneksi internet Anda aktif.';
    }
    if (this.isUnauthorized()) {
      return 'Sesi Anda telah berakhir. Silakan login kembali.';
    }
    if (this.isForbidden()) {
      return 'Anda tidak memiliki akses untuk melakukan aksi ini.';
    }
    if (this.isNotFound()) {
      return 'Data yang Anda cari tidak ditemukan.';
    }
    if (this.isValidationError()) {
      return this.message || 'Data yang Anda masukkan tidak valid.';
    }
    if (this.isConflict()) {
      return this.message || 'Data sudah ada dalam sistem.';
    }
    if (this.isRateLimited()) {
      return 'Terlalu banyak permintaan. Silakan coba beberapa saat lagi.';
    }
    if (this.isServerError()) {
      return 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.';
    }
    return this.message || 'Terjadi kesalahan yang tidak terduga.';
  }

  /**
   * Get detailed error info for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
      stack: this.stack,
    };
  }
}

/**
 * Specific error types for better error handling
 */
export class NetworkError extends ApiError {
  constructor(message = 'Network connection failed') {
    super(0, message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Access denied') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = 'Resource', details?: unknown) {
    super(404, `${resource} not found`, 'NOT_FOUND', details);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(
    message = 'Validation failed',
    public validationErrors?: Record<string, string[]>
  ) {
    super(400, message, 'VALIDATION_ERROR', validationErrors);
    this.name = 'ValidationError';
  }

  getFieldErrors(): Record<string, string[]> {
    return this.validationErrors || {};
  }

  getFirstError(): string | null {
    const errors = this.getFieldErrors();
    const firstField = Object.keys(errors)[0];
    return firstField ? errors[firstField][0] : null;
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict', details?: unknown) {
    super(409, message, 'CONFLICT_ERROR', details);
    this.name = 'ConflictError';
  }
}

export class ServerError extends ApiError {
  constructor(message = 'Internal server error', details?: unknown) {
    super(500, message, 'SERVER_ERROR', details);
    this.name = 'ServerError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests', public retryAfter?: number) {
    super(429, message, 'RATE_LIMIT_ERROR', { retryAfter });
    this.name = 'RateLimitError';
  }
}