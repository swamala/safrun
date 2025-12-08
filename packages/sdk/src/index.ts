// ============================================================================
// SAFRUN SDK - Main Entry Point
// ============================================================================

import { HttpClient } from './client';
import { SafrunSocket, type SocketConfig } from './socket';
import { AuthApi } from './auth';
import { ProfileApi } from './profile';
import { LocationApi } from './location';
import { SessionsApi } from './sessions';
import { SOSApi } from './sos';
import { StatsApi } from './stats';
import { FeedApi } from './feed';
import { NotificationsApi } from './notifications';
import { NearbyApi } from './nearby';
import type { SDKConfig } from './types';

// Re-export all types and helpers
export * from './types';
export * from './socket';
export * from './helpers';

// ============================================================================
// SDK Class
// ============================================================================

export interface SafrunSDKConfig extends SDKConfig {
  wsURL?: string;
}

export class SafrunSDK {
  private http: HttpClient;
  private _socket: SafrunSocket | null = null;
  private config: SafrunSDKConfig;

  // API modules
  public readonly auth: AuthApi;
  public readonly profile: ProfileApi;
  public readonly location: LocationApi;
  public readonly sessions: SessionsApi;
  public readonly sos: SOSApi;
  public readonly stats: StatsApi;
  public readonly feed: FeedApi;
  public readonly notifications: NotificationsApi;
  public readonly nearby: NearbyApi;

  constructor(config: SafrunSDKConfig) {
    this.config = config;
    this.http = new HttpClient(config);

    // Initialize API modules
    this.auth = new AuthApi(this.http);
    this.profile = new ProfileApi(this.http);
    this.location = new LocationApi(this.http);
    this.sessions = new SessionsApi(this.http);
    this.sos = new SOSApi(this.http);
    this.stats = new StatsApi(this.http);
    this.feed = new FeedApi(this.http);
    this.notifications = new NotificationsApi(this.http);
    this.nearby = new NearbyApi(this.http);
  }

  // Lazy-loaded socket connection
  get socket(): SafrunSocket {
    if (!this._socket) {
      const wsURL = this.config.wsURL || this.config.baseURL.replace(/^http/, 'ws');
      this._socket = new SafrunSocket({
        url: wsURL,
        getToken: this.config.getAccessToken,
      });
    }
    return this._socket;
  }

  connectSocket(): void {
    this.socket.connect();
  }

  disconnectSocket(): void {
    this._socket?.disconnect();
  }

  get isSocketConnected(): boolean {
    return this._socket?.connected || false;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createSafrunSDK(config: SafrunSDKConfig): SafrunSDK {
  return new SafrunSDK(config);
}

// Default export
export default SafrunSDK;

