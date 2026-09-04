import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Badge } from '@/src/components/ui/Badge';
import { useTheme } from '@/src/context/ThemeContext';
import { CivicApiService, TrackedItem } from '@/src/services/api';
import { AuthService } from '@/src/services/auth-service';
import { styles } from './styles/TrackerScreen.styles';

export function TrackerScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  // Active Session
  const session = AuthService.getCurrentUser();
  const activeEmail = session.email || '';

  // States
  const [applications, setApplications] = useState<TrackedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Under Review' | 'Approved' | 'Completed'>('All');

  // Modal State for Selected Application Timeline Details
  const [selectedApp, setSelectedApp] = useState<TrackedItem | null>(null);

  // Fetch Applications from Real Education Backend
  const fetchApplications = async () => {
    try {
      const data = await CivicApiService.getTrackedItems();
      if (data !== null) {
        setApplications(data);
        setIsError(false);
      } else {
        setApplications([]);
        setIsError(true);
      }
    } catch {
      setApplications([]);
      setIsError(true);
    }
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      await fetchApplications();
      setIsLoading(false);
    }
    loadData();
  }, [activeEmail]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchApplications();
    setIsRefreshing(false);
  };

  // Filtered Applications List
  const filteredApps = applications.filter((app) => {
    const statusMatch = app.displayStatus || app.status;
    const matchesFilter = selectedFilter === 'All' || statusMatch === selectedFilter;
    const matchesQuery =
      searchQuery.trim() === '' ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Under Review':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B132B' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#176B87" />
        }>

        {/* Header Stack */}
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>Application Tracker</Text>
          <Text style={[styles.headerSubtitle, isDarkMode && { color: '#94A3B8' }]}>
            Monitor live status, review milestones & processing timelines for your civic permits and requests.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBox, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
          <IconSymbol name="magnifyingglass" size={18} color={isDarkMode ? '#94A3B8' : '#64748B'} />
          <TextInput
            style={[styles.searchInput, isDarkMode && { color: '#F8FAFC' }]}
            placeholder="Search by Reference Code or Program..."
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}>
          {(['All', 'Under Review', 'Approved', 'Completed'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
                selectedFilter === filter && (isDarkMode ? { backgroundColor: '#176B87' } : styles.filterPillActive)
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.8}>
              <Text style={[
                styles.filterPillText,
                isDarkMode && { color: '#CBD5E1' },
                selectedFilter === filter && { color: '#FFFFFF' }
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading && !isRefreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={isDarkMode ? '#38BDF8' : '#176B87'} />
            <Text style={[styles.loadingText, isDarkMode && { color: '#38BDF8' }]}>Fetching tracked applications...</Text>
          </View>
        ) : null}

        {/* Applications List */}
        {!isLoading && isError ? (
          <View style={[styles.emptyContainer, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
            <View style={styles.emptyIconBox}>
              <IconSymbol name="exclamationmark.triangle.fill" size={32} color="#EA580C" />
            </View>
            <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>Unable to Load Tracker</Text>
            <Text style={[styles.emptySub, isDarkMode && { color: '#94A3B8' }]}>
              We encountered a problem reaching the server. Please pull down to refresh or try again later.
            </Text>
            <TouchableOpacity
              style={styles.applyCtaBtn}
              onPress={handleRefresh}
              activeOpacity={0.85}>
              <Text style={styles.applyCtaText}>Retry Loading</Text>
            </TouchableOpacity>
          </View>
        ) : !isLoading && filteredApps.length === 0 ? (
          <View style={[styles.emptyContainer, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
            <View style={styles.emptyIconBox}>
              <IconSymbol name="doc.text.fill" size={32} color="#94A3B8" />
            </View>
            <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>No applications to track yet.</Text>
            <Text style={[styles.emptySub, isDarkMode && { color: '#94A3B8' }]}>
              {searchQuery
                ? `No applications matching "${searchQuery}" found.`
                : 'You currently have no active scholarship applications, renewals, or grant releases being tracked.'}
            </Text>
            <TouchableOpacity
              style={styles.applyCtaBtn}
              onPress={() => router.push('/(tabs)/services')}
              activeOpacity={0.85}>
              <Text style={styles.applyCtaText}>Apply for Civic Service</Text>
              <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.appsStack}>
            {filteredApps.map((app) => (
              <TouchableOpacity
                key={app.id}
                style={[styles.appCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
                onPress={() => setSelectedApp(app)}
                activeOpacity={0.88}>
                {/* Card Top Row */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.appIdBadge, isDarkMode && { backgroundColor: '#0F2942' }]}>
                    <IconSymbol name="doc.text.fill" size={14} color={isDarkMode ? '#38BDF8' : '#176B87'} />
                    <Text style={[styles.appIdText, isDarkMode && { color: '#38BDF8' }]}>{app.code || app.id}</Text>
                  </View>
                  <Badge label={(app.displayStatus || app.status).toUpperCase()} variant={getStatusVariant(app.displayStatus || app.status)} />
                </View>

                {/* Service Title & Type Subtitle */}
                <Text style={[styles.appTitleText, isDarkMode && { color: '#F8FAFC' }]}>{app.serviceTitle}</Text>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginBottom: 8, fontWeight: '600' }}>
                  {app.type} {app.details?.academic_period ? `• ${app.details.academic_period}` : ''}
                </Text>

                {/* Timeline Progress Bar Summary */}
                <View style={styles.timelineSummaryBox}>
                  <View style={styles.timelineStepRow}>
                    <View style={[styles.timelineDot, styles.timelineDotDone]} />
                    <View
                      style={[
                        styles.timelineLine,
                        (app.displayStatus || app.status) !== 'Under Review' ? styles.timelineLineDone : null,
                      ]}
                    />
                    <View
                      style={[
                        styles.timelineDot,
                        (app.displayStatus || app.status) !== 'Under Review' ? styles.timelineDotDone : styles.timelineDotActive,
                      ]}
                    />
                    <View
                      style={[
                        styles.timelineLine,
                        (app.displayStatus || app.status) === 'Completed' ? styles.timelineLineDone : null,
                      ]}
                    />
                    <View
                      style={[
                        styles.timelineDot,
                        (app.displayStatus || app.status) === 'Completed' ? styles.timelineDotDone : styles.timelineDotPending,
                      ]}
                    />
                  </View>
                  <View style={styles.timelineLabelsRow}>
                    <Text style={styles.timelineLabelText}>Submitted</Text>
                    <Text
                      style={[
                        styles.timelineLabelText,
                        { textAlign: 'center' },
                        (app.displayStatus || app.status) === 'Under Review' && { color: '#176B87', fontWeight: '800' },
                      ]}>
                      In Review
                    </Text>
                    <Text
                      style={[
                        styles.timelineLabelText,
                        { textAlign: 'right' },
                        (app.displayStatus || app.status) === 'Completed' && { color: '#16A34A', fontWeight: '800' },
                      ]}>
                      {(app.displayStatus || app.status) === 'Completed' ? 'Completed' : 'Release'}
                    </Text>
                  </View>
                </View>

                {/* Card Footer */}
                <View style={styles.cardFooterRow}>
                  <Text style={styles.updatedDateText}>Updated: {app.updatedAt ? app.updatedAt.split(' ')[0] : 'Recently'}</Text>
                  <View style={styles.viewTimelineBtn}>
                    <Text style={styles.viewTimelineText}>View Details</Text>
                    <IconSymbol name="chevron.right" size={14} color="#176B87" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* APPLICATION TIMELINE DETAIL MODAL */}
      <Modal
        visible={selectedApp !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedApp(null)}>
        <View style={styles.modalOverlay}>
          {selectedApp ? (
            <View style={[styles.modalCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B', borderWidth: 1 }]}>
              <View style={styles.modalHeaderRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.modalIdText, isDarkMode && { color: '#38BDF8' }]}>{selectedApp.code || selectedApp.id}</Text>
                  <Text style={[styles.modalTitleText, isDarkMode && { color: '#F8FAFC' }]}>{selectedApp.serviceTitle}</Text>
                  <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 2 }}>{selectedApp.type}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedApp(null)} style={[styles.closeBtn, isDarkMode && { backgroundColor: '#0B132B' }]}>
                  <Text style={[styles.closeBtnText, isDarkMode && { color: '#F8FAFC' }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBadgeRow}>
                <Badge label={(selectedApp.displayStatus || selectedApp.status).toUpperCase()} variant={getStatusVariant(selectedApp.displayStatus || selectedApp.status)} />
                <Text style={[styles.modalSubmittedText, isDarkMode && { color: '#94A3B8' }]}>Updated on {selectedApp.updatedAt ? selectedApp.updatedAt.split(' ')[0] : 'Recently'}</Text>
              </View>

              {selectedApp.details?.total_amount ? (
                <View style={{ marginTop: 8, padding: 10, borderRadius: 8, backgroundColor: isDarkMode ? '#0F2942' : '#F0F9FF' }}>
                  <Text style={{ fontSize: 12, color: isDarkMode ? '#38BDF8' : '#0284C7', fontWeight: '700' }}>
                    Authorized Amount: ₱{Number(selectedApp.details.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ) : null}

              <View style={[styles.modalDivider, isDarkMode && { backgroundColor: '#3A506B' }]} />

              <Text style={[styles.timelineHeaderTitle, isDarkMode && { color: '#F8FAFC' }]}>Processing Milestones</Text>

              {/* Milestone 1 */}
              <View style={styles.milestoneRow}>
                <View style={styles.milestoneIconDone}>
                  <IconSymbol name="checkmark.seal.fill" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={[styles.milestoneTitle, isDarkMode && { color: '#F8FAFC' }]}>1. Request Received & Logged</Text>
                  <Text style={[styles.milestoneSub, isDarkMode && { color: '#94A3B8' }]}>Record created on {selectedApp.createdAt ? selectedApp.createdAt.split(' ')[0] : 'Recorded'}</Text>
                </View>
              </View>

              {/* Milestone 2 */}
              <View style={styles.milestoneRow}>
                <View
                  style={
                    (selectedApp.displayStatus || selectedApp.status) === 'Under Review'
                      ? styles.milestoneIconActive
                      : styles.milestoneIconDone
                  }>
                  <IconSymbol
                    name={(selectedApp.displayStatus || selectedApp.status) === 'Under Review' ? 'pencil' : 'checkmark.seal.fill'}
                    size={16}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={[styles.milestoneTitle, isDarkMode && { color: '#F8FAFC' }]}>2. Review & Document Verification</Text>
                  <Text style={[styles.milestoneSub, isDarkMode && { color: '#94A3B8' }]}>
                    {(selectedApp.displayStatus || selectedApp.status) === 'Under Review'
                      ? 'Under active evaluation by Education Department Officers'
                      : `Verified & Approved`}
                  </Text>
                </View>
              </View>

              {/* Milestone 3 */}
              <View style={styles.milestoneRow}>
                <View
                  style={
                    (selectedApp.displayStatus || selectedApp.status) === 'Completed'
                      ? styles.milestoneIconDone
                      : (selectedApp.displayStatus || selectedApp.status) === 'Approved'
                      ? styles.milestoneIconActive
                      : [styles.milestoneIconPending, isDarkMode && { backgroundColor: '#334155' }]
                  }>
                  <IconSymbol
                    name={(selectedApp.displayStatus || selectedApp.status) === 'Completed' ? 'checkmark.seal.fill' : 'doc.text.fill'}
                    size={16}
                    color={(selectedApp.displayStatus || selectedApp.status) === 'Under Review' ? (isDarkMode ? '#64748B' : '#94A3B8') : '#FFFFFF'}
                  />
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={[styles.milestoneTitle, isDarkMode && { color: '#F8FAFC' }]}>3. Grant Disbursal / Release</Text>
                  <Text style={[styles.milestoneSub, isDarkMode && { color: '#94A3B8' }]}>
                    {(selectedApp.displayStatus || selectedApp.status) === 'Completed'
                      ? 'Disbursed & Processed Successfully'
                      : (selectedApp.displayStatus || selectedApp.status) === 'Approved'
                      ? 'Approved for Release / Grant Disbursal'
                      : 'Pending completion of evaluation'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.doneModalBtn}
                onPress={() => setSelectedApp(null)}
                activeOpacity={0.85}>
                <Text style={styles.doneModalBtnText}>Close Tracker Details</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

