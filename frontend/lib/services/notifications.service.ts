import { apiClient } from "../api";

export interface AppNotification {
  id: string;
  type: string;
  data: {
    type: string;
    title: string;
    message: string;
    url?: string;
    [key: string]: any;
  };
  readAt: string | null;
  createdAt: string;
}

class NotificationsService {
  private resource = "/notifications";

  async getAll(perPage: number = 20): Promise<any> {
    const response = await apiClient.get(`${this.resource}`, {
      params: { per_page: perPage },
    });
    return response.data;
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get(`${this.resource}/unread`);
    return response.data;
  }

  async markAsRead(id: string): Promise<void> {
    await apiClient.post(`${this.resource}/mark-as-read`, { id });
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.post(`${this.resource}/mark-all-as-read`);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.resource}`, { data: { id } });
  }
}

export const notificationsService = new NotificationsService();
