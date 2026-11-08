import React from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';

export interface DocumentActionFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  body?: string;
  feedbackData?: {
    title?: string;
    body?: string;
  };
  isDarkMode: boolean;
}

export function DocumentActionFeedbackModal({
  visible,
  onClose,
  title,
  body,
  feedbackData,
  isDarkMode,
}: DocumentActionFeedbackModalProps) {
  const displayTitle = feedbackData?.title || title || 'Document Notice';
  const displayBody = feedbackData?.body || body || '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: isDarkMode ? '#1C2541' : '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            width: '100%',
            maxWidth: 380,
            borderWidth: 1,
            borderColor: isDarkMode ? '#3A506B' : '#E2E8F0',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
            }}
          >
            <IconSymbol
              name="doc.text.fill"
              size={20}
              color={isDarkMode ? '#C084FC' : '#7E22CE'}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '800',
                color: isDarkMode ? '#F8FAFC' : '#0F172A',
                flex: 1,
              }}
            >
              {displayTitle}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 13,
              color: isDarkMode ? '#CBD5E1' : '#64748B',
              lineHeight: 19,
              marginBottom: 18,
            }}
          >
            {displayBody}
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: '#7E22CE',
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={onClose}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
