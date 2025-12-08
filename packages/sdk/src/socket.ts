import { io, Socket } from 'socket.io-client';
import type {
  LocationUpdate,
  SOSAlert,
  NearbyRunner,
  SessionParticipant,
  SOSResponder,
} from './types';

// ============================================================================
// WebSocket Event Types
// ============================================================================

export interface WSLocationBroadcast {
  userId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

export interface WSSOSAlert {
  type: string;
  alertId: string;
  userId: string;
  userName: string;
  location: { latitude: number; longitude: number };
  distance?: number;
  triggeredAt: Date;
}

export interface WSSOSUpdate {
  type: string;
  alertId: string;
  userId: string;
  status?: string;
  escalationLevel?: string;
  responders?: SOSResponder[];
}

export interface WSSOSVerify {
  type: string;
  alertId: string;
  message: string;
}

export interface WSSOSPreciseLocation {
  type: string;
  alertId: string;
  location: { latitude: number; longitude: number };
}

export interface WSNearbyUpdate {
  runners: NearbyRunner[];
  timestamp: number;
}

export interface WSSessionUpdate {
  sessionId: string;
  status?: string;
  participants?: SessionParticipant[];
}

export interface WSSessionParticipantEvent {
  userId: string;
  timestamp: number;
}

export interface WSGuardianAlert {
  type: string;
  alertId: string;
  userId: string;
  userName: string;
  location?: { latitude: number; longitude: number };
}

// ============================================================================
// Event Map
// ============================================================================

export interface SocketEventMap {
  // Location events
  'location:broadcast': WSLocationBroadcast;
  'location:update': { status: string };

  // SOS events
  'sos:alert': WSSOSAlert;
  'sos:verify': WSSOSVerify;
  'sos:update': WSSOSUpdate;
  'sos:broadcast': WSSOSAlert;
  'sos:guardian-alert': WSGuardianAlert;
  'sos:group-alert': WSGuardianAlert & { sessionId: string };
  'sos:precise-location': WSSOSPreciseLocation;

  // Session events
  'session:update': WSSessionUpdate;
  'session:participant-joined': WSSessionParticipantEvent;
  'session:participant-left': WSSessionParticipantEvent;

  // Nearby events
  'nearby:update': WSNearbyUpdate;

  // Connection events
  connect: void;
  disconnect: string;
  connect_error: Error;
}

// ============================================================================
// Socket Client
// ============================================================================

export type EventCallback<T> = (data: T) => void;
export type UnsubscribeFn = () => void;

export interface SocketConfig {
  url: string;
  getToken: () => string | null;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  autoReconnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export class SafrunSocket {
  private socket: Socket | null = null;
  private config: SocketConfig;
  private eventHandlers: Map<string, Set<EventCallback<unknown>>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;
  private manualDisconnect = false;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: SocketConfig) {
    this.config = {
      autoReconnect: true,
      reconnectAttempts: 10,
      reconnectDelay: 1000,
      ...config,
    };
  }

  connect(): void {
    if (this.socket?.connected || this.isConnecting) return;

    const token = this.config.getToken();
    if (!token) {
      console.warn('[SafrunSocket] No auth token available');
      return;
    }

    this.isConnecting = true;
    this.manualDisconnect = false;

    this.socket = io(this.config.url, {
      path: '/events',
      transports: ['websocket'],
      auth: { token },
      autoConnect: true,
      reconnection: false, // We handle reconnection manually
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.config.onConnect?.();
      this.emit('connect', undefined);
    });

    this.socket.on('disconnect', (reason) => {
      this.stopHeartbeat();
      this.config.onDisconnect?.(reason);
      this.emit('disconnect', reason);

      if (!this.manualDisconnect && this.config.autoReconnect) {
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      this.isConnecting = false;
      this.config.onError?.(error);
      this.emit('connect_error', error);

      if (this.config.autoReconnect) {
        this.scheduleReconnect();
      }
    });

    // Location events
    this.socket.on('location:broadcast', (data) => this.emit('location:broadcast', data));

    // SOS events
    this.socket.on('sos:alert', (data) => this.emit('sos:alert', data));
    this.socket.on('sos:verify', (data) => this.emit('sos:verify', data));
    this.socket.on('sos:update', (data) => this.emit('sos:update', data));
    this.socket.on('sos:broadcast', (data) => this.emit('sos:broadcast', data));
    this.socket.on('sos:guardian-alert', (data) => this.emit('sos:guardian-alert', data));
    this.socket.on('sos:group-alert', (data) => this.emit('sos:group-alert', data));
    this.socket.on('sos:precise-location', (data) => this.emit('sos:precise-location', data));

    // Session events
    this.socket.on('session:update', (data) => this.emit('session:update', data));
    this.socket.on('session:participant-joined', (data) => this.emit('session:participant-joined', data));
    this.socket.on('session:participant-left', (data) => this.emit('session:participant-left', data));

    // Nearby events
    this.socket.on('nearby:update', (data) => this.emit('nearby:update', data));
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    if (this.reconnectAttempts >= (this.config.reconnectAttempts || 10)) {
      console.warn('[SafrunSocket] Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(
      (this.config.reconnectDelay || 1000) * Math.pow(2, this.reconnectAttempts),
      30000
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      console.log(`[SafrunSocket] Reconnecting... attempt ${this.reconnectAttempts}`);
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat', { timestamp: Date.now() });
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  disconnect(): void {
    this.manualDisconnect = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.disconnect();
    this.socket = null;
  }

  get connected(): boolean {
    return this.socket?.connected || false;
  }

  // Event subscription
  on<K extends keyof SocketEventMap>(
    event: K,
    callback: EventCallback<SocketEventMap[K]>
  ): UnsubscribeFn {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(callback as EventCallback<unknown>);

    return () => {
      this.eventHandlers.get(event)?.delete(callback as EventCallback<unknown>);
    };
  }

  off<K extends keyof SocketEventMap>(
    event: K,
    callback?: EventCallback<SocketEventMap[K]>
  ): void {
    if (callback) {
      this.eventHandlers.get(event)?.delete(callback as EventCallback<unknown>);
    } else {
      this.eventHandlers.delete(event);
    }
  }

  private emit<K extends keyof SocketEventMap>(event: K, data: SocketEventMap[K]): void {
    this.eventHandlers.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[SafrunSocket] Error in ${event} handler:`, error);
      }
    });
  }

  // ============================================================================
  // Emitters - Send events to server
  // ============================================================================

  sendLocationUpdate(location: LocationUpdate): void {
    this.socket?.emit('location:update', location);
  }

  sendLocationStream(locations: LocationUpdate[], sessionId?: string, soloRunId?: string): void {
    this.socket?.emit('location:stream', { locations, sessionId, soloRunId });
  }

  joinSession(sessionId: string): void {
    this.socket?.emit('session:join', { sessionId });
  }

  leaveSession(sessionId: string): void {
    this.socket?.emit('session:leave', { sessionId });
  }

  triggerSOS(latitude: number, longitude: number, triggerType: string): void {
    this.socket?.emit('sos:trigger', { latitude, longitude, triggerType });
  }

  respondToSOS(alertId: string, accepted: boolean, latitude?: number, longitude?: number): void {
    this.socket?.emit('sos:respond', { alertId, accepted, latitude, longitude });
  }

  subscribeToSOS(alertId: string): void {
    this.socket?.emit('sos:subscribe', { alertId });
  }

  subscribeToNearby(latitude: number, longitude: number, radius?: number): void {
    this.socket?.emit('nearby:subscribe', { latitude, longitude, radius });
  }
}

