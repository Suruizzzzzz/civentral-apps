import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { styles } from '../styles/VerifyCitizenScreen.styles';

export interface LivenessSelfieStepProps {
  selfieImageUri: string | null;
  photo1x1Uri: string | null;
  onOpenPhotoPicker: (target: 'selfie' | 'photo1x1') => void;
  onRemovePhoto: (target: 'selfie' | 'photo1x1') => void;
  onBack: () => void;
  onNext: () => void;
  isDarkMode: boolean;
}

export function LivenessSelfieStep({
  selfieImageUri,
  photo1x1Uri,
  onOpenPhotoPicker,
  onRemovePhoto,
  onBack,
  onNext,
  isDarkMode,
}: LivenessSelfieStepProps) {
  const [activePrompt, setActivePrompt] = useState<'blink' | 'smile' | 'straight'>('straight');

  const dmCard = isDarkMode ? '#1C2541' : '#FFFFFF';
  const dmBorder = isDarkMode ? '#3A506B' : '#E2E8F0';
  const dmText = isDarkMode ? '#FFFFFF' : '#0F172A';

  return (
    <View style={[styles.card, { backgroundColor: dmCard, borderColor: dmBorder }]}>
      <Text style={[styles.cardTitle, { color: dmText }]}>
        Facial Biometrics & 1x1 Photo
      </Text>
      <Text style={{ fontSize: 13, color: isDarkMode ? '#94A3B8' : '#64748B', marginBottom: 16 }}>
        Verify applicant identity with a selfie liveness check and official identification photo.
      </Text>

      {/* 1. LIVENESS SELFIE WITH FACE ALIGNMENT OVAL GUIDE */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Facial Liveness Check *
        </Text>

        {selfieImageUri ? (
          <View style={[styles.photoPreviewCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#10B981' }]}>
            <Image source={{ uri: selfieImageUri }} style={styles.photoPreviewImage} resizeMode="cover" />
            <View style={[styles.photoPreviewFooter, isDarkMode && { backgroundColor: '#152238', borderTopColor: '#1C2541' }]}>
              <View style={styles.photoStatusBadge}>
                <IconSymbol name="checkmark.circle.fill" size={16} color="#10B981" />
                <Text style={styles.photoStatusText}>Face Biometrics Verified</Text>
              </View>
              <View style={styles.photoActionsRow}>
                <TouchableOpacity
                  style={[styles.photoActionBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                  onPress={() => onOpenPhotoPicker('selfie')}
                  activeOpacity={0.75}
                >
                  <Text style={styles.photoActionBtnText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoActionBtn, styles.photoRemoveBtn, isDarkMode && { backgroundColor: '#3F1515', borderColor: '#7F1D1D' }]}
                  onPress={() => onRemovePhoto('selfie')}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.photoActionBtnText, styles.photoRemoveBtnText]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={[
              localStyles.livenessGuideBox,
              isDarkMode && { backgroundColor: '#152238', borderColor: '#3A506B' },
            ]}
          >
            {/* Face Alignment Oval Overlay Graphic */}
            <View style={localStyles.ovalWrapper}>
              <View
                style={[
                  localStyles.ovalGuide,
                  isDarkMode && { borderColor: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.05)' },
                ]}
              >
                <IconSymbol
                  name="person.fill"
                  size={48}
                  color={isDarkMode ? '#38BDF8' : '#0284C7'}
                />
              </View>
              <View style={localStyles.ovalCrosshairH} />
              <View style={localStyles.ovalCrosshairV} />
            </View>

            {/* Liveness Prompts Selector */}
            <View style={localStyles.promptPill}>
              <IconSymbol
                name={activePrompt === 'blink' ? 'eye.fill' : activePrompt === 'smile' ? 'face.smiling.fill' : 'sparkles'}
                size={16}
                color="#0284C7"
              />
              <Text style={localStyles.promptPillText}>
                {activePrompt === 'blink'
                  ? 'Prompt: Blink both eyes naturally'
                  : activePrompt === 'smile'
                  ? 'Prompt: Smile gently at the camera'
                  : 'Position your face inside the oval'}
              </Text>
            </View>

            <View style={localStyles.promptButtonsRow}>
              <TouchableOpacity
                style={[
                  localStyles.promptTab,
                  activePrompt === 'straight' && localStyles.promptTabActive,
                  isDarkMode && { backgroundColor: activePrompt === 'straight' ? '#0369A1' : '#1C2541' },
                ]}
                onPress={() => setActivePrompt('straight')}
              >
                <Text style={[localStyles.promptTabText, activePrompt === 'straight' && localStyles.promptTabTextActive]}>
                  Look Straight
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  localStyles.promptTab,
                  activePrompt === 'blink' && localStyles.promptTabActive,
                  isDarkMode && { backgroundColor: activePrompt === 'blink' ? '#0369A1' : '#1C2541' },
                ]}
                onPress={() => setActivePrompt('blink')}
              >
                <Text style={[localStyles.promptTabText, activePrompt === 'blink' && localStyles.promptTabTextActive]}>
                  Blink Check
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  localStyles.promptTab,
                  activePrompt === 'smile' && localStyles.promptTabActive,
                  isDarkMode && { backgroundColor: activePrompt === 'smile' ? '#0369A1' : '#1C2541' },
                ]}
                onPress={() => setActivePrompt('smile')}
              >
                <Text style={[localStyles.promptTabText, activePrompt === 'smile' && localStyles.promptTabTextActive]}>
                  Smile Check
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[localStyles.guideHint, isDarkMode && { color: '#94A3B8' }]}>
              Ensure good ambient lighting, neutral expression, and remove eyeglasses, hats, or masks before capture.
            </Text>

            <TouchableOpacity
              style={localStyles.captureBtn}
              onPress={() => onOpenPhotoPicker('selfie')}
              activeOpacity={0.85}
            >
              <IconSymbol name="camera.fill" size={18} color="#FFFFFF" />
              <Text style={localStyles.captureBtnText}>Start Liveness Capture</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 2. 1x1 APPLICANT PHOTO */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          1x1 Official Applicant Photo *
        </Text>

        {photo1x1Uri ? (
          <View style={[styles.photoPreviewCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#10B981' }]}>
            <View style={styles.photo1x1Container}>
              <Image source={{ uri: photo1x1Uri }} style={styles.photo1x1Preview} resizeMode="cover" />
            </View>
            <View style={[styles.photoPreviewFooter, isDarkMode && { backgroundColor: '#152238', borderTopColor: '#1C2541' }]}>
              <View style={styles.photoStatusBadge}>
                <IconSymbol name="checkmark.circle.fill" size={16} color="#10B981" />
                <Text style={styles.photoStatusText}>1x1 Photo Attached</Text>
              </View>
              <View style={styles.photoActionsRow}>
                <TouchableOpacity
                  style={[styles.photoActionBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                  onPress={() => onOpenPhotoPicker('photo1x1')}
                  activeOpacity={0.75}
                >
                  <Text style={styles.photoActionBtnText}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoActionBtn, styles.photoRemoveBtn, isDarkMode && { backgroundColor: '#3F1515', borderColor: '#7F1D1D' }]}
                  onPress={() => onRemovePhoto('photo1x1')}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.photoActionBtnText, styles.photoRemoveBtnText]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.uploadBox,
              isDarkMode && { backgroundColor: '#152238', borderColor: dmBorder },
            ]}
            onPress={() => onOpenPhotoPicker('photo1x1')}
            activeOpacity={0.8}
          >
            <IconSymbol
              name="person.crop.square.fill"
              size={34}
              color={isDarkMode ? '#38BDF8' : '#0284C7'}
            />
            <Text style={[styles.uploadTitle, { color: dmText }]}>
              Upload or Capture 1x1 Photo
            </Text>
            <Text style={[styles.uploadSubtitle, isDarkMode && { color: '#94A3B8' }]}>
              Plain white background, no eyeglasses, formal or collared attire
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.secondaryButton, isDarkMode && { backgroundColor: '#152238', borderColor: dmBorder }]}
          onPress={onBack}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryButtonText, isDarkMode && { color: '#CBD5E1' }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onNext}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Next: Review</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  livenessGuideBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 8,
  },
  ovalWrapper: {
    width: 140,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 8,
  },
  ovalGuide: {
    width: 130,
    height: 170,
    borderRadius: 65,
    borderWidth: 2.5,
    borderColor: '#0284C7',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(2, 132, 199, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ovalCrosshairH: {
    position: 'absolute',
    width: 150,
    height: 1,
    backgroundColor: 'rgba(2, 132, 199, 0.3)',
  },
  ovalCrosshairV: {
    position: 'absolute',
    height: 190,
    width: 1,
    backgroundColor: 'rgba(2, 132, 199, 0.3)',
  },
  promptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 8,
    marginBottom: 10,
  },
  promptPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  promptButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  promptTab: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  promptTabActive: {
    backgroundColor: '#0284C7',
  },
  promptTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  promptTabTextActive: {
    color: '#FFFFFF',
  },
  guideHint: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  captureBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  captureBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
