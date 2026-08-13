import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';

const FACILITIES_SERVICES = [
  {
    id: 'CEM',
    title: 'Cemetery & Burial Services',
    desc: 'Public cemetery plot assignment, burial permits, cremation requests & indigent burial assistance.',
    icon: 'house.fill',
    badge: 'BURIAL AID',
  },
  {
    id: 'PARK',
    title: 'Parks & Recreation Scheduling',
    desc: 'Book public parks, Caloocan Sports Complex courts, amphitheaters & municipal recreation grounds.',
    icon: 'heart.text.square.fill',
    badge: 'PARK RESERVATION',
  },
  {
    id: 'HALL',
    title: 'Facility & Hall Reservations',
    desc: 'Reserve City Hall convention centers, barangay multi-purpose halls & community gymnasiums.',
    icon: 'building.2.fill',
    badge: 'HALL BOOKING',
  },
  {
    id: 'WATER',
    title: 'Water Supply & Drainage Requests',
    desc: 'Request drainage declogging, flood control maintenance, water tank dispatch & utility repairs.',
    icon: 'wrench.and.screwdriver.fill',
    badge: 'UTILITIES & FLOOD',
  },
];

export default function FacilitiesIndexRoute() {
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
        <Text style={[styles.navTitle, { color: dm ? '#F8FAFC' : '#0F172A' }]}>Public Facilities & Utilities</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Card */}
        <View style={[styles.bannerCard, { backgroundColor: dm ? '#1C2541' : '#6D28D9', borderColor: dm ? '#3A506B' : '#6D28D9' }]}>
          <View style={styles.bannerIconBadge}>
            <IconSymbol name="wrench.and.screwdriver.fill" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.bannerTitle}>Public Facilities & Utilities Office</Text>
          <Text style={styles.bannerSub}>
            Municipal reservations, cemetery & burial assistance, sports complex scheduling, and city drainage maintenance.
          </Text>
        </View>

        {/* Services List */}
        <View style={styles.servicesGrid}>
          {FACILITIES_SERVICES.map((item) => (
            <View
              key={item.id}
              style={[styles.serviceCard, { backgroundColor: dm ? '#1C2541' : '#FFFFFF', borderColor: dm ? '#3A506B' : '#E2E8F0' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: dm ? '#2E1065' : '#F5F3FF' }]}>
                  <IconSymbol name={item.icon as any} size={22} color={dm ? '#A78BFA' : '#6D28D9'} />
                </View>
                <View style={[styles.badge, { backgroundColor: dm ? '#4C1D95' : '#F5F3FF' }]}>
                  <Text style={[styles.badgeText, { color: dm ? '#DDD6FE' : '#6D28D9' }]}>{item.badge}</Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: dm ? '#F8FAFC' : '#0F172A' }]}>{item.title}</Text>
              <Text style={[styles.cardDesc, { color: dm ? '#CBD5E1' : '#64748B' }]}>{item.desc}</Text>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: dm ? '#7C3AED' : '#6D28D9' }]}
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
    color: '#DDD6FE',
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
