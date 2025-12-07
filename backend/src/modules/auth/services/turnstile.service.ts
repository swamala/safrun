import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);
  private readonly secretKey: string;
  private readonly verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get('TURNSTILE_SECRET_KEY', '');
  }

  async verify(token: string): Promise<boolean> {
    if (!this.secretKey) {
      this.logger.warn('Turnstile secret key not configured, skipping verification');
      return true; // Skip verification if not configured
    }

    try {
      const response = await fetch(this.verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: this.secretKey,
          response: token,
        }),
      });

      const result: TurnstileResponse = await response.json();

      if (!result.success) {
        this.logger.warn(`Turnstile verification failed: ${result['error-codes']?.join(', ')}`);
      }

      return result.success;
    } catch (error) {
      this.logger.error(`Turnstile verification error: ${(error as Error).message}`);
      return false;
    }
  }
}

