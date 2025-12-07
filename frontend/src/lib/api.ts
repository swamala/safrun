import axios, { AxiosError, AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch {
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/signin';
            }
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  private async refreshToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    this.refreshPromise = axios
      .post(`${API_URL}/api/v1/auth/refresh`, { refreshToken })
      .then((response) => {
        const { accessToken, refreshToken: newRefresh } = response.data;
        this.setTokens(accessToken, newRefresh);
        return accessToken;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  // Auth endpoints
  async signUp(data: {
    email?: string;
    phone?: string;
    password: string;
    displayName: string;
  }) {
    const response = await this.client.post('/auth/signup', data);
    return response.data;
  }

  async signIn(data: { identifier: string; password: string }) {
    const response = await this.client.post('/auth/signin', data);
    return response.data;
  }

  async signOut() {
    await this.client.post('/auth/signout');
    this.clearTokens();
  }

  // Profile endpoints
  async getProfile() {
    const response = await this.client.get('/profile');
    return response.data;
  }

  async updateProfile(data: { displayName?: string; bio?: string; avatarUrl?: string }) {
    const response = await this.client.put('/profile', data);
    return response.data;
  }

  async updateSafetySettings(data: {
    autoSOSEnabled?: boolean;
    fallDetectionEnabled?: boolean;
    noMovementTimeout?: number;
    sosVerificationTime?: number;
  }) {
    const response = await this.client.patch('/profile/safety', data);
    return response.data;
  }

  async getEmergencyContacts() {
    const response = await this.client.get('/profile/emergency-contacts');
    return response.data;
  }

  async addEmergencyContact(data: {
    name: string;
    phone: string;
    email?: string;
    relationship: string;
    isPrimary?: boolean;
  }) {
    const response = await this.client.put('/profile/emergency-contacts', data);
    return response.data;
  }

  // Session endpoints
  async createSession(data: {
    name: string;
    description?: string;
    scheduledStartAt?: string;
    privacy?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
    startLatitude?: number;
    startLongitude?: number;
    plannedDistance?: number;
    maxParticipants?: number;
  }) {
    const response = await this.client.post('/sessions', data);
    return response.data;
  }

  async getSessions(params?: {
    status?: string;
    participating?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const response = await this.client.get('/sessions', { params });
    return response.data;
  }

  async getSession(sessionId: string) {
    const response = await this.client.get(`/sessions/${sessionId}`);
    return response.data;
  }

  async getActiveSession() {
    const response = await this.client.get('/sessions/active');
    return response.data;
  }

  async joinSession(sessionId: string) {
    const response = await this.client.post(`/sessions/${sessionId}/join`);
    return response.data;
  }

  async leaveSession(sessionId: string) {
    await this.client.delete(`/sessions/${sessionId}/leave`);
  }

  async startSession(sessionId: string) {
    const response = await this.client.post(`/sessions/${sessionId}/start`);
    return response.data;
  }

  async endSession(sessionId: string) {
    const response = await this.client.post(`/sessions/${sessionId}/end`);
    return response.data;
  }

  async getLeaderboard(sessionId: string) {
    const response = await this.client.get(`/sessions/${sessionId}/leaderboard`);
    return response.data;
  }

  // Location endpoints
  async updateLocation(data: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    altitude?: number;
    batteryLevel?: number;
  }, sessionId?: string) {
    const response = await this.client.post('/location', data, {
      params: sessionId ? { sessionId } : undefined,
    });
    return response.data;
  }

  async getSessionLocations(sessionId: string) {
    const response = await this.client.get(`/location/session/${sessionId}`);
    return response.data;
  }

  // SOS endpoints
  async triggerSOS(data: {
    latitude: number;
    longitude: number;
    triggerType: string;
    notes?: string;
    batteryLevel?: number;
  }) {
    const response = await this.client.post('/sos/trigger', data);
    return response.data;
  }

  async verifySOS(alertId: string, isSafe: boolean) {
    const response = await this.client.post('/sos/verify', { alertId, isSafe });
    return response.data;
  }

  async acknowledgeSOS(alertId: string, accepted: boolean) {
    const response = await this.client.post('/sos/acknowledge', { alertId, accepted });
    return response.data;
  }

  async resolveSOSAlert(alertId: string) {
    const response = await this.client.post(`/sos/${alertId}/resolve`);
    return response.data;
  }

  async getActiveSOSAlert() {
    const response = await this.client.get('/sos/active');
    return response.data;
  }

  async getSOSHistory(limit?: number, offset?: number) {
    const response = await this.client.get('/sos/history', { params: { limit, offset } });
    return response.data;
  }

  async getNearbySOSAlerts(latitude: number, longitude: number) {
    const response = await this.client.get('/sos/nearby', { params: { latitude, longitude } });
    return response.data;
  }

  // Nearby endpoints
  async searchNearbyRunners(data: {
    latitude: number;
    longitude: number;
    radiusMeters?: number;
    limit?: number;
  }) {
    const response = await this.client.post('/nearby/search', data);
    return response.data;
  }

  async updateNearbyVisibility(isVisible: boolean) {
    await this.client.post('/nearby/visibility', { isVisible });
  }

  // Notifications
  async registerPushToken(deviceId: string, pushToken: string) {
    await this.client.post('/notifications/push-token', { deviceId, pushToken });
  }
}

export const api = new ApiClient();

// Extend axios config type
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

