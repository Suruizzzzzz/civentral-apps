import { API_BASE_URL } from './auth-service';

export interface CivicAlert {
  id: string;
  title: string;
  body: string;
  category: 'Broadcast' | 'Domain Update' | 'Emergency Alert';
  timestamp: string;
  isRead: boolean;
}

export class NotificationService {
  /**
   * Fetch Real Citizen Notifications from PHP Backend API
   * Endpoint: https://civentral.tech/api/citizen/get-notifications.php
   */
  static async getCivicAlerts(identifier?: string): Promise<CivicAlert[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/get-notifications.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: identifier || '' }),
      });

      const text = await response.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        return [];
      }

      if (json.status === 'success' && Array.isArray(json.data)) {
        return json.data.map((item: any) => ({
          id: item.notification_id || item.id || `ALT-${item.id}`,
          title: item.title || 'City Announcement',
          body: item.body || item.message || '',
          category: item.category || 'Broadcast',
          timestamp: item.timestamp || item.created_at || 'Just now',
          isRead: Boolean(item.is_read || item.isRead),
        }));
      }

      return [];
    } catch {
      return [];
    }
  }
}
