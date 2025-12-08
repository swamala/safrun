import { HttpClient } from './client';
import type { Notification, NotificationList } from './types';

export class NotificationsApi {
  constructor(private http: HttpClient) {}

  async getNotifications(limit?: number, offset?: number): Promise<NotificationList> {
    const params: Record<string, unknown> = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return this.http.get<NotificationList>('/notifications', params);
  }

  async getUnreadCount(): Promise<{ count: number }> {
    return this.http.get('/notifications/unread-count');
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.http.patch(`/notifications/${notificationId}/read`, {});
  }

  async markAllAsRead(): Promise<void> {
    await this.http.post('/notifications/read-all', {});
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.http.delete(`/notifications/${notificationId}`);
  }

  async updatePreferences(preferences: {
    sosAlerts?: boolean;
    sessionInvites?: boolean;
    milestones?: boolean;
    marketing?: boolean;
  }): Promise<void> {
    await this.http.patch('/notifications/preferences', preferences);
  }

  async getPreferences(): Promise<{
    sosAlerts: boolean;
    sessionInvites: boolean;
    milestones: boolean;
    marketing: boolean;
  }> {
    return this.http.get('/notifications/preferences');
  }
}

