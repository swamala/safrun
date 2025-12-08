import { HttpClient } from './client';
import type {
  CreateSessionRequest,
  JoinSessionRequest,
  Session,
  SessionListResponse,
  SessionParticipant,
} from './types';

export class SessionsApi {
  constructor(private http: HttpClient) {}

  async createSession(data: CreateSessionRequest): Promise<Session> {
    return this.http.post<Session>('/sessions', data);
  }

  async getSession(sessionId: string): Promise<Session> {
    return this.http.get<Session>(`/sessions/${sessionId}`);
  }

  async joinSession(sessionId: string, data?: JoinSessionRequest): Promise<Session> {
    return this.http.post<Session>(`/sessions/${sessionId}/join`, data || {});
  }

  async joinByInviteCode(inviteCode: string): Promise<Session> {
    return this.http.post<Session>('/sessions/join', { inviteCode });
  }

  async leaveSession(sessionId: string): Promise<void> {
    await this.http.post(`/sessions/${sessionId}/leave`, {});
  }

  async startSession(sessionId: string): Promise<Session> {
    return this.http.post<Session>(`/sessions/${sessionId}/start`, {});
  }

  async pauseSession(sessionId: string): Promise<Session> {
    return this.http.post<Session>(`/sessions/${sessionId}/pause`, {});
  }

  async resumeSession(sessionId: string): Promise<Session> {
    return this.http.post<Session>(`/sessions/${sessionId}/resume`, {});
  }

  async endSession(sessionId: string): Promise<Session> {
    return this.http.post<Session>(`/sessions/${sessionId}/end`, {});
  }

  async cancelSession(sessionId: string): Promise<void> {
    await this.http.delete(`/sessions/${sessionId}`);
  }

  async getMySessions(
    status?: string,
    limit?: number,
    offset?: number
  ): Promise<SessionListResponse> {
    const params: Record<string, unknown> = {};
    if (status) params.status = status;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return this.http.get<SessionListResponse>('/sessions/my', params);
  }

  async getActiveSessions(limit?: number, offset?: number): Promise<SessionListResponse> {
    const params: Record<string, unknown> = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return this.http.get<SessionListResponse>('/sessions/active', params);
  }

  async getNearbySessions(
    latitude: number,
    longitude: number,
    radius?: number
  ): Promise<SessionListResponse> {
    return this.http.get<SessionListResponse>('/sessions/nearby', {
      latitude,
      longitude,
      radius: radius || 5000,
    });
  }

  async getSessionParticipants(sessionId: string): Promise<SessionParticipant[]> {
    return this.http.get<SessionParticipant[]>(`/sessions/${sessionId}/participants`);
  }

  async kickParticipant(sessionId: string, userId: string): Promise<void> {
    await this.http.post(`/sessions/${sessionId}/kick`, { userId });
  }

  async inviteToSession(sessionId: string, userIds: string[]): Promise<void> {
    await this.http.post(`/sessions/${sessionId}/invite`, { userIds });
  }
}

