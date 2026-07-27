import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Badge } from '@/src/components/ui/Badge';
import { AuthService } from '@/src/services/auth-service';
import { CivicAlert, NotificationService } from '@/src/services/notification-service';

export function NotificationsScreen() {
  const session = AuthService.getCurrentUser();

  const [alerts, setAlerts] = useState<CivicAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAlerts = async () => {
    const data = await NotificationService.getCivicAlerts(session.email || '');
    if (!data || data.length === 0) {
      setAlerts([
        {
          id: 'ALT-101',
          title: 'Typhoon Weather Advisory #2',
          body: 'DRRM Warning: Heavy rainfall expected in Barangay Central. Emergency response teams on standby.',
          category: 'Emergency Alert',
          timestamp: '10 mins ago',
          isRead: false,
        },
        {
          id: 'ALT-102',
          title: 'Business Permit E-Clearance Ready',
          body: 'Your business permit application APP-2026-042 has been approved. Download your digital permit.',
          category: 'Domain Update',
          timestamp: '2 hours ago',
          isRead: false,
        },
        {
          id: 'ALT-103',
          title: 'Mobile Health Clinic Schedule',
          body: 'Free vaccination and health checkup clinic at Barangay Covered Court on July 28.',
          category: 'Broadcast',
          timestamp: '1 day ago',
          isRead: true,
        },
      ]);
    } else {
      setAlerts(data);
    }
  };

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      await fetchAlerts();
      setIsLoading(false);
    }
    load();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAlerts();
    setIsRefreshing(false);
  };

  const getBadgeVariant = (category: string) => {
    switch (category) {
      case 'Emergency Alert':
        return 'danger';
      case 'Domain Update':
        return 'info';
      default:
        return 'success';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#176B87" />
        }>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Notifications & Alerts</Text>
          <Text style={styles.headerSubtitle}>
            Real-time municipal announcements, emergency warnings & status updates.
          </Text>
        </View>

        {isLoading && !isRefreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#176B87" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : (
          <View style={styles.alertsStack}>
            {alerts.map((item) => (
              <View key={item.id} style={[styles.alertCard, !item.isRead && styles.unreadAlertCard]}>
                <View style={styles.alertTopRow}>
                  <Badge label={item.category.toUpperCase()} variant={getBadgeVariant(item.category)} />
                  <Text style={styles.timestampText}>{item.timestamp}</Text>
                </View>

                <Text style={styles.alertTitle}>{item.title}</Text>
                <Text style={styles.alertBody}>{item.body}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  loadingBox: {
    paddingVertical: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#176B87',
    fontWeight: '600',
  },
  alertsStack: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  unreadAlertCard: {
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
  },
  alertTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestampText: {
    fontSize: 11,
    color: '#64748B',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  alertBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
});
