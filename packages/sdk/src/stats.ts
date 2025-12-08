import { HttpClient } from './client';
import type { UserStats, RunHistory, RunHistoryList } from './types';

export class StatsApi {
  constructor(private http: HttpClient) {}

  async getMyStats(): Promise<UserStats> {
    return this.http.get<UserStats>('/stats');
  }

  async getUserStats(userId: string): Promise<UserStats> {
    return this.http.get<UserStats>(`/stats/${userId}`);
  }

  async getRunHistory(limit?: number, offset?: number): Promise<RunHistoryList> {
    const params: Record<string, unknown> = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return this.http.get<RunHistoryList>('/stats/history', params);
  }

  async getRun(runId: string): Promise<RunHistory> {
    return this.http.get<RunHistory>(`/stats/runs/${runId}`);
  }

  async getWeeklyStats(): Promise<{
    distance: number;
    runs: number;
    duration: number;
    averagePace: number;
    dailyBreakdown: { date: string; distance: number; runs: number }[];
  }> {
    return this.http.get('/stats/weekly');
  }

  async getMonthlyStats(): Promise<{
    distance: number;
    runs: number;
    duration: number;
    averagePace: number;
    weeklyBreakdown: { week: number; distance: number; runs: number }[];
  }> {
    return this.http.get('/stats/monthly');
  }

  async getYearlyStats(): Promise<{
    distance: number;
    runs: number;
    duration: number;
    averagePace: number;
    monthlyBreakdown: { month: number; distance: number; runs: number }[];
  }> {
    return this.http.get('/stats/yearly');
  }

  async getLeaderboard(
    type: 'distance' | 'runs' | 'streak',
    period: 'week' | 'month' | 'all'
  ): Promise<{
    entries: { rank: number; userId: string; displayName: string; avatarUrl?: string; value: number }[];
    myRank?: number;
  }> {
    return this.http.get('/stats/leaderboard', { type, period });
  }
}

