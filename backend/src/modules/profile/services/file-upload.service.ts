import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  mimetype: string;
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
    this.baseUrl = this.configService.get('UPLOAD_BASE_URL', 'http://localhost:3001/uploads');
    this.maxFileSize = this.configService.get('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB

    // Ensure upload directory exists
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists(): void {
    const avatarDir = path.join(this.uploadDir, 'avatars');
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }
  }

  validateFile(file: UploadedFile): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  async uploadAvatar(userId: string, file: UploadedFile): Promise<UploadResult> {
    this.validateFile(file);

    // Generate unique filename
    const hash = crypto.createHash('md5').update(userId + Date.now()).digest('hex');
    const ext = this.getExtension(file.mimetype);
    const filename = `avatar_${hash}${ext}`;
    const thumbnailFilename = `avatar_${hash}_thumb${ext}`;

    const filepath = path.join(this.uploadDir, 'avatars', filename);
    const thumbnailPath = path.join(this.uploadDir, 'avatars', thumbnailFilename);

    try {
      // Save original file
      await fs.promises.writeFile(filepath, file.buffer);

      // Create thumbnail (simple copy for now - in production, use sharp or similar)
      await fs.promises.writeFile(thumbnailPath, file.buffer);

      const url = `${this.baseUrl}/avatars/${filename}`;
      const thumbnailUrl = `${this.baseUrl}/avatars/${thumbnailFilename}`;

      this.logger.log(`Avatar uploaded for user ${userId}: ${filename}`);

      return {
        url,
        thumbnailUrl,
        filename,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      this.logger.error(`Failed to upload avatar: ${(error as Error).message}`);
      throw new BadRequestException('Failed to upload file');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const filename = path.basename(fileUrl);
      const filepath = path.join(this.uploadDir, 'avatars', filename);
      
      if (fs.existsSync(filepath)) {
        await fs.promises.unlink(filepath);
        this.logger.log(`Deleted file: ${filename}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to delete file: ${(error as Error).message}`);
    }
  }

  private getExtension(mimetype: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    return mimeToExt[mimetype] || '.jpg';
  }
}

