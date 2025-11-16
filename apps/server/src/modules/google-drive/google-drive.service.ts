// ============================================================================
// FILE: src/modules/google-drive/google-drive.service.ts
// Google Drive API Service - Handle upload, download, delete
// ============================================================================
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Readable } from 'stream';

export interface UploadFileOptions {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  folderId?: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  embedLink: string;
  thumbnailLink?: string;
  size?: string;
}

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private drive;

  constructor(private configService: ConfigService) {
    this.initializeDrive();
  }

  /**
   * Initialize Google Drive API with service account credentials
   */
  private initializeDrive() {
    try {
      const credentials = this.getCredentials();

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.file',
        ],
      });

      this.drive = google.drive({ version: 'v3', auth });
      this.logger.log('✅ Google Drive API initialized successfully');
      this.logger.log(`Service Account: ${credentials.client_email}`);
      this.logger.log(`Project ID: ${credentials.project_id}`);
    } catch (error) {
      this.logger.error('❌ Failed to initialize Google Drive API');
      this.logger.error('Error details:', error.message);
      throw new BadRequestException(
        'Failed to initialize Google Drive. Check credentials.',
      );
    }
  }

  /**
   * Get Google Drive credentials from environment
   */
  private getCredentials() {
    const credentialsJson = this.configService.get<string>(
      'GOOGLE_DRIVE_CREDENTIALS',
    );

    if (!credentialsJson) {
      throw new BadRequestException(
        'GOOGLE_DRIVE_CREDENTIALS not found in environment',
      );
    }

    try {
      return JSON.parse(credentialsJson);
    } catch (error) {
      throw new BadRequestException('Invalid Google Drive credentials JSON');
    }
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFile(options: UploadFileOptions): Promise<GoogleDriveFile> {
    const { fileName, mimeType, buffer, folderId } = options;

    try {
      this.logger.log(`Uploading file to Google Drive: ${fileName}`);

      const fileMetadata: any = {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
      };

      const media = {
        mimeType,
        body: Readable.from(buffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields:
          'id, name, webViewLink, webContentLink, thumbnailLink, size, mimeType',
      });

      const file = response.data;

      // Set file permissions to 'anyone with link can view'
      await this.drive.permissions.create({
        fileId: file.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      this.logger.log(`File uploaded successfully: ${file.id}`);

      return {
        id: file.id,
        name: file.name,
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
        embedLink: `https://drive.google.com/file/d/${file.id}/preview`,
        thumbnailLink: file.thumbnailLink,
        size: file.size,
      };
    } catch (error) {
      // Enhanced error logging
      this.logger.error(`Failed to upload file: ${fileName}`);
      this.logger.error('Error details:', {
        message: error.message,
        code: error.code,
        errors: error.errors,
        response: error.response?.data,
      });

      // Provide more specific error messages
      if (error.code === 403) {
        throw new BadRequestException(
          'Google Drive API access denied. Please check: 1) API is enabled in Google Cloud Console, 2) Service account has correct permissions',
        );
      }

      if (error.code === 401) {
        throw new BadRequestException(
          'Invalid Google Drive credentials. Please verify GOOGLE_DRIVE_CREDENTIALS in .env file',
        );
      }

      if (error.message?.includes('API has not been used')) {
        throw new BadRequestException(
          'Google Drive API is not enabled. Enable it at: https://console.cloud.google.com/apis/library/drive.googleapis.com',
        );
      }

      throw new BadRequestException(
        `Failed to upload file to Google Drive: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get file metadata from Google Drive
   */
  async getFile(fileId: string): Promise<GoogleDriveFile> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields:
          'id, name, webViewLink, webContentLink, thumbnailLink, size, mimeType',
      });

      const file = response.data;

      return {
        id: file.id,
        name: file.name,
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
        embedLink: `https://drive.google.com/file/d/${file.id}/preview`,
        thumbnailLink: file.thumbnailLink,
        size: file.size,
      };
    } catch (error) {
      this.logger.error(`Failed to get file: ${fileId}`, error);
      throw new BadRequestException('Failed to get file from Google Drive');
    }
  }

  /**
   * Delete file from Google Drive
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      this.logger.log(`Deleting file from Google Drive: ${fileId}`);

      await this.drive.files.delete({
        fileId,
      });

      this.logger.log(`File deleted successfully: ${fileId}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${fileId}`, error);
      throw new BadRequestException('Failed to delete file from Google Drive');
    }
  }

  /**
   * Create folder in Google Drive
   */
  async createFolder(folderName: string, parentFolderId?: string): Promise<string> {
    try {
      this.logger.log(`Creating folder in Google Drive: ${folderName}`);

      const fileMetadata: any = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name',
      });

      const folderId = response.data.id;
      this.logger.log(`Folder created successfully: ${folderId}`);

      return folderId;
    } catch (error) {
      this.logger.error(`Failed to create folder: ${folderName}`, error);
      throw new BadRequestException('Failed to create folder in Google Drive');
    }
  }

  /**
   * Get or create folder for a perkara
   */
  async getOrCreatePerkaraFolder(
    nomorPerkara: string,
    parentFolderId?: string,
  ): Promise<string> {
    try {
      // Search for existing folder
      const query = `name='${nomorPerkara}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (response.data.files && response.data.files.length > 0) {
        // Folder exists, return its ID
        return response.data.files[0].id;
      }

      // Folder doesn't exist, create it
      return await this.createFolder(nomorPerkara, parentFolderId);
    } catch (error) {
      this.logger.error(
        `Failed to get or create perkara folder: ${nomorPerkara}`,
        error,
      );
      throw new BadRequestException('Failed to manage perkara folder');
    }
  }

  /**
   * Test Google Drive connection and permissions
   * Returns diagnostic information about the setup
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    details: any;
  }> {
    try {
      this.logger.log('Testing Google Drive API connection...');

      // Try to get info about the Drive
      const response = await this.drive.about.get({
        fields: 'user, storageQuota',
      });

      this.logger.log('✅ Google Drive connection successful');

      return {
        success: true,
        message: 'Google Drive API connection successful',
        details: {
          user: response.data.user,
          storageQuota: response.data.storageQuota,
        },
      };
    } catch (error) {
      this.logger.error('❌ Google Drive connection test failed');
      this.logger.error('Error details:', {
        message: error.message,
        code: error.code,
        errors: error.errors,
      });

      return {
        success: false,
        message: 'Google Drive API connection failed',
        details: {
          error: error.message,
          code: error.code,
          hint: this.getErrorHint(error),
        },
      };
    }
  }

  /**
   * Get helpful hint based on error
   */
  private getErrorHint(error: any): string {
    if (error.code === 403) {
      return 'API not enabled. Enable Google Drive API at: https://console.cloud.google.com/apis/library/drive.googleapis.com';
    }

    if (error.code === 401) {
      return 'Invalid credentials. Check GOOGLE_DRIVE_CREDENTIALS in .env file';
    }

    if (error.message?.includes('API has not been used')) {
      return 'Enable Google Drive API in Google Cloud Console';
    }

    return 'Check credentials and API settings';
  }
}
