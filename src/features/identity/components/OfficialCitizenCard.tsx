import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Defs, LinearGradient as SvgGradient, Stop as SvgStop, Path as SvgPath } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import {
  generateCitizenCardHtml,
  resolveCardAssetUrl,
} from '@/src/utils/citizenCardHtmlTemplate';

export { resolveCardAssetUrl };

export interface CitizenCategory {
  title: string;
  type: string;
  stops: [string, string, string, string];
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  color: string;
  gradient: string;
  hex: string;
  lightHex: string;
  darkHex: string;
}

export function resolveCitizenCategory(
  birthDateStr?: string | null,
  isPwd = false,
  isNonResident = false
): CitizenCategory {
  if (isNonResident) {
    return {
      title: 'NON-RESIDENT',
      type: 'NON-RESIDENT',
      stops: ['#0F172A', '#334155', '#475569', '#64748B'],
      accentColor: '#475569',
      badgeBg: '#F1F5F9',
      badgeText: '#334155',
      color: '#475569',
      gradient: 'from-slate-700 to-slate-500',
      hex: '#475569',
      lightHex: '#64748B',
      darkHex: '#0F172A',
    };
  }
  if (isPwd) {
    return {
      title: 'PWD',
      type: 'PWD',
      stops: ['#7C2D12', '#C2410C', '#EA580C', '#F97316'],
      accentColor: '#EA580C',
      badgeBg: '#FFF7ED',
      badgeText: '#C2410C',
      color: '#EA580C',
      gradient: 'from-orange-700 to-orange-500',
      hex: '#EA580C',
      lightHex: '#F97316',
      darkHex: '#7C2D12',
    };
  }

  let age = 30; // fallback adult
  if (birthDateStr) {
    const bDate = new Date(birthDateStr);
    if (!isNaN(bDate.getTime())) {
      const diff = Date.now() - bDate.getTime();
      age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }
  }

  if (age >= 60) {
    return {
      title: 'SENIOR CITIZEN',
      type: 'SENIOR CITIZEN',
      stops: ['#172554', '#1E3A8A', '#2563EB', '#1D4ED8'],
      accentColor: '#2563EB',
      badgeBg: '#EFF6FF',
      badgeText: '#1D4ED8',
      color: '#2563EB',
      gradient: 'from-blue-900 to-blue-600',
      hex: '#2563EB',
      lightHex: '#3B82F6',
      darkHex: '#1E3A8A',
    };
  }

  if (age <= 17) {
    return {
      title: 'YOUTH / MINOR',
      type: 'YOUTH / MINOR',
      stops: ['#064E3B', '#047857', '#059669', '#10B981'],
      accentColor: '#059669',
      badgeBg: '#ECFDF5',
      badgeText: '#047857',
      color: '#059669',
      gradient: 'from-emerald-900 to-emerald-600',
      hex: '#059669',
      lightHex: '#10B981',
      darkHex: '#064E3B',
    };
  }

  // Default: Regular Adult Resident (Ruby Red official design)
  return {
    title: 'RESIDENT',
    type: 'RESIDENT',
    stops: ['#7F1D1D', '#991B1B', '#B91C1C', '#DC2626'],
    accentColor: '#B91C1C',
    badgeBg: '#FEF2F2',
    badgeText: '#991B1B',
    color: '#B91C1C',
    gradient: 'from-red-900 to-red-600',
    hex: '#B91C1C',
    lightHex: '#EF4444',
    darkHex: '#7F1D1D',
  };
}

export interface OfficialCitizenCardProps {
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  suffix?: string | null;
  birth_date?: string | null;
  civil_status?: string | null;
  sex?: string | null;
  address?: string | null;
  street_address?: string | null;
  barangay?: string | null;
  district?: string | null;
  citizen_id_number?: string | null;
  photo_1x1_url?: string | null;
  signature_photo_url?: string | null;
  qr_token?: string | null;
  qr_code_token?: string | null;
  reviewed_at?: string | null;
  submitted_at?: string | null;
  valid_until?: string | null;
  is_pwd?: boolean;
  is_non_resident?: boolean;
  blood_type?: string | null;
  emergency_contact?: string | null;
  showPrintActions?: boolean;
  onPrint?: () => void;
  onShare?: () => void;
}

export function OfficialCitizenCard({
  first_name = '',
  middle_name = null,
  last_name = '',
  suffix = null,
  birth_date = null,
  civil_status = 'SINGLE',
  sex = 'M',
  street_address = '',
  barangay = 'Barangay 1',
  district = 'District 1',
  citizen_id_number = 'CAL-2026-000004',
  photo_1x1_url = null,
  signature_photo_url = null,
  qr_token = null,
  qr_code_token = null,
  reviewed_at = null,
  submitted_at = null,
  valid_until = null,
  is_pwd = false,
  is_non_resident = false,
  blood_type = 'N/A',
  emergency_contact = '(02) 8366-3101',
  showPrintActions = true,
  onPrint,
  onShare,
}: OfficialCitizenCardProps) {
  const { isDarkMode } = useTheme();
  const [photoError, setPhotoError] = useState(false);
  const [signatureError, setSignatureError] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const effectiveQrToken = qr_token || qr_code_token || '';
  const effectiveCitizenId = citizen_id_number || 'CAL-2026-000004';

  const classification = useMemo(() => {
    return resolveCitizenCategory(birth_date, is_pwd, is_non_resident);
  }, [birth_date, is_pwd, is_non_resident]);

  const formatCardDate = (dateStr?: string | null, addYears = 0): string => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      if (addYears > 0) d.setFullYear(d.getFullYear() + addYears);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${yyyy}/${mm}/${dd}`;
    } catch {
      return dateStr || 'N/A';
    }
  };

  const formatTimestamp = (dateStr?: string | null): string => {
    if (!dateStr) return '2026-10-04 14:32:00';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    } catch {
      return dateStr || '2026-10-04 14:32:00';
    }
  };

  const formatFullName = (): string => {
    const lName = (last_name || '').toUpperCase();
    const fName = (first_name || '').toUpperCase();
    const mName = middle_name ? `${middle_name.charAt(0).toUpperCase()}.` : '';
    const sfx = suffix ? suffix.toUpperCase() : '';
    const formatted = `${lName}, ${fName} ${mName} ${sfx}`.trim().replace(/\s+/g, ' ');
    return formatted || 'CITIZEN CARDHOLDER';
  };

  const getBase64Logo = async (): Promise<string> => {
    try {
      const asset = Asset.fromModule(require('@/assets/images/logo.png'));
      if (!asset.localUri) {
        await asset.downloadAsync();
      }
      const uri = asset.localUri || asset.uri;
      if (uri) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (base64) {
          return `data:image/png;base64,${base64}`;
        }
      }
    } catch (err) {
      console.warn('Failed to load local logo as base64 for print:', err);
    }
    return 'https://ui-avatars.com/api/?name=CV&background=0F4C81&color=fff&size=64';
  };

  const generateCardHtml = (logoDataUri?: string): string => {
    return generateCitizenCardHtml({
      logoDataUri,
      effectiveCitizenId,
      fullName: formatFullName(),
      birth_date,
      sex,
      civil_status,
      blood_type,
      reviewed_at,
      submitted_at,
      valid_until,
      street_address,
      barangay,
      district,
      emergency_contact,
      photo_1x1_url,
      signature_photo_url,
      effectiveQrToken,
      classification,
    });
  };

  const handlePrintCard = async () => {
    if (onPrint) {
      onPrint();
      return;
    }
    try {
      setIsPrinting(true);
      const logoUri = await getBase64Logo();
      const html = generateCardHtml(logoUri);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.print) {
        window.print();
        return;
      }
      await Print.printAsync({ html });
    } catch (err: any) {
      console.warn('Print error:', err);
      Alert.alert('Print Error', 'Could not open native print dialog. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleSharePdf = async () => {
    if (onShare) {
      onShare();
      return;
    }
    try {
      setIsPrinting(true);
      const logoUri = await getBase64Logo();
      const html = generateCardHtml(logoUri);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Civentral_Citizen_Card_${effectiveCitizenId}.pdf`,
        });
      } else {
        Alert.alert('PDF Created', `Saved to temporary storage:\n${uri}`);
      }
    } catch (err: any) {
      console.warn('Share PDF error:', err);
      Alert.alert('PDF Export Error', 'Could not generate or share PDF document.');
    } finally {
      setIsPrinting(false);
    }
  };

  const fullName = formatFullName();
  const numericSeed = effectiveCitizenId.replace(/\D/g, '') || '000004';
  const barcodeNum = '0100' + numericSeed.padStart(10, '0');
  const fullAddress = `${street_address ? `${street_address}, ` : ''}${barangay || 'Barangay 1'}, ${district || 'District 1'}`.toUpperCase();

  return (
    <View style={{ width: '100%', gap: 14 }}>
      {/* Header Status Bar */}
      <View
        style={{
          backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5',
          borderColor: '#10B981',
          borderWidth: 1,
          borderRadius: 14,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#10B981',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconSymbol name="checkmark.seal.fill" size={22} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: isDarkMode ? '#A7F3D0' : '#065F46' }}>
            Official Resident ID Issued
          </Text>
          <Text style={{ fontSize: 11, color: isDarkMode ? '#D1FAE5' : '#047857', marginTop: 1 }}>
            Certified by City Government of Civentral
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: classification.badgeBg,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: classification.accentColor + '35',
            }}
          >
            <Text style={{ color: classification.badgeText, fontSize: 9.5, fontWeight: '800' }}>
              {classification.title}
            </Text>
          </View>
        </View>
      </View>

      {/* THE OFFICIAL WHITE PVC CITIZEN SMART CARD */}
      <View
        style={{
          position: 'relative',
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#CBD5E1',
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 4,
          overflow: 'hidden',
        }}
      >
        {/* Municipal Building Watermark Background */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '68%',
            height: '85%',
            zIndex: 0,
          }}
        >
          <Image
            source={require('@/assets/images/building-bg.png')}
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.38,
            }}
            resizeMode="contain"
          />
        </View>

        {/* Wavy Header Ribbon (100% Full Width Container) */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 80,
            zIndex: 1,
          }}
          pointerEvents="none"
        >
          <Svg
            width="100%"
            height={80}
            viewBox="0 0 360 80"
            preserveAspectRatio="none"
            style={{ width: '100%', height: 80 }}
          >
            <Defs>
              <SvgGradient id="headerWaveGradCard" x1="0" x2="1" y1="0" y2="0">
                <SvgStop offset="0%" stopColor={classification.stops[0]} />
                <SvgStop offset="30%" stopColor={classification.stops[1]} />
                <SvgStop offset="75%" stopColor={classification.stops[2]} />
                <SvgStop offset="100%" stopColor={classification.stops[3]} />
              </SvgGradient>
              <SvgGradient id="goldWaveStripeCard" x1="0" x2="1" y1="0" y2="0">
                <SvgStop offset="0%" stopColor="#D97706" />
                <SvgStop offset="50%" stopColor="#FDE047" />
                <SvgStop offset="100%" stopColor="#D97706" />
              </SvgGradient>
            </Defs>
            <SvgPath d="M 0,0 L 360,0 L 360,59 Q 266,69 180,63 T 0,76 Z" fill="url(#headerWaveGradCard)" />
            <SvgPath d="M 0,76 Q 94,63 180,63 T 360,59 L 360,63 Q 266,73 180,67 T 0,80 Z" fill="url(#goldWaveStripeCard)" />
          </Svg>
        </View>

        {/* CARD FOREGROUND CONTENT LAYER */}
        <View style={{ padding: 12, position: 'relative', zIndex: 10 }}>
          {/* TOP HEADER BLOCK */}
          <View style={{ marginBottom: 6, zIndex: 10, elevation: 5 }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 7.5,
                fontWeight: '700',
                color: '#FEE2E2',
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 2,
              }}
            >
              REPUBLIC OF THE PHILIPPINES
            </Text>

            {/* Brand Row with Logo & Centered Brand Title */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, paddingRight: 36 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#FFFFFF',
                  padding: 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 2,
                  elevation: 2,
                  borderWidth: 1.5,
                  borderColor: '#F59E0B',
                }}
              >
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </View>

              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '900',
                    color: '#FFFFFF',
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    textShadowColor: 'rgba(0,0,0,0.25)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  CIVENTRAL CITIZEN CARD
                </Text>
                <Text
                  style={{
                    fontSize: 7.5,
                    fontWeight: '700',
                    color: '#FDE047',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    marginTop: 1,
                    textAlign: 'center',
                  }}
                >
                  KASAMA KA SA PAG-UNLAD • CITY OF CIVENTRAL
                </Text>
              </View>
            </View>
          </View>

          {/* THREE-COLUMN CARD BODY */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {/* COLUMN 1: Left - Photo, Signature, Resident Type */}
            <View style={{ width: 78, alignItems: 'center', justifyContent: 'space-between', zIndex: 20, elevation: 10 }}>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#CBD5E1',
                    backgroundColor: '#F8FAFC',
                    overflow: 'hidden',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {photo_1x1_url && !photoError ? (
                    <Image
                      source={{ uri: resolveCardAssetUrl(photo_1x1_url) || '' }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                      onError={() => setPhotoError(true)}
                    />
                  ) : (
                    <IconSymbol name="person.crop.circle.fill" size={44} color="#94A3B8" />
                  )}
                </View>

                {/* Signature Box */}
                <View
                  style={{
                    width: 76,
                    height: 24,
                    borderBottomWidth: 1,
                    borderBottomColor: '#94A3B8',
                    borderStyle: 'dashed',
                    backgroundColor: '#FFFFFF',
                    marginTop: 3,
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {signature_photo_url && !signatureError ? (
                    <Image
                      source={{ uri: resolveCardAssetUrl(signature_photo_url) || '' }}
                      style={{ width: '92%', height: '88%' }}
                      resizeMode="contain"
                      onError={() => setSignatureError(true)}
                    />
                  ) : (
                    <Text style={{ fontSize: 7.5, color: '#94A3B8', fontStyle: 'italic' }}>Signature</Text>
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 6.5,
                    fontWeight: '600',
                    color: '#64748B',
                    marginTop: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  Cardholder Signature
                </Text>

                <Text
                  style={{
                    fontSize: 9.5,
                    fontWeight: '900',
                    color: '#0F172A',
                    marginTop: 2,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                  }}
                >
                  {classification.title}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 5.8,
                  color: '#64748B',
                  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                  alignSelf: 'flex-start',
                  marginTop: 4,
                }}
              >
                {formatTimestamp(reviewed_at || submitted_at)}
              </Text>
            </View>

            {/* COLUMN 2: Center - Demographics */}
            <View style={{ flex: 1, justifyContent: 'space-between', zIndex: 1 }}>
              <View>
                <Text style={{ fontSize: 6.5, fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>
                  Last Name, First Name, M.I.
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '900',
                    color: '#0F172A',
                    letterSpacing: 0.2,
                  }}
                  numberOfLines={1}
                >
                  {fullName}
                </Text>

                {/* Demographics Grid (3 Columns x 2 Rows) */}
                <View style={{ borderTopWidth: 1, borderTopColor: '#CBD5E1', paddingTop: 3, marginTop: 3, gap: 2 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 0.8 }}>
                      <Text style={{ fontSize: 6, fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Sex</Text>
                      <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#0F172A' }}>
                        {(sex || 'M').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1.3 }}>
                      <Text style={{ fontSize: 6, fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Date of Birth</Text>
                      <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#0F172A' }}>
                        {formatCardDate(birth_date)}
                      </Text>
                    </View>
                    <View style={{ flex: 1.1 }}>
                      <Text style={{ fontSize: 6, fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Civil Status</Text>
                      <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#0F172A' }}>
                        {(civil_status || 'SINGLE').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 0.8 }}>
                      <Text style={{ fontSize: 6, fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Blood</Text>
                      <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#0F172A' }}>{blood_type || 'N/A'}</Text>
                    </View>
                    <View style={{ flex: 1.3 }}>
                      <Text style={{ fontSize: 6, fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Date Issued</Text>
                      <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#0F172A' }}>
                        {formatCardDate(reviewed_at || submitted_at)}
                      </Text>
                    </View>
                    <View style={{ flex: 1.1 }}>
                      <Text style={{ fontSize: 6, fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Valid Until</Text>
                      <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#0F172A' }}>
                        {formatCardDate(reviewed_at || submitted_at, 5)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Address Block */}
                <View style={{ borderTopWidth: 1, borderTopColor: '#CBD5E1', paddingTop: 3, marginTop: 3 }}>
                  <Text
                    style={{
                      fontSize: 8,
                      fontWeight: '800',
                      color: '#0F172A',
                      textTransform: 'uppercase',
                      lineHeight: 10,
                    }}
                    numberOfLines={1}
                  >
                    {fullAddress}
                  </Text>
                  <Text
                    style={{
                      fontSize: 8,
                      fontWeight: '800',
                      color: '#0F172A',
                      textTransform: 'uppercase',
                      lineHeight: 10,
                    }}
                  >
                    CIVENTRAL CITY
                  </Text>
                </View>
              </View>

              <Text style={{ fontSize: 6.5, color: '#334155', marginTop: 3 }}>
                In case of Emergency, contact: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{emergency_contact || '(02) 8366-3101'}</Text>
              </Text>
            </View>

            {/* COLUMN 3: Right - QR & Control String */}
            <View style={{ width: 74, alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 20, elevation: 10 }}>
              <View style={{ alignItems: 'center', width: '100%' }}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <QRCode
                    value={`CIVENTRAL:ID:${effectiveCitizenId}|TOKEN:${effectiveQrToken}`}
                    size={66}
                    color="#0F172A"
                    backgroundColor="#FFFFFF"
                  />
                </View>

                <Text
                  style={{
                    fontSize: 7,
                    fontWeight: '700',
                    color: '#334155',
                    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                    marginTop: 2,
                    textAlign: 'center',
                  }}
                >
                  {barcodeNum}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 8,
                  fontWeight: '800',
                  color: '#334155',
                  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                  marginTop: 4,
                }}
              >
                00
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* NATIVE PRINT & SAVE PDF ACTIONS */}
      {showPrintActions && (
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginTop: 4,
          }}
        >
          <TouchableOpacity
            onPress={handlePrintCard}
            disabled={isPrinting}
            activeOpacity={0.8}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0F4C81',
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 12,
              shadowColor: '#0F4C81',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
              gap: 8,
            }}
          >
            <Ionicons name="print-outline" size={18} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>
              {isPrinting ? 'Preparing Document...' : 'Print / Save PDF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSharePdf}
            disabled={isPrinting}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              borderWidth: 1.5,
              borderColor: isDarkMode ? '#334155' : '#0F4C81',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
              gap: 8,
            }}
          >
            <Ionicons name="share-social-outline" size={18} color={isDarkMode ? '#38BDF8' : '#0F4C81'} />
            <Text style={{ color: isDarkMode ? '#38BDF8' : '#0F4C81', fontSize: 13, fontWeight: '800' }}>
              Share PDF
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
