import { HttpClient } from './client';
import type { FeedItem, FeedResponse } from './types';

export class FeedApi {
  constructor(private http: HttpClient) {}

  async getFeed(limit?: number, offset?: number): Promise<FeedResponse> {
    const params: Record<string, unknown> = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return this.http.get<FeedResponse>('/feed', params);
  }

  async getFeedItem(itemId: string): Promise<FeedItem> {
    return this.http.get<FeedItem>(`/feed/${itemId}`);
  }

  async likeItem(itemId: string): Promise<{ liked: boolean; likesCount: number }> {
    return this.http.post(`/feed/${itemId}/like`, {});
  }

  async unlikeItem(itemId: string): Promise<{ liked: boolean; likesCount: number }> {
    return this.http.delete(`/feed/${itemId}/like`);
  }

  async getComments(
    itemId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    comments: {
      id: string;
      userId: string;
      displayName: string;
      avatarUrl?: string;
      content: string;
      createdAt: Date;
    }[];
    total: number;
  }> {
    const params: Record<string, unknown> = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return this.http.get(`/feed/${itemId}/comments`, params);
  }

  async addComment(itemId: string, content: string): Promise<{
    id: string;
    content: string;
    createdAt: Date;
  }> {
    return this.http.post(`/feed/${itemId}/comments`, { content });
  }

  async deleteComment(itemId: string, commentId: string): Promise<void> {
    await this.http.delete(`/feed/${itemId}/comments/${commentId}`);
  }

  async hideItem(itemId: string): Promise<void> {
    await this.http.post(`/feed/${itemId}/hide`, {});
  }

  async reportItem(itemId: string, reason: string): Promise<void> {
    await this.http.post(`/feed/${itemId}/report`, { reason });
  }
}

