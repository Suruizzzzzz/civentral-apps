import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { ClarityResult } from '@/src/utils/imageCompression';

export interface OcrValidationState {
  status: 'idle' | 'checking' | 'validating' | 'validated' | 'MATCH' | 'MISMATCH' | 'INCONCLUSIVE' | 'error';
  result?: 'MATCH' | 'MISMATCH' | 'INCONCLUSIVE';
  detected_type?: string;
  detectedCode?: string | null;
  expectedCode?: string;
  confidence?: number;
  message?: string;
  clarity?: ClarityResult;
}

export interface OcrValidationBadgeProps {
  validation?: OcrValidationState | null;
  label?: string;
  expectedLabel?: string;
  hasFile?: boolean;
  isDarkMode?: boolean;
  onPickDocument?: () => void;
}

export function OcrValidationBadge({
  validation,
  label,
  expectedLabel,
  hasFile,
  isDarkMode = false,
  onPickDocument,
}: OcrValidationBadgeProps) {
  if (hasFile !== undefined && !hasFile) return null;
  if (!validation || validation.status === 'idle') return null;

  const targetLabel = label || expectedLabel;
  const isChecking = validation.status === 'checking' || validation.status === 'validating';
  const isMatch = validation.status === 'MATCH' || (validation.status === 'validated' && validation.result === 'MATCH');
  const isMismatch = validation.status === 'MISMATCH' || (validation.status === 'validated' && validation.result === 'MISMATCH');
  const isInconclusive =
    validation.status === 'INCONCLUSIVE' ||
    validation.status === 'error' ||
    (validation.status === 'validated' && validation.result === 'INCONCLUSIVE');

  if (isChecking) {
    return (
      <View
        style={[
          styles.container,
          styles.checkingBox,
          isDarkMode && { backgroundColor: '#0F243A', borderColor: '#0369A1' },
        ]}
      >
        <ActivityIndicator size="small" color={isDarkMode ? '#38BDF8' : '#0284C7'} />
        <Text style={[styles.checkingText, isDarkMode && { color: '#38BDF8' }]}>
          {validation.message || 'Verifying document type automatically...'}
        </Text>
      </View>
    );
  }

  if (isMatch) {
    const matchHeaderText =
      validation.message ||
      (targetLabel ? `Document verified as ${targetLabel}.` : '✓ Document type appears correct');
    const detectedText = validation.detectedCode || validation.detected_type;

    return (
      <View
        style={[
          styles.container,
          styles.matchBox,
          isDarkMode && { backgroundColor: '#052E16', borderColor: '#15803D' },
        ]}
      >
        <View style={styles.headerRow}>
          <IconSymbol
            name="checkmark.circle.fill"
            size={14}
            color={isDarkMode ? '#4ADE80' : '#16A34A'}
          />
          <Text style={[styles.matchHeader, isDarkMode && { color: '#86EFAC' }]}>
            {matchHeaderText}
          </Text>
        </View>
        {detectedText && !matchHeaderText.includes(detectedText) ? (
          <Text style={[styles.matchDetail, isDarkMode && { color: '#BBF7D0' }]}>
            Detected: {detectedText}
          </Text>
        ) : null}
      </View>
    );
  }

  if (isMismatch) {
    const mismatchDetailText = validation.message
      ? validation.message.includes('Please upload')
        ? validation.message
        : `${validation.message}${targetLabel ? ` Please upload the required ${targetLabel}.` : ''}`
      : targetLabel
      ? `Uploaded document does not appear to match ${targetLabel}. You can still submit, but manual review is required.`
      : 'This file does not appear to match the required document.';

    return (
      <View
        style={[
          styles.container,
          styles.mismatchBox,
          isDarkMode && { backgroundColor: '#451A03', borderColor: '#B45309' },
        ]}
      >
        <View style={styles.headerRow}>
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={14}
            color={isDarkMode ? '#FBBF24' : '#D97706'}
          />
          <Text style={[styles.mismatchHeader, isDarkMode && { color: '#FDE68A' }]}>
            Possible Document Mismatch
          </Text>
        </View>
        {validation.detectedCode ? (
          <Text style={[styles.mismatchDetail, isDarkMode && { color: '#FEF08A' }]}>
            Detected: {validation.detectedCode}
          </Text>
        ) : null}
        {targetLabel && validation.detectedCode ? (
          <Text style={[styles.mismatchDetail, isDarkMode && { color: '#FEF08A' }]}>
            Expected: {targetLabel}
          </Text>
        ) : null}
        <Text style={[styles.mismatchDetail, isDarkMode && { color: '#FEF08A' }]}>
          {mismatchDetailText}
        </Text>
        {onPickDocument ? (
          <TouchableOpacity
            style={[
              styles.changeFileBtn,
              isDarkMode && { backgroundColor: '#78350F', borderColor: '#B45309' },
            ]}
            onPress={onPickDocument}
            activeOpacity={0.8}
          >
            <IconSymbol name="pencil" size={12} color={isDarkMode ? '#FDE68A' : '#92400E'} />
            <Text style={[styles.changeFileBtnText, isDarkMode && { color: '#FDE68A' }]}>
              Change File
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  if (isInconclusive) {
    return (
      <View
        style={[
          styles.container,
          styles.inconclusiveBox,
          isDarkMode && { backgroundColor: '#1E293B', borderColor: '#475569' },
        ]}
      >
        <View style={styles.headerRow}>
          <IconSymbol
            name="info.circle.fill"
            size={14}
            color={isDarkMode ? '#94A3B8' : '#64748B'}
          />
          <Text style={[styles.inconclusiveHeader, isDarkMode && { color: '#CBD5E1' }]}>
            {validation.message?.includes('unavailable') || validation.message?.includes('network')
              ? 'Automatic verification is unavailable.'
              : 'Automatic document check is inconclusive.'}
          </Text>
        </View>
        <Text style={[styles.inconclusiveDetail, isDarkMode && { color: '#94A3B8' }]}>
          You can still continue and the document can be reviewed manually.
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  checkingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  checkingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0369A1',
  },
  matchBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    gap: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
    flexShrink: 1,
  },
  matchDetail: {
    fontSize: 11,
    color: '#166534',
    marginLeft: 20,
  },
  mismatchBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    gap: 3,
  },
  mismatchHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    flexShrink: 1,
  },
  mismatchDetail: {
    fontSize: 11,
    color: '#92400E',
    marginLeft: 20,
  },
  changeFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
    marginLeft: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  changeFileBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  inconclusiveBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    gap: 2,
  },
  inconclusiveHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    flexShrink: 1,
  },
  inconclusiveDetail: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 20,
  },
});
