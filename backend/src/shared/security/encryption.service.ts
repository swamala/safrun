import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly authTagLength = 16;
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKey || encryptionKey.length < this.keyLength) {
      this.logger.warn('Encryption key not configured or too short');
      // Generate a default key for development
      this.key = crypto.scryptSync('default-dev-key', 'salt', this.keyLength);
    } else {
      this.key = Buffer.from(encryptionKey.slice(0, this.keyLength));
    }
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    // Combine iv + authTag + encrypted data
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'base64'),
    ]);

    return combined.toString('base64');
  }

  /**
   * Decrypt data encrypted with encrypt()
   */
  decrypt(ciphertext: string): string {
    const combined = Buffer.from(ciphertext, 'base64');

    const iv = combined.subarray(0, this.ivLength);
    const authTag = combined.subarray(this.ivLength, this.ivLength + this.authTagLength);
    const encrypted = combined.subarray(this.ivLength + this.authTagLength);

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate HMAC signature for data verification
   */
  generateHmac(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  verifyHmac(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateHmac(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Generate a cryptographically secure random string
   */
  generateRandomString(length: number): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  /**
   * Hash sensitive data (one-way)
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate location signature for replay protection
   */
  generateLocationSignature(
    userId: string,
    latitude: number,
    longitude: number,
    timestamp: number,
    userSecret: string,
  ): string {
    const data = `${userId}:${latitude}:${longitude}:${timestamp}`;
    return this.generateHmac(data, userSecret);
  }

  /**
   * Verify location signature
   */
  verifyLocationSignature(
    signature: string,
    userId: string,
    latitude: number,
    longitude: number,
    timestamp: number,
    userSecret: string,
  ): boolean {
    const expectedSignature = this.generateLocationSignature(
      userId,
      latitude,
      longitude,
      timestamp,
      userSecret,
    );
    return signature === expectedSignature;
  }

  /**
   * Encrypt phone number for storage
   */
  encryptPhoneNumber(phone: string): string {
    return this.encrypt(phone);
  }

  /**
   * Decrypt phone number for use
   */
  decryptPhoneNumber(encryptedPhone: string): string {
    try {
      return this.decrypt(encryptedPhone);
    } catch (error) {
      this.logger.error(`Failed to decrypt phone number: ${error.message}`);
      return encryptedPhone; // Return as-is if decryption fails (might be unencrypted)
    }
  }

  /**
   * Encrypt emergency contact data
   */
  encryptEmergencyContact(contact: {
    name: string;
    phone: string;
    email?: string;
  }): { name: string; phone: string; email?: string } {
    return {
      name: contact.name, // Keep name readable for UI
      phone: this.encrypt(contact.phone),
      email: contact.email ? this.encrypt(contact.email) : undefined,
    };
  }

  /**
   * Decrypt emergency contact data
   */
  decryptEmergencyContact(contact: {
    name: string;
    phone: string;
    email?: string;
  }): { name: string; phone: string; email?: string } {
    try {
      return {
        name: contact.name,
        phone: this.decrypt(contact.phone),
        email: contact.email ? this.decrypt(contact.email) : undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to decrypt emergency contact: ${error.message}`);
      return contact; // Return as-is if decryption fails
    }
  }

  /**
   * Mask phone number for display (e.g., +1234***7890)
   */
  maskPhoneNumber(phone: string): string {
    if (phone.length < 6) return '***';
    const start = phone.slice(0, 4);
    const end = phone.slice(-4);
    const middle = '*'.repeat(phone.length - 8);
    return `${start}${middle}${end}`;
  }
}

