import { HttpClient } from './client';
import type {
  SignUpRequest,
  SignInRequest,
  AuthResponse,
  SessionResponse,
  DeviceInfo,
  DeviceResponse,
} from './types';

export class AuthApi {
  constructor(private http: HttpClient) {}

  async signUp(data: SignUpRequest, deviceInfo?: DeviceInfo): Promise<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/signup', {
      ...data,
      deviceInfo,
    });
  }

  async signIn(data: SignInRequest, deviceInfo?: DeviceInfo): Promise<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/signin', {
      ...data,
      deviceInfo,
    });
  }

  async signOut(): Promise<void> {
    await this.http.post('/auth/signout');
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/refresh', { refreshToken });
  }

  async getSession(): Promise<SessionResponse> {
    return this.http.get<SessionResponse>('/auth/session');
  }

  async getDevices(): Promise<{ devices: DeviceResponse[]; total: number }> {
    return this.http.get('/auth/devices');
  }

  async revokeDevice(deviceId: string): Promise<void> {
    await this.http.delete(`/auth/devices/${deviceId}`);
  }

  async revokeAllDevices(): Promise<void> {
    await this.http.post('/auth/devices/revoke-all');
  }

  async registerPushToken(pushToken: string, deviceId?: string): Promise<void> {
    await this.http.post('/auth/push-token', { pushToken, deviceId });
  }
}

