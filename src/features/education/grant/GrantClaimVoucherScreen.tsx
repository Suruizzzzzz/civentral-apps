import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
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
import { formatCurrency, formatDateDisplay } from '@/src/utils';
import { elevatedCard, statusBadgePill } from '@/src/styles';
import { voucherStyles } from './styles/GrantClaimVoucher.styles';
import {
  CitizenGrantReleaseComponent,
  CitizenGrantReleaseItem,
  fetchCitizenGrantReleases,
} from './api/grantReleaseApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const params = useLocalSearchParams<{
    release_code?: string;
    grant_release_id?: string;
    release_id?: string;
    recordId?: string;
    code?: string;
    id?: string;
    component_id?: string;
  }>();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [releases, setReleases] = useState<CitizenGrantReleaseItem[]>([]);
  const [selectedReleaseCode, setSelectedReleaseCode] = useState<string | null>(
    params.release_code ||
      params.code ||
      (!params.grant_release_id && params.recordId ? params.recordId.replace(/^release-/, "") : null) ||
      null
  );
  const [selectedGrantReleaseId, setSelectedGrantReleaseId] = useState<number | null>(
    params.grant_release_id
      ? parseInt(params.grant_release_id, 10)
      : params.release_id
      ? parseInt(params.release_id, 10)
      : params.id && !isNaN(Number(params.id))
      ? parseInt(params.id, 10)
      : null
  );
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
        const searchCode =
          selectedReleaseCode ||
          params.release_code ||
          params.code ||
          (!params.grant_release_id && params.recordId ? params.recordId.replace(/^release-/, "") : null);
        const searchId =
          selectedGrantReleaseId ??
          (params.grant_release_id
            ? parseInt(params.grant_release_id, 10)
            : params.release_id
            ? parseInt(params.release_id, 10)
            : params.id && !isNaN(Number(params.id))
            ? parseInt(params.id, 10)
            : null);

        if (searchCode || searchId !== null) {
          const found = data.find((r) => {
            if (
              searchCode &&
              (r.release_code === searchCode || r.release_code.toLowerCase() === searchCode.toLowerCase())
            ) {
              return true;
            }
            if (searchId !== null && r.grant_release_id === searchId) {
              return true;
            }
            if (searchCode && r.grant_release_id && String(r.grant_release_id) === searchCode) {
              return true;
            }
            return false;
          });
          if (found) targetRel = found;
        } else {
          // Prefer release with an active F2F claim
          const activeF2F = data.find((r) =>
            r.components.some((c) => c.release_method === 'Face-to-Face' && c.f2f_schedule)
          );
          if (activeF2F) targetRel = activeF2F;
        }
        setSelectedReleaseCode(targetRel.release_code);
        if (targetRel.grant_release_id !== undefined) {
          setSelectedGrantReleaseId(targetRel.grant_release_id);
        }

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
  }, [
    selectedReleaseCode,
    selectedGrantReleaseId,
    selectedComponentId,
    params.release_code,
    params.grant_release_id,
    params.release_id,
    params.recordId,
    params.code,
    params.id,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // Resolve current active release and component
  const currentRelease =
    releases.find(
      (r) =>
        (selectedReleaseCode && r.release_code === selectedReleaseCode) ||
        (selectedGrantReleaseId !== null && r.grant_release_id === selectedGrantReleaseId)
    ) ||
    releases[0] ||
    null;
  const currentComponent: CitizenGrantReleaseComponent | null =
    currentRelease?.components.find((c) => c.component_id === selectedComponentId) ||
    currentRelease?.components.find((c) => c.release_method === 'Face-to-Face') ||
    currentRelease?.components[0] ||
    null;

  const f2fSchedule = currentComponent?.f2f_schedule || null;
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
                ((item.release.release_code && item.release.release_code === selectedReleaseCode) ||
                  (item.release.grant_release_id !== undefined && item.release.grant_release_id === selectedGrantReleaseId)) &&
                item.component.component_id === selectedComponentId;
              const pillKey = `${item.release.release_code || item.release.grant_release_id || idx}-${item.component.component_id}`;
              return (
                <TouchableOpacity
                  key={pillKey}
                  style={[
                    voucherStyles.switcherPill,
                    isSelected && voucherStyles.switcherPillActive,
                    isDarkMode && voucherStyles.switcherPillDark,
                    isSelected && isDarkMode && voucherStyles.switcherPillActiveDark,
                  ]}
                  onPress={() => {
                    setSelectedReleaseCode(item.release.release_code);
                    setSelectedGrantReleaseId(item.release.grant_release_id ?? null);
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
              <View style={voucherStyles.termRow}>
                <Text style={[voucherStyles.termText, isDarkMode && { color: '#94A3B8' }]}>
                  {currentRelease.academic_year} • {currentRelease.academic_term}
                </Text>
                {currentRelease.release_code ? (
                  <View style={[statusBadgePill, voucherStyles.relCodeBadge, isDarkMode && voucherStyles.relCodeBadgeDark]}>
                    <Text style={[voucherStyles.relCodeBadgeText, isDarkMode && voucherStyles.relCodeBadgeTextDark]}>
                      {currentRelease.release_code}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* DYNAMIC QR CODE DISPLAY */}
          <View style={voucherStyles.qrSection}>
            <View
              style={[
                elevatedCard,
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
                  {/* Subtle Civentral Center Shield Stamp */}
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
              <View style={[voucherStyles.detailRow, !currentRelease?.release_code && { borderBottomWidth: 0 }]}>
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

            {currentRelease?.release_code ? (
              <View style={[voucherStyles.detailRow, { borderBottomWidth: 0 }]}>
                <View style={voucherStyles.detailIconBox}>
                  <Ionicons name="pricetag-outline" size={18} color="#EA580C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[voucherStyles.detailLabel, isDarkMode && { color: '#94A3B8' }]}>
                    RELEASE IDENTIFIER
                  </Text>
                  <Text style={[voucherStyles.detailValue, isDarkMode && { color: '#F8FAFC' }]}>
                    {currentRelease.release_code}
                    {currentRelease.grant_release_id ? ` (ID: #${currentRelease.grant_release_id})` : ''}
                  </Text>
                </View>
              </View>
            ) : null}
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
            Secured by Civentral Cryptographic Engine • HMAC-SHA256 Signed
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}


export { GrantClaimVoucherScreen };
