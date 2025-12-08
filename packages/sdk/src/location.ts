import { HttpClient } from './client';
import type {
  LocationUpdate,
  LocationResponse,
  SessionRoute,
  PaceStats,
  HeartbeatRequest,
  HeartbeatResponse,
  RunnerStatusInfo,
} from './types';

export class LocationApi {
  constructor(private http: HttpClient) {}

  async updateLocation(data: LocationUpdate): Promise<LocationResponse> {
    return this.http.post<LocationResponse>('/location/update', data);
  }

  async updateBulkLocations(locations: LocationUpdate[]): Promise<{ processed: number }> {
    return this.http.post('/location/bulk', { locations });
  }

  async startTracking(sessionId?: string, soloRunId?: string): Promise<{ status: string }> {
    return this.http.post('/location/start', { sessionId, soloRunId });
  }

  async stopTracking(sessionId?: string, soloRunId?: string): Promise<{ status: string }> {
    return this.http.post('/location/stop', { sessionId, soloRunId });
  }

  async getSessionRoute(sessionId: string): Promise<SessionRoute> {
    return this.http.get<SessionRoute>(`/location/route/${sessionId}`);
  }

  async getPaceStats(sessionId?: string, soloRunId?: string): Promise<PaceStats> {
    const params: Record<string, string> = {};
    if (sessionId) params.sessionId = sessionId;
    if (soloRunId) params.soloRunId = soloRunId;
    return this.http.get<PaceStats>('/location/pace', params);
  }

  async sendHeartbeat(data: HeartbeatRequest): Promise<HeartbeatResponse> {
    return this.http.post<HeartbeatResponse>('/location/heartbeat', data);
  }

  async getRunnerStatus(userId: string): Promise<RunnerStatusInfo> {
    return this.http.get<RunnerStatusInfo>(`/location/status/${userId}`);
  }

  async getMyStatus(): Promise<RunnerStatusInfo> {
    return this.http.get<RunnerStatusInfo>('/location/status');
  }
}

