import { HttpClient } from './client';
import type {
  TriggerSOSRequest,
  InitiatePendingSOSRequest,
  ActivateSOSRequest,
  CancelSOSRequest,
  VerifySOSRequest,
  RespondToSOSRequest,
  UpdateResponderLocationRequest,
  SOSAlert,
  SOSListResponse,
  RespondersListResponse,
  SOSTimeline,
} from './types';

export class SOSApi {
  constructor(private http: HttpClient) {}

  // New flow: initiate → (countdown) → activate/cancel
  async initiatePending(data: InitiatePendingSOSRequest): Promise<SOSAlert> {
    return this.http.post<SOSAlert>('/sos/initiate', data);
  }

  async activate(data: ActivateSOSRequest): Promise<SOSAlert> {
    return this.http.post<SOSAlert>('/sos/activate', data);
  }

  async cancel(data: CancelSOSRequest): Promise<SOSAlert> {
    return this.http.post<SOSAlert>('/sos/cancel', data);
  }

  // Legacy flow: trigger → verify
  async trigger(data: TriggerSOSRequest): Promise<SOSAlert> {
    return this.http.post<SOSAlert>('/sos/trigger', data);
  }

  async verify(data: VerifySOSRequest): Promise<SOSAlert> {
    return this.http.post<SOSAlert>('/sos/verify', data);
  }

  // Responder actions
  async respondToAlert(data: RespondToSOSRequest): Promise<SOSAlert> {
    return this.http.post<SOSAlert>('/sos/respond', data);
  }

  async updateResponderLocation(data: UpdateResponderLocationRequest): Promise<{ eta: number }> {
    return this.http.post('/sos/responder/location', data);
  }

  async markArrived(alertId: string): Promise<void> {
    await this.http.post(`/sos/${alertId}/arrived`, {});
  }

  // Resolution
  async resolve(alertId: string): Promise<SOSAlert> {
    return this.http.post<SOSAlert>(`/sos/${alertId}/resolve`, {});
  }

  // Queries
  async getActiveAlert(): Promise<SOSAlert | null> {
    try {
      return await this.http.get<SOSAlert>('/sos/active');
    } catch {
      return null;
    }
  }

  async getAlert(alertId: string): Promise<SOSAlert> {
    return this.http.get<SOSAlert>(`/sos/${alertId}`);
  }

  async getAlertHistory(limit?: number, offset?: number): Promise<SOSListResponse> {
    const params: Record<string, unknown> = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return this.http.get<SOSListResponse>('/sos/history', params);
  }

  async getNearbyAlerts(
    latitude: number,
    longitude: number
  ): Promise<SOSAlert[]> {
    return this.http.get<SOSAlert[]>('/sos/nearby', { latitude, longitude });
  }

  async getResponders(alertId?: string): Promise<RespondersListResponse> {
    if (alertId) {
      return this.http.get<RespondersListResponse>(`/sos/${alertId}/responders`);
    }
    return this.http.get<RespondersListResponse>('/sos/responders');
  }

  async getTimeline(alertId: string): Promise<SOSTimeline> {
    return this.http.get<SOSTimeline>(`/sos/${alertId}/timeline`);
  }
}

