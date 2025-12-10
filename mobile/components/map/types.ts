import type { LatLng } from 'react-native-maps';

export interface RunnerLocation {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  pace?: string;
  distance?: number;
  status: 'running' | 'paused' | 'idle' | 'sos' | 'ahead' | 'behind';
  isCurrentUser?: boolean;
  sessionId?: string;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp?: number;
  speed?: number;
}

export interface SOSLocation {
  alertId: string;
  userId: string;
  displayName: string;
  latitude: number;
  longitude: number;
  isApproximate?: boolean;
  distance?: number;
  triggeredAt: Date;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface ResponderInfo {
  id: string;
  displayName: string;
  avatarUrl?: string;
  latitude: number;
  longitude: number;
  status: 'notified' | 'accepted' | 'en_route' | 'arrived';
  eta?: number;
  distance?: number;
}

