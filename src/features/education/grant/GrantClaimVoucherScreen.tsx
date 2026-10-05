import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { sanitizeErrorMessage } from '@/src/utils/errorUtils';
import {
  CitizenGrantReleaseComponent,
  CitizenGrantReleaseItem,
  fetchCitizenGrantReleases,
} from './api/grantReleaseApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr) return 'Schedule TBA';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatTimeWindow(startTime?: string | null, endTime?: string | null): string {
  if (!startTime && !endTime) return 'Time TBA';
  const formatT = (t?: string | null) => {
    if (!t) return '';
    const parts = t.split(':');
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10);
      const m = parts[1];
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${h12}:${m} ${ampm}`;
    }
    return t;
  };

  const startFormatted = formatT(startTime);
  const endFormatted = formatT(endTime);
  if (startFormatted && endFormatted) return `${startFormatted} – ${endFormatted}`;
  return startFormatted || endFormatted || 'Designated Release Window';
}

export default function GrantClaimVoucherScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ release_code?: string; component_id?: string }>();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [releases, setReleases] = useState<CitizenGrantReleaseItem[]>([]);
  const [selectedReleaseCode, setSelectedReleaseCode] = useState<string | null>(params.release_code || null);
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(
    params.component_id ? parseInt(params.component_id, 10) : null
  );

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/education/grant' as any);
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCitizenGrantReleases();
      setReleases(data);

      // Auto-select release and component if not already chosen
      if (data.length > 0) {
        let targetRel = data[0];
        if (selectedReleaseCode) {
          const found = data.find((r) => r.release_code === selectedReleaseCode);
          if (found) targetRel = found;
        } else {
          // Prefer release with an active F2F claim
          const activeF2F = data.find((r) =>
            r.components.some((c) => c.release_method === 'Face-to-Face' && c.f2f_schedule)
          );
          if (activeF2F) targetRel = activeF2F;
        }
        setSelectedReleaseCode(targetRel.release_code);

        // Find F2F component
        const f2fComponents = targetRel.components.filter(
          (c) => c.release_method === 'Face-to-Face' && c.f2f_schedule
        );

        if (f2fComponents.length > 0) {
          if (selectedComponentId && f2fComponents.some((c) => c.component_id === selectedComponentId)) {
            // keep current selection
          } else {
            setSelectedComponentId(f2fComponents[0].component_id);
          }
        } else if (targetRel.components.length > 0) {
          setSelectedComponentId(targetRel.components[0].component_id);
        }
      }
    } catch (err: any) {
      console.error('[GrantClaimVoucherScreen] Failed to load releases:', err);
      Alert.alert('Notice', sanitizeErrorMessage(err?.message, 'Unable to load grant release voucher.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedReleaseCode, selectedComponentId]);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // Resolve current active release and component
  const currentRelease = releases.find((r) => r.release_code === selectedReleaseCode) || releases[0] || null;
  const currentComponent: CitizenGrantReleaseComponent | null =
    currentRelease?.components.find((c) => c.component_id === selectedComponentId) ||
    currentRelease?.components.find((c) => c.release_method === 'Face-to-Face') ||
    currentRelease?.components[0] ||
    null;

  const f2fSchedule = currentComponent?.f2f_schedule || null;
  const isFaceToFace = currentComponent?.release_method === 'Face-to-Face';
  const claimStatus = f2fSchedule?.claim_status || 'Scheduled';
  const claimReference = f2fSchedule?.claim_reference || null;
  const qrPayload = f2fSchedule?.qr_claim_payload || claimReference;
  const isReleased = claimStatus === 'Released' || currentComponent?.component_status === 'Released';

  const renderBackButton = () => (
    <TouchableOpacity
      style={voucherStyles.backBtn}
      onPress={handleGoBack}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Back to Grant Overview"
    >
      <IconSymbol
        name="chevron.left"
        size={16}
        color={isDarkMode ? '#FB923C' : '#EA580C'}
      />
      <Text style={[voucherStyles.backText, { color: isDarkMode ? '#FB923C' : '#EA580C' }]}>
        Back to Grant Overview
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[voucherStyles.container, isDarkMode && { backgroundColor: '#0B132B' }]}>
        <ScrollView contentContainerStyle={voucherStyles.scrollContent}>
          {renderBackButton()}
          <View style={{ height: 12 }} />
          <Skeleton height={60} borderRadius={12} />
          <View style={{ height: 20 }} />
          <Skeleton height={420} borderRadius={24} />
          <View style={{ height: 20 }} />
          <Skeleton height={180} borderRadius={16} />
        </ScrollView>
      </View>
    );
  }

  // Fallback if no releases exist
  if (!currentRelease || !currentComponent) {
    return (
      <View style={[voucherStyles.container, isDarkMode && { backgroundColor: '#0B132B' }]}>
        <ScrollView
          contentContainerStyle={[voucherStyles.scrollContent, { justifyContent: 'center' }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {renderBackButton()}
          <View style={[voucherStyles.emptyCard, isDarkMode && voucherStyles.emptyCardDark]}>
            <View style={voucherStyles.emptyIconCircle}>
              <Ionicons name="qr-code-outline" size={48} color="#94A3B8" />
            </View>
            <Text style={[voucherStyles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>
              No Active Disbursement Voucher
            </Text>
            <Text style={[voucherStyles.emptySub, isDarkMode && { color: '#94A3B8' }]}>
              There are currently no scheduled in-person grant disbursements assigned to your account.
              Once the Secretariat generates a release schedule, your digital claim voucher and QR code will appear here.
            </Text>
            <TouchableOpacity
              style={voucherStyles.refreshBtn}
              onPress={onRefresh}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={voucherStyles.refreshBtnText}>Check for Updates</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // All F2F components across releases for selector
  const availableVouchers: { release: CitizenGrantReleaseItem; component: CitizenGrantReleaseComponent }[] = [];
  releases.forEach((r) => {
    r.components.forEach((c) => {
      if (c.release_method === 'Face-to-Face') {
        availableVouchers.push({ release: r, component: c });
      }
    });
  });

  return (
    <View style={[voucherStyles.container, isDarkMode && { backgroundColor: '#0B132B' }]}>
      <ScrollView
        contentContainerStyle={voucherStyles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {renderBackButton()}

        {/* TOP HEADER TITLE */}
        <View style={voucherStyles.pageHeader}>
          <View style={voucherStyles.pageHeaderIconWrapper}>
            <Ionicons name="card" size={20} color="#EA580C" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[voucherStyles.pageTitle, isDarkMode && { color: '#F8FAFC' }]}>
              Disbursement Claim Voucher
            </Text>
            <Text style={[voucherStyles.pageSubtitle, isDarkMode && { color: '#94A3B8' }]}>
              Official digital intake pass for in-person grant payouts
            </Text>
          </View>
        </View>

        {/* MULTI-VOUCHER SWITCHER (if scholar has more than 1 F2F voucher) */}
        {availableVouchers.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={voucherStyles.switcherContainer}
          >
            {availableVouchers.map((item, idx) => {
              const isSelected =
                item.release.release_code === selectedReleaseCode &&
                item.component.component_id === selectedComponentId;
              return (
                <TouchableOpacity
                  key={`${item.release.release_code}-${item.component.component_id}`}
                  style={[
                    voucherStyles.switcherPill,
                    isSelected && voucherStyles.switcherPillActive,
                    isDarkMode && voucherStyles.switcherPillDark,
                    isSelected && isDarkMode && voucherStyles.switcherPillActiveDark,
                  ]}
                  onPress={() => {
                    setSelectedReleaseCode(item.release.release_code);
                    setSelectedComponentId(item.component.component_id);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      voucherStyles.switcherPillText,
                      isSelected && voucherStyles.switcherPillTextActive,
                      isDarkMode && { color: isSelected ? '#FFFFFF' : '#CBD5E1' },
                    ]}
                  >
                    Voucher #{idx + 1}: {item.component.component_type} ({item.release.academic_term})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* MAIN VOUCHER CARD (BOARDING PASS / SECURITY VOUCHER FORMAT) */}
        <View
          style={[
            voucherStyles.voucherTicket,
            isDarkMode && voucherStyles.voucherTicketDark,
            isReleased && voucherStyles.voucherTicketReleased,
          ]}
        >
          {/* VOUCHER TOP HEADER */}
          <View style={voucherStyles.ticketHeader}>
            <View style={{ flex: 1 }}>
              <View style={voucherStyles.programBadgeRow}>
                <View style={voucherStyles.programTag}>
                  <Text style={voucherStyles.programTagText}>CITY SCHOLARSHIP FUND</Text>
                </View>
                <Badge
                  label={
                    isReleased
                      ? 'CLAIMED / DISBURSED'
                      : claimStatus === 'Ready for Claim'
                      ? 'READY FOR CLAIM'
                      : 'SCHEDULED'
                  }
                  variant={isReleased ? 'neutral' : claimStatus === 'Ready for Claim' ? 'success' : 'warning'}
                />
              </View>
              <Text style={[voucherStyles.programName, isDarkMode && { color: '#F8FAFC' }]}>
                {currentRelease.program_name}
              </Text>
              <Text style={[voucherStyles.termText, isDarkMode && { color: '#94A3B8' }]}>
                {currentRelease.academic_year} • {currentRelease.academic_term}
              </Text>
            </View>
          </View>

          {/* DYNAMIC QR CODE DISPLAY */}
          <View style={voucherStyles.qrSection}>
            <View
              style={[
                voucherStyles.qrCardWrapper,
                isDarkMode && voucherStyles.qrCardWrapperDark,
                isReleased && { opacity: 0.65 },
              ]}
            >
              {qrPayload ? (
                <View style={voucherStyles.qrInner}>
                  <QRCode
                    value={qrPayload}
                    size={Math.min(SCREEN_WIDTH - 120, 230)}
                    backgroundColor="#FFFFFF"
                    color="#0F172A"
                    quietZone={14}
                  />
                  {/* Subtle CivCentral Center Shield Stamp */}
                  <View style={voucherStyles.qrLogoCenter}>
                    <Ionicons name="shield-checkmark" size={18} color="#EA580C" />
                  </View>
                </View>
              ) : (
                <View style={voucherStyles.qrMissingWrapper}>
                  <Ionicons name="alert-circle-outline" size={40} color="#F59E0B" />
                  <Text style={voucherStyles.qrMissingText}>Claim payload pending schedule initialization</Text>
                </View>
              )}

              {/* OVERLAY STAMP IF ALREADY DISBURSED */}
              {isReleased && (
                <View style={voucherStyles.disbursedStamp}>
                  <Text style={voucherStyles.disbursedStampText}>PAID & DISBURSED</Text>
                  {f2fSchedule?.claimed_at && (
                    <Text style={voucherStyles.disbursedStampSub}>
                      {formatDateDisplay(f2fSchedule.claimed_at)}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* SCREEN BRIGHTNESS HELPER TIP */}
            {!isReleased && (
              <View style={voucherStyles.brightnessHint}>
                <Ionicons name="sunny-outline" size={13} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                <Text style={[voucherStyles.brightnessHintText, isDarkMode && { color: '#94A3B8' }]}>
                  Set screen brightness to high for faster counter scanning
                </Text>
              </View>
            )}

            {/* CLAIM REFERENCE MONOSPACE CHIP */}
            {claimReference && (
              <View
                style={[
                  voucherStyles.claimRefChip,
                  isDarkMode && voucherStyles.claimRefChipDark,
                ]}
              >
                <View style={voucherStyles.claimRefIconBadge}>
                  <Ionicons name="barcode-outline" size={16} color="#EA580C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[voucherStyles.claimRefLabel, isDarkMode && { color: '#94A3B8' }]}>
                    CLAIM REFERENCE CODE
                  </Text>
                  <Text
                    style={[voucherStyles.claimRefCode, isDarkMode && { color: '#F8FAFC' }]}
                    selectable={true}
                  >
                    {claimReference}
                  </Text>
                </View>
                <View style={voucherStyles.copyHintPill}>
                  <Text style={voucherStyles.copyHintText}>PRESENT CODE</Text>
                </View>
              </View>
            )}
          </View>

          {/* PERFORATED / DASHED TICKET DIVIDER */}
          <View style={voucherStyles.perforationRow}>
            <View style={[voucherStyles.notchLeft, isDarkMode && voucherStyles.notchDark]} />
            <View style={[voucherStyles.dashedLine, isDarkMode && voucherStyles.dashedLineDark]} />
            <View style={[voucherStyles.notchRight, isDarkMode && voucherStyles.notchDark]} />
          </View>

          {/* FINANCIAL ENTITLEMENT AMOUNT */}
          <View style={voucherStyles.amountSection}>
            <Text style={[voucherStyles.amountLabel, isDarkMode && { color: '#94A3B8' }]}>
              AUTHORIZED DISBURSEMENT PAYOUT
            </Text>
            <Text style={voucherStyles.amountValue}>
              {formatCurrency(currentComponent.amount)}
            </Text>
            <Text style={[voucherStyles.amountSub, isDarkMode && { color: '#CBD5E1' }]}>
              {currentComponent.component_type} Entitlement • Full Cash Release
            </Text>
          </View>

          {/* SCHEDULE & VENUE DETAILS */}
          <View
            style={[
              voucherStyles.detailsSection,
              isDarkMode && voucherStyles.detailsSectionDark,
            ]}
          >
            <View style={voucherStyles.detailRow}>
              <View style={voucherStyles.detailIconBox}>
                <Ionicons name="calendar-outline" size={18} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[voucherStyles.detailLabel, isDarkMode && { color: '#94A3B8' }]}>
                  RELEASE DATE
                </Text>
                <Text style={[voucherStyles.detailValue, isDarkMode && { color: '#F8FAFC' }]}>
                  {formatDateDisplay(f2fSchedule?.release_date)}
                </Text>
              </View>
            </View>

            <View style={voucherStyles.detailRow}>
              <View style={voucherStyles.detailIconBox}>
                <Ionicons name="time-outline" size={18} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[voucherStyles.detailLabel, isDarkMode && { color: '#94A3B8' }]}>
                  DESIGNATED TIME WINDOW
                </Text>
                <Text style={[voucherStyles.detailValue, isDarkMode && { color: '#F8FAFC' }]}>
                  {formatTimeWindow(f2fSchedule?.start_time, f2fSchedule?.end_time)}
                </Text>
              </View>
            </View>

            <View style={voucherStyles.detailRow}>
              <View style={voucherStyles.detailIconBox}>
                <Ionicons name="location-outline" size={18} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[voucherStyles.detailLabel, isDarkMode && { color: '#94A3B8' }]}>
                  DISBURSEMENT VENUE
                </Text>
                <Text style={[voucherStyles.detailValue, isDarkMode && { color: '#F8FAFC' }]}>
                  {f2fSchedule?.venue_name || 'City Hall Main Auditorium / Secretariat'}
                </Text>
                {f2fSchedule?.complete_address && (
                  <Text style={[voucherStyles.detailSubAddress, isDarkMode && { color: '#94A3B8' }]}>
                    {f2fSchedule.complete_address}
                  </Text>
                )}
              </View>
            </View>

            {f2fSchedule?.schedule_code && (
              <View style={[voucherStyles.detailRow, { borderBottomWidth: 0 }]}>
                <View style={voucherStyles.detailIconBox}>
                  <Ionicons name="layers-outline" size={18} color="#EA580C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[voucherStyles.detailLabel, isDarkMode && { color: '#94A3B8' }]}>
                    DISBURSEMENT BATCH
                  </Text>
                  <Text style={[voucherStyles.detailValue, isDarkMode && { color: '#F8FAFC' }]}>
                    {f2fSchedule.schedule_code}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* INSTRUCTIONS & PHYSICAL ID CHECKLIST */}
        <View
          style={[
            voucherStyles.checklistCard,
            isDarkMode && voucherStyles.checklistCardDark,
          ]}
        >
          <View style={voucherStyles.checklistHeader}>
            <Ionicons name="checkbox-outline" size={18} color="#10B981" />
            <Text style={[voucherStyles.checklistTitle, isDarkMode && { color: '#F8FAFC' }]}>
              Counter Claiming Checklist & Requirements
            </Text>
          </View>

          <View style={voucherStyles.checklistItem}>
            <View style={voucherStyles.checkNumberCircle}>
              <Text style={voucherStyles.checkNumberText}>1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[voucherStyles.checkItemTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Present Official Photo Identification
              </Text>
              <Text style={[voucherStyles.checkItemDesc, isDarkMode && { color: '#94A3B8' }]}>
                Bring your original, validated Student ID or a valid Government-issued ID (e.g. National ID, Passport, Driver&apos;s License) for visual verification.
              </Text>
            </View>
          </View>

          <View style={voucherStyles.checklistItem}>
            <View style={voucherStyles.checkNumberCircle}>
              <Text style={voucherStyles.checkNumberText}>2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[voucherStyles.checkItemTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Counter QR Camera Scan
              </Text>
              <Text style={[voucherStyles.checkItemDesc, isDarkMode && { color: '#94A3B8' }]}>
                Show this QR voucher screen to the teller. The teller camera will verify your digital token and load your scholar dossier.
              </Text>
            </View>
          </View>

          <View style={voucherStyles.checklistItem}>
            <View style={voucherStyles.checkNumberCircle}>
              <Text style={voucherStyles.checkNumberText}>3</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[voucherStyles.checkItemTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Sign Payroll & Verify Cash Payout
              </Text>
              <Text style={[voucherStyles.checkItemDesc, isDarkMode && { color: '#94A3B8' }]}>
                Count your cash assistance immediately at the disbursement window and sign the printed payroll release sheet.
              </Text>
            </View>
          </View>
        </View>

        {/* SECURITY & TOKEN VERIFICATION FOOTER */}
        <View style={voucherStyles.securityFooter}>
          <Ionicons name="lock-closed" size={14} color="#94A3B8" />
          <Text style={voucherStyles.securityFooterText}>
            Secured by CivCentral Cryptographic Engine • HMAC-SHA256 Signed
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const voucherStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  pageHeaderIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  switcherContainer: {
    gap: 8,
    paddingBottom: 14,
  },
  switcherPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 6,
  },
  switcherPillDark: {
    backgroundColor: '#1E293B',
  },
  switcherPillActive: {
    backgroundColor: '#EA580C',
  },
  switcherPillActiveDark: {
    backgroundColor: '#EA580C',
  },
  switcherPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  switcherPillTextActive: {
    color: '#FFFFFF',
  },
  voucherTicket: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  voucherTicketDark: {
    backgroundColor: '#0F1A30',
    borderColor: '#1E2F52',
  },
  voucherTicketReleased: {
    borderColor: '#CBD5E1',
  },
  ticketHeader: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  programBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  programTag: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  programTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  programName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    lineHeight: 22,
  },
  termText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  qrCardWrapper: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  qrCardWrapperDark: {
    backgroundColor: '#FFFFFF', // Keep QR backdrop pure white even in dark mode for scanner contrast
    borderColor: '#38BDF8',
  },
  qrInner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLogoCenter: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  qrMissingWrapper: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  qrMissingText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  disbursedStamp: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#38BDF8',
    alignItems: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  disbursedStampText: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  disbursedStampSub: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  brightnessHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 5,
  },
  brightnessHintText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  claimRefChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 18,
    width: '100%',
    gap: 10,
  },
  claimRefChipDark: {
    backgroundColor: '#132240',
    borderColor: '#1E2F52',
  },
  claimRefIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  claimRefLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  claimRefCode: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Courier',
    color: '#0F172A',
    letterSpacing: 1,
    marginTop: 1,
  },
  copyHintPill: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  copyHintText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    position: 'relative',
    height: 24,
  },
  notchLeft: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    position: 'absolute',
    left: -12,
  },
  notchRight: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    position: 'absolute',
    right: -12,
  },
  notchDark: {
    backgroundColor: '#0B132B',
  },
  dashedLine: {
    flex: 1,
    marginHorizontal: 16,
    height: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  dashedLineDark: {
    borderColor: '#334155',
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(234, 88, 12, 0.03)',
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 34,
    fontWeight: '900',
    color: '#059669', // High contrast bold emerald green
    letterSpacing: -0.5,
  },
  amountSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 4,
  },
  detailsSection: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailsSectionDark: {
    backgroundColor: '#132240',
    borderTopColor: '#1E2F52',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  detailIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  detailSubAddress: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  checklistCardDark: {
    backgroundColor: '#0F1A30',
    borderColor: '#1E2F52',
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  checklistTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  checkNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  checkItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  checkItemDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 17,
  },
  securityFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  securityFooterText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 40,
  },
  emptyCardDark: {
    backgroundColor: '#0F1A30',
    borderColor: '#1E2F52',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export { GrantClaimVoucherScreen };
