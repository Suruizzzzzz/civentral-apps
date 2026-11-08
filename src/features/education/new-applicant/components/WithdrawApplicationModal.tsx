import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../styles/MyApplication.styles';

export interface WithdrawApplicationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmWithdraw: (applicationId: number | string, reason: string) => Promise<void> | void;
  applicationTitle?: string;
  applicationId?: number | string | null;
  isSubmitting?: boolean;
  isDarkMode?: boolean;
}

const WITHDRAWAL_REASONS = [
  'Applying to a different scholarship program',
  'Transferred school or course',
  'No longer eligible',
  'Personal reasons',
  'Other',
];

export function WithdrawApplicationModal({
  visible,
  onClose,
  onConfirmWithdraw,
  applicationTitle,
  applicationId,
  isSubmitting = false,
  isDarkMode = false,
}: WithdrawApplicationModalProps) {
  const [withdrawReason, setWithdrawReason] = useState(WITHDRAWAL_REASONS[0]);
  const [otherReasonText, setOtherReasonText] = useState('');

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleConfirm = () => {
    let finalReason = withdrawReason;
    if (withdrawReason === 'Other') {
      const trimmed = otherReasonText.trim();
      if (!trimmed) {
        Alert.alert('Reason Required', 'Please provide specific details for "Other" reason.');
        return;
      }
      finalReason = `Other: ${trimmed}`;
    }

    const targetId = applicationId ?? 0;
    onConfirmWithdraw(targetId, finalReason);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <View
          style={[
            styles.sectionCard,
            {
              width: '100%',
              maxWidth: 440,
              borderColor: '#F43F5E',
              borderWidth: 1,
            },
            isDarkMode && { backgroundColor: '#1E293B' },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: '#E11D48', marginBottom: 8 },
            ]}
          >
            Withdraw Application?
          </Text>

          {applicationTitle ? (
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: isDarkMode ? '#FCA5A5' : '#BE123C',
                marginBottom: 6,
              }}
              numberOfLines={1}
            >
              {applicationTitle}
            </Text>
          ) : null}

          <Text
            style={{
              fontSize: 13,
              color: isDarkMode ? '#CBD5E1' : '#475569',
              lineHeight: 18,
              marginBottom: 14,
            }}
          >
            Are you sure you want to withdraw this application? This action cannot be undone. Once withdrawn, you may apply for any eligible scholarship program.
          </Text>

          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: isDarkMode ? '#F8FAFC' : '#1E293B',
              marginBottom: 8,
            }}
          >
            Reason for Withdrawal:
          </Text>

          {WITHDRAWAL_REASONS.map((opt) => {
            const isSelected = withdrawReason === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 8,
                  marginBottom: 4,
                  backgroundColor: isSelected
                    ? isDarkMode
                      ? '#334155'
                      : '#FFE4E6'
                    : 'transparent',
                }}
                onPress={() => setWithdrawReason(opt)}
                disabled={isSubmitting}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: isSelected ? '#E11D48' : '#94A3B8',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}
                >
                  {isSelected && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#E11D48',
                      }}
                    />
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    color: isSelected
                      ? '#E11D48'
                      : isDarkMode
                      ? '#CBD5E1'
                      : '#334155',
                    fontWeight: isSelected ? '700' : '500',
                  }}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}

          {withdrawReason === 'Other' && (
            <View style={{ marginTop: 8, marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: isDarkMode ? '#94A3B8' : '#64748B',
                  marginBottom: 4,
                }}
              >
                Specify reason details:
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#475569' : '#CBD5E1',
                  backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                  color: isDarkMode ? '#F8FAFC' : '#0F172A',
                  borderRadius: 8,
                  padding: 8,
                  fontSize: 12,
                  minHeight: 60,
                  textAlignVertical: 'top',
                }}
                multiline
                numberOfLines={3}
                placeholder="Enter details..."
                placeholderTextColor="#94A3B8"
                value={otherReasonText}
                onChangeText={setOtherReasonText}
                editable={!isSubmitting}
              />
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: 10,
              marginTop: 14,
            }}
          >
            <TouchableOpacity
              style={{
                paddingVertical: 9,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: isDarkMode ? '#334155' : '#E2E8F0',
              }}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: isDarkMode ? '#CBD5E1' : '#475569',
                }}
              >
                Keep Application
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingVertical: 9,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: '#E11D48',
                opacity: isSubmitting ? 0.6 : 1,
              }}
              onPress={handleConfirm}
              disabled={isSubmitting}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>
                {isSubmitting ? 'Withdrawing...' : 'Confirm Withdrawal'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
