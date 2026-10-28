import React, { useRef, useState } from 'react';
import {
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { IconSymbol } from '@/src/components/ui/icon-symbol';

export interface SignaturePadModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (signatureDataUri: string) => void;
  onUploadPhotoInstead?: () => void;
  isDarkMode: boolean;
}

export function SignaturePadModal({
  visible,
  onClose,
  onConfirm,
  onUploadPhotoInstead,
  isDarkMode,
}: SignaturePadModalProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const currentPathRef = useRef<string>('');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const startPoint = `M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
        currentPathRef.current = startPoint;
        setPaths((prev) => [...prev, startPoint]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        if (!currentPathRef.current) return;
        const newSegment = `${currentPathRef.current} L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
        currentPathRef.current = newSegment;
        setPaths((prev) => {
          const next = [...prev];
          next[next.length - 1] = newSegment;
          return next;
        });
      },
      onPanResponderRelease: () => {
        currentPathRef.current = '';
      },
    })
  ).current;

  const handleClear = () => {
    currentPathRef.current = '';
    setPaths([]);
  };

  const handleConfirm = () => {
    if (paths.length === 0) {
      return;
    }
    // Generate clean SVG Data URI representation of the digital signature
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 180" width="340" height="180">
      <rect width="100%" height="100%" fill="transparent"/>
      ${paths.map((p) => `<path d="${p}" stroke="#0F172A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`).join('')}
    </svg>`;
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
    onConfirm(dataUri);
    handleClear();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={localStyles.overlay}>
        <View style={[localStyles.card, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
          <View style={localStyles.header}>
            <View>
              <Text style={[localStyles.title, isDarkMode && { color: '#F8FAFC' }]}>
                Digital Applicant Signature
              </Text>
              <Text style={[localStyles.subtitle, isDarkMode && { color: '#94A3B8' }]}>
                Sign within the box below using your finger
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <IconSymbol name="xmark" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          {/* Touch Canvas */}
          <View
            style={[
              localStyles.canvasContainer,
              isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
            ]}
            {...panResponder.panHandlers}
          >
            <Svg style={StyleSheet.absoluteFill}>
              {paths.map((p, idx) => (
                <Path
                  key={idx}
                  d={p}
                  stroke={isDarkMode ? '#38BDF8' : '#0F172A'}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
            </Svg>

            {paths.length === 0 ? (
              <View style={localStyles.placeholderBox} pointerEvents="none">
                <IconSymbol name="signature" size={32} color={isDarkMode ? '#334155' : '#CBD5E1'} />
                <Text style={[localStyles.placeholderText, isDarkMode && { color: '#64748B' }]}>
                  Sign here with your finger
                </Text>
                <View style={[localStyles.baseline, isDarkMode && { borderColor: '#334155' }]} />
              </View>
            ) : null}
          </View>

          {/* Action Buttons: Clear, Reset, Confirm */}
          <View style={localStyles.buttonRow}>
            <TouchableOpacity
              style={[localStyles.btnSecondary, isDarkMode && { backgroundColor: '#152238', borderColor: '#334155' }]}
              onPress={handleClear}
              activeOpacity={0.8}
            >
              <IconSymbol name="trash" size={16} color={isDarkMode ? '#CBD5E1' : '#475569'} />
              <Text style={[localStyles.btnSecondaryText, isDarkMode && { color: '#CBD5E1' }]}>Clear</Text>
            </TouchableOpacity>

            {onUploadPhotoInstead ? (
              <TouchableOpacity
                style={[localStyles.btnSecondary, isDarkMode && { backgroundColor: '#152238', borderColor: '#334155' }]}
                onPress={() => {
                  onClose();
                  onUploadPhotoInstead();
                }}
                activeOpacity={0.8}
              >
                <IconSymbol name="photo.fill" size={16} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
                <Text style={[localStyles.btnSecondaryText, isDarkMode && { color: '#38BDF8' }]}>Upload Photo</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                localStyles.btnPrimary,
                paths.length === 0 && localStyles.btnDisabled,
              ]}
              onPress={handleConfirm}
              disabled={paths.length === 0}
              activeOpacity={0.85}
            >
              <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
              <Text style={localStyles.btnPrimaryText}>Confirm Signature</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  canvasContainer: {
    width: '100%',
    height: 190,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderBox: {
    alignItems: 'center',
    gap: 6,
  },
  placeholderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  baseline: {
    width: 220,
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  btnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  btnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 130,
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
