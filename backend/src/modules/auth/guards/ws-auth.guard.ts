import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TokenService } from '../services/token.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const token = this.extractTokenFromClient(client);

      if (!token) {
        throw new WsException('Unauthorized: No token provided');
      }

      // Check if token is blacklisted
      const isBlacklisted = await this.tokenService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new WsException('Unauthorized: Token has been revoked');
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Attach user info to socket data
      client.data.user = {
        id: payload.userId,
        deviceId: payload.deviceId,
      };

      return true;
    } catch (error) {
      throw new WsException(`Unauthorized: ${(error as Error).message}`);
    }
  }

  private extractTokenFromClient(client: Socket): string | null {
    // Try handshake auth
    const auth = client.handshake.auth?.token;
    if (auth) {
      return auth.replace('Bearer ', '');
    }

    // Try handshake headers
    const authHeader = client.handshake.headers?.authorization;
    if (authHeader) {
      return authHeader.replace('Bearer ', '');
    }

    // Try query params
    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string') {
      return queryToken;
    }

    return null;
  }
}

