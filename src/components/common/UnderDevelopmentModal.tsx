import React from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';

export interface UnderDevelopmentModalProps {
  visible: boolean;
  onClose: () => void;
  serviceName?: string;
}

export function UnderDevelopmentModal({
  visible,
  onClose,
  serviceName = 'This Service',
}: UnderDevelopmentModalProps) {
  const { isDarkMode } = useTheme();

  const dmBg = isDarkMode ? '#1C2541' : '#FFFFFF';
  const dmBorder = isDarkMode ? '#3A506B' : '#E2E8F0';
  const dmTitle = isDarkMode ? '#F8FAFC' : '#0F172A';
  const dmSub = isDarkMode ? '#94A3B8' : '#64748B';
  const btnBg = isDarkMode ? '#0284C7' : '#176B87';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: dmBg,
                  borderColor: dmBorder,
                },
              ]}
            >
              {/* Close "X" Button */}
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  isDarkMode && { backgroundColor: '#0B132B' },
                ]}
                onPress={onClose}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
              >
                <IconSymbol
                  name="xmark"
                  size={16}
                  color={isDarkMode ? '#94A3B8' : '#64748B'}
                />
              </TouchableOpacity>

              {/* Centered Maintenance Graphic */}
              <View style={styles.graphicContainer}>
                <Image
                  source={require('@/assets/images/maintenance.png')}
                  style={styles.maintenanceImage}
                  resizeMode="contain"
                />
              </View>

              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  isDarkMode && { backgroundColor: '#0F2942' },
                ]}
              >
                <IconSymbol
                  name="wrench.and.screwdriver.fill"
                  size={12}
                  color={isDarkMode ? '#38BDF8' : '#0284C7'}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    isDarkMode && { color: '#38BDF8' },
                  ]}
                >
                  FEATURE IN INTEGRATION
                </Text>
              </View>

              {/* Title & Description */}
              <Text style={[styles.modalTitle, { color: dmTitle }]}>
                {serviceName} is Under Development
              </Text>

              <Text style={[styles.modalDescription, { color: dmSub }]}>
                This digital municipal service is currently being integrated
                into Civentral. Online applications and processing for this
                service will be available soon.
              </Text>

              {/* Dismiss Action Button */}
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: btnBg }]}
                onPress={onClose}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Got it, back to services"
              >
                <Text style={styles.actionBtnText}>Got it, Back to Services</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  graphicContainer: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  maintenanceImage: {
    width: '100%',
    height: '100%',
    maxHeight: 180,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#0284C7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  modalDescription: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 22,
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
