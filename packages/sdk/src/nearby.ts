import { HttpClient } from './client';
import type { NearbyRunner, NearbyRunnersList } from './types';

export class NearbyApi {
  constructor(private http: HttpClient) {}

  async getNearbyRunners(
    latitude: number,
    longitude: number,
    radius?: number,
    limit?: number
  ): Promise<NearbyRunnersList> {
    return this.http.get<NearbyRunnersList>('/nearby', {
      latitude,
      longitude,
      radius: radius || 1000,
      limit: limit || 20,
    });
  }

  async updateMyLocation(latitude: number, longitude: number): Promise<{ status: string }> {
    return this.http.post('/nearby/location', { latitude, longitude });
  }

  async setVisibility(visible: boolean): Promise<void> {
    await this.http.patch('/nearby/visibility', { visible });
  }

  async getVisibility(): Promise<{ visible: boolean }> {
    return this.http.get('/nearby/visibility');
  }
}

