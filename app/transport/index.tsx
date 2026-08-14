import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';

const TRANSPORT_SERVICES = [
  {
    id: 'PUV',
    title: 'PUV Services & Route Management',
    desc: 'Tricycle, jeepney, and shuttle route permits, terminal slots & official fare matrix schedules.',
    icon: 'car.fill',
    badge: 'ACTIVE ROUTES',
  },
  {
    id: 'FRAN',
    title: 'Tricycle Franchise Application / Renewal',
    desc: 'Apply for new TODA franchise, annual renewal, body number assignment & operator ID card.',
    icon: 'creditcard.fill',
    badge: 'ONLINE RENEWAL',
  },
  {
    id: 'TRAF',
    title: 'Traffic Violations & Ordinance Tickets',
    desc: 'Check CPTMD traffic violation tickets, contest citations, and settle fines online.',
    icon: 'exclamationmark.triangle.fill',
    badge: 'PAY FINES',
  },
  {
    id: 'INSP',
    title: 'Vehicle & Emission Inspection',
    desc: 'Schedule public transport emission testing, roadworthiness inspection & safety checks.',
    icon: 'wrench.and.screwdriver.fill',
    badge: 'INSPECTION',
  },
];

export default function TransportIndexRoute() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const dm = isDarkMode;

  return (
    <View style={[styles.safeArea, { backgroundColor: dm ? '#0B132B' : '#F8FAFC' }]}>
      {/* Top Nav Bar */}
      <View style={[styles.topNav, { backgroundColor: dm ? '#1C2541' : '#FFFFFF', borderColor: dm ? '#3A506B' : '#E2E8F0' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <IconSymbol name="chevron.left" size={20} color={dm ? '#F8FAFC' : '#0F172A'} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: dm ? '#F8FAFC' : '#0F172A' }]}>Transport & Mobility Services</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Card */}
        <View style={[styles.bannerCard, { backgroundColor: dm ? '#1C2541' : '#0284C7', borderColor: dm ? '#3A506B' : '#0284C7' }]}>
          <View style={styles.bannerIconBadge}>
            <IconSymbol name="car.fill" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.bannerTitle}>Caloocan Transport & Mobility Office</Text>
          <Text style={styles.bannerSub}>
            CPTMD e-Services for PUV franchises, route management, traffic violation settlements & vehicle inspections.
          </Text>
        </View>

        {/* Services List */}
        <View style={styles.servicesGrid}>
          {TRANSPORT_SERVICES.map((item) => (
            <View
              key={item.id}
              style={[styles.serviceCard, { backgroundColor: dm ? '#1C2541' : '#FFFFFF', borderColor: dm ? '#3A506B' : '#E2E8F0' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: dm ? '#0F2942' : '#E0F2FE' }]}>
                  <IconSymbol name={item.icon as any} size={22} color={dm ? '#38BDF8' : '#0284C7'} />
                </View>
                <View style={[styles.badge, { backgroundColor: dm ? '#0369A1' : '#E0F2FE' }]}>
                  <Text style={[styles.badgeText, { color: dm ? '#E0F2FE' : '#0369A1' }]}>{item.badge}</Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: dm ? '#F8FAFC' : '#0F172A' }]}>{item.title}</Text>
              <Text style={[styles.cardDesc, { color: dm ? '#CBD5E1' : '#64748B' }]}>{item.desc}</Text>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: dm ? '#0284C7' : '#176B87' }]}
                onPress={() => router.push('/(tabs)/tracker')}
                activeOpacity={0.85}>
                <Text style={styles.actionBtnText}>Open E-Service</Text>
                <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  bannerCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  bannerIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerSub: {
    fontSize: 13,
    color: '#E0F2FE',
    lineHeight: 19,
  },
  servicesGrid: {
    gap: 14,
  },
  serviceCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
