import React from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { styles } from '../styles/VerifyCitizenScreen.styles';

export type PhotoPickerTarget = 'id' | 'selfie' | 'photo1x1' | 'signature';

export interface PhotoSourcePickerModalProps {
  visible: boolean;
  onClose: () => void;
  target: PhotoPickerTarget;
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
  isDarkMode: boolean;
}

export function PhotoSourcePickerModal({
  visible,
  onClose,
  target,
  onTakePhoto,
  onPickFromGallery,
  isDarkMode,
}: PhotoSourcePickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.pickerModalOverlay}>
        <View style={[styles.pickerModalContent, isDarkMode && { backgroundColor: '#1C2541' }]}>
          <View style={styles.pickerModalHeader}>
            <Text style={[styles.pickerModalTitle, isDarkMode && { color: '#FFFFFF' }]}>
              {target === 'id'
                ? 'Attach Valid ID Photo'
                : target === 'selfie'
                ? 'Facial Liveness Selfie'
                : target === 'photo1x1'
                ? 'Official 1x1 ID Photo'
                : 'Digital Applicant Signature'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol name="xmark" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.pickerModalSubtitle, isDarkMode && { color: '#94A3B8' }]}>
            {target === 'id'
              ? 'Select how you want to upload your government-issued ID'
              : target === 'selfie'
              ? 'Take a clear selfie to match your registered face biometrics'
              : target === 'photo1x1'
              ? 'Capture or select a 1:1 square photo with plain white background'
              : 'Capture or select a photo of your handwritten signature on clean white paper'}
          </Text>

          <View style={styles.pickerOptionsList}>
            {/* Option 1: Take Photo with Camera */}
            <TouchableOpacity
              style={[
                styles.pickerOptionBtn,
                isDarkMode && { backgroundColor: '#152238', borderColor: '#3A506B' },
              ]}
              onPress={onTakePhoto}
              activeOpacity={0.8}
            >
              <View style={[styles.pickerOptionIconBox, isDarkMode && { backgroundColor: '#0369A1' }]}>
                <IconSymbol name="camera.fill" size={22} color={isDarkMode ? '#FFFFFF' : '#0284C7'} />
              </View>
              <View style={styles.pickerOptionTextCol}>
                <Text style={[styles.pickerOptionLabel, isDarkMode && { color: '#FFFFFF' }]}>
                  Take Photo with Camera
                </Text>
                <Text style={[styles.pickerOptionDesc, isDarkMode && { color: '#94A3B8' }]}>
                  Use your device camera to take a new picture
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={18} color={isDarkMode ? '#64748B' : '#94A3B8'} />
            </TouchableOpacity>

            {/* Option 2: Upload from Photo Gallery */}
            <TouchableOpacity
              style={[
                styles.pickerOptionBtn,
                isDarkMode && { backgroundColor: '#152238', borderColor: '#3A506B' },
              ]}
              onPress={onPickFromGallery}
              activeOpacity={0.8}
            >
              <View style={[styles.pickerOptionIconBox, isDarkMode && { backgroundColor: '#0369A1' }]}>
                <IconSymbol name="photo.fill" size={22} color={isDarkMode ? '#FFFFFF' : '#0284C7'} />
              </View>
              <View style={styles.pickerOptionTextCol}>
                <Text style={[styles.pickerOptionLabel, isDarkMode && { color: '#FFFFFF' }]}>
                  Choose from Photo Gallery
                </Text>
                <Text style={[styles.pickerOptionDesc, isDarkMode && { color: '#94A3B8' }]}>
                  Select an existing photo from your albums
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={18} color={isDarkMode ? '#64748B' : '#94A3B8'} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.pickerCancelBtn, isDarkMode && { backgroundColor: '#152238' }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={[styles.pickerCancelText, isDarkMode && { color: '#CBD5E1' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
